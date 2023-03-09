import axios from 'axios'
import { ExtensionModel } from '@/models'
import { ProductUsageModel, UsageMenuModel } from '../models/usageModel'
import { productConfig } from '@/services/product'
import { user } from '@/services'

export class UsageConfig {
  public usageMetaData: ProductUsageModel[] | null = null
  public usageMenus: UsageMenuModel[] | null = null

  public async getUsageMetaData() {
    if (this.usageMetaData) {
      return this.usageMetaData
    }
    const url = `/api/v2/usage/metadata`
    const ret = await axios.get(url)
    this.usageMetaData = ret.data
    return this.usageMetaData
  }

  public async getUsageModel(modelId: string) {
    if (!this.usageMetaData) {
      await this.getUsageMetaData()
    }
    return this.usageMetaData?.find((item: ProductUsageModel) => item.modelId === modelId)
  }

  public async getFullUsageMenus() {
    if (this.usageMenus) {
      return this.usageMenus
    }
    if (!this.usageMetaData) {
      await this.getUsageMetaData()
    }
    this.usageMenus = []
    const extensionList = (await productConfig.getExtension()) as ExtensionModel[]
    extensionList!.forEach((extension) => {
      const usageModelList = this.usageMetaData!.filter((item) => item.extensionId === extension.extensionId)
      if (usageModelList.length) {
        this.usageMenus!.push({
          extensionId: extension.extensionId,
          title: user.info.language === 'chinese' ? extension.nameCn : extension.nameEn,
          children: usageModelList,
        })
      }
    })
    return this.usageMenus
  }
}

export const usageConfig = new UsageConfig()
