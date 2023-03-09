import * as Koa from 'koa';
import { ErrCode } from './apiCodes';
import { processError } from '../utils/error';
import { licenseProxyForSession } from '../externalService/LicenseProxy';
import * as ProjectService from '../services/project';
import {
  CompanyProductLicenseQuotaResponse,
  LicenseAggregate,
  LicenseConfig,
  LicenseProduct, LicenseProductList,
  LicenseProductTotalUsage,
  LicenseVendorInfo
} from '../dataModel/licenseModels';
import * as moment from 'moment';
import { ListParams } from '../models/listReply';

export const getCompanyLicenseConfig = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const config = await licenseProxyForSession(ctx.logger).getCompanyConfig(companyId) as LicenseConfig;
    ctx.body = {
      querySwitch: config ? config.querySwitch : 0,
      allowAllocate: config ? config.allowAllocate : 0
    };
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_LICENSE_USAGE };
  }
};

export const getCompanyLicenseUsage = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const productUsageData: { [key: string]: LicenseProductTotalUsage } = {};
    const productData = await licenseProxyForSession(ctx.logger).getCompanyProduct(companyId);
    await Promise.all(LicenseProductList.map(async licenseProductKey => {
      const [productAggregateData, productUsageList] = await Promise.all([licenseProxyForSession(ctx.logger).getCompanyLicenseAggregate(companyId, Number(LicenseProduct[licenseProductKey])) as Promise<LicenseAggregate>, licenseProxyForSession(ctx.logger).getCompanyPidUsage(companyId, { product:  Number(LicenseProduct[licenseProductKey]) })]);
      productUsageList.forEach(item => {
        const productSku = productData.find(pitem => pitem.id === item.pid);
        item.productSku = productSku;
      });
      productUsageData[licenseProductKey] = {
        product: licenseProductKey,
        total: productAggregateData.total,
        actives: productAggregateData.actives,
        unActives: productAggregateData.unActives,
        expires: productAggregateData.expires,
        allocate: productAggregateData.allocate,
        unAllocate: productAggregateData.unAllocate,
        inThirtyDays: productAggregateData.inThirtyDays,
        pidList: productUsageList
      };
    }));
    ctx.body = productUsageData;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_LICENSE_USAGE };
  }
};

export const getCompanyApplyOrderHistory = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const { page, limit } = ctx.request.query;
    const ret = await licenseProxyForSession(ctx.logger).getCompanyOrderHistory(companyId, page, limit);
    const historyList = ret.list.filter(item => item.pid);
    ctx.body = {
      total: ret.count,
      list: historyList
    };
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_LICENSE_ORDER };
  }
};

export const getCompanyRenewOrderHistory = async (ctx: Koa.Context) => {
  try {
    const { pid, page, limit } = ctx.request.query;
    const ret = await licenseProxyForSession(ctx.logger).getLicenseRenewHistory(pid, page, limit);
    console.info(ret);
    const historyList = ret.list.filter(item => item.renewId);
    ctx.body = {
      list: historyList
    };
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_LICENSE_ORDER };
  }
};

export const exportCompanyLicenseInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const today = moment().format('YYYY-MM-DD');
  const filename = `license_${today}_${companyId}.csv`;
  const ret = await licenseProxyForSession(ctx.logger).exportCompanyLicenseInfo(companyId);
  ctx.set('Content-disposition', `attachment; filename=${filename}`);
  ctx.body = ret;
};

export const getCompanyProductLicenseQuota = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const page = Math.max(ctx.request.query.page || 1, 0); // 确保 page > 0

    const pidUsageList = await licenseProxyForSession(ctx.logger).getCompanyPidUsage(companyId, { pid: ctx.params.pid });
    if (pidUsageList.length === 0) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_GET_LICENSE_USAGE };
      return;
    }
    const pidUsage = pidUsageList[0];

    const params = new ListParams(10, page, { companyId });
    const projects = await ProjectService.getProjectsByCompany(params);
    const vendorList: LicenseVendorInfo[] = projects.items.map((item) => ({
      id: item.id,
      name: item.name,
      unActiveCount: 0
    }));

    // 将配额信息通过 projectName 同步到 vendorList
    for (const item of pidUsage.vidStocks.filter(item => Reflect.has(item, 'projectName'))) {
      const vendor = vendorList.find(x => x.name === item.projectName);
      if (!vendor) continue;
      vendor.unActiveCount = item.unActives;
    }

    ctx.body = {
      // 实际可用配额 = product的 未配额 license - 未配额中已激活的 license
      unAllocate: pidUsage.unAllocate - pidUsage.vidStocks.filter((x) => !Reflect.has(x, 'projectName')).reduce((sum, item) => sum + item.actives, 0),
      vendorList,
      vendorCount: projects.total
    } as CompanyProductLicenseQuotaResponse;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_LICENSE_USAGE };
  }
};

export const postLicenseQuota = async (ctx: Koa.Context) => {
  const { vid, pid, count } = ctx.request.body;
  try {
    await licenseProxyForSession(ctx.logger).postLicenseQuota({ vid, pid, count, creator: ctx.session.email });
    ctx.status = 200;
  } catch (e) {
    const error = processError(e);
    ctx.logger.error(error);
    ctx.status = 500;
    ctx.body = { message: error ? JSON.parse(error).message : '' };
  }
};
