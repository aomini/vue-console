import * as Koa from 'koa';
import { ErrCode } from './apiCodes';
import * as AccountService from '../services/account';
import { checkActiveProjectsAmount } from '../services/project';
// import { checkActivePackageAmount } from '../services/package';
import { getMembersCountByCompany } from '../services/member';
import { destroySession } from '../utils/session';
import { config } from '../config';
import * as MarketingService from '../externalService/marketing';
import { getCashInfo } from '../externalService/finance';
import * as moment from 'moment';
import { AccountAuthStatus } from '../models/accountAuth';
import { archerProxyForSession } from '../externalService/archerService';
import { forceLogout } from './auth';
import { ssoProxyForSession } from '../externalService/SSOProxy';

export const updateCompanyName = async (ctx: Koa.Context) => {
  let { companyName } = ctx.request.body;
  const companyId = ctx.session.companyId;
  const format = /["\\<>]/;
  companyName = companyName.trim();
  if (!companyName || format.test(companyName) || companyName.length > 100) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.INVALID_COMPANYNAME };
    return;
  }
  try {
    const reply = await AccountService.updateCompanyName(companyId, companyName);
    if (reply) {
      ctx.status = 200;
      ctx.body = reply;
    } else {
      ctx.status = 400;
      ctx.body = { code: ErrCode.NOT_REGISTERED };
    }
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_UPDATE_USER_INFO };
  }
};

export const getAccountAAPermission = async (ctx: Koa.Context) => {
  let userId = ctx.state.user.id;
  const companyId = ctx.session.companyId;
  const isMember = !!ctx.session.isMember;
  try {
    if (isMember) {
      const account = await AccountService.getMainAccountByCompanyId(companyId);
      userId = account.id;
    }
    const permissions = await AccountService.getAccountAAPermission(userId);
    ctx.body = permissions;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const exit = async (ctx: Koa.Context) => {
  destroySession(ctx);
  ctx.status = 200;
  ctx.redirect(`${config.oauth2.baseURL}${config.oauth2.logoutPath}`);
};

export const getCompanyFieldInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const companyFieldInfo = await AccountService.getCompanyFieldInfo(companyId);
    ctx.status = 200;
    ctx.body = companyFieldInfo;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const setCompanyFieldInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { fieldType, value } = ctx.request.body;
  let companyFieldInfo = undefined;
  try {
    if (fieldType === 'onboarding') {
      companyFieldInfo = await AccountService.setCompanyField(companyId, 'onboarding', 1);
      MarketingService.updateAttr(companyId, {
        Onboarding_complete_time__c: moment().format('YYYY-MM-DD HH:mm:ss')
      }).catch(err => console.error(err));
    } else if (fieldType === 'viewAA') {
      companyFieldInfo = await AccountService.setCompanyField(companyId, 'viewAA', 1);
      MarketingService.updateAttr(companyId, {
        AA_tutorial_complete_time__c: moment().format('YYYY-MM-DD HH:mm:ss')
      }).catch(err => console.error(err));
    } else if (fieldType === 'feedback') {
      companyFieldInfo = await AccountService.setCompanyField(companyId, 'feedback', 1);
    } else if (fieldType === 'showVendorCreator') {
      companyFieldInfo = await AccountService.setCompanyField(companyId, 'showVendorCreator', Number(value));
    }
    ctx.status = 200;
    ctx.body = companyFieldInfo;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const getUserInfoByUserId = async (ctx: Koa.Context) => {
  const { userId } = ctx.request.query;
  try {
    const userInfo = await AccountService.getUserInfoByUserId(userId);
    ctx.status = 200;
    ctx.body = userInfo;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const getConsoleOperationAllowance = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;

  try {
    const allowanceInfo = await AccountService.getConsoleOperationAllowance(companyId);
    ctx.status = 200;
    ctx.body = allowanceInfo;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_OPERATION_ALLOWANCE_OPERATION };
  }
};

export const updateConsoleOperationAllowance = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const accountId = ctx.state.user.id;
  const { status } = ctx.request.body;

  try {
    const updatedAllowance = await AccountService.updateConsoleOperationAllowance(companyId, accountId, Number(status));
    ctx.status = 200;
    ctx.body = updatedAllowance;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_UPDATE_OPERATION_ALLOWANCE_OPERATION };
  }
};

export const getAccountAuth = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const accountId = ctx.state.user.id;
  const accountAuth = await AccountService.getAccountAuth(companyId, accountId);

  if (accountAuth) {
    ctx.body = accountAuth;
  } else {
    ctx.body = {
      status: AccountAuthStatus.No
    };
  }
};

export const updateAccountAuth = async (ctx: Koa.Context) => {
  const { status } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  const accountId = ctx.state.user.id;

  if (![AccountAuthStatus.Yes, AccountAuthStatus.No].includes(status)) {
    ctx.status = 400;
    ctx.body = 'error';
  }

  const accountAuth = await AccountService.getAccountAuth(companyId, accountId);

  if (accountAuth) {
    await AccountService.updateAccountAuth(companyId, accountId, status);
  } else {
    await AccountService.createAccountAuth(companyId, accountId, status);
  }

  if (AccountAuthStatus.Yes === status) {
    await forceLogout(ctx);
    return;
  }

  ctx.body = 'success';
};

export const submitDelete = async (ctx: Koa.Context) => {
  const { reason } = ctx.request.body;
  const user = ctx.state.user;
  const companyId = ctx.state.user.companyId;
  try {
    if (user.isMember) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_IS_MEMBER };
      return;
    }

    if (user.company.source === 2 || user.company.resellerId !== '0') {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_IS_COCOS };
      return;
    }

    const activeProjects = await checkActiveProjectsAmount(companyId);
    if (activeProjects) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_ACTIVE_PROJECTS };
      return;
    }

    const balanceInfo = await getCashInfo(ctx.logger, companyId);
    if (balanceInfo.accountBalance !== 0) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_BALANCE };
      return;
    }

    const activeMembers = await getMembersCountByCompany(companyId);
    if (activeMembers) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_MEMBERS };
      return;
    }

    await archerProxyForSession(ctx.logger).submitAccountDelete(companyId, reason);
    ctx.status = 200;
  } catch (e) {
    if (Number(e.statusCode) === 400) {
      if (e.extras.response.data.indexOf('applications') >= 0) {
        ctx.body = { code: ErrCode.DELETE_ACCOUNT_SUBMIT_NOT_ALLOWED };
      } else {
        ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_USAGE };
      }
      ctx.status = 400;
    } else {
      ctx.status = Number(e.response.status) || 500;
      ctx.body = { code: ErrCode.FAILED_DELETE_ACCOUNT_SUBMIT };
      ctx.logger.error(e);
    }
  }
};

export const submitDeleteCheck = async (ctx: Koa.Context) => {
  const user = ctx.state.user;
  const companyId = user.companyId;
  if (user.isMember) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_IS_MEMBER };
    return;
  }

  if (user.company.source === 2 || user.company.resellerId !== '0') {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_IS_COCOS };
    return;
  }

  const activeProjects = await checkActiveProjectsAmount(companyId);
  if (activeProjects) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_ACTIVE_PROJECTS };
    return;
  }

  const balanceInfo = await getCashInfo(ctx.logger, companyId);
  if (balanceInfo.accountBalance !== 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_BALANCE };
    return;
  }

  const activeMembers = await getMembersCountByCompany(companyId);
  if (activeMembers) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_SUBMIT_DELETE_MEMBERS };
    return;
  }

  ctx.status = 200;
};

export const getAccountLayoutSetting = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const accountId = ctx.state.user.id;
  try {
    const setting = await AccountService.getAccountLayoutSetting(companyId, accountId);
    ctx.status = 200;
    ctx.body = setting;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_LAYOUT_SETTING };
  }
};

export const updateAccountLayoutSetting = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const accountId = ctx.state.user.id;
  const setting = ctx.request.body.setting;
  try {
    await AccountService.updateAccountLayoutSetting(companyId, accountId, setting);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_UPDATE_LAYOUT_SETTING };
  }
};

export const updateAccountLanguage = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const userId = ctx.state.user.isMember ? ctx.state.user.id : 0;
  const language = ctx.request.body.language;
  try {
    await ssoProxyForSession(ctx.logger).updateAccountLanguage(companyId, userId, language);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_UPDATE_LAYOUT_SETTING };
  }
};
