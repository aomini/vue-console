import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { config } from '../config';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { Logger } from 'log4js';

const APIData = {
  HealthTest: {
    method: 'POST',
    route: '/v1/pusher/test',
    description: '投递URL健康检查'
  }
};

export interface NCSConfig {
  baseURL: string;
  cnBaseURL: string;
  seaBaseURL: string;
  naBaseURL: string;
  euBaseURL: string;
  Token: string;
}

export class NCSProxy extends ServiceProxy<NCSConfig> {
  private readonly _token: string;

  constructor(config: NCSConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._token = config.Token;
  }

  protected makeRequest(commonApi: CommonAPI, params = {}, query = {}, urlRegion?: string) {
    const request = axiosBuilder()
      .setBaseURL(urlRegion ? this._config[`${urlRegion}BaseURL`] : this._config.baseURL)
      .addHeader('Token', this._token)
      .setApiOptions(commonApi)
      .setTimeout(15000)
      .setBodyData(params)
      .setQueryParams(query);
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}, query?, urlRegion?: string) {
    const request = this.makeRequest(commonAPI, params, query, urlRegion);
    return request.quickSend();
  }

  public async healthCheck(params: any, urlRegion?: string) {
    const commonApi = new CommonAPI(APIData.HealthTest);
    return this._request(commonApi, params, undefined, urlRegion);
  }

  public makeNCSProxyForSession(reqId: string, user: string) {
    return this.proxyForSession(reqId, user);
  }
}

export const ncsProxy = new NCSProxy(config.NCS, ConsoleRequestFollower);

export const ncsProxyForSession = (log: Logger) => {
  return ncsProxy.makeNCSProxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
