import { Logger } from 'log4js';
import * as Client from '../utils/doveRequest';
import { config } from '../config';

export class AbleService {
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public makeRequest() {
    return Client.create(this.logger, {
      baseURL: config.AbleService.baseURL,
      headers: {
        ['agora-service-user']: config.AbleService.key,
        ['agora-service-password']: config.AbleService.keyValue
      }
    });
  }

  public async getOperationList(vid: number, offset: number = 0, limit: number = 100) {
    const request = this.makeRequest();
    const ret = await request.get(`/v1/operation/service`, { params: { vid, offset, limit } });
    return ret.data;
  }

  public async createOperation(params: any) {
    const request = this.makeRequest();
    const ret = await request.put(`/v1/operation/service`, params);
    return ret.data;
  }
}
