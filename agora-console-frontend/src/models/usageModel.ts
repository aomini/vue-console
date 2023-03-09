export type FpaBusiness = 'fpa_chain' | 'flow'

export enum UsagePackageTypeEnum {
  NoPackage = 0,
  RTC = 1,
  CloudRecording = 2,
}

export interface UsageResolutionModel {
  resolutionId: string
  key: string
  nameCn: string
  nameEn: string
  icon: string
  unit: string
  unitCn: string
  unitEn: string
  groupId: string
  parameter?: string
  settingValue?: string
}

export interface ProductUsageModel {
  modelId: string
  mode: number
  router?: string
  extensionId: string
  nameCn: string
  nameEn?: string
  fetchParams: UsageFetchParams
  renderParams: UsageRenderParams
  showAggregate: number
  packageType: UsagePackageTypeEnum
  tipCn?: string
  tipEn?: string
  status: boolean
  settingValue?: string
  weight: number
}

export interface UsageFetchParams {
  model: string
  business: string
  aggregate?: number
  aggregateSettingValue?: string
}

export interface UsageRenderParams {
  renderType: number
  groupList: UsageGroupModel[]
  resolutionList: UsageResolutionModel[]
}

export interface UsageGroupModel {
  groupId: string
  nameCn: string
  nameEn: string
  settingValue: string
}

export interface UsageConditionModel extends UsageDateCondition {
  modelId: string
  model: string
  business?: string
  timezoneOffset: number
  vids?: string | string[]
  projectId: string
}

export interface UsageDateCondition {
  intervalType: number
  timeType: string
  fromTs?: number
  endTs?: number
}

export enum TimeTypeEnum {
  Daily = '1',
  Hourly = '2',
  Monthly = '3',
}

export enum IntervalTypeEnum {
  Last7 = 0,
  Last30 = 1,
  CurrentMonth = 2,
}

export interface UsageMenuModel {
  extensionId: string
  title: string
  tooltip?: string
  children: ProductUsageModel[]
}

export enum UsageMode {
  customized = 0,
  configuration = 1,
}

export enum UsageRenderType {
  Sum = 0,
  Max = 1,
}
