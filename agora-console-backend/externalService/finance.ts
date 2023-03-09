import { getConnection, getManager } from 'typeorm';
import { SupportPackage } from './../models/supportPackage';
import { PackageManagement } from './../models/packageManagement';
import { PackageManagementAssignee } from './../models/packageManagementAssignee';
import { PackageReport } from './../models/packageReport';
import { MarketplacePackageQuota } from '../models/marketplacePackageQuota';
import * as moment from 'moment';
import { Logger } from 'log4js';
import * as Client from '../utils/gw-request';
import { config } from '../config';
import { generateTransactionId } from '../utils/encryptTool';
import { PaymentTransactions, TRANSACTION_STATUS } from '../models/paymentTransactions';
import { ListParams, ListReply, Params } from '../models/listReply';
import { packageManagementStatus, packageManagementType } from '../services/support';
import { User } from '../models/user';
import { minPackageStatus, PackageQuotaStatus } from '../services/package';
import { doveProxyForSession } from './DoveProxy';

export enum PackagManagementType {
  support = 1,
  Marketplace = 2,
  minutes = 3,
  AA = 4
}

export enum packagePublic {
  UnPublic = 1,
  Public = 2
}

export enum PackagManagementRenew {
  UnRenew = 1,
  Renew = 2
}

export enum packageReportProductType {
  Ticket = 1001,
  AA = 1002
}

export enum packageReportMedia {
  ResponseTime = 1,
  FeatureEnable = 2
}

export enum packageReportFeeCategory {
  SupportPackage = 0,
  SupportPackageUnused = 2
}

export enum OnceBillsInvoiceType {
  Support = 0,
  Usage = 1,
  Marketplace = 2
}

export const sendSupportEmail = async (log: Logger, companyId: number, packageName: string) => {
  const tplID = config.dove.getSupportEmailTplId();
  const toUser = 'zhouqi@agora.io';
  const params = {
    receiverList: [toUser],
    templateId: tplID,
    templateParams: {
      companyId: companyId,
      packageName: packageName
    }
  };
  return doveProxyForSession(log).sendEmail(params);
};

// http://125.88.159.217:18300/bss-balancemgmt/swagger-ui.html#/company-cash-account-resource/getCompanyCashAccountUsingGET
export const getCashInfo = async (log: Logger, companyId: number) => {
  const client = Client.gw_create(log);
  const ret = await client.get(`${config.balanceBaseUrl}/v1/companies/${companyId}/cash-accounts`);
  return ret.data;
};

// http://125.88.159.217:18300/bss-payment/swagger-ui.html#/online-payment-resource/createOnlinePaymentOrderByAlipayUsingPOST
export const recharge = async (log: Logger, companyId: number, money: number, returnUrl: string, transactionId: string) => {
  const client = Client.gw_create(log);
  const ret = await client.post(`${config.paymentBaseUrl}/v1/online-payments/alipay/page-pay`, { amount: money, companyId, returnUrl, transactionId });
  return ret.data.form;
  // const ret = await client.get(`${config.paymentBaseUrl}/v1/online-payments/alipay/test`);
  // return ret.data;
};

// http://125.88.159.217:18300/bss-analysis/swagger-ui.html
export const getOnceBillList = async (log: Logger, companyId: number, params: ListParams) => {
  const client = Client.gw_create(log);
  const queryParams: any = { pageSize: params.limit, pageNumber: params.page, orderby: 'invoiceDate desc' };
  const filters = [];
  if (params.params.startDate) {
    filters.push(['invoiceDate', 'ge', `datetime'${params.params.startDate}T00:00:00'`]);
  }
  if (params.params.endDate) {
    const endDate = moment.utc(params.params.endDate).add(1, 'd').format('YYYY-MM-DD');
    filters.push(['invoiceDate', 'lt', `datetime'${endDate}T00:00:00'`]);
  }
  filters.push(['customer/id', 'eq', companyId]);
  if (filters.length > 0) {
    queryParams.filter = filters.map((filter) => filter.join(' ')).join(' and ');
  }
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/once-bills`, { params: queryParams });
  const reply: ListReply<any> = {
    total: ret.data.totalSize,
    items: ret.data.elements
  };
  return reply;
};

export const getExtensionOnceBillList = async (log: Logger, companyId: number, params: ListParams, period: string) => {
  const client = Client.gw_create(log);
  const queryParams: any = { size: params.limit, page: params.page - 1 };
  let ret;
  if (period) {
    ret = await client.get(`${config.backendBaseUrl}/bss-bill/api/v3/marketplace/companies/${companyId}/bill`, { params: { ...queryParams, period } });
  } else {
    ret = await client.get(`${config.backendBaseUrl}/bss-bill/api/v3/marketplace/companies/${companyId}/bills`, { params: queryParams });
  }
  const reply: ListReply<any> = {
    total: ret.data.length,
    items: ret.data
  };
  return reply;
};

export const getOrderByTransactionId = async (log: Logger, transactionId: string) => {
  const client = Client.gw_create(log);
  const ret = await client.get(`${config.backendBaseUrl}/bss-payment/v1/online-payments/orders/${transactionId}`);
  return ret;
};

// http://125.88.159.217:18300/bss-analysis/swagger-ui.html#/billing-record-resource/listBillingRecordUsingGET
// http://125.88.159.217:18300/bss-analysis/v1/companies/{companyId}/bill-overview
export const getBillingList = async (log: Logger, companyId: number, params: ListParams) => {
  const client = Client.gw_create(log);
  const queryParams: any = { pageSize: params.limit, pageNumber: params.page, orderby: 'invoiceDate desc' };
  const filters = [];
  if (params.params.startDate) {
    filters.push(['invoiceDate', 'ge', `datetime'${params.params.startDate}T00:00:00'`]);
  }
  if (params.params.endDate) {
    const endDate = moment.utc(params.params.endDate).add(1, 'd').format('YYYY-MM-DD');
    filters.push(['invoiceDate', 'lt', `datetime'${endDate}T00:00:00'`]);
  }
  if (filters.length > 0) {
    queryParams.filter = filters.map((filter) => filter.join(' ')).join(' and ');
  }
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/companies/${companyId}/bill-overview`, { params: queryParams });
  const reply: ListReply<any> = {
    total: ret.data.totalSize,
    items: ret.data.elements
  };
  return reply;
};

// http://125.88.159.217:18300/bss-analysis/v1/billing-records 已废弃
// http://125.88.159.217:18300/bss-analysis/v1/billing-invoices
export const getBillingListByFilter = async (log: Logger, params: ListParams) => {
  const client = Client.gw_create(log, { timeout: 30 * 1000 });
  const queryParams: any = { pageSize: params.limit, pageNumber: params.page, orderby: 'billPeriod desc' };
  const filters = [];
  if (params.params.companyId) {
    filters.push(['companyId', 'eq', params.params.companyId]);
  }
  if (params.params.deductionStatus) {
    filters.push(['deductionStatus', 'eq', params.params.deductionStatus]);
  }
  if (params.params.invoiced) {
    let tmpInvoiced = params.params.invoiced.split(',');
    tmpInvoiced = tmpInvoiced.map(item => {
      return `invoiceStatus eq ${item}`;
    });
    const orCondition = `(${tmpInvoiced.join(' or ')})`;
    filters.push([orCondition]);
  }
  if (params.params.currency) {
    filters.push(['currency', 'eq', params.params.currency]);
  }
  if (params.params.startDate) {
    filters.push(['billPeriod', 'ge', `'${params.params.startDate}'`]);
  }
  if (filters.length > 0) {
    queryParams.filter = filters.map((filter) => filter.join(' ')).join(' and ');
  }
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/billing-invoices`, { params: queryParams });
  const reply: ListReply<any> = {
    total: ret.data.totalSize,
    items: ret.data.elements
  };
  return reply;
};

// http://125.88.159.217:18300/bss-analysis/swagger-ui.html#/company-resource/listCompanyTransactionsUsingGET
export const getTransactionsByCompany = async (log: Logger, companyId: number, params: ListParams) => {
  const client = Client.gw_create(log);
  const queryParams: any = { pageSize: params.limit, pageNumber: params.page, orderby: 'id desc' };
  const filters = [];
  if (params.params.transType) {
    filters.push(['transType', 'eq', `${params.params.transType}`]);
  }
  if (params.params.transTypes) {
    params.params.transTypes = params.params.transTypes.split(',');
    const tmpFilter = [];
    params.params.transTypes.forEach(item => {
      tmpFilter.push(`transType eq ${item}`);
    });
    filters.push([tmpFilter.join(' or ')]);
  }
  if (params.params.startDate) {
    filters.push(['createdTime', 'ge', `datetime'${params.params.startDate}T00:00:00'`]);
  }
  if (params.params.endDate) {
    const endDate = moment.utc(params.params.endDate).add(1, 'd').format('YYYY-MM-DD');
    filters.push(['createdTime', 'lt', `datetime'${endDate}T00:00:00'`]);
  }
  if (filters.length > 0) {
    queryParams.filter = filters.map((filter) => filter.join(' ')).join(' and ');
  }
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/companies/${companyId}/transactions`, { params: queryParams });
  const reply: ListReply<any> = {
    total: ret.data.totalSize,
    items: ret.data.elements
  };
  return reply;
};

// http://125.88.159.217:18300/bss-analysis/swagger-ui.html#/usage-package-resource/listUsagePackageUsingGET
export const getUsagePackage = async (log: Logger, params: ListParams) => {
  const client = Client.gw_create(log);
  const queryParams: any = { pageSize: params.limit, pageNumber: params.page, orderby: 'id desc' };
  const filters = [];
  if (params.params.prop) {
    queryParams.orderby = `${params.params.prop} ${params.params.order === 'ascending' ? 'asc' : 'desc'}`;
  }
  if (params.params.companyId) {
    filters.push(['companyId', 'eq', `${params.params.companyId}`]);
  }
  if (params.params.productType) {
    filters.push(['productType', 'eq', `${params.params.productType}`]);
  }
  if (params.params.skuId) {
    filters.push(['skuId', 'eq', `${params.params.skuId}`]);
  }
  if (params.params.status) {
    switch (params.params.status) {
      case 'normal':
        filters.push(['expireTime', 'gt', `datetime'${moment().format('YYYY-MM-DD')}T00:00:00'`]);
        filters.push(['remainingUsage', 'gt', 0]);
        break;
      case 'expired':
        filters.push(['expireTime', 'lt', `datetime'${moment().format('YYYY-MM-DD')}T00:00:00'`]);
        break;
      case 'usedUp':
        filters.push(['remainingUsage', 'eq', 0]);
    }
  }
  if (filters.length > 0) {
    queryParams.filter = filters.map((filter) => filter.join(' ')).join(' and ');
  }
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/usage-package`, { params: queryParams });
  const reply: ListReply<any> = {
    total: ret.data.totalSize,
    items: ret.data.elements
  };
  return reply;
};

// http://125.88.159.217:18300/bss-payment/swagger-ui.html#/online-payment-resource
export const getCardList = async (log: Logger, companyId: number) => {
  const client = Client.gw_create(log);
  const ret = await client.get(`${config.backendBaseUrl}/bss-payment/v1/online-payments/companies/${companyId}/stripe/cards`);
  return ret;
};

export const setCardDefault = async (log: Logger, companyId: number, cardId: string) => {
  const client = Client.gw_create(log);
  const ret = await client.put(`${config.backendBaseUrl}/bss-payment/v1/online-payments/companies/${companyId}/stripe/cards/${cardId}/default-card`);
  return ret;
};

export const addCard = async (log: Logger, companyId: number, cardToken: string, defaultCard: boolean) => {
  const client = Client.gw_create(log);
  const ret = await client.post(`${config.backendBaseUrl}/bss-payment/v1/online-payments/stripe/cards`, { cardToken, companyId, defaultCard });
  return ret;
};

export const cardCharge = async (log: Logger, companyId: number, amount: string, cardId: string, transactionId: string) => {
  const client = Client.gw_create(log);
  const ret = await client.post(`${config.backendBaseUrl}/bss-payment/v1/online-payments/stripe/charge`, { amount, cardId, companyId, transactionId });
  return ret;
};

export const deleteCard = async (log: Logger, companyId: number, cardId: string) => {
  const client = Client.gw_create(log);
  const ret = await client.delete(`${config.backendBaseUrl}/bss-payment/v1/online-payments/companies/${companyId}/stripe/cards/${cardId}`);
  return ret;
};

export const precheckBankAccount = async (log: Logger, accountNumber: string) => {
  const client = Client.gw_create(log);
  const ret = await client.get(`${config.backendBaseUrl}/bss-payment/v1/bank-accounts/${accountNumber}/precheck`);
  return ret;
};

export const applyReceipt = async (log: Logger, params: Params) => {
  const client = Client.gw_create(log);
  const { bill_ids } = params.params;
  const ret = await client.post(`${config.backendBaseUrl}/bss-bill/billingrecords/invoiced`, {
    billingRecordIdSet: bill_ids
  });
  return ret.data;
};

export const putInvoiceStatus = async (log: Logger, params: Params) => {
  const client = Client.gw_create(log);
  const { bill_ids, status } = params.params;
  const ret = await client.put(`${config.backendBaseUrl}/bss-bill/billingrecords/invoice-status`, {
    billingRecordIdSet: bill_ids,
    invoiceStatus: status
  });
  return ret.data;
};

export const putOnceBillInvoiceStatus = async (log: Logger, params: Params) => {
  const client = Client.gw_create(log);
  const { once_bill_ids, status } = params.params;
  const ret = await client.put(`${config.backendBaseUrl}/bss-bill/v2/bills/once-bills/invoice-status`, {
    onceBillIds: once_bill_ids,
    invoiceStatus: status
  });
  return ret.data;
};

export const getCompanyRefunds = async (log: Logger, companyId: number, params: ListParams) => {
  const client = Client.gw_create(log);
  const queryParams: any = { pageSize: params.limit, pageNumber: params.page, orderby: 'requestTime desc' };
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/companies/${companyId}/refunds`, { params: queryParams });
  const reply: ListReply<any> = {
    total: ret.data.totalSize,
    items: ret.data.elements
  };
  return reply;
};

export const checkSGCompany = async (log: Logger, companyId: number) => {
  const client = Client.gw_create(log);
  const ret = await client.get(`${config.backendBaseUrl}/bss-analysis/v1/companies/${companyId}/sg-company`);
  return ret;
};

export const postRefunds = async (log: Logger, companyId: number, amount: number, email: string, userId: number) => {
  const client = Client.gw_create(log);
  const ret = await client.post(`${config.paymentBaseUrl}/v1/refunds/application`, {
    amount: amount,
    companyId: companyId,
    requestUserEmail: email,
    requestUserId: userId
  });
  return ret.data;
};

export const refundsPreview = async (log: Logger, companyId: number, amount: number, email: string, userId: number) => {
  const client = Client.gw_create(log);
  const ret = await client.post(`${config.paymentBaseUrl}/v1/refunds/preview`, {
    amount: amount,
    companyId: companyId,
    requestUserEmail: email,
    requestUserId: userId
  });
  return ret.data;
};

export const getCompanyPricing = async (log: Logger, companyId: number) => {
  const client = Client.gw_create(log);
  const ret = await client.get(`${config.backendBaseUrl}/bss-pricing/api/v1/companies/${companyId}/pricing/formal-pricing/usage-package-limit-status`);
  return ret.data;
};

const getExpireDate = (effectiveDate, duration) => {
  return moment(effectiveDate).add(duration, 'months').format('YYYY-MM-DD HH:mm:ss');
};

const getUsageExpireDate = (effectiveDate, duration) => {
  return moment(effectiveDate).add(duration, 'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');
};

/**
 * oldPrice         旧套餐实际支付金额
 * newPrice         新套餐实际支付金额
 * effectiveDate    旧套餐开始日期
 * expireDate       旧套餐过期日期
 */
const computePrice = (oldPrice: number, newPrice: number, effectiveDate: any, expireDate: any) => {
  let addPrice = 0;
  const duration = moment(expireDate).diff(moment(effectiveDate), 'days') + 1;
  const unitPrice = oldPrice / duration;

  if (moment(expireDate).isAfter(moment())) {
    const unUsedDays = moment(expireDate).diff(moment(), 'days') + 1;
    addPrice = Number((unUsedDays * unitPrice).toFixed(2));
  }

  // 不可超过当前套餐的实际支付金额
  if (addPrice > oldPrice) {
    addPrice = oldPrice;
  }

  // 最高折算新套餐包的价格
  if (addPrice > newPrice) {
    return newPrice;
  }

  return addPrice;
};

/**
 * 公司无法退款的金额，用于财务审计
 * 购买的新套餐包的价值小于折算金额，这部分钱我们不会退款
 * oldPrice         旧套餐实际支付金额
 * newPrice         新套餐实际支付金额
 * effectiveDate    旧套餐开始日期
 * expireDate       旧套餐过期日期
 */
export const computeCanNotRefundAmount = (oldPrice: number, newPrice: number, effectiveDate: any, expireDate: any) => {
  let addPrice = 0;
  const duration = moment(expireDate).diff(moment(effectiveDate), 'days') + 1;
  const unitPrice = oldPrice / duration;

  if (moment(expireDate).isAfter(moment())) {
    const unUsedDays = moment(expireDate).diff(moment(), 'days') + 1;
    addPrice = Number((unUsedDays * unitPrice).toFixed(2));
  }

  // 实际折算的金额 - 新套餐包价格
  return addPrice - newPrice;
};

/**
 * 实际支付价格
 * packageId 套餐包id
 * isRenew 是否为续费订单
 * currency 货币类型
 * companyId 公司id
 */
export const getRealPayAmount = async (packageId: number | string, isRenew: boolean, currency: string, companyId: number | string) => {
  const supportPackage = await getManager()
  .createQueryBuilder(SupportPackage, 'supportPackage')
  .where('supportPackage.id = :id', {
    id: packageId
  })
  .getOne();
  const oldPackageManagement = await getManager()
  .createQueryBuilder(PackageManagement, 'packageManagement')
  .where('packageManagement.company_id = :companyId and packageManagement.status = :status and packageManagement.type = :type', {
    companyId: companyId,
    status: packageManagementStatus.Active,
    type: packageManagementType.Support
  })
  .getOne();
  const spAmount = currency === 'USD' ? Number(supportPackage.priceUSD) : Number(supportPackage.priceCNY);
  // 续费订单，返回套餐包金额
  // 首次购买，无需折算，返回套餐包金额
  if (isRenew || !oldPackageManagement) {
    return spAmount;
  }

  const addPrice = computePrice(Number(oldPackageManagement.amount), spAmount, oldPackageManagement.effectiveDate, oldPackageManagement.expireDate);
  return spAmount - addPrice < 0 ? 0 : (spAmount - addPrice).toFixed(2);

};

/**
 * 使用余额时，信用卡或者支付宝需要支付的价格
 * amount getRealPayAmount()的结果，即实际应支付的总价格
 * balance 账户余额
 */
export const getPayAmountWithBalance = async (amount: number, balance: number) => {
  if (balance > 0) {
    // 支付总额小于等于余额时，只需要支付支付总额即可
    return amount > balance ? Number(amount - balance).toFixed(2) : amount;
  } else {
    return 0;
  }
};

const getMinPackageItemPrice = (currency: string, item: any) => {
  const price = currency === 'USD' ? (Number(item.priceUSD) * item.num).toFixed(2) : (Number(item.priceCNY) * item.num).toFixed(2);
  return item['voucherAmount'] ? (Number(price) - Number(item['voucherAmount'])).toFixed(2) : price;
};

export const countPackagePurchaseCount = async (companyId: number, packageId: number) => {
  const { sum } = await getManager()
    .createQueryBuilder(PackageManagement, 't')
    .select('SUM(t.num)', 'sum')
    .where('t.company_id = :companyId', { companyId: companyId })
    .andWhere('t.package_id = :packageId', { packageId: packageId })
    .getRawOne();
  return sum || 0;
};

export const createMinPackageManagement = async ({ companyId, currency, createdBy, packages = [] }) => {
  const transactionId = Number(generateTransactionId());
  await getConnection().transaction(async transactionalEntityManager => {
    await Promise.all(packages.map((item: any) => transactionalEntityManager
    .createQueryBuilder()
    .insert()
    .into(PackageManagement)
    .values([
      {
        type: PackagManagementType.minutes,
        packageId: item.packageId,
        companyId,
        createdBy,
        transactionId,
        voucherCode: item['voucherCode'] || undefined,
        expireDate: getUsageExpireDate(moment(), item.duration),
        amount: Number(getMinPackageItemPrice(currency, item)) < 0 ? '0' : getMinPackageItemPrice(currency, item),
        num: item.num,
        isRenew: 1
      }
    ])
    .execute()
    ));
  });
  return transactionId;
};

export const createMarketplacePackageManagement = async ({ companyId, currency, createdBy, packages = [] }) => {
  const transactionId = Number(generateTransactionId());
  await getConnection().transaction(async transactionalEntityManager => {
    await Promise.all(packages.map((item: any) => transactionalEntityManager
    .createQueryBuilder()
    .insert()
    .into(PackageManagement)
    .values([
      {
        type: PackagManagementType.Marketplace,
        packageId: item.packageId,
        companyId,
        createdBy,
        transactionId,
        voucherCode: item['voucherCode'] || undefined,
        expireDate: getUsageExpireDate(moment(), item.duration),
        amount: Number(getMinPackageItemPrice(currency, item)) < 0 ? '0' : getMinPackageItemPrice(currency, item),
        num: item.num,
        isRenew: 1
      }
    ])
    .execute()
    ));
  });
  return transactionId;
};

export const createPackageManagement = async ({ companyId, packageId, createdBy, isRenew, amount, currency }) => {
  let res = undefined;
  let packageManagement = undefined;
  const oldPackageManagement = await getManager()
    .createQueryBuilder(PackageManagement, 'packageManagement')
    .leftJoinAndSelect('packageManagement.supportPackage', 'supportPackage')
    .where('packageManagement.company_id = :companyId and packageManagement.status = :status and packageManagement.type = :type', {
      companyId: companyId,
      status: packageManagementStatus.Active,
      type: packageManagementType.Support
    })
    .getOne();
  const supportPackage = await getManager()
    .createQueryBuilder(SupportPackage, 'supportPackage')
    .where('supportPackage.id = :id', {
      id: packageId
    })
    .getOne();

  let addPrice = 0;
  if (oldPackageManagement) {
    const oldPrice = oldPackageManagement.amount;
    const newPrice = currency === 'USD' ? supportPackage.priceUSD : supportPackage.priceCNY;
    addPrice = computePrice(Number(oldPrice), Number(newPrice), oldPackageManagement.effectiveDate, oldPackageManagement.expireDate);
  }
  await getConnection().transaction(async transactionalEntityManager => {
    let _amount = amount;
    // 续费扣款的实际金额还是amount，但数据库中的amount要包含之前未用完的部分折算的钱
    if (isRenew) {
      _amount = Number(amount) + Number(addPrice);
    }
    // 创建新的套餐关系
    res = await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(PackageManagement)
      .values([
        {
          type: PackagManagementType.support,
          packageId,
          companyId,
          createdBy: createdBy,
          transactionId: Number(generateTransactionId()),
          // 续费是从旧套餐关系的结束日期开始
          expireDate: getExpireDate(isRenew ? oldPackageManagement.expireDate : moment(), supportPackage.duration),
          amount: _amount < 0 ? 0 : _amount,
          renew: isRenew ? PackagManagementRenew.Renew : PackagManagementRenew.UnRenew
        }
      ])
      .execute();
    // 获取新的套餐关系，typeorm插入回调无法拿到插入数据，只能拿到id
    packageManagement = await transactionalEntityManager
      .createQueryBuilder(PackageManagement, 'packageManagement')
      .where('packageManagement.id = :id', {
        id: res.identifiers[0].id
      })
      .getOne();
    packageManagement.supportPackage = supportPackage;
  });
  return {
    old: oldPackageManagement,
    new: packageManagement
  };
};

export const createPackageOnceBill = async (log: Logger, user: User, amount: number, currency: string, packages = [], transactionId: string) => {
  const recurrentItemList = [];
  const packageNames = [];
  let billingItemName = '';
  packages.forEach(item => {
    const packageDesc = item['voucherName'] ? `${item.packageName} x ${item.num}（${item['voucherName']}: ${item['voucherAmount']}）` : `${item.packageName} x ${item.num}`;
    recurrentItemList.push({
      amount: Number(getMinPackageItemPrice(currency, item)) < 0 ? '0' : getMinPackageItemPrice(currency, item),
      desc: packageDesc,
      packageConfigId: item.packageId,
      quantity: item.num
    });
    packageNames.push(item.packageName);
  });
  billingItemName = packageNames.join('、');
  if (billingItemName.length > 120) {
    billingItemName = `${billingItemName.slice(0, 120)} ...`;
  }
  const client = Client.gw_create(log);
  const bill: any = await client.post(`${config.bssBillBaseUrl}/v2/bills/once-bills`, {
    billToAddress: {
      addressLine: '',
      city: '',
      country: user.company.country
    },
    company: {
      country: user.company.country,
      email: user.email,
      id: user.company.id,
      name: user.company.name
    },
    currency: currency,
    dueDate: moment().format('YYYY-MM-DD'),
    invoiceDate: moment().format('YYYY-MM-DD'),
    invoiceType: 1,
    period: moment().format('YYYY-MM'),
    recurrentItemList: recurrentItemList,
    sales: {
      email: user.company.salesEmail || 'billingcn@agora.io',
      id: -1
    },
    totalAmount: amount < 0 ? 0 : amount,
    transactionId: transactionId,
    billingItem: billingItemName
  });
  await getConnection().transaction(async transactionalEntityManager => {
    await transactionalEntityManager
      .createQueryBuilder()
      .update(PackageManagement)
      .set({ status: packageManagementStatus.Active, billId: bill.data.id })
      .where('transactionId = :id', { id: transactionId })
      .execute();
  });
  return bill.data || new Error('Create Bill Fail');
};

// 判断是否需要扣除套餐包超出部分用量
export const checkMarketPackageUsage = async (companyId: number, serviceName: string) => {
  let totalExceed = 0;
  const exceedPackage = await getManager()
  .createQueryBuilder(MarketplacePackageQuota, 'marketplacePackageQuota')
  .where('marketplacePackageQuota.company_id = :companyId', { companyId: companyId })
  .andWhere('marketplacePackageQuota.service_name = :serviceName', { serviceName: serviceName })
  .andWhere('marketplacePackageQuota.quota_used > marketplacePackageQuota.usage_quota')
  .getMany();

  for (const packageQuota of exceedPackage) {
    totalExceed += packageQuota.quotaUsed - packageQuota.usageQuota;
  }
  if (totalExceed <= 0) return;
  console.log(`totalExceed: ${totalExceed}`);
  await getConnection().transaction(async transactionalEntityManager => {
    try {
      await transactionalEntityManager
      .createQueryBuilder()
      .update(MarketplacePackageQuota)
      .set({ quotaUsed: () => 'usage_quota', status: PackageQuotaStatus.OVERDUE })
      .where('companyId = :companyId and serviceName = :serviceName and quotaUsed > usageQuota', { companyId: companyId, serviceName: serviceName })
      .execute();
    } catch (error) {
      console.log(error);
    }
  });

  const newPackages = await getManager()
  .createQueryBuilder(MarketplacePackageQuota, 'marketplacePackageQuota')
  .where('marketplacePackageQuota.company_id = :companyId', { companyId: companyId })
  .andWhere('marketplacePackageQuota.service_name = :serviceName', { serviceName: serviceName })
  .andWhere('marketplacePackageQuota.quota_used < marketplacePackageQuota.usage_quota')
  .getMany();

  for (let i = 0; i < newPackages.length; i++) {
    if (totalExceed <= 0) return;
    if (i === newPackages.length - 1) {
      const remainingUsage = newPackages[i].usageQuota - newPackages[i].quotaUsed;
      const overdue = totalExceed > remainingUsage;
      await getConnection().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
        .createQueryBuilder()
        .update(MarketplacePackageQuota)
        .set({ quotaUsed: () => `quota_used + ${totalExceed}`, status: overdue ? PackageQuotaStatus.OVERDUE : PackageQuotaStatus.NORMAL })
        .where('id = :id', { id: newPackages[i].id })
        .execute();
      });
    } else {
      const currentPackageUsed = newPackages[i].quotaUsed;
      const remainingUsage = newPackages[i].usageQuota - newPackages[i].quotaUsed;
      if (remainingUsage >= totalExceed) {
        const nowUsage = currentPackageUsed + totalExceed;
        await getConnection().transaction(async transactionalEntityManager => {
          await transactionalEntityManager
          .createQueryBuilder()
          .update(MarketplacePackageQuota)
          .set({ quotaUsed: nowUsage })
          .where('id = :id', { id: newPackages[i].id })
          .execute();

          totalExceed = 0;
        });
      } else {
        totalExceed = totalExceed - remainingUsage;
        await getConnection().transaction(async transactionalEntityManager => {
          await transactionalEntityManager
          .createQueryBuilder()
          .update(MarketplacePackageQuota)
          .set({ quotaUsed: () => `usage_quota`, status: PackageQuotaStatus.OVERDUE })
          .where('id = :id', { id: newPackages[i].id })
          .execute();
        });
      }
    }
  }
};

export const createMarketplacePackageOnceBill = async (log: Logger, user: User, amount: number, currency: string, packages = [], transactionId: string) => {
  const recurrentItemList = [];
  const packageNames = [];
  let billingItemName = '';
  packages.forEach(item => {
    const packageDesc = item['voucherName'] ? `${item.packageName} x ${item.num}（${item['voucherName']}: ${item['voucherAmount']}）` : `${item.packageName} x ${item.num}`;
    recurrentItemList.push({
      amount: Number(getMinPackageItemPrice(currency, item)) < 0 ? '0' : getMinPackageItemPrice(currency, item),
      desc: packageDesc,
      packageConfigId: item.packageId,
      quantity: item.num
    });
    packageNames.push(item.packageName);
  });
  billingItemName = packageNames.join('、');
  if (billingItemName.length > 120) {
    billingItemName = `${billingItemName.slice(0, 120)} ...`;
  }
  const client = Client.gw_create(log);
  const marketPlaceDetailDto: { relateIds: number[] } = { relateIds: [] };
  await getConnection().transaction(async transactionalEntityManager => {
    await Promise.all(packages.map(async (item: any) => {
      for (let i = 0; i < item.num; i++) {
        const res = await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(MarketplacePackageQuota)
          .values([
            {
              marketplacePackageId: item.packageId,
              companyId: user.company.id,
              serviceName: item.marketplacePackageProduct.serviceName,
              packageName: item.packageName,
              usageQuota: item.marketplacePackageProduct.usageQuote,
              quotaUsed: 0,
              transactionId: Number(transactionId),
              expireDate: getUsageExpireDate(moment(), item.duration),
              status: PackageQuotaStatus.OVERDUE
            }
          ])
          .execute();
        marketPlaceDetailDto.relateIds.push(res.identifiers[0].id);
      }
    }));
  });

  const bill: any = await client.post(`${config.bssBillBaseUrl}/v2/bills/once-bills`, {
    billToAddress: {
      addressLine: '',
      city: '',
      country: user.company.country
    },
    company: {
      country: user.company.country,
      email: user.email,
      id: user.company.id,
      name: user.company.name
    },
    currency: currency,
    dueDate: moment().format('YYYY-MM-DD'),
    invoiceDate: moment().format('YYYY-MM-DD'),
    invoiceType: OnceBillsInvoiceType.Marketplace,
    period: moment().format('YYYY-MM'),
    recurrentItemList: recurrentItemList,
    sales: {
      email: user.company.salesEmail || 'billingcn@agora.io',
      id: -1
    },
    totalAmount: amount < 0 ? 0 : amount,
    transactionId: transactionId,
    billingItem: billingItemName,
    marketPlaceDetailDto
  });

  await getConnection().transaction(async transactionalEntityManager => {
    await transactionalEntityManager
      .createQueryBuilder()
      .update(PackageManagement)
      .set({ status: packageManagementStatus.Active, billId: bill.data.id })
      .where('transactionId = :id', { id: transactionId })
      .execute();
    for (let i = 0; i < marketPlaceDetailDto.relateIds.length; i++) {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(MarketplacePackageQuota)
          .set({ status: PackageQuotaStatus.NORMAL })
          .where('id = :id', { id: marketPlaceDetailDto.relateIds[i] })
          .execute();
    }
  });

  return bill.data || new Error('Create Bill Fail');
};

export const createOnceBill = async (log: Logger, user: User, packageId: number, amount: number, isRenew: boolean, currency: string, res: any) => {
  const recurrentItemList = [];
  let companyCanNotRefundAmount = 0;
  // 续费的旧套餐不需要在账单中体现，因为续费不会折算金额
  if (res.old && !isRenew) {
    const oldPrice = res.old.amount;
    const newPrice = currency === 'USD' ? res.new.supportPackage.priceUSD : res.new.supportPackage.priceCNY;
    recurrentItemList.push({
      amount: `-${computePrice(oldPrice, newPrice, res.old.effectiveDate, res.old.expireDate)}`,
      desc: res.old.supportPackage.name
    });
  }
  if (res.old) {
    const oldPrice = res.old.amount;
    const newPrice = currency === 'USD' ? res.new.supportPackage.priceUSD : res.new.supportPackage.priceCNY;
    companyCanNotRefundAmount = computeCanNotRefundAmount(oldPrice, newPrice, res.old.effectiveDate, res.old.expireDate) || 0;
  }
  recurrentItemList.push({
    amount: currency === 'USD' ? res.new.supportPackage.priceUSD : res.new.supportPackage.priceCNY,
    desc: res.new.supportPackage.isPublic === packagePublic.Public ? res.new.supportPackage.name : user.company.area === 'Non-CN' ? 'Customized Package' : '定制套餐'
  });
  const client = Client.gw_create(log);
  const bill: any = await client.post(`${config.bssBillBaseUrl}/v2/bills/once-bills`, {
    billToAddress: {
      addressLine: '',
      city: '',
      country: user.company.country
    },
    company: {
      country: user.company.country,
      email: user.email,
      id: user.company.id,
      name: user.company.name
    },
    currency: currency,
    dueDate: moment(res.new.effectiveDate).format('YYYY-MM-DD'),
    invoiceDate: moment(res.new.effectiveDate).format('YYYY-MM-DD'),
    invoiceType: 0,
    period: moment(res.new.effectiveDate).format('YYYY-MM'),
    recurrentItemList: recurrentItemList,
    sales: {
      email: user.company.salesEmail || 'billingcn@agora.io',
      id: -1
    },
    totalAmount: amount < 0 ? 0 : amount,
    transactionId: res.new.transactionId,
    billingItem: res.new.supportPackage.name
  });

  sendSupportEmail(log, user.company.id, res.new.supportPackage.name).catch(err => console.error(err));

  if (companyCanNotRefundAmount > 0) {
    await PackageReport.createQueryBuilder()
      .insert()
      .values([
        {
          billId: 0,
          companyId: user.company.id,
          media: packageReportMedia.ResponseTime,
          productType: packageReportProductType.Ticket,
          amount: (companyCanNotRefundAmount / 2).toFixed(2),
          feeCategory: packageReportFeeCategory.SupportPackageUnused,
          duration: 0,
          startDate: moment().format('YYYY-MM'),
          expireDate: moment().format('YYYY-MM'),
          billPeriod: moment().format('YYYY-MM'),
          packageManagementId: res.new.id,
          currency: currency
        },
        {
          billId: 0,
          companyId: user.company.id,
          media: packageReportMedia.FeatureEnable,
          productType: packageReportProductType.AA,
          feeCategory: packageReportFeeCategory.SupportPackageUnused,
          amount: (companyCanNotRefundAmount / 2).toFixed(2),
          duration: 0,
          startDate: moment().format('YYYY-MM'),
          expireDate: moment().format('YYYY-MM'),
          billPeriod: moment().format('YYYY-MM'),
          packageManagementId: res.new.id,
          currency: currency
        }
      ])
      .execute();
  }
  await getConnection().transaction(async transactionalEntityManager => {
    if (res.old && bill.data) {
      // 将老的套餐关系过期
      await transactionalEntityManager
        .createQueryBuilder()
        .update(PackageManagement)
        .set({ status: packageManagementStatus.InActive, expireDate: moment().format('YYYY-MM-DD HH:mm:ss') })
        .where('id = :id', { id: res.old.id })
        .execute();
      // 如果archer那边买了套餐，用户控制台再购买，需要把assignee再复制一份
      const assigns = await transactionalEntityManager
        .createQueryBuilder(PackageManagementAssignee, 'packageManagementAssign')
        .where('packageManagementAssign.packageManagementId = :packageManagementId', {
          packageManagementId: res.old.id
        })
        .getMany();
      await Promise.all(assigns.map((assign: PackageManagementAssignee) => transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(PackageManagementAssignee)
        .values([
          {
            packageManagementId: res.new.id,
            email: assign.email,
            name: assign.name,
            role: assign.role
          }
        ])
        .execute()
      ));
    }
    await transactionalEntityManager
      .createQueryBuilder()
      .update(PackageManagement)
      .set({ status: packageManagementStatus.Active, billId: bill.data.id })
      .where('id = :id', { id: res.new.id })
      .execute();
  });
  return bill.data || new Error('Create Bill Fail');
};

export const initialPendingFinanceTransaction = async (companyId: number, uid: number, amount: string, type: number) => {
  const transactionId = generateTransactionId();
  const paymentTransaction = new PaymentTransactions();
  paymentTransaction.operatorId = uid;
  paymentTransaction.companyId = companyId;
  paymentTransaction.transactionId = transactionId;
  paymentTransaction.amount = amount;
  paymentTransaction.type = type;
  paymentTransaction.status = TRANSACTION_STATUS.PENDING;
  await paymentTransaction.save();
  return transactionId;
};

export const createPaymentTransactions = async (companyId: number, operatorId: number, transactionId: string, amount: string, type: number) => {
  const paymentTransactionDB = getManager().getRepository(PaymentTransactions);
  const paymentTransaction = new PaymentTransactions();
  paymentTransaction.operatorId = operatorId;
  paymentTransaction.companyId = companyId;
  paymentTransaction.type = type;
  paymentTransaction.status = TRANSACTION_STATUS.PENDING;
  paymentTransaction.transactionId = transactionId;
  paymentTransaction.amount = amount;
  await paymentTransactionDB.save(paymentTransaction);
};

export const getPendingFinanceTransaction = async (companyId: number, transactionId: string) => {
  const pendingTransaction = await PaymentTransactions.findOne({
    transactionId,
    companyId,
    status: TRANSACTION_STATUS.PENDING
  });
  return pendingTransaction;
};

export const updatePendingFinanceTransaction = async (companyId: number, transactionId: string, status: number) => {
  const pendingTransaction = await PaymentTransactions.findOne({
    transactionId,
    companyId,
    status: TRANSACTION_STATUS.PENDING
  });
  const paymentTransactionDB = getManager().getRepository(PaymentTransactions);

  if (!pendingTransaction) return;
  pendingTransaction.status = status;
  await paymentTransactionDB.save(pendingTransaction);
  return pendingTransaction;
};

export const checkSupportPackgeValid = async (packageId: number) => {
  const packageInfo = await SupportPackage.findOne({
    id: packageId
  });
  return packageInfo && packageInfo.packageStatus === minPackageStatus.Active && packageInfo.isPublic === packagePublic.Public;
};
