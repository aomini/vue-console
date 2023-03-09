import * as Koa from 'koa';
import { ErrCode } from './apiCodes';
import * as IdentityService from '../services/identity';

enum CompanySource {
  Cocos = 2
}

/**
 * @description 读权限检查
 * @param moduleName 目前是 Usage,AgoraAnalytics,FinanceCenter, Member&RoleManagement, ProjectManagement, LiveData, DataInsight 对应数据库表 res_module
 */
export const checkReadPermission = (moduleName: string) => {
  return async(ctx: Koa.Context, next: () => Promise<any>) => {
    const user = ctx.state.user;
    let flag = false;
    if (user.permissions[moduleName] && user.permissions[moduleName] > 0) {
      flag = true;
      await next();
      return;
    }
    if (!flag) {
      ctx.status = 403;
      ctx.body = { code: ErrCode.Without_Permission };
      return;
    }
  };
};

/**
 * @description 写权限检查
 * @param moduleName 目前是 Usage,AgoraAnalytics,FinanceCenter, Member&RoleManagement, ProjectManagement, LiveData, DataInsight 对应数据库表 res_module
 */
export const checkWritePermission = (moduleName: string) => {
  return async(ctx: Koa.Context, next: () => Promise<any>) => {
    const user = ctx.state.user;
    let flag = false;
    if (user.permissions[moduleName] && user.permissions[moduleName] > 1) {
      flag = true;
      await next();
      return;
    }
    if (!flag) {
      ctx.status = 403;
      ctx.body = { code: ErrCode.Without_Permission };
      return;
    }
  };
};

/**
 * @description 模拟登录的用户不具有写权限
 */

export const checkSudoPermission = () => {
  return async(ctx: Koa.Context, next: () => Promise<any>) => {
    const isRoot = ctx.state.user.isRoot;
    if (!isRoot) {
      await next();
      return;
    } else {
      ctx.status = 403;
      ctx.body = { code: ErrCode.Without_Permission };
    }
  };
};

export const checkAuthenticationPermission = () => {
  return async(ctx: Koa.Context, next: () => Promise<any>) => {
    try {
      const companyInfo = ctx.state.user.company;
      const source = companyInfo.source;
      const country = companyInfo.country;
      if (source === CompanySource.Cocos || country !== 'CN') {
        await next();
        return;
      }
      const companyId = ctx.session.companyId;
      const identity = await IdentityService.getCompanyAuthentication(companyId);
      if (!('authStatus' in identity) || (identity['authStatus'] !== 1 && identity['authStatus'] !== -1)) {
        ctx.status = 403;
        ctx.body = { code: ErrCode.Without_Permission };
      } else {
        await next();
      }
    } catch (e) {
      ctx.status = 500;
      ctx.logger.error(e);
      ctx.body = { code: ErrCode.Without_Permission };
    }
  };
};

export const checkTwoStepVerificationPermission = () => {
  return async(ctx: Koa.Context, next: () => Promise<any>) => {
    const isVerified = ctx.session.verified;
    if (!isVerified) {
      ctx.status = 403;
      ctx.body = { code: ErrCode.Without_Permission };
      return;
    }
    ctx.session.verified = false;
    await next();
  };
};
