import { Logger } from 'log4js';

import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { BasicAuth } from '../utils/BasicAuth';

export interface DoveConfig {
  baseURLV2: string;
  appKey: string;
  appSecret: string;
}

export interface SiteMailModel {
  msgId: number;
  customUid: string;
  companyId: number;
  title: string;
  content: string;
  category: string;
  readStatus: number;
  createTime: string;
}

export interface SiteMailCountModel {
  totalSize: number;
}
export interface SiteMailParamsBase {
  customUid: string;
  category: string;
  // 广播消息参数需要有 tagList，常规消息及模板消息
  companyIdList?: number[];
  tagList?: string[];
  // 模板消息参数需要有 (templateId, templateParams)，常规消息参数需要有 (title, content)
  templateId?: number;
  templateParams?: { [p: string]: string | number };
  title?: string;
  content?: string;
}

export enum SMSProvider {
  CL_253_SMS = 'CL_253_SMS',
  CL_253_OVERSEAS_SMS = 'CL_253_OVERSEAS_SMS',
  CL_253_VoiceCode = 'CL_253_VoiceCode',
  Nexmo_SMS = 'Nexmo_SMS'
}

export interface DoveSMSParams {
  phone: string;
  content: string;
  customTag?: string;
  provider?: SMSProvider;
}

export interface DoveEmailParams {
  customTag?: string;
  receiverList: string[];
  ccList?: string[];
  bccList?: string[];
  // 模板消息参数需要有 (templateId, templateParams)，常规消息参数需要有 (title, content)
  templateId?: number | string;
  templateParams?: { [p: string]: string | number };
  title?: string;
  content?: string;
  attachmentTicketList?: string[];
}

interface PageDataV2<T> {
  totalSize: number;
  elements: T[];
}

const APIData = {
  CompanySiteMailListGet: {
    method: 'GET',
    route: '/api/v2/company/:companyId/site-mail',
    description: '获取指定公司的站内信列表'
  },
  CompanySiteMailRead: {
    method: 'PUT',
    route: '/api/v2/company/:companyId/site-mail/:msgId/read',
    description: '将消息标记为「已读」'
  },
  CompanySiteMailCountGet: {
    method: 'GET',
    route: '/api/v2/company/:companyId/site-mail-count',
    description: '获取指定公司的站内信数量'
  },
  SiteMailSend: {
    method: 'POST',
    route: '/api/v2/site-mail',
    description: '发送站内信'
  },
  DoveEmailSend: {
    method: 'POST',
    route: '/api/v2/dove-email',
    description: '发送邮件'
  },
  DoveSMSCodeSend: {
    method: 'POST',
    route: '/api/v2/sms-code',
    description: '发送短信'
  }
};

export class DoveProxy extends ServiceProxy<DoveConfig> {
  private readonly _authorization: string;

  constructor(config: DoveConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = BasicAuth.makeAuth(config.appKey, config.appSecret);
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURLV2)
      .addHeader('Authorization', this._authorization)
      .setApiOptions(commonApi)
      .setTimeout(1000 * 30);
    if (commonApi.method === 'GET') {
      request.setQueryParams(params);
    } else {
      request.setBodyData(params);
    }
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}) {
    const request = this.makeRequest(commonAPI, params);
    return request.quickSend();
  }

  public async getSiteMailList(companyId: number, params: {
    _offset?: number
    _length?: number
    category?: string
    readStatus?: number | string
  }) {
    const commonApi = new CommonAPI(APIData.CompanySiteMailListGet, companyId);
    const ret = await this._request(commonApi, params);
    return ret as PageDataV2<SiteMailModel>;
  }

  public async markSiteMailAsRead(companyId: number, msgId: number) {
    const commonApi = new CommonAPI(APIData.CompanySiteMailRead, companyId, msgId);
    return this._request(commonApi);
  }

  public async getSiteMailCount(companyId: number, params: {
    readStatus?: number | string
    category?: string
  }) {
    const commonApi = new CommonAPI(APIData.CompanySiteMailCountGet, companyId);
    const ret = await this._request(commonApi, params);
    return ret as SiteMailCountModel;
  }

  public async sendSiteMail(params: SiteMailParamsBase) {
    const commonApi = new CommonAPI(APIData.SiteMailSend);
    await this._request(commonApi, params);
  }

  public async sendSMSCode(params: DoveSMSParams) {
    const commonApi = new CommonAPI(APIData.DoveSMSCodeSend);
    await this._request(commonApi, params);
  }

  public async sendEmail(params: DoveEmailParams) {
    const commonApi = new CommonAPI(APIData.DoveEmailSend);
    await this._request(commonApi, params);
  }
}

export const doveProxy = new DoveProxy(config.dove, ConsoleRequestFollower);

export const doveProxyForSession = (log: Logger) => {
  return doveProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
