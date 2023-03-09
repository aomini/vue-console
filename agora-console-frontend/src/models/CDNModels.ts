export type CDNModel = 'Push and delivery' | 'Pull stream from your source'
export type DomainType = 'publish' | 'play'
export type DomainScope = 'domestic' | 'overseas' | 'global'
export type DomainStatus = 'init' | 'enabled' | 'configuring'
export type CallbackStatus = 'init' | 'enabled'

export const RegionTypeOptions = {
  domestic: 'Mainland China',
  overseas: 'Hong Kong, Macau, Taiwan and Overseas',
  global: 'Global',
}

export interface CertificateModel {
  name: string
  crt: string
  key: string
  editable?: boolean
  hasCreated?: boolean
  crtFile?: string
  keyFile?: string
}

export interface DomainModel {
  type: DomainType
  scope: DomainScope
  name: string
  cname?: string
  enableHttps?: boolean
  enableRtmps?: boolean
  certName?: string
  crossDomain?: string
  crossDomainEnabled?: boolean
  authKey?: string
  editable?: boolean
  status: DomainStatus
}

export interface SourceDomainModel {
  enabled: boolean
  domain: string
  editable?: boolean
  status: DomainStatus
}

export interface CallbackModel {
  enabled: boolean
  url: string
  status: CallbackStatus
  editable?: boolean
}
