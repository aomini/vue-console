import { EmailToken } from '../models/accountVerify';
import { getManager } from 'typeorm';
import * as moment from 'moment';
import { generateUUID, md5 } from '../utils/encryptTool';
import { config } from '../config';
import * as UrlSignRecordService from './urlSign';

export const setEmailToken = async (source: string, user: string, originEmail: string, companyId: number, accountType: number): Promise<EmailToken> => {
  const tokenDB = getManager().getRepository(EmailToken);
  const emailToken = new EmailToken();
  const uuid = generateUUID();
  const accessToken = md5(uuid).toString('hex');
  emailToken.accessToken = accessToken;
  emailToken.source = source;
  emailToken.user = user;
  emailToken.companyId = companyId;
  emailToken.originEmail = originEmail;
  emailToken.accountType = accountType;
  const emailExpireMs = 24 * 3600 * 1000;
  const expireTime = Date.now() + emailExpireMs;
  emailToken.accessTokenExpiresAt = expireTime;
  const ret = await tokenDB.save(emailToken);
  return ret;
};

export const getVerifyUrl = async (source: string, token: string, email: string, type: string, originEmail: string, companyId: number) => {
  const verifyUrl = config.verifyEmailUrl;
  const expiredTs = moment().unix() + 24 * 3600;
  const recordContent = {
    source: source,
    token: token,
    email: email,
    type: type,
    originEmail: originEmail
  };

  const uuid = await UrlSignRecordService.generateUrlSignRecord(companyId, expiredTs, JSON.stringify(recordContent));
  return `${verifyUrl}?sign=${uuid}`;
};

export const checkEmailToken = async (token: string) => {
  let emailToken = undefined;
  emailToken = await EmailToken.findOne({ accessToken: token });
  if (!emailToken) return false;
  if (Date.now() > emailToken.accessTokenExpiresAt) return false;
  return emailToken;
};
