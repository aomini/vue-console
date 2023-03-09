import * as Koa from 'koa';
import * as NotificationService from '../services/notification';

export const getNotifications = async (ctx: Koa.Context) => {
  const user = ctx.state.user;
  let isMember = 0;
  try {
    const notificationTypes = await NotificationService.getNotificationTypes();
    for (const notification of notificationTypes) {
      if (user.isMember) {
        isMember = 1;
      }
      const setting = await NotificationService.getMessageSettingByType(notification.id, user.id, isMember);
      notification.setting = setting;
    }
    ctx.status = 200;
    ctx.body = notificationTypes;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};

export const setNotificationSetting = async (ctx: Koa.Context) => {
  const user = ctx.state.user;
  const { dashboardOpen, emailOpen, textOpen, messageId } = ctx.request.body;
  let isMember = 0;
  if (user.isMember) {
    isMember = 1;
  }
  try {
    const setting = await NotificationService.setMessageSetting(messageId, isMember, user.id, dashboardOpen, emailOpen, textOpen);
    ctx.status = 200;
    ctx.body = setting;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
  }
};
