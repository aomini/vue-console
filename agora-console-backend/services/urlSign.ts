import { MoreThan } from 'typeorm';
import { generateUUID } from '../utils/encryptTool';
import { UrlSign } from '../models/urlSign';

const URL_SIGN_CONSOLE_TYPE = 2;

export const getUrlSignRecord = async (sign: string, currentTs: number) => {
  const tokenRecord = await UrlSign.findOne({ uuid: sign, expiredTs: MoreThan(currentTs), type: URL_SIGN_CONSOLE_TYPE });
  return tokenRecord ? tokenRecord.content : '';
};

export const generateUrlSignRecord = async (companyId: number, expiredTs: number, content: string) => {
  const inviteToken = new UrlSign();
  const uuid = generateUUID();
  inviteToken.uuid = uuid;
  inviteToken.companyId = companyId;
  inviteToken.expiredTs = expiredTs;
  inviteToken.content = content;
  inviteToken.type = URL_SIGN_CONSOLE_TYPE;
  await inviteToken.save();
  return uuid;
};
