import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { MediaType, MediaTypes } from '@/models/packageConstants'
import { getCashInfo } from '@/services'
const audioImg = require('@/assets/icon/icon-package-audio.png')
const videoImg = require('@/assets/icon/icon-package-video.png')
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div class="card-box overview-card-1" v-loading="loading">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03">{{ $t('Minutes Package') }}</span>
        </div>
        <div class="header-right" @click="jumpToPackage">
          <span class="heading-dark-03">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div class="card-content marketplace content-padding">
        <div class="d-flex space-between">
          <div class="flex-1 text-center marketplace-item">
            <img :src="audioImg" class="w-100px border-50" />
            <div class="heading-grey-05 heading-dark-03 nowrap">{{ packageItem1.packageName }}</div>
            <div class="heading-dark-03 text-line-2 colomn-desc">{{ getUnitPrice(packageItem1) }}</div>
            <console-button class="console-btn-white overview-btn mt-13" @click="jumpToPackage">{{
              $t('View')
            }}</console-button>
          </div>
          <div class="flex-1 text-center marketplace-item">
            <img :src="videoImg" class="w-100px border-50" />
            <div class="heading-grey-05 heading-dark-03 nowrap">{{ packageItem2.packageName }}</div>
            <div class="heading-dark-03 text-line-2 colomn-desc">{{ getUnitPrice(packageItem2) }}</div>
            <console-button class="console-btn-white overview-btn mt-13" @click="jumpToPackage">{{
              $t('View')
            }}</console-button>
          </div>
          <div class="flex-1 text-center marketplace-item">
            <img :src="videoImg" class="w-100px border-50" />
            <div class="heading-grey-05 heading-dark-03 nowrap">{{ packageItem3.packageName }}</div>
            <div class="heading-dark-03 text-line-2 colomn-desc">{{ getUnitPrice(packageItem3) }}</div>
            <console-button class="console-btn-white overview-btn mt-13" @click="jumpToPackage">{{
              $t('View')
            }}</console-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class PackageCard extends Vue {
  loading: boolean = false
  allMediaTypes = MediaTypes
  mediaType = 1006
  productType = 1
  packageItem1: any = {}
  packageItem2: any = {}
  packageItem3: any = {}
  audioImg = audioImg
  videoImg = videoImg
  account: any = {}
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false

  get currency() {
    return this.account && this.account.accountCurrency
  }

  async mounted() {
    this.loading = true
    this.account = await getCashInfo()
    const [packageItem1, packageItem2, packageItem3] = await Promise.all([
      this.getMinPackageList(MediaType['Audio Total Duration']),
      this.getMinPackageList(MediaType['Video Total Duration(HD)']),
      this.getMinPackageList(MediaType['Video Total Duration(Full HD)']),
    ])
    this.packageItem1 = packageItem1
    this.packageItem2 = packageItem2
    this.packageItem3 = packageItem3
    this.loading = false
  }

  async getMinPackageList(mediaType: number) {
    try {
      const res = await this.$http.get(`/api/v2/package/minPackage/list`, {
        params: { productType: this.productType, mediaType: mediaType },
      })
      return res.data.length > 0 ? res.data[0] : {}
    } catch (e) {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    }
  }

  getUnitPrice(item: any) {
    if (this.currency === 'CNY') {
      if (item.productType === 3) {
        return Number(item.priceCNY) === 0
          ? this.$t('Free')
          : `${(item.priceCNY / item.usageQuote).toFixed(2)} 元/次调用`
      }
      return Number(item.priceCNY) === 0
        ? this.$t('Free')
        : `${((item.priceCNY / item.usageQuote) * 1000).toFixed(2)} 元/千分钟`
    } else {
      if (item.productType === 3) {
        return Number(item.priceUSD) === 0
          ? this.$t('Free')
          : `${(item.priceUSD / item.usageQuote).toFixed(2)} USD/Request`
      }
      return Number(item.priceUSD) === 0
        ? this.$t('Free')
        : `${((item.priceUSD / item.usageQuote) * 1000).toFixed(2)} USD/1,000 min`
    }
  }

  jumpToPackage() {
    this.$router.push({
      path: '/packages/minPackage',
    })
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'package-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
