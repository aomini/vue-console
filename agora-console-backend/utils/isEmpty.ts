import { Context } from 'koa';

/*
* 空值检查，若包含空值则返回 true，否则返回 false（空值定义：'', null, undefined）
* @param ctx Koa.Context
* @param requiredParams 不允许为空的参数名
* @param method http 方法（缺省则根据 ctx 自动判断）。'get'：检查 ctx.query；'post','put','delete','patch'：检查 ctx.request.body
* */
function isEmpty(ctx: Context, requiredParams: string[], method: string = undefined) {
  method = (method || ctx.request.method).toLocaleLowerCase();
  let obj: any;
  switch (method) {
    case 'get':
      obj = ctx.query;
      break;
    case 'post':
    case 'put':
    case 'delete':
    case 'patch':
      obj = ctx.request.body;
      break;
    default:
      return true;
  }
  for (const requiredParam of requiredParams) {
    // tslint:disable-next-line:no-null-keyword
    if (['', null, undefined].includes(obj[requiredParam])) {
      return true;
    }
  }
  return false;
}

export default isEmpty;
