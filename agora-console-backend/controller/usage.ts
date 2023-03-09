import * as Koa from 'koa';

import * as UsageInfo from '../externalService/usage';
import * as ProjectService from '../services/project';
import * as UsageService from '../services/usage';
import * as MarketingService from '../externalService/marketing';
import { ErrCode } from './apiCodes';
import * as moment from 'moment';

import { processError } from '../utils/error';
import { Params, ListParams } from '../models/listReply';
import { CloudTypeMap, UapExtensionMap } from '../dataModel/uapModel';
import { ExtensionEvents, generateExtensionLog, ProductLogEnum } from '../services/extensionLog';
import { config } from '../config';
import { ExtensionStatus } from '../dataModel/ExtensionModels';
import { UsageResolutionModel } from '../dataModel/usageModel';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import * as _ from 'lodash';

interface UsageResp {
  vid: number;
  key: string;
  ts: number;
  usage: number;
}

export enum UsageQueryInterval {
  hourly = 'hourly',
  daily = 'daily',
  monthly = 'monthly'
}

const transferIntervalToMomentUnit = (interval: UsageQueryInterval) => {
  switch (interval) {
    case UsageQueryInterval.hourly:
      return 'hour';
    case UsageQueryInterval.daily:
      return 'day';
    case UsageQueryInterval.monthly:
      return 'month';
  }
};

const getMomentInterval = (momentUnit: 'hour' | 'day' | 'month', fromTs: number, endTs: number) => {
  const momentItems: Moment[] = [];
  const startMoment = moment.utc(fromTs * 1000).startOf(momentUnit);
  const endMoment = moment.utc(endTs * 1000);
  while (startMoment.isBefore(endMoment)) {
    momentItems.push(moment(startMoment));
    startMoment.add(1, momentUnit);
  }
  return momentItems;
};

export interface UsageObj {
  fromTs?: number;
  endTs?: number;
  vids?: string | string[];
  companyId?: number;
  model: string;
  business: string;
  order: string;
  interval?: string;
  timezoneOffset?: number;
}

export interface UsageVendorObj {
  startTs?: number;
  endTs?: number;
}

const usagePackageProductType = {
  RTC: 1,
  cloudRecording: 2
};

const skuMap = {
  1006: 'Audio',
  2016: 'Video(HD)',
  2017: 'Video(HD+)',
  1009: 'Audio',
  2025: 'Video(HD)',
  2026: 'Video(HD+)',
  10063: 'Video Total Duration(Full HD)',
  10064: 'Video Total Duration(2K)',
  10065: 'Video Total Duration(2K+)',
  10033: 'Video Total Duration(Full HD)',
  10034: 'Video Total Duration(2K)',
  10035: 'Video Total Duration(2K+)'
};

const serviceNameMap = {
  'aliyun_voice_async_scan': 8001,
  'kingsoft_voice_scan': 8002
};

export const getUsageInfo = async (ctx: Koa.Context) => {
  try {
    const { projectId, model, business, timeType, aggregate, timezoneOffset = 0 } = ctx.query;
    let { fromTs, endTs } = ctx.query;
    const companyId = ctx.state.user.companyId;
    const thirdParty = ctx.session.thirdParty;

    if (!model) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PARAMS_MISSING };
      return;
    }

    if (!fromTs || !endTs || isNaN(fromTs) || isNaN(endTs)) {
      const todayDate = moment().utc().startOf('day');
      endTs = (todayDate.unix());
      fromTs = (todayDate.subtract(7, 'days').unix());
    }
    endTs = Number(endTs) + (24 * 60 * 60);

    const usageObj: UsageObj = { model, business, order: 'time:asc', fromTs, endTs };

    if ((projectId === '0' || !projectId) && !Number(aggregate)) {
      usageObj.companyId = companyId;
    } else if (Number(aggregate)) {
      const params = new ListParams(1, 10, { fetchAll: true, companyId });
      const projects = await ProjectService.getProjectsByCompany(params);
      const vendorIds = projects.items.map(project => project.id);
      usageObj.vids = vendorIds.join(',');
    } else {
      const vendorInfo = await ProjectService.getVendorInfo(projectId, companyId, thirdParty);
      if (!vendorInfo) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
        return;
      } else {
        usageObj.vids = vendorInfo.id.toString();
      }
    }

    let dateFormat = 'YYYY-MM-DD';
    if (timeType && timeType === '2') {
      usageObj.interval = business === 'cdn' ? 'FIVE_MINUTE' : 'hourly';
      dateFormat = business === 'cdn' ? 'YYYY-MM-DD HH:mm:00' : 'YYYY-MM-DD HH:00';
      usageObj.fromTs = Number(usageObj.fromTs) + (timezoneOffset * 60);
      usageObj.endTs = Number(usageObj.endTs) + (timezoneOffset * 60);
    }
    if (timeType && timeType === '3') {
      usageObj.interval = 'monthly';
      dateFormat = 'YYYY-MM';
      usageObj.fromTs = Number(usageObj.fromTs) + (timezoneOffset * 60);
      usageObj.endTs = Number(usageObj.endTs) + (timezoneOffset * 60);
    }

    const params = new Params(usageObj);
    const ret = await UsageInfo.getUsageInfo(ctx.logger, params);
    let usageData = ret.data || [];

    // 兼容用量拆分逻辑，2021.1之前的互动直播用量用老的字段
    const filterMoment = moment('2021-01-01 00:00:00').unix();
    usageData = usageData.map((usageObj) => {
      // 如果hdp有用量，拆分出来的没用量则用hdp覆盖1080
      if (usageObj.usage['hdpAll'] && !usageObj.usage['video1080pAll'] && !usageObj.usage['video2kAll'] && !usageObj.usage['video4kAll']) {
        usageObj.usage['video1080pAll'] = usageObj.usage['hdpAll'];
      }
      if (usageObj.usage['hdpHost'] && !usageObj.usage['video1080pHost'] && !usageObj.usage['video2kHost'] && !usageObj.usage['video4kHost']) {
        usageObj.usage['video1080pHost'] = usageObj.usage['hdpHost'];
      }
      if (usageObj.usage['hdpAudience'] && !usageObj.usage['video1080pAudience'] && !usageObj.usage['video2kAudience'] && !usageObj.usage['video4kAudience']) {
        usageObj.usage['video1080pAudience'] = usageObj.usage['hdpAudience'];
      }
      if (moment(usageObj['dateTime']).unix() < filterMoment) {
        usageObj.usage['premiumAudioAudience'] = usageObj.usage['audioAudience'];
        usageObj.usage['premiumSdAudience'] = usageObj.usage['sdAudience'];
        usageObj.usage['premiumHdAudience'] = usageObj.usage['hdAudience'];
        usageObj.usage['premiumHdpAudience'] = usageObj.usage['hdpAudience'];
        usageObj.usage['premium1080pAudience'] = usageObj.usage['video1080pAudience'];
        usageObj.usage['premium2kAudience'] = usageObj.usage['video2kAudience'];
        usageObj.usage['premium4kAudience'] = usageObj.usage['video4kAudience'];
      }
      return usageObj;
    });

    let resultsSec = [];
    if (timeType && timeType === '2') {
      resultsSec = usageData.map(usageObj => {
        return Object.assign({ date: moment((moment(usageObj['dateTime']).unix() - (timezoneOffset * 60)) * 1000).format(dateFormat) }, { vid: usageObj['vid'] }, usageObj['usage']);
      });
    } else {
      resultsSec = usageData.map(usageObj => Object.assign({ date: moment.utc(usageObj['dateTime']).format(dateFormat) }, { vid: usageObj['vid'] }, usageObj['usage']));
    }

    ctx.status = 200;
    ctx.body = resultsSec;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_USAGE };
  }
};

export const getUsageInfoByModel = async (ctx: Koa.Context) => {
  try {
    const { projectId, modelId, timeType, aggregate, timezoneOffset = 0 } = ctx.query;
    let { fromTs, endTs } = ctx.query;
    const companyId = ctx.state.user.companyId;
    const thirdParty = ctx.session.thirdParty;

    // 参数验证
    if (!modelId) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PARAMS_MISSING };
      return;
    }

    // 获取模型下的 resolution 配置，组装成 skus
    const usageModel = await UsageService.getUsageModel(modelId);
    const resolutionList = JSON.parse(usageModel.renderParams).resolutionList as UsageResolutionModel[];
    const skus = {};
    resolutionList.forEach(resolution => {
      skus[resolution.key] = {
        ids: resolution.skuIds?.split(',')
      };
    });
    const allKeys = _.map(resolutionList, 'key');
    const zeros = _.zipObject(
      allKeys,
      _.map(allKeys, () => 0)
    );

    // 如果 query 里 没传 fromTs 和 endTs， 设置默认值一周
    if (!fromTs || !endTs || isNaN(fromTs) || isNaN(endTs)) {
      const todayDate = moment().utc().startOf('day');
      endTs = (todayDate.unix());
      fromTs = (todayDate.subtract(7, 'days').unix());
    }
    endTs = Number(endTs) + (24 * 60 * 60);

    // 构建 UsageObj
    const usageObj: any = { order: 'time:asc', fromTs, endTs };

    if ((projectId === '0' || !projectId) && !Number(aggregate)) {
      usageObj.companyId = [companyId];
    } else if (Number(aggregate)) {
      const params = new ListParams(1, 10, { fetchAll: true, companyId });
      const projects = await ProjectService.getProjectsByCompany(params);
      const vendorIds = projects.items.map(project => project.id);
      usageObj.vids = vendorIds;
    } else {
      const vendorInfo = await ProjectService.getVendorInfo(projectId, companyId, thirdParty);
      if (!vendorInfo) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
        return;
      } else {
        usageObj.vids = [vendorInfo.id.toString()];
      }
    }

    let dateFormat = 'YYYY-MM-DD';
    if (timeType && timeType === '1') {
      usageObj.interval = 'daily';
      // 按天基于 UTC 时间
      usageObj.fromTs = Number(usageObj.fromTs) - (timezoneOffset * 60);
      usageObj.endTs = Number(usageObj.endTs) - (timezoneOffset * 60);
    }
    if (timeType && timeType === '2') {
      // 按小时基于本地时间
      usageObj.interval = 'hourly';
      dateFormat = 'YYYY-MM-DD HH:00';
      usageObj.fromTs = Number(usageObj.fromTs) + (timezoneOffset * 60);
      usageObj.endTs = Number(usageObj.endTs) + (timezoneOffset * 60);
    }
    if (timeType && timeType === '3') {
      usageObj.interval = 'monthly';
      dateFormat = 'YYYY-MM';
      usageObj.fromTs = Number(usageObj.fromTs) - (timezoneOffset * 60);
      usageObj.endTs = Number(usageObj.endTs) - (timezoneOffset * 60);
    }

    const params = new Params({
      fromTs: usageObj.fromTs,
      endTs: usageObj.endTs,
      interval: usageObj.interval
    });

    const data = {
      vids: usageObj.vids ? usageObj.vids : [],
      cids: usageObj.companyId ? usageObj.companyId : [],
      skus
    };
    const ret = await UsageInfo.getUsageInfoBySku(ctx.logger, params, data);
    const usageData: UsageResp[] = _.flatten(ret.data) || [];
    const summedUsages = _.chain(usageData)
      .groupBy(({ ts }) => ts)
      .mapValues((r) =>
        _.chain(r)
          .groupBy('key')
          .mapValues((u) => _.sumBy(u, 'usage'))
          .value()
      )
      .value();

    const momentUnit = transferIntervalToMomentUnit(usageObj.interval);
    const momentItems: Moment[] = getMomentInterval(momentUnit, usageObj.fromTs, usageObj.endTs);
    const result = momentItems.map((ts) => {
      return {
        date: timeType && timeType === '2' ? moment((moment(ts).unix() - (timezoneOffset * 60)) * 1000).format(dateFormat) : moment.utc(ts).format(dateFormat),
        ...zeros,
        ..._.mapValues(summedUsages[ts.unix()])
      };
    });
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_USAGE };
  }
};

export const getMarketplaceUsageInfo = async (ctx: Koa.Context) => {
  try {
    const { projectId, sku } = ctx.query;
    let { fromTs, endTs } = ctx.query;
    const companyId = ctx.state.user.companyId;
    const thirdParty = ctx.session.thirdParty;
    const data = {
      vids: [],
      skuIds: []
    };

    if (!sku) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PARAMS_MISSING };
      return;
    }

    if (!serviceNameMap[sku]) {
      ctx.status = 200;
      ctx.body = [];
      return;
    }
    data['skuIds'].push(serviceNameMap[sku]);

    if (!fromTs || !endTs || isNaN(fromTs) || isNaN(endTs)) {
      const todayDate = moment().utc().startOf('day');
      endTs = (todayDate.unix());
      fromTs = (todayDate.subtract(7, 'days').unix());
    }
    endTs = Number(endTs) + (24 * 60 * 60);

    const usageObj: UsageVendorObj = { startTs: fromTs, endTs };

    if (projectId === '0' || !projectId) {
      const params = new ListParams(1, 10, { fetchAll: true, companyId });
      const projects = await ProjectService.getProjectsByCompany(params);
      const vendorIds = projects.items.map(project => project.id);
      data.vids = vendorIds;
    } else {
      const vendorInfo = await ProjectService.getVendorInfo(projectId, companyId, thirdParty);
      if (!vendorInfo) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
        return;
      } else {
        data.vids = [vendorInfo.id.toString()];
      }
    }

    const params = new Params(usageObj);
    const ret = await UsageInfo.getVendorUsageInfoDaily(ctx.logger, params, data);
    const usageData = ret;
    const resultsSec = usageData.map(usageObj => Object.assign({ date: moment.unix(usageObj['ts']).format('YYYY-MM-DD') }, { vid: usageObj['vid'], usage: usageObj['usage'] }));
    ctx.status = 200;
    ctx.body = resultsSec;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_USAGE };
  }
};

export const getUapSetting = async (ctx: Koa.Context) => {
  const { vids, cloudTypeId } = ctx.query;
  const companyId = ctx.session.companyId;
  try {
    const ret = await UsageService.getUapSetting(vids, companyId, cloudTypeId);
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.GET_UAP_ERROR };
  }
};

export const getRemainingUsage = async (ctx: Koa.Context, productType: number) => {
  const companyId = ctx.state.user.companyId;
  const ts = moment().subtract(60 * 60 * 12, 'seconds').unix() * 1000;
  const ret = await UsageInfo.getRemainingUsage(ctx.logger, companyId, ts);
  const packages = ret.filter(x => x.productType === productType);
  const res = {};
  for (const packageUsage of packages) {
    if (Object.keys(res).includes(skuMap[packageUsage.media])) {
      res[skuMap[packageUsage.media]] = res[skuMap[packageUsage.media]] + packageUsage.remainingUsage;
    } else {
      res[skuMap[packageUsage.media]] = packageUsage.remainingUsage;
    }
  }
  return res;
};

export const getRTCRemainingUsage = async (ctx: Koa.Context) => {
  try {
    const remainingUsage = await getRemainingUsage(ctx, usagePackageProductType.RTC);
    ctx.body = remainingUsage;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { message: 'Failed get remaining usage' };
  }
};

export const getCloudRecordingRemainingUsage = async (ctx: Koa.Context) => {
  try {
    const remainingUsage = await getRemainingUsage(ctx, usagePackageProductType.cloudRecording);
    ctx.body = remainingUsage;
    ctx.status = 200;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { message: 'Failed get remaining usage' };
  }
};

export const openUapSetting = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const statusOpen = 1;
  let maxSubscribeLoad = 10;
  let marketingData = {};
  const { vids, typeId, region } = ctx.request.body;
  if (!vids || !typeId) {
    ctx.status = 400;
    ctx.body = ctx.body = { code: ErrCode.PARAMS_MISSING };
    return;
  }
  if (CloudTypeMap[typeId] === 'CloudRecording') {
    maxSubscribeLoad = 200;
    marketingData = { Last_enable_cloud_recording__c: moment().format('YYYY-MM-DD HH:mm:ss') };
  }
  if (CloudTypeMap[typeId] === 'MiniApp' || CloudTypeMap[typeId] === 'MiniAppNew') {
    maxSubscribeLoad = 300;
    marketingData = { Last_enable_mini_app__c: moment().format('YYYY-MM-DD HH:mm:ss') };
  }
  if (CloudTypeMap[typeId] === 'PushStreaming2.0' || CloudTypeMap[typeId] === 'PushStreaming3.0') {
    maxSubscribeLoad = 500;
    marketingData = { Last_enable_rtmp_converter__c: moment().format('YYYY-MM-DD HH:mm:ss') };
  }
  if (CloudTypeMap[typeId] === 'CloudPlayer') {
    maxSubscribeLoad = 50;
  }
  if (CloudTypeMap[typeId] === 'RTMPConverter' || CloudTypeMap[typeId] === 'PushStreaming3.0') {
    maxSubscribeLoad = region === '1' ? 300 : 20;
  }
  if (CloudTypeMap[typeId] === 'ContentModeration') {
    maxSubscribeLoad = 5000;
  }
  try {
    const vendorInfo = await ProjectService.getVendorInfoById(vids, companyId);
    if (!vendorInfo) {
      ctx.status = 400;
      ctx.body = ctx.body = { code: ErrCode.FAILED_GET_VENDORINFO };
      return;
    }
    const ret = await UsageService.openUapSetting(typeId, vids, vendorInfo.key, companyId, vendorInfo.name, statusOpen, region, maxSubscribeLoad);
    MarketingService.updateAttr(companyId, marketingData).catch(err => console.error(err));
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.status = 500;
    ctx.body = ctx.body = { code: ErrCode.FAILED_SET_USAGE_SETTING };
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: vids,
    product: ProductLogEnum.RTC,
    extension: UapExtensionMap[typeId],
    result: ctx.status,
    event: ExtensionEvents.Enable,
    payload: JSON.stringify({ cloudType: CloudTypeMap[typeId] })
  });
};

export const getUsageMetadata = async (ctx: Koa.Context) => {
  const status = config.isPreprod ? ExtensionStatus.PreProd : ExtensionStatus.Active;
  const usageModelList = await UsageService.getUsageModelList(status);
  const usageResolutionModelList = await UsageService.getUsageResolutionList();
  const usageFullModelList = usageModelList.map(item => {
    const renderParams = JSON.parse(item.renderParams);
    const resolutionList = renderParams.resolutionList as UsageResolutionModel[];
    const renderType = renderParams.renderType;
    const groupList = renderParams.groupList;
    resolutionList.forEach(resolution => {
      const resolutionModel = usageResolutionModelList.find(resolutionModel => resolutionModel.resolutionId === resolution.resolutionId);
      resolution.nameCn = resolutionModel.nameCn;
      resolution.nameEn = resolutionModel.nameEn;
      resolution.icon = resolutionModel.icon;
      resolution.unitCn = resolutionModel.unitCn;
      resolution.unitEn = resolutionModel.unitEn;
      resolution.skuIds = ''; // 隐藏 sku ID
    });

    return {
      modelId: item.modelId,
      mode: item.mode,
      router: item.router,
      extensionId: item.extensionId,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      fetchParams: JSON.parse(item.fetchParams),
      renderParams: { groupList, resolutionList, renderType },
      showAggregate: item.showAggregate,
      packageType: item.packageType,
      tipCn: item.tipCn,
      tipEn: item.tipEn,
      status: item.status,
      settingValue: item.settingValue || undefined,
      weight: item.weight
    };
  });
  ctx.body = usageFullModelList;
};
