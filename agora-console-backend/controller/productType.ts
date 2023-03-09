import * as Koa from 'koa';
import { donsoleProxyForSession } from '../externalService/DonsoleProxy';
import { ssoProxyForSession } from '../externalService/SSOProxy';
import { getActivedExtensionList, getExtensionTypeList, getFullExtensionData } from '../services/projectExtension';
import { config } from '../config';
import { ExtensionStatus } from '../dataModel/ExtensionModels';

export const getProductTypeList = async (ctx: Koa.Context) => {
  const area = ctx.state.user?.company.area;
  const productTypeList = await donsoleProxyForSession(ctx.logger).getActiveProductList(area);
  productTypeList.forEach(product => {
    product.ssoSource = product.ssoSource ? JSON.parse(product.ssoSource) : undefined;
  });

  ctx.status = 200;
  ctx.body = productTypeList;
};

export const getRegistSource = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const result = await ssoProxyForSession(ctx.logger).getTrackData(companyId);
  ctx.status = 200;
  ctx.body = result;
};

export const getExtensionMetadata = async (ctx: Koa.Context) => {
  const area = ctx.state.user?.company.area;
  const status = config.isPreprod ? ExtensionStatus.PreProd : ExtensionStatus.Active;
  const extensionList = await getActivedExtensionList(area, status);
  const extensionTypeList = await getExtensionTypeList();
  const result = getFullExtensionData(extensionList, extensionTypeList, area, status);
  ctx.status = 200;
  ctx.body = result;
};
