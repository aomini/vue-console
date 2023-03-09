import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import { Watch } from 'vue-property-decorator'
import { getCashInfo, getLifeCycleConfig } from '@/services/finance'
import moment from 'moment'
import { EmailStatus } from '@/models'
import MenuVertical from '@/views/components/MenuVertical'
import MenuHorizontal from '@/views/components/MenuHorizontal'
import Breadcrumb from '@/views/components/Breadcrumb'
import SupportEntry from '@/components/SupportEntry'
import './Layout.less'
const IconAlert = require('@/assets/icon/icon-alert.png')
const IconCaution = require('@/assets/icon/icon-caution.png')

@Component({
  components: {
    'menu-vertical': MenuVertical,
    'menu-horizontal': MenuHorizontal,
    'support-entry': SupportEntry,
    Breadcrumb: Breadcrumb,
  },
  template: ` <div class="cn">
    <div class="console-v3 h-100" style="background-color: #F2F3F6">
      <el-container class="h-100" :class="showHeaderWarning ? 'pb-67' : ''">
        <el-header class="header-v3" height="auto" style="border-bottom: 1px solid #e3e3ec; background-color: #fff">
          <menu-horizontal></menu-horizontal>
        </el-header>
        <div class="console-alert" v-if="showHeaderWarning && !hasClickClose">
          <el-alert class="alert-warn" v-if="MaintenanceAlert" type="warning" :closable="true" @close="hasClickClose = true">
            <template>
              <img height="20px" class="alert-warn" :src="IconCaution" />
              <span class="align-middle mx-2"> {{ $t('MaintenanceMsg') }} </span>
            </template>
          </el-alert>
          <el-alert class="alert-warn" v-if="sudoPermissionWarning" type="warning" :closable="true" @close="hasClickClose = true">
            <template>
              <img height="20px" class="alert-warn" :src="IconCaution" />
              <span class="align-middle mx-2"> {{ $t('sudoPermissionWarningMsg') }} </span>
            </template>
          </el-alert>
          <el-alert class="alert-warn" v-if="needPayWarning" type="warning" :closable="true" @close="hasClickClose = true">
            <template>
              <img height="20px" class="alert-warn" :src="IconCaution" />
              <span class="align-middle mx-2">
            {{ $t('needPayWarningMsg', { balanceSafeThreshold: formatAllowableArrears, date: suspensionDate }) }}
          </span>
              <el-button class="alert-link" type="text" @click="makePayments"> {{ $t('MakePayments') }} </el-button>
            </template>
          </el-alert>
          <el-alert class="alert-warn py-0" v-if="needRepairEmailWarning" type="warning" :closable="true" @close="hasClickClose = true">
            <template>
              <img height="20px" class="alert-warn" :src="IconCaution" />
              <span class="align-middle mx-2 warning-text"> {{ $t('needRepairEamilMsg') }} </span>
              <el-button class="alert-link" type="text" @click="updateEmail"> {{ $t('UpdateEmail') }} </el-button>
            </template>
          </el-alert>
          <el-alert class="alert-warn" v-if="neverBlockWarning" type="warning" :closable="true" @close="hasClickClose = true">
            <img height="20px" class="alert-warn" :src="IconCaution" />
            <span class="align-middle mx-2">
          {{ $t('neverBlockMsg') }} {{ balanceSafeThreshold | formatMoney(cashInfo.accountCurrency) }}
        </span>
          </el-alert>
          <el-alert class="alert-warn py-0" v-if="identityWarning" type="error" :closable="true" @close="hasClickClose = true">
            <template>
              <img height="20px" class="alert-warn" :src="IconCaution" />
              <span class="align-middle"> {{ $t('AuthenticationWarningMsg') }} </span>
              <el-button class="alert-link" type="text" @click="goAuth"> {{ $t('authentication') }} </el-button>
              <span class="align-middle">{{ $t('AsSoonAsPossible') || '' }}</span>
            </template>
          </el-alert>
          <el-alert class="alert-warn py-0" v-if="userVerify.verifyPhoneWarning" type="warning" :closable="true" @close="hasClickClose = true">
            <template>
              <img height="20px" class="alert-warn" :src="IconCaution" />
              <span class="align-middle mx-2"> {{ $t('VerifyPhoneWarn') }} </span>
              <el-button class="alert-link" type="text" @click="updateEmail"> {{ $t('JumpVerifyPhone') }} </el-button>
            </template>
          </el-alert>
          <el-alert class="alert-error py-0" v-if="blockedWarning" type="error" :closable="true" @close="hasClickClose = true">
            <img height="20px" class="alert-error" :src="IconAlert" />
            <span class="align-middle mx-2">
          {{ $t('blockedWarningMsg', { balanceSafeThreshold: formatAllowableArrears }) }}
        </span>
            <el-button class="alert-link" type="text" @click="makePayments"> {{ $t('MakePayments') }} </el-button>
          </el-alert>
          <el-alert class="alert-error" v-if="manualBlockWarning" type="error" :closable="true" @close="hasClickClose = true">
            <img height="20px" class="alert-error" :src="IconAlert" />
            <span class="align-middle mx-2"> {{ $t('mannualBlockedWarningMsg') }} </span>
          </el-alert>
          <el-alert class="alert-error" v-if="noPaymentBlockedWarning" type="error" :closable="true" @close="hasClickClose = true">
            <img height="20px" class="alert-error" :src="IconAlert" />
            <span class="align-middle mx-2"> {{ $t('noPaymentBlockedWarningMsg') }} </span>
          </el-alert>
        </div>
        <el-container class="container-v3">
          <div class="menu-vertical">
            <menu-vertical :class="showHeaderWarning ? 'has-header' : ''" :style="showHeaderWarning ? 'height: calc(100vh - 179px)' : 'height: calc(100vh - 109px)'"></menu-vertical>
          </div>
          <el-main class="main-v3 main-block" :style="showHeaderWarning ? 'padding-bottom: 130px' : 'padding-bottom: 85px'">
            <Breadcrumb />
            <div class="main-container">
              <router-view name="submenu" class="main-container__submenus"></router-view>
              <router-view :userVerify="userVerify" @updateIdentity="getIdentity" class="main-container__page"></router-view>
            </div>
          </el-main>
        </el-container>
        <el-dialog
          :title="$t('IDAuthentication')"
          :visible.sync="showAuthDialog"
          :show-close="false"
          width="325px"
          top="30vh"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
        >
          <p class="heading-grey-13">{{ $t('AuthenticationTip') }}</p>
          <div class="button-line mt-20 text-right">
            <console-button class="console-btn-primary" @click="goAuth">{{ $t('GoAuthentication') }}</console-button>
          </div>
        </el-dialog>
        <el-dialog
          :title="$t('Migrate Netless Projects to Agora.io Console')"
          :visible.sync="showNetlessDialog"
          width="450px"
          top="30vh"
        >
          <p class="f-12">{{ $t('Netless Tip 1') }}</p>
          <p class="f-12">{{ $t('Netless Tip 2', { email: user.email }) }}</p>
          <p class="f-12">{{ $t('Netless Tip 3') }}</p>
          <el-checkbox v-model="netlessAgree"
            ><div class="checkbox-text">
              {{ $t('I confirm that I own this Netless account and agree to the migration') }}
            </div></el-checkbox
          >
          <div class="button-line mt-20 text-right">
            <console-button
              class="console-btn-primary"
              @click="migrate()"
              :disabled="!netlessAgree || migrateLoading"
              :loading="migrateLoading"
              >{{ $t('Migrate') }}</console-button
            >
            <console-button class="console-btn-white" @click="() => showNetlessDialog = false">{{
              $t('Cancel')
            }}</console-button>
          </div>
        </el-dialog>
        <support-entry></support-entry>
      </el-container>
    </div>
  </div>`,
})
export default class LayoutView extends Vue {
  user: any = user.info
  needRepairEmailWarning = false
  needPayWarning = false
  neverBlockWarning = false
  blockedWarning = false
  manualBlockWarning = false
  noPaymentBlockedWarning = false
  verifyPhoneWarning = false
  sudoPermissionWarning = false
  identityWarning = false
  userVerify = { verifyPhoneWarning: false }
  suspensionDate = ''
  cashInfo: any = {}
  lifeCycleConfig: any = null
  balanceSafeThreshold = 0
  showAuthAlert = false
  identitySubmitted = false
  permission = user.info.permissions['FinanceCenter'] > 0
  showNetlessDialog = false
  netlessAgree = false
  migrateLoading = false
  agoraSource = 1
  IconAlert = IconAlert
  IconCaution = IconCaution
  MaintenanceAlert = false
  hasClickClose = false

  async mounted() {
    if (this.user.isRoot) {
      this.sudoPermissionWarning = true
      return
    }

    if (!this.permission) return

    this.getIdentity()

    const cashInfo = await getCashInfo()
    this.cashInfo = cashInfo
    const lifeCycleConfig = await getLifeCycleConfig()
    this.lifeCycleConfig = lifeCycleConfig
    this.balanceSafeThreshold = lifeCycleConfig ? lifeCycleConfig.balanceSafeThreshold : 0
    this.checkNetlessStatus()
    this.alertController(true)
  }

  get formatAllowableArrears() {
    let currency = '$'
    if (this.cashInfo.accountCurrency === 'USD') currency = '$'
    if (this.cashInfo.accountCurrency === 'CNY') currency = '¥'
    return `${currency} ${Number(this.balanceSafeThreshold)
      .toFixed(2)
      .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`
  }

  get showAuthDialog() {
    return this.showAuthAlert
  }

  get showHeaderWarning() {
    if (this.hasClickClose) return false

    return (
      this.needRepairEmailWarning ||
      this.needPayWarning ||
      this.neverBlockWarning ||
      this.blockedWarning ||
      this.manualBlockWarning ||
      this.sudoPermissionWarning ||
      this.userVerify.verifyPhoneWarning ||
      this.identityWarning ||
      this.MaintenanceAlert
    )
  }

  @Watch('$route')
  onRouteChanged(to: any, from: any) {
    if (to.path.indexOf('authentication') !== -1 || !this.user.verified) {
      this.showAuthAlert = false
      return
    }
    if (to.path.indexOf('onboarding') !== -1) {
      this.alertController(false)
    } else if (from.path.indexOf('onboarding') !== -1) {
      this.alertController(true)
    }
    // 实名认证已提交或者强制弹窗弹窗已存在
    if (this.identitySubmitted || (this.showAuthAlert && from.path.indexOf('authentication') === -1)) return
    this.getIdentity()
  }
  backToMain() {
    this.$router.push({ name: 'overview' })
  }
  makePayments() {
    this.$router.push({ name: 'finance' })
  }
  updateEmail() {
    const language = this.user.language === 'chinese' ? 'cn' : 'en'
    window.open(`${this.GlobalConfig.config.ssoUrl}/${language}/profile`)
  }
  async getIdentity() {
    if (!this.permission) return
    this.showAuthAlert = false
    this.identityWarning = false
    if (this.user.company.source === 2 || this.user.company.country !== 'CN') {
      return
    }
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: this.user.companyId } })
      if (!('authStatus' in identity.data) || (identity.data.authStatus !== 1 && identity.data.authStatus !== -1)) {
        if (
          this.$route.path.indexOf('authentication') === -1 &&
          this.$route.path.indexOf('onboarding') === -1 &&
          this.$route.path !== '/'
        ) {
          this.showAuthAlert = true
        }
      } else {
        this.identitySubmitted = true
      }
    } catch (e) {}
  }
  async checkNetlessStatus() {
    if (this.user.emailStatus === EmailStatus.NotVerified) return
    if (this.user.company.source !== this.agoraSource) return
    if (this.user.isMember) return

    try {
      const res = await this.$http.get('/api/v2/company/netless/exist')
      if (res.data) {
        this.showNetlessDialog = true
      }
    } catch (e) {}
  }
  goAuth() {
    this.$router.push({ path: '/settings/authentication' })
  }
  async migrate() {
    this.migrateLoading = true
    try {
      await this.$http.post('/api/v2/company/netless/migrate')
      this.$message({
        message: this.$t('Migrate successfully') as string,
        type: 'success',
      })
      this.showNetlessDialog = false
    } catch (error) {
      this.$message.error(this.$t('Migrate Failed') as string)
    }
    this.migrateLoading = false
  }

  alertController(showAlert: boolean) {
    if (showAlert) {
      if (this.$route.path.indexOf('onboarding') !== -1) return
      if (this.MaintenanceAlert) {
      } else if (this.showAuthAlert) {
        // this.identityWarning = true
      } else if (this.cashInfo.financialStatus === 3) {
        this.manualBlockWarning = true
      } else if (this.cashInfo.financialStatus === 2) {
        this.blockedWarning = true
      } else if (this.cashInfo.financialStatus === 4) {
        this.noPaymentBlockedWarning = true
      } else if (this.cashInfo.financialStatus === 1) {
        if (this.lifeCycleConfig.paymentDeadline) {
          this.needPayWarning = true
          this.suspensionDate = moment(this.lifeCycleConfig.paymentDeadline).format('YYYY-MM-DD')
        } else {
          this.neverBlockWarning = true
        }
      } else if (!this.user.isMember && (!this.user.verifyPhone || this.user.verifyPhone === '0')) {
        this.userVerify.verifyPhoneWarning = true
      } else if (!this.user.email || this.user.emailStatus !== 1) {
        this.needRepairEmailWarning = true
      }
    } else {
      this.needRepairEmailWarning = false
      this.manualBlockWarning = false
      this.blockedWarning = false
      this.noPaymentBlockedWarning = false
      this.needPayWarning = false
      this.neverBlockWarning = false
      this.sudoPermissionWarning = false
      this.userVerify.verifyPhoneWarning = false
      this.identityWarning = false
      this.MaintenanceAlert = false
    }
  }
}
