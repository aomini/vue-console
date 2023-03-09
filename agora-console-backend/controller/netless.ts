import * as Koa from 'koa';
import * as NetlessService from '../services/netless';
import { ErrCode } from './apiCodes';
import { processError } from '../utils/error';
import { netlessServiceTypes, EnabledStatus } from '../dataModel/netless';
import * as ProjectService from '../services/project';
import { NetlessStorage } from '../models/netlessStorage';
import { Netless2Company } from '../models/netless2Company';
import {
  regionToDataCenter,
  regionMap,
  dataCenterToRegion,
  overseaRegionValues,
  chinaRegionValues
} from '../models/netlessStorageRegion';
import { generateUUID } from '../utils/encryptTool';
import isEmpty from '../utils/isEmpty';
import { AESWithDecrypt, AESWithEncrypt } from '../utils/netless';
import { ExtensionEvents, generateExtensionLog, ProductLogEnum } from '../services/extensionLog';

interface Context extends Koa.Context {}

export const checkProjectNetless = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const vendorId = ctx.params.vendorId;
  try {
    const basicInfo = await NetlessService.getProjectNetlessInfo(vendorId, companyId);
    ctx.status = 200;
    ctx.body = !!basicInfo;
  } catch (error) {
    ctx.status = 500;
    ctx.logger.error(error.message);
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT_NETLESS };
  }
};

export const getProjectNetlessInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const vendorId = ctx.params.vendorId;
  try {
    const basicInfo = await NetlessService.getProjectNetlessFullInfo(vendorId, companyId);
    const services = basicInfo && basicInfo.teamUUID && basicInfo.appUUID
      ? await NetlessService.getNetlessServiceInfo(basicInfo.teamUUID, basicInfo.appUUID)
      : undefined;
    const serviceInfo = basicInfo && basicInfo.teamUUID && basicInfo.appUUID
      ? await NetlessService.serviceInfo(basicInfo.teamUUID, basicInfo.appUUID)
      : {};
    ctx.status = 200;
    ctx.body = {
      basicInfo: basicInfo,
      services: services,
      serviceInfo: serviceInfo
    };
  } catch (error) {
    ctx.status = 500;
    ctx.logger.error(error.message);
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT_NETLESS };
  }
};

export async function listStorages(ctx: Context) {
  const companyId = ctx.session.companyId;
  const row = await Netless2Company.findOne({ companyId: companyId });
  if (!row) {
    ctx.status = 200;
    ctx.body = [];
    return;
  }
  const storages = await NetlessStorage.find({ teamUUID: row.teamUUID });
  for (const storage of storages) {
    storage.name = storage.name
      || [storage.provider, storage.region, storage.bucket, storage.path]
      // tslint:disable-next-line:no-null-keyword
      .filter(e => !['', undefined, null].includes(e))
      .join('/');
    try {
      const decryptSK = AESWithDecrypt(storage.sk);
      if (decryptSK) {
        storage.sk = decryptSK;
      }
    } catch (e) {
      console.info(e);
    }
  }
  ctx.status = 200;
  ctx.body = {
    storages: storages || [],
    regionMap: regionMap,
    regionToDataCenter: regionToDataCenter,
    dataCenterToRegion: dataCenterToRegion,
    overseaRegionValues: overseaRegionValues,
    chinaRegionValues: chinaRegionValues
  };
}

export const enableProjectNetless = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const vendorId = ctx.params.vendorId;
  const name = ctx.request.body.name || '';
  const projectInfo = await ProjectService.getVendorInfoById(vendorId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  try {
    if (!await NetlessService.getNetless2Company(companyId)) {
      await NetlessService.createNetlessCompany(companyId);
    }
    await NetlessService.enableProjectNetless(vendorId, name, companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_ENABLE_PROJECT_NETLESS };
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.Whiteboard,
    extension: 'Whiteboard',
    result: ctx.status,
    event: ExtensionEvents.Enable
  });
};

export const saveStorage = async (ctx: Context) => {
  try {
    if (isEmpty(ctx, ['name', 'provider', 'ak', 'sk', 'region', 'bucket', 'dataRegion'])
      || (ctx.request.body.provider === 'qiniu' && isEmpty(ctx, ['domain'])) // 七牛云-外链域名必填
    ) {
      ctx.status = 400;
      ctx.body = { msg: 'InvalidParam' };
      return;
    }
    const { companyId } = ctx.session;
    // const { vendorId } = ctx.params;
    const {
      id, name, provider, ak, sk, region, bucket, domain, path, dataRegion
    } = ctx.request.body;
    const { teamUUID } = await Netless2Company.findOne({ companyId: companyId });
    if (!teamUUID) {
      ctx.status = 400;
      ctx.body = { msg: 'InvalidParam' };
      return;
    }
    let netlessStorage: NetlessStorage;
    if (id) {
      netlessStorage = await NetlessStorage.findOne(id);
    } else {
      netlessStorage = new NetlessStorage();
      netlessStorage.uid = generateUUID();
    }
    netlessStorage.teamUUID = teamUUID;
    netlessStorage.name = name
      || [provider, region, bucket, path]
      // tslint:disable-next-line:no-null-keyword
      .filter(e => !['', undefined, null].includes(e))
      .join('/');
    netlessStorage.provider = provider;
    netlessStorage.ak = ak;
    const encryptSK = AESWithEncrypt(sk);
    if (encryptSK) {
      netlessStorage.sk = encryptSK;
    } else {
      netlessStorage.sk = sk;
    }
    console.log(netlessStorage.sk);
    netlessStorage.region = region;
    netlessStorage.bucket = bucket;
    netlessStorage.domain = domain;
    netlessStorage.path = path;
    netlessStorage.dataRegion = regionToDataCenter[dataRegion] || dataRegion;
    try {
      const res = await netlessStorage.save();
      ctx.status = 200;
      ctx.body = {
        id: res.id,
        uid: res.uid,
        name: res.name,
        dataRegion: res.dataRegion,
        region: res.region,
        bucket: res.bucket,
        path: res.path
      };
    } catch (e) {
      console.info(e);
      ctx.status = 400;
      ctx.body = { msg: 'DuplicatedConfiguration' };
    }
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { msg: 'SavedFail' };
  }
};

export const updateProjectServices = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const vendorId = ctx.params.vendorId;
  const serviceInfo = ctx.request.body;
  const basicInfo = await NetlessService.getProjectNetlessInfo(vendorId, companyId);
  if (!basicInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT_NETLESS };
    return;
  }
  try {
    for (const type of netlessServiceTypes) {
      const info = serviceInfo[type];
      if (info.isEnabled === EnabledStatus.Enabled) {
        if (!info.storageInfo || !info.storageInfo.selectStorageId) {
          ctx.status = 400;
          ctx.body = { code: ErrCode.WHITEBOARD_STORAGE_EXIST };
          return;
        }
        let configuration;
        if (info.storageInfo.selectStorageId === 'default') {
          configuration = { defaultStorageDriver: true };
        } else {
          const netlessStorage = await NetlessStorage.findOne({ id: info.storageInfo.selectStorageId });
          if (netlessStorage) {
            configuration = { storageDriverId: Number(netlessStorage.id) };
          } else {
            ctx.status = 400;
            ctx.body = { code: ErrCode.WHITEBOARD_STORAGE_EXIST };
            return;
          }
        }
        await NetlessService.enableProjectService(basicInfo.teamUUID, basicInfo.appUUID, type, serviceInfo.dataRegion, configuration);
      } else {
        await NetlessService.disableProjectService(basicInfo.teamUUID, basicInfo.appUUID, type, serviceInfo.dataRegion);
      }
    }
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_UPDATE_PROJECT_NETLESS };
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: vendorId,
    product: ProductLogEnum.Whiteboard,
    extension: 'Whiteboard',
    result: ctx.status,
    event: ExtensionEvents.Config,
    payload: JSON.stringify({ dataRegion: serviceInfo.dataRegion })
  });
};

export const generateNetlessDKToken = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const vendorId = ctx.params.vendorId;
  const { ak, sk } = ctx.request.body;
  const basicInfo = await NetlessService.getProjectNetlessInfo(vendorId, companyId);
  if (!basicInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT_NETLESS };
    return;
  }
  try {
    const token = await NetlessService.generateSDKToken(basicInfo.teamUUID, basicInfo.appUUID, ak, sk);
    ctx.status = 200;
    ctx.body = token;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GENERATE_NETLESS_TOKEN };
  }
};

export const checkNetlessCompanyExist = async (ctx: Koa.Context) => {
  const email = ctx.state.user.email;
  const companyId = ctx.session.companyId;
  const res = !!await NetlessService.checkNetlessEmailAccount(email, companyId);
  ctx.status = 200;
  ctx.body = res;
};

export const migrateNetlessProjects = async (ctx: Koa.Context) => {
  const email = ctx.state.user.email;
  const companyId = ctx.session.companyId;
  try {
    await NetlessService.migrateNetlessProjects(email, companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_MIGRATE_NETLESS_PROJECTS };
  }
};
