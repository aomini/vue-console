import axios from 'axios'
import { ProductSource, ProductType } from '@/models/ProductModels'
import { ExtensionListModel, ExtensionModel } from '@/models'

export class ProductConfig {
  public productMetaData: ProductType[] | null = null
  public registResource: ProductSource | null = null
  public extensionMetaData: ExtensionListModel[] | null = null

  public async getProductMetaData() {
    if (this.productMetaData) {
      return this.productMetaData
    }
    const url = `/api/v2/product-type`
    const ret = await axios.get(url)
    this.productMetaData = ret.data
    return this.productMetaData
  }

  public async getExtensionMetaData() {
    if (this.extensionMetaData) {
      return this.extensionMetaData
    }
    const url = `/api/v2/extension-metadata`
    const ret = await axios.get(url)
    this.extensionMetaData = ret.data
    return this.extensionMetaData
  }

  public async getExtension(extensionId?: string) {
    if (!this.extensionMetaData) {
      await this.getExtensionMetaData()
    }
    const extensionList: ExtensionModel[] = []
    this.extensionMetaData!.forEach((item) => {
      extensionList.push(...item.children)
    })
    if (!extensionId) {
      return extensionList.sort((a, b) => (parseInt(a.weight) < parseInt(b.weight) ? 1 : -1))
    }
    return extensionList.find((item) => item.extensionId === extensionId)
  }

  public async getRegistSource() {
    if (this.registResource) {
      return this.registResource
    }
    const url = `/api/v2/regist-source`
    const ret = await axios.get(url)
    this.registResource = ret.data
    return this.registResource
  }

  public async updateVendorRelationWithProduct(projectId: string, productTypeId: string, platformId: string) {
    const url = `/api/v2/project/${projectId}/relation`
    const ret = await axios.post(url, { productTypeId, platformId })
    return ret.data
  }
}

export const productConfig = new ProductConfig()
