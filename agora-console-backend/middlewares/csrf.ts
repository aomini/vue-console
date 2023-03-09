import { Context } from 'koa';
import * as uuid from 'uuid/v4';
import { getConnection, getManager } from 'typeorm';
import * as moment from 'moment';

import { CsrfTokens } from '../models/csrfTokens';

const DURATION = 30 * 60 * 1000; // token有效期：30min，单位ms
const CSRFTOKENKEY = 'X-CSRF-TOKEN';
const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DOMAIN = 'agora.io';
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * 删除过期的csrf token
 * @param token csrf token
 * @param accountId accountId
 * @param companyId companyId
 */
// const delExpiredCsrfToken = async (accountId: number, companyId: number) => {
//   await getConnection()
//   .createQueryBuilder()
//   .delete()
//   .from(CsrfTokens)
//   .where('account_id = :accountId and company_id = :companyId and expire_at < :now', { accountId: accountId, companyId: companyId, now: moment().utc().format(FORMAT) })
//   .execute();
// };

/**
 * 生成csrf token => 设置cookie
 * @param ctx 上下文
 */
const setCsrfToken = async (ctx: Context) => {
  const token = uuid();
  const { userId, companyId } = ctx.session;

  if (userId && companyId) {
    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(CsrfTokens)
    .values([{ token: token, createdAt: moment().utc().format(FORMAT), expireAt: moment().add(DURATION, 'ms').utc().format(FORMAT), accountId: userId, companyId: companyId }])
    .execute();

    ctx.cookies.set(CSRFTOKENKEY, token, { httpOnly: false });
  }
};

/**
 * 校验csrf token是否合法
 * 存在且未过期即为合法
 * @param token csrf token
 * @param accountId accountId
 * @param companyId companyId
 */
const checkCsrfToken = async (token: string, accountId: number, companyId: number) => {
  const csrfToken = await getManager()
  .createQueryBuilder(CsrfTokens, 'ct')
  .where('ct.token = :token and account_id = :accountId and company_id = :companyId', { token: token, accountId: accountId, companyId: companyId })
  .getOne();

  return csrfToken && moment(csrfToken.expireAt).format(FORMAT) > moment.utc().format(FORMAT);
};

/**
 * ========================================================================
 * csrf中间件
 * 每次发起get/head/options请求时，会给前端派发csrf token，同时会删除之前的token
 * 只派发一次token，xss直接GG，如果派发多次，即便xss，token会被用户后续任意一次请求刷掉
 */
export const csrfMiddleware = () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const { userId, companyId } = ctx.session;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(ctx.method.toUpperCase())) {
      const token = ctx.header[CSRFTOKENKEY.toLowerCase()];

      // 本地环境不设置host，这里过滤本地开发时的referer
      if (!token || ctx.headers.referer && !ctx.headers.referer.includes(DOMAIN) && !isDev) {
        ctx.status = 403;
        return;
      }

      const isValid = await checkCsrfToken(token, userId, companyId);
      if (!isValid) {
        ctx.status = 403;
        return;
      }
    } else {
      await setCsrfToken(ctx);
    }
    // await delExpiredCsrfToken(userId, companyId);
    await next();
  };
};
