import { getManager, getConnection } from 'typeorm';
import { NetlessCompany } from '../models/netlessCompany';
import { NetlessProject } from '../models/netlessProject';
import { NetlessAccess } from '../models/netlessAccess';
import { Netless2Project } from '../models/netless2Project';
import { Netless2Company } from '../models/netless2Company';
import { NetlessService } from '../models/netlessService';
import { NetlessConcurrent } from '../models/netlessConcurrent';
import { createURLSafeBase64UUID, createRandomKey, sdkToken, TokenRole } from '../utils/netless';
import { EnabledStatus, ConcurrentTypeMap, DeletedStatus, netlessServiceTypes } from '../dataModel/netless';
import { UserProfile } from '../models/user';
import * as ProjectService from './project';
import { VendorInfo } from '../models/vendorInfo';
import { dataCenterToRegion } from '../models/netlessStorageRegion';
import { NetlessStorage } from '../models/netlessStorage';

export const getProjectNetlessInfo = async (vendorId: number, companyId: number) => {
  const netlessProjectDB = getManager().getRepository(Netless2Project);
  const projectNetlessInfo = await netlessProjectDB.createQueryBuilder('netless2Project')
    .innerJoin(Netless2Company, 'netless2Company', 'netless2Company.team_uuid = netless2Project.team_uuid')
    .where('netless2Project.vendor_id = :vendorId and netless2Company.company_id = :companyId', { vendorId, companyId })
    .select('netless2Project.app_uuid', 'appUUID')
    .addSelect('netless2Project.team_uuid', 'teamUUID')
    .getRawOne();
  return projectNetlessInfo;
};

export const getProjectNetlessFullInfo = async (vendorId: number, companyId: number) => {
  const netlessProjectDB = getManager().getRepository(Netless2Project);
  const projectNetlessInfo = await netlessProjectDB.createQueryBuilder('netless2Project')
    .innerJoin(Netless2Company, 'netless2Company', 'netless2Company.team_uuid = netless2Project.team_uuid')
    .innerJoin(NetlessProject, 'netlessProject', 'netless2Project.app_uuid = netlessProject.app_uuid')
    .leftJoin(NetlessAccess, 'netlessAccess', 'netlessProject.app_uuid = netlessAccess.app_uuid and netlessAccess.is_deleted !=:status and netlessAccess.isBan != :isBan', { status: DeletedStatus.IsDeleted, isBan: DeletedStatus.IsDeleted })
    .where('netless2Project.vendor_id = :vendorId and netless2Company.company_id = :companyId', { vendorId, companyId })
    .select('netlessAccess.ak', 'ak')
    .addSelect('netlessAccess.sk', 'sk')
    .addSelect('netlessProject.app_uuid', 'appUUID')
    .addSelect('netlessProject.team_uuid', 'teamUUID')
    .getRawOne();
  return projectNetlessInfo;
};

export const getNetless2Company = async (companyId: number) => {
  const res = await Netless2Company.findOne({ companyId });
  return res;
};

export const createNetlessCompany = async (companyId: number) => {
  await getConnection().transaction(async transactionalEntityManager => {
    const uuid = createURLSafeBase64UUID();
    await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(Netless2Company)
      .values({
        teamUUID: uuid,
        companyId: companyId
      })
      .execute();

    await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(NetlessCompany)
      .values({
        teamUUID: uuid,
        strategy: '',
        accessKeysMaxCount: 3,
        appsMaxCount: 10,
        roomUsersMaxCount: 0,
        version: 1,
        isAuthCdn: 1,
        isRegionRequired: 1
      })
      .execute();
  });
};

export const enableProjectNetless = async (vendorId: number, name: string, companyId: number) => {
  let teamUUID = undefined;
  let appUUID = undefined;
  const netless2Company = await getNetless2Company(companyId);
  if (!netless2Company) return;
  const netlessInfo = await Netless2Project.findOne({ where: { vendorId: vendorId } });
  if (!netlessInfo) {
    teamUUID = netless2Company.teamUUID;
    appUUID = createRandomKey(10);
  } else {
    teamUUID = netlessInfo.teamUUID;
    appUUID = netlessInfo.appUUID;
  }
  await getConnection().transaction(async transactionalEntityManager => {
    if (!netlessInfo) {
      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Netless2Project)
        .values({
          teamUUID: teamUUID,
          appUUID: appUUID,
          vendorId: vendorId
        })
        .execute();

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(NetlessProject)
        .values({
          teamUUID: teamUUID,
          appUUID: appUUID,
          name: name
        })
        .execute();
    }

    await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(NetlessAccess)
      .values({
        teamUUID: teamUUID,
        appUUID: appUUID,
        ak: createRandomKey(12),
        sk: createRandomKey(24),
        isDeleted: DeletedStatus.Normal,
        isBan: DeletedStatus.Normal
      })
      .execute();
  });
};

export const getNetlessServiceInfo = async (teamUUID: string, appUUID: string) => {
  const services = {};
  for (const dataCenter of Object.keys(dataCenterToRegion)) {
    services[dataCenter] = {};
    const dataCenterServices = await NetlessService.find({
      teamUUID: teamUUID,
      dataRegion: dataCenter,
      appUUID: appUUID
    });
    for (const dataCenterService of dataCenterServices) {
      const netlessConcurrent = await NetlessConcurrent.findOne({
        teamUUID: teamUUID,
        appUUID: appUUID,
        taskType: ConcurrentTypeMap[dataCenterService.type],
        dataRegion: dataCenterService.dataRegion
      });
      services[dataCenter][dataCenterService.type] = {
        ...dataCenterService,
        maxConcurrentNumber: netlessConcurrent && netlessConcurrent.maxConcurrentNumber
          ? netlessConcurrent.maxConcurrentNumber
          : 1
      };
    }
  }
  return services;
};

export const serviceInfo = async (teamUUID: string, appUUID: string) => {
  const result = {};
  for (const type of netlessServiceTypes) {
    result[type] = [];
    const res = await NetlessService.find({ teamUUID: teamUUID, type: type, appUUID: appUUID });
    for (const item of res) {
      const concurrent = await NetlessConcurrent.findOne({ teamUUID: teamUUID, appUUID: appUUID, taskType: ConcurrentTypeMap[type], dataRegion: item.dataRegion });
      if (concurrent) {
        item['maxConcurrentNumber'] = concurrent.maxConcurrentNumber;
      } else {
        item['maxConcurrentNumber'] = 1;
      }
      result[type].push(Object.assign({}, item, { storageInfo: {} }));
    }
  }
  result['storages'] = await NetlessStorage.find({ teamUUID: teamUUID });
  return result;
};

export const enableProjectService = async (teamUUID: string, appUUID: string, type: string, dataRegion: string, configuration: any) => {
  let serviceInfo = await NetlessService.findOne({ teamUUID: teamUUID, appUUID: appUUID, type: type, dataRegion: dataRegion });
  if (!serviceInfo) {
    serviceInfo = new NetlessService();
    serviceInfo.teamUUID = teamUUID;
    serviceInfo.appUUID = appUUID;
    serviceInfo.type = type;
    serviceInfo.dataRegion = dataRegion;
    serviceInfo.isEnabled = EnabledStatus.Enabled;
  }
  serviceInfo.configuration = configuration ? JSON.stringify(configuration) : '';
  serviceInfo.isEnabled = EnabledStatus.Enabled;
  await serviceInfo.save();

  if (!ConcurrentTypeMap[type]) return;
  let maxConcurrentInfo = await NetlessConcurrent.findOne({ teamUUID: teamUUID, appUUID: appUUID, taskType: ConcurrentTypeMap[type], dataRegion: dataRegion });
  if (!maxConcurrentInfo) {
    maxConcurrentInfo = new NetlessConcurrent();
    maxConcurrentInfo.teamUUID = teamUUID;
    maxConcurrentInfo.appUUID = appUUID;
    maxConcurrentInfo.taskType = ConcurrentTypeMap[type];
    maxConcurrentInfo.dataRegion = dataRegion;
    maxConcurrentInfo.maxConcurrentNumber = 1;
  }
  await maxConcurrentInfo.save();
};

export const disableProjectService = async (teamUUID: string, appUUID: string, type: string, dataRegion: string) => {
  const serviceInfo = await NetlessService.findOne({ teamUUID: teamUUID, appUUID: appUUID, type: type, dataRegion: dataRegion });
  if (!serviceInfo) return;
  serviceInfo.isEnabled = EnabledStatus.Disabled;
  await serviceInfo.save();
};

export const generateSDKToken = async (teamUUID: string, appUUID: string, ak: string, sk: string) => {
  const accessInfo = await NetlessAccess.findOne({ where: { teamUUID: teamUUID, appUUID: appUUID, ak: ak, sk: sk } });
  if (!accessInfo) return;
  const token = sdkToken(accessInfo.ak, accessInfo.sk, 0, {
    role: TokenRole.Admin
  });
  return token;
};

export const checkNetlessEmailAccount = async (email: string, companyId: number) => {
  let result = false;
  const netlessCompany = await getNetless2Company(companyId);
  if (netlessCompany) {
    return result;
  }
  const netlessAccountEmail = `${email}.netless`;
  const res = await UserProfile.findOne({ where: { email: netlessAccountEmail } });
  if (res) {
    const projectCount = await ProjectService.getProjectCount(res.companyId);
    result = projectCount > 0;
  }
  return result;
};

export const migrateNetlessProjects = async (email: string, companyId: number) => {
  if (!await checkNetlessEmailAccount(email, companyId)) return;
  const netlessAccountEmail = `${email}.netless`;
  const netlessAccount = await UserProfile.findOne({ where: { email: netlessAccountEmail } });
  await getConnection().transaction(async transactionalEntityManager => {
    await transactionalEntityManager
      .createQueryBuilder()
      .update(VendorInfo)
      .set({
        companyId: companyId
      })
      .where('vendor_info.company_id = :companyId', { companyId: netlessAccount.companyId })
      .execute();

    await transactionalEntityManager
      .createQueryBuilder()
      .update(Netless2Company)
      .set({
        companyId: companyId
      })
      .where('netless_2_company.company_id = :companyId', { companyId: netlessAccount.companyId })
      .execute();
  });
};
