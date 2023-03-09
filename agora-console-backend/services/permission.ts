import { getManager } from 'typeorm';
import { ListReply, ListParams } from '../models/listReply';
import { User } from '../models/user';
import { CompanyRole, ResPermission, ResModule, EntityRole, ENTITYTYPE, RESMODULE, RESPROJECT, RESNOTIFICATION, RESTYPE, ResPermissions, ENTITYACCOUNT, ENTITYMEMBER, DEFAULTROLES, ENTITYENACCOUNT, ENTITYCNACCOUNT, ENTITYCOCOS } from '../models/permission';

export const getCompanyRoles = async (companyId: number, params: ListParams) => {
  const db = getManager().getRepository(CompanyRole);
  const query = db.createQueryBuilder('companyRole')
                  .where('companyRole.auto = 0 and (companyRole.company_id = :companyId or companyRole.company_id = 0)', { companyId });
  if (params.params.key) {
    query.where('`name` like :key', { key: `%${params.params.key}%` });
  }

  let prop = 'companyRole.id';
  let order;
  if (params.params.prop) {
    prop = params.params.prop;
  }

  if (params.params.order === 'ascending') {
    order = 'ASC';
  } else {
    order = 'DESC';
  }

  if (!params.params.fetchAll) {
    query.offset(params.skip).limit(params.limit);
  }

  query.addOrderBy(prop, order);
  const [items, total] = await query.getManyAndCount();
  const listReply: ListReply<CompanyRole> = {
    total: 0,
    items: []
  };
  listReply.total = total;
  listReply.items = items;
  return listReply;
};

export const getResPermission = async (entityType: ENTITYTYPE, entityId: string, resType?: RESTYPE): Promise<ResPermissions> => {
  const db = getManager().getRepository(ResPermission);
  const query = db.createQueryBuilder('resPermission')
                  .innerJoin(EntityRole, 'entityRole', 'resPermission.role_id = entityRole.role_id')
                  .where('entityRole.entity_id = :entityId and entityRole.entity_type = :entityType', { entityId, entityType });
  if (resType) {
    query.andWhere('resPermission.res_type = :resType', { resType });
  }
  const resPermission = await query.getMany();
  const permissions: ResPermissions = {};
  for (const item of resPermission) {
    if (!permissions[item.resType]) permissions[item.resType] = [];
    permissions[item.resType].push(item);
  }
  return permissions;
};

export const getModulePermission = async (entityType: ENTITYTYPE, entityId: string) => {
  const db = getManager().getRepository(ResModule);
  const query = db.createQueryBuilder('resModule')
                  .innerJoin(ResPermission, 'resPermission', `resPermission.res_id = resModule.id`)
                  .innerJoin(EntityRole, 'entityRole', 'resPermission.role_id = entityRole.role_id')
                  .where('entityRole.entity_id = :entityId and entityRole.entity_type = :entityType and resPermission.res_type = :resType', { resType: RESMODULE, entityId, entityType })
                  .addSelect('resPermission.permission', 'permission')
                  .addSelect('resModule.id', 'id')
                  .addSelect('resModule.parentId', 'parentId')
                  .addSelect('resModule.key', 'key');
  const modules = await query.getRawMany();
  if (!modules || modules.length === 0) return undefined;
  const mp = {};
  for (const item of modules) {
    mp[item.key] = item.permission;
  }
  return mp;
};

// account module permission
export const getAccountModulePermission = async (accountId: number, user: User) => {
  // const defaults = await getModulePermission(defaultType, '0');
  let ret = await getModulePermission(ENTITYACCOUNT, accountId.toString());

  if (!ret) {
    let defaultType: ENTITYTYPE;
    if (user.company.source && user.company.source === 2) {
      defaultType = ENTITYCOCOS;
    } else if (user.company.country !== 'CN') {
      defaultType = ENTITYENACCOUNT;
    } else {
      defaultType = ENTITYCNACCOUNT;
    }
    ret = await getModulePermission(defaultType, '0');
  }
  return ret;
};

export const getMemberModulePermission = async (accountId: number, memberId: number, user: User) => {
  const ret = await getAccountModulePermission(accountId, user);
  const memberModule = await getModulePermission(ENTITYMEMBER, memberId.toString());
  if (!ret) return memberModule;
  if (!memberModule) return memberModule;
  for (const key in memberModule) {
    if (!ret[key]) delete memberModule[key];
    else if (ret[key] < memberModule[key]) {
      memberModule[key] = ret[key];
    }
  }
  return memberModule;
};

export const getMemberNotificationPermission = async (entityId: string) => {
  const permissions = await getResPermission(ENTITYMEMBER, entityId, RESNOTIFICATION);
  return permissions;
};

export const getRoleById = async (roleId: number, companyId: number): Promise<CompanyRole> => {
  const companyRoleDB = getManager().getRepository(CompanyRole);
  const companyRoleDBQuery = companyRoleDB.createQueryBuilder('role')
    .where('role.id = :roleId and (role.company_id = :companyId or role.company_id = 0)', { roleId: roleId, companyId: companyId });
  const role = await companyRoleDBQuery.getOne();
  return role;
};

export const getRoleByUser = async (entityId: number, type: ENTITYTYPE): Promise<EntityRole> => {
  const entityRoleDB = getManager().getRepository(EntityRole);
  const entityRoleDBQuery = entityRoleDB.createQueryBuilder('entity')
    .where('entity.entity_id = :entityId and entity_type = :type', { entityId, type });
  const role = await entityRoleDBQuery.getOne();
  return role;
};

export const getPermissionByRole = async (roleId: number, companyId: number) => {
  const findRole = await getRoleById(roleId, companyId);
  if (!findRole) return;
  const resPermissionDB = getManager().getRepository(ResPermission);
  const resPermission = await resPermissionDB.createQueryBuilder('resPermission')
    .where('resPermission.role_id = :roleId', { roleId })
    .getMany();
  const permissions: ResPermissions = {};
  for (const item of resPermission) {
    if (!permissions[item.resType]) permissions[item.resType] = [];
    permissions[item.resType].push(item);
  }
  return permissions;
};

export const checkEntityByRole = async (roleId: number) => {
  const entityRoleDB = getManager().getRepository(EntityRole);
  const entityRolesCount = await entityRoleDB.createQueryBuilder('entityRole')
    .where('entityRole.role_id = :roleId', { roleId })
    .getCount();
  return entityRolesCount > 0;
};

export const createrRes = async (modules: ResPermission[], projects: ResPermission[], roleId: number) => {
  const manager = getManager();
  await manager.transaction(async manager => {
    const resPermissionDB = manager.getRepository(ResPermission);
    for (const moduleRes of modules) {
      const resPermission = new ResPermission();
      resPermission.resType = RESMODULE;
      resPermission.permission = moduleRes.permission;
      resPermission.resId = moduleRes.resId;
      resPermission.roleId = roleId;
      await resPermissionDB.save(resPermission);
    }
    for (const projectRes of projects) {
      const resPermission = new ResPermission();
      resPermission.resType = RESPROJECT;
      resPermission.resId = projectRes.resId;
      resPermission.roleId = roleId;
      await resPermissionDB.save(resPermission);
    }
  });
};

export const createCompanyRole = async (name: string, companyId: number, auto: boolean): Promise<CompanyRole> => {
  const roleDB = getManager().getRepository(CompanyRole);
  const role = new CompanyRole();
  role.name = name;
  role.companyId = companyId;
  role.auto = auto;
  const createdRole = await roleDB.save(role);
  return createdRole;
};

export const createEntityRole = async (entityId: string, roleId: number, entityType: ENTITYTYPE): Promise<EntityRole> => {
  const entityRoleDB = getManager().getRepository(EntityRole);
  const entityRole = new EntityRole();
  entityRole.entityType = entityType;
  entityRole.roleId = roleId;
  entityRole.entityId = entityId;
  const createdEntityRole = await entityRoleDB.save(entityRole);
  return createdEntityRole;
};

export const checkRoleName = async (name: string, companyId: number): Promise<boolean> => {
  if (DEFAULTROLES.includes(name)) return true;
  const companyRoleDB = getManager().getRepository(CompanyRole);
  const companyRoleDBQuery = companyRoleDB.createQueryBuilder('role')
    .where('role.name = :name and role.company_id = :companyId', { name: name, companyId: companyId });
  const total = await companyRoleDBQuery.getCount();
  return total > 0;
};

export const updateRoleName = async (name: string, roleId: number): Promise<CompanyRole> => {
  const companyRoleDB = getManager().getRepository(CompanyRole);
  const companyRole = await companyRoleDB.createQueryBuilder('role')
    .where('role.id = :id', { id: roleId })
    .getOne();
  companyRole.name = name;
  await companyRoleDB.save(companyRole);
  return companyRole;
};

export const updateRes = async (roleId: number, projects: ResPermission[], permissions: ResPermission[]) => {
  const manager = getManager();
  await manager.transaction(async manager => {
    const resPermissionDB = manager.getRepository(ResPermission);
    await resPermissionDB.createQueryBuilder()
      .delete()
      .from(ResPermission)
      .where('role_id = :id and resType = :type', { id: roleId, type: RESPROJECT })
      .execute();
    for (const res of projects) {
      const resPermission = new ResPermission();
      resPermission.resType = RESPROJECT;
      if (res.permission) {
        resPermission.permission = res.permission;
      }
      resPermission.resId = res.resId;
      resPermission.roleId = roleId;
      await resPermissionDB.save(resPermission);
    }

    for (const permission of permissions) {
      const resPermission = await resPermissionDB.createQueryBuilder('resPermission').where('resPermission.role_id = :roleId and resPermission.res_id = :resId', { roleId: roleId, resId: permission.resId }).getOne();
      resPermission.resType = RESMODULE;
      resPermission.permission = permission.permission;
      resPermission.resId = permission.resId;
      resPermission.roleId = roleId;
      await resPermissionDB.save(resPermission);
    }
  });
};

export const updateNotifications = async(resId: string, roles: ResPermission[], oldRoles: ResPermission[]) => {
  const manager = getManager();
  await manager.transaction(async manager => {
    const resPermissionDB = manager.getRepository(ResPermission);

    for (const oldRole of oldRoles) {
      await resPermissionDB.createQueryBuilder()
      .delete()
      .from(ResPermission)
      .where('res_id = :id and res_type = :type and role_id = :roleId', { id: resId, type: RESNOTIFICATION, roleId: oldRole.roleId })
      .execute();
    }

    for (const role of roles) {
      const resPermission = new ResPermission();
      resPermission.resType = RESNOTIFICATION;
      resPermission.resId = resId;
      resPermission.roleId = role.roleId;
      await resPermissionDB.save(resPermission);
    }
  });
  return resId;
};

export const updateEntityRole = async(entityId: string, roleId: number): Promise<EntityRole> => {
  const entityRoleDB = getManager().getRepository(EntityRole);
  const entityRole = await entityRoleDB.createQueryBuilder('entityRole')
    .where('entityRole.entity_id = :id', { id: entityId })
    .getOne();
  entityRole.roleId = roleId;
  const updatedEntityRole = await entityRoleDB.save(entityRole);
  return updatedEntityRole;
};

export const deleteRole = async (roleId: number) => {
  const manager = getManager();
  await manager.transaction(async manager => {
    const companyRoleDB = manager.getRepository(CompanyRole);
    const resPermissionDB = manager.getRepository(ResPermission);
    await companyRoleDB.createQueryBuilder()
      .delete()
      .from(CompanyRole)
      .where('id = :id', { id: roleId })
      .execute();
    await resPermissionDB.createQueryBuilder()
      .delete()
      .from(ResPermission)
      .where('role_id = :id', { id: roleId })
      .execute();
  });
  return roleId;
};
