import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { config } from '../config';
import { createHmac } from 'crypto';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { Logger } from 'log4js';

export interface ModerationConfig {
  baseURL: string;
  host: string;
  env: string;
  apiKey: string;
  userName: string;
  secret: string;
}

const APIData = {
  getProjectConfig: {
    method: 'GET',
    route: '/cn/v1.0/projects/ad-config-admin/services/image-moderation/envs/:env/vids/:vid/appConfigInfo',
    description: '获取项目鉴黄配置信息'
  },
  postProjectConfig: {
    method: 'PUT',
    route: '/cn/v1.0/projects/ad-config-admin/services/image-moderation/envs/:env/vids/:vid/appConfigInfo',
    description: '获取项目鉴黄配置信息'
  }
};

export class ModerationProxy extends ServiceProxy<ModerationConfig> {
  constructor(config: ModerationConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURL)
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

  protected async _request(commonAPI: CommonAPI, params = {}, headers = {}) {
    const request = this.makeRequest(commonAPI, params);
    request.addHeaders(headers);
    return request.quickSend();
  }

  private getAuthorization(signingString: string) {
    let authorization = '';
    const hmac = createHmac('sha256', this._config.secret);
    const signature = hmac.update(signingString, 'utf8').digest().toString('base64');
    authorization = `hmac username="${this._config.userName}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    return authorization;
  }

  public async getProjectConfig(vid: number) {
    const commonApi = new CommonAPI(APIData.getProjectConfig, this._config.env, vid);
    const requestLine = `${commonApi.method} ${commonApi.api} HTTP/1.1`;
    const date = new Date().toUTCString();
    const signingString = `host: ${this._config.host}\ndate: ${date}\n${requestLine}`;
    const authorization = this.getAuthorization(signingString);
    const headers = {
      host: this._config.host,
      date: date,
      authorization: authorization
    };
    return this._request(commonApi, {}, headers);
  }

  public async setProjectConfig(vid: number, content: string) {
    const data = {
      content: content,
      sourceUser: 'Console Server'
    };
    const message = JSON.stringify(data);
    const hmac = createHmac('sha256', config.ModerationApi.apiKey);
    const token = hmac.update(message).digest('hex');
    const commonApi = new CommonAPI(APIData.postProjectConfig, this._config.env, vid);
    const requestLine = `${commonApi.method} ${commonApi.api} HTTP/1.1`;
    const date = new Date().toUTCString();
    const signingString = `host: ${this._config.host}\ndate: ${date}\n${requestLine}`;
    const authorization = this.getAuthorization(signingString);
    const headers = {
      host: this._config.host,
      date: date,
      authorization: authorization,
      'Agora-Config-Signature': token
    };
    return this._request(commonApi, data, headers);
  }
}

export const moderationProxy = new ModerationProxy(config.ModerationApi, ConsoleRequestFollower);

export const moderationProxyForSession = (log: Logger) => {
  return moderationProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
