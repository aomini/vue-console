
import { config } from '../config';
const marketoConf = config.marketo;

import { create as createClient } from '../utils/request';
import { Logger } from 'log4js';
import { AxiosRequestConfig } from 'axios';

export interface MarketoLead {
  email: string;
  industry?: string;
  mktoAcquisitionDate?: Date;
  Company_ID__c: number;
  lastName?: string;
  firstName?: string;
  country?: string;
  company?: string;
  Lead_Source_Type__c?: string;
  Tech_Platform__c?: string;
  Product_Interest__c?: string;
  leadSource?: string;
  phone?: string;
  Verified_Mobile_Number__c?: string;
  Verified_Mobile_Date__c?: Date;
  Credit_Card__c?: string;
  MQL_Source__c?: any;
}

class OAuth {
  private static instance: any;

  private tokenopt: AxiosRequestConfig;
  private token: string;
  private tokenType: string;
  private expiredAt: number;

  static getInstance(): OAuth {
    if (this.instance) return this.instance;
    this.instance = new OAuth();
    return this.instance;
  }
  constructor () {
    this.tokenopt = {
      url: `${marketoConf.url}/identity/oauth/token`,
      method: 'GET',
      params: {
        grant_type: 'client_credentials',
        client_id: marketoConf.clientId,
        client_secret: marketoConf.clientSecret
      }
    };
  }
  async exchange(log: Logger) {
    const client = createClient(log);
    const ret = await client(this.tokenopt);
    const data = ret.data;
    this.token = data.access_token;
    this.tokenType = data.token_type;
    this.expiredAt = +new Date() + data.expires_in;
    return true;
  }

  async expired(log: Logger) {
    if (!this.token) return this.exchange(log);
    const now = +new Date();
    if (now > this.expiredAt) return this.exchange(log);
    return true;
  }

  async request(log: Logger, opt: AxiosRequestConfig) {
    await this.expired(log);
    const headers = opt.headers || { };
    headers['Authorization'] = `${this.tokenType} ${this.token}`;
    const opts = Object.assign({}, opt, { url: marketoConf.url + opt.url, headers: headers });
    const client = createClient(log);
    const ret = await client(opts);
    return ret.data;
  }
}

export const createLead = async (log: Logger, lead: MarketoLead) => {
  lead.leadSource = 'Dashboard API';
  const opt: AxiosRequestConfig = {
    url: '/rest/v1/leads.json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      action: 'createOnly',
      lookupField: 'email',
      input: [
        lead
      ]
    }
  };
  const ret = await OAuth.getInstance().request(log, opt);
  if (!ret.success) {
    console.error(`create marketo lead error[${lead.Company_ID__c}]: `, JSON.stringify(ret));
  }
  if (ret.result && ret.result.length > 0 && ret.result[0].status !== 'created') {
    console.error(`created marketo lead error[${lead.Company_ID__c}]: `, JSON.stringify(ret));
  }
  return ret;
};

export const getLead = async (log: Logger, email: string) => {
  const opt: AxiosRequestConfig = {
    url: `/rest/v1/leads.json?filterType=email&filterValues=${email}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const ret: any = await OAuth.getInstance().request(log, opt);
  if (ret.result && ret.result.length > 0) {
    return ret.result[0];
  }
  return undefined;
};

export const updateLead = async (log: Logger, leadid: number, attrs: { [key: string]: Object }) => {
  const body = Object.assign({ id: leadid }, attrs);
  const opt: AxiosRequestConfig = {
    url: '/rest/v1/leads.json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      action: 'updateOnly',
      lookupField: 'id',
      input: [
        body
      ]
    }
  };
  const ret = await OAuth.getInstance().request(log, opt);
  if (!ret.success) {
    console.error(`update marketo lead error[${leadid}]: `, JSON.stringify(ret));
  }
  if (ret.result && ret.result.length > 0 && ret.result[0].status !== 'updated') {
    console.error(`update marketo lead error[${leadid}]: `, JSON.stringify(ret));
  }
  return ret;
};
