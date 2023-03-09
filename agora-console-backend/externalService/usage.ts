import * as queryString from 'query-string';
import { Logger } from 'log4js';

import * as GwClient from '../utils/gw-request';
import { config } from '../config';
import { Params } from '../models/listReply';
import { generateUsageAPISign } from '../utils/encryptTool';

// https://confluence.agora.io/pages/viewpage.action?pageId=629006980
// http://58.211.21.117:19092/v2/usage/
export const getUsageInfo = async (log: Logger, params: Params) => {
  const client = GwClient.usage_gw_create(log);
  const paramsObj = params.params;
  const paramsString = queryString.stringify(paramsObj);
  const sign = encodeURIComponent(generateUsageAPISign(decodeURIComponent(`${paramsString}&secret=${config.usageAPISecret}`)));

  const ret = await client.get(`${config.usageBaseUrl}?${paramsString}&caller=dashboard&sign=${sign}`);
  return ret.data;
};

export const getRemainingUsage = async (log: Logger, companyId: number, ts: number) => {
  const client = GwClient.gw_create(log);
  const ret = await client.get(`${config.balanceBaseUrl}/v1/companies/${companyId}/usage-packages/remaining-usage/${ts}`);
  return ret.data;
};

export const getVendorUsageInfoDaily = async (log: Logger, params: Params, data: any) => {
  const client = GwClient.restful_gw_create(log);
  const paramsObj = params.params;
  const paramsString = queryString.stringify(paramsObj);
  const sign = encodeURIComponent(generateUsageAPISign(decodeURIComponent(`${paramsString}&secret=${config.usageAPISecret}`)));
  const ret = await client.post(`${config.vendorUsageBaseUrl}v2/usage/vendorDaily?${paramsString}&caller=dashboard&sign=${sign}`, data);
  return ret.data;
};

export const getUsageInfoBySku = async (log: Logger, params: Params, bodyData: any) => {
  const client = GwClient.usage_gw_create(log);
  const paramsObj = params.params;
  const paramsString = queryString.stringify(paramsObj);
  const sign = encodeURIComponent(generateUsageAPISign(decodeURIComponent(`${paramsString}&secret=${config.usageAPISecret}`)));

  const ret = await client.post(`${config.vendorUsageBaseUrl}v2/usage/sku/aggBySku?${paramsString}&caller=dashboard&sign=${sign}`, bodyData);
  return ret.data;
};
