import Vue from 'vue'
import Component from 'vue-class-component'
import numeral from 'numeral'
import { user, getCashInfo } from '@/services'
import { ExtensionType, I18nTitle } from '@/models/paasModels'
import './Introduce.less'
import ExtensionConfirmDialog from '@/views/paas/component/extension-confirm-dialog'
import ExtensionPlan from '@/views/paas/component/extension-plan'
import CreditCardDialog from '@/views/paas/component/credit-card-dialog'
import EnProjectList from '@/views/paas/newProductView/component/en-project-list'
import ExtensionBilling from '@/views/paas/component/extension-billing'
import ExtensionUsage from '@/views/paas/component/extension-usage'
import DownloadTags from '@/views/paas/newProductView/component/download-tags'
import ImageCarousel from '@/views/paas/newProductView/component/image-carousel'
import PricingTable from '@/views/paas/component/pricing-table'

@Component({
  components: {
    'extension-confirm-dialog': ExtensionConfirmDialog,
    'en-project-list': EnProjectList,
    'extension-plan': ExtensionPlan,
    'pricing-table': PricingTable,
    'credit-card-dialog': CreditCardDialog,
    'extension-billing': ExtensionBilling,
    'extension-usage': ExtensionUsage,
    'download-tags': DownloadTags,
    'image-carousel': ImageCarousel,
  },
  template: `
    <div class="new-introduce en-new-introduce" v-loading="loading">
      <div class="layout d-flex">
        <div class="left-content-box">
          <div class="left-content" ref="leftContentScrollTop" @scroll="handleScroll('leftContentScrollTop')">
            <div class="top-layer card d-flex" v-if="toplayerUnfold" ref="topLayer">
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
                      <div>Preview</div>
                    </div>
                  </div>
                  <div class="product-description">{{ productInfo.productCnDescription }}</div>
                  <div class="platform-block">
                    <div class="line">
                      <div class="desc-label">Company</div>
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
                  <div class="function-title">Core Features
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
                <div>Preview</div>
              </div>
            </div>
            <div class="tab-layer" ref="tabLayer" :class="unfold ? '' : 'fold'">
              <div class="tab-item" :class="tabName==='api' ? 'active' : ''" @click="switchTab('api')">
                <div class="icon new-icon-api"></div>
                <div class="tab-name">User Guide</div>
                <div class="link-underline" v-if="tabName === 'api'"></div>
              </div>
              <div class="tab-item" :class="tabName==='download' ? 'active' : ''" @click="switchTab('download')">
                <div class="icon new-icon-download"></div>
                <div class="tab-name">Download</div>
                <div class="link-underline" v-if="tabName === 'download'"></div>
              </div>
              <div class="tab-item" :class="tabName==='support' ? 'active' : ''" @click="switchTab('support')">
                <div class="icon new-icon-support"></div>
                <div class="tab-name">Support</div>
                <div class="link-underline" v-if="tabName === 'support'"></div>
              </div>
              <div class="fold-icon" @click="foldContent">
                <i class="el-icon-arrow-down el-icon--right" v-if="!unfold"></i>
                <i class="el-icon-arrow-up el-icon--right" v-else></i>
              </div>
            </div>
            <div class="content-layer" :class="unfold ? '' : 'fold'" ref="contentLayer" @scroll="handleScroll('contentLayer')">
              <div v-if="tabName === 'api'" class="content-box">
                <h1 v-if="productInfo.apiCnUrlContent" class="article-title">{{ productInfo.productCnName + ' User Guide'}}</h1>
                <div v-if="productInfo.apiCnUrlContent" v-html="productInfo.apiCnUrlContent" class="article-page"></div>
                <div v-else class="heading-dark-16">
                  <a :href="productInfo.apiCnUrl" target="_blank" class="f-16">Open User Guide</a>
                </div>
              </div>
              <div v-if="tabName === 'download'" class="content-box">
                <download-tags :demoDownloadUrls="demoDownloadUrls" :sdkDownloadUrls="sdkDownloadUrls"></download-tags>
              </div>
              <div v-if="tabName === 'support'" class="content-box">
                <a :href="productInfo.supportUrl" target="_blank" class="f-16">Support</a>
              </div>
            </div>
            <div class="content-layer billing" v-if="hasSubscribed">
              <extension-usage :billingItemId="productInfo?.billingItemId"/>
              <extension-billing />
            </div>
          </div>
        </div>
        <div class="right-content">
          <div v-if="rightContentName === 'purchase'" class="h-100">
            <div class="plan-box">
              <div v-if="!hasSubscribed">
                <pricing-table v-if="pricingTable.length > 0" :pricingTable="pricingTable" :planId="planId" :serviceName="serviceName"></pricing-table>
                <extension-plan v-else-if="plans.length > 0" :plans="plans" :planId="planId" :serviceName="serviceName" :planChange="handlePlanChange"
                                :isHasPlan="isHasPlan"/>
                <div v-else class="contact-sales-box" style="text-align: center;line-height: 20px;">
                  <div class="mb-4">Please contact sales regarding pricing plans and/or activation of this extension.</div>
                  <div class="link mt-16">
                    <a href="https://wenjuan.feishu.cn/m?t=s9T5sQXZdmIi-gl34" target="_blank">Contact Us</a>
                  </div>
                </div>
              </div>
              <en-project-list v-if="hasSubscribed" :payment="productInfo?.payment"></en-project-list>
              <div class="price-line mt-7" style="margin-bottom: 50px">
                <span class="label"></span>
                <el-button
                  v-if="!hasSubscribed && plans.length > 0"
                  type="primary"
                  class="purchase"
                  size="medium"
                  @click="handleActivateService"
                >{{ $t('Buy & Activate') }}
                </el-button>
                <el-button
                  v-if="hasSubscribed"
                  class="purchase deactivate-button"
                  size="medium"
                  @click="deactivateService"
                >{{ $t('Deactivate') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <extension-confirm-dialog :visible="isConfirmDialogVisible" :confirm="activatedService"
                                :cancel="closeConfirmDialog"
                                :userInfo="user.info" :tosUrl="productInfo?.tos" :vendorName="productInfo?.enName" :privacyPolicyUrl="productInfo?.privacyPolicyUrl" />
      <credit-card-dialog :visible="isCreditCardVisible" :confirm="goToAddCreditCard"
                          :cancel="closeCreditCardDialog"/>
      <image-carousel :webImageUrls="productImages" :showCarousel="showCarousel" :updateShowCarousel="updateShowCarousel" :title="productInfo.productCnName"></image-carousel>
    </div>
  `,
})
export default class ENIntroduceView extends Vue {
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
  planId = '0'
  plans = []
  pricingTable = []
  isHasPlan = false
  isCreditCardVisible = false
  condition: any = {
    page: 1,
    limit: 10,
    key: undefined,
    marketplaceStatus: 2,
    serviceName: '',
    sortProp: 'stage',
    sortOrder: 'DESC',
  }
  showCarousel = false
  I18nTitle = I18nTitle
  leftContentScrollTop = 0
  contentLayer = 0
  isScrolling = false
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

  format(percentage: number) {
    return `${percentage}%`
  }

  created() {
    if (user.info.company.country === 'CN') {
      this.$confirm(
        'To use the Overseas Cloud Marketplace plugin, please use an Overseas Sound Network account.',
        'No permission',
        {
          showCancelButton: false,
          showClose: false,
          confirmButtonText: 'Ok',
        }
      )
        .then(() => {
          this.$router.push({ path: '/' })
        })
        .catch(() => {})
    }
    this.serviceName = this.$route.query.serviceName as string
    this.condition.serviceName = this.serviceName
  }

  async mounted() {
    this.account = await getCashInfo()
    this.init()
  }
  async init() {
    this.loading = true
    await this.getVendorInfo()
    await this.getExtensionInfo()
    this.loading = false
  }

  async getVendorInfo() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        serviceName: this.serviceName,
        needDoc: true,
      },
    })
    const plans = res?.data?.plans
    const pricingTable = res?.data?.pricingTable
    this.productInfo = res?.data
    if (plans) {
      this.plans = JSON.parse(plans)
    }
    if (pricingTable) {
      this.pricingTable = JSON.parse(pricingTable)
    }
    document.title = this.productInfo?.productEnName
  }

  async getExtensionInfo() {
    const res = await this.$http.get('/api/v2/marketplace/extension/list', {
      params: {
        serviceName: this.serviceName,
      },
    })
    const data = res?.data?.rows?.[0] || {}
    this.hasSubscribed = data.status
    if (data.planId?.toString() && data.status === 1) {
      this.planId = data.planId?.toString()
      this.isHasPlan = true
    } else {
      if (this.plans.length > 0) {
        this.planId = (this.plans as any)[0].key.toString()
        this.isHasPlan = false
      }
    }
  }
  async getCreditCard() {
    return await this.$http.get('/api/v2/finance/creditCard/cards')
  }

  handlePlanChange(v: string) {
    this.planId = v
  }
  goToDeposite() {
    if (this.getCurrency === '$') {
      this.$router.push({ name: 'finance.creditCard' })
    } else {
      this.$router.push({ name: 'finance.alipay' })
    }
  }

  checkActivePermission() {
    return this.account.accountBalance >= 0 || this.productInfo.payment === 'free'
  }

  async handleActivateService() {
    if (!this.planId) {
      this.$message('please select one plan')
      return
    }
    if (!this.checkActivePermission()) {
      this.$confirm(this.$t('Paas Balance negative') as string, this.$t('Warning') as string, {
        confirmButtonText: this.$t('Make deposits') as string,
        cancelButtonText: this.$t('Cancel') as string,
      })
        .then(() => {
          this.goToDeposite()
        })
        .catch(() => {})
      return
    }
    this.isConfirmDialogVisible = true
  }
  async activatedService() {
    this.isConfirmDialogVisible = false
    this.loading = true
    const res = await this.activatedCustomer()
    if ((res.status as any) === 'success' || res.data.status === 'success') {
      await this.$http.post(`/api/v2/marketplace/extension/${this.serviceName}`, { planId: this.planId })
      await this.getExtensionInfo()
    } else {
      this.$message.error(JSON.stringify(res.data))
    }
    this.loading = false
  }
  async deactivateService() {
    this.$confirm(`Confirm to disable ${this.getProductTitle} on all projects?`, 'Notification', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      showClose: false,
      type: 'info',
    }).then(async () => {
      this.loading = true
      const res = await this.deleteCustomer()
      if ((res.status as any) === 'success' || res.data.status === 'success') {
        await this.$http.put(`/api/v2/marketplace/extension/${this.serviceName}`, { status: 0 })
        await this.getExtensionInfo()
      } else {
        this.$message.error(JSON.stringify(res.data))
      }
      this.loading = false
    })
  }
  async activatedCustomer() {
    return await this.$http.post(`/api/v2/marketplace/customer/${this.serviceName}`, {
      planId: this.planId,
    })
  }
  async deleteCustomer() {
    return await this.$http.delete(`/api/v2/marketplace/customer/${this.serviceName}`)
  }

  closeConfirmDialog() {
    this.isConfirmDialogVisible = false
  }

  closeCreditCardDialog() {
    this.isCreditCardVisible = false
  }
  goToAddCreditCard() {
    this.$router.push({ path: `/finance/deposit/addcard?goBack=true` })
  }

  switchTab(name: string) {
    this.tabName = name
  }

  foldContent() {
    this.unfold = !this.unfold
    this.tabName = this.unfold ? 'api' : ''
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
      // if (this.isScrolling) return
      if (scrollTop === 0) {
        this.toplayerUnfold = true
      }
    } else {
      // 向下
      if (!this.toplayerUnfold) return
      if (scrollTop > (key === 'leftContentScrollTop' ? (this.$refs['topLayer'] as any).clientHeight + 10 : 0)) {
        this.toplayerUnfold = false
        // this.isScrolling = true
        // setTimeout(() => {
        //   this.isScrolling = false
        // }, 500)
      }
    }
  }
}
