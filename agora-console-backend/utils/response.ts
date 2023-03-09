import { Context } from 'koa';

export function response(ctx: Context, statusCode: number = 200, responseBody: any = undefined) {
  ctx.status = statusCode;
  ctx.body = responseBody || '';
}
