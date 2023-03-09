import * as Koa from 'koa';
import validator from 'validator';
import { ErrCode } from './apiCodes';
import * as ReceiptService from '../services/receipt';
import * as NotificationService from '../services/notification';
import * as AccountService from '../services/account';
import * as accountVerify from '../services/accountVerify';
import { config } from '../config';
import * as ProjectService from '../services/project';

import * as MarketingService from '../externalService/marketing';
import { doveProxyForSession } from '../externalService/DoveProxy';

export const applyReceipt = async (ctx: Koa.Context) => {
  const { companyId } = ctx.request.query;
  const { billingRecordIdSet, extra, amount, salesEmail } = ctx.request.body;
  if (!billingRecordIdSet || !amount || !companyId) {
    ctx.status = 400;
    ctx.body = { message: 'miss params' };
    return;
  }
  let applyReceipt = undefined;
  const billPeriod = extra.join('，');
  try {
    const settings = await ReceiptService.getReceiptSetting(companyId);
    if (!settings || settings.autoApply !== 1) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.RECEIPT_SETTING_NOT_MATCH, errorMessage: 'receipt setting not match' };
      return;
    }
    for (const bill of billingRecordIdSet) {
      const checkBill = await ReceiptService.checkBill(bill);
      if (checkBill) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.RECEIPT_ALLREADY_EXIST, errorMessage: 'receipt already exist' };
        return;
      }
    }
    if (settings.receiptType === 2) {
      if (!settings.name || !settings.creditCode || !settings.consignee || !settings.consigneePhone || !settings.consigneeAddress) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.RECEIPT_SETTING_NOT_MATCH, errorMessage: 'miss some receipt setting' };
        return;
      }
      applyReceipt = await ReceiptService.applyEnterpriseSpecialReceipt(companyId, settings.name, settings.email, settings.ccListStr, settings.creditCode, settings.address, settings.phone, settings.bankName, settings.bankBranch, settings.bankAccount, billPeriod, amount, settings.consignee, settings.consigneePhone, settings.consigneeAddress, salesEmail);
    }
    if (settings.receiptType === 0) {
      applyReceipt = await ReceiptService.applyPersonReceipt(companyId, settings.name, settings.email, settings.idNumber, billPeriod, amount, salesEmail);
    }
    if (settings.receiptType === 1) {
      applyReceipt = await ReceiptService.applyEnterpriseReceipt(companyId, settings.name, settings.email, settings.creditCode, settings.address, settings.phone, settings.bankName, settings.bankBranch, settings.bankAccount, billPeriod, amount, salesEmail);
    }
    for (const bill of billingRecordIdSet) {
      if (applyReceipt && applyReceipt.id) {
        await ReceiptService.recordBill(applyReceipt.id, bill);
      }
    }
    ctx.status = 200;
    ctx.body = applyReceipt;
  } catch (e) {
    let errorMessage = 'fail to set receipt info';
    if (e.response && e.response.data && e.response.data.errorMessage) {
      errorMessage = e.response.data.errorMessage;
    }
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_SET_RECEIPT_INFO, errorMessage: errorMessage };
    ctx.logger.error(e);
  }
};

export const getMessageSetting = async (ctx: Koa.Context) => {
  const { userId, companyId } = ctx.request.query;
  let verifyPhone = undefined;
  if (!userId || !companyId) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }
  let isMember = 0;
  const member = await AccountService.getMemberInfo(userId, companyId);
  if (member) {
    isMember = 1;
    verifyPhone = member.verifyPhone;
  }
  const account = await AccountService.getAccountByCompanyId(companyId);
  if (account) {
    verifyPhone = account.verifyPhone;
  }
  if (!member && !account) {
    ctx.body = { code: ErrCode.ACCOUNT_NOT_EXIST, errorMessage: 'account not exist' };
    return;
  }
  const result = {};
  try {
    const notificationTypes = await NotificationService.getNotificationTypes();
    for (const notification of notificationTypes) {
      const setting = await NotificationService.getMessageSettingByType(notification.id, userId, isMember);
      notification.setting = setting;
      if (!verifyPhone) {
        notification.setting.textOpen = 0;
      }
      result[notification.key] = setting;
    }
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

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
  if (!validator.isEmail(toEmail)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.SEND_EMAIL_ERROR, errorMessage: 'email invalid' };
    return;
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

export const getVendorGroups = async (ctx: Koa.Context) => {
  try {
    const groupVids = await ProjectService.getVendorGroups();
    const group = [];
    let vids = [];
    for (const groupVid of groupVids) {
      if (!groupVid.vendorsId) {
        continue;
      }
      vids = [];
      groupVid.vendorsId.split(',').forEach((element) => {
        vids.push(parseInt(element, 10));
      });
      group.push({
        'groupVid' : groupVid.id,
        'vidList' : vids
      });
    }
    ctx.status = 200;
    ctx.body = group;
  } catch (e) {
    let errorMessage = 'fail to get vendor groups';
    if (e.response && e.response.data && e.response.data.errorMessage) {
      errorMessage = e.response.data.errorMessage;
    }
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_VENDORGROUPS, errorMessage: errorMessage };
    ctx.logger.error(e);
  }
};
