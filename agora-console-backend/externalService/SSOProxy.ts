import { Logger } from 'log4js';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';

const APIData = {
  CompanyMemberListGet: {
    method: 'GET',
    route: '/api/v1/company/:companyId/member',
    description: '获取公司成员账号列表'
  },
  CompanyMemberInfoGet: {
    method: 'GET',
    route: '/api/v1/company/:companyId/member/:userId',
    description: '获取成员账号信息'
  },
  CompanyMemberCreate: {
    method: 'POST',
    route: '/api/v1/company/:companyId/member',
    description: '创建成员账号'
  },
  CompanyMemberInfoUpdate: {
    method: 'PUT',
    route: '/api/v1/company/:companyId/member/:userId',
    description: '更新成员账号信息'
  },
  CompanyMemberDelete: {
    method: 'DELETE',
    route: '/api/v1/company/:companyId/member/:userId',
    description: '移除成员账号'
  },
  LoginIdValidCheck: {
    method: 'POST',
    route: '/api/v1/visitor/check-login-id',
    description: 'sso login ID 合法性验证'
  },
  TrackDataGet: {
    method: 'POST',
    route: '/api/v1/company/:companyId/track-data',
    description: '通过 Company ID 获取 Track Data'
  },
  CompanyPartnerLinkInfoGet: {
    method: 'GET',
    route: '/api/v1/partner-link/:partner/company/:companyId/coo-company',
    description: '获取合作商公司关联信息'
  },
  CompanyPartnerLink: {
    method: 'PUT',
    route: '/api/v1/partner-link/:partner/company/:companyId/coo-company/:cooCid',
    description: '关联合作商公司'
  },
  ProjectPartnerLinkInfoGet: {
    method: 'GET',
    route: '/api/v1/partner-link/:partner/company/:companyId/project/:vendorId/coo-project',
    description: '获取合作商项目关联信息'
  },
  ProjectPartnerLink: {
    method: 'PUT',
    route: '/api/v1/partner-link/:partner/company/:companyId/project/:vendorId/coo-project/:cooVid',
    description: '关联合作商项目'
  },
  AccountLanguageUpdate: {
    method: 'PUT',
    route: '/api/v1/company/:companyId/member/:userId/language',
    description: '更新账号语言偏好'
  }
};

export interface SSOConfig {
  baseURL: string;
  username: string;
  password: string;
}

export class SSOProxy extends ServiceProxy<SSOConfig> {
  private readonly _authorization: string;
  private readonly _partner: string = 'console_chat';

  constructor(config: SSOConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURL)
      .addHeader('Authorization', this._authorization)
      .setApiOptions(commonApi)
      .setTimeout(15000)
      .setBodyData(params);
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}) {
    const request = this.makeRequest(commonAPI, params);
    return request.quickSend();
  }

  public async getMembersByCompany(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyMemberListGet, companyId);
    return (this._request(commonApi));
  }

  public async getMemberByEmail(email: string, companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyMemberListGet, companyId);
    const ret = await this._request(commonApi);
    const user = ret.data?.some(item => item.email === email);
    return user;
  }

  public async getMemberByUserId(userId: number, companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyMemberInfoGet, companyId, userId);
    const ret = await this._request(commonApi);
    return ret;
  }

  public async createMember(email: string, roleId: number, language: string = 'chinese', companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyMemberCreate, companyId);
    const ret = await this._request(commonApi, { email: email, language: language, roleId: roleId });
    return ret;
  }

  public async updateMember(roleId: number, language: string = 'chinese', companyId: number, userId: number) {
    const commonApi = new CommonAPI(APIData.CompanyMemberInfoUpdate, companyId, userId);
    const ret = await this._request(commonApi, { language: language, roleId: roleId });
    return ret;
  }

  public async deleteMember(companyId: number, userId: number) {
    const commonApi = new CommonAPI(APIData.CompanyMemberDelete, companyId, userId);
    const ret = await this._request(commonApi);
    return ret;
  }

  public async checkLoginIdValid(loginId: number) {
    const commonApi = new CommonAPI(APIData.LoginIdValidCheck);
    const ret = await this._request(commonApi, { loginId: loginId });
    return ret;
  }

  public async getTrackData(companyId: number) {
    const commonApi = new CommonAPI(APIData.TrackDataGet, companyId);
    const ret = await this._request(commonApi);
    return ret;
  }

  public async getCompanyPartnerLinkInfo(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyPartnerLinkInfoGet, this._partner, companyId);
    try {
      const ret = await this._request(commonApi);
      return ret;
    } catch (e) {
      return undefined;
    }
  }

  public async getProjectPartnerLinkInfo(companyId: number, vendorId: string) {
    const commonApi = new CommonAPI(APIData.ProjectPartnerLinkInfoGet, this._partner, companyId, vendorId);
    const ret = await this._request(commonApi);
    return ret;
  }

  public async putCompanyPartnerLink(companyId: number, cooCid: string) {
    const commonApi = new CommonAPI(APIData.CompanyPartnerLink, this._partner, companyId, cooCid);
    const ret = await this._request(commonApi);
    return ret;
  }

  public async putProjectPartnerLink(companyId: number, vendorId: number, cooVid: string) {
    const commonApi = new CommonAPI(APIData.ProjectPartnerLink, this._partner, companyId, vendorId, cooVid);
    const ret = await this._request(commonApi);
    return ret;
  }

  public async updateAccountLanguage(companyId: number, userId: number, language: string) {
    const commonApi = new CommonAPI(APIData.AccountLanguageUpdate, companyId, userId);
    const ret = await this._request(commonApi, { language: language });
    return ret;
  }
}

export const ssoProxy = new SSOProxy(config.SSOPower, ConsoleRequestFollower);

export const ssoProxyForSession = (log: Logger) => {
  return ssoProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
