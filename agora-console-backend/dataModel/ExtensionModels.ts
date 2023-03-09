export interface ExtensionModel {
  extensionId: string;
  nameCn: string;
  nameEn: string;
  descriptionCn: string;
  descriptionEn: string;
  extensionTypeId: string;
  configMode: string;
  icon: string;
  area: string;
  status: string;
  isPublic: number;
  weight: number;
  needToken: number;
  trackId: string;
  menuConfig: ExtensionMenu[];
  linkConfig: ExtensionLinkModel | string | null;
}

export interface ExtensionLinkModel {
  areaCn: string;
  areaRow: string;
  transferVendorId: boolean;
  transferProjectId: boolean;
}

export interface ExtensionMenu {
  type: 'nav' | 'subMenu';
  nameCn: string;
  nameEn: string;
  status: string;
  subMenu?: string;
  navEn?: string;
  navCn?: string;
  children?: ExtensionMenu[];
  weight?: number;
}

export enum ExtensionStatus {
  Active = 'Active',
  PreProd = 'PreProd',
  Disable = 'Disable'
}

export enum ExtensionArea {
  All = 'All',
  CN = 'CN',
  Oversea = 'Non-CN',
  AllCNPreview = 'AllCNPreview',
  AllENPreview = 'AllENPreview'
}

export interface ExtensionConfig {
  areaCn: ExtensionMenu[];
  areaRow: ExtensionMenu[];
}

export interface ExtensionTypeModel {
  extensionTypeId: string;
  nameCn: string;
  nameEn: string;
  status: string;
  weight: number;
}

export interface ExtensionMetadataForClient extends ExtensionTypeModel {
  children: ExtensionModel[];
}
