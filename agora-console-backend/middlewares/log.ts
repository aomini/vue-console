import * as Koa from 'koa';
import { getRealIP } from '../utils/realip';

import { Logger } from '../logging';

export function logMiddle() {
  return async (ctx: Koa.Context, next: () => Promise<any>) => {

    ctx.logger = Logger();
    const reqid = ctx.request.header['x-request-id'];
    ctx.logger.addContext('reqid', reqid);

    const ip = getRealIP(ctx);
    ctx.logger.addContext('ip', ip);

    if (ctx.session && ctx.session.companyId) {
      let tmp = ctx.session.companyId;
      if (ctx.session.userId) {
        tmp = `${tmp}-${ctx.session.userId}`;
      }
      if (ctx.session.isRoot && ctx.session.rootUser) {
        const rootUserEmail = ctx.session.rootUser;
        tmp = `${tmp}-${rootUserEmail.substring(0, rootUserEmail.indexOf('@'))}`;
      }
      ctx.logger.addContext('user', tmp);
    }

    const start = +new Date();
    ctx.logger.info(`[Start] 200 0 "${ctx.request.method} ${ctx.request.url} ${ctx.request.hostname}"`);
    await next();
    const end = +new Date();
    ctx.logger.info(`[Completed] ${ctx.status} ${(end - start) / 1000} "${ctx.request.method} ${ctx.request.url} ${ctx.request.hostname}"`);
  };
}
