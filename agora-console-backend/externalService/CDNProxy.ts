import { Logger } from 'log4js';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { BasicAuth } from '../utils/BasicAuth';

const APIData = {
  CDNAppGet: {
    method: 'POST',
    route: '/get_appid_of_vid',
    description: '获取 appid 和 vid 的映射关系'
  },
  CDNAppCreate: {
    method: 'POST',
    route: '/create_app',
    description: '创建 appid 和 vid 的映射关系'
  },
  CDNDomainCreate: {
    method: 'POST',
    route: '/v1/projects/:vid/fls/domains',
    description: '创建域名'
  },
  CDNDomainUpdate: {
    method: 'PATCH',
    route: '/v1/projects/:vid/fls/domains/:domain',
    description: '更新域名'
  },
  CDNDomainDelete: {
    method: 'DELETE',
    route: '/v1/projects/:vid/fls/domains/:domain',
    description: '删除域名'
  },
  CDNDomainsGet: {
    method: 'GET',
    route: '/v1/projects/:vid/fls/domains',
    description: '获取项目的所有域名'
  },
  CDNCallbackGet: {
    method: 'GET',
    route: '/v1/projects/:vid/fls/settings/notification',
    description: '获取项目回调配置'
  },
  CDNCallbackUpdate: {
    method: 'PATCH',
    route: '/v1/projects/:vid/fls/settings/notification',
    description: '更新项目回调配置'
  },
  CDNCertificateCreate: {
    method: 'POST',
    route: '/v1/projects/:vid/fls/certificates',
    description: '创建证书'
  },
  CDNCertificateListGet: {
    method: 'GET',
    route: '/v1/projects/:vid/fls/certificates',
    description: '获取项目的所有证书'
  },
  CDNCertificateGet: {
    method: 'GET',
    route: '/v1/projects/:vid/fls/certificates/:name',
    description: '获取项目的单一证书'
  },
  CDNCertificateDelete: {
    method: 'DELETE',
    route: '/v1/projects/:vid/fls/certificates/:name',
    description: '删除证书'
  },
  CDNCertificateUpdate: {
    method: 'PATCH',
    route: '/v1/projects/:vid/fls/certificates/:name',
    description: '创建证书'
  },
  CDNOriginSiteGet: {
    method: 'GET',
    route: '/v1/projects/:vid/fls/entry_points/:entryPoint/settings/origin_site',
    description: '获取源站配置'
  },
  CDNOriginSiteUpdate: {
    method: 'PATCH',
    route: '/v1/projects/:vid/fls/entry_points/:entryPoint/settings/origin_site',
    description: '更新源站配置'
  }
};

export interface CDNConfig {
  baseURL: string;
  username: string;
  password: string;
  referer: string;
}

export type RequestType = 'base' | 'app';

export class CDNProxy extends ServiceProxy<CDNConfig> {
  private readonly _authorization: string;

  constructor(config: CDNConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = BasicAuth.makeAuth(config.username, config.password);
  }

  protected makeRequest(commonApi: CommonAPI, type: RequestType, params = {}, query = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURL)
      .addHeader('Authorization', this._authorization)
      .addHeader('Referer', this._config.referer)
      .setApiOptions(commonApi)
      .setTimeout(15000)
      .setBodyData(params)
      .setQueryParams(query);
    if (type === 'base') {
      request.addHeader('X-Use-Vendor-ID', 'true');
    }
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, type: RequestType, params = {}, query?) {
    const request = this.makeRequest(commonAPI, type, params, query);
    return request.quickSend();
  }

  public async getCDNApp(
    vid: number
  ) {
    const commonApi = new CommonAPI(APIData.CDNAppGet);
    return this._request(commonApi, 'app', { vid: vid.toString() });
  }

  public async createCDNApp(
    vid: number,
    cid: number,
    appid: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNAppCreate);
    const params = {
      vid: vid.toString(),
      cid: cid.toString(),
      appid
    };
    return this._request(commonApi, 'app', params);
  }

  public async createCDNDomain(
    vid: number,
    domain: string,
    type: string,
    region: string,
    scope: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNDomainCreate, vid);
    const params = {
      type,
      region,
      scope
    };
    const query = {
      id: domain
    };
    return this._request(commonApi, 'base', params, query);
  }

  public async updateCDNDomain(
    vid: number,
    domain: string,
    authKey: string,
    enableRtmps: boolean,
    enableHttps: boolean,
    certName: string,
    crossDomain: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNDomainUpdate, vid, domain);
    const params = {
      authKey,
      enableRtmps,
      enableHttps,
      certName,
      crossDomain
    };
    return this._request(commonApi, 'base', params);
  }

  public async deleteCDNDomain(
    vid: number,
    domain: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNDomainDelete, vid, domain);
    return this._request(commonApi, 'base');
  }

  public async getCDNDomain(
    vid: number
  ) {
    const commonApi = new CommonAPI(APIData.CDNDomainsGet, vid);
    return this._request(commonApi, 'base');
  }

  public async getCDNCallback(
    vid: number
  ) {
    const commonApi = new CommonAPI(APIData.CDNCallbackGet, vid);
    return this._request(commonApi, 'base');
  }

  public async updateCDNCallback(
    vid: number,
    url: string,
    enabled: boolean
  ) {
    const commonApi = new CommonAPI(APIData.CDNCallbackUpdate, vid);
    const params = {
      url,
      enabled
    };
    return this._request(commonApi, 'base', params);
  }

  public async createCDNCertificate(
    vid: number,
    name: string,
    crt: string,
    key: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNCertificateCreate, vid);
    const params = {
      name,
      crt,
      key
    };
    const query = {
      id: name
    };
    return this._request(commonApi, 'base', params, query);
  }

  public async getCDNCertificateList(
    vid: number
  ) {
    const commonApi = new CommonAPI(APIData.CDNCertificateListGet, vid);
    return this._request(commonApi, 'base');
  }

  public async getCDNCertificate(
    vid: number,
    name: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNCertificateGet, vid, name);
    return this._request(commonApi, 'base');
  }

  public async deleteCDNCertificate(
    vid: number,
    name: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNCertificateDelete, vid, name);
    return this._request(commonApi, 'base');
  }

  public async updateCDNCertificate(
    vid: number,
    name: string,
    crt?: string,
    key?: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNCertificateUpdate, vid, name);
    const params = {
      crt,
      key
    };
    return this._request(commonApi, 'base', params);
  }

  public async getCDNOriginSite(
    vid: number,
    entryPoint: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNOriginSiteGet, vid, entryPoint);
    return this._request(commonApi, 'base');
  }

  public async updateCDNOriginSite(
    vid: number,
    entryPoint: string,
    enabled: boolean,
    domain: string
  ) {
    const commonApi = new CommonAPI(APIData.CDNOriginSiteUpdate, vid, entryPoint);
    const params = {
      enabled,
      domain
    };
    return this._request(commonApi, 'base', params);
  }

  public makeCDNProxyForSession(reqId: string, user: string, referer: string) {
    this._config.referer = referer;
    return this.proxyForSession(reqId, user);
  }
}

export const cdnProxy = new CDNProxy(config.CDN, ConsoleRequestFollower);

export const cdnProxyForSession = (log: Logger, referer: string) => {
  return cdnProxy.makeCDNProxyForSession((log as any).context['reqid'], (log as any).context['user'], referer);
};
