import * as Koa from 'koa';
import { ErrCode } from './apiCodes';
import * as RestfulApiService from '../services/restfulApi';
import * as uuid from 'uuid/v4';

export const getRestfulKeysByCompany = async (ctx: Koa.Context) => {
  const companyId = Number(ctx.state.user.companyId);
  try {
    const keys = await RestfulApiService.getKeysByCompany(companyId);
    ctx.status = 200;
    ctx.body = keys;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_RESTFUL_KEYS };
  }
};

export const createRestfulKey = async (ctx: Koa.Context) => {
  const companyId = Number(ctx.state.user.companyId);
  try {
    const keys = await RestfulApiService.getKeysByCompany(companyId);
    if (keys.length >= ctx.state.user.company.restfulKeyLimit) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.KEY_OUT_OF_LIMIT };
      return;
    }
    const key = uuid().replace(/-/g, '');
    const secret = uuid().replace(/-/g, '');
    const exist = await RestfulApiService.getInfoByKey(key);
    if (exist) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.RESTFUL_KEYS_EXIST };
      return;
    }

    const reply = await RestfulApiService.createKey(key, secret, companyId, ctx.state.user.company.restfulKeyLimit);
    if (reply) {
      ctx.status = 200;
      ctx.body = {
        key: key,
        companyId: companyId
      };
    } else {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_CREATE_RESTFUL_KEY };
    }
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_CREATE_RESTFUL_KEY };
  }
};

export const deleteRestfulKey = async (ctx: Koa.Context) => {
  const { key } = ctx.params;
  const companyId = Number(ctx.state.user.companyId);

  if (!key) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMETER_ERROR };
    return;
  }

  try {
    const exist = await RestfulApiService.getInfoByKey(key);
    if (!exist) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.RESTFUL_KEYS_NOT_EXIST };
      return;
    }

    const keys = await RestfulApiService.getKeysByCompany(companyId);
    if (keys.length === 1) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ONLY_ONE_KEY };
      return;
    }

    const reply = await RestfulApiService.deleteKey(key, companyId);
    ctx.status = 200;
    ctx.body = reply;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_DELETE_RESTFUL_KEY };
  }
};

export const getRestfulKeyLimitByCompany = async (ctx: Koa.Context) => {
  try {
    ctx.status = 200;
    ctx.body = {
      limit: ctx.state.user.company.restfulKeyLimit
    };
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_RESTFUL_KEY_LIMIT };
  }
};

export const downloadRestfulKey = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const { key } = ctx.params;

  if (!key) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMETER_ERROR };
    return;
  }

  try {
    const secret = await RestfulApiService.getSecret(companyId, key);

    if (!secret) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PARAMETER_ERROR };
      return;
    }

    // 已经被下载了
    if (secret.downloaded === 1) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ALREADY_DOWNLOADED };
      return;
    }

    await RestfulApiService.setKeyToDownloaded(companyId, key);

    ctx.status = 200;
    ctx.body = secret;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_RESTFUL_KEY_LIMIT };
  }
};
