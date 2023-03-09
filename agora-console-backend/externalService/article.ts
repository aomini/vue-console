import { Logger } from 'log4js';
import * as GwClient from '../utils/gw-request';
import { config } from '../config';

export const getSearchResult = async (log: Logger, params: any) => {
  const client = GwClient.article_create(log);
  console.info(params);
  const ret = await client.post(
    `${config.articleApi.urlBase}/search/content`,
    params
  );
  return ret.data;
};
