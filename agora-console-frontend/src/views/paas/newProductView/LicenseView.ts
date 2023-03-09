import Vue from 'vue'
import Component from 'vue-class-component'
import numeral from 'numeral'
import { user, getCashInfo } from '@/services'
import { ExtensionType } from '@/models/paasModels'
import './Introduce.less'
import ExtensionConfirmDialog from '@/views/paas/component/extension-confirm-dialog'
import ProjectList from '@/views/paas/component/project-list'
import MiniProjectList from '@/views/paas/newProductView/component/mini-project-list'
import DownloadTags from '@/views/paas/newProductView/component/download-tags'
import ImageCarousel from '@/views/paas/newProductView/component/image-carousel'
import { RouteRecord } from 'vue-router/types/router'
const IconOutLink = require('@/assets/icon/paas-icon-out-link.svg')

@Component({
  components: {
    'extension-confirm-dialog': ExtensionConfirmDialog,
    'project-list': ProjectList,
    'mini-project-list': MiniProjectList,
    'download-tags': DownloadTags,
    'image-carousel': ImageCarousel,
  },
  template: `
    <div class="new-introduce new-introduce-cn" v-loading="loading">
      <div class="layout d-flex">
        <div class="left-content-box"><div class="left-content" ref="leftContentScrollTop" @scroll="handleScroll('leftContentScrollTop')">
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
                  <div v-html="productInfo.coreFeatures" class="core-features"></div></div>
              </div>
            </div>
          </div>
          <div class="top-layer-fold" v-if="!toplayerUnfold">
            <div class="d-flex align-center">
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
              <div class="tab-name">使用说明</div>
              <div class="link-underline" v-if="tabName === 'api'"></div>
            </div>
            <div class="tab-item" :class="tabName==='download' ? 'active' : ''" @click="switchTab('download')">
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
              <h1 v-if="productInfo.apiCnUrlContent" class="article-title">
                {{ '使用' + productInfo.productCnName + '插件'}}
                <el-tooltip placement="top" content="跳转到文档站" effect="dark">
                  <a :href="productInfo.apiCnUrl" target="_blank"><img :src="IconOutLink" w:w="20px" w:h="20px"/></a>
                </el-tooltip>
              </h1>
              <div v-if="productInfo.apiCnUrlContent" class="article-page" v-html="productInfo.apiCnUrlContent"></div>
              <div v-else class="heading-dark-16">
                <a :href="productInfo.apiCnUrl" target="_blank" class="f-16">使用说明</a>
              </div>
            </div>
            <div v-if="tabName === 'download'" class="content-box">
              <download-tags :demoDownloadUrls="demoDownloadUrls" :sdkDownloadUrls="sdkDownloadUrls"></download-tags>
            </div>
            <div v-if="tabName === 'support'" class="content-box">
              <a :href="productInfo.supportUrl" target="_blank" class="f-16">技术支持</a>
            </div>
          </div>
        </div></div>
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
                  @click="purchase"
                >                    {{
                    licenseInfo.activeStatus === 'activated'
                      ? '查看 token'
                      : licenseInfo.activeStatus === 'auditing'
                        ? '审核中'
                        : '购买'
                  }}
                </el-button>
              </div>
              <div class="heading-grey-13 price-line" v-if="licenseInfo.activeStatus === 'auditing'"><span class="label"></span>证书审核会在2个工作日内完成</div>
              <el-tag class="price-line mt-10" v-if="licenseInfo.activeStatus === 'activated'" type="success"><span class="label"></span>有效截止日期: {{ licenseInfo.expire }}</el-tag>
              <div class="price-line bold-tip mt-30"><span class="label"></span>如果有定制化需求</div>
              <div class="price-line"><span class="grey-tip">请联系销售</span><span class="link-tip">400 632 6626</span></div>
            </div>
            <div v-else class="contact-sales-box">
              <div class="mb-4">{{ $t('Please contact sales for purchase') }}</div>
              <div class="mb-16">400 632 6626</div>
              <div class="link">
                <a :href="$t('Contact sales Link')">{{ $t('Contact sales') }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <extension-confirm-dialog :visible="isConfirmDialogVisible" :confirm="showDialogForm"
                                :cancel="closeConfirmDialog"
                                :userInfo="user.info" :tosUrl="productInfo?.tos" :vendorName="getProviderName" :privacyPolicyUrl="productInfo?.privacyPolicyUrl" />

      <el-dialog :title="$t('License')" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item
            :label="item.desc"
            :label-width="formLabelWidth"
            v-for="(item, i) in commonFormParams"
            :key="i"
            required
          >
            <el-input v-if="item.type === 'string'" v-model="form[item.name]" autocomplete="off" :placeholder="item.name === 'companyShortName' ? '由英文或数字组成' : '' "></el-input>
            <el-select v-if="item.name === 'package' && item.defaultValue" v-model="form[item.name]" disabled>
              <el-option :label="$t('Selected')" :value="Number(item.defaultValue)"></el-option>
            </el-select>
            <el-input-number v-else-if="item.type === 'int' " v-model="form[item.name]" autocomplete="off"></el-input-number>
            <el-radio-group v-if="item.type === 'radio'" v-model="form[item.name]">
              <el-radio v-for="(item, i) in JSON.parse(item.defaultValue)" :label="item.value" :key="i">{{
                  item.label
                }}</el-radio>
            </el-radio-group>
            <el-checkbox-group v-if="item.type === 'checkbox'" v-model="form[item.name]">
              <el-checkbox v-for="(group, i) in JSON.parse(item.defaultValue)" :label="group.value" :key="i">
                {{ group.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="activatedLicense">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="isTokenDialogVisible" title="Credentials" :show-close="false" width="600px">
        <el-form :model="tokenForm" ref="appForm" label-width="80px" class="demo-dynamic">
          <el-form-item
            prop="token"
            label="token"
          >
            <div style="display: flex;"><el-input v-model="tokenForm.token" disabled />
              <el-button type="primary" style="margin-left: 10px;" v-clipboard:copy="tokenForm.token" v-clipboard:success="onCopy" v-clipboard:error="onError">Copy</el-button>
            </div>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
      <el-button @click="isTokenDialogVisible = false">Finish</el-button>
    </span>
      </el-dialog>
      <image-carousel :webImageUrls="productImages" :showCarousel="showCarousel" :updateShowCarousel="updateShowCarousel" :title="productInfo.productCnName"></image-carousel>
    </div>
  `,
})
export default class LicenseView extends Vue {
  IconOutLink = IconOutLink
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
  dialogFormVisible = false
  form: any = {}
  formLabelWidth = '120px'
  commonFormParams = []
  licenseInfo: any = {
    activeStatus: '',
    token: '',
  }
  isTokenDialogVisible = false
  tokenForm = {
    token: '',
  }
  showCarousel = false
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
    console.info(JSON.parse(JSON.stringify(this.productInfo)))
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

  async init() {
    this.loading = true
    await this.getAccount()
    await this.getPackages()
    await this.getVendorInfo()
    await this.changeBreadcrumb()
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
    if (!this.checkPermission()) return
    if (this.licenseInfo.activeStatus === 'auditing') return
    if (this.licenseInfo.activeStatus === 'activated') {
      this.isTokenDialogVisible = true
      return
    }
    this.isConfirmDialogVisible = true
  }
  async activatedLicense() {
    this.loading = true
    this.dialogFormVisible = false
    const res = await this.$http.post(`/api/v2/marketplace/license/${this.serviceName}/activated`, {
      ...this.form,
    })
    if (res.data.status === 'success') {
      this.$message('激活请求提交成功，请等待审核通过')
      await this.getLicenseList()
    } else {
      this.$message(JSON.stringify(res.data))
    }
    this.loading = false
  }
  created() {
    this.serviceName = this.$route.query.serviceName as string
  }
  mounted() {
    this.init()
    this.getLicenseList()
  }
  closeConfirmDialog() {
    this.isConfirmDialogVisible = false
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

  onCopy() {
    this.$message.success('copy succeed')
  }
  onError() {
    this.$message.success('copy failed')
  }

  async getLicenseList() {
    const res = await this.$http.post(`/api/v2/marketplace/license/${this.serviceName}/list`)
    if (res.data.data[0]) {
      this.licenseInfo = res.data.data[0]
      this.tokenForm.token = this.licenseInfo.token
    }
  }

  showDialogForm() {
    this.closeConfirmDialog()
    this.dialogFormVisible = true
    if (this.productInfo.licenseCustomerParam) {
      this.commonFormParams = JSON.parse(this.productInfo.licenseCustomerParam).params
      this.commonFormParams.forEach((item: any) => {
        if (item.type === 'string') {
          this.form[item.name] = item.defaultValue
        }
        if (item.name === 'package') {
          this.form[item.name] = Number(item.defaultValue)
        }
        if (item.type === 'checkbox') {
          this.$set(this.form, item.name, [])
        }
      })
    }
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

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: '/marketplace',
        meta: {
          breadcrumb: 'MarketplaceTitle',
        },
      },
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: this.productInfo.productCnName,
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
