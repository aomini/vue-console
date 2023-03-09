import { Context } from 'koa';

/**
 * 重置 session，但保留部分信息
 * @param ctx
 */
export const resetSession = (ctx: Context) => {
  Object.keys(ctx.session).forEach(key => {
    if (key === 'isNew') return;
    if (key[0] === '_') return;
    delete ctx.session[key];
  });
};

/**
 * 完全销毁 session，不保留任何信息
 * @param ctx
 */
export const destroySession = (ctx: Context) => {
  // tslint:disable-next-line:no-null-keyword
  ctx.session = null;
};
