import { Logger } from 'log4js';
import * as Client from '../utils/gw-request';
import { config } from '../config';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { ProviderStatus } from '../dataModel/PaasModels';

export enum vendorAvailableTo {
  CN = 1,
  ROW = 2
}

export interface PaasConfig {
  urlBase: string;
  appid: string;
  appSecret: string;
  showPreProd?: boolean;
}

const APIData = {
  VendorListGet: {
    method: 'GET',
    route: '/api-open/v1/vendor/list',
    description: '获取插件服务列表'
  },
  VendorCreate: {
    method: 'POST',
    route: '/api-open/v1/vendor',
    description: '创建第三方服务商'
  },
  ExtensionInfoGet: {
    method: 'GET',
    route: '/api-open/v1/extension',
    description: '获取海外服务商信息'
  },
  ExtensionListGet: {
    method: 'GET',
    route: '/api-open/v1/extension/list',
    description: '获取海外服务商列表'
  },
  ExtensionActivated: {
    method: 'POST',
    route: '/api-open/v1/extension',
    description: '激活海外第三方服务'
  },
  CustomerCreate: {
    method: 'POST',
    route: '/api-open/v1/serviceName/:serviceName/companyId/:companyId/customer',
    description: '创建账户'
  },
  CustomerDelete: {
    method: 'DELETE',
    route: '/api-open/v1/serviceName/:serviceName/customerId/:customerId/customer',
    description: '删除账户'
  },
  ExtensionInfoUpdate: {
    method: 'PUT',
    route: '/api-open/v1/extension',
    description: '更新海外服务商状态信息'
  },
  ProjectServiceStatusGet: {
    method: 'GET',
    route: '/api-open/v1/company/:companyId/:serviceName/projects',
    description: '获取第三方服务在项目中的激活情况'
  },
  ActivatedLicense: {
    method: 'POST',
    route: '/api-open/v1/license/activate',
    description: '通知第三方服务商激活 license'
  },
  LicenseListGet: {
    method: 'GET',
    route: '/api-open/v1/license/list',
    description: '获取 license 列表'
  },
  ProjectLaunch: {
    method: 'POST',
    route: '/api-open/v1/:serviceName/project',
    description: '项目激活服务'
  },
  ProjectLaunchV2: {
    method: 'POST',
    route: '/api-open/v2/:serviceName/project',
    description: '项目激活服务 V2'
  },
  ProjectClose: {
    method: 'PUT',
    route: '/api-open/v1/:serviceName/project',
    description: '项目关闭服务'
  },
  VendorApplyListGet: {
    method: 'GET',
    route: '/api-open/v1/vendor/apply/list',
    description: '获取厂商申请列表'
  },
  VendorApplyInfoGet: {
    method: 'GET',
    route: '/api-open/v1/vendor/apply/:id',
    description: '获取厂商申请信息'
  },
  VendorApply: {
    method: 'POST',
    route: '/api-open/v1/vendor/apply',
    description: '提交厂商申请信息'
  },
  UpdateVendorApply: {
    method: 'PUT',
    route: '/api-open/v1/vendor/apply/:id',
    description: '修改厂商申请信息'
  },
  SDKDeliverProjectLaunch: {
    method: 'POST',
    route: '/api-open/v1/sdk-deliver/:serviceName/project',
    description: '自研插件配置下发类项目激活服务'
  },
  SDKDeliverProjectClose: {
    method: 'PUT',
    route: '/api-open/v1/sdk-deliver/:serviceName/project',
    description: '自研插件配置下发类项目关闭服务'
  },
  NoticeInfoGet: {
    method: 'GET',
    route: '/api-open/v1/extension/notice',
    description: '获取云市场通知横幅'
  }
};

export class PaasProxy extends ServiceProxy<PaasConfig> {
  private readonly _authorization: string;

  constructor(config: PaasConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = Buffer.from(`${config.appid}:${config.appSecret}`).toString('base64');
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.urlBase)
      .addHeader('Authorization', this._authorization)
      .setApiOptions(commonApi)
      .setTimeout(15000);
    this.onRequestMade(request);
    if (commonApi.method === 'GET') {
      request.setQueryParams(params);
    } else if (commonApi.method === 'POST' || commonApi.method === 'PUT') {
      request.setBodyData(params);
    }
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}) {
    const request = this.makeRequest(commonAPI, params);
    return request.quickSend();
  }

  public async getVendorList(area = undefined, isFeatured = undefined, category = undefined, serviceName, needDoc = undefined) {
    const availableTo = area === 'CN' ? vendorAvailableTo.CN : vendorAvailableTo.ROW;
    const status = this._config.showPreProd ? ProviderStatus.PreProd : ProviderStatus.Public;
    const commonApi = new CommonAPI(APIData.VendorListGet);
    const ret = await this._request(commonApi, { availableTo, isFeatured, category, serviceName, status, needDoc });
    return ret;
  }

  public async getVendorInfo(serviceName: string, area: string) {
    const ret = await this.getVendorList(area, undefined, undefined, serviceName);
    return ret.data[0];
  }

  public async getExtensionInfo(companyId: number, serviceName: string) {
    const commonApi = new CommonAPI(APIData.ExtensionInfoGet);
    return (this._request(commonApi, { companyId, serviceName }));
  }

  public async getExtensionList(companyId: number, status: number, serviceName: string) {
    if (Number(status) === ProviderStatus.Public) {
      status = this._config.showPreProd ? ProviderStatus.PreProd : ProviderStatus.Public;
    }
    const commonApi = new CommonAPI(APIData.ExtensionListGet);
    return (this._request(commonApi, { companyId, status, serviceName }));
  }

  public async activateExtension(companyId: string, accountId: string, planId: string, serviceName: string) {
    const commonApi = new CommonAPI(APIData.ExtensionActivated);
    return (this._request(commonApi, { companyId, accountId, planId, serviceName }));
  }

  public async createCustomer(customerId, planId, serviceName, customerPhone, customerEmail, customerName, companyId) {
    const commonApi = new CommonAPI(APIData.CustomerCreate, serviceName, companyId);
    return (this._request(commonApi, { planId, customerId, customerPhone, customerEmail, customerName }));
  }

  public async deleteCustomer(customerId, serviceName) {
    const commonApi = new CommonAPI(APIData.CustomerDelete, serviceName, customerId);
    return this._request(commonApi);
  }

  public async updateExtensionInfo(planId: string, companyId: number, status: string, serviceName: string) {
    const commonApi = new CommonAPI(APIData.ExtensionInfoUpdate);
    return this._request(commonApi, { planId, companyId, status, serviceName });
  }

  public async getCompanyProductProjects(serviceName: string, companyId: number) {
    const commonApi = new CommonAPI(APIData.ProjectServiceStatusGet, companyId, serviceName);
    return this._request(commonApi);
  }

  public async activatedLicense(serviceName: string, companyId: number, companyName: string, phone: string, email: string, params: any = {}) {
    const commonApi = new CommonAPI(APIData.ActivatedLicense);
    return this._request(commonApi, {
      serviceName,
      companyId,
      companyName,
      phone,
      email,
      params });
  }

  public async getLicenseList(serviceName: string, companyId: number) {
    const commonApi = new CommonAPI(APIData.LicenseListGet);
    return this._request(commonApi, { companyId, serviceName });
  }

  public async postProjectService(serviceName: string, companyId: number, params: any = {}, user: string, accountId: string) {
    const data = {
      companyId: companyId,
      appId: params.appId,
      projectId: params.projectId,
      vid: params.vid,
      params: JSON.stringify(params.params),
      createParams: JSON.stringify(params.createParams) === '{}' ? undefined : JSON.stringify(params.createParams),
      projectName: params.name,
      keyFiled: params.keyFiled || undefined,
      accountId: accountId,
      user: user
    };
    const commonApi = new CommonAPI(APIData.ProjectLaunch, serviceName);
    return this._request(commonApi, data);
  }

  public async postProjectServiceV2(serviceName: string, companyId: number, params: any = {}, user: string, accountId: string, email: string, mobile: string, type?: number) {
    const data = {
      companyId: companyId,
      appId: params.appId,
      projectId: params.projectId,
      vid: params.vid,
      projectName: params.name,
      projectInfo: params.projectInfo,
      accountId: accountId,
      user: user,
      email: email,
      mobile: mobile
    };
    if (type) {
      data['type'] = type;
    }
    const commonApi = new CommonAPI(APIData.ProjectLaunchV2, serviceName);
    return this._request(commonApi, data);
  }

  public async postProjectSDKDeliverService(serviceName: string, companyId: number, params: any = {}, user: string, accountId: string) {
    const data = {
      companyId: companyId,
      appId: params.appId,
      projectId: params.projectId,
      vid: params.vid,
      reductionMode: params.reductionMode,
      user: user
    };
    const commonApi = new CommonAPI(APIData.SDKDeliverProjectLaunch, serviceName);
    return this._request(commonApi, data);
  }

  public async closeProjectSDKDeliverService(serviceName: string, companyId: number, params: any = {}, user: string) {
    const data = {
      companyId: companyId,
      appId: params.appId,
      projectId: params.projectId,
      vid: params.vid,
      user: user
    };
    const commonApi = new CommonAPI(APIData.SDKDeliverProjectClose, serviceName);
    return this._request(commonApi, data);
  }

  public async deleteProjectService(appId: string, serviceName: string, companyId: number, projectId: string, params: any = {}, user: string, accountId: string) {
    const data = {
      companyId: companyId,
      params: JSON.stringify(params.deleteParams) === '{}' ? undefined : JSON.stringify(params.deleteParams),
      projectId: projectId,
      accountId: accountId,
      vid: params.vid,
      user: user,
      appId: appId
    };
    const commonApi = new CommonAPI(APIData.ProjectClose, serviceName);
    return this._request(commonApi, data);
  }

  public async getVendorApplyList(companyId: number, pageSize: number, pageNumber: number) {
    const commonApi = new CommonAPI(APIData.VendorApplyListGet);
    const ret = await this._request(commonApi, { companyId, pageSize, pageNumber });
    return ret;
  }

  public async getVendorApplyInfo(companyId: number, id: number) {
    const commonApi = new CommonAPI(APIData.VendorApplyInfoGet, id);
    const ret = await this._request(commonApi, { companyId });
    return ret;
  }

  public async createVendorApply(companyId: number, params: any) {
    const commonApi = new CommonAPI(APIData.VendorApply);
    return this._request(commonApi, { companyId, params: params });
  }

  public async updateVendorApply(id: number, companyId: number, params: any) {
    const commonApi = new CommonAPI(APIData.UpdateVendorApply, id);
    return this._request(commonApi, { companyId, params: params });
  }

  public async getNoticeInfo(area: number) {
    const commonApi = new CommonAPI(APIData.NoticeInfoGet);
    return (this._request(commonApi, { area }));
  }
}

export const paasProxy = new PaasProxy(config.paasApi, ConsoleRequestFollower);

export const paasProxyForSession = (log: Logger) => {
  return paasProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};

export const getUsage = async (log: Logger, vid, billingItemId: number, fromTs: string, endTs: string) => {
  const billingClient = Client.gw_create(log);
  const client = Client.usage_gw_create(log);
  const res = await billingClient.get(`${config.backendBaseUrl}/bss-pricing/api/v1/billing-items/${billingItemId}`);
  const unitId = res.data.uomList[0];
  const unitRes = await billingClient.get(`${config.backendBaseUrl}/bss-pricing/api/v1/charge-units/${unitId}`);
  const skuId = res.data.measureItemList[0];
  const data = {
    vids: [vid],
    skuIds: [skuId]
  };
  const ret = await client.post(`${config.vendorUsageBaseUrl}/marketplace/usage/sku?startTs=${fromTs}&endTs=${endTs}&interval=daily`, data);
  ret.data.unitName = unitRes.data.unitName;
  return ret.data;
};
