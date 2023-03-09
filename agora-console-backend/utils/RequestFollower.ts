import { AxiosBuilder, RequestObserverV2 } from '@fangcha/app-request';
import * as moment from 'moment';
import AppError from '@fangcha/app-error';
import { Logger } from 'log4js';
import * as log4js from '../logging';
import { generateUUID } from '../utils/encryptTool';

export class RequestFollower implements RequestObserverV2 {
  protected appName: string = '';

  public readonly logger: Logger;
  public readonly requestId: string;
  public readonly userId: string;

  constructor(requestId?: string, userId?: string) {
    this.userId = userId;
    this.requestId = requestId || generateUUID();
    const logger = log4js.Logger();
    logger.addContext('reqid', this.requestId);
    this.logger = logger;
  }

  onRequestStart(client: AxiosBuilder) {
    const commonApi = client.commonApi;
    const url = client.getRequestUrl();
    const homeName = client.getHostname();
    this.logger.info(`[Start] 200 0 "${commonApi.method} ${url} ${homeName}"`);
  }

  onRequestSuccess(client: AxiosBuilder) {
    const commonApi = client.commonApi;
    const url = client.getRequestUrl();
    const homeName = client.getHostname();
    const duration = client.getDuration() / 1000;
    this.logger.info(`[Completed] 200 ${duration} "${commonApi.method} ${url} ${homeName}"`);
  }

  onRequestFailure(client: AxiosBuilder, error: AppError) {
    const url = client.getRequestUrl();
    const homeName = client.getHostname();
    const statusCode = error.statusCode || 500;
    if (statusCode < 499) {
      return;
    }
    const errorMsg = error.message;
    const duration = client.getDuration() / 1000;
    const commonApi = client.commonApi;
    let errTitle = `Invoking Error: [${statusCode}] ${errorMsg}`;
    if (this.appName) {
      errTitle = `[${this.appName}] ${errTitle}`;
    }
    const infos = [
      errTitle,
      `BaseURL: ${client.baseURL}`,
      `Action: ${commonApi.method} ${commonApi.api}`,
      `User: ${this.userId}`,
      `ReqId: ${this.requestId}`,
      `Duration: ${client.getDuration()}ms`,
      `Time: ${moment().format()}`
    ];
    this.onDisposeErrorMsg(infos.join('\n'), client, error);
    this.logger.error(`[Completed] ${statusCode} ${duration} "${commonApi.method} ${url} ${homeName} ${errorMsg}"`);
  }

  onDisposeErrorMsg(_errMsg: string, _client: AxiosBuilder, _error: AppError) {}
}
