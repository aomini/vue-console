import * as Koa from 'koa';
import * as _ from 'lodash';

import * as PackageService from '../services/package';

export const getMarketplacePackageList = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const { skuType, packageIds } = ctx.request.query;
  const area = 'CN';
  let packageIdsArray = [];
  packageIds && (packageIdsArray = packageIds.split(','));

  const res = await PackageService.getMarketplacePackageList(area, serviceName, skuType, packageIdsArray);
  ctx.body = _.orderBy(res.map((item: any) => {
    item.price = Number(item.priceCNY);
    item.number = 0;
    return item;
  }), ['price'], ['asc']);
};
