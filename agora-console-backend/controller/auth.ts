import * as Koa from 'koa';
import * as qs from 'qs';
import { config } from '../config';
import { User } from '../models/user';
import * as AccountService from '../services/account';
import { syncRemoteCocosProject } from '../services/cocos';
import { destroySession, resetSession } from '../utils/session';
import { AccountAuthStatus } from '../models/accountAuth';
import { ConsoleSSO } from '../services/ConsoleSSO';

const consoleSSO = new ConsoleSSO(config.oauth2);

const getUserInfo = async (companyId: number, userId: number, isMember: boolean): Promise<User> => {
  if (!isMember) {
    return AccountService.getMainAccountByCompanyId(companyId);
  }
  return AccountService.getMemberAccountByCompanyId(companyId, userId);
};

export const forceLogout = async (ctx: Koa.Context) => {
  destroySession(ctx);
  ctx.status = 401;
  ctx.body = { redirect_uri: `${config.oauth2.baseURL}${config.oauth2.logoutPath}` };
};

const COCOS_ORIGIN = 2;
export const getRedirectPath = (ctx) => {
  const expiresIn = 30 * 24 * 3600;
  ctx.cookies.set('origin_url', ctx.request.headers.referer, {
    maxAge: expiresIn * 1000,
    domain: config.oauth.domain
  });
  const params: any = {
    response_type: 'code',
    client_id: config.oauth2.clientId,
    redirect_uri: config.oauth2.callbackUri,
    scope: 'basic_info'
  };
  const query = qs.stringify(params, {
    arrayFormat: 'repeat'
  });
  return `${config.oauth2.baseURL}${config.oauth2.authorizePath}?${query}`;
};

export const getThirdPartyInfo = async (accountId: number) => {
  const ssoAccountInfo = await AccountService.getThirdAccount(accountId);
  const thirdPartyInfo = {
    uid: ssoAccountInfo.uid,
    origin: ssoAccountInfo.origin,
    corporation_id: ssoAccountInfo.corporationId
  };
  return thirdPartyInfo;
};

export const authUser = async (ctx: Koa.Context, next: () => Promise<any>) => {
  const companyId = ctx.session.companyId;
  const isMember = !!ctx.session.isMember;
  const userId = ctx.session.userId;
  const isRoot = !!ctx.session.isRoot;
  const secret = ctx.session.secret;

  if (!companyId) {
    ctx.status = 401;
    ctx.body = { redirect_uri: getRedirectPath(ctx) };
    return;
  }
  try {
    const userInfo = await getUserInfo(companyId, userId, isMember);
    if (!userInfo) {
      ctx.status = 401;
      ctx.body = { redirect_uri: getRedirectPath(ctx) };
      return;
    }

    const accountSecret = await AccountService.getAccountSecretInfo(userInfo.email, userId, isMember);
    if (secret && accountSecret !== secret) {
      ctx.status = 401;
      destroySession(ctx);
      ctx.body = { redirect_uri: `${config.oauth2.baseURL}${config.oauth2.logoutPath}` };
      return;
    }

    const consoleOperationAllowance = await AccountService.getConsoleOperationAllowance(companyId);
    const accountAuth = await AccountService.getAccountAuth(companyId, userId);
    const verified = ctx.session.verified || (accountAuth ? accountAuth.status === AccountAuthStatus.No : true) || !!consoleOperationAllowance;
    ctx.state.user = Object.assign({}, userInfo, { isRoot, locale: userInfo.locale, verified });
  } catch (e) {
    ctx.logger.error(e.message);
    ctx.status = 401;
    ctx.body = { redirect_uri: getRedirectPath(ctx) };
    return;
  }
  await next();
};

export const oauth2Callback = async (ctx: Koa.Context) => {
  const { code, loginId } = ctx.request.query;
  if (!code) {
    ctx.status = 500;
    ctx.redirect(getRedirectPath(ctx));
    return;
  }
  try {
    const accessToken = await consoleSSO.getAccessTokenFromCode(ctx.logger, code);
    const userInfo = await consoleSSO.getUserInfo(ctx.logger, accessToken);
    resetSession(ctx);
    ctx.session.companyId = userInfo.companyId;
    ctx.session.companyId = userInfo.companyId;
    ctx.session.isMember = !!userInfo.userId;
    ctx.session.email = userInfo.email;
    ctx.session.verified = false;
    ctx.session.userId = userInfo.userId || userInfo.profileId;
    ctx.session.loginId = loginId;

    if (userInfo.accountType === 'JointAccount') {
      const thirdPartyInfo = await getThirdPartyInfo(userInfo.profileId);
      ctx.session.thirdParty = thirdPartyInfo;
      if (thirdPartyInfo.origin === COCOS_ORIGIN) {
        await syncRemoteCocosProject(ctx.session.thirdParty.uid, userInfo.companyId);
      }
      ctx.session.secret = '';
    } else {
      const accountSecret = await AccountService.getAccountSecretInfo(userInfo.email, ctx.session.userId, !!userInfo.isUser);
      ctx.session.secret = accountSecret;
    }
    const redirectUri = ctx.cookies.get('origin_url') || '/';
    ctx.redirect(redirectUri);
  } catch (e) {
    ctx.logger.error(e);
    ctx.status = 500;
    ctx.redirect(getRedirectPath(ctx));
  }
};
