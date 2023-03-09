import { config } from '../config';
const eloquaConf = config.eloqua;
import { create as createClient } from '../utils/request';
import { Logger } from 'log4js';
import { AxiosRequestConfig } from 'axios';

export interface EloquaContact {
  C_EmailAddress: string;
  C_Company?: string;
  C_Company_ID1?: number;
  C_Acquisition_Date1?: Date;
  C_MQL_Source1?: string;
  C_Origin1?: string;
  C_MobilePhone?: string;
  C_Verified_Mobile_Date1?: Date;
  C_Verified_Mobile_Number1?: string;
  C_sign_up_OS1?: string;
  C_FirstName?: string;
  C_LastName?: string;
  C_utm_source1?: string;
  C_utm_medium1?: string;
  C_utm_campaign1?: string;
  C_utm_keyword1?: string;
  C_utm_device1?: string;
  C_Tech_Platform1?: string;
  C_Product_Interest1?: string;
  C_state1?: string;
  C_effective_email1?: string;
}

const eloquaFieldNameMapping = {
  'Onboarding_complete_time__c': 'C_Onboarding_complete_time1',
  'AA_tutorial_complete_time__c': 'C_AA_tutorial_complete_time1',
  'Authentication_Status__c': 'C_Authentication_Status1',
  'Authentication_status_last_updated_time__c': 'C_Authentication_status_last_updated_time1',
  'Last_enable_cloud_recording__c': 'C_Last_enable_cloud_recording1',
  'Last_enable_mini_app__c': 'C_Last_enable_mini_app1',
  'Last_enable_rtmp_converter__c': 'C_Last_enable_rtmp_converter1',
  'CN_Has_created_project__c': 'C_CN_Has_created_project1',
  'Project_amount__c': 'C_project_amount1',
  'First_project_use_case__c': 'C_first_project_use_case1',
  'Internal_industry__c': 'C_internal_industry1'
};

const fieldIdMapping = {
  'C_EmailAddress': '100001', // 模拟邮箱： [companyId]@agora.io
  'C_FirstName': '100002',
  'C_LastName': '100003',
  'C_Verified_Mobile_Number1': '100210',
  'C_Company': '100004',
  'C_Company_ID1': '100195',
  'C_Acquisition_Date1': '100197',
  'C_MQL_Source1': '100200',
  'C_Origin1': '100201',
  'C_MobilePhone': '100014',
  'C_Product_Interest1': '100202',
  'C_Tech_Platform1': '100203',
  'C_utm_campaign1': '100204',
  'C_utm_device1': '100205',
  'C_utm_keyword1': '100206',
  'C_utm_medium1': '100207',
  'C_utm_source1': '100208',
  'C_Verified_Mobile_Date1': '100209',
  'C_state1': '100211',
  'C_sign_up_OS1': '100237',
  'C_Onboarding_complete_time1': '100219',
  'C_AA_tutorial_complete_time1': '100221',
  'C_Authentication_Status1': '100217',
  'C_Authentication_status_last_updated_time1': '100218',
  'C_Last_enable_cloud_recording1': '100223',
  'C_Last_enable_mini_app1': '100224',
  'C_Last_enable_rtmp_converter1': '100225',
  'C_CN_Has_created_project1': '100262',
  'C_project_amount1': '100296',
  'C_first_project_use_case1': '100298',
  'C_internal_industry1': '100299',
  'C_effective_email1': '100301' // 用户真实邮箱
};

const utf8ToBase64 = (content: string) => {
  return Buffer.from(content).toString('base64');
};

const makeAuth = (companyName: string, username: string, password: string) => {
  const userpwd = `${companyName}\\${username}:${password}`;
  return `Basic ${utf8ToBase64(userpwd)}`;
};

const authorization = makeAuth(eloquaConf.company, eloquaConf.username, eloquaConf.password);
class EloquaClient {
  private static instance: any;

  async request(log: Logger, opt: AxiosRequestConfig) {
    const headers = opt.headers || { };
    headers['Authorization'] = authorization;
    const opts = Object.assign({}, opt, { url: eloquaConf.url + opt.url, headers: headers });
    const client = createClient(log);
    const ret = await client(opts);
    return ret.data;
  }

  static getClient() {
    if (this.instance) return this.instance;
    this.instance = new EloquaClient();
    return this.instance;
  }
}

export const createContact = async (log: Logger, lead: EloquaContact) => {
  console.info('createContact');
  const fieldValues = [];
  for (const key in lead) {
    fieldValues.push({
      id: fieldIdMapping[key],
      value: lead[key]
    });
  }
  const params = {
    fieldValues: fieldValues
  };
  console.info(JSON.stringify(params));
  const opt: AxiosRequestConfig = {
    url: '/api/REST/1.0/data/contact',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: params
  };
  return EloquaClient.getClient().request(log, opt);
};

export const getContactsByCompanyId = async (log: Logger, companyId: number) => {
  const opt: AxiosRequestConfig = {
    url: `/api/REST/1.0/data/contacts?search=C_Company_ID1=${companyId}`,
    method: 'GET'
  };
  const ret = await EloquaClient.getClient().request(log, opt);
  if (ret && ret.elements && ret.elements.length > 0) {
    return ret.elements[0];
  }
  return undefined;
};

export const updateAttrByContactId = async (log: Logger, contactId: string, attrs: { [key: string]: Object }) => {
  const fieldValues = [];
  const formatAttrs = {};

  // salesforce字段名转换
  for (const key in attrs) {
    if (eloquaFieldNameMapping[key]) {
      formatAttrs[eloquaFieldNameMapping[key]] = attrs[key];
    } else {
      formatAttrs[key] = attrs[key];
    }
  }
  for (const key in formatAttrs) {
    if (fieldIdMapping[key]) {
      fieldValues.push({
        id: fieldIdMapping[key],
        value: formatAttrs[key]
      });
    }
  }
  if (fieldValues.length === 0) {
    return;
  }
  const params = Object.assign({ id: contactId }, { fieldValues });
  const opt: AxiosRequestConfig = {
    url: `/api/REST/1.0/data/contact/${contactId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    data: params
  };
  return EloquaClient.getClient().request(log, opt);
};

export const updateAttr = async (log: Logger, companyId: number, attrs: { [key: string]: Object }) => {
  console.info('eloqua updateAttr');
  const ret = await getContactsByCompanyId(log, companyId);
  if (!ret) {
    throw new Error(`record form companyID[${companyId}] not exists`);
  }
  return updateAttrByContactId(log, ret.id, attrs);
};
