import { Logger } from 'log4js';
import { config } from '../config';
import * as Client from '../utils/gw-request';
import * as _ from 'lodash';
import {
  OrderModel,
  OrderStatus,
  PaymentMode,
  SubscriptionModel,
  SubscriptionStatus,
  WithBillItem
} from '../dataModel/goods';
import * as moment from 'moment';
import { supportProxyForSession } from './SupportProxy';

export enum OrderLoseMode {
  RefundNothing = 'RefundNothing',
  RefundRemaining = 'RefundRemaining',
  RefundFull = 'RefundFull'
}

function utf8ToBase64(content: string) {
  return Buffer.from(content).toString('base64');
}

function makeAuth(username: string, password: string) {
  const userpwd = `${username}:${password}`;
  return `Basic ${utf8ToBase64(userpwd)}`;
}
const authorization = makeAuth(config.goods.appId, config.goods.appSecret);

export class GoodsClient {
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public makeRequest() {
    return Client.basic_request(this.logger, {
      baseURL: config.goods.urlBase,
      headers: {
        Authorization: authorization
      }
    });
  }

  public async getGoodsInfo(goodsId: string) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/goods/${goodsId}`);
    return res.data;
  }

  public async getGoodsPrice(goodsId: string) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/goods/${goodsId}/price`);
    return res.data;
  }

  public async getGoodsI18n(goodsId: string) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/goods/${goodsId}/i18n`);
    return res.data;
  }

  public async getOpenSaleGoods() {
    const request = this.makeRequest();
    const result = await request.get(`/api-open/v1/open-sale-goods`);
    return result.data;
  }

  public async getGoodsByMutexTag(mutexTag: string) {
    const goods = await this.getOpenSaleGoods();
    return goods.find((item) => {
      return item.mutexTag.toUpperCase() === mutexTag;
    });
  }

  public async checkGoodsIdValid(goodsId: string) {
    if (!goodsId) return false;
    const openSaleGoods = await this.getOpenSaleGoods();
    return !!openSaleGoods.find((item) => {
      return item.goodsId === goodsId;
    });
  }

  public async getFullGoodsInfo(goodsId: string) {
    const [goodsInfo, goodsPrice, goodsI18n] = await Promise.all([
      this.getGoodsInfo(goodsId),
      this.getGoodsPrice(goodsId),
      this.getGoodsI18n(goodsId)
    ]);
    const result = {
      goodsInfo: _.pick(goodsInfo, ['goodsId', 'customUid', 'name', 'description', 'durationLimit']),
      goodsPrice,
      goodsI18n
    };
    return result;
  }

  public async getFullGoodsDetail(goodsId: string) {
    const request = this.makeRequest();
    const result = await request.get(`/api-open/v1/goods/${goodsId}/full-info`);
    return result.data;
  }

  public async postOrder(companyId: number, orderData: OrderModel) {
    const request = this.makeRequest();
    const result = await request.post(`/api-open/v1/company/${companyId}/order`, orderData);
    return result.data;
  }

  public async putOrder(companyId: number, orderId: string, payPrice: number, remarks: string) {
    const request = this.makeRequest();
    const result = await request.put(`/api-open/v1/company/${companyId}/order/${orderId}`, { payPrice, remarks });
    return result.data;
  }

  public async calPostOrderData(goodsId: string, userEmail: string, currency: 'USD' | 'CNY') {
    const goodsFullInfo = await this.getFullGoodsInfo(goodsId);
    const result: OrderModel = {
      customUid: goodsFullInfo.goodsInfo.customUid,
      goodsId: goodsId,
      currency: currency,
      effectiveMonth: moment().format('YYYY-MM'),
      remarks: '',
      agent: userEmail,
      withBill: WithBillItem.WillBill
    };
    return result;
  }

  public async calPostSubscriptionData(goodsId: string, userEmail: string, currency: 'USD' | 'CNY') {
    const goodsFullInfo = await this.getFullGoodsInfo(goodsId);
    const result: SubscriptionModel = {
      customUid: goodsFullInfo.goodsInfo.customUid,
      goodsId: goodsId,
      currency: currency,
      subscriptionMonths: goodsFullInfo.goodsInfo.durationLimit,
      remarks: '',
      agent: userEmail,
      withBill: WithBillItem.WillBill
    };
    return result;
  }

  public async getNeedPayGoodsPrice(goodsId: string, currency: 'USD' | 'CNY') {
    const priceInfo = await this.getGoodsPrice(goodsId);
    return priceInfo[currency].realPrice;
  }

  public async payOrder(companyId: number, orderId: string) {
    const request = this.makeRequest();
    const result = await request.put(`/api-open/v1/company/${companyId}/order/${orderId}/payment`);
    return result.data;
  }

  public async postSubscription(companyId: number, orderData: SubscriptionModel) {
    const request = this.makeRequest();
    const result = await request.post(`/api-open/v1/company/${companyId}/subscription`, orderData);
    return result.data.uid;
  }

  public async paySubscription(companyId: number, uid: string) {
    const request = this.makeRequest();
    const result = await request.put(`/api-open/v1/company/${companyId}/subscription/${uid}/active`, {
      paymentMode: PaymentMode.Standard
    });
    return result.data;
  }

  public async getCompanyOrder(companyId: number) {
    const request = this.makeRequest();
    const res = await request.get(
      `/api-open/v1/company/${companyId}/order?_length=1000&_sortKey=createTime&_sortDirection=descending`
    );
    return res.data;
  }

  public async getCompanyAllOrders(companyId: number) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/company/${companyId}/order`, {
      params: {
        _sortKey: 'createTime',
        _sortDirection: 'descending',
        _length: 100
      }
    });
    return res.data;
  }

  public async getCompanyOrderByStatus(companyId: number, orderStatus: OrderStatus) {
    const res = await this.getCompanyOrder(companyId);
    res.items = res.items.filter((item) => item.orderStatus === orderStatus);
    return res;
  }

  public async cacelSubscription(companyId: number, uid: string) {
    const request = this.makeRequest();
    const result = await request.put(`/api-open/v1/company/${companyId}/subscription/${uid}/cancel`);
    return result.data;
  }

  public async getCompanySubscription(companyId: number, offset: number = 0, length: number = 100) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/company/${companyId}/subscription`, {
      params: {
        _sortKey: 'createTime',
        _sortDirection: 'descending',
        _length: length,
        _offset: offset
      }
    });
    return res.data;
  }

  public async getCompanyAllSubscription(companyId: number) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/company/${companyId}/subscription`, {
      params: {
        _sortKey: 'createTime',
        _sortDirection: 'descending',
        _length: 100
      }
    });
    return res.data;
  }

  public async cacelOrder(companyId: number, orderId: string) {
    const request = this.makeRequest();
    const result = await request.put(`/api-open/v1/company/${companyId}/order/${orderId}/cancel`);
    return result.data;
  }

  public async loseCompanyOrder(companyId: number, orderId: string, params: {}) {
    const request = this.makeRequest();
    const result = await request.put(`/api-open/v1/company/${companyId}/order/${orderId}/lose`, params);
    return result.data;
  }

  public async checkAndCancelUnpaidOrder(companyId: number) {
    const orders = await this.getCompanyOrderByStatus(companyId, OrderStatus.Pending);
    for (const order of orders.items) {
      await this.cacelOrder(companyId, order.orderId);
    }
  }

  public async checkAndCancelSubscription(companyId: number) {
    const subscriptions = await this.getCompanySubscription(companyId);
    for (const subscription of subscriptions.items) {
      if (subscription.subscriptionStatus === 'Active') {
        await this.cacelSubscription(companyId, subscription.uid);
      }
    }
  }

  public async getOrderInfo(companyId: number, orderId: string) {
    const request = this.makeRequest();
    const res = await request.get(`/api-open/v1/company/${companyId}/order/${orderId}`);
    return res.data;
  }

  public async getOrderInfoByTransactionId(companyId: number, transactionId: string) {
    const orders = await this.getCompanyOrder(companyId);
    const items = orders.items.filter((item) => {
      return item.transactionId === transactionId;
    });
    return items.length > 0 ? items[0] : undefined;
  }

  public async checkCurrentMonthOrder(companyId: number) {
    const orders = await this.getCompanyOrderByStatus(companyId, OrderStatus.Paid);
    const now = moment();
    return !!orders.items.find((item) => {
      return moment(item.startTime).isBefore(now) && moment(item.endTime).isAfter(now);
    });
  }

  public async getCompanyActiveOrder(companyId: number) {
    const allOrders = await this.getCompanyAllOrders(companyId);
    const activeOrders = (allOrders.items || []).filter((item) => {
      return item.isActive === 1 && moment().isBefore(moment(item.endTime));
    });
    return activeOrders;
  }

  public async getGoodsInfoByUid(customUid: string) {
    const openGoodsList = await this.getOpenSaleGoods();
    const goodsIds = openGoodsList.map((item) => item.goodsId);
    const promises: any[] = [];
    goodsIds.forEach((goodsId) => {
      promises.push(this.getGoodsInfo(goodsId));
    });
    const result = await Promise.all(promises);
    return result.find((item) => item.customUid === customUid) || {};
  }

  public async handleSupportAAPackage(
    companyId: number,
    supportPackageName: string,
    duration: number,
    email: string,
    currency: 'USD' | 'CNY',
    logger: Logger
  ) {
    let orderTag = true;
    let subscriptionTag = true;
    const customUid = config.SupportAAPackageMapping[supportPackageName];
    if (!customUid) {
      return;
    }
    const orders = await this.getCompanyActiveOrder(companyId);
    for (const order of orders) {
      if (order.mutexTag === 'Default' && order.orderStatus === OrderStatus.Paid) {
        if (order.payPrice === 0 || order.withBill === 0) {
          await this.loseCompanyOrder(companyId, order.orderId, {
            orderLoseMode: OrderLoseMode.RefundNothing
          });
        } else {
          orderTag = false;
          // 已存在付费版通知产品
          supportProxyForSession(logger).sendWechatBotNotify(companyId, `【Support Package - ${supportPackageName}】存在付费订单：CID：${companyId}`);
          break;
        }
      }
    }
    const subscriptions = await this.getCompanyAllSubscription(companyId);
    for (const subscription of subscriptions.items) {
      if (subscription.mutexTag === 'Default' && subscription.subscriptionStatus === SubscriptionStatus.Active) {
        if (subscription.payPrice === 0 || subscription.withBill === 0) {
          await this.cacelSubscription(companyId, subscription.uid);
        } else {
          subscriptionTag = false;
          supportProxyForSession(logger).sendWechatBotNotify(companyId, `【Support Package - ${supportPackageName}】存在付费订阅单：CID：${companyId}`);
          break;
        }
      }
    }
    const goodsInfo = await this.getGoodsInfoByUid(customUid);
    if (orderTag) {
      const goodsOrderParams = {
        customUid: config.SupportAAPackageMapping[supportPackageName],
        goodsId: goodsInfo.goodsId,
        withBill: 0,
        currency: currency,
        effectiveMonth: moment().format('YYYY-MM'),
        agent: email,
        remarks: ''
      };
      const orderInfo = await this.postOrder(companyId, goodsOrderParams);
      await this.payOrder(companyId, orderInfo.orderId);
    }
    if (subscriptionTag) {
      const subscriptionOrderParams = {
        customUid: config.SupportAAPackageMapping[supportPackageName],
        goodsId: goodsInfo.goodsId,
        currency: currency,
        subscriptionMonths: duration,
        remarks: '',
        agent: email,
        withBill: 0
      };
      const subscriptionUid = await this.postSubscription(
        companyId,
        subscriptionOrderParams
      );
      const res = await this.paySubscription(companyId, subscriptionUid);
      console.info(res);
    }
  }
}
