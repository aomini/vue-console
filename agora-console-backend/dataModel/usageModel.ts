export enum UsagePackageTypeEnum {
  NoPackage = 0,
  RTC = 1,
  CloudRecording = 2
}

export interface UsageResolutionModel {
  resolutionId: string;
  key?: string;
  nameCn: string;
  nameEn: string;
  icon: string;
  unit: string;
  unitCn: string;
  unitEn: string;
  parameter?: string;
  settingValue?: string;
  skuIds?: string;
}

export interface ProductUsageModel {
  modelId: string;
  extensionId: string;
  nameCn: string;
  nameEn?: string;
  business: string;
  model: string;
  groupList: UsageGroupModel[];
  showAggregate: number;
  packageType: UsagePackageTypeEnum;
  tipCn?: string;
  tipEn?: string;
  status: boolean;
  settingValue?: string;
}

export interface UsageGroupModel {
  groupId: string;
  nameCn: string;
  nameEn: string;
  settingId: string;
  settingValue: string;
  children: UsageResolutionModel[];
}

export interface UsageDateCondition {
  intervalType: number;
  timeType: string;
  fromTs?: number;
  endTs?: number;
}

export interface UsageConditionModel extends UsageDateCondition {
  modelId: string;
  model: string;
  business?: string;
  timezoneOffset: number;
  group?: string;
  vids?: string | string[];
  projectId: string;
}

export enum TimeTypeEnum {
  Daily = '1',
  Hourly = '2',
  Monthly = '3'
}

export enum IntervalTypeEnum {
  Last7 = 0,
  Last30 = 1,
  CurrentMonth = 2
}

export interface UsageMenuModel {
  extensionId: string;
  title: string;
  tooltip?: string;
  children: ProductUsageModel[];
}
