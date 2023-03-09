import { Logger } from 'log4js';
import * as Client from '../utils/doveRequest';
import { config } from '../config';
import { generateUUID } from '../utils/encryptTool';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as queryString from 'query-string';

const apiKey = config.ktvApi.apiKey;
export enum KTVStatu {
  ENABLE = 1,
  DISABLED = 0
}

export class KTVService {
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public makeRequest() {
    return Client.create(this.logger, {
      baseURL: config.ktvApi.baseURL
    });
  }

  public async getCustomerInfo(companyId: number, vid: number) {
    const requestId = generateUUID();
    const timestamp = moment().unix();
    const message = `${apiKey}${vid}${companyId}${timestamp}${requestId}`;
    const token = crypto.createHash('sha256').update(message).digest('hex');
    const params = {
      vid: vid.toString(),
      cid: companyId.toString(),
      requestId: requestId,
      timestamp: timestamp.toString()
    };
    const request = this.makeRequest();
    const res = await request.post(
      `/console/v1/get-customer`,
      queryString.stringify(params),
      {
        headers: {
          'Console-Token': token,
          'content-type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return res.data;
  }

  public async postCustomerInfo(
    companyId: number,
    vid: number,
    companyName: string,
    ip: string,
    status: number
  ) {
    const requestId = generateUUID();
    const timestamp = moment().unix();
    const expiryTime = moment().add(1, 'years').unix();
    const message = `${apiKey}${vid}${companyId}${timestamp}${requestId}`;
    const token = crypto.createHash('sha256').update(message).digest('hex');
    if (!ip) {
      ip = '127.0.0.1';
    }
    const params = {
      vid: vid.toString(),
      cid: companyId.toString(),
      name: companyName,
      ip: ip,
      status: status,
      expiryTime: expiryTime,
      requestId: requestId,
      timestamp: timestamp.toString()
    };
    const request = this.makeRequest();
    const res = await request.post(
      `/console/v1/set-customer`,
      queryString.stringify(params),
      {
        headers: {
          'Console-Token': token,
          'content-type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return res.data;
  }
}
