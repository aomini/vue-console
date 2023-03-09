import * as Koa from 'koa';
import { ConsoleAlert } from '../externalService/ConsoleAlert';
import { ErrCode } from '../controller/apiCodes';
import * as _ from 'lodash';
const paasApiUrl = ['paas.staging.agoralab.co', 'paas-pre.agoralab.co', 'paas.agoralab.co'];
export const catchInject = () => {
  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
      await next();
      // 临时兼容 console 抛出错误被业务逻辑 catch 住问题
      if (ctx.status >= 500) {
        const session = ctx.session;
        const errBody = ctx.body;
        let errMsg = JSON.stringify(ctx.body);
        if (errBody && typeof errBody === 'object' && errBody.code) {
          errMsg = _.findKey(ErrCode, (errItem) => {
            return errItem === errBody.code;
          });
        }
        ConsoleAlert.notifyApiError(ctx.logger, {
          api: ctx.path || '',
          errorMsg: errMsg,
          method: (ctx.method || '').toUpperCase(),
          statusCode: ctx.status,
          user: session.companyId,
          reqid: ctx.request.header['x-request-id']
        });
      }
    } catch (err) {
      ctx.logger.error(err);
      // 云市场告警信息单独处理
      if (err.response?.data && (paasApiUrl.filter(item => err.response?.config.url.indexOf(item) >= 0)).length >= 1) {
        const statusCode = err.status || err.statusCode || err.response?.status || 500;
        ctx.status = 200;
        ctx.body = err.response?.data;
        const session = ctx.session;
        ConsoleAlert.notifyApiError(ctx.logger, {
          api: ctx.path || '',
          errorMsg: JSON.stringify(err.response?.data),
          method: (ctx.method || '').toUpperCase(),
          statusCode: statusCode,
          user: session.companyId,
          reqid: ctx.request.header['x-request-id']
        });
      } else {
        ctx.status = err.status || err.statusCode || err.response?.status || 500;
        ctx.body = err.error || err.message;
      }
      // ctx.app.emit('error', err, ctx);

      if (ctx.status >= 500) {
        const session = ctx.session;
        ConsoleAlert.notifyApiError(ctx.logger, {
          api: ctx.path || '',
          errorMsg: err.message,
          method: (ctx.method || '').toUpperCase(),
          statusCode: ctx.status,
          user: session.companyId,
          reqid: ctx.request.header['x-request-id']
        });
      }
    }
  };
};
