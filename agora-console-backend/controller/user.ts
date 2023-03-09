import * as Koa from 'koa';
import { User } from '../models/user';
import { validateTokenExpired, getAccountInfo, validateTokenSign, generateSignToken } from '../utils/deprecatedEncry';

import * as JWT from 'jsonwebtoken';

import * as UserService from '../services/account';
import { config } from '../config';
import { generateUUID } from '../utils/encryptTool';
import { resetSession } from '../utils/session';

const AgoraTokenKey = 'agora_token';

const tokenMaxAge = 1000 * 86400 * 30;
const sudoMaxAge = 8 * 3600 * 1000;

const getUserInfo = async (userId: number, isMember: boolean): Promise<User> => {
  if (isMember) {
    return UserService.getMemberUserById(userId);
  }
  return UserService.getUserInfoByAccountId(userId);
};

const getMainAccount = async (companyId: number): Promise<User> => {
  return UserService.getMainAccountByCompanyId(companyId);
};

const validateToken = async (token: string, accountId: number, isThirdParty: boolean, isMember: boolean) => {
  let account: any;
  if (isThirdParty) {
    account = await UserService.getThirdAccount(accountId);
  } else {
    if (isMember) {
      account = await UserService.getMemberUserById(accountId);
    } else {
      account = await UserService.getAccountInfo(accountId);
    }
  }
  if (!account) return false;
  return validateTokenSign(account.salt || account.token, token);
};

/**
 * 兼容老的业务逻辑，后续禁止使用该方法
 * deprecated
 * @param ctx
 */
export const authAgoraToken = async (ctx: Koa.Context, next) => {
  let token = ctx.query[AgoraTokenKey];
  if (!token) {
    ctx.status = 401;
    return;
  }
  token = decodeURIComponent(token);
  const flag = validateTokenExpired(token);
  if (!flag) {
    ctx.status = 401;
    return;
  }
  const { accountId, isMember } = getAccountInfo(token);
  if (!accountId) {
    ctx.status = 401;
    return;
  }
  try {
    const isValid = await validateToken(token, accountId, false, isMember);
    if (!isValid) {
      ctx.status = 401;
      return;
    }
    const user = await getUserInfo(accountId, isMember);
    if (!user) {
      ctx.status = 401;
      return;
    }
    ctx.state.user = user;
    await next();
  } catch (e) {
    ctx.logger.error(e);
    ctx.status = 500;
  }
};

export const ssoRawUserInfo = async (ctx) => {
  const user: User = ctx.state.user;
  const main = await getMainAccount(user.companyId);
  ctx.body = {
    email: main.email,
    language: user.language,
    displayName: user.displayName
  };
};

const generateJWT = (user: User) => {
  const secret = config.sso.agora;
  const iat = Date.now() / 1000;
  const jti = generateUUID();

  const payload = {
    iat,
    jti,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName
  };

  return JWT.sign(payload, secret, {
    expiresIn: 3600 * 1000 // 1 hour
  });
};

const decodeJWT = (secret: string, token: string) => {
  try {
    return JWT.verify(token, secret);
  } catch (e) {
    return undefined;
  }
};

export const ssoUserInfo = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const jwtstr = generateJWT(user);
  if (!jwtstr) {
    ctx.status = 500;
    return;
  }
  ctx.body = {
    token: jwtstr
  };
};

export const sudoUserInfo = async (ctx: Koa.Context) => {
  const { next, token, accountId, isAdmin = 0 } = ctx.query;
  if (!next || !token || !accountId) {
    ctx.status = 400;
    return;
  }
  const info = decodeJWT(config.sso.dashboard, token);
  if (!info) {
    ctx.status = 403;
    ctx.body = { message: 'Invalid Login' };
    return;
  }
  const account = await UserService.getAccountInfo(accountId);
  if (!account) {
    ctx.status = 404;
    ctx.body = { message: 'Account not found' };
    return;
  }
  const userInfo = await UserService.getUserInfoByAccountId(accountId);
  if (!userInfo) {
    ctx.status = 404;
    ctx.body = { message: 'Account not found' };
    return;
  }
  const agoraToken = generateSignToken(account.salt, new Date().getTime(), tokenMaxAge, [account.id | 0, userInfo.companyId | 0, 0]);
  // res.cookie(AgoraTokenKey, agoraToken, {domain: cookieConf.domain});
  const time = new Date().getTime();
  ctx.cookies.set(AgoraTokenKey, agoraToken, { domain: 'agora.io', expires: new Date(time + sudoMaxAge) });
  resetSession(ctx);
  ctx.session.companyId = userInfo.companyId;
  ctx.session.isRoot = !Number(isAdmin);
  ctx.session.rootUser = info['email'];
  ctx.redirect(next);
};

// export const ssoUserInfo = async (ctx) => {
  // const user = ctx.state.user;
// };
