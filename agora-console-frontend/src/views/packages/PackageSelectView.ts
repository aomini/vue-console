import Vue from 'vue'
import Component from 'vue-class-component'
import numeral from 'numeral'
import moment from 'moment'
import { CloudMedia, CloudMediaIds, ContentMediaIds, MediaType, ProductType, RtcMedia, RtcMediaIds } from '@/models'
import { getCashInfo, user } from '@/services'
import './Package.less'
import CartComponent from '@/views/packages/CartComponent'
const audioImg = require('@/assets/icon/icon-package-audio.png')
const videoImg = require('@/assets/icon/icon-package-video.png')
const contentMvImg = require('@/assets/icon/icon-package-mv.png')
const contentKtvImg = require('@/assets/icon/icon-package-ktv.png')
const bannerImg = require('@/assets/icon/pic-package.png')

@Component({
  components: {
    CartComponent,
  },
  template: `<div v-loading="loading" class="package-page">
    <div class="banner-box d-flex justify-center">
      <div class="d-flex package-banner">
        <img :src="bannerImg" class="banner" />
        <div class="banner-desc text-center">
          <div class="heading-dark-24  mb-16">
            {{ bannerPackage.packageName }}
          </div>
          <div class="heading-grey-13 mb-5">{{ getUnitPrice(bannerPackage) }}</div>
          <div class="heading-grey-13 mb-16">{{ $t('PackageValid') + getExpire(bannerPackage) }}</div>
          <div class="package-price heading-orange-01 text-center mb-16">
            <span class="curency">{{ currency === 'CNY' ? '￥' : '$' }}</span>
            {{ numeral(getPrice(bannerPackage)).format('0,0.00') }}
          </div>
          <div>
            <el-input-number
              v-model="bannerPackage.number"
              :min="0"
              :step="1"
              :step-strictly="true"
              size="small"
              style="width: 150px"
              class="text-center mb-16"
            ></el-input-number>
          </div>
          <console-button
            class="console-btn-primary w-190 f-500 line-height-20"
            @click="handleSelectPackage(bannerPackage)"
          >
            <span class="iconfont iconicon-gouwuche f-20 vertical-bottom"></span>
            {{ $t('Add to Cart') }}</console-button
          >
        </div>
      </div>
    </div>
    <div class="types">
      <div class="item">
        <span class="label">{{ $t('ProductType') }}：</span>
        <el-radio-group size="small" v-model="productType" @change="selectType">
          <el-radio-button :label="item.value" v-for="item in ProductTypeOption" :key="item.value">{{
            $t(item.label)
          }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="item d-flex align-center mt-20">
        <div>
          <span class="label">{{ $t('Type') }}：</span>
          <el-radio-group size="small" v-model="mediaType" @change="selectMedia">
            <el-radio-button :label="item.id" v-for="item in mediaTypeMap[productType]" :key="item.id">{{
              $t(item.name)
            }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="productType !== 3" class="doc-tip ml-20">
          <span>{{ $t('DocTipHD') }}</span>
          <span class="ml-1">
            <a target="_blank" :href="$t('DocLint')">{{ $t('Doc') }}</a>
          </span>
        </div>
      </div>
    </div>
    <div class="package-content d-flex mt-20">
      <div
        class="package package-card"
        v-for="(item, index) in packageList"
        :class="{ 'package-selected': item.selected > 0 }"
        :key="index"
      >
        <div class="logo d-flex align-center" :class="itemBannnerClass">
          <img class="w-80 ml-10" :src="itemImg" />
          <div class="heading-dark-14 ml-10 logo-duration">
            {{ item.packageName }}
          </div>
        </div>
        <div class="desc mt-30">
          <div class="heading-grey-13">{{ getUnitPrice(item) }}</div>
          <div class="heading-grey-13">{{ $t('PackageValid') + getExpire(item) }}</div>
        </div>
        <div class="package-price heading-orange-01 text-center">
          <span class="curency">{{ currency === 'CNY' ? '￥' : '$' }}</span>
          {{ numeral(getPrice(item)).format('0,0.00') }}
        </div>
        <div class="text-center mt-10">
          <el-input-number
            v-model="item.number"
            :min="0"
            :max="item.maxQuantity && item.maxQuantity >= 1 ? item.maxQuantity : Infinity"
            :step="1"
            :step-strictly="true"
            size="small"
            class="text-center"
          ></el-input-number>
        </div>
        <div class="cart-button">
          <console-button
            class="console-btn-primary-outline w-100 f-500 line-height-20"
            @click="handleSelectPackage(item)"
          >
            <span class="iconfont iconicon-gouwuche f-20 mr-8 vertical-bottom"></span>
            {{ $t('Add to Cart') }}</console-button
          >
        </div>
      </div>
    </div>
    <CartComponent
      :packages="minPackageItems"
      :selectPackages="selectPackageItems"
      @removeSelectPackage="removeSelectPackage"
      ref="cart"
    ></CartComponent>
  </div>`,
})
export default class PackageSelectView extends Vue {
  numeral = numeral
  user: any = user
  isDefaultPricing = true
  moment = moment
  ProductTypeOption = [
    { label: 'RTC', value: 1 },
    { label: 'Cloud Recording', value: 2 },
  ]
  mediaTypeMap = {
    1: RtcMedia,
    2: CloudMedia,
  }
  rtcMediaIds = RtcMediaIds
  cloudMediaIds = CloudMediaIds
  contentMediaIds = ContentMediaIds
  packageType = {
    MinPackage: 3,
  }
  loading = false
  account: any = {}
  productType = 1
  mediaType = 1006
  packageList = []
  bannerPackage: any = {}
  selectPackage: any = {}
  minPackageItems: any[] = []
  selectPackageItems: any[] = []
  totalCount = 0
  totalAmount = 0
  selected = ''
  language = user.info.language
  audioImg = audioImg
  videoImg = videoImg
  contentMvImg = contentMvImg
  contentKtvImg = contentKtvImg
  bannerImg = bannerImg

  get itemImg() {
    if (this.mediaType === 1006 || this.mediaType === 1009) {
      return this.audioImg
    } else if (this.mediaType === 20006) {
      return this.contentKtvImg
    } else if (this.mediaType === 20031) {
      return this.contentMvImg
    } else {
      return this.videoImg
    }
  }

  get itemBannnerClass() {
    if ([1006, 1009, 20006].includes(this.mediaType)) {
      return 'audio-banner'
    } else {
      return 'video-banner'
    }
  }

  get country() {
    return this.user.info && this.user.info.company && this.user.info.company.area === 'CN' ? 'CN' : 'ROW' || 'ROW'
  }

  get currency() {
    return this.account && this.account.accountCurrency
  }

  get number() {
    let totalCount = 0
    for (const key in this.selectPackage) {
      totalCount += this.selectPackage[key]['number']
    }
    return totalCount
  }

  async mounted() {
    if (!this.checkPagePermission()) {
      this.$router.push({
        path: '/',
      })
    }
    this.loading = true
    this.initData()
    this.account = await getCashInfo()
    await this.getMinPackageList()
    await this.getBannerPackage()
    await this.getCompanyPricing()
    this.loading = false
  }

  checkPagePermission() {
    const permissions = this.user.info.permissions
    return this.country === 'CN' && permissions['FinanceCenter'] > 0
  }

  async getMinPackageList() {
    try {
      const res = await this.$http.get(`/api/v2/package/minPackage/list`, {
        params: { productType: this.productType, mediaType: this.mediaType },
      })
      this.packageList = res.data
      this.packageList.forEach((item: any) => {
        if (this.selectPackage[item.id]) {
          item.number = this.selectPackage[item.id].number
        }
      })
    } catch (e) {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    }
  }

  async getBannerPackage() {
    try {
      const res = await this.$http.get(`/api/v2/package/minPackage/list`, {
        params: { productType: ProductType.RTC, mediaType: MediaType['Audio Total Duration'] },
      })
      this.bannerPackage = res.data[0]
      if (this.selectPackage[this.bannerPackage.id]) {
        this.bannerPackage.number = this.selectPackage[this.bannerPackage.id].number
      }
    } catch (e) {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    }
  }

  async getCompanyPricing() {
    try {
      const res = await this.$http.get(`/api/v2/finance/pricing`)
      this.isDefaultPricing = res.data
    } catch (e) {}
  }

  getUnitPrice(item: any) {
    if (this.currency === 'CNY') {
      if (item.productType === 3) {
        return Number(item.priceCNY) === 0
          ? this.$t('Free')
          : `${(item.priceCNY / item.usageQuote).toFixed(5)} 元/次调用`
      }
      return Number(item.priceCNY) === 0
        ? this.$t('Free')
        : `${((item.priceCNY / item.usageQuote) * 1000).toFixed(5)} 元/千分钟`
    } else {
      if (item.productType === 3) {
        return Number(item.priceUSD) === 0
          ? this.$t('Free')
          : `${(item.priceUSD / item.usageQuote).toFixed(5)} USD/Request`
      }
      return Number(item.priceUSD) === 0
        ? this.$t('Free')
        : `${((item.priceUSD / item.usageQuote) * 1000).toFixed(5)} USD/1,000 min`
    }
  }

  getPrice(item: any) {
    return this.currency === 'CNY' ? Number(item.priceCNY).toFixed(2) : Number(item.priceUSD).toFixed(2)
  }

  getDuration(item: any) {
    if (this.language === 'chinese') {
      return `${item.usageQuote / 10000}`
    }
    return numeral(item.usageQuote).format('0,0') || 0
  }

  getExpire(item: any) {
    return moment().add(item.duration, 'months').endOf('month').format('YYYY/MM/DD')
  }

  selectType(typeValue: number) {
    this.productType = typeValue
    if (this.productType === 1) {
      let lastMediaIndex = this.cloudMediaIds.indexOf(this.mediaType)
      lastMediaIndex = lastMediaIndex && lastMediaIndex !== -1 ? lastMediaIndex : 0
      this.mediaType = this.rtcMediaIds[lastMediaIndex]
    }
    if (this.productType === 2) {
      let lastMediaIndex = this.rtcMediaIds.indexOf(this.mediaType)
      lastMediaIndex = lastMediaIndex && lastMediaIndex !== -1 ? lastMediaIndex : 0
      this.mediaType = this.cloudMediaIds[lastMediaIndex]
    }
    if (this.productType === 3) {
      this.mediaType = this.contentMediaIds[0]
    }
    this.getMinPackageList()
  }

  selectMedia(mediaId: number) {
    this.mediaType = mediaId
    this.getMinPackageList()
  }

  initData() {
    this.$store.dispatch('updateMinPackagePurchase', [])
  }

  async setMinPackageItems() {
    console.info('setMinPackageItems')
    await this.$store.dispatch('updateMinPackagePurchase', this.minPackageItems)
  }

  handleSelectPackage(item: any) {
    if (!this.checkPermission()) return
    this.selectPackage[item.id] = item
    this.totalCount = 0
    this.totalAmount = 0
    this.selected = ''
    const select = []
    this.minPackageItems = []
    for (const key in this.selectPackage) {
      this.totalCount += this.selectPackage[key]['number']
      this.totalAmount += Number(
        ((this.selectPackage[key]['number'] * (this.getPrice(this.selectPackage[key]) as any)) as any).toFixed(2)
      )
      if (this.selectPackage[key]['number'] > 0) {
        select.push(
          `${this.getDuration(this.selectPackage[key])}${this.$t('CNYMinutes')}${this.$t('package')} * ${
            this.selectPackage[key]['number']
          }`
        )
        this.minPackageItems.push(
          Object.assign({}, this.selectPackage[key], {
            checked: true,
            packageId: this.selectPackage[key]['id'],
            num: this.selectPackage[key]['number'],
            packageType: this.packageType.MinPackage,
          })
        )
      }
    }
    this.selectPackageItems = [...this.minPackageItems]
    this.selected = select.join('，')
    this.setMinPackageItems()
    console.info(this.$store.state.minPackageItems)
    ;(this.$refs as any).cart.handleTooltip()
  }

  checkPermission() {
    // 是否符合默认报价
    if (!this.isDefaultPricing) {
      this.$alert(this.$t('NoDefaultPricing') as string, this.$t('PackageErrTitle') as string)
      return false
    }
    // 财务权限
    if (user.info.permissions['FinanceCenter'] <= 0) {
      this.$alert(this.$t('NoFinancePermisson') as string, this.$t('PackageErrTitle') as string)
      return false
    }

    // 余额为负
    if (this.account && this.account.accountBalance < 0) {
      this.$alert(this.$t('Balance negative') as string, this.$t('PackageErrTitle') as string)
      return false
    }
    return true
  }

  async purchase() {
    if (!this.checkPermission()) return
    // await this.setMinPackageItems()
    this.$router.push({
      path: '/packages/minPackage/pay',
    })
  }

  removeSelectPackage(item: any) {
    console.info('updateSelectPackage')
    delete this.selectPackage[item.id]
  }
}
