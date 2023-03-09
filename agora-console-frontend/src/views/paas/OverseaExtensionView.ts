import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import ExtensionBilling from './component/extension-billing'
import ExtensionConfirmDialog from './component/extension-confirm-dialog'
import CreditCardDialog from './component/credit-card-dialog'
import SecretKeyDialog from './component/secret-key-dialog'
import ExtensionInfo from './component/extension-info'
import ExtensionPlan from './component/extension-plan'
import ExtensionProjectList from './component/extension-project-list'
import ExtensionDocument from './component/extension-document'
import ExtensionUsage from './component/extension-usage'
import './style/oversea-extension.less'

@Component({
  components: {
    'extension-billing': ExtensionBilling,
    'extension-confirm-dialog': ExtensionConfirmDialog,
    'credit-card-dialog': CreditCardDialog,
    'secret-key-dialog': SecretKeyDialog,
    'extension-info': ExtensionInfo,
    'extension-project-list': ExtensionProjectList,
    'extension-plan': ExtensionPlan,
    'extension-document': ExtensionDocument,
    'extension-usage': ExtensionUsage,
  },
  template: `
    <div v-loading='loading'>
    <div class='oversea-extension'>
      <div class='module-title'></div>
      <el-breadcrumb separator="/" style="margin-bottom: 20px;">
        <el-breadcrumb-item>
          <span class="cursor-pointer" @click="$router.go(-1)">Extensions Marketplace</span> 
        </el-breadcrumb-item>
        <el-breadcrumb-item> {{ $t('DetailPage') }} </el-breadcrumb-item>
      </el-breadcrumb>
      <div class='card marketplace-card'>
        <div class="left">
          <div class="left-content">
            <extension-info
                :extension-name="productInfo?.cnName"
                :extension-title="productInfo?.productCnName"
                :extension-description="productInfo?.productCnDetailDescription"
                :extension-photo-url="productInfo?.productPhotoUrl"
            />
            <extension-document
                :api-url="productInfo?.apiCnUrl"
                :support-url="productInfo?.supportUrl"
                :sdkDownLoadUrl="productInfo?.sdkDownloadUrl"
                :vendor-name="productInfo?.enName"
            />
            <extension-project-list v-if="hasSubscribed" :payment="productInfo?.payment"/>
            <extension-usage v-if="hasSubscribed" :billingItemId="productInfo?.billingItemId"/>
            <extension-billing v-if="hasSubscribed"/>
            <extension-plan :plans="plans" :planId="planId" :serviceName="serviceName" :planChange="handlePlanChange"
                            :isHasPlan="isHasPlan"/>
            <div class='subscribe-btn-group'>
              <div v-if="!hasSubscribed" class="heading-grey-13 mb-10">
                <span>By clicking Activate button, you agree to <a class="link" href="https://www.agora.io/en/extensions-marketplace/terms-of-use/" target="_blank">Agora Extensions Marketplace Terms of Use</a></span>
              </div>
              <el-button v-if="!hasSubscribed" type="primary" class='button button-lg' @click='handleActivateService'>
                {{ $t('Activate') }}
              </el-button>
              <el-button v-else type="primary" class='button button-lg' @click='deactivateService'>
                {{ $t('Deactivate') }}
              </el-button>
            </div>
          </div>

          <div class="right-content">
            <div class="provider-icon">
              <img width='80px' :src="productInfo?.logoPhotoUrl" v-if="productInfo?.logoPhotoUrl"/>
            </div>
            <p class="right-box-desc"
               v-html="this.productInfo?.cnDescription"></p>
            <extension-confirm-dialog :visible="isConfirmDialogVisible" :confirm="activatedService"
                                      :cancel="closeConfirmDialog"
                                      :userInfo="user.info" :tosUrl="productInfo?.tos" :vendorName="productInfo?.enName" :privacyPolicyUrl="productInfo?.privacyPolicyUrl" />
            <credit-card-dialog :visible="isCreditCardVisible" :confirm="goToAddCreditCard"
                                :cancel="closeCreditCardDialog"/>
          </div>
        </div>
      </div>
    </div>
    </div>`,
})
export default class OverseaExtensionView extends Vue {
  cancelSubscribeMsg = 'Are you sure to you want to deactivate the extension?'
  serviceName = ''
  user = user
  loading = false
  productInfo: any = {}
  hasSubscribed = false
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
  planId = ''
  plans = []
  isHasPlan = false
  isConfirmDialogVisible = false
  account: any = {
    accountBalance: 0,
  }
  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
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
    await this.init()
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
      },
    })
    const plans = res?.data?.data?.[0]?.plans
    this.productInfo = res?.data?.data?.[0]
    if (plans) {
      this.plans = JSON.parse(plans)
    }
    document.title = this.productInfo?.productEnName
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
    this.loading = true
    const res = await this.getCreditCard()
    this.loading = false
    if (res && res?.data?.length === 0) {
      this.isCreditCardVisible = true
      return
    }
    this.loading = false
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
    this.$confirm(this.cancelSubscribeMsg, 'Deactivate Service', {
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
  // async getPlanList() {
  //   const res = await this.$http.get(`/api/v2/marketplace/plan/${this.serviceName}/list`)
  // }
}
