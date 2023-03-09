import * as Koa from 'koa';
import { ErrCode } from '../controller/apiCodes';
import * as NotificationService from '../services/notification';
import * as PermissionService from '../services/permission';
import { getMembersByCompany } from '../services/member';
import * as AccountService from '../services/account';

const settingTypes = ['dashboardOpen', 'emailOpen', 'textOpen'];
const messageDefault = {
  finance: {
    dashboardOpen: 1,
    emailOpen: 1,
    textOpen: 0
  },
  account: {
    dashboardOpen: 1,
    emailOpen: 1,
    textOpen: 0
  },
  product: {
    dashboardOpen: 1,
    emailOpen: 0,
    textOpen: 0
  },
  promotion: {
    dashboardOpen: 1,
    emailOpen: 0,
    textOpen: 0
  },
  operation: {
    dashboardOpen: 1,
    emailOpen: 0,
    textOpen: 0
  },
  tickets: {
    dashboardOpen: 1,
    emailOpen: 1,
    textOpen: 0
  }
};

export const getUserMessageSetting = async (companyId: number, userId: number, isMember: number, messageType: string) => {
  let email = '';
  let account = undefined;
  let verifyPhone = undefined;
  const result = {
    userInfo: {},
    setting: {}
  };
  let messageId = undefined;

  if (isMember) {
    account = await AccountService.getMemberInfo(userId, companyId);
  } else {
    account = await AccountService.getMainAccountByCompanyId(companyId);
  }

  if (account) {
    email = account.email || '';
    verifyPhone = account.verifyPhone;
  }
  if (!account) {
    return false;
  }
  const notificationTypes = await NotificationService.getNotificationTypes();
  for (const notification of notificationTypes) {
    if (notification.key === messageType) {
      messageId = notification.id;
      break;
    }
  }
  if (messageId) {
    const setting = await NotificationService.getBasicMessageSettingByType(messageId, userId, isMember);
    settingTypes.forEach((item) => {
      if (!(item in setting)) {
        setting[item] = messageDefault[messageType][item];
        if (messageType === 'finance' || messageType === 'account') {
          if (item === 'textOpen' && !isMember) {
            setting[item] = 1;
          }
        }
      }
    });
    if (!verifyPhone) {
      setting.textOpen = 0;
    }
    result['userInfo']['email'] = email;
    result['userInfo']['phone'] = verifyPhone;
    result['userInfo']['userId'] = userId;
    result['setting'] = setting;
  }
  return result;
};

export const getMessageSetting = async (ctx: Koa.Context) => {
  const { companyId } = ctx.request.query;
  let { userId } = ctx.request.query;
  const result = {
    userInfo: {},
    setting: {}
  };
  let email = '';
  let account = undefined;
  let verifyPhone = undefined;
  let isMember = 0;
  if (!userId || !companyId) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }
  const member = await AccountService.getMemberInfo(userId, companyId);
  if (member) {
    isMember = 1;
    email = member.email || '';
    verifyPhone = member.verifyPhone;
  }
  if (userId === 0 || userId === '0') {
    account = await AccountService.getMainAccountByCompanyId(companyId);
  } else {
    account = await AccountService.getAccountByAccountId(userId, companyId);
  }
  if (account) {
    email = account.email || '';
    verifyPhone = account.verifyPhone;
    userId = account.accountId;
  }
  if (!member && !account) {
    ctx.body = { code: ErrCode.ACCOUNT_NOT_EXIST, errorMessage: 'account not exist' };
    return;
  }
  try {
    const notificationTypes = await NotificationService.getNotificationTypes();
    for (const notification of notificationTypes) {
      const setting = await NotificationService.getBasicMessageSettingByType(notification.id, userId, isMember);
      notification.setting = setting;
      settingTypes.forEach((item) => {
        if (!(item in setting)) {
          setting[item] = messageDefault[notification.key][item];
          // 主账号账号和财务类手机消息勾选，子账号不勾选
          if (notification.key === 'finance' || notification.key === 'account') {
            if (item === 'textOpen' && isMember === 0) {
              setting[item] = 1;
            }
          }
        }
      });
      if (!verifyPhone) {
        setting.textOpen = 0;
      }
      result['userInfo']['email'] = email;
      result['setting'][notification.key] = setting;
    }
    if (isMember === 1) {
      const mainAccount = await AccountService.getMainAccountByCompanyId(companyId);
      const permissions = await PermissionService.getMemberModulePermission(mainAccount.id, userId, mainAccount);
      // 若无财务权限,账号、财务类消息都不勾选
      if (!permissions || permissions['FinanceCenter'] === 0) {
        result['setting']['account']['dashboardOpen'] = 0;
        result['setting']['account']['emailOpen'] = 0;
        result['setting']['account']['textOpen'] = 0;
        result['setting']['finance']['dashboardOpen'] = 0;
        result['setting']['finance']['emailOpen'] = 0;
        result['setting']['finance']['textOpen'] = 0;
      }
    }
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const getCompanySettingsByType = async (companyId: number, messageType?: string) => {
  const result = {
    email: [],
    phone: [],
    dashboard: []
  };
  if (!companyId || !messageType) {
    return result;
  }

  try {
    const members = await getMembersByCompany(companyId);
    const mainAccount = await AccountService.getMainAccountByCompanyId(companyId);
    if (mainAccount) {
      const setting = await getUserMessageSetting(companyId, mainAccount.id, 0, messageType);
      if (setting) {
        if (setting.setting['dashboardOpen'] === 1) {
          result['dashboard'].push(setting.userInfo);
        }
        if (setting.setting['emailOpen'] === 1) {
          result['email'].push(setting.userInfo);
        }
        if (setting.setting['textOpen'] === 1) {
          result['phone'].push(setting.userInfo);
        }
      }
    }
    for (const member of members) {
      let financePermission = 0;
      const setting = await getUserMessageSetting(companyId, member['userId'], 1, messageType);
      if (messageType === 'finance' || messageType === 'account') {
        const permissions = await PermissionService.getMemberModulePermission(mainAccount.id, member['userId'], mainAccount);
        if (permissions['FinanceCenter'] > 0) {
          financePermission = 1;
        }
      }
      if (setting) {
        if ((messageType === 'finance' || messageType === 'account') && financePermission === 0) continue;
        if (setting.setting['dashboardOpen'] === 1) {
          result['dashboard'].push(setting.userInfo);
        }
        if (setting.setting['emailOpen'] === 1) {
          result['email'].push(setting.userInfo);
        }
        if (setting.setting['textOpen'] === 1) {
          result['phone'].push(setting.userInfo);
        }
      }
    }
    return result;
  } catch (e) {
    return result;
  }
};

export const getCompanySettings = async (ctx: Koa.Context) => {
  const { companyId } = ctx.params;
  const { messageType } = ctx.request.query;
  const result = {
    email: [],
    phone: [],
    dashboard: []
  };
  if (!companyId || !messageType) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }

  try {
    const members = await getMembersByCompany(companyId);
    const mainAccount = await AccountService.getMainAccountByCompanyId(companyId);
    if (mainAccount) {
      const setting = await getUserMessageSetting(companyId, mainAccount.id, 0, messageType);
      if (setting) {
        if (setting.setting['dashboardOpen'] === 1) {
          result['dashboard'].push(setting.userInfo);
        }
        if (setting.setting['emailOpen'] === 1) {
          result['email'].push(setting.userInfo);
        }
        if (setting.setting['textOpen'] === 1) {
          result['phone'].push(setting.userInfo);
        }
      }
    }
    for (const member of members) {
      let financePermission = 0;
      const setting = await getUserMessageSetting(companyId, member['userId'], 1, messageType);
      if (messageType === 'finance' || messageType === 'account') {
        const permissions = await PermissionService.getMemberModulePermission(mainAccount.id, member['userId'], mainAccount);
        if (permissions['FinanceCenter'] > 0) {
          financePermission = 1;
        }
      }
      if (setting) {
        if ((messageType === 'finance' || messageType === 'account') && financePermission === 0) continue;
        if (setting.setting['dashboardOpen'] === 1) {
          result['dashboard'].push(setting.userInfo);
        }
        if (setting.setting['emailOpen'] === 1) {
          result['email'].push(setting.userInfo);
        }
        if (setting.setting['textOpen'] === 1) {
          result['phone'].push(setting.userInfo);
        }
      }
    }
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};
