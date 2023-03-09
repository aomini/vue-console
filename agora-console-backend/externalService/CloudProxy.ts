import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { Logger } from 'log4js';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';

const APIData = {
  CloudProxyStatusGet: {
    method: 'GET',
    route: '/v3/public/access/cloud_proxy/vendor/:vid/status',
    description: '获取项目 cloud proxy 开通状态'
  },
  CloudProxyStatusUpdate: {
    method: 'POST',
    route: '/v3/public/access/cloud_proxy/vendor/:vid/status',
    description: '项目 cloud proxy 开通状态修改'
  },
  CloudProxyPCUGet: {
    method: 'GET',
    route: '/v3/public/access/cloud_proxy/vendor/:vid/pcu-limit',
    description: '获取项目 cloud proxy pcu 限制'
  },
  CloudProxyPCUGUpdate: {
    method: 'POST',
    route: '/v3/public/access/cloud_proxy/vendor/:vid/pcu-limit',
    description: '项目 cloud proxy pcu 限制修改'
  }
};

export interface CloudProxyConfig {
  baseURL: string;
  username: string;
  password: string;
}

export class CloudProxy extends ServiceProxy<CloudProxyConfig> {

  constructor(config: CloudProxyConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
  }

  protected makeRequest(commonApi: CommonAPI, params = {}, query = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURL)
      .addHeader('agora-service-user', this._config.username)
      .addHeader('agora-service-password', this._config.password)
      .setApiOptions(commonApi)
      .setTimeout(15000)
      .setBodyData(params)
      .setQueryParams(query);
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}) {
    const request = this.makeRequest(commonAPI, params);
    return request.quickSend();
  }

  public async getCloudProxyStatus(vid: number) {
    const commonApi = new CommonAPI(APIData.CloudProxyStatusGet, vid);
    return this._request(commonApi);
  }

  public async updateCloudProxyStatus(vid: number, enabled: boolean) {
    const commonApi = new CommonAPI(APIData.CloudProxyStatusUpdate, vid);
    const params = {
      enabled
    };
    return this._request(commonApi, params);
  }

  public async getCloudProxyPCULimit(vid: number) {
    const commonApi = new CommonAPI(APIData.CloudProxyPCUGet, vid);
    return this._request(commonApi);
  }

  public async updateCloudProxyPCULimit(vid: number, isEnabled: boolean, pcuLimit: number) {
    const commonApi = new CommonAPI(APIData.CloudProxyPCUGUpdate, vid);
    const params = {
      pcu_limit: pcuLimit,
      is_enabled: isEnabled
    };
    return this._request(commonApi, params);
  }
}

export const cloudProxy = new CloudProxy(config.CloudProxy, ConsoleRequestFollower);

export const cloudProxyForSession = (log: Logger) => {
  return cloudProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
