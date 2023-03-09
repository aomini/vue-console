import Vue from 'vue'
import Component from 'vue-class-component'
import numeral from 'numeral'
import { user, getCashInfo } from '@/services'
import './style/introduce.less'
import { ExtensionType } from '@/models/paasModels'
import ExtensionConfirmDialog from '@/views/paas/component/extension-confirm-dialog'
import ExtensionDocument from '@/views/paas/component/extension-document'
import ProjectList from './component/project-list'

@Component({
  components: {
    'extension-confirm-dialog': ExtensionConfirmDialog,
    'extension-document': ExtensionDocument,
    'project-list': ProjectList,
  },
  template: `
    <div v-loading="loading">
      <div class="extension-introduce">
        <div class="module-title">
          <i @click="() => $router.go(-1)" class="el-icon-arrow-left"></i>
          {{ $t('DetailPage') }}
        </div>
        <div class="">
          <div class="left">
            <div class="left-content">
              <div class="header">
                <div class="icon-container">
                  <div class="icon">
                    <img :src="productInfo.productPhotoUrl" v-if="productInfo.productPhotoUrl" />
                  </div>
                </div>
                <div class="header-right" style="cursor: default">
                  <div>
                    <div class="d-flex align-center">
                      <p class="product-title">{{ getProductTitle }}</p>
                      <div class="ml-16">
                        <span class="type-tag">{{ $t(ExtensionType[productInfo.category]) }}</span>
                      </div>
                    </div>
                    <p class="product-desc">{{ getProductDesc }}</p>
                  </div>
                  <div class="mb-12">
                    <span class="desc-label">{{ $t('Provider') }}：</span>
                    <span v-if="productInfo.providerUrl" class="link desc-value"
                      ><a :href="productInfo.providerUrl" target="_blank">{{ getProviderName }}</a></span
                    >
                    <span v-else class="desc-value">{{ getProviderName }}</span>
                  </div>
                  <div class="mb-12">
                    <span class="desc-label">{{ $t('Platform') }}：</span>
                    <span class="desc-value">{{ productInfo.platform }}</span>
                  </div>
                  <div class="mb-12" v-if="ExtensionType[productInfo.category] === 'Component/Plugin'">
                    <span class="desc-label">{{ $t('Version') }}：</span>
                    <span class="desc-value">{{ productInfo.version }}</span>
                  </div>
                  <div>
                    <span class="desc-label">{{ $t('Recent updates') }}：</span>
                    <span class="desc-value">{{ productInfo.updatedAt | formatDate }}</span>
                  </div>
                </div>
              </div>

              <div class="content">
                <div class="content-box">
                  <div v-for="item in customDocument">
                    <div class="content-title">{{ item.title }}</div>
                    <div class="content-content" v-html="item.content"></div>
                  </div>
                </div>
                <extension-document
                  v-if="ExtensionType[productInfo.category] === 'Component/Plugin'"
                  :isCN="true"
                  :api-url="productInfo?.apiCnUrl"
                  :support-url="productInfo?.supportUrl"
                  :sdkDownLoadUrl="productInfo?.sdkDownloadUrl"
                  :demoDownLoadUrl="productInfo?.demoDownloadUrl"
                  :vendor-name="getProviderName"
                />
                <div v-if="hasSubscribed" style="margin-top: 32px; padding-left: 20px">
                  <div class="content-title">{{ $t('Projects') }}</div>
                  <project-list :showTitle="false" />
                </div>
              </div>
            </div>

            <div class="right-content">
              <div v-if="packageList.length > 0" class="pl-30">
                <div class="price-line">
                  <span class="label">{{ $t('Price') }}</span>
                  <span class="price">{{ getCurrency }} {{ numeral(getTotalAmout).format('0,0.00') }}</span>
                </div>
                <div class="price-line package" style="align-items: flex-start">
                  <span class="label">{{ $t('Package') }}：</span>
                  <div class="package-line">
                    <span
                      class="package-tag"
                      :class="{'active': item.id === selectPackage.id}"
                      v-for="item in packageList"
                      :key="item.id"
                      @click="handleSelectPackage(item)"
                      >{{ item.packageName }}</span
                    >
                  </div>
                </div>
                <div class="price-line">
                  <span class="label">{{ $t('Duration') }}</span>
                  <span class="month-tag active" v-if="selectPackage.id">
                    {{ selectPackage.duration }} {{ $t('DurationMonth') }}</span
                  >
                </div>
                <div class="price-line">
                  <span class="label">{{ $t('Count') }}</span>
                  <el-input-number
                    style="width: 150px"
                    size="small"
                    v-if="selectPackage.id"
                    v-model="selectPackage.number"
                    :min="1"
                    :step="1"
                    :step-strictly="true"
                  ></el-input-number>
                </div>
                <div class="price-line mt-7">
                  <span class="label"></span>
                  <el-button
                    type="primary"
                    class="purchase"
                    size="medium"
                    :disabled="packageList.length <= 0"
                    @click="comfirmPurchase"
                    >{{ $t('Purchase') }}
                  </el-button>
                </div>
                <div class="heading-grey-13 price-line"><span class="label"></span>如果有定制化需求，请联系销售</div>
                <div class="heading-grey-13 price-line"><span class="label"></span><div style="width: 150px;text-align: center;color:#579EF8;font-weight:600">400 632 6626</div></div>
              </div>
              <div class="contact-sales-box" v-else>
                <div class="mb-4">{{ $t('Please contact sales for purchase') }}</div>
                <div class="mb-16">400 632 6626</div>
                <div class="link">
                  <a :href="$t('Contact sales Link')">{{ $t('Contact sales') }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <extension-confirm-dialog :visible="isConfirmDialogVisible" :confirm="purchase"
                                :cancel="closeConfirmDialog"
                                :userInfo="user.info" :tosUrl="productInfo?.tos" :vendorName="getProviderName" :privacyPolicyUrl="productInfo?.privacyPolicyUrl" />
    </div>
  `,
})
export default class IntroduceView extends Vue {
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

  async init() {
    this.loading = true
    await this.getAccount()
    await this.getPackages()
    await this.getVendorInfo()
    await this.getActiveVendorList()
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
  }
}
