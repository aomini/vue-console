import { Logger } from 'log4js';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { LicenseApi } from '../config/config';
import { LicensePidUsage, LicenseQuotaParams } from 'src/dataModel/licenseModels';

const prefix = '/v1/console';
const APIData = {
  CompanyConfigGet: {
    method: 'GET',
    route: `${prefix}/config/company`,
    description: '获取 cid 配置信息'
  },
  CompanyProductsGet: {
    method: 'GET',
    route: `${prefix}/config/company/products`,
    description: '获取 cid 下产品信息'
  },
  CompanyLicenseAggregateGet: {
    method: 'GET',
    route: `${prefix}/aggregate/company`,
    description: '获取 cid license 数量'
  },
  CompanyPidUsageGet: {
    method: 'GET',
    route: `${prefix}/usage/company/pid`,
    description: '获取 cid 下 Pid license 使用情况'
  },
  CompanyOrderHistoryGet: {
    method: 'GET',
    route: `${prefix}/config/order/history`,
    description: 'License 购买历史'
  },
  LicenseApplyOrderGet: {
    method: 'GET',
    route: `${prefix}/apply/orders`,
    description: 'License 申请订单查询'
  },
  LicenseRenewOrderGet: {
    method: 'GET',
    route: `${prefix}/renew/pid/orders`,
    description: 'License 续期订单查询'
  },
  CompanyLicenseInfoExport: {
    method: 'GET',
    route: `${prefix}/info/export`,
    description: '导出 License 明细'
  },
  LicenseQuotaPost: {
    method: 'POST',
    route: `/v2/allocate`,
    description: '提交 License 配额'
  }
};

export class LicenseProxy extends ServiceProxy<LicenseApi> {

  constructor(config: LicenseApi, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
  }

  protected makeRequest(commonApi: CommonAPI, params = {}, queryParams = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.urlBase)
      .addHeader('agora-service-key', this._config.agoraServiceKey)
      .setApiOptions(commonApi)
      .setTimeout(1000 * 30);
    if (commonApi.method === 'GET') {
      request.setQueryParams({ ...params, ...queryParams });
    } else {
      request.setQueryParams(queryParams);
      request.setBodyData(params);
    }
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}, queryParams = {}) {
    const request = this.makeRequest(commonAPI, params, queryParams);
    return request.quickSend();
  }

  public async getCompanyConfig(cid: number) {
    const commonApi = new CommonAPI(APIData.CompanyConfigGet);
    const ret = await this._request(commonApi, { cid });
    return ret.data;
  }

  public async getCompanyProduct(cid: number) {
    const commonApi = new CommonAPI(APIData.CompanyProductsGet);
    const ret = await this._request(commonApi, { cid });
    return ret.data;
  }

  public async getCompanyLicenseAggregate(cid: number, product?: number, pid?: string) {
    const commonApi = new CommonAPI(APIData.CompanyLicenseAggregateGet);
    const ret = await this._request(commonApi, { cid, pid, product });
    return ret.data;
  }

  public async getCompanyPidUsage(cid: number, extra: { product?: number, pid?: number}) {
    const commonApi = new CommonAPI(APIData.CompanyPidUsageGet);
    const ret = await this._request(commonApi, { cid, ...extra });
    return ret.data as LicensePidUsage[];
  }

  public async getCompanyOrderHistory(cid: number, page?: number, size?: number) {
    const commonApi = new CommonAPI(APIData.CompanyOrderHistoryGet);
    const ret = await this._request(commonApi, { cid, page, size });
    return ret.data;
  }

  public async getLicenseRenewHistory(pid: number, page?: number, size?: number) {
    const commonApi = new CommonAPI(APIData.LicenseRenewOrderGet);
    const ret = await this._request(commonApi, { pid, page, size });
    return ret.data;
  }

  public async exportCompanyLicenseInfo(cid: number) {
    const commonApi = new CommonAPI(APIData.CompanyLicenseInfoExport);
    const ret = await this._request(commonApi, { cid });
    return ret;
  }

  public async postLicenseQuota(params: LicenseQuotaParams) {
    const commonApi = new CommonAPI(APIData.LicenseQuotaPost);
    const ret = await this._request(commonApi, {
      pid: params.pid,
      count: params.count,
      creator: params.creator
    }, { vid: params.vid });
    return ret;
  }
}

export const licenseProxy = new LicenseProxy(config.License, ConsoleRequestFollower);

export const licenseProxyForSession = (log: Logger) => {
  return licenseProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
