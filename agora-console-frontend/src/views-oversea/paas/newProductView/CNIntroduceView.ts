import Vue from 'vue'
import Component from 'vue-class-component'
import numeral from 'numeral'
import { user, getCashInfo } from '@/services'
import { ExtensionType } from '@/models/paasModels'
import './Introduce.less'
import ExtensionConfirmDialog from '@/views-oversea/paas/component/extension-confirm-dialog'
import ProjectList from '@/views-oversea/paas/component/project-list'
import MiniProjectList from '@/views-oversea/paas/newProductView/component/mini-project-list'
import DownloadTags from '@/views-oversea/paas/newProductView/component/download-tags'
import ImageCarousel from '@/views-oversea/paas/newProductView/component/image-carousel'
import SdkProjectList from '@/views-oversea/paas/newProductView/component/sdk-project-list'

@Component({
  components: {
    'extension-confirm-dialog': ExtensionConfirmDialog,
    'project-list': ProjectList,
    'mini-project-list': MiniProjectList,
    'sdk-project-list': SdkProjectList,
    'download-tags': DownloadTags,
    'image-carousel': ImageCarousel,
  },
  template: `
    <div class="new-introduce" v-loading="loading">
      <div class="layout d-flex">
        <div class="left-content-box">
          <div class="left-content" ref="leftContentScrollTop" @scroll="handleScroll('leftContentScrollTop')">
            <div class="top-layer card d-flex" ref="topLayer" v-if="toplayerUnfold">
              <div class="left-side">
                <div class="product-logo">
                  <img :src="productInfo.productPhotoUrl" />
                </div>
              </div>
              <div class="right-side flex-1">
                <div class="ml-30">
                  <div class="product-title-line">
                    <div>
                      <div class="product-title heading-dark-01">{{ productInfo.productCnName }}</div>
                    </div>
                    <div class="show-product-button" @click="updateShowCarousel(true)">
                      <div class="show-product-play"></div>
                      <div>产品展示</div>
                    </div>
                  </div>
                  <div class="product-description">{{ productInfo.productCnDescription }}</div>
                  <div class="platform-block">
                    <div class="line">
                      <div class="desc-label">{{ $t('Provider') }}</div>
                      <span>:</span>
                      <span v-if="productInfo.providerUrl" class="provider-link desc-value"
                      ><a :href="productInfo.providerUrl" target="_blank">{{ getProviderName }}</a></span
                      >
                      <span v-else class="desc-value">{{ getProviderName }}</span>
                    </div>
                    <div class="line">
                      <div class="desc-label">{{ $t('Platform') }}</div>
                      <span>:</span>
                      <span class="desc-value">{{ productInfo.platform }}</span>
                    </div>
                    <div class="line" v-if="productInfo.version">
                      <div class="desc-label">{{ $t('Version') }}</div>
                      <span>:</span>
                      <span class="desc-value">{{ productInfo.version }}</span>
                    </div>
                    <div class="line">
                      <div class="desc-label">{{ $t('Recent updates') }}</div>
                      <span>:</span>
                      <span class="desc-value">{{ productInfo.updatedAt | formatDate }}</span>
                    </div>
                  </div>
                </div>
                <div class="function-block">
                  <div class="function-title">核心功能：
                    <div v-html="productInfo.coreFeatures" class="core-features"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="top-layer-fold" v-if="!toplayerUnfold">
              <div class="d-flex align-center fold-box">
                <img :src="productInfo.productPhotoUrl" width="40" />
                <div class="product-title heading-dark-01">{{ productInfo.productCnName }}</div>
              </div>
              <div class="show-product-button" @click="updateShowCarousel(true)">
                <div class="show-product-play"></div>
                <div>产品展示</div>
              </div>
            </div>
            <div class="tab-layer" :class="unfold ? '' : 'fold'">
              <div class="tab-item" :class="tabName==='api' ? 'active' : ''" @click="switchTab('api')">
                <div class="icon new-icon-api"></div>
                <div class="tab-name">{{ !isIOT && !isSaaS ? '使用说明' : '产品介绍' }}</div>
                <div class="link-underline" v-if="tabName === 'api'"></div>
              </div>
              <div class="tab-item" :class="tabName==='download' ? 'active' : ''" @click="switchTab('download')" v-if="!isIOT && !isSaaS">
                <div class="icon new-icon-download"></div>
                <div class="tab-name">下载</div>
                <div class="link-underline" v-if="tabName === 'download'"></div>
              </div>
              <div class="tab-item" :class="tabName==='support' ? 'active' : ''" @click="switchTab('support')">
                <div class="icon new-icon-support"></div>
                <div class="tab-name">技术支持</div>
                <div class="link-underline" v-if="tabName === 'support'"></div>
              </div>
              <div class="fold-icon" @click="foldContent">
                <i class="el-icon-arrow-down el-icon--right" v-if="!unfold"></i>
                <i class="el-icon-arrow-up el-icon--right" v-else></i>
              </div>
            </div>
            <div class="content-layer" :class="unfold ? '' : 'fold'" ref="contentLayer" @scroll="handleScroll('contentLayer')">
              <div v-if="tabName === 'api'" class="content-box">
                <div v-if="!isIOT && !isSaaS">
                  <h1 v-if="productInfo.apiCnUrlContent" class="article-title">{{ productInfo.productCnName + '使用说明'}}</h1>
                  <div v-if="productInfo.apiCnUrlContent" class="article-page" v-html="productInfo.apiCnUrlContent"></div>
                  <div v-else class="heading-dark-16">
                    <a :href="productInfo.apiCnUrl" target="_blank" class="f-16">打开使用说明</a>
                  </div>
                </div>
                <div v-else>
                  <div class="custom-content-box">
                    <div v-for="item in customDocument">
                      <div class="content-title">{{ item.title }}</div>
                      <div class="content-content" v-html="item.content"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="tabName === 'download'" class="content-box">
                <download-tags :demoDownloadUrls="demoDownloadUrls" :sdkDownloadUrls="sdkDownloadUrls"></download-tags>
              </div>
              <div v-if="tabName === 'support'" class="content-box">
                <a :href="productInfo.supportUrl" target="_blank" class="f-16">技术支持</a>
              </div>
            </div>
          </div>
        </div>
        <div class="right-content">
          <div v-if="rightContentName === 'purchase'">
            <div v-if="hasSubscribed" class="back-title cursor-pointer" @click="switchRightContent('info')"><i class="el-icon-arrow-left
 f-16"></i>{{ $t('Project Usage') }}</div>
            <div v-if="packageList.length > 0">
              <div class="right-module-title">{{ $t('Package') }}</div>
              <div class="package-items">
                <div
                  class="package-item"
                  v-for="item in packageList"
                  :class="{'active': item.id === selectPackage.id}"
                  :key="item.id"
                  @click="handleSelectPackage(item)"
                >
                  {{ item.packageName }}
                </div>
              </div>
              <div class="right-module-title">{{ $t('Duration') }}</div>
              <div class="package-item" v-if="selectPackage.id">
                {{ selectPackage.duration }} {{ $t('DurationMonth') }}
              </div>
              <div class="right-module-title">{{ $t('Count') }}</div>
              <el-input-number
                v-model="selectPackage.number"
                v-if="selectPackage.id"
                :min="1"
                :step="1"
                :step-strictly="true"
              ></el-input-number>
              <div class="right-module-title price-title">{{ $t('Price') }}</div>
              <div class="price-line">
                <span class="price">{{ getCurrency }} {{ numeral(getTotalAmout).format('0,0.00') }}</span>
              </div>
              <div class="price-line">
                <el-button
                  type="primary"
                  class="purchase"
                  :disabled="packageList.length <= 0"
                  @click="comfirmPurchase"
                >{{ $t('Purchase Now') }}
                </el-button>
              </div>
              <div class="price-line bold-tip mt-30"><span class="label"></span>如果有定制化需求</div>
              <div class="price-line"><span class="grey-tip">请联系销售</span><span class="link-tip">400 632 6626</span></div>
            </div>
            <div v-else class="contact-sales-box">
              <div class="mb-4">{{ $t('Please contact sales for purchase') }}</div>
              <div class="mb-16">400 632 6626</div>
              <div class="link">
                <a :href="$t('Contact sales Link')" target="_blank">{{ $t('Contact sales') }}</a>
              </div>
            </div>
          </div>
          <div v-if="rightContentName === 'info'" class="projects-box">
            <div class="project-list">
              <sdk-project-list v-if="productInfo.isSdkDeliver"></sdk-project-list>
              <mini-project-list v-else></mini-project-list>
            </div>
            <div class="bottom-box">
              <div class="usages">
                <div class="usage-tip-line">
                  <div class="tip-title">{{ $t('Usage') }}</div>
                  <div class="tip-right"></div>
                </div>
                <el-tooltip effect="light" placement="top">
                  <el-progress :percentage="usagePercentage" :show-text="false"></el-progress>
                  <div slot="content" class="usage-tooltip">
                    <div class="usage-tooltip-box">
                      <div class="d-flex justify-between pb-22 border-bottom">
                        <span>总量</span>
                        <span>{{ usageAll }}</span>
                      </div>
                      <div class="d-flex justify-between pt-22">
                        <span>已使用</span>
                        <span>{{ usageUsed }}</span>
                      </div>
                    </div>
                  </div>
                </el-tooltip>
              </div>
              <div class="bottom-buttons">
                <el-button
                  type="primary"
                  class="purchase"
                  @click="switchRightContent('purchase')"
                >{{ $t('Renew current package') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <extension-confirm-dialog :visible="isConfirmDialogVisible" :confirm="purchase"
                                :cancel="closeConfirmDialog"
                                :userInfo="user.info" :tosUrl="productInfo?.tos" :vendorName="getProviderName" :privacyPolicyUrl="productInfo?.privacyPolicyUrl" />
      <image-carousel :webImageUrls="productImages" :showCarousel="showCarousel" :updateShowCarousel="updateShowCarousel" :title="productInfo.productCnName"></image-carousel>
    </div>
  `,
})
export default class CNIntroduceView extends Vue {
  numeral = numeral
  language = user.info.language
  user = user
  account: any = {
    accountBalance: 0,
  }
  serviceName = ''
  loading = false
  activeName = 'detail'
  productInfo: any = {}
  packageList = []
  selectPackage: any = {}
  agree = true
  count = 0
  ExtensionType = ExtensionType
  customDocument: any = []
  isConfirmDialogVisible = false
  hasSubscribed = false
  tabName = 'api'
  unfold = true
  toplayerUnfold = true
  rightContentName = 'purchase'
  showCarousel = false
  usageAll = 0
  usageUsed = 0
  leftContentScrollTop = 0
  contentLayer = 0
  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }
  get currency() {
    return this.account && this.account.accountCurrency
  }
  get getProductTitle() {
    return this.productInfo.productCnName
  }
  get getProductDesc() {
    return this.productInfo.productCnDescription
  }
  get getTotalAmout() {
    return this.selectPackage.id
      ? this.currency === 'CNY'
        ? (Number(this.selectPackage.priceCNY) * this.selectPackage.number).toFixed(2)
        : Number(this.selectPackage.priceUSD) * this.selectPackage.number
      : '0.0'
  }
  get getProviderName() {
    return this.productInfo.cnName
  }
  get demoDownloadUrls() {
    const result: any = {
      ios: '',
      android: '',
      mac: '',
      windows: '',
    }
    const demoDownloadUrls = JSON.parse(this.productInfo.demoDownloadUrls) || []
    for (const item of demoDownloadUrls) {
      result[item.platform] = item.url
    }
    return result
  }
  get sdkDownloadUrls() {
    const result: any = {
      ios: '',
      android: '',
      mac: '',
      windows: '',
    }
    const sdkDownloadUrls = JSON.parse(this.productInfo.sdkDownloadUrls) || []
    for (const item of sdkDownloadUrls) {
      result[item.platform] = item.url
    }
    return result
  }
  get productImages() {
    return this.productInfo.webImageUrls ? this.productInfo.webImageUrls.split('<br>') : []
  }
  get isIOT() {
    return this.ExtensionType[this.productInfo.category] === 'IOT'
  }
  get isSaaS() {
    return this.ExtensionType[this.productInfo.category] === 'SaaS'
  }

  format(percentage: number) {
    return `${percentage}%`
  }
  get usagePercentage() {
    return (this.usageUsed / this.usageAll) * 100
  }

  async init() {
    this.loading = true
    await this.getAccount()
    await this.getPackages()
    await this.getVendorInfo()
    await this.getActiveVendorList()
    this.getProductPackageList()
    this.loading = false
  }
  async getAccount() {
    this.account = await getCashInfo()
  }
  async getVendorInfo() {
    try {
      const res = await this.$http.get(`/api/v2/marketplace/vendor/${this.serviceName}`, { params: { needDoc: true } })
      this.productInfo = res.data
      const obj = JSON.parse(this.productInfo.customDocument)
      for (const key in obj) {
        this.customDocument.push({ title: key, content: obj[key] })
      }
    } catch (e) {}
  }
  async getPackages() {
    try {
      const res = await this.$http.get(`/api/v2/package/marketplacePackage/${this.serviceName}/list`)
      this.packageList = res.data
      if (this.packageList.length > 0) {
        this.selectPackage = this.packageList[0]
        this.selectPackage.number = 1
      }
    } catch (e) {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    }
  }
  handleSelectPackage(item: { id: any }) {
    if (item.id === this.selectPackage.id) return
    this.selectPackage.number = 0
    this.selectPackage = item
    this.selectPackage.number = 1
  }
  checkPermission() {
    if (!this.agree) {
      this.$alert(this.$t('NoAgreePermisson') as string, this.$t('PackageErrTitle') as string)
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
  comfirmPurchase() {
    if (!this.checkPermission()) return
    this.isConfirmDialogVisible = true
  }
  purchase() {
    this.$router.push({
      path: '/marketplace/pay',
      query: {
        packageId: this.selectPackage.id,
        packageCount: this.selectPackage.number,
      },
    })
  }
  backToPrev() {
    this.$router.go(-1)
  }
  created() {
    this.serviceName = this.$route.query.serviceName as string
    if (this.serviceName === 'faceunity_ai') {
      this.$router.push({ path: '/marketplace/license/introduce', query: { serviceName: this.serviceName } })
    }
  }
  mounted() {
    this.init()
  }
  closeConfirmDialog() {
    this.isConfirmDialogVisible = false
  }

  async getActiveVendorList() {
    const ret = await this.$http.get('/api/v2/marketplace/company/purchased')
    const products = ret.data.rows
    const activeExtensions = products.filter((item: any) => !!item && item.serviceName === this.serviceName)
    this.hasSubscribed = activeExtensions.length > 0
    if (this.hasSubscribed) {
      this.switchRightContent('info')
    }
  }

  switchTab(name: string) {
    this.tabName = name
  }

  foldContent() {
    this.unfold = !this.unfold
    this.tabName = this.unfold ? 'api' : ''
  }

  switchRightContent(value: string) {
    this.rightContentName = value
  }

  updateShowCarousel(show: boolean) {
    this.showCarousel = show
  }

  handleScroll(key: 'leftContentScrollTop' | 'contentLayer') {
    const scrollTop = (this.$refs[key] as any).scrollTop
    const scrollGap = scrollTop - this[key]
    this[key] = scrollTop
    if (scrollGap < 0) {
      // 向上
      if (scrollTop === 0) {
        this.toplayerUnfold = true
      }
    } else {
      // 向下
      if (!this.toplayerUnfold) return
      if (scrollTop > (key === 'leftContentScrollTop' ? (this.$refs['topLayer'] as any).clientHeight + 10 : 0)) {
        this.toplayerUnfold = false
      }
    }
  }

  async getProductPackageList() {
    try {
      const res = await this.$http.get(`/api/v2/package/marketplacePackage/${this.serviceName}/purchased`, {
        params: { fetchAll: true },
      })
      const items = res.data.items
      this.usageAll = _.reduce(items, (sum, elem) => sum + elem.usageQuota, 0)
      this.usageUsed = _.reduce(items, (sum, elem) => sum + elem.quotaUsed, 0)
    } catch (e) {}
  }
}
