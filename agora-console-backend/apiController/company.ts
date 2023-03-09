import * as Koa from 'koa';
import * as CompanyService from '../services/company';
import * as IdentityService from '../services/identity';
import { ErrCode } from '../controller/apiCodes';

export const getCompanyRestfulKeys = async (ctx: Koa.Context) => {
  const id = ctx.params.id | 0;
  const restfulkeys = await CompanyService.getCompanyRestfulKeys(id);
  ctx.body = restfulkeys;
};

/**
 * @param updated_at(秒) 从某个更新时间开始
 * @param page 当前页码
 * @param limit 每页条数
 */
export const listRestfulKeys = async (ctx: Koa.Context) => {
  const timestamp = ctx.query.updated_at | 0;
  const page = ctx.query.page | 0;
  const limit = ctx.query.limit | 0;
  let updatedAt: Date;
  if (timestamp > 0) {
    updatedAt = new Date(timestamp * 1000);
  }
  const restfulkeys = await CompanyService.listRestfulKeys(updatedAt, limit, page);
  ctx.body = restfulkeys;
};

export const getCompanyAuthentication = async (ctx: Koa.Context) => {
  const { id } = ctx.params;
  const result = {
    companyId: id
  };
  if (!id) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }
  try {
    const identity = await IdentityService.getCompanyIdentityStatus(id);
    // 未提交、无需认证、已拒绝排除
    if (identity && identity['status'] !== -1 && identity['status'] !== 2) {
      result['authType'] = identity['identityType'];
      result['authStatus'] = 1;
    } else {
      result['authStatus'] = 0;
    }
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};
