import * as Koa from 'koa';
import * as _ from 'lodash';
import { Logger } from 'log4js';
import * as moment from 'moment';
import { ErrCode } from './apiCodes';
import { GoodsClient } from '../externalService/goods';
import { User } from '../models/user';
import * as FinanceService from '../externalService/finance';
import { OrderStatus } from '../dataModel/goods';
import { decryptPurchaseToken, encryptPurchaseToken } from '../utils/encryptTool';
import { processError } from '../utils/error';
import * as PackageService from '../services/package';

const updateVoucherUsage = async (companyId: number, voucherCode: string, billId: number) => {
  await PackageService.createCompanyVoucherUsage(voucherCode, billId, companyId);
};

export const getGoodsInfo = async (ctx: Koa.Context) => {
  try {
    const goodsId = ctx.params.goodsId;
    const client = new GoodsClient(ctx.logger);
    const checkResult = await client.checkGoodsIdValid(goodsId);
    if (!checkResult) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_GOODS_ID };
    }
    const result = await client.getFullGoodsDetail(goodsId);
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_GOODS_INFO };
  }
};

const postGoodsOrderAndPay = async (log: Logger, companyId: number, goodsId: string, email: string, accountCurrency: 'USD' | 'CNY', payPrice: number, voucherCode?: string) => {
  const client = new GoodsClient(log);
  await client.checkAndCancelUnpaidOrder(companyId);
  // 月订单
  const postOrderData = await client.calPostOrderData(goodsId, email, accountCurrency);
  const orderInfo = await client.postOrder(companyId, postOrderData);
  if (voucherCode) {
    // 更新订单价格
    const remarks = JSON.stringify({ voucherCode: voucherCode });
    await client.putOrder(companyId, orderInfo.orderId, payPrice, remarks);
  }
  const payOrderInfo = await client.payOrder(companyId, orderInfo.orderId);
  if (voucherCode) {
    await updateVoucherUsage(companyId, voucherCode, payOrderInfo.transactionId);
  }
  return payOrderInfo;
};

const prepareVoucherCode = async (companyId: number, orderAmount: number, customUid: string, voucherCode: string, accountCurrency: 'USD' | 'CNY', company: any) => {
  if (!voucherCode) {
    return orderAmount;
  }
  const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.AA, customUid, companyId, accountCurrency, company);
  if (!voucherCheck.allow) {
    throw new Error('VOUCHER_INVALID_ERROR');
  }
  const voucherAmount = await PackageService.getVoucherAmount(voucherCode);
  return orderAmount - Number(voucherAmount);
};

export const postGoodsOrderByBalance = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const { goodsId, voucherCode } = ctx.request.body;
    const client = new GoodsClient(ctx.logger);
    const checkResult = await client.checkGoodsIdValid(goodsId);
    if (!checkResult) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_GOODS_ID };
    }
    const cashInfo = await FinanceService.getCashInfo(ctx.logger, companyId);
    const orderAmount = await client.getNeedPayGoodsPrice(goodsId, cashInfo.accountCurrency);
    const goodsInfo = await client.getGoodsInfo(goodsId);
    const payPrice = await prepareVoucherCode(companyId, orderAmount, goodsInfo.customUid, voucherCode, cashInfo.accountCurrency, user.company);
    const isOk = Number(cashInfo.accountBalance) >= payPrice;
    if (!isOk) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
      return;
    }
    // 月订单
    await postGoodsOrderAndPay(ctx.logger, companyId, goodsId, user.email, cashInfo.accountCurrency, payPrice, voucherCode);
    // 订阅订单
    const postSubscriptionData = await client.calPostSubscriptionData(goodsId, user.email, cashInfo.accountCurrency);
    const uid = await client.postSubscription(companyId, postSubscriptionData);
    await client.paySubscription(companyId, uid);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_TO_POST_ORDER };
  }
};

export const postGoodsOrderByAliPay = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const { goodsId, voucherCode } = ctx.request.body;
  try {
    const client = new GoodsClient(ctx.logger);
    const checkResult = await client.checkGoodsIdValid(goodsId);
    if (!checkResult) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_GOODS_ID };
    }
    const cashInfo = await FinanceService.getCashInfo(ctx.logger, companyId);
    const orderAmount = await client.getNeedPayGoodsPrice(goodsId, cashInfo.accountCurrency);
    const goodsInfo = await client.getGoodsInfo(goodsId);
    const payPrice = await prepareVoucherCode(companyId, orderAmount, goodsInfo.customUid, voucherCode, cashInfo.accountCurrency, user.company);
    await client.checkAndCancelUnpaidOrder(companyId);
    const postOrderData = await client.calPostOrderData(goodsId, user.email, cashInfo.accountCurrency);
    const orderInfo = await client.postOrder(companyId, postOrderData);
    if (voucherCode) {
      // 更新订单价格
      const remarks = JSON.stringify({ voucherCode: voucherCode });
      await client.putOrder(companyId, orderInfo.orderId, payPrice, remarks);
    }
    const token = encryptPurchaseToken(orderInfo.transactionId);
    ctx.body = token;
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_TO_POST_ORDER };
  }
};

export const getCompanyOrder = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const { page, limit } = ctx.query;
    const offset = (page - 1) * limit;
    const result = await new GoodsClient(ctx.logger).getCompanySubscription(companyId, offset, limit);
    for (const item of result.items) {
      const goodsI18n = await new GoodsClient(ctx.logger).getGoodsI18n(item.goodsId);
      item['goodsI18n'] = goodsI18n;
    }
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_GOODS_INFO };
  }
};

export const cancelSubscription = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const uid = ctx.params.uid;
    await new GoodsClient(ctx.logger).cacelSubscription(companyId, uid);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_CANCEL_SUBSCRIPTION };
  }
};

export const OrderRecharge = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const token = ctx.query.token;
  try {
    const transactionId = decryptPurchaseToken(token);
    const client = new GoodsClient(ctx.logger);
    const orderInfo = await client.getOrderInfoByTransactionId(companyId, transactionId);
    if (!orderInfo) {
      ctx.status = 400;
      ctx.body = { message: 'No pending transactions' };
      return;
    }
    const callbackUrl = `${ctx.request.origin}/packages/aa/pay?step=2&token=${token}`;
    const payPrice = orderInfo.payPrice;
    const data: any = await FinanceService.recharge(
      ctx.logger,
      user.companyId,
      payPrice,
      callbackUrl,
      transactionId
    );
    ctx.set('Content-Type', 'text/html');
    ctx.body = data;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.redirect(`${ctx.request.origin}/packages/aa/pay?step=3&error=true&token=${token}`);
  }
  ctx.status = 200;
};

export const payAlipayOrderByToken = async (ctx: Koa.Context) => {
  const { token } = ctx.request.body;
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const transactionId = decryptPurchaseToken(token);
  let voucherCode = undefined;
  const client = new GoodsClient(ctx.logger);
  try {
    const orderInfo = await client.getOrderInfoByTransactionId(companyId, transactionId);
    const orderId = orderInfo.orderId;
    if (orderInfo.orderStatus !== OrderStatus.Pending) {
      ctx.status = 400;
      ctx.body = { message: 'Invalid order' };
      return;
    }
    const payResult = await client.payOrder(companyId, orderId);
    // 判断是否用了抵扣码
    if (orderInfo.remarks) {
      try {
        const remarks = JSON.parse(orderInfo.remarks);
        voucherCode = remarks.voucherCode;
      } catch (e) {
      }
    }
    if (voucherCode) {
      await updateVoucherUsage(companyId, voucherCode, payResult.transactionId);
    }
    const goodsId = payResult.goodsId;
    const cashInfo = await FinanceService.getCashInfo(ctx.logger, companyId);
    const postOrderData = await client.calPostSubscriptionData(goodsId, user.email, cashInfo.accountCurrency);
    const uid = await client.postSubscription(companyId, postOrderData);
    await client.paySubscription(companyId, uid);
    const goodsInfo = await client.getFullGoodsDetail(goodsId);
    ctx.status = 200;
    ctx.body = goodsInfo;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_TO_POST_ORDER };
  }
};

const checkMoney = async (balance: number, amount: number, money: number) => {
  if (money + balance < amount) {
    return false;
  }
  return true;
};

export const postGoodsOrderByCard = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const { goodsId, cardId, voucherCode, isUsedBalance } = ctx.request.body;
    const client = new GoodsClient(ctx.logger);
    const checkResult = await client.checkGoodsIdValid(goodsId);
    if (!checkResult) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_GOODS_ID };
    }
    const cashInfo = await FinanceService.getCashInfo(ctx.logger, companyId);
    const orderAmount = await client.getNeedPayGoodsPrice(goodsId, cashInfo.accountCurrency);
    const goodsInfo = await client.getGoodsInfo(goodsId);
    const payPrice = await prepareVoucherCode(companyId, orderAmount, goodsInfo.customUid, voucherCode, cashInfo.accountCurrency, user.company);
    const amountWithBalance = isUsedBalance ? await FinanceService.getPayAmountWithBalance(Number(payPrice), cashInfo.accountBalance) : payPrice; // 信用卡支付金额
    const isOk = await checkMoney(Number(cashInfo.accountBalance), Number(payPrice), Number(amountWithBalance));
    if (!isOk) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
      return;
    }
    // 月订单
    const orderInfo = await postGoodsOrderAndPay(ctx.logger, companyId, goodsId, user.email, cashInfo.accountCurrency, payPrice, voucherCode);
    await FinanceService.cardCharge(
      ctx.logger,
      companyId,
      String(amountWithBalance),
      cardId,
      orderInfo.transactionId
    );
    const postSubscriptionData = await client.calPostSubscriptionData(goodsId, user.email, cashInfo.accountCurrency);
    const uid = await client.postSubscription(companyId, postSubscriptionData);
    await client.paySubscription(companyId, uid);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_TO_POST_ORDER };
  }
};

export const checkCurrentMonthOrder = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const result = await new GoodsClient(ctx.logger).checkCurrentMonthOrder(companyId);
  ctx.status = 200;
  ctx.body = result;
};

export const doSubscription = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const { goodsId } = ctx.request.body;
  const cashInfo = await FinanceService.getCashInfo(ctx.logger, companyId);
  const client = new GoodsClient(ctx.logger);
  const checkResult = await client.checkGoodsIdValid(goodsId);
  if (!checkResult) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.INVALID_GOODS_ID };
  }
  try {
    await client.checkAndCancelSubscription(companyId);
    // 订阅订单
    const postSubscriptionData = await client.calPostSubscriptionData(goodsId, user.email, cashInfo.accountCurrency);
    const uid = await client.postSubscription(companyId, postSubscriptionData);
    await client.paySubscription(companyId, uid);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_TO_POST_ORDER };
  }
};

export const getCompanyActiveOrder = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const allOrders = await new GoodsClient(ctx.logger).getCompanyAllOrders(companyId);
    const activeOrders = (allOrders.items || []).filter((item) => {
      return item.isActive === 1 && moment().isBefore(moment(item.endTime));
    });
    ctx.body = activeOrders.map(item => {
      return {
        goodsId: item.goodsId,
        startTime: item.startTime,
        endTime: item.endTime,
        customUid: item.customUid,
        isActive: item.isActive,
        orderStatus: item.orderStatus,
        mutexTag: item.mutexTag
      };
    });
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.GET_GOODS_ERROR };
  }
};

export const getCompanyActiveSubscription = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const allSubscriptions = await new GoodsClient(ctx.logger).getCompanyAllSubscription(companyId);
    const activeSubscription = (allSubscriptions.items || []).filter((item) => {
      return item.subscriptionStatus === 'Active' && moment().isBefore(moment(item.expireTime));
    });
    ctx.body = activeSubscription.map(item => {
      return {
        goodsId: item.goodsId,
        startTime: item.startTime,
        endTime: item.endTime,
        customUid: item.customUid,
        subscriptionStatus: item.subscriptionStatus
      };
    });
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.GET_GOODS_ERROR };
  }
};

export const checkOrderStatusByTransationId = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const transactionId = decryptPurchaseToken(ctx.query.transactionId);
  const res = await new GoodsClient(ctx.logger).getOrderInfoByTransactionId(companyId, transactionId);
  ctx.status = 200;
  ctx.body = res;
};

export const postFreeOrderAndPay = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const { goodsId } = ctx.request.body;
    const client = new GoodsClient(ctx.logger);
    const checkResult = await client.checkGoodsIdValid(goodsId);
    if (!checkResult) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_GOODS_ID };
    }
    const cashInfo = await FinanceService.getCashInfo(ctx.logger, companyId);
    const payPrice = await client.getNeedPayGoodsPrice(goodsId, cashInfo.accountCurrency);
    if (payPrice !== 0) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_FREE_GOODS_ID };
      return;
    }
    // 月订单
    await postGoodsOrderAndPay(ctx.logger, companyId, goodsId, user.email, cashInfo.accountCurrency, payPrice);
    // 订阅订单
    const postSubscriptionData = await client.calPostSubscriptionData(goodsId, user.email, cashInfo.accountCurrency);
    const uid = await client.postSubscription(companyId, postSubscriptionData);
    await client.paySubscription(companyId, uid);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_TO_POST_ORDER };
  }
};

export const getGoodsByMutexTag = async (ctx: Koa.Context) => {
  const { mutexTag } = ctx.params;
  const tagList = ['FPA', 'AA_AGORA_CHAT_DATA_INSIGHT', 'CDN'];
  if (!tagList.includes(mutexTag.toUpperCase())) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.GET_GOODS_PARAMS_ERROR };
    return;
  }
  const result = await new GoodsClient(ctx.logger).getGoodsByMutexTag(mutexTag.toUpperCase());
  ctx.status = 200;
  ctx.body = result;
};

export const getFPAGoodsInfo = async (ctx: Koa.Context) => {
  const result = await new GoodsClient(ctx.logger).getGoodsByMutexTag('FPA');
  ctx.status = 200;
  ctx.body = result;
};

export const getChatGoodsInfo = async (ctx: Koa.Context) => {
  const result = await new GoodsClient(ctx.logger).getGoodsByMutexTag('AA_AGORA_CHAT_DATA_INSIGHT');
  ctx.status = 200;
  ctx.body = result;
};
