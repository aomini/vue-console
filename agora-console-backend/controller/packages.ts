import * as Koa from 'koa';
import * as _ from 'lodash';
import validator from 'validator';

import * as PackageService from '../services/package';
import * as FinanceService from '../externalService/finance';
import { ErrCode } from './apiCodes';
import { ListParams } from '../models/listReply';

export const getMinPackageByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const res = await PackageService.getMinPackageByCompany(companyId);
  ctx.status = 200;
  ctx.body = res;
};

export const getMinPackageList = async (ctx: Koa.Context) => {
  const area = ctx.state.user.company.area;
  const { productType, mediaType, packageIds } = ctx.request.query;
  let packageIdsArray = [];
  packageIds && (packageIdsArray = packageIds.split(','));

  const res = await PackageService.getMinPackageList(area, productType, mediaType, packageIdsArray);
  ctx.body = _.orderBy(res.map((item: any) => {
    item.price = Number(item.priceCNY);
    item.number = 1;
    return item;
  }), ['price'], ['asc']);
};

export const checkVoucher = async (ctx: Koa.Context) => {
  const { voucherCode, packageIds, packageType } = ctx.request.query;
  const companyId = ctx.state.user.companyId;
  const cashInfo = await FinanceService.getCashInfo(ctx.logger, ctx.state.user.companyId);
  const res = await PackageService.checkCompanyVoucher(voucherCode, Number(packageType), packageIds, companyId, cashInfo.accountCurrency, ctx.state.user.company);
  ctx.body = res;
  ctx.status = 200;
};

export const getMarketplacePackageList = async (ctx: Koa.Context) => {
  const area = ctx.state.user.company.area;
  const serviceName = ctx.params.serviceName;
  const { skuType, packageIds } = ctx.request.query;
  let packageIdsArray = [];
  packageIds && (packageIdsArray = packageIds.split(','));

  const res = await PackageService.getMarketplacePackageList(area, serviceName, skuType, packageIdsArray);
  ctx.body = _.orderBy(res.map((item: any) => {
    item.price = Number(item.priceCNY);
    item.number = 0;
    return item;
  }), ['price'], ['asc']);
};

export const getMarketplacePackageInfo = async (ctx: Koa.Context) => {
  const packageId = ctx.params.packageId;
  if (!validator.isInt(packageId)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_MARKETPLACE_PACKAGE, errorMessage: 'packageId not found' };
    return;
  }
  const res = await PackageService.getMarketplacePackageInfo(packageId);
  if (!res || (res.packageStatus !== PackageService.minPackageStatus.Active || res.isPublic !== PackageService.minPackageIsPublic.Public)) {
    ctx.status = 403;
    return;
  }
  ctx.body = res;
};

export const getCompanyProductMarketplacePackage = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId = ctx.state.user.companyId;
  const { fetchAll, limit, page, status } = ctx.request.query;
  const listParams = new ListParams(limit, page, { fetchAll, status });

  const res = await PackageService.getCompanyMarketplacePackages(serviceName, companyId, listParams);
  console.log(res);
  ctx.body = res;
};
