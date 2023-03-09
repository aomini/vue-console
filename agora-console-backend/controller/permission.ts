import * as Koa from 'koa';
import * as PermissionService from '../services/permission';
import { ListParams } from '../models/listReply';
import { ErrCode } from './apiCodes';
import { defaultRoles } from '../dataModel/roleModel';

export const getRolesPermissionByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { limit, page } = ctx.request.query;
  const listParams = new ListParams(limit, page);
  try {
    const roles = await PermissionService.getCompanyRoles(companyId, listParams);
    for (const role of roles.items) {
      const permissions = await PermissionService.getPermissionByRole(role.id, companyId);
      role.permissions = permissions;
    }
    ctx.status = 200;
    ctx.body = roles;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const getRolesPermission = async (ctx: Koa.Context) => {
  // const companyId = ctx.session.companyId;
  const userId = ctx.session.userId;
  try {
    const permissions = await PermissionService.getMemberNotificationPermission(userId);
    ctx.status = 200;
    ctx.body = permissions;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const getRolesByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const { limit, page, fetchAll } = ctx.request.query;
    const listParams = new ListParams(limit, page, { fetchAll });
    const roles = await PermissionService.getCompanyRoles(companyId, listParams);
    ctx.status = 200;
    ctx.body = roles;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const getAllRolesPermissionByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { limit, page, fetchAll } = ctx.request.query;
  const listParams = new ListParams(limit, page, { fetchAll });
  try {
    const roles = await PermissionService.getCompanyRoles(companyId, listParams);
    for (const role of roles.items) {
      const permissions = await PermissionService.getPermissionByRole(role.id, companyId);
      role.permissions = permissions;
    }
    ctx.status = 200;
    ctx.body = roles;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const createRole = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { name, permissions, projects, auto } = ctx.request.body;
  try {
    if (!name) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NAME_EMPTY };
      return;
    }

    const checkRoleName = await PermissionService.checkRoleName(name, companyId);
    if (checkRoleName) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NAME_EXIST };
      return;
    }
    const role = await PermissionService.createCompanyRole(name, companyId, !!auto);
    await PermissionService.createrRes(permissions, projects, role.id);
    ctx.status = 200;
    ctx.body = role;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const updateRole = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { roleId, name, permissions, projects } = ctx.request.body;
  if (roleId in defaultRoles) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.Without_Permission };
    return;
  }
  try {
    let findRole = await PermissionService.getRoleById(roleId, companyId);
    if (!findRole) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NOT_EXIST };
      return;
    }

    if (!name) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NAME_EMPTY };
      return;
    }

    if (name !== findRole.name) {
      const checkRoleName = await PermissionService.checkRoleName(name, companyId);
      if (checkRoleName) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.ROLE_NAME_EXIST };
        return;
      }
      findRole = await PermissionService.updateRoleName(name, roleId);
    }
    await PermissionService.updateRes(roleId, projects, permissions);
    ctx.status = 200;
    ctx.body = findRole;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const updateNotificationPermission = async (ctx: Koa.Context) => {
  // const companyId = ctx.session.companyId;
  const { resId, roles, oldRoles } = ctx.request.body;
  try {
    const findRole = await PermissionService.updateNotifications(resId, roles, oldRoles);
    ctx.status = 200;
    ctx.body = findRole;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const deleteRole = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { roleId } = ctx.request.query;
  try {
    const checkRole = await PermissionService.getPermissionByRole(roleId, companyId);
    if (!checkRole) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ROLE_NOT_EXIST };
      return;
    }

    const checkEntity = await PermissionService.checkEntityByRole(roleId);
    if (checkEntity) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.MEMBER_LINKED_ROLE };
      return;
    }
    const ret = await PermissionService.deleteRole(roleId);
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }

};
