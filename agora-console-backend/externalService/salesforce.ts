
import * as qs from 'qs';
import { config } from '../config';
const salesforceConf = config.salesforce;

import { create as createClient } from '../utils/request';
import { Logger } from 'log4js';
import { AxiosRequestConfig } from 'axios';

export const SALESFORCE_PHONE_FIELD = 'Verified_mobile_number__c';
export const SALESFORCE_PHONE_VERIFY_DATE_FIELD = 'Verified_mobile_date__c';

export interface SalesforceLead {
  Email: string;
  mkto71_Acquisition_Date__c?: string;
  Company_ID__c?: number;
  LastName?: string;
  FirstName?: string;
  Origin__c?: string;
  Company?: string;
  Phone?: string;
  Industry?: string;
  LeadSource?: string;
  RecordTypeId?: string;
  Tech_Platform__c?: string;
  Product_Interest__c?: string;
  CN_Lead_Source_Type__c?: any;
  Verified_mobile_number__c?: string;
  Verified_mobile_date__c?: string;
}

class OAuth {
  private static instance: any;

  private token: string;
  private tokenType: string;
  private expiredAt: number;
  private restUrl: string;

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new OAuth();
    return this.instance;
  }

  async exchange(log: Logger) {
    const formdata = {
      grant_type: 'password',
      client_id: salesforceConf.clientId,
      client_secret: salesforceConf.clientSecret,
      username: salesforceConf.username,
      password: salesforceConf.password
    };
    const client = createClient(log);
    const ret = await client.post(salesforceConf.tokenURL, qs.stringify(formdata), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    this.restUrl = ret.data.instance_url;
    this.token = ret.data.access_token;
    this.tokenType = ret.data.token_type;
    this.expiredAt = salesforceConf.expireTime + (+ret.data.issued_at);
    return true;
  }

  expired(log: Logger) {
    if (!this.token) return this.exchange(log);
    const now = +new Date();
    if (now > this.expiredAt) return this.exchange(log);
    return Promise.resolve(true);
  }

  async request(log: Logger, opt: AxiosRequestConfig) {
    await this.expired(log);
    opt.headers = opt.headers || { };
    opt.headers['Authorization'] = `${this.tokenType} ${this.token}`;
    opt.url = `${this.restUrl}${opt.url}`;
    const client = createClient(log);
    return client(opt);
  }
}

export const createLead = async (log: Logger, lead: SalesforceLead) => {
  lead.LeadSource = 'Dashboard API';
  lead.RecordTypeId = '0126A000000T8dU';
  const opt: AxiosRequestConfig = {
    url: '/services/data/v41.0/sobjects/Lead',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: lead
  };
  return OAuth.getInstance().request(log, opt);
};

export const getLeadsByCompanyId = async (log: Logger, companyId: number) => {
  const opt: AxiosRequestConfig = {
    url: `/services/data/v41.0/query?q=SELECT Id FROM Lead where Company_ID__c = ${companyId}`,
    method: 'GET'
  };
  const ret = await OAuth.getInstance().request(log, opt);
  if (ret.data && ret.data.records && ret.data.records.length > 0) {
    return ret.data.records[0];
  }
  return undefined;
};

export const updateProjectHasCreated = async (log: Logger, companyId: number, projectHasCreated: boolean) => {
  const ret = await getLeadsByCompanyId(log, companyId);
  if (!ret) {
    throw new Error(`record form companyID[${companyId}] not exists`);
  }
  const opt: AxiosRequestConfig = {
    url: `/services/data/v41.0/sobjects/Lead/${ret.Id}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      'CN_Has_created_project__c': projectHasCreated
    }
  };
  return OAuth.getInstance().request(log, opt);
};

export const updateAttrByObjectId = async (log: Logger, objectId: string, attrs: { [key: string]: Object }) => {
  const opt: AxiosRequestConfig = {
    url: `/services/data/v41.0/sobjects/Lead/${objectId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    data: attrs
  };
  return OAuth.getInstance().request(log, opt);
};

export const updateAttr = async (log: Logger, companyId: number, attrs: { [key: string]: Object }) => {
  const ret = await getLeadsByCompanyId(log, companyId);
  if (!ret) {
    throw new Error(`record form companyID[${companyId}] not exists`);
  }
  return updateAttrByObjectId(log, ret.Id, attrs);
};
