import { Logger } from 'log4js';
import * as Client from '../utils/request';
import { md5 } from '../utils/encryptTool';
import { config } from '../config';

export const getWhiteBoardToken = async (log: Logger, appId: string) => {
  const client = Client.create(log);
  const ret = await client.get(`${config.whiteBoard.baseUrl}/${appId}`);
  return ret.data;
};

export const updateWhiteBoardToken = async (log: Logger, appId: string, token: string, customerId: string, customerCertificate: string, companyName: string) => {
  const client = Client.create(log);
  const ret = await client.put(`${config.whiteBoard.baseUrl}/${appId}`, { herewhiteToken: token, customerId, customerCertificate, companyName });
  return ret.data;
};

export const getApaasConfig = async (log: Logger, appId: string) => {
  const client = Client.create(log, { headers: { secret: md5('7AIsPeMJgQAppO0Z').toString('hex') } });
  const ret = await client.get(`${config.apaas.baseUrl}/${appId}`);
  return ret.data;
};

export const updateApaasConfig = async (log: Logger, appId: string, certificate: string, vid: number, token: string, state: number, customerId: string, customerCertificate: string, companyName: string, appConfigs: any) => {
  const client = Client.create(log, { headers: { secret: md5('7AIsPeMJgQAppO0Z').toString('hex') } });
  const ret = await client.put(`${config.apaas.baseUrl}/${appId}`, { vid, herewhiteToken: token, state, customerId, customerCertificate, appCertificate: certificate, companyName, appConfigs });
  return ret.data;
};
