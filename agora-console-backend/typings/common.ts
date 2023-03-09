export type CompanyId = number & { kind?: 'CompanyId' };
export type VendorId = number & { kind?: 'VendorId' };

// 厂商地域信息：国内 ｜ 海外
export enum CompanyArea {
  CN = 'CN',
  NonCN = 'Non-CN'
}
