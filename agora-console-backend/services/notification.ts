import { getManager } from 'typeorm';
import { MessageTypes, MessageSetting } from '../models/notification';

export const getNotificationTypes = async () => {
  const db = getManager().getRepository(MessageTypes);
  const query = db.createQueryBuilder('messageTypes')
                  .where('messageTypes.parent_id = 0');
  const messageTypes = await query.getMany();
  return messageTypes;
};

export const getMessageSettingByType = async (messageId: number, userId: number, accountType: number): Promise<MessageSetting> => {
  const newSetting = new MessageSetting();
  const db = getManager().getRepository(MessageSetting);
  const query = db.createQueryBuilder('messageSetting')
                  .where('messageSetting.message_id = :messageId and messageSetting.account_id = :userId and messageSetting.account_type = :accountType', { messageId, userId, accountType });
  const setting = await query.getOne();
  if (!setting) {
    newSetting.dashboardOpen = 1;
    return newSetting;
  }
  return setting;
};

export const getBasicMessageSettingByType = async (messageId: number, userId: number, accountType: number): Promise<MessageSetting> => {
  const newSetting = new MessageSetting();
  const db = getManager().getRepository(MessageSetting);
  const query = db.createQueryBuilder('messageSetting')
                  .where('messageSetting.message_id = :messageId and messageSetting.account_id = :userId and messageSetting.account_type = :accountType', { messageId, userId, accountType });
  const setting = await query.getOne();
  if (!setting) {
    return newSetting;
  }
  delete setting.id;
  delete setting.accountId;
  delete setting.accountType;
  delete setting.messageId;
  return setting;
};

export const setMessageSetting = async (messageId: number, accountType: number, accountId: number, dashboardOpen: number, emailOpen: number, textOpen: number): Promise<MessageSetting> => {
  const messageDB = getManager().getRepository(MessageSetting);
  const newSetting = new MessageSetting();
  newSetting.messageId = messageId;
  newSetting.accountType = accountType;
  newSetting.accountId = accountId;
  let currentSetting = await messageDB.findOne(newSetting);
  if (currentSetting) {
    currentSetting.dashboardOpen = dashboardOpen;
    currentSetting.emailOpen = emailOpen;
    currentSetting.textOpen = textOpen;
    currentSetting = await messageDB.save(currentSetting);
  } else {
    newSetting.dashboardOpen = dashboardOpen;
    newSetting.emailOpen = emailOpen;
    newSetting.textOpen = textOpen;
    currentSetting = await messageDB.save(newSetting);
  }
  return currentSetting;
};
