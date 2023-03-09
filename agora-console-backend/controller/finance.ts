import * as Koa from 'koa';
import { Logger } from 'log4js';
import * as moment from 'moment';
import { User } from '../models/user';
import * as Client from '../utils/gw-request';
import { config } from '../config';

import * as AccountService from '../services/account';
import * as PackageManagementService from '../services/packageManagement';
import * as FinanceService from '../externalService/finance';
import * as MarketingService from '../externalService/marketing';
import * as ReceiptService from '../services/receipt';
import * as PackageService from '../services/package';
import { ErrCode } from './apiCodes';

import { processError } from '../utils/error';
import { ListParams } from '../models/listReply';
import { formatMoney } from '../utils/money';
import {
  archerProxyForSession
} from '../externalService/archerService';
import { decryptPurchaseToken, encryptPurchaseToken } from '../utils/encryptTool';
import { TRANSACTION_TYPE, TRANSACTION_STATUS } from '../models/paymentTransactions';
import { exceedMaxQuantity } from './packageManagement';
import { GoodsClient } from '../externalService/goods';
import { getManager } from 'typeorm';
import { SupportPackage } from '../models/supportPackage';

const datasToCSV = datas => {
  let str = '';
  for (const item of datas) {
    str += `"${item.join('","')}"`;
    str += '\r\n';
  }
  return str;
};

const translations = {
  en: {
    Transactions: 'Transactions',
    Date: 'Date',
    TransactionID: 'Transaction ID',
    TransactionType: 'Transaction Type',
    Amount: 'Amount',
    Balance: 'Balance',
    IssueDate: 'Issue Date',
    BillingPeriod: 'Billing Period',
    DueDate: 'Due Date',
    BillingStatus: 'Status',
    Payed: 'Paid',
    UnPayed: 'Unpaid'
  },
  cn: {
    Transactions: '交易信息',
    Date: '日期',
    TransactionID: '交易号',
    TransactionType: '交易类型',
    Amount: '金额',
    Balance: '余额',
    IssueDate: '发布时间',
    BillingPeriod: '账期',
    DueDate: '截止日期',
    BillingStatus: '支付状态',
    Payed: '已支付',
    UnPayed: '未支付'
  }
};

const TransType = {
  0: { cn: '余额初始化', en: 'balance initiate' },
  1: { cn: '账单消费', en: 'billing deduction' },
  2: { cn: '银行转账', en: 'bank transfer' },
  3: { cn: '线下充值撤销', en: 'deposit reverse' },
  4: { cn: '支付宝支付', en: 'alipay payment' },
  5: { cn: '信用卡支付', en: 'stripe payment' },
  6: { cn: '支付宝提现', en: 'alipay withdraw' },
  7: { cn: '信用卡提现', en: 'stripe withdraw' },
  8: { cn: '单次账单消费', en: 'one-time bill' }
};

const getLangValue = (lang, key) => {
  if (!translations[lang]) return key;
  if (!translations[lang][key]) return key;
  return translations[lang][key];
};

const getTransType = (lang: string, key: number) => {
  return TransType[key] ? TransType[key][lang] : key;
};

export const getCashInfo = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  try {
    const companyInfo = await AccountService.getCompanyInfo(user.companyId);
    const ret = await FinanceService.getCashInfo(ctx.logger, user.companyId);
    ret.financialStatus = companyInfo.status;
    /**
     * @deprecated lifeCycle 为暂时兼容，建议使用 financialStatus 替代
     * @description 计费端保存的财务状态 (lifeCycle 字段) 将被废弃，直接从数据库 company.status 获取即可
     */
    ret.lifeCycle = companyInfo.status;
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 400;
    ctx.body = { code: ErrCode.CASH_INFO_ERROR };
  }
};

export const getLifeCycle = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  try {
    const companyInfo = await AccountService.getCompanyInfo(user.companyId);
    ctx.body = {
      /**
       * @deprecated lifeCycle 为暂时兼容，建议使用 financialStatus 替代
       * @description 计费端保存的财务状态 (lifeCycle 字段) 将被废弃，直接从数据库 company.status 获取即可
       */
      lifeCycle: companyInfo.status,
      financialStatus: companyInfo.status
    };
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 400;
    ctx.body = { code: ErrCode.CASH_INFO_ERROR };
  }
};

export const getLifeCycleConfig = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  try {
    const ret = await archerProxyForSession(ctx.logger).getCompanySuspendSetting(user.companyId);
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 400;
    ctx.body = { code: ErrCode.CASH_INFO_ERROR };
  }
};

export const accountRecharge = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const money = parseFloat(ctx.query.money) || 0;
  let callbackUrl = `${ctx.request.origin}/finance/deposit/alipay/callback`;
  if (money < 1) {
    ctx.redirect(`${callbackUrl}?error=4302&total_amount=${money}`);
    return;
  }
  const transactionId = await FinanceService.initialPendingFinanceTransaction(user.companyId, user.id, ctx.query.money, TRANSACTION_TYPE.DEPOSIT_ALIPAY);
  const token = encryptPurchaseToken(transactionId);
  callbackUrl = `${callbackUrl}?token=${token}`;
  try {
    const data: any = await FinanceService.recharge(
      ctx.logger,
      user.companyId,
      money,
      callbackUrl,
      transactionId
    );
    ctx.set('Content-Type', 'text/html');
    ctx.body = data;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.redirect(`${callbackUrl}&error=4303&total_amount=${money}`);
    return;
  }
  ctx.status = 200;
};

export const packageRecharge = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const transactionId = decryptPurchaseToken(ctx.query.token);
  const token = ctx.query.token;
  const packageManagements = await PackageManagementService.getUnpaidPackageManagementByTransactionId(user.company.id, transactionId);
  let amount = 0;
  for (const packageManagement of packageManagements) {
    amount = amount + Number(packageManagement.amount);
  }
  const callbackUrl = `${ctx.request.origin}/packages/minPackage/pay?step=2&token=${token}`;
  if (!transactionId || packageManagements.length === 0 || amount <= 0) {
    ctx.redirect(`${ctx.request.origin}/packages/minPackage/pay?step=3&error=true&token=${token}`);
    return;
  }

  try {
    await FinanceService.createPaymentTransactions(user.company.id, user.id, transactionId, amount.toString(), TRANSACTION_TYPE.MIN_ALIPAY);

    const data: any = await FinanceService.recharge(
      ctx.logger,
      user.companyId,
      amount,
      callbackUrl,
      transactionId
    );
    ctx.set('Content-Type', 'text/html');
    ctx.body = data;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.redirect(`${ctx.request.origin}/packages/minPackage/pay?step=3&error=true&token=${token}`);
    return;
  }
  ctx.status = 200;
};

export const marketplacePackageRecharge = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const transactionId = decryptPurchaseToken(ctx.query.token);
  const token = ctx.query.token;
  const packageManagements = await PackageManagementService.getUnpaidPackageManagementByTransactionId(user.company.id, transactionId);
  let amount = 0;
  for (const packageManagement of packageManagements) {
    amount = amount + Number(packageManagement.amount);
  }
  const callbackUrl = `${ctx.request.origin}/marketplace/pay?step=2&token=${token}`;
  if (!transactionId || packageManagements.length === 0 || amount <= 0) {
    ctx.redirect(`${ctx.request.origin}/marketplace/pay?step=3&error=true&token=${token}`);
    return;
  }

  try {
    await FinanceService.createPaymentTransactions(user.company.id, user.id, transactionId, amount.toString(), TRANSACTION_TYPE.MARKETPLACE_ALIPAY);

    const data: any = await FinanceService.recharge(
      ctx.logger,
      user.companyId,
      amount,
      callbackUrl,
      transactionId
    );
    ctx.set('Content-Type', 'text/html');
    ctx.body = data;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.redirect(`${ctx.request.origin}/marketplace/pay?step=3&error=true&token=${token}`);
    return;
  }
  ctx.status = 200;
};

export const getTransactions = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const { limit, page, type, startDate, endDate, types } = ctx.query;
  const params = new ListParams(limit, page, {
    transType: type,
    transTypes: types,
    startDate,
    endDate
  });
  try {
    const ret = await FinanceService.getTransactionsByCompany(
      ctx.logger,
      user.companyId,
      params
    );
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

export const exportTransactions = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const { type } = ctx.query;
  let { startDate, endDate } = ctx.query;
  if (!startDate) {
    startDate = moment()
      .add(-1, 'y')
      .format('YYYY-MM-DD');
  }
  if (!endDate) {
    endDate = moment().format('YYYY-MM-DD');
  }
  const params = new ListParams(1000, 1, {
    transType: type,
    startDate,
    endDate
  });
  const filename = `Transactions ${startDate}-${endDate}.csv`;
  try {
    const ret = await FinanceService.getTransactionsByCompany(
      ctx.logger,
      user.companyId,
      params
    );
    const datas = [
      [
        getLangValue(user.locale, 'Date'),
        getLangValue(user.locale, 'TransactionID'),
        getLangValue(user.locale, 'TransactionType'),
        getLangValue(user.locale, 'Amount'),
        getLangValue(user.locale, 'Balance')
      ]
    ];

    for (const item of ret.items) {
      datas.push([
        item.createdTime,
        item.externalTransId,
        getTransType(user.locale, item.transType),
        formatMoney(item.amount, item.accountCurrency),
        formatMoney(item.accountBalance, item.accountCurrency)
      ]);
    }
    ctx.set('content-type', 'application/octet-stream');
    ctx.set('Content-disposition', `attachment; filename=${filename}`);
    ctx.body = `\ufeff${datasToCSV(datas)}`;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

export const getBillings = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const { limit, page, startDate, endDate } = ctx.query;
  const params = new ListParams(limit, page, { startDate, endDate });
  try {
    const ret = await FinanceService.getBillingList(
      ctx.logger,
      user.companyId,
      params
    );
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

export const exportBillings = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  let { startDate, endDate } = ctx.query;
  if (!startDate) {
    startDate = moment()
      .add(-1, 'y')
      .format('YYYY-MM-DD');
  }
  if (!endDate) {
    endDate = moment().format('YYYY-MM-DD');
  }
  const params = new ListParams(1000, 1, { startDate, endDate });
  const filename = `Billings ${startDate}-${endDate}.csv`;
  try {
    const ret = await FinanceService.getBillingList(
      ctx.logger,
      user.companyId,
      params
    );
    const datas = [
      [
        getLangValue(user.locale, 'IssueDate'),
        getLangValue(user.locale, 'BillingPeriod'),
        getLangValue(user.locale, 'DueDate'),
        getLangValue(user.locale, 'Amount'),
        getLangValue(user.locale, 'BillingStatus')
      ]
    ];
    for (const item of ret.items) {
      datas.push([
        item.invoiceDate,
        item.billPeriod,
        item.dueDate,
        formatMoney(item.totalAmount, item.currency),
        item.deducted
          ? getLangValue(user.locale, 'Payed')
          : getLangValue(user.locale, 'UnPayed')
      ]);
    }
    ctx.set('content-type', 'application/octet-stream');
    ctx.set('Content-disposition', `attachment; filename=${filename}`);
    ctx.body = `\ufeff${datasToCSV(datas)}`;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

export const downloadBilling = async function(ctx: Koa.Context) {
  const { billId } = ctx.params;
  const user: User = ctx.state.user;
  const client = Client.gw_create(ctx.logger);
  const res = await client({
    method: 'get',
    responseType: 'stream',
    url: `${config.backendBaseUrl}/bss-bill/download/companies/${user.companyId}/bills/${billId}`
  });
  ctx.body = res.data;
  ctx.set('content-type', res.headers['content-type']);
  ctx.set('content-disposition', res.headers['content-disposition']);
};

export const downloadOnceBills = async function(ctx: Koa.Context) {
  const { billId } = ctx.params;
  const client = Client.gw_create(ctx.logger);
  const res = await client({
    method: 'get',
    responseType: 'stream',
    url: `${config.backendBaseUrl}/bss-bill/v2/download/once-bills/${billId}`
  });
  ctx.body = res.data;
  ctx.set('content-type', res.headers['content-type']);
  ctx.set('content-disposition', res.headers['content-disposition']);
};

export const getOnceBills = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const { limit, page, startDate, endDate } = ctx.query;
  const params = new ListParams(limit, page, { startDate, endDate });
  try {
    const ret = await FinanceService.getOnceBillList(
      ctx.logger,
      user.companyId,
      params
    );
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

export const getExtensionOnceBills = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const { limit, page, startDate, endDate, period } = ctx.query;
  const params = new ListParams(limit, page, { startDate, endDate });
  try {
    const ret = await FinanceService.getExtensionOnceBillList(
      ctx.logger,
      user.companyId,
      params,
      period
    );
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

// http://125.88.159.217:18300/bss-bill/download/companies/{companyId}/bills/{billId}/reconciliation
export const downloadBillingReconciliation = async function(ctx: Koa.Context) {
  const { billId } = ctx.params;
  const user: User = ctx.state.user;
  const client = Client.gw_create(ctx.logger);
  const res = await client({
    method: 'get',
    responseType: 'stream',
    url: `${config.backendBaseUrl}/bss-bill/download/companies/${user.companyId}/bills/${billId}/reconciliation`
  });
  ctx.body = res.data;
  ctx.set('content-type', res.headers['content-type']);
  ctx.set('content-disposition', res.headers['content-disposition']);
};

export const getCardList = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const ret = await FinanceService.getCardList(ctx.logger, companyId);
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const setCardDefault = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const { cardId } = ctx.params;
    const ret = await FinanceService.setCardDefault(
      ctx.logger,
      companyId,
      cardId
    );
    MarketingService.updateCreditCard(companyId).catch(err =>
      console.error(err)
    );
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const getBillingForReceipt = async function(ctx: Koa.Context) {
  const user: User = ctx.state.user;
  const {
    limit,
    page,
    startDate,
    endDate,
    invoiced,
    deductionStatus
  } = ctx.query;
  const companyId = user.companyId;
  const currency = "'CNY'";
  let invoiceStatus = invoiced;
  if (invoiced === '0') {
    // 未申请+已拒绝
    invoiceStatus = '0,2';
  }
  const params = new ListParams(limit, page, { startDate, endDate, invoiced: invoiceStatus, companyId, deductionStatus, currency });
  try {
    const ret = await FinanceService.getBillingListByFilter(ctx.logger, params);
    if (invoiced === '1' && ret.total > 0) {
      for (const bill of ret.items) {
        const receiptBill = await ReceiptService.getReceiptIdByBill(bill.id);
        if (receiptBill) {
          const receiptInfo = await ReceiptService.getReceiptInfo(
            receiptBill.receiptId,
            companyId
          );
          if (receiptInfo) {
            bill.appliedTime = receiptInfo.appliedTime;
            bill.receiptId = receiptBill.receiptId;
            bill.receiptStatus = receiptInfo.status;
          }
        }
      }
    }
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const addCard = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const { cardToken, defaultCard } = ctx.request.body;
    const ret = await FinanceService.addCard(
      ctx.logger,
      companyId,
      cardToken,
      defaultCard
    );
    MarketingService.updateCreditCard(companyId).catch(err =>
      console.error(err)
    );
    await archerProxyForSession(ctx.logger).notifyArcherOnCreditCardBinded(companyId).catch((err) => {
      console.error(err);
    });
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const cardCharge = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const { amount, cardId } = ctx.request.body;

  const transactionId = await FinanceService.initialPendingFinanceTransaction(user.companyId, user.id, amount, TRANSACTION_TYPE.DEPOSIT_STRIPE);

  try {
    const ret = await FinanceService.cardCharge(
      ctx.logger,
      user.companyId,
      amount,
      cardId,
      transactionId
    );
    await FinanceService.updatePendingFinanceTransaction(user.companyId, transactionId, TRANSACTION_STATUS.SUCCESS);
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    await FinanceService.updatePendingFinanceTransaction(user.companyId, transactionId, TRANSACTION_STATUS.SUCCESS);
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const deleteCard = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const { cardId } = ctx.params;
    const ret = await FinanceService.deleteCard(ctx.logger, companyId, cardId);
    MarketingService.updateCreditCard(companyId).catch(err =>
      console.error(err)
    );
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.TRANSACTION_ERROR };
  }
};

export const getCompanyRefunds = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const { limit, page } = ctx.query;
    const params = new ListParams(limit, page);
    const ret = await FinanceService.getCompanyRefunds(
      ctx.logger,
      companyId,
      params
    );
    ctx.body = ret;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.REFOUND_ERROR };
  }
};

export const postRefunds = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const userId = ctx.session.userId || '';
    const email = ctx.state.user.email;

    const { amount } = ctx.request.body;
    const ret = await FinanceService.postRefunds(
      ctx.logger,
      companyId,
      amount,
      email,
      userId
    );
    await archerProxyForSession(ctx.logger).notifyArcherOnCompanyWithdrawalSubmitted(companyId).catch((err) => {
      ctx.logger.error(processError(err));
    });
    ctx.body = ret;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.status === 400 && e.response.data) {
      ctx.status = e.response.status;
      ctx.body = { code: e.response.data.errorCode };
    } else {
      ctx.status = 400;
      ctx.body = { code: ErrCode.REFOUND_ERROR };
    }
  }
};

export const getRefundsPreview = async (ctx: Koa.Context) => {
  try {
    const companyId: number = ctx.state.user.companyId;
    const userId = ctx.session.userId || '';
    const email = ctx.state.user.email;
    const { amount } = ctx.request.body;
    const ret = await FinanceService.refundsPreview(
      ctx.logger,
      companyId,
      amount,
      email,
      userId
    );
    ctx.body = ret;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.status === 400 && e.response.data) {
      ctx.status = e.response.status;
      ctx.body = { code: e.response.data.errorCode };
    } else {
      ctx.status = 400;
      ctx.body = { code: ErrCode.REFOUND_ERROR };
    }
  }
};

export const createOnceBill = async (logger: Logger, user: User, packageId: number, amount: number, isRenew: boolean, currency: string, packageManagement: any) => {
  const res = await FinanceService.createOnceBill(logger, user, packageId, amount, isRenew, currency, packageManagement);
  return res;
};

export const createPackageOnceBill = async (logger: Logger, user: User, amount: number, currency: string, packages = [], transactionId: string) => {
  const res = await FinanceService.createPackageOnceBill(logger, user, amount, currency, packages, transactionId);
  return res;
};

export const createMarketplacePackageOnceBill = async (logger: Logger, user: User, amount: number, currency: string, packages = [], transactionId: string) => {
  const res = await FinanceService.createMarketplacePackageOnceBill(logger, user, amount, currency, packages, transactionId);
  return res;
};

const checkMoney = async (balance: number, amount: number, money: number) => {
  if (money + balance < amount) {
    return false;
  }
  return true;
};

export const balancePayThenCreateOnceBill = async (ctx: Koa.Context) => {
  const { packageId, isRenew } = ctx.request.body;
  const user: User = ctx.state.user;
  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  const amount = await FinanceService.getRealPayAmount(packageId, isRenew, cashInfo.accountCurrency, user.company.id);
  const isOk = await checkMoney(Number(cashInfo.accountBalance), Number(amount), 0);
  if (!isOk) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
    return;
  }
  const packageValid = await FinanceService.checkSupportPackgeValid(packageId);
  if (!packageValid) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.Without_Permission };
    return;
  }
  const packageManagement: any = await FinanceService.createPackageManagement({
    companyId: user.company.id,
    packageId: packageId,
    createdBy: user.email ? user.email : `${user.company.id}@agora.io`,
    isRenew: isRenew,
    amount: amount,
    currency: cashInfo.accountCurrency
  });
  const res = await createOnceBill(ctx.logger, ctx.state.user, packageId, Number(amount), isRenew, cashInfo.accountCurrency, packageManagement);
  const supportPackage = await getManager()
    .createQueryBuilder(SupportPackage, 'supportPackage')
    .where('supportPackage.id = :id', {
      id: packageId
    })
    .getOne();
  const email = user.email ? user.email : `${user.company.id}@agora.io`;
  // 付费版support自动下单水晶球套餐包
  if (Number(supportPackage.priceUSD) > 0) {
    await new GoodsClient(ctx.logger).handleSupportAAPackage(user.company.id, supportPackage.name, supportPackage.duration, email, cashInfo.accountCurrency, ctx.logger);
  }
  ctx.body = res;
};

export const balancePayMinPackage = async (ctx: Koa.Context) => {
  const { packages, voucherCode } = ctx.request.body;
  const user: User = ctx.state.user;
  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  let voucherRequestInfo: any;
  // checkVoucherCode
  if (voucherCode) {
    const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.Usage, PackageService.getPackageIds(packages), user.companyId, cashInfo.accountCurrency, user.company);
    if (!voucherCheck.allow) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
      return;
    }
    try {
      voucherRequestInfo = await PackageService.insertVoucherRequest(user.companyId, voucherCode, user.id, voucherCheck.voucherInfo.companyQuota);
    } catch (e) {
      ctx.status = 500;
      ctx.body = { code: ErrCode.VOUCHER_REQUEST_ERROR };
      return;
    }
  }
  packages.forEach(item => item.num = parseFloat(item.num));
  const invalidPackages = packages.filter(item => (item.num < 1 || item.num !== Math.floor(item.num)));
  const voucherAmount = await PackageService.getVoucherAmount(voucherCode);
  const formatPackages = await PackageService.formatMinPackageIncludeVoucher(voucherCode, PackageService.packageManagementType.MinPackage, packages);

  if (await exceedMaxQuantity(user.company.id, formatPackages)) {
    ctx.status = 401;
    ctx.body = { code: ErrCode.PACKAGE_EXCEED_MAX_QUANTITY };
    return;
  }

  const amount = await PackageService.getMinPackagesAmount(formatPackages, Number(voucherAmount), cashInfo.accountCurrency);

  const isOk = await checkMoney(Number(cashInfo.accountBalance), Number(amount), 0);
  if (!isOk || packages.length <= 0 || invalidPackages.length > 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
    return;
  }
  const transactionId = await FinanceService.createMinPackageManagement({
    companyId: user.company.id,
    currency: cashInfo.accountCurrency,
    createdBy: user.email ? user.email : `${user.company.id}@agora.io`,
    packages: formatPackages
  });
  try {
    const res = await createPackageOnceBill(ctx.logger, ctx.state.user, amount, cashInfo.accountCurrency, formatPackages, transactionId.toString());
    if (voucherCode) {
      await PackageService.createCompanyVoucherUsage(voucherCode, res.id, user.companyId);
      await PackageService.updateVoucherRequest(user.companyId, voucherCode, voucherRequestInfo.index, PackageService.VoucherRequestStatus.SUCCESS, transactionId);
    }
    ctx.body = res;
  } catch (e) {
    voucherCode && await PackageService.updateVoucherRequest(user.companyId, voucherCode, voucherRequestInfo.index, PackageService.VoucherRequestStatus.FAIL, transactionId);
    ctx.status = 400;
    ctx.body = { code: ErrCode.CREATE_BILL_FAIL };
  }
};

export const balancePayMinPackageByToken = async (ctx: Koa.Context) => {
  const { token } = ctx.request.body;
  const user: User = ctx.state.user;
  const transactionId = decryptPurchaseToken(token);
  let voucherCode = undefined;
  let voucherRequestInfo: any;
  const packageManagements = await PackageManagementService.getUnpaidPackageManagementByTransactionId(user.company.id, transactionId);
  if (packageManagements.length === 0) {
    ctx.status = 400;
    ctx.body = { message: 'No unpaid packages' };
    return;
  }
  const pendingTransactions = await FinanceService.getPendingFinanceTransaction(user.company.id, transactionId);
  if (!pendingTransactions) {
    ctx.status = 400;
    ctx.body = { message: 'No pending transactions' };
    return;
  }

  const checkOrderStatus = await FinanceService.getOrderByTransactionId(ctx.logger, transactionId);

  if (!(checkOrderStatus.data && checkOrderStatus.data.companyId === Number(user.company.id) && checkOrderStatus.data.amount === Number(pendingTransactions.amount))) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid order' };
    return;
  }

  let amount = 0;
  const packages = [];
  for (const packageManagement of packageManagements) {
    amount = amount + Number(packageManagement.amount);
    packages.push(Object.assign(packageManagement, packageManagement.minPackage, {
      packageName: packageManagement.minPackage.name
    }));

    if (packageManagement.voucherCode) {
      voucherCode = packageManagement.voucherCode;
    }
  }

  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  const isOk = Number(cashInfo.accountBalance) >= amount || Number(pendingTransactions.amount) > amount;
  if (!isOk) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
    return;
  }

  if (voucherCode) {
    const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.Usage, PackageService.getPackageIds(packages), user.companyId, cashInfo.accountCurrency, user.company);
    if (!voucherCheck.allow) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
      return;
    }
    try {
      voucherRequestInfo = await PackageService.insertVoucherRequest(user.companyId, voucherCode, user.id, voucherCheck.voucherInfo.companyQuota);
    } catch (e) {
      ctx.status = 500;
      ctx.body = { code: ErrCode.VOUCHER_REQUEST_ERROR };
      return;
    }
  }

  const formatPackage = await PackageService.formatMinPackageIncludeVoucher(voucherCode, PackageService.packageManagementType.MinPackage, packages);

  const res = await createPackageOnceBill(ctx.logger, ctx.state.user, amount, cashInfo.accountCurrency, formatPackage, transactionId);
  if (voucherCode) {
    await PackageService.createCompanyVoucherUsage(voucherCode, res.id, user.companyId);
    await PackageService.updateVoucherRequest(user.companyId, voucherCode, voucherRequestInfo.index, PackageService.VoucherRequestStatus.SUCCESS, Number(transactionId));
  }
  await FinanceService.updatePendingFinanceTransaction(user.companyId, transactionId, TRANSACTION_STATUS.SUCCESS);
  ctx.status = 200;
};

export const aliDepositNotify = async (ctx: Koa.Context) => {
  const { token, isErr } = ctx.request.body;
  const status = isErr ? TRANSACTION_STATUS.FAIL : TRANSACTION_STATUS.SUCCESS;
  const transactionId = decryptPurchaseToken(token);
  const companyId = ctx.state.user.companyId;
  await FinanceService.updatePendingFinanceTransaction(companyId, transactionId, status);
  ctx.status = 200;
};

export const cardChargeThenCreateMinOnceBill = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId: number = ctx.state.user.companyId;
    const { cardId, packages, voucherCode, isUsedBalance } = ctx.request.body;
    const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);

    // checkVoucherCode
    if (voucherCode) {
      const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.Usage, PackageService.getPackageIds(packages), user.companyId, cashInfo.accountCurrency, user.company);
      if (!voucherCheck.allow) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
        return;
      }
    }
    const voucherAmount = await PackageService.getVoucherAmount(voucherCode);
    const formatPackage = await PackageService.formatMinPackageIncludeVoucher(voucherCode, PackageService.packageManagementType.MinPackage, packages);
    const amount = await PackageService.getMinPackagesAmount(formatPackage, Number(voucherAmount), cashInfo.accountCurrency);

    const amountWithBalance = isUsedBalance ? await FinanceService.getPayAmountWithBalance(Number(amount), cashInfo.accountBalance) : amount; // 信用卡支付金额

    const isOk = await checkMoney(Number(cashInfo.accountBalance), Number(amount), Number(amountWithBalance));
    if (!isOk || packages.length <= 0) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
      return;
    }

    const transactionId = await FinanceService.createMinPackageManagement({
      companyId: user.company.id,
      currency: cashInfo.accountCurrency,
      createdBy: user.email ? user.email : `${user.company.id}@agora.io`,
      packages: formatPackage
    });

    const ret = await FinanceService.cardCharge(
      ctx.logger,
      companyId,
      String(amountWithBalance),
      cardId,
      transactionId.toString()
    );
    if (ret.status === 200) {
      await createPackageOnceBill(ctx.logger, ctx.state.user, amount, cashInfo.accountCurrency, packages, transactionId.toString());
      ctx.status = 200;
    } else {
      ctx.status = 400;
    }
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const cardChargeThenCreateOnceBill = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId: number = ctx.state.user.companyId;
    const { cardId, packageId, isRenew, isUsedBalance } = ctx.request.body;
    const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
    const amount = await FinanceService.getRealPayAmount(packageId, isRenew, cashInfo.accountCurrency, companyId); // 实际支付金额
    const amountWithBalance = isUsedBalance ? await FinanceService.getPayAmountWithBalance(Number(amount), cashInfo.accountBalance) : amount; // 信用卡支付金额
    const isOk = await checkMoney(Number(cashInfo.accountBalance), Number(amount), Number(amountWithBalance));
    if (!isOk) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
      return;
    }
    const packageValid = await FinanceService.checkSupportPackgeValid(packageId);
    if (!packageValid) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.Without_Permission };
      return;
    }
    const res: any = await FinanceService.createPackageManagement({
      companyId: user.company.id,
      packageId: packageId,
      createdBy: user.email ? user.email : `${user.company.id}@agora.io`,
      isRenew: isRenew,
      amount: amount,
      currency: cashInfo.accountCurrency
    });

    const ret = await FinanceService.cardCharge(
      ctx.logger,
      companyId,
      String(amountWithBalance),
      cardId,
      res.new.transactionId
    );
    if (ret.status === 200) {
      await createOnceBill(ctx.logger, ctx.state.user, packageId, Number(amount), isRenew, cashInfo.accountCurrency, res);
      const supportPackage = await getManager()
        .createQueryBuilder(SupportPackage, 'supportPackage')
        .where('supportPackage.id = :id', {
          id: packageId
        })
        .getOne();
      if (Number(supportPackage.priceUSD) > 0) {
        const email = user.email ? user.email : `${user.company.id}@agora.io`;
        await new GoodsClient(ctx.logger).handleSupportAAPackage(user.company.id, supportPackage.name, supportPackage.duration, email, cashInfo.accountCurrency, ctx.logger);
      }
      ctx.status = 200;
    } else {
      ctx.status = 400;
    }
    ctx.body = ret.data;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
  }
};

export const getCompanyUsagePackages = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const { limit, page, status, skuId, productType, prop, order } = ctx.query;
  const params = new ListParams(limit, page, {
    status,
    skuId,
    productType,
    companyId,
    prop,
    order
  });
  try {
    const ret = await FinanceService.getUsagePackage(
      ctx.logger,
      params
    );
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.USAGEPACKAGE_ERROR };
  }
};

export const getCompanyPricing = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const ret = await FinanceService.getCompanyPricing(ctx.logger, companyId);
    ctx.body = ret;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    if (e.response && e.response.statusCode) {
      ctx.status = e.response.statusCode;
    } else {
      ctx.status = 400;
    }
    ctx.body = { code: ErrCode.GET_PRICING_ERROR };
  }
};

export const getCompanyFinanceSetting = async (ctx: Koa.Context) => {
  try {
    const user: User = ctx.state.user;
    const companyId = user.companyId;
    const ret = await AccountService.getCompanyFinanceSetting(companyId);
    ctx.body = ret;
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.GET_FINANCE_SETTING_ERROR };
  }
};

export const balancePayMarketplacePackage = async (ctx: Koa.Context) => {
  const { packages, voucherCode } = ctx.request.body;
  const user: User = ctx.state.user;
  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  let voucherRequestInfo: any;
  // checkVoucherCode
  if (voucherCode) {
    const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.MarketPlace, PackageService.getPackageIds(packages), user.companyId, cashInfo.accountCurrency, user.company);
    if (!voucherCheck.allow) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
      return;
    }
    try {
      voucherRequestInfo = await PackageService.insertVoucherRequest(user.companyId, voucherCode, user.id, voucherCheck.voucherInfo.companyQuota);
    } catch (e) {
      ctx.status = 500;
      ctx.body = { code: ErrCode.VOUCHER_REQUEST_ERROR };
      return;
    }
  }
  const voucherAmount = await PackageService.getVoucherAmount(voucherCode);
  packages.forEach(item => item.num = parseFloat(item.num));
  const invalidPackages = packages.filter(item => (item.num < 1 || item.num !== Math.floor(item.num)));
  const formatPackage = await PackageService.formatMinPackageIncludeVoucher(voucherCode, PackageService.packageManagementType.Marketplace, packages);
  const amount = await PackageService.getMarketplacePackagesAmount(formatPackage, Number(voucherAmount), cashInfo.accountCurrency);
  const isOk = await checkMoney(Number(cashInfo.accountBalance), Number(amount), 0);
  if (!isOk || packages.length <= 0 || invalidPackages.length > 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
    return;
  }

  const transactionId = await FinanceService.createMarketplacePackageManagement({
    companyId: user.company.id,
    currency: cashInfo.accountCurrency,
    createdBy: user.email ? user.email : `${user.company.id}@agora.io`,
    packages: formatPackage
  });
  try {
    const res = await createMarketplacePackageOnceBill(ctx.logger, ctx.state.user, amount, cashInfo.accountCurrency, formatPackage, transactionId.toString());
    if (voucherCode) {
      await PackageService.createCompanyVoucherUsage(voucherCode, res.id, user.companyId);
      await PackageService.updateVoucherRequest(user.companyId, voucherCode, voucherRequestInfo.index, PackageService.VoucherRequestStatus.SUCCESS, transactionId);
    }
    ctx.body = res;
  } catch (e) {
    voucherCode && await PackageService.updateVoucherRequest(user.companyId, voucherCode, voucherRequestInfo.index, PackageService.VoucherRequestStatus.FAIL, transactionId);
    ctx.status = 400;
    ctx.body = { code: ErrCode.CREATE_BILL_FAIL };
  }
};

export const balancePayMarketplacePackageByToken = async (ctx: Koa.Context) => {
  const { token } = ctx.request.body;
  const user: User = ctx.state.user;
  const transactionId = decryptPurchaseToken(token);
  let voucherCode = undefined;
  let voucherRequestInfo: any;
  const packageManagements = await PackageManagementService.getUnpaidMarketplacePackageManagementByTransactionId(user.company.id, transactionId);
  if (packageManagements.length === 0) {
    ctx.status = 400;
    ctx.body = { message: 'No unpaid packages' };
    return;
  }
  const pendingTransactions = await FinanceService.getPendingFinanceTransaction(user.company.id, transactionId);
  if (!pendingTransactions) {
    ctx.status = 400;
    ctx.body = { message: 'No pending transactions' };
    return;
  }

  const checkOrderStatus = await FinanceService.getOrderByTransactionId(ctx.logger, transactionId);

  if (!(checkOrderStatus.data && checkOrderStatus.data.companyId === Number(user.company.id) && checkOrderStatus.data.amount === Number(pendingTransactions.amount))) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid order' };
    return;
  }

  let amount = 0;
  const packages = [];
  for (const packageManagement of packageManagements) {
    amount = amount + Number(packageManagement.amount);
    packages.push(Object.assign(packageManagement, packageManagement.marketplacePackage, {
      packageName: packageManagement.marketplacePackage.name
    }));

    if (packageManagement.voucherCode) {
      voucherCode = packageManagement.voucherCode;
    }
  }

  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  const isOk = Number(cashInfo.accountBalance) >= amount || Number(pendingTransactions.amount) > amount;
  if (!isOk) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
    return;
  }

  if (voucherCode) {
    const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.MarketPlace, PackageService.getPackageIds(packages), user.companyId, cashInfo.accountCurrency, user.company);
    if (!voucherCheck.allow) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
      return;
    }
    try {
      voucherRequestInfo = await PackageService.insertVoucherRequest(user.companyId, voucherCode, user.id, voucherCheck.voucherInfo.companyQuota);
    } catch (e) {
      ctx.status = 500;
      ctx.body = { code: ErrCode.VOUCHER_REQUEST_ERROR };
      return;
    }
  }

  const formatPackage = await PackageService.formatMinPackageIncludeVoucher(voucherCode, PackageService.packageManagementType.Marketplace, packages);
  const res = await createMarketplacePackageOnceBill(ctx.logger, ctx.state.user, amount, cashInfo.accountCurrency, formatPackage, transactionId);
  if (voucherCode) {
    await PackageService.createCompanyVoucherUsage(voucherCode, res.id, user.companyId);
    await PackageService.updateVoucherRequest(user.companyId, voucherCode, voucherRequestInfo.index, PackageService.VoucherRequestStatus.SUCCESS, Number(transactionId));
  }
  await FinanceService.updatePendingFinanceTransaction(user.companyId, transactionId, TRANSACTION_STATUS.SUCCESS);

  const returnData = {
    productName: formatPackage[0].name,
    description: formatPackage[0].description,
    number: formatPackage[0].num
  };
  ctx.status = 200;
  ctx.body = returnData;
};

export const checkSGCompany = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const res = await FinanceService.checkSGCompany(ctx.logger, companyId);
  ctx.status = 200;
  ctx.body = res.data;
};
