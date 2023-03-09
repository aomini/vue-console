import { Logger } from 'log4js';
import * as Client from '../utils/request';

export const getDocArticleContent = async (log: Logger, url: string) => {
  const client = Client.create(log);
  const ret = await client.get(url);
  return ret.data;
};
