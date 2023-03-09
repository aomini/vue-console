import * as Koa from 'koa';

import { ErrCode } from './apiCodes';
import * as PermissionService from '../services/permission';
import { getMainAccountByCompanyId } from '../services/account';
import { ssoProxyForSession } from '../externalService/SSOProxy';
import validator from 'validator';
import { ListParams } from '../models/listReply';

const modelForClient = (member: any) => {
  return {
    createTime: member.createTime,
    email: member.email,
    roleId: member.roleId,
    userId: member.userId
  };
};

export const getMembersByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const { includingMain } = ctx.query;
    let members = await ssoProxyForSession(ctx.logger).getMembersByCompany(companyId);
    members = members.map(member => modelForClient(member));
    const listParams = new ListParams(undefined, undefined, { fetchAll: true });
    const roles = await PermissionService.getCompanyRoles(companyId, listParams);
    members.forEach(member => {
      member.roleName = roles.items?.find((role: any) => role.id === member.roleId)?.name;
    });
    if (includingMain) {
      const mainAccount = await getMainAccountByCompanyId(companyId);
      ctx.status = 200;
      ctx.body = { mainAccount, members };
      return;
    }
    ctx.status = 200;
    ctx.body = members;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_MEMBERS };
  }
};

export const getMembersAmountByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  try {
    const members = await ssoProxyForSession(ctx.logger).getMembersByCompany(companyId);
    ctx.status = 200;
    ctx.body = { count: members.length };
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_MEMBERS };
  }
};

export const getMemberByEmail = async (ctx: Koa.Context) => {
  const { email } = ctx.params;
  const companyId = ctx.session.companyId;
  try {
    const member = await ssoProxyForSession(ctx.logger).getMemberByEmail(email, companyId);
    ctx.status = 200;
    ctx.body = modelForClient(member);
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_MEMBER };
  }
};

export const checkMemberLimit = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const memberLimit = ctx.state.user.company.memberLimit;
  try {
    const members = await ssoProxyForSession(ctx.logger).getMembersByCompany(companyId);
    const checkMemberLimit = members.length < memberLimit;
    ctx.status = 200;
    ctx.body = checkMemberLimit;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.MEMBER_LIMIT_REACHED };
  }
};

export const createMember = async (ctx: Koa.Context) => {
  const { email, roleId } = ctx.request.body;
  const companyId = ctx.session.companyId;
  const memberLimit = ctx.state.user.company.memberLimit;
  const language = ctx.state.user.language;
  try {
    if (!email || !validator.isEmail(email)) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_EMAIL };
      return;
    }
    const members = await ssoProxyForSession(ctx.logger).getMembersByCompany(companyId);
    const checkMemberLimit = members.length < memberLimit;
    if (!checkMemberLimit) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.MEMBER_LIMIT_REACHED };
      return;
    }
    const checkRole = await PermissionService.getRoleById(roleId, companyId);
    if (!checkRole) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NOT_EXIST };
      return;
    }
    const member = await ssoProxyForSession(ctx.logger).createMember(email, roleId, language, companyId);
    ctx.status = 200;
    ctx.body = modelForClient(member);
  } catch (e) {
    if (e.statusCode === 400) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.EXIST_EMAIL };
    } else {
      ctx.status = 500;
      ctx.body = { code: ErrCode.FAILED_CREATE_MEMBER };
    }
    ctx.logger.error(e);
  }
};

export const updateMember = async (ctx: Koa.Context) => {
  const { roleId, userId } = ctx.request.body;
  const companyId = ctx.session.companyId;
  const language = ctx.state.user.language;
  try {
    const checkRole = await PermissionService.getRoleById(roleId, companyId);
    if (!checkRole) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NOT_EXIST };
      return;
    }
    const member = await ssoProxyForSession(ctx.logger).updateMember(roleId, language, companyId, userId);
    ctx.status = 200;
    ctx.body = modelForClient(member);
  } catch (e) {
    if (e.statusCode === 400) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_UPDATE_MEMBER };
    } else {
      ctx.status = 500;
      ctx.body = { code: ErrCode.FAILED_UPDATE_MEMBER };
    }
    ctx.logger.error(e);
  }
};

export const deleteMember = async (ctx: Koa.Context) => {
  const { userId } = ctx.request.query;
  const companyId = ctx.session.companyId;
  try {
    const res = await ssoProxyForSession(ctx.logger).deleteMember(companyId, userId);
    ctx.status = 200;
    ctx.body = res;
  } catch (e) {
    if (e.statusCode === 400) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_DELETE_MEMBER };
    } else {
      ctx.status = 500;
      ctx.body = { code: ErrCode.FAILED_DELETE_MEMBER };
    }
    ctx.logger.error(e);
  }
};
