import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { create } from './request';
import { config as conf } from '../config';
import { Logger } from 'log4js';

export const gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['agora-service-key'] = conf.serviceKey;
  const instance = create(log, nopt);

  return instance;
};

export const usage_gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['agora-service-key'] = conf.usageServiceKey;
  nopt.timeout = 12 * 10000;
  const instance = create(log, nopt);

  return instance;
};

export const vendor_usage_gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['agora-service-key'] = conf.usageAPISecret;
  const instance = create(log, nopt);

  return instance;
};

export const restful_gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['agora-service-key'] = conf.restfulApi.serviceKey;
  const instance = create(log, nopt);

  return instance;
};

export const paas_gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['authorization'] = Buffer.from(`${conf.paasApi.appid}:${conf.paasApi.appSecret}`).toString('base64');
  const instance = create(log, nopt);

  return instance;
};

export const sso_gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['authorization'] = Buffer.from(`${conf.SSOPower.username}:${conf.SSOPower.password}`).toString('base64');
  const instance = create(log, nopt);
  return instance;
};

export const archer_gw_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['authorization'] = Buffer.from(`${conf.archerApi.username}:${conf.archerApi.password}`).toString('base64');
  const instance = create(log, nopt);
  return instance;
};

export const basic_request = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  const instance = create(log, nopt);

  return instance;
};

export const article_create = (log: Logger, opt?: AxiosRequestConfig): AxiosInstance => {
  const nopt = Object.assign({}, opt);
  nopt.headers = nopt.headers || {};
  nopt.headers['agora-service-key'] = conf.articleApi['agora-service-key'];
  const instance = create(log, nopt);

  return instance;
};
