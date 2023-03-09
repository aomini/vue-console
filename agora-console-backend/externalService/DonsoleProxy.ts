import { Logger } from 'log4js';
import { config } from '../config';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';

export interface DonsoleConfig {
  baseURL: string;
  username: string;
  password: string;
}

const APIData = {
  ActiveProductListGet: {
    method: 'GET',
    route: '/open-api/v1/active-product',
    description: '获取所有激活状态的产品'
  },
  AuditFormSubmit: {
    method: 'POST',
    route: '/api/hold-sdk/v1/audit-form',
    description: '审批表单提交'
  },
  AuditFormSearch: {
    method: 'GET',
    route: '/api/hold-sdk/v1/reviewing-form/hold-event/:holdEvent/target-id/:targetId',
    description: '查找表单'
  },
  ProjectRelationGet: {
    method: 'GET',
    route: '/open-api/v1/vendor/:vendorId/product',
    description: '获取项目与产品的关系'
  },
  ProjectRelationUpdate: {
    method: 'POST',
    route: '/open-api/v1/vendor/:vendorId/product',
    description: '更新项目与产品的关系'
  },
  SearchResult: {
    method: 'POST',
    route: `/open-api/v1/search`,
    description: '获取控制台搜索结果'
  }
};

const holdEvent = 'NCSConfigApply';

export class DonsoleProxy extends ServiceProxy<DonsoleConfig> {
  private readonly _authorization: string;

  constructor(config: DonsoleConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURL)
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

  public async auditFormSubmit(formData: any) {
    const commonApi = new CommonAPI(APIData.AuditFormSubmit);
    return this._request(commonApi, formData);
  }

  public async getAuditForm(targetId: number) {
    const commonApi = new CommonAPI(APIData.AuditFormSearch, holdEvent, targetId);
    return this._request(commonApi);
  }

  public async getActiveProductList(area: string) {
    const commonApi = new CommonAPI(APIData.ActiveProductListGet);
    return this._request(commonApi, { area: area });
  }

  public async getProjectRelation(vendorId: number) {
    const commonApi = new CommonAPI(APIData.ProjectRelationGet, vendorId);
    return this._request(commonApi);
  }

  public async updateProjectRelation(vendorId: number, productTypeId: string, platformId: string) {
    const commonApi = new CommonAPI(APIData.ProjectRelationUpdate, vendorId);
    return this._request(commonApi, { productTypeId: productTypeId, platformId: platformId });
  }

  public async getSearchResult(keywords: string, language: 'CN' | 'Non-CN' = 'CN') {
    const commonApi = new CommonAPI(APIData.SearchResult);
    return this._request(commonApi, { keywords: keywords, language: language });
  }
}

export const donsoleProxy = new DonsoleProxy(config.Donsole, ConsoleRequestFollower);

export const donsoleProxyForSession = (log: Logger) => {
  return donsoleProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
