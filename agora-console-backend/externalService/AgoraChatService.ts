import { Logger } from 'log4js';
import * as Client from '../utils/doveRequest';
import * as JWT from 'jsonwebtoken';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';
import { AxiosRequestConfig } from 'axios';
import { ChatFunctionModel } from '../dataModel/chatModel';

const cert = fs.readFileSync(path.join(__dirname, './chat-key.pem'));
export class AgoraChatService {
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public makeRequest(area: string = 'CN', params = {}) {
    const option: AxiosRequestConfig = {
      baseURL: area === 'CN' ? config.agoraChatApi.baseURLCN : config.agoraChatApi.baseURLEN
    };
    if (params) {
      option.data = params;
    }
    const token = this.getToken();
    option.headers = {
      Authorization: token
    };
    return Client.create(this.logger, option);
  }

  getToken() {
    const originPayload = {
      sub: 'admin',
      roles: 'ROLE_ADMIN'
    };
    const token = JWT.sign(originPayload, cert, {
      algorithm: 'RS256'
    });
    return `Bearer ${token}`;
  }

  public async getInstanceByVid(cid: number, vid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.get(`/chat/instance`, { params: { cid, vid } });
    return res.data;
  }

  public async enableInstanceByVid(cid: number, vid: number, company_name: string, project_name: string, datacenter: string, area: string = 'CN') {
    const params = {
      cid,
      vid,
      company_name,
      project_name,
      datacenter
    };
    if (config.agoraChatApi.dataCenter) {
      params['datacenter'] = config.agoraChatApi.dataCenter;
    }
    const request = this.makeRequest(area);
    const res = await request.post(`/chat/instance`, params);
    return res.data;
  }

  public async InactiveInstanceByVid(cid: number, vid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.post(`/chat/instance/block`, { cid, vid });
    return res.data;
  }

  public async ActiveInstanceByVid(cid: number, vid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.delete(`/chat/instance/block`, { data: { cid, vid } });
    return res.data;
  }

  public async getCompanySubscription(cid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    try {
      const res = await request.get(`/chat/subscription`, { params: { cid } });
      return res.data;
    } catch (e) {
      return { subscriptions: [] };
    }
  }

  public async setCompanySubscription(cid: number, plan_name: string, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.put(`/chat/subscription`, undefined, { params: { cid, plan_name } });
    return res.data;
  }

  public async deleteCompanySubscription(cid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.delete(`/chat/subscription`, { params: { cid } });
    return res.data;
  }

  public async getProjectPushInfo(cid: number, vid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    try {
      const res = await request.get(`/chat/push/status`, { params: { cid, vid } });
      return res.data;
    } catch (e) {
      return { certificates: [] };
    }
  }

  public async createProjectPush(cid: number, vid: number, params: any, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.post(`/chat/push/certificate`, params, { params: { cid, vid } });
    return res.data;
  }

  public async deleteProjectPushInfo(cid: number, vid: number, certificate_id: string, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.delete(`/chat/push/certificate/${certificate_id}`, { params: { cid, vid } });
    return res.data;
  }

  public async getProjectCallbackInfo(cid: number, vid: number, area: string = 'CN') {
    const request = this.makeRequest(area);
    try {
      const res = await request.get(`/chat/callback/status`, { params: { cid, vid } });
      return res.data;
    } catch (e) {
      return {
        pre_send: [],
        post_send: []
      };
    }
  }

  public async deletePreCallback(cid: number, vid: number, rule_id: string, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.delete(`/chat/callback/pre-send/rule/${rule_id}`, { params: { cid, vid } });
    return res.data;
  }

  public async deletePostCallback(cid: number, vid: number, rule_id: string, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.delete(`/chat/callback/post-send/rule/${rule_id}`, { params: { cid, vid } });
    return res.data;
  }

  public async createPreCallback(cid: number, vid: number, params: any, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.post(`/chat/callback/pre-send/rule`, params, { params: { cid, vid } });
    return res.data;
  }

  public async createPostCallback(cid: number, vid: number, params: any, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.post(`/chat/callback/post-send/rule`, params, { params: { cid, vid } });
    return res.data;
  }

  public async updatePreCallback(cid: number, vid: number, rule_id: string, params: any, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.put(`/chat/callback/pre-send/rule/${rule_id}`, params, { params: { cid, vid } });
    return res.data;
  }

  public async updatePostCallback(cid: number, vid: number, rule_id: string, params: any, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.put(`/chat/callback/post-send/rule/${rule_id}`, params, { params: { cid, vid } });
    return res.data;
  }

  public async checkCompanySubscription(cid: number, area: string = 'CN') {
    const subscriptions = await this.getCompanySubscription(cid, area);
    return subscriptions.subscriptions.length > 0;
  }

  public async checkEnableService(cid: number, area: string, dataCenter: string) {
    const subscriptions = await this.getCompanySubscription(cid, area);
    if (subscriptions.subscriptions.length === 0) return false;
    const planName = subscriptions.subscriptions[0].planName;
    if (area === 'CN') {
      if (planName === 'ENTERPRISE') {
        return ['CN1', 'VIP6'].includes(dataCenter);
      } else {
        return ['CN1'].includes(dataCenter);
      }
    } else {
      return ['SGP1', 'US1', 'DE1'].includes(dataCenter);
    }
  }

  public async checkCallBackPermission(cid: number, area: string = 'CN') {
    const subscriptions = await this.getCompanySubscription(cid, area);
    if (subscriptions.subscriptions.length === 0) return false;
    const planName = subscriptions.subscriptions[0].planName;
    return planName !== 'FREE';
  }

  public async getUserUuid(cid: string, vid: string, userName: string, area: string = 'CN') {
    const request = this.makeRequest(area);
    const res = await request.get(`/chat/user/uuid`, { params: { cid, vid, userName } });
    return res.data?.uuid;
  }

  public async getChatFunction(area: string = 'CN') {
    const request = this.makeRequest(area);
    const functionList = (await request.get(`/chat/function/list`)).data as ChatFunctionModel[];
    const typeMap = {};
    functionList.forEach(item => {
      if (item.type !== 'Pricing') {
        if (!typeMap[item.type]) {
          typeMap[item.type] = {
            type: item.type,
            title: item.type,
            childrens: {
              [item.name]: {
                description: item.name,
                [item.planName]: item.value
              }
            }
          };
        } else {
          if (typeMap[item.type].childrens[item.name]) {
            typeMap[item.type].childrens[item.name][item.planName] = item.value;
          } else {
            typeMap[item.type].childrens[item.name] = {
              description: item.name,
              [item.planName]: item.value
            };
          }
        }
      }
    });
    return typeMap;
  }
}
