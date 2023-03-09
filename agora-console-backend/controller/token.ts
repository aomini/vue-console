import * as Koa from 'koa';
import * as moment from 'moment';
import { config } from '../config';
import { ErrCode } from './apiCodes';
import { AccessToken2, ServiceRtc, ServiceChat, ServiceRtm, ServiceEducation } from '../externalService/AccessToken2';
import { encryptToken, decryptToken } from '../utils/encryptTool';
import * as ProjectService from '../services/project';
import * as UrlSignRecordService from '../services/urlSign';
import { AgoraChatService } from '../externalService/AgoraChatService';
import * as md5 from 'md5';
const APP_ENCRYPTION_KEY = Buffer.from(config.signTokenSecret.appIdSecret, 'base64');
const SIGN_ENCRYPTION_KEY = Buffer.from(config.signTokenSecret.signSecret, 'base64');

enum TokenProductType {
  RTC = 'RTC',
  RTM = 'RTM',
  APaaS = 'APaaS'
}

enum TokenType {
  Onboarding = 0,
  TempToken = 1
}

enum ChatTokenType {
  AppToken = 'app',
  UserToken = 'user'
}

export interface ProductTokenMetadata {
  product: string;
  fields: any;
}

export const generateChatToken = async (ctx: Koa.Context) => {
  const { projectId, type, userId } = ctx.request.query;
  const companyId = ctx.session.companyId;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  const res = await new AgoraChatService(ctx.logger).getInstanceByVid(companyId, projectInfo.id, area);
  if (!res || res.instances.length === 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_SUBSCRIPTION };
    return;
  }

  if (type === ChatTokenType.UserToken && !userId) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMETER_ERROR };
    return;
  }

  const APP_ID = projectInfo.key;
  const APP_CERTIFICATE = projectInfo.signkey;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimeInSeconds = 60 * 60 * 24;
  const token = new AccessToken2(APP_ID, APP_CERTIFICATE, currentTimestamp, expirationTimeInSeconds);

  if (type === ChatTokenType.AppToken) {
    const serviceChat = new ServiceChat();
    serviceChat.add_privilege(ServiceChat.kPrivilegeApp, expirationTimeInSeconds);
    token.add_service(serviceChat);
  } else if (type === ChatTokenType.UserToken) {
    try {
      const uuid = await new AgoraChatService(ctx.logger).getUserUuid(companyId, projectInfo.id.toString(), userId, area);
      const serviceChat = new ServiceChat(uuid);
      serviceChat.add_privilege(ServiceChat.kPrivilegeUser, expirationTimeInSeconds);
      token.add_service(serviceChat);
    } catch (e) {
      if (e.response.status === 404) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.FAILED_USER_ID };
        return;
      }
    }
  }

  ctx.body = {
    token: token.build(),
    expiredTs: currentTimestamp + expirationTimeInSeconds
  };
  ctx.status = 200;
};

export const generateAccessToken2 = async (ctx: Koa.Context) => {
  try {
    const { channel, id, type } = ctx.request.query;
    const companyId = ctx.session.companyId;
    if (!channel) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.NO_CHANNEL_NAME };
      return;
    }

    const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$');
    if (!pattern.test(channel)) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.INVALID_CHANNEL_NAME };
      return;
    }

    const projectInfo = await ProjectService.getProjectDetail(id, companyId);

    if (!projectInfo) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
      return;
    }

    const APP_ID = projectInfo.key;
    const APP_CERTIFICATE = projectInfo.signkey;
    const uid = 0;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimeInSeconds = parseInt(type, 10) === TokenType.TempToken ? 60 * 60 * 24 : 30 * 60;
    const token = new AccessToken2(APP_ID, APP_CERTIFICATE, currentTimestamp, expirationTimeInSeconds);
    const serviceRTC = new ServiceRtc(channel, uid);
    serviceRTC.add_privilege(ServiceRtc.kPrivilegeJoinChannel, expirationTimeInSeconds);
    if (projectInfo.inChannelPermission === 1) {
      serviceRTC.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, expirationTimeInSeconds);
      serviceRTC.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, expirationTimeInSeconds);
      serviceRTC.add_privilege(ServiceRtc.kPrivilegePublishDataStream, expirationTimeInSeconds);
    }
    token.add_service(serviceRTC);

    ctx.body = {
      token: token.build(),
      expiredTs: currentTimestamp + expirationTimeInSeconds
    };
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_TOKEN };
  }
};

const validateTokenList = (productTokenList: ProductTokenMetadata[]) => {
  const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$');
  let flag = true;
  productTokenList.forEach(item => {
    Object.values(item.fields).forEach((field: string) => {
      if (field === '' || !pattern.test(field)) {
        flag = false;
      }
    });
  });
  if (productTokenList.filter(item => item.product === TokenProductType.RTM || item.product === TokenProductType.APaaS).length >= 2) {
    flag = false;
  }
  return flag;
};

export const generateTempToken = async (ctx: Koa.Context) => {
  try {
    const { productTokenList, id } = ctx.request.body;
    const companyId = ctx.session.companyId;

    if (!validateTokenList(productTokenList)) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PARAMETER_ERROR };
      return;
    }
    const projectInfo = await ProjectService.getProjectDetail(id, companyId);
    if (!projectInfo) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
      return;
    }

    const APP_ID = projectInfo.key;
    const APP_CERTIFICATE = projectInfo.signkey;
    const uid = 0;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimeInSeconds = 60 * 60 * 24;
    const token = new AccessToken2(APP_ID, APP_CERTIFICATE, currentTimestamp, expirationTimeInSeconds);

    productTokenList.forEach(item => {
      if (item.product === TokenProductType.RTC) {
        const serviceRTC = new ServiceRtc(item.fields.channelName, uid);
        serviceRTC.add_privilege(ServiceRtc.kPrivilegeJoinChannel, expirationTimeInSeconds);
        if (projectInfo.inChannelPermission === 1) {
          serviceRTC.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, expirationTimeInSeconds);
          serviceRTC.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, expirationTimeInSeconds);
          serviceRTC.add_privilege(ServiceRtc.kPrivilegePublishDataStream, expirationTimeInSeconds);
        }
        token.add_service(serviceRTC);
      } else if (item.product === TokenProductType.RTM) {
        const serviceRTM = new ServiceRtm(item.fields.userId);
        serviceRTM.add_privilege(ServiceRtm.kPrivilegeLogin, expirationTimeInSeconds);
        token.add_service(serviceRTM);
      } else if (item.product === TokenProductType.APaaS) {
        const chatUserId = md5(item.fields.userId);
        const serviceEducation = new ServiceEducation(item.fields.roomId, item.fields.userId, item.fields.role);
        token.add_service(serviceEducation);
        const serviceRTM = new ServiceRtm(item.fields.userId);
        serviceRTM.add_privilege(ServiceRtm.kPrivilegeLogin, expirationTimeInSeconds);
        token.add_service(serviceRTM);
        const serviceChat = new ServiceChat(chatUserId);
        serviceChat.add_privilege(ServiceChat.kPrivilegeUser, expirationTimeInSeconds);
        token.add_service(serviceChat);
      }
    });

    ctx.body = {
      token: token.build(),
      expiredTs: currentTimestamp + expirationTimeInSeconds
    };
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_TOKEN };
  }
};

export const getUrlSignRecord = async (ctx: Koa.Context) => {
  const sign = ctx.params.signId;
  const currentTs = moment().unix();
  const tokenRecord = await UrlSignRecordService.getUrlSignRecord(sign, currentTs);
  ctx.status = 200;
  ctx.body = tokenRecord;
};

export const generateUrlSignRecord = async (ctx: Koa.Context) => {
  let token = '';
  const { channel, projectId, expiredTs } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  const userName = ctx.state.user.lastName;
  if (!channel) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_CHANNEL_NAME };
    return;
  }

  const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$');
  if (!pattern.test(channel)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.INVALID_CHANNEL_NAME };
    return;
  }

  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);

  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  if (projectInfo.signkey !== '') {
    const APP_ID = projectInfo.key;
    const APP_CERTIFICATE = projectInfo.signkey;
    const uid = 0;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const accessToken = new AccessToken2(APP_ID, APP_CERTIFICATE, currentTimestamp, expiredTs);
    const serviceRTC = new ServiceRtc(channel, uid);
    serviceRTC.add_privilege(ServiceRtc.kPrivilegeJoinChannel, expiredTs);
    accessToken.add_service(serviceRTC);
    token = accessToken.build();
  }

  const recordContent = {
    resId: encryptToken(projectInfo.key, APP_ENCRYPTION_KEY),
    resContent: token,
    channel,
    name: userName
  };

  const uuid = await UrlSignRecordService.generateUrlSignRecord(companyId, expiredTs, JSON.stringify(recordContent));
  const encrypted = encryptToken(uuid, SIGN_ENCRYPTION_KEY);
  ctx.status = 200;
  const res = encodeURIComponent(encrypted);
  ctx.body = { uuid: res };
};

export const decryptAppToken = async (ctx: Koa.Context) => {
  const { resId } = ctx.request.query;
  const decrypted = decryptToken(resId, APP_ENCRYPTION_KEY);
  ctx.status = 200;
  ctx.body = { decryptedResId: decrypted };
};

export const decryptSignToken = async (ctx: Koa.Context) => {
  const { sign } = ctx.request.query;
  const signDecoded = decodeURIComponent(sign);
  try {
    const decrypted = decryptToken(signDecoded, SIGN_ENCRYPTION_KEY);
    ctx.status = 200;
    ctx.body = { decryptedSign: decrypted };
  } catch (e) {
    ctx.status = 400;
    ctx.body = { errorMsg: 'Failed to decrypt' };
  }
};
