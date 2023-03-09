import * as Koa from 'koa';

import * as PackageService from '../services/package';
import * as DocService from '../externalService/docApi';
import * as _ from 'lodash';
import { ErrCode } from './apiCodes';
import { config } from '../config';
import * as Client from '../utils/gw-request';
import { paasProxyForSession, getUsage as UsageGet } from '../externalService/PaasProxy';

const UrlKeys = ['productDetailCnUrl', 'productDetailEnUrl', 'priceDetailCnUrl', 'priceDetailEnUrl', 'guideCnUrl', 'guideEnUrl', 'apiEnUrl', 'apiCnUrl'];

export const getVendorDocUrlByUrl = (url: string) => {
  const reg = /[^(?:http:\/\/|www\.|https:\/\/)]([^\/]+)/;
  const domains = url.match(reg);
  const domain = `https://${domains.length > 0 ? domains[0] : 'docs.agora.io'}`;
  const arr = url.split('/');
  const index = arr[arr.length - 1];
  const path = `${domain}/api/articles/cn/${index}`;

  return path;
};

export const formatParams = (params) => {
  if (params) {
    try {
      const tmpParams = JSON.parse(params).params;
      return tmpParams.filter(param => param.type !== 'object' && param.showConsole);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
  return undefined;
};

const getParamItemValue = (providerParam, formParams, projectId) => {
  let formItemValue = undefined;
  const formItem = formParams.find((item: any) => {
    return item.name === providerParam.name;
  });
  if (formItem) {
    formItemValue = formItem.value;
  }
  if (providerParam.name === 'projectId') {
    return projectId;
  }
  if (providerParam.defaultValue && !formItemValue) {
    const defaultValue = _.isFinite(Number(providerParam.defaultValue))
    ? Number(providerParam.defaultValue)
    : providerParam.defaultValue;
    return providerParam.type === 'array' ? [defaultValue] : defaultValue;
  } else if (formItemValue) {
    formItemValue = _.isFinite(Number(formItemValue)) ? Number(formItemValue) : formItemValue;
    return providerParam.type === 'array' ? [formItemValue] : formItemValue;
  } else if (providerParam.required || providerParam.type === 'string') {
    if (providerParam.type === 'int') {
      return 0;
    } else if (providerParam.type === 'string') {
      return '';
    } else if (providerParam.type === 'bool') {
      return false;
    } else if (providerParam.type === 'array') {
      return [];
    } else {
      return {};
    }
  }
};

const searchAndSetKey = (res, key, parentKey, value) => {
  if (!parentKey) {
    res[key] = value;
    return res;
  }
  for (const i in res) {
    if (parentKey in res) {
      res[parentKey][key] = value;
      return res;
    }
    if (typeof res[i] === 'object') {
      return this.searchAndSetKey(res[i], key, parentKey, value);
    }
  }
};

const deep = (providerParam, formParams, providerParams, res, projectId) => {
  const value = getParamItemValue(providerParam, formParams, projectId);
  res = searchAndSetKey(res, providerParam.name, providerParam.parentKey, value);
  const childs = _.filter(providerParams, (param) => {
    return param.parentKey === providerParam.name;
  });
  childs.forEach((child: any) => {
    res = deep(child, formParams, providerParams, res, projectId);
  });
  return res;
};

export const buildParam = (formParams, providerParams, projectId) => {
  let res = {};
  if (!providerParams) return undefined;
  providerParams.filter(item => !item.parentKey).forEach(providerParam => {
    res = deep(providerParam, formParams, providerParams, res, projectId);
  });
  return res;
};
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

export const getAppSecret = async (ctx: Koa.Context) => {
  const client = Client.paas_gw_create(ctx.logger);
  const { appId, serviceName } = ctx.params;
  const ret = await client.get(`${config.paasApi.urlBase}/api-open/v1/appId/${appId}/serviceName/${serviceName}/secret`);
  ctx.body = ret.data;
};

export const createAppSecret = async (ctx: Koa.Context) => {
  const client = Client.paas_gw_create(ctx.logger);
  const { appId, serviceName } = ctx.params;
  const { accountId, email } = ctx.state.user;
  const { appKey, appSecret, vid } = ctx.request.body;
  await client.post(`${config.paasApi.urlBase}/api-open/v1/secret`, {
    appId: appId,
    accountId: accountId,
    serviceName: serviceName,
    email: email,
    appKey: appKey,
    appSecret: appSecret,
    vid: vid
  });
  ctx.body = {
    status: 'success'
  };
};

export const getPlanList = async (ctx: Koa.Context) => {
  const client = Client.paas_gw_create(ctx.logger);
  const { serviceName } = ctx.params;
  const ret = await client.get(`${config.paasApi.urlBase}/api-open/v1/serviceName/${serviceName}/plan/list`);
  ctx.body = ret.data;
};

export const getVendorList = async (ctx: Koa.Context) => {
  const area = ctx.state.user.company.area;
  const { isFeatured, category, serviceName, needDoc } = ctx.request.query;
  const res = await paasProxyForSession(ctx.logger).getVendorList(area, isFeatured, category, serviceName, needDoc);
  ctx.body = res;
};

export const getExtensionInfo = async (ctx: Koa.Context) => {
  const { companyId } = ctx.state.user;
  const { serviceName } = ctx.params;
  const res = await paasProxyForSession(ctx.logger).getExtensionInfo(companyId, serviceName);
  ctx.body = res;
};

export const getExtensionList = async (ctx: Koa.Context) => {
  const { companyId } = ctx.state.user;
  const { status, serviceName } = ctx.request.query;
  const res = await paasProxyForSession(ctx.logger).getExtensionList(companyId, status, serviceName);
  ctx.body = res;
};

export const updateExtensionInfo = async (ctx: Koa.Context) => {
  const { companyId } = ctx.state.user;
  const { status, planId } = ctx.request.body;
  const { serviceName } = ctx.params;
  const res = await paasProxyForSession(ctx.logger).updateExtensionInfo(planId, companyId, status, serviceName);
  ctx.body = res;
};
export const getVendorInfo = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const { needDoc } = ctx.request.query;
  const area = ctx.state.user.company.area;
  const res = await paasProxyForSession(ctx.logger).getVendorInfo(serviceName, area);
  if (res) {
    res.params = formatParams(res.params);
    res.projectCreateParam = formatParams(res.projectCreateParam);
    res.projectDeleteParam = formatParams(res.projectDeleteParam);

    const needRequestDoc = [];
    if (needDoc) {
      for (const key of UrlKeys) {
        if (res[key]) {
          if (res[key].indexOf('agora.io') === -1 && res[key].indexOf('.agoralab.co') === -1) {
            res[`${key}Content`] = `<a href=\"${res[key]}\" target=\"_blank\">请点击链接查看</a>`;
          } else {
            const url = getVendorDocUrlByUrl(res[key]);
            needRequestDoc.push({ key: key, url: url });
          }
        }
      }

      await Promise.all(
        needRequestDoc.map(async item => {
          try {
            res[`${item.key}Content`] = await DocService.getDocArticleContent(ctx.logger, item.url);
          } catch (error) {
            console.log(error);
          }
        })
      );
    }
  }
  ctx.body = res;
};

export const getCompanyPurchased = async (ctx: Koa.Context) => {
  const companyId: number = ctx.state.user.companyId;
  const area = ctx.state.user.company.area;
  const packages = await PackageService.getCompanyMarketPackageDistinct(companyId);
  const serviceNames = packages.map((item: any) => {
    return item.service_name;
  });
  if (!serviceNames) {
    ctx.body = { rows: [] };
    return;
  }
  const res = { rows: [] };
  for (let i = 0; i < serviceNames.length; i++) {
    res.rows[i] = (await paasProxyForSession(ctx.logger).getVendorList(area, undefined, undefined, serviceNames[i]))?.data?.[0];
  }
  ctx.body = res;
};

export const getCompanyProductProjects = async (ctx: Koa.Context) => {
  const companyId: number = ctx.state.user.companyId;
  const serviceName = ctx.params.serviceName;
  const res = await paasProxyForSession(ctx.logger).getCompanyProductProjects(serviceName, companyId);
  ctx.body = res;
};

export const getCompanyServicePackage = async (ctx: Koa.Context) => {
  const companyId: number = ctx.state.user.companyId;
  const serviceName = ctx.params.serviceName;
  const res = await PackageService.getCompanyServiceMarketPackage(companyId, serviceName);
  ctx.body = res;
};

export const launchExtension = async (ctx: Koa.Context) => {
  const { companyId, accountId } = ctx.state.user;
  const { serviceName } = ctx.params;
  const { planId } = ctx.request.body;
  const res = await paasProxyForSession(ctx.logger).activateExtension(companyId, accountId, planId, serviceName);
  ctx.body = res;
};

export const createCustomer = async (ctx: Koa.Context) => {
  const { accountId, phoneNumber, email, firstName, lastName, companyId } = ctx.state.user;
  const { serviceName } = ctx.params;
  const { planId } = ctx.request.body;
  const res = await paasProxyForSession(ctx.logger).createCustomer(accountId, planId, serviceName, phoneNumber, email, firstName + lastName, companyId);
  ctx.body = res;
};

export const deleteCustomer = async (ctx: Koa.Context) => {
  const { serviceName } = ctx.params;
  const { accountId } = ctx.state.user;
  const res = await paasProxyForSession(ctx.logger).deleteCustomer(accountId, serviceName);
  ctx.body = res;
};

export const activatedLicense = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId = ctx.state.user.companyId;
  const companyName = ctx.state.user.company.companyName;
  const email = ctx.state.user.email;
  const phone = ctx.state.user.phoneNumber;
  const params = ctx.request.body;
  ctx.body = await paasProxyForSession(ctx.logger).activatedLicense(serviceName, companyId, companyName, phone, email, params);
};
export const getLicenseList = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId = ctx.state.user.companyId;
  ctx.body = await paasProxyForSession(ctx.logger).getLicenseList(serviceName, companyId);
};

export const getUsage = async (ctx: Koa.Context) => {
  const fromTs = ctx.request.query.fromTs;
  const endTs = ctx.request.query.endTs;
  const billingItemId = ctx.request.query.billingItemId;
  const vid = ctx.request.query.vid;
  ctx.body = await UsageGet(ctx.logger, vid, billingItemId, fromTs, endTs);
};

export const launchProjectService = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId: number = ctx.state.user.companyId;
  const accountId = ctx.state.user.accountId;
  const email = ctx.state.user.email;
  const params = ctx.request.body;
  const projectId = params.projectId;

  const vendorInfo = await paasProxyForSession(ctx.logger).getVendorInfo(serviceName, ctx.state.user.company.area);
  if (!vendorInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.VENDOR_NOT_FOUND };
    return;
  }
  const providerParams = vendorInfo.params ? JSON.parse(vendorInfo.params) : undefined;
  const createParams = vendorInfo.createParams ? JSON.parse(vendorInfo.createParams).params : undefined;
  const deleteParams = vendorInfo.deleteParams ? JSON.parse(vendorInfo.deleteParams).params : undefined;

  params.params = buildParam(params.params, providerParams, projectId);
  params.createParams = buildParam(params.createParams, createParams, projectId);
  params.deleteParams = buildParam(params.deleteParams, deleteParams, projectId);
  if (vendorInfo.keyFiled) {
    params['keyFiled'] = JSON.stringify({ key_field: vendorInfo.keyFiled.split(',') });
  }
  ctx.body = await paasProxyForSession(ctx.logger).postProjectService(serviceName, companyId, params, email, accountId);
};

export const launchProjectServiceV2 = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId: number = ctx.state.user.companyId;
  const accountId = ctx.state.user.accountId;
  const email = ctx.state.user.email;
  const phone = ctx.state.user.phoneNumber;
  const params = ctx.request.body;
  const type = params.type || 1;
  const vendorInfo = await paasProxyForSession(ctx.logger).getVendorInfo(serviceName, ctx.state.user.company.area);
  if (!vendorInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.VENDOR_NOT_FOUND };
    return;
  }
  ctx.body = await paasProxyForSession(ctx.logger).postProjectServiceV2(serviceName, companyId, params, email, accountId, email, phone, type);
};

export const launchProjectSDKDeliver = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId = ctx.state.user.companyId;
  const accountId = ctx.state.user.accountId;
  const email = ctx.state.user.email;
  const params = ctx.request.body;
  ctx.body = await paasProxyForSession(ctx.logger).postProjectSDKDeliverService(serviceName, companyId, params, email, accountId);
};

export const closeProjectSDKDeliver = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId = ctx.state.user.companyId;
  const email = ctx.state.user.email;
  const params = ctx.request.body;
  ctx.body = await paasProxyForSession(ctx.logger).closeProjectSDKDeliverService(serviceName, companyId, params, email);
};

export const closeProjectService = async (ctx: Koa.Context) => {
  const serviceName = ctx.params.serviceName;
  const companyId: number = ctx.state.user.companyId;
  const accountId = ctx.state.user.accountId;
  const email = ctx.state.user.email;
  const params = ctx.request.body;
  const projectId = params.projectId;
  const appId = params.appId;

  const vendorInfo = await paasProxyForSession(ctx.logger).getVendorInfo(serviceName, ctx.state.user.company.area);
  if (!vendorInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.VENDOR_NOT_FOUND };
    return;
  }
  const deleteParams = vendorInfo.deleteParams ? JSON.parse(vendorInfo.deleteParams).params : undefined;
  params.deleteParams = buildParam(params.deleteParams, deleteParams, projectId);
  const res = await paasProxyForSession(ctx.logger).deleteProjectService(appId, serviceName, companyId, projectId, params, email, accountId);
  ctx.body = res;
};

export const getVendorApplyList = async (ctx: Koa.Context) => {
  const companyId: number = ctx.state.user.companyId;
  const { page, limit } = ctx.request.query;
  const res = await paasProxyForSession(ctx.logger).getVendorApplyList(companyId, Number(limit), Number(page));
  ctx.body = res;
};

export const createVendorApply = async (ctx: Koa.Context) => {
  const data = ctx.request.body;
  const companyId: number = ctx.state.user.companyId;
  data['companyId'] = companyId;
  const res = await paasProxyForSession(ctx.logger).createVendorApply(companyId, data);
  ctx.body = res;
};

export const getVendorApplyInfo = async (ctx: Koa.Context) => {
  const companyId: number = ctx.state.user.companyId;
  const { id } = ctx.params;
  const res = await paasProxyForSession(ctx.logger).getVendorApplyInfo(companyId, id);
  ctx.body = res;
};

export const updateVendorApply = async (ctx: Koa.Context) => {
  const { id } = ctx.params;
  const data = ctx.request.body;
  const companyId: number = ctx.state.user.companyId;
  const res = await paasProxyForSession(ctx.logger).updateVendorApply(id, companyId, data);
  ctx.body = res;
};

export const getNoticeInfo = async (ctx: Koa.Context) => {
  const res = await paasProxyForSession(ctx.logger).getNoticeInfo(ctx.request.query.area || 2);
  ctx.body = res;
};
