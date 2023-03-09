import { getManager } from 'typeorm';
import { TUser } from '../models/user';
import { Account } from '../models/account';
import { EntityRole, CompanyRole, ENTITYMEMBER } from '../models/permission';

export const getMembersByCompany = async (companyId: number): Promise<TUser[]> => {
  const TUserDB = getManager().getRepository(TUser);
  const TUsers = await TUserDB.createQueryBuilder('TUser')
    .innerJoin(EntityRole, 'entityRole', 'TUser.user_id = entityRole.entity_id')
    .innerJoin(CompanyRole, 'companyRole', 'entityRole.role_id = companyRole.id')
    .select('TUser.email', 'email')
    .addSelect('TUser.id', 'userId')
    .addSelect('TUser.createdTime', 'created')
    .addSelect('companyRole.id', 'roleId')
    .addSelect('companyRole.name', 'roleName')
    .where('TUser.companyId = :companyId and (companyRole.company_id = :companyId or companyRole.company_id = 0)', { companyId })
    .orderBy('TUser.createdTime', 'DESC')
    .getRawMany();
  return TUsers;
};

export const getMembersCountByCompany = async (companyId: number): Promise<number> => {
  const membersDB = getManager().getRepository(TUser);
  const count = await membersDB.count({ companyId });
  return count;
};

export const getMemberByEmail = async (email: string, companyId: string) => {
  const userDB = getManager().getRepository(TUser);
  const user = userDB.createQueryBuilder('user')
    .where('user.email = :email and user.company_id = :companyId', { email: email, companyId: companyId })
    .getOne();
  return user;
};

export const checkMemberEmail = async (email: string): Promise<boolean> => {
  const accountDB = getManager().getRepository(Account);
  const accountCheck = await accountDB.findOne({ email: email });
  const userDB = getManager().getRepository(TUser);
  const TUserCheck = await userDB.findOne({ email: email });
  return !accountCheck && !TUserCheck;
};

export const checkAccountEmail = async (email: string): Promise<boolean> => {
  const accountDB = getManager().getRepository(Account);
  const accountCheck = await accountDB.findOne({ email: email });
  return !accountCheck;
};

export const checkAccountMemberEmail = async (email: string, companyId: number): Promise<boolean> => {
  const userDB = getManager().getRepository(TUser);
  const TUserCheck = await userDB.createQueryBuilder('user')
    .where('user.email = :email and user.company_id != :companyId', { email: email, companyId: companyId })
    .getOne();
  return !TUserCheck;
};

export const checkMemberLimit = async (companyId: number, memberLimit: number): Promise<boolean> => {
  const userDB = getManager().getRepository(TUser);
  const memberCount = await userDB.count({ companyId: companyId });
  return memberCount < memberLimit;
};

export const createOrUpdateMember = async (email: string, roleId: number, language: string, companyId: number): Promise<TUser> => {
  const userDB = getManager().getRepository(TUser);
  const entityRoleDB = getManager().getRepository(EntityRole);
  const user = new TUser();
  user.email = email;
  user.companyId = companyId;
  let currentUser = await userDB.findOne(user);
  if (!currentUser) {
    user.language = language;
    currentUser = await userDB.save(user);
    const entityRole = new EntityRole();
    entityRole.entityType = ENTITYMEMBER;
    entityRole.roleId = roleId;
    entityRole.entityId = currentUser.id.toString();
    await entityRoleDB.save(entityRole);
  } else {
    const entityRole = await entityRoleDB.createQueryBuilder('entityRole')
      .where('entityRole.entity_id = :id', { id: currentUser.id })
      .getOne();
    if (!entityRole) return;
    entityRole.roleId = roleId;
    await entityRoleDB.save(entityRole);
  }
  return currentUser;
};

export const deleteMember = async (email: string) => {
  const manager = getManager();
  await manager.transaction(async manager => {
    const userDB = manager.getRepository(TUser);
    const entityRoleDB = manager.getRepository(EntityRole);
    const currentUser = await userDB.findOne({ email: email });
    await entityRoleDB.createQueryBuilder()
      .delete()
      .from(EntityRole)
      .where('entity_id = :id and entity_type = :type', { id: currentUser.id, type: ENTITYMEMBER })
      .execute();
    await userDB.createQueryBuilder()
      .delete()
      .from(TUser)
      .where('id = :id', { id: currentUser.id })
      .execute();
  });
};
