import { getManager } from 'typeorm';
import { UapInfo } from '../models/uapSetting';
import { UsageModel } from '../models/usageModel';
import { ExtensionStatus } from '../dataModel/ExtensionModels';
import { UsageResolution } from '../models/usageResolution';

export const getUapSetting = async (vendorId: number, companyId: number, typeId: number): Promise<UapInfo> => {
  const setting = await UapInfo.findOne({ where: { vendorId: vendorId, companyId: companyId, typeId: typeId } });
  return setting;
};

export const getUapAllSettings = async (vendorId: number, companyId: number): Promise<UapInfo[]> => {
  const settings = await UapInfo.find({ where: { vendorId: vendorId, companyId: companyId } });
  return settings;
};

export const openUapSetting = async (typeId: number, vendorId: number, appKey: string, companyId: number, projectName: string, status: number, region: number, maxSubscribeLoad: number): Promise<UapInfo> => {
  let currentSetting = undefined;
  const settingDB = getManager().getRepository(UapInfo);
  const originSetting = await UapInfo.findOne({ where: { vendorId: vendorId, typeId: typeId } });
  if (originSetting) {
    originSetting.status = 1;
    originSetting.maxSubscribeLoad = maxSubscribeLoad;
    originSetting.region = region;
    currentSetting = await UapInfo.save(originSetting);
  } else {
    const setting = new UapInfo();
    setting.typeId = typeId;
    setting.vendorId = vendorId;
    setting.appKey = appKey;
    setting.companyId = companyId;
    setting.projectName = projectName;
    setting.status = status;
    setting.maxSubscribeLoad = maxSubscribeLoad;
    setting.maxResolution = '300*500';
    setting.region = region;
    currentSetting = await settingDB.save(setting);
  }
  return currentSetting;
};

export const getUsageModelList = async (status: string): Promise<UsageModel[]> => {
  const usageModelDB = getManager().getRepository(UsageModel);
  const usageModelList = await usageModelDB.createQueryBuilder('usageModel')
    .where('usageModel.status in (:status, :statusActive)', {
      status: status,
      statusActive: ExtensionStatus.Active
    })
    .addOrderBy('weight', 'DESC').getMany();
  return usageModelList;
};

export const getUsageModel = async (modelId: string): Promise<UsageModel> => {
  const model = await UsageModel.findOne({ where: { modelId: modelId } });
  return model;
};

export const getUsageResolutionList = async (): Promise<UsageResolution[]> => {
  const usageResolutionDB = getManager().getRepository(UsageResolution);
  const usageResolutionList = await usageResolutionDB.createQueryBuilder('usageResolution').getMany();
  return usageResolutionList;
};
