import * as Client from '../utils/doveRequest';
import { config } from '../config';
import { Logger } from 'log4js';
import { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';

export interface OAuthClientConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
  callbackUri: string;
  authorizePath: string;
  // Google OAuth 的 authorize、token 所使用的 baseURL 不同
  tokenBaseURL?: string;
  tokenPath: string;
  logoutPath: string;
  userInfoPath: string;
  /**
   * 授权范围
   */
  scope?: string;
}

export class ConsoleSSO {
  protected readonly _config: OAuthClientConfig;

  constructor(config: OAuthClientConfig) {
    this._config = config;
  }

  public makeRequest(log: Logger, opt?: AxiosRequestConfig) {
    const nopt = Object.assign({}, { baseURL: config.oauth2.baseURL }, opt);
    return Client.create(log, nopt);
  }

  public async getAccessTokenFromCode(log: Logger, code: string) {
    const request = this.makeRequest(log);
    const params = {
      client_id: this._config.clientId,
      client_secret: this._config.clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this._config.callbackUri
    };
    const query = qs.stringify(params, {
      arrayFormat: 'repeat'
    });
    const ret = await request.post(this._config.tokenPath, query);
    return ret.data.access_token;
  }

  public async getUserInfo(log: Logger, accessToken: string) {
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };
    const baseURL = config.userInfoPath;
    const request = this.makeRequest(log, { headers, baseURL });
    const res = await request.get(this._config.userInfoPath);
    res.data.companyId = res.data.companyId || res.data.company_id;
    return res.data;
  }
}
