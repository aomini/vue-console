import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from 'log4js';
import * as Url from 'url-parse';

const defaultOpt: AxiosRequestConfig = {
  timeout: 1000 * 30
};

export const create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, defaultOpt, opt);
  nopt.headers = nopt.headers || {};
  const reqid = (log as any).context['reqid'];
  if (reqid) {
    nopt.headers['x-request-id'] = reqid;
  }

  const instance = axios.create(nopt);
  let start: number;
  instance.interceptors.request.use((config: AxiosRequestConfig) => {
    start = + new Date();
    return config;
  });
  instance.interceptors.response.use((response: AxiosResponse<any>) => {
    const end = + new Date();
    const url = new Url(response.config.url);
    log.info(`[Completed] ${response.status} ${(end - start) / 1000} "${response.config.method} ${response.request.path} ${url.hostname}"`);
    return response;
  }, (err: any) => {
    const end = + new Date();
    const statusCode = err.response ? err.response.status : 499;
    log.error(`[Completed] ${statusCode} ${(end - start) / 1000} "${err.config ? err.config.url : ''} ${err.message}"`);
    return Promise.reject(err);
  });
  return instance;
};
