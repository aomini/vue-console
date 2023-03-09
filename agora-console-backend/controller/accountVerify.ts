import * as Koa from 'koa';
import * as AccountService from '../services/account';
import * as MarketingService from '../externalService/marketing';
import { ErrCode } from './apiCodes';
import { doveProxyForSession } from '../externalService/DoveProxy';

export const getSMSCode = async (ctx: Koa.Context) => {
  try {
    const isVerified = ctx.session.verified;
    const bothUnVerified = ctx.state.user.emailStatus === 0 && !ctx.state.user.verifyPhone;
    if (!isVerified && !bothUnVerified) {
      ctx.status = 403;
      return;
    }
    const phone = (ctx.query.phone || '').replace(/\s+/g, '').replace(/\-|\(|\)/g, '');
    if (!phone) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
      return;
    }
    const checkResult = await AccountService.checkPhoneExist(phone);
    if (checkResult) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PHONE_EXIST, errorMessage: 'phone exist' };
      return;
    }

    const code = Math.random().toString().slice(-4);
    const verifySMS = ctx.session.verifySMS;
    if (verifySMS) {
      // 检查60s只能发一次验证码逻辑
      const currentTs = new Date().getTime();
      if (Math.floor((currentTs - verifySMS.expires) / 1000) < 60) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.PHONE_MSG_TIME_LIMIT, errorMessage: 'phone msg 60s limit' };
        return;
      }
    }
    const params = {
      content: code,
      phone: phone
    };
    const smsResult = await doveProxyForSession(ctx.logger).sendSMSCode(params);
    ctx.session.verifySMS = {
      phone: phone,
      code: code,
      expires: new Date().getTime(),
      limit: 1
    };
    ctx.status = 200;
    ctx.body = smsResult;
  } catch (e) {
    console.log(e);
    ctx.status = 500;
    ctx.body = { code: 4022 };
  }
};

export const verifyPhone = async (ctx: Koa.Context) => {
  const phone = (ctx.request.body.phone || '').replace(/\s+/g, '').replace(/\-|\(|\)/g, '');
  const country = (ctx.request.body.country || '').toLocaleUpperCase();
  const user = ctx.state.user;
  const isMember = user.isMember;
  const companyId = ctx.session.companyId;
  const userId = ctx.session.userId;
  const { code } = ctx.request.body;
  let updateStatus = undefined;
  if (!phone || !code || !country) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING };
    return;
  }
  try {
    const verifySMS = ctx.session.verifySMS;
    console.log(verifySMS);
    if (!verifySMS) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PHONE_VERIFY_FAILED };
      return;
    }
    const currentTs = new Date().getTime();
    if (Math.floor((currentTs - verifySMS.expires) / 1000) > 60 * 10) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PHONE_MSG_EXPIRED };
      return;
    }
    if (verifySMS.phone === phone && verifySMS.code === code) {
      if (!isMember) {
        updateStatus = await AccountService.updateAccountPhone(phone, companyId, true);
      } else {
        updateStatus = await AccountService.updateMemberPhone(userId, phone, true);
      }
    } else {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PHONE_VERIFY_FAILED };
      return;
    }
    if (!isMember) {
      MarketingService.updatePhone(companyId).catch(err => console.log(err));
    }
    ctx.status = 200;
    ctx.body = updateStatus;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.PHONE_VERIFY_FAILED };
  }
};
