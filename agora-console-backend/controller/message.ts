import * as Koa from 'koa';
import * as accountVerify from '../services/accountVerify';
import * as AccountService from '../services/account';
import { ErrCode } from './apiCodes';
import { processError } from '../utils/error';
import { config } from '../config';
import { doveProxyForSession } from '../externalService/DoveProxy';

export const getMessages = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const { limit, offset, readStatus, filterType } = ctx.query;
    let type = ctx.query.type;
    if (type === 'all') {
      if (filterType) {
        type = filterType;
      } else {
        ctx.status = 200;
        ctx.body = { totalSize: 0, elements: [] };
        return;
      }
    }
    /**
     * TODO: type 可能来源于前端传递的 filterType，这意味着通过接口伪造 filterType 可以获取所有类型的站内信（即使访问者没有相关权限）
     */
    const ret = await doveProxyForSession(ctx.logger).getSiteMailList(companyId, {
      _offset: offset,
      _length: limit,
      category: type,
      readStatus: readStatus
    });
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.GET_MESSAGE_ERROR };
  }
};

export const getMessageCount = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.state.user.companyId;
    const readStatus = ctx.query.readStatus || false;
    const category = ctx.query.category;
    if (!category) {
      ctx.status = 200;
      ctx.body = { totalSize: 0 };
      return;
    }
    const ret = await doveProxyForSession(ctx.logger).getSiteMailCount(companyId, {
      readStatus: readStatus,
      category: category
    });
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.GET_MESSAGE_ERROR };
  }
};

export const readMessage = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.session.companyId;
    const { id } = ctx.request.body;
    await doveProxyForSession(ctx.logger).markSiteMailAsRead(companyId, id);
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.READ_MESSAGE_ERROR };
  }
};

export const sendVerifyEmail = async (ctx: Koa.Context) => {
  const isVerified = ctx.session.verified;
  const bothUnVerified = ctx.state.user.emailStatus === 0 && !ctx.state.user.verifyPhone;
  if (!isVerified && !bothUnVerified) {
    ctx.status = 403;
    return;
  }
  const companyId = ctx.state.user.companyId;
  const originalEmail = ctx.state.user.email || '';
  const lang = ctx.state.user.locale;
  const GITHUB_ORIGIN = 3;
  let accountType = 1;
  const { toEmail, source } = ctx.request.body;
  let type = ctx.request.body.type;
  if (!toEmail || (source !== 'sso' && source !== 'dashboard')) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }
  if (!originalEmail || (originalEmail !== toEmail)) {
    type = 'update';
  }
  let tplID = '100031';
  if (lang === 'en') {
    tplID = '100032';
  }
  if (ctx.session.thirdParty) {
    if (ctx.session.thirdParty.isCocos) {
      accountType = 2;
    }
    if (ctx.session.thirdParty.origin === GITHUB_ORIGIN) {
      accountType = 3;
    }
  }
  if (type === 'update') {
    const user = await AccountService.uniqueEmail(toEmail, companyId);
    const member = await AccountService.uniqueMemberEmail(toEmail);
    if (user || member) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.EXIST_EMAIL };
      return;
    }
  }
  try {
    const token = await accountVerify.setEmailToken(source, toEmail, originalEmail, companyId, accountType);
    const emailToken = token.accessToken;
    const verifyEmailUrl = await accountVerify.getVerifyUrl(source, emailToken, toEmail, type, originalEmail, companyId);
    const preferenceUrl = config.dashboardSettingUrl;
    const params = {
      receiverList: [toEmail],
      templateId: tplID,
      templateParams: {
        preferenceUrl: preferenceUrl,
        verifyEmailUrl: verifyEmailUrl
      }
    };
    await doveProxyForSession(ctx.logger).sendEmail(params);
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.SEND_EMAIL_ERROR };
  }
};
