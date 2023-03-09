import * as Koa from 'koa';

import * as AuthenticationCredentialsService from '../services/authenticationCredentials';
import { ErrCode } from './apiCodes';

import { processError } from '../utils/error';
import { generateUUID } from '../utils/encryptTool';

export const getCredentials = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const { page = 0, limit = 10 } = ctx.request.query;
  try {
    const credentials = await AuthenticationCredentialsService.getAuthenticationCredentials(companyId, limit, page * limit);
    ctx.status = 200;
    ctx.body = credentials;
  } catch (e) {
    processError(e);
    ctx.status = 500;
  }
};

export const createCredential = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const { key } = ctx.request.body;
  if (!key) {
    ctx.status = 400;
    return;
  }

  const currentCredentialsCount = await AuthenticationCredentialsService.getAuthenticationCredentialsCount(companyId);
  if (currentCredentialsCount >= ctx.state.user.company.restfulKeyLimit) {
    ctx.status = 400;
    return;
  }

  const secret = generateUUID();

  try {
    await AuthenticationCredentialsService.createAuthenticationCredential(companyId, key, secret);
    ctx.status = 200;
  } catch (e) {
    processError(e);
    ctx.status = 500;
  }

};

export const deleteCredential = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const { key } = ctx.params;
  const currentCredential = await AuthenticationCredentialsService.getCurrentCredential(companyId, key);
  if (!currentCredential) {
    ctx.status = 400;
    return;
  }

  try {
    await AuthenticationCredentialsService.deleteCurrentCredential(companyId, key);
    ctx.status = 200;
  } catch (e) {
    processError(e);
    ctx.status = 500;
  }
};

export const downloadCredential = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const { key } = ctx.params;
  const currentCredential = await AuthenticationCredentialsService.getCurrentCredential(companyId, key);

  if (!currentCredential) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMETER_ERROR };
    return;
  }

  // 已经被下载了
  if (currentCredential.downloaded === 1) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.ALREADY_DOWNLOADED };
    return;
  }

  try {
    await AuthenticationCredentialsService.setKeyToDownloaded(companyId, key);
    ctx.status = 200;
    ctx.body = { key: currentCredential.name, secret: currentCredential.pass };
  } catch (e) {
    processError(e);
    ctx.status = 500;
  }
};
