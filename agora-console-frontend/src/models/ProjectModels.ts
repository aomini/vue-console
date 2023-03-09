import { ProductType } from '@/models/ProductModels'

export enum ProjectStage {
  'Not specified' = 1,
  'Live' = 2,
  'Testing' = 3,
}

export enum KTVStatu {
  ENABLE = 1,
  DISABLED = 0,
}

export enum ProjectStatus {
  ACTIVE = 1,
  INACTIVE = 2,
}

export type AreaModel = 'all' | 'cn' | 'non-cn'

export interface ExtensionListModel {
  nameCn: string
  nameEn: string
  children: ExtensionModel[]
}

export interface ExtensionExtraDataModel {
  id: string
  enableBtnText?: string
  configBtnText?: string
  configFunc?: Function
  enableFunc?: Function
  statusFunc?: Function
  needSlot?: boolean
}

export interface ExtensionModel extends ExtensionExtraDataModel {
  extensionId: string
  nameCn: string
  nameEn: string
  descriptionCn: string
  descriptionEn: string
  icon: string
  area: AreaModel
  trackId: string
  extensionTypeId?: string
  status: string
  weight: string
  isPublic: number
  needToken: number
  configMode?: string
  menuConfig?: ExtensionMenu[]
}

export interface ExtensionConfig {
  areaCn: ExtensionMenu[]
  areaRow: ExtensionMenu[]
}

export interface ExtensionMenu {
  type: 'nav' | 'subMenu'
  nameCn: string
  nameEn: string
  status: string
  subMenu?: string
  navEn?: string
  navCn?: string
  children?: ExtensionMenu[]
  weight?: number
}

export interface ProjectFormData {
  projectName: string
  useCase: string
  productCategory: string
  product: ProductType | null
  stage: ProjectStage
  mode: string
}

export enum ProjectCreatorStatus {
  'MainAccount' = '0',
  'NoRecord' = '-1',
  'AccountDeleted' = '-2',
}
