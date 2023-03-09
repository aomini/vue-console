import { Logger } from 'log4js';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';
import { BasicAuth } from '../utils/BasicAuth';
import { v4 } from 'uuid';
import * as moment from 'moment';
import { IotApi } from '../config/config';

const APIData = {
  IotStatusUpdate: {
    method: 'POST',
    route: '/api/management-center/platform/v1/enable',
    description: '灵隼服务开通'
  },
  IotStatusGet: {
    method: 'POST',
    route: '/api/management-center/platform/v1/check-enabled',
    description: '检查灵隼服务是否开通'
  }
};

const IS_PROD = process.env.NODE_ENV === 'production';

export class IotProxy extends ServiceProxy<IotApi> {
  private readonly _authorization: string;

  constructor(config: IotApi, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = BasicAuth.makeAuth(config.username, config.password);
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(`${this._config.baseURL}${IS_PROD ? '/cn' : ''}`)
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

  public async getIotStatus(
    appId: string
  ) {
    const commonApi = new CommonAPI(APIData.IotStatusGet);
    return this._request(commonApi, {
      payload: {
        appId: appId
      },
      header: {
        traceId: v4(),
        timestamp: moment().unix()
      }
    });
  }

  public async updateIotStatus(
    appId: string,
    companyName: string,
    datacenter: string,
    projectName: string,
    vid: number,
    cid: number
  ) {
    const commonApi = new CommonAPI(APIData.IotStatusUpdate);
    return this._request(commonApi, {
      header: {
        traceId: v4(),
        timestamp: moment().unix()
      },
      payload: {
        appId, companyName, datacenter, projectName, vid, cid
      }
    });
  }

}

export const iotProxy = new IotProxy(config.Iot, ConsoleRequestFollower);

export const iotProxyForSession = (log: Logger) => {
  return iotProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
