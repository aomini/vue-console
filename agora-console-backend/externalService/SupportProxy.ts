import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { config } from '../config';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { Logger } from 'log4js';

export interface SupportConfig {
  baseURL: string;
  username: string;
  password: string;
}

const APIData = {
  WechatBotNotify: {
    method: 'POST',
    route: '/api/v1/wechat-bot-notify',
    description: '微信机器人通知'
  }
};

export class SupportProxy extends ServiceProxy<SupportConfig> {
  private readonly _authorization: string;

  constructor(config: SupportConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
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

  public async sendWechatBotNotify(companyId: number, message: string) {
    const commonApi = new CommonAPI(APIData.WechatBotNotify);
    return this._request(commonApi, { message: message, companyId: companyId });
  }
}

export const supportProxy = new SupportProxy(config.SupportOpen, ConsoleRequestFollower);

export const supportProxyForSession = (log: Logger) => {
  return supportProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
