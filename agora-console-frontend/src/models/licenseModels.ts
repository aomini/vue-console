export enum LicenseProduct {
  RTC = 1,
  RTSA = 2,
  FPA = 3,
}
export const LicenseProductList = ['RTC', 'RTSA', 'FPA']

type licenseProductType = 1 | 2
export enum LicenseProductType {
  SdkAccount = 1,
  SdkDevice = 2,
}

type orderType = 1 | 2
export enum OrderType {
  Standard = 1,
  Testing = 2,
}

export enum QuerySwitch {
  active = 1,
  disabled = 0,
}

type purchaseType = 1 | 2
export enum PurchaseType {
  apply = 1,
  renew = 2,
}

type mediaType = 1 | 2
export enum MediaType {
  AudioandVideo = 1,
  AudioOnly = 2,
}

export interface LicenseConfig {
  querySwitch: number
  updateTime: string
}

export interface LicenseVidUsage {
  pid: string
  projectName: string
  status: number
  count: number
  actives: number
  unActives: number
  expires: number
}

export interface LicenseVendorInfo {
  id: number
  name: string
  unActiveCount: number
}

export interface CompanyProductLicenseQuotaResponse {
  unAllocate: number
  vendorList: LicenseVendorInfo[]
  vendorCount: number
}

export interface LicensePidUsage {
  pid: string
  status: number
  count: number
  actives: number
  unActives: number
  allocate: number
  unAllocate: number
  updateTime: string
  vidStocks: LicenseVidUsage[]
  productSku: ProductSku
  product?: string
}

export interface LicenseProductTotalUsage {
  product: string
  total: number
  actives: number
  unActives: number
  expires: number
  allocate: number
  unAllocate: number
  inThirtyDays: number
  pidList: LicensePidUsage[]
}

export interface LicenseAggregate {
  cid: string
  total: number
  actives: number
  expires: number
  unActives: number
  allocate: number
  unAllocate: number
  inThirtyDays: number
  productUsages: { [key: string]: number }
}

export interface LicenseOrderHistory {
  count: number
  createTime: string
  duration: number
  id: number
  pid: string
  sales: string
  type: orderType
  purchaseType: purchaseType
  productSku: ProductSku
  renewList?: RenewOrder[]
  loading?: boolean
}

export interface ProductSku {
  id: string
  product: number
  productType: licenseProductType
  mediaType: mediaType
  minutes: number
  duration: number
  type: orderType
}

export interface RenewOrder {
  renewId: string
  createTime: string
  sales: string
  count: number
  duration: string
}
