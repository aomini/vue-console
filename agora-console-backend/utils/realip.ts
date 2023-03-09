import * as Koa from 'koa';

export const getRealIP = (ctx: Koa.Context): String => {
  let ip = ctx.headers['x-real-ip'] || ctx.ip;
  if (ctx.headers['x-forwarded-for']) {
    const ips = ctx.headers['x-forwarded-for'].split(',');
    if (ips.length > 0 && ips[0].length > 0) {
      ip = ips[0];
    }
  }
  return ip;
};
