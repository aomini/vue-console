export interface ProductCategory {
  name: string
  en: string
  cn: string
}

export interface ProductType {
  productTypeId: string
  type: string
  area: string
  category: string
  nameCn: string
  nameEn: string
  descriptionCn: string
  descriptionEn: string
  useCaseId: string
  ssoSource: ProductSource[]
  platform: ProductPlatform[]
  status: string
  icon: string | null
  productPhotoKey?: string
  productPhotoUrl?: string
  demo?: ProductDemo[]
  showOverview: boolean
}

export interface ProductSource {
  appid: string
  product: string
  platform?: string
}

export interface ProductPlatform {
  platformId: string
  productTypeId: string
  nameCn: string
  nameEn: string
  docCn: string
  docEn: string
  icon: string
  status: string
  demo?: ProductDemo[]
}

// TODO(sun): productCategory 需要同步文档站
export const productCategoryList = [
  'Start From Scratch',
  'Entertainment',
  'Education',
  'IOT',
  'Meta',
  'Social',
  'Smart Hardware',
  'Business and Government',
]

export interface ProductDemo {
  demoId: string
  nameCn: string
  nameEn: string
  urlCn: string
  urlEn: string
  descriptionCn: string | null
  descriptionEn: string | null
  labelCn: string
  labelEn: string
  icon: string | null
}
