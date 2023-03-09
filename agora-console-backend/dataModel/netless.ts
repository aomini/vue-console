export const netlessServiceTypes: string[] = ['static_conversion', 'dynamic_conversion', 'snapshot'];

export enum EnabledStatus {
  Enabled = 1,
  Disabled = 0
}

export enum DeletedStatus {
  IsDeleted = 1,
  Normal = 0
}

export const ConcurrentTypeMap = {
  'static_conversion': 'STATIC_PPT',
  'dynamic_conversion': 'DYNAMIC_PPT'
};
