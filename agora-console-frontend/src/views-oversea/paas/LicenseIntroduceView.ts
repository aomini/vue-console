import Vue from 'vue'
import Component from 'vue-class-component'
import numeral from 'numeral'
import { user, getCashInfo } from '@/services'
import './style/introduce.less'
import { ExtensionType } from '@/models/paasModels'
import ExtensionDocument from '@/views-oversea/paas/component/extension-document'
import ExtensionConfirmDialog from '@/views-oversea/paas/component/extension-confirm-dialog'

@Component({
  components: {
    'extension-document': ExtensionDocument,
    'extension-confirm-dialog': ExtensionConfirmDialog,
  },
  template: `
    <div v-loading="loading">
      <div class="extension-introduce">
        <div class="module-title">
          <i @click="() => $router.push('/marketplace')" class="el-icon-arrow-left"></i>
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
                  <div class="content-box">
                    <div v-for="item in customDocument">
                      <div class="content-title">{{ item.title }}</div>
                      <div class="content-content" v-html="item.content"></div>
                    </div>
                  </div>
                  <extension-document
                    v-if="ExtensionType[productInfo.category] === 'Component/Plugin'"
                    :isCN="isCN"
                    :api-url="productInfo?.apiCnUrl"
                    :support-url="productInfo?.supportUrl"
                    :sdkDownLoadUrl="productInfo?.sdkDownloadUrl"
                    :demoDownLoadUrl="productInfo?.demoDownloadUrl"
                    :vendor-name="getProviderName"
                  />
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
                      class="package-tag license-package-tag"
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
                  <span class="month-tag license-month-tag active" v-if="selectPackage.id">
                    {{ selectPackage.duration }} {{ $t('DurationMonth') }}</span
                  >
                </div>
                <div class="price-line">
                  <span class="label">{{ $t('Count') }}</span>
                  <el-input-number
                    style="width: 180px"
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
                    style="width: 180px"
                    type="primary"
                    class="purchase"
                    size="medium"
                    :disabled="packageList.length <= 0"
                    @click="purchase"
                  >
                    {{
                      licenseInfo.activeStatus === 'activated'
                        ? '查看 token'
                        : licenseInfo.activeStatus === 'auditing'
                        ? '审核中'
                        : '购买'
                    }}
                  </el-button>
                </div>
                <span class="heading-grey-13 price-line" v-if="licenseInfo.activeStatus === 'auditing'"><span class="label"></span>证书审核会在2个工作日内完成</span>
                <el-tag class="price-line" v-if="licenseInfo.activeStatus === 'activated'" type="success"><span class="label"></span>有效截止日期: {{ licenseInfo.expire }}</el-tag>
                <div class="heading-grey-13 price-line"><span class="label"></span>如果有定制化需求，请联系销售</div>
                <div class="heading-grey-13 price-line"><span class="label"></span><div style="width: 180px;text-align: center;color:#579EF8;font-weight:600">400 632 6626</div></div>
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
    </div>
  `,
})
export default class IntroduceView extends Vue {
  numeral = numeral
  language = user.info.language
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
  ExtensionType = ExtensionType
  customDocument: any = []
  isConfirmDialogVisible = false
  user = user
  isCN = user.info.company.area === 'CN'
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
  purchase() {
    if (!this.checkPermission()) return
    if (this.licenseInfo.activeStatus === 'auditing') return
    if (this.licenseInfo.activeStatus === 'activated') {
      this.isTokenDialogVisible = true
      return
    }
    // this.showDialogForm()
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
  backToPrev() {
    this.$router.go(-1)
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
  goToPurchasePage() {
    this.$router.push({
      path: '/marketplace/pay',
      query: {
        packageId: this.selectPackage.id,
        packageCount: this.selectPackage.number,
      },
    })
  }
  async getLicenseList() {
    const res = await this.$http.post(`/api/v2/marketplace/license/${this.serviceName}/list`)
    if (res.data.data[0]) {
      this.licenseInfo = res.data.data[0]
      this.tokenForm.token = this.licenseInfo.token
    }
  }
  onCopy() {
    this.$message.success('copy succeed')
  }
  onError() {
    this.$message.success('copy failed')
  }
  created() {
    this.serviceName = this.$route.query.serviceName as string
  }
  mounted() {
    this.init()
    this.getLicenseList()
  }

  translateDescribe(en: string, cn: string) {
    return this.$i18n.locale === 'en' ? en : cn
  }

  closeConfirmDialog() {
    this.isConfirmDialogVisible = false
  }
}
