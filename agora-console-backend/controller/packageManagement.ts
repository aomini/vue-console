import * as Koa from 'koa';
import * as moment from 'moment';
// import * as Client from '../utils/request';
import * as GWClient from '../utils/gw-request';
import { config } from '../config';
import { ListParams } from '../models/listReply';
import { User } from '../models/user';
import { encryptPurchaseToken, decryptPurchaseToken } from '../utils/encryptTool';
import * as PackageManagementService from '../services/packageManagement';
import * as PackageService from '../services/package';
import * as FinanceService from '../externalService/finance';
import { ErrCode } from './apiCodes';

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

const getLangValue = (lang, key) => {
  if (!translations[lang]) return key;
  if (!translations[lang][key]) return key;
  return translations[lang][key];
};

const datasToCSV = datas => {
  let str = '';
  for (const item of datas) {
    str += `"${item.join('","')}"`;
    str += '\r\n';
  }
  return str;
};

export const checkPackagesValid = (packages) => {
  packages.forEach(item => item.num = parseFloat(item.num));
  const invalidPackages = packages.filter(item => (item.num < 1 || item.num !== Math.floor(item.num)));
  return invalidPackages.length > 0 ? false : true;
};

export const getPackageManagementList = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const { limit, page, startDate, endDate } = ctx.query;
  const params = new ListParams(limit, page, { startDate, endDate });
  const res = await PackageManagementService.getPackageManagementList(companyId, params);
  ctx.body = res;
};

export const packageManagementBillDownload = async (ctx: Koa.Context) => {
  const { billId } = ctx.params;
  const client = GWClient.gw_create(ctx.logger);
  const res = await client({
    method: 'get',
    responseType: 'stream',
    url: `${config.backendBaseUrl}/bss-bill/v2/download/once-bills/${billId}`
  });
  ctx.body = res.data;
  ctx.set('content-type', res.headers['content-type']);
  ctx.set('content-disposition', res.headers['content-disposition']);
};

export const packageManagementBillExport = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const { limit = 10, page = 1, startDate, endDate } = ctx.query;
  const params = new ListParams(limit, page, { startDate, endDate });
  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  const ret = await PackageManagementService.getPackageManagementAll(companyId, params);
  const filename = startDate && endDate ? `Billings ${startDate}-${endDate}.csv` : 'Billings.csv';
  const datas = [
    [
      getLangValue(user.locale, 'IssueDate'),
      getLangValue(user.locale, 'BillingPeriod'),
      getLangValue(user.locale, 'DueDate'),
      getLangValue(user.locale, 'Amount'),
      getLangValue(user.locale, 'BillingStatus')
    ]
  ];

  for (const item of ret) {
    datas.push([
      moment(item.effectiveDate).format('YYYY-MM-DD'),
      moment(item.effectiveDate).format('YYYY-MM'),
      moment(item.effectiveDate).format('YYYY-MM-DD'),
      cashInfo.accountCurrency === 'USD' ? `$${Number(item.amount).toFixed(2)}` : `￥${Number(item.amount).toFixed(2)}`,
      item.billId
        ? getLangValue(user.locale, 'Payed')
        : getLangValue(user.locale, 'UnPayed')
    ]);
  }
  ctx.set('content-type', 'application/octet-stream');
  ctx.set('Content-disposition', `attachment; filename=${filename}`);
  ctx.body = `\ufeff${datasToCSV(datas)}`;
};

/*
 整理每种套餐包的预购买总数，如果套餐包有购买限额，则：
 查询套餐包的已购买总数，与预购买总数相加得到预估总数，然后与套餐包限额进行对比。
 因为 formatPackages 是一个数组，虽然每个元素都传了预购买数量 num，但还是要遍历数组累加一遍 num，防止多买。
 */
export async function exceedMaxQuantity(companyId: number, formatPackages: any[]) {
  const packagePurchaseSum = {};
  formatPackages.map(formatPackage => {
    if (packagePurchaseSum[`${formatPackage.id}`] >= 0) {
      packagePurchaseSum[`${formatPackage.id}`].sum += formatPackage.num;
    } else {
      packagePurchaseSum[`${formatPackage.id}`] = { sum: formatPackage.num, maxQuantity: formatPackage.maxQuantity };
    }
  });
  for (const packageId in packagePurchaseSum) {
    const v = packagePurchaseSum[packageId];
    if (v.maxQuantity && v.maxQuantity >= 1) {
      const count = await FinanceService.countPackagePurchaseCount(companyId, Number(packageId));
      if (Number(count) + v.sum > v.maxQuantity) {
        return true;
      }
    }
  }
  return false;
}

export const createMinPackageManagement = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  const { packages, voucherCode } = ctx.request.body;

  if (voucherCode) {
    const voucherCheck = await PackageService.checkCompanyVoucher(
      voucherCode,
      PackageService.VoucherPackageType.Usage,
      PackageService.getPackageIds(packages),
      user.companyId,
      cashInfo.accountCurrency,
      user.company
    );
    if (!voucherCheck.allow) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
      return;
    }
  }
  const formatPackages = await PackageService.formatMinPackageIncludeVoucher(
    voucherCode,
    PackageService.packageManagementType.MinPackage,
    packages
  );

  if (await exceedMaxQuantity(user.company.id, formatPackages)) {
    ctx.status = 401;
    ctx.body = { code: ErrCode.PACKAGE_EXCEED_MAX_QUANTITY };
    return;
  }

  if (!checkPackagesValid(packages)) {
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
  ctx.body = encryptPurchaseToken(transactionId.toString());
  ctx.status = 200;
};

export const createMarketplacePackageManagement = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const cashInfo: any = await FinanceService.getCashInfo(ctx.logger, user.companyId);
  const { packages, voucherCode } = ctx.request.body;

  if (voucherCode) {
    const voucherCheck = await PackageService.checkCompanyVoucher(voucherCode, PackageService.VoucherPackageType.MarketPlace, PackageService.getPackageIds(packages), user.companyId, cashInfo.accountCurrency, user.company);
    if (!voucherCheck.allow) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VOUCHER_INVALID_ERROR };
      return;
    }
  }
  if (!checkPackagesValid(packages)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MONEY_CHECK_ERROR };
    return;
  }

  const formatPackage = await PackageService.formatMinPackageIncludeVoucher(voucherCode, PackageService.packageManagementType.Marketplace, packages);
  const transactionId = await FinanceService.createMarketplacePackageManagement({
    companyId: user.company.id,
    currency: cashInfo.accountCurrency,
    createdBy: user.email ? user.email : `${user.company.id}@agora.io`,
    packages: formatPackage
  });
  const token = encryptPurchaseToken(transactionId.toString());
  ctx.body = token;
  ctx.status = 200;
};

export const checkPaymentByTransationId = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const transactionId = decryptPurchaseToken(ctx.query.transactionId);
  const res = await PackageManagementService.getMarketplacePackageManagementByTransactionId(companyId, transactionId);
  ctx.status = 200;
  ctx.body = res;
};
