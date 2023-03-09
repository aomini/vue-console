import * as Koa from 'koa';
import { donsoleProxyForSession } from '../externalService/DonsoleProxy';

export const consoleSearch = async (ctx: Koa.Context) => {
  const { keywords, language } = ctx.request.body;
  try {
    const searchResult = await donsoleProxyForSession(ctx.logger).getSearchResult(keywords, language);
    ctx.status = 200;
    ctx.body = searchResult;
  } catch (e) {
    ctx.status = 200;
    ctx.body = [];
  }
};
