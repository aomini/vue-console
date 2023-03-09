import * as Koa from 'koa';
import { getSearchResult } from '../externalService/article';

export const searchArticle = async (ctx: Koa.Context) => {
  const { keyword, lang } = ctx.request.body;
  try {
    const params = {
      'highLight': {
        'preTag': '<am>',
        'postTag': '</am>',
        'fields': [
          {
            'field': 'content',
            'fragmentSize': 300
          },
          {
            'field': 'title',
            'fragmentSize': 300
          }
        ]
      },
      keyword,
      lang,
      page: 1,
      size: 10
    };
    const res = await getSearchResult(ctx.logger, params);
    ctx.status = 200;
    ctx.body = res;
  } catch (e) {
    ctx.status = 200;
    ctx.body = {
      body: {
        items: []
      }
    };
  }
};
