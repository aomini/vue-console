import * as Koa from 'koa';
import * as moment from 'moment';
import { ErrCode } from './apiCodes';
import { config } from '../config';
import * as VerificationService from '../services/verification';
import { doveProxyForSession } from '../externalService/DoveProxy';

const MAX_ATTEMPT_COUNT = 3;

export const generateVerificationCode = () => {
  return (`000000${Math.floor(Math.random() * 999999)}`).slice(-6);
};

export const generateEmailVerification = async (ctx: Koa.Context) => {
  const { id, email, companyId, emailStatus } = ctx.state.user;
  const verificationCode = generateVerificationCode();
  try {
    const currentVerification = await VerificationService.findCurrentVerification(id, companyId, VerificationService.VERIFICATION_TYPE.EMAIL);
    const currentTs = new Date().getTime();
    if (currentVerification && (currentTs / 1000) - moment(currentVerification.createdAt).unix() < 60) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_TIME_LIMIT };
      return;
    }

    if (emailStatus !== VerificationService.VERIFICATION_STATUS.IN_USE) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_NOT_VERIFIED };
      return;
    }

    await VerificationService.generateEmailVerification(id, companyId, verificationCode);
    const lang = ctx.state.user.language === 'chinese' ? 'cn' : 'en';
    const tplId = config.dove.getVerificationTplId(lang);
    const params = {
      receiverList: [email],
      templateId: tplId,
      templateParams: {
        company_name: ctx.state.user.company.name,
        company_email: email,
        verification_code: verificationCode
      }
    };
    await doveProxyForSession(ctx.logger).sendEmail(params);
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(e);
    ctx.status = 500;
    ctx.body = { code: ErrCode.VERIFICATION_FAILED_SEND };
  }
};

export const generatePhoneVerification = async (ctx: Koa.Context) => {
  const { id, companyId, verifyPhone } = ctx.state.user;
  const verificationCode = generateVerificationCode();
  try {
    const currentVerification = await VerificationService.findCurrentVerification(id, companyId, VerificationService.VERIFICATION_TYPE.PHONE);
    const currentTs = new Date().getTime();
    if (currentVerification && (currentTs / 1000) - moment(currentVerification.createdAt).unix() < 60) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_TIME_LIMIT };
      return;
    }

    if (!verifyPhone) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_NOT_VERIFIED };
      return;
    }
    console.log(verificationCode);
    await VerificationService.generatePhoneVerification(id, companyId, verificationCode);
    const params = {
      content: verificationCode,
      phone: verifyPhone
    };
    const smsResult = await doveProxyForSession(ctx.logger).sendSMSCode(params);
    ctx.status = 200;
    ctx.body = smsResult;
  } catch (e) {
    ctx.logger.error(e);
    ctx.status = 500;
    ctx.body = { code: ErrCode.VERIFICATION_FAILED_SEND };
  }
};

export const checkVerification = async (ctx: Koa.Context) => {
  const { id, companyId } = ctx.state.user;
  const { verificationCode, type } = ctx.request.body;

  try {
    const currentVerification = await VerificationService.findCurrentVerification(id, companyId, type);
    if (!currentVerification) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_WRONG_CODE };
      return;
    }
    if (currentVerification.triedCount >= MAX_ATTEMPT_COUNT) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_ATTEMPT_LIMIT };
      return;
    }
    if (currentVerification.verificationCode !== verificationCode) {
      await VerificationService.setCurrentAttemptAsFail(currentVerification);
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_WRONG_CODE };
      return;
    }

    if (moment(currentVerification.expiredAt).unix() < moment().unix()) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.VERIFICATION_WRONG_CODE };
      return;
    }

    await VerificationService.setCurrentAttemptAsSuccess(currentVerification);
    ctx.session.verified = true;

    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.VERIFICATION_WRONG_CODE };
    ctx.logger.error(e);
  }
};
