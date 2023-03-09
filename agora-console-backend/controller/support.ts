import * as Koa from 'koa';
import { config } from '../config';

import * as SupportService from '../services/support';
import * as _ from 'lodash';

export const getUrl = (ctx: Koa.Context) => {
  ctx.body = `${config.supportBaseUrl}/api/v2/dashboard_login`;
};

export const getSupportPackageByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const area = ctx.state.user.company.area;
  const res = await SupportService.getSupportPackageByCompany(companyId);
  if (!res) {
    const supportPackage = await SupportService.getDefaultSupportPackageByCompany(area);
    const _res = {
      supportPackage: supportPackage
    };
    return ctx.body = _res;
  }
  ctx.body = res;
};

export const getSupportPackageInfo = async (ctx: Koa.Context) => {
  const packageId = ctx.params.packageId;
  const res = await SupportService.getSupportPackageInfo(packageId);
  ctx.body = res;
};

export const getSupportPackageList = async (ctx: Koa.Context) => {
  const area = ctx.state.user.company.area;
  const res = await SupportService.getSupportPackageList(area);
  ctx.body = _.orderBy(res.map((item: any) => {
    item.price = Number(item.priceCNY);
    return item;
  }), ['price'], ['asc']);
};
