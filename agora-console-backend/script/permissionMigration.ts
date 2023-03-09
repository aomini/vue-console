import { getManager, createConnection } from 'typeorm';
import { Role, RolePrivilege, Privilege, UserRole, TUser } from '../models/user';
import { createCompanyRole, createEntityRole, createrRes } from '../services/permission';
import { ENTITYMEMBER, EntityRole } from '../models/permission';
import { exit } from 'shelljs';

const RoleMapping = {
  '1': 1,
  '2': 5,
  '3': 2,
  '4': 3,
  '5': 4
};

const PermissionMapping = {
  1: { resId: 1, permission: 1 },
  2: { resId: 2, permission: 1 },
  3: { resId: 3, permission: 1 },
  7: { resId: 5, permission: 2 },
  8: { resId: 4, permission: 0 }
};

createConnection({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'vendors',
  logger: 'simple-console',
  entities: ['../models/*{.ts,.js}']
}).then(async connection => {
  const roleDB = getManager().getRepository(Role);
  const roles = await roleDB.createQueryBuilder('role')
    .innerJoin(UserRole, 'userRole', 'userRole.role_id = role.role_id')
    .innerJoin(TUser, 'user', 'user.user_id = userRole.user_id')
    .innerJoin(RolePrivilege, 'rolePrivilege', 'rolePrivilege.role_id = role.role_id')
    .innerJoin(Privilege, 'privilege', 'privilege.privilege_id = rolePrivilege.privilege_id')
    .select('role.role_id', 'role_id')
    .addSelect('role.role_name_us', 'role_name')
    .addSelect('role.default', 'default')
    .addSelect('userRole.user_id', 'user_id')
    .addSelect('privilege.privilege_id', 'privilege_id')
    .addSelect('user.company_id', 'company_id')
    .addOrderBy('user_id', 'DESC')
    .getRawMany();
  const nonDefaultRoles = {};
  const defaultRoles = {};
  for (const role of roles) {
    // Cocos 账户不需要迁移
    const entityRoleDB = getManager().getRepository(EntityRole);
    const entityRole = await entityRoleDB.createQueryBuilder('entityRole')
      .where('entityRole.entity_id = :id and entityRole.entity_type = :type', { id: role.user_id, type: ENTITYMEMBER })
      .getOne();
    if (entityRole) {
      console.log(`entity role has been created for user ${entityRole.entityId} `);
      continue;
    }
    if (role.role_id !== 6) {
      if (!role.default) {
        if (role.privilege_id !== 6) {
          if (role.role_id in nonDefaultRoles) {
            if (!nonDefaultRoles[role.role_id].privileges.includes(role.privilege_id)) {
              nonDefaultRoles[role.role_id].privileges.push(role.privilege_id);
            }
            if (!nonDefaultRoles[role.role_id].users.includes(role.user_id)) {
              nonDefaultRoles[role.role_id].users.push(role.user_id);
            }
          } else {
            const privilege = [];
            privilege.push(role.privilege_id);
            const users = [];
            users.push(role.user_id);
            nonDefaultRoles[role.role_id] = { name: role.role_name, company: role.company_id, privileges: privilege, users: users };
          }
        }
      } else {
        if (role.role_id in defaultRoles) {
          if (!defaultRoles[role.role_id].includes(role.user_id)) {
            defaultRoles[role.role_id].push(role.user_id);
          }
        } else {
          const users = [];
          users.push(role.user_id);
          defaultRoles[role.role_id] = users;
        }
      }
    }
  }

  for (const defaultRoleId of Object.keys(defaultRoles)) {
    const users = defaultRoles[defaultRoleId];
    const newRoleId = RoleMapping[defaultRoleId];
    for (const userId of users) {
      // Link user with default Role
      await createEntityRole(userId, newRoleId, ENTITYMEMBER);
      console.log(`Member ${userId} with old roleId ${defaultRoleId} assigned with new role ${newRoleId}`);
    }
  }

  for (const nonDefaultRoleId of Object.keys(nonDefaultRoles)) {
    const nonDefaultRole = nonDefaultRoles[nonDefaultRoleId];

    // Create new role
    const createdRole = await createCompanyRole(nonDefaultRole.name, nonDefaultRole.company, true);
    console.log(`New role in company ${nonDefaultRole.company} has been created with role_id ${createdRole.id}`);

    // Link permission with role
    const permissions = nonDefaultRole.privileges.map(x => PermissionMapping[x]);
    const permissionResIds = nonDefaultRole.privileges.map(x => PermissionMapping[x].resId);
    const fullPermission = [1, 2, 3, 4, 5];
    const noPermission = fullPermission.filter(x => permissionResIds.indexOf(x) === -1);
    for (const p of noPermission) {
      permissions.push({ resId: p, permission: 0 });
    }
    const allProjects = [];
    allProjects.push({ resId: '0' });
    await createrRes(permissions, allProjects, createdRole.id);
    console.log(`res permission is created with role ${createdRole.id}`);

    // Link user with role
    for (const userId of nonDefaultRoles[nonDefaultRoleId].users) {
      await createEntityRole(userId, createdRole.id, ENTITYMEMBER);
      console.log(`Member ${userId} is assigned with role ${createdRole.id}`);
    }
  }
  console.log('Done');
  exit();
}).catch((e) => {
  console.log(e);
  console.log('error');
});
