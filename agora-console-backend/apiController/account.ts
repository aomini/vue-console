import * as Koa from 'koa';
import { ErrCode } from '../controller/apiCodes';
import * as AccountService from '../services/account';
import * as accountVerify from '../services/accountVerify';
import { config } from '../config';

import * as MarketingService from '../externalService/marketing';
import { doveProxyForSession } from '../externalService/DoveProxy';

export const sendVerifyEmail = async (ctx: Koa.Context) => {
  const { toUser, toEmail, lang, source, companyId, type, accountType } = ctx.request.body;
  if (!toEmail || !toUser || !companyId || (source !== 'sso' && source !== 'dashboard')) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }
  let tplID = '100031';
  if (lang === 'en') {
    tplID = '100032';
  }
  try {
    const token = await accountVerify.setEmailToken(source, toEmail, toEmail, companyId, accountType);
    const emailToken = token.accessToken;
    const verifyEmailUrl = await accountVerify.getVerifyUrl(source, emailToken, toEmail, type, '', companyId);
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
    ctx.status = 500;
    ctx.body = { code: ErrCode.SEND_EMAIL_ERROR };
  }
};

export const checkVerifyEmail = async (ctx: Koa.Context) => {
  const { token, type, source } = ctx.request.body;
  let result = undefined;
  try {
    const ret = await accountVerify.checkEmailToken(token);
    if (ret) {
      result = await AccountService.setEmailStatus(ret.user, ret.originEmail, type, ret.companyId, source);

      MarketingService.updateEmail(ret.originEmail, ret.companyId).catch(err => console.error(err));
    }
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.CHECK_EMAIL_TOKEN_ERROR };
  }
};
