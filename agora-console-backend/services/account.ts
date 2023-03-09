import * as moment from 'moment';
import { User, UserProfile, TUser } from '../models/user';
import { Company, CompanyField } from '../models/company';
import { CompanyFinanceSetting } from '../models/companyFinanceSetting';
import { Account } from '../models/account';
import { AccountRegistry } from '../models/accountRegistry';
import { SSOAccount, COCOS_ORIGIN } from '../models/ssoAccount';
import { ProjectSettings, Settings } from '../models/usageSettings';
import { createQueryBuilder, getManager, Raw, getConnection } from 'typeorm';
import { cryptPrivate } from '../utils/encryptTool';
import { AccountRole, AccountRolePermission } from '../models/accountPermission';
import { getAccountModulePermission, getMemberModulePermission } from './permission';
import { ConsoleOperationAllowance, ConsoleOperationAllowanceStatus, ConsoleOperationAllowanceIsDeleted } from '../models/consoleOperationAllowance';
import { AccountAuth } from '../models/accountAuth';
import { LayoutSetting } from '../models/layoutSetting';

const AccountPermissionMap = {
  19: 'PERM_SEE_USAGE_COMMUNICATION',
  5: 'PERM_SEE_CALLSTAT',
  6: 'PERM_SEE_LIVEMONITOR',
  2: 'PERM_SEE_DASHBOARD',
  20: 'PERM_SEE_USAGE_CUSTOM_ANALYZE',
  22: 'PERM_SEE_QUALITY_REPORT'
};

export const getAccountRegistry = async (accountId: number) => {
  const registryInfo = await AccountRegistry.findOne({ where: { acccountId: accountId } });
  return registryInfo;
};

export const getUserProfileByCompanyId = async (companyId: number): Promise<User> => {
  const user = await UserProfile.findOne({ where : { companyId } });
  return user;
};

export const getCompanyInfo = async (companyId: number): Promise<Company> => {
  const companyInfo = await Company.findOne({ id: companyId });
  return companyInfo;
};

export const getUsageSettingTypes = async(): Promise<Settings[]> => {
  const usageSettingDB = getManager().getRepository(Settings);
  const settings = await usageSettingDB.createQueryBuilder('settings')
    .getMany();
  return settings;
};

export const getProjectSettings = async (companyId: number, groupId: number): Promise<ProjectSettings[]> => {
  const accountUsageDB = getManager().getRepository(ProjectSettings);
  const query = accountUsageDB.createQueryBuilder('projectSettings')
    .innerJoinAndSelect('projectSettings.setting', 'setting')
    .innerJoinAndSelect('setting.type', 'settingType')
    .where('projectSettings.companyId = :companyId and projectSettings.settingGroup = :groupId', { companyId, groupId });
  const projectSettings = await query.getMany();
  return projectSettings;
};

export const getAccountAAPermission = async (userId: number): Promise<AccountRolePermission[]> => {
  const builder = createQueryBuilder(AccountRolePermission, 'permission');
  const permissions = await builder.innerJoin(AccountRole, 'role', 'role.role_id = permission.role_id')
                                   .where('role.account_id = :userId', { userId }).getMany();
  const parr = [];
  for (const item of permissions) {
    if (AccountPermissionMap[item.permissionId]) {
      parr.push(AccountPermissionMap[item.permissionId]);
    }
  }
  return parr;
};

export const getMemberUserById = async (userId: number): Promise<User> => {
  const user = await TUser.findOne({ where: { id: userId } });
  if (!user) return;
  user.isMember = true;
  return user;
};

export const setMemberEmailStatus = async (userId: number): Promise<User> => {
  const user = await TUser.findOne({ where: { id: userId } });
  if (!user) return;
  user.emailStatus = 1;
  await TUser.save(user);
  return user;
};

export const setAccountEmailStatus = async (accountId: number): Promise<User> => {
  const user = await UserProfile.findOne({ where: { accountId } });
  if (!user) return;
  user.emailStatus = 1;
  await UserProfile.save(user);
  return user;
};

export const setEmailStatus = async (email: string, originEmail: string, type: string, companyId: number, source: string) => {
  let user = undefined;
  const findEmail = originEmail;
  const userDB = getManager().getRepository(UserProfile);
  const memberDB = getManager().getRepository(TUser);

  if (!findEmail) {
    user = await UserProfile.findOne({ where: { companyId: companyId } });
  } else {
    user = await UserProfile.findOne({ where: { email: findEmail, companyId: companyId } });
  }
  if (user) {
    user.emailStatus = 1;
    if (type === 'update' && email !== originEmail) {
      user.email = email;
      const account = await Account.findOne({ where: { email: findEmail } });
      if (account) {
        account.email = email;
        await Account.save(account);
      }
    }
    if (source === 'sso') {
      user.step = 0;
    }
    await userDB.save(user);
  } else {
    user = await TUser.findOne({ where: { email: findEmail, companyId: companyId } });
    if (user) {
      user.emailStatus = 1;
      if (type === 'update' && email !== originEmail) {
        user.email = email;
      }
      await memberDB.save(user);
    }
  }
  return user;
};

const reformatSettings = async (projectSettings: ProjectSettings[]): Promise<any> => {
  const settings = {};
  for (const projectSetting of projectSettings) {
    const pid = projectSetting.projectId;
    if (!settings[pid]) settings[pid] = {};

    const settingType = projectSetting.setting.type.value;
    const settingVal = projectSetting.setting.value;
    // H264/H265的配置在线上已经不再使用，转码只有频道数配置，简配需要在线上稳定之后再去更新数据库，此处先做个兼容
    // Todo: 清除转码分钟数的数据库配置记录，移除该兼容
    if (settingVal === 'H264 Duration' || settingVal === 'H265 Duration') continue;
    if (settings[pid][settingType]) {
      settings[pid][settingType].push(settingVal);
    } else {
      settings[pid][settingType] = [settingVal];
    }
  }
  return settings;
};

export const getMainAccountByCompanyId = async (companyId: number): Promise<User> => {
  const company = await Company.findOne({ id: companyId });
  if (!company) return;
  const projectUsageSettings = await getProjectSettings(companyId, 1);
  const usageSettings = await reformatSettings(projectUsageSettings);

  const user = await getUserProfileByCompanyId(companyId);
  if (!user) return;
  user.company = company;
  const permissions = await getAccountModulePermission(user.accountId, user);
  user.settings = usageSettings;
  user.permissions = permissions ? permissions : {};
  user.isMember = false;
  return user;
};

export const getMemberAccountByCompanyId = async (companyId: number, userId: number): Promise<User> => {
  const mainAccount = await getMainAccountByCompanyId(companyId);
  if (!mainAccount) return;
  const user = await getMemberUserById(userId);
  if (!user) return;
  user.company = mainAccount.company;
  const permissions = await getMemberModulePermission(mainAccount.id, user.id, mainAccount);
  user.permissions = permissions ? permissions : {};
  user.settings = mainAccount.settings;
  user.accountId = mainAccount.accountId;
  return user;
};

export const getAccountSecretInfo = async (email: string, accountId: number, isMember: boolean): Promise<string> => {
  if (isMember) {
    const memberInfo = await TUser.findOne({ email, id: accountId });
    if (!memberInfo) return '';
    const memberAccountSecretInfo = memberInfo.password || '';
    return memberAccountSecretInfo;
  }
  const mainAccountInfo = await Account.findOne({ email, id: accountId });
  if (!mainAccountInfo) return '';
  const mainAccountSecretInfo = mainAccountInfo.password || '';
  return mainAccountSecretInfo;

};

export const uniqueEmail = async (email: string, companyId: number): Promise<User> => {
  const userProfileDB = getManager().getRepository(UserProfile);
  const users = await userProfileDB.createQueryBuilder('userProfile')
    .leftJoin(Company, 'company', 'company.id = userProfile.company_id')
    .where(`userProfile.email = :email and company.source != :source`, { email: email, source: COCOS_ORIGIN }).getMany();
  return users[0];
};

export const uniqueMemberEmail = async (email: string): Promise<User> => {
  const userProfileDB = getManager().getRepository(TUser);
  const users = await userProfileDB.createQueryBuilder('user')
    .leftJoin(Company, 'company', 'company.id = user.company_id')
    .where(`user.email = :email and company.source != :source`, { email: email, source: COCOS_ORIGIN }).getMany();
  return users[0];
};

export const updateMainAccountInfo = async (companyId: number, lastName: string, firstName: string, companyName: string, email: string): Promise<User> => {
  const companyDB = getManager().getRepository(Company);
  const company = await Company.findOne({ id: companyId });
  if (!company) return;
  company.name = companyName;
  const updatedCompany = await companyDB.save(company);
  if (!updatedCompany) return;

  const userDB = getManager().getRepository(UserProfile);
  const user = await getUserProfileByCompanyId(companyId);
  if (!user) return;
  user.lastName = lastName;
  user.firstName = firstName;
  user.email = email;
  const updatedUser = await userDB.save(user);
  return updatedUser;
};

export const updateCompanyName = async (companyId: number, companyName: string): Promise<Company> => {
  const companyDB = getManager().getRepository(Company);
  const company = await Company.findOne({ id: companyId });
  if (!company) return;
  company.name = companyName;
  const updatedCompany = await companyDB.save(company);
  return updatedCompany;
};

export const updateProfileLastName = async (companyId: number, lastName: string): Promise<User> => {
  const userDB = getManager().getRepository(UserProfile);
  const user = await getUserProfileByCompanyId(companyId);
  if (!user) return;
  user.lastName = lastName;
  user.firstName = '';
  const updatedUser = await userDB.save(user);
  return updatedUser;
};

export const updateMemberAccountInfo = async (userId: number, lastName: string, firstName: string): Promise<User> => {
  const userDB = getManager().getRepository(TUser);
  const user = await getMemberUserById(userId);
  if (!user) return;
  user.lastName = lastName;
  user.firstName = firstName;
  const updatedUser = await userDB.save(user);
  return updatedUser;
};

export const checkAccountPassword = async (email: string, password: string, isMember: boolean, companyId: number, accountId: number): Promise<Boolean> => {
  let account = undefined;
  if (isMember) {
    account = await TUser.findOne({ email: email, companyId: companyId });
  } else {
    account = await Account.findOne({ email: email, id: accountId });
  }
  if (!account) return;
  const encryptPwd = cryptPrivate(password, account.salt, undefined);
  const check = encryptPwd === account.password;
  return check;
};

export const getThirdAccount = async (accountId: number) => {
  const account = await SSOAccount.findOne({ where: { id: accountId } });
  return account;
};

export const getAccountInfo = async (accountId: number) => {
  const account = await Account.findOne({ where: { id: accountId } });
  return account;
};

export const getUserInfoByAccountId = async (accountId: number) => {
  const user = await UserProfile.findOne({ where: { accountId } });
  return user;
};

export const getMemberInfo = async (accountId: number, companyId: number) => {
  const account = await TUser.findOne({ where: { id: accountId, companyId:  companyId } });
  return account;
};

export const getAccountByCompanyId = async (companyId: number) => {
  const account = await UserProfile.findOne({ where: { companyId:  companyId } });
  return account;
};

export const getAccountByAccountId = async (accountId: number, companyId: number) => {
  const account = await UserProfile.findOne({ where: { id: accountId, companyId:  companyId } });
  return account;
};

export const checkPhoneExist = async (phone: string) => {
  const accountPhone = await UserProfile.findOne({ where: { verifyPhone: phone } });
  const memberPhone = await TUser.findOne({ where: { verifyPhone: phone } });
  if (accountPhone || memberPhone) return true;
  return false;
};

export const updateAccountPhone = async (phone: string, companyId: number, verify: boolean) => {
  try {
    const user = await UserProfile.findOne({ companyId: companyId });
    const userDB = getManager().getRepository(UserProfile);
    if (user) {
      user.phoneNumber = phone;
      if (verify) {
        user.verifyPhone = phone;
        user.verifyDate = new Date();
      }
      await userDB.save(user);
    } else {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const updateMemberPhone = async (accountId: number, phone: string, verify: boolean) => {
  try {
    const user = await TUser.findOne({ id: accountId });
    const userDB = getManager().getRepository(TUser);
    if (user) {
      user.phoneNumber = phone;
      if (verify) {
        user.verifyPhone = phone;
      }
      await userDB.save(user);
    } else {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const getCompanyFieldInfo = async (companyId: number) => {
  const companyField = await CompanyField.findOne({ where: { companyId: companyId } });
  return companyField;
};

export const getCompanyFinanceSetting = async (companyId: number) => {
  const financeSetting = await CompanyFinanceSetting.findOne({ where : { companyId: companyId } });
  return financeSetting;
};

export const setCompanyField = async (companyId: number, type: string, value: number) => {
  let companyField = undefined;
  const company = await Company.findOne({ id: companyId });
  const companyFieldDB = getManager().getRepository(CompanyField);
  if (!company) return;
  companyField = await CompanyField.findOne({ where: { companyId: companyId } });
  if (companyField) {
    if (type === 'onboarding') {
      companyField.onboardingStatus = 1;
    } else if (type === 'viewAA') {
      companyField.viewAAStatus = 1;
    } else if (type === 'feedback') {
      companyField.feedbackStatus = 1;
    } else if (type === 'showVendorCreator') {
      companyField.showVendorCreator = value;
    }
    await companyFieldDB.save(companyField);
  } else {
    const newField = new CompanyField();
    newField.companyId = companyId;
    if (type === 'onboarding') {
      newField.onboardingStatus = 1;
    } else if (type === 'viewAA') {
      newField.viewAAStatus = 1;
    } else if (type === 'feedback') {
      newField.feedbackStatus = 1;
    } else if (type === 'showVendorCreator') {
      newField.showVendorCreator = value;
    }
    companyField = await companyFieldDB.save(newField);
  }
  return companyField;
};

// 根据 UserId 获取 User 信息
export const getUserInfoByUserId = async (userId) => {
  try {
    let userInfo = await getMemberUserById(userId);
    if (!userInfo) {
      userInfo = await getUserInfoByAccountId(userId);
    }
    return userInfo;
  } catch (e) {
    return e;
  }

};

export const getConsoleOperationAllowance = async (companyId: number) => {
  const now = moment().unix();
  const operationAllowance = await ConsoleOperationAllowance.findOne({
    companyId,
    expiredAt: Raw(alias => `${alias} > ${now}`),
    isDeleted: ConsoleOperationAllowanceIsDeleted.NOT_DELETED
  });
  return operationAllowance;
};

export const updateConsoleOperationAllowance = async (companyId: number, accountId: number, status: number) => {
  if (status === ConsoleOperationAllowanceStatus.ALLOW) {
    let operationAllowance = await ConsoleOperationAllowance.findOne({
      companyId,
      isDeleted: ConsoleOperationAllowanceIsDeleted.NOT_DELETED
    });

    if (!operationAllowance) {
      operationAllowance = new ConsoleOperationAllowance();
    }

    operationAllowance.companyId = companyId;
    operationAllowance.expiredAt = moment().add(1, 'day').unix();
    operationAllowance.allowedBy = accountId;
    operationAllowance.isDeleted = ConsoleOperationAllowanceIsDeleted.NOT_DELETED;

    await operationAllowance.save();
  } else {
    const operationAllowance = await ConsoleOperationAllowance.findOne({
      companyId,
      isDeleted: ConsoleOperationAllowanceIsDeleted.NOT_DELETED
    });
    if (operationAllowance) {
      operationAllowance.isDeleted = ConsoleOperationAllowanceIsDeleted.DELETED;
      await operationAllowance.save();
    }

  }
};

export const getAccountAuth = async (companyId: number, accountId: number) => {
  const accountAuth = await AccountAuth.findOne({
    companyId,
    accountId
  });
  return accountAuth;
};

export const updateAccountAuth = async (companyId: number, accountId: number, status: number) => {
  await getConnection()
  .createQueryBuilder()
  .update(AccountAuth)
  .set({
    status: status
  })
  .where('company_id = :companyId and accountId = :accountId', { companyId: companyId, accountId: accountId })
  .execute();
};

export const createAccountAuth = async (companyId: number, accountId: number, status: number) => {
  await getConnection()
  .createQueryBuilder()
  .insert()
  .into(AccountAuth)
  .values({
    status: status,
    companyId: companyId,
    accountId: accountId
  })
  .execute();
};

export const getAccountLayoutSetting = async (companyId: number, accountId: number) => {
  const setting = await LayoutSetting.findOne({ where: { companyId, accountId } });
  return setting;
};

export const updateAccountLayoutSetting = async (companyId: number, accountId: number, setting: string) => {
  const accountSetting = await LayoutSetting.findOne({ where: { companyId, accountId } });
  const settingDB = getManager().getRepository(LayoutSetting);
  if (accountSetting) {
    accountSetting.setting = setting;
    await settingDB.save(accountSetting);
  } else {
    const newSetting = new LayoutSetting();
    newSetting.companyId = companyId;
    newSetting.accountId = accountId;
    newSetting.setting = setting;
    await settingDB.save(newSetting);
  }
};
