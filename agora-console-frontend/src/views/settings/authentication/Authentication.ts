import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import moment from 'moment'
import { IdentityStatus } from '@/models/authentication'
import './Authentication.less'
const iconPerson = require('@/assets/icon/icon-person.png')
const iconEnterprise = require('@/assets/icon/icon-enterprise.png')
const iconCheck = require('@/assets/icon/icon-check.png')
const iconChecking = require('@/assets/icon/icon-checking.png')

@Component({
  components: {},
  template: `
    <div class="page" v-loading="loading">
      <div class="card auth-container module-title-tip">
        <div class="d-flex flex-column align-items-baseline" v-html="$t('AuthenticationTips')"></div>
      </div>
      <div class="auth-items">
        <div class="card mb-20" v-if="!identity || identity.identityType !== 0">
          <div class="auth-item-horizontal">
            <div class="d-flex item-left">
              <div class="item-icon">
                <img :src="iconPerson" />
              </div>
              <div>
                <div class="auth-title">
                  {{ $t('PersonalTitle') }}
                  <span class="ml-20" v-if="personAuth">
                    <img :src="iconCheck" width="17" height="17" class="icon-check" />
                    {{ $t('Approved') }}
                  </span>
                  <span class="days-tip ml-20" v-if="!personAuth">{{ $t('Immediately') }}</span>
                </div>
                <div class="auth-desc mb-20" v-if="!personAuth">
                  {{ $t('PersonDesc') }}
                </div>
                <div class="auth-desc mb-20" v-else>
                  <div class="detail-row">
                    <label class="info-title"> {{ $t('SubmittedTime') }}: </label>
                    <label class="row-info"> {{ getTime() }} </label>
                  </div>
                  <div class="detail-row">
                    <label class="info-title"> {{ $t('Method') }}: </label>
                    <label class="row-info" v-if="identity.identityType === 1">
                      {{ $t('Person Certification/Alipay Certification') }}
                    </label>
                    <label class="row-info" v-if="identity.authType === 1"> {{ $t('ZhimaAuth') }} </label>
                  </div>
                </div>
                <div class="d-flex align-center" v-if="!personAuth">
                  <console-button class="console-btn-primary auth-btn mr-10" @click="goToAuth('person')">{{
                    $t('GetStart')
                  }}</console-button>
                  <span class="link">
                    <a target="_blank" :href="$t('PersonDocLink')">{{ $t('PersonDoc') }}</a>
                  </span>
                </div>
                <console-button v-else class="console-btn-white auth-btn auth-btn-white" @click="backToMain">{{
                  $t('BackToMain')
                }}</console-button>
              </div>
            </div>
          </div>
          <div class="auth-item-horizontal">
            <div class="auth-desc">
              <p>{{ $t('PersonalMinimumBalance') }}</p>
              <p>{{ $t('PersonalGracePeriod') }}</p>
              <p>{{ $t('Support') }}</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="auth-item-horizontal">
            <div class="d-flex item-left">
              <div class="item-icon">
                <img :src="iconEnterprise" />
              </div>
              <div>
                <div class="auth-title">
                  {{ $t('EnterpriseTitle') }}
                  <span class="days-tip ml-20" v-if="!companyAuth">{{ $t('1-3 days') }}</span>
                  <span class="days-tip ml-20" v-else-if="authStatus === identityStatus.Submitted">
                    <img :src="iconChecking" width="20" height="20" class="icon-check" />
                    {{ $t('Submitted') }}</span
                  >
                  <span class="days-tip ml-20" v-else-if="authStatus === identityStatus.Approved">
                    <img :src="iconCheck" width="17" height="17" class="icon-check" />
                    {{ $t('Approved') }}</span
                  >
                </div>
                <div class="auth-desc mb-20" v-if="identity.identityType == 0">
                  <div class="detail-row">
                    <label class="info-title"> {{ $t('SubmittedTime') }}: </label>
                    <label class="row-info"> {{ getTime() }} </label>
                  </div>
                  <div class="detail-row">
                    <label class="info-title"> {{ $t('Method') }}: </label>
                    <label class="row-info" v-if="identity.identityType === 0 && !identity.bankAccount">
                      {{ $t('ManualAuth') }}
                    </label>
                    <label class="row-info" v-if="identity.identityType === 0 && identity.bankAccount">
                      {{ $t('TransferAuth') }}
                    </label>
                    <label class="row-info" v-if="identity.authType === 1"> {{ $t('ZhimaAuth') }} </label>
                  </div>
                </div>
                <div class="auth-desc mb-20" v-else>{{ $t('EnterpriseDesc') }}</div>
                <div class="d-flex align-center" v-if="!companyAuth">
                  <console-button class="console-btn-primary auth-btn mr-10" @click="goToAuth('enterprise')">{{
                    $t('GetStart')
                  }}</console-button>
                  <span class="link">
                    <a target="_blank" :href="$t('EnterpriseDocLink')">{{ $t('EnterpriseDoc') }}</a>
                  </span>
                </div>
                <div v-if="identity.identityType === 0 && authStatus === identityStatus.Submitted">
                  <console-button class="console-btn-white auth-btn auth-btn-white" @click="viewAuth('enterprise')">{{
                    $t('View Auth')
                  }}</console-button>
                </div>
              </div>
            </div>
          </div>
          <div class="auth-item-horizontal">
            <div class="auth-desc">
              <p>{{ $t('PaymentPlan') }}</p>
              <p>{{ $t('BillingCycle') }}</p>
              <p>{{ $t('CompanyMinimumBalance') }}</p>
              <p>{{ $t('CompanyGracePeriod') }}</p>
              <p>{{ $t('CompanySupportPackage') }}</p>
              <p>{{ $t('CanRefund') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class Authentication extends Vue {
  loading = false
  identity: any = false
  authStatus = 0
  moment = moment
  identityStatus = IdentityStatus
  iconPerson = iconPerson
  iconEnterprise = iconEnterprise
  iconCheck = iconCheck
  iconChecking = iconChecking
  personAuth = false
  companyAuth = false
  async created() {
    try {
      this.loading = true
      await this.getIdentity()
      this.loading = false
    } catch (e) {
      this.$message.error(this.$t('GetIndentityFailed') as string)
    }
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data && identity.data.authStatus === this.identityStatus.Exemption) {
        this.$router.push({ path: '/' })
      }
      if (identity.data && (user.info.company.source === 2 || user.info.company.country !== 'CN')) {
        this.$router.push({ path: '/' })
      }
      if (identity.data && identity.data.identity && Object.keys(identity.data.identity).length > 0) {
        this.identity = identity.data.identity
        this.authStatus = identity.data.authStatus
        this.personAuth = !(
          this.authStatus === this.identityStatus.Rejected || this.authStatus === this.identityStatus.NotSubmitted
        )
        this.companyAuth = !(
          this.identity.identityType !== 0 ||
          this.authStatus === this.identityStatus.Rejected ||
          this.authStatus === this.identityStatus.NotSubmitted
        )
      }
    } catch (e) {
      this.$message.error(this.$t('GetIndentityFailed') as string)
    }
  }

  goToAuth(type: string) {
    if (type === 'enterprise') {
      this.$confirm(this.$t('EnterpriseConfirm') as string, this.$t('EnterpriseTitle') as string, {
        confirmButtonText: this.$t('ContinueEnterprise') as string,
        cancelButtonText: this.$t('Cancel') as string,
        customClass: 'message-box-warning',
      })
        .then(() => {
          this.$router.push({ path: '/settings/authentication/enterprise' })
        })
        .catch(() => {})
    } else if (type === 'person') {
      this.$router.push({ path: '/settings/authentication/person' })
    }
  }

  viewAuth(type: string) {
    if (type === 'enterprise') {
      this.$router.push({ path: '/settings/authentication/enterprise' })
    } else {
      this.$router.push({ path: '/settings/authentication/person' })
    }
  }

  getTime() {
    if (this.identity.submitTime) {
      return moment(this.identity.submitTime).format('YYYY/MM/DD HH:mm')
    }
    const utcOffset = moment().utcOffset()
    if (utcOffset > 0) {
      return (
        this.identity.createdAt &&
        moment(this.identity.createdAt).add(moment().utcOffset(), 'm').format('YYYY/MM/DD HH:mm')
      )
    }
    return (
      this.identity.createdAt &&
      moment(this.identity.createdAt).subtract(Math.abs(moment().utcOffset()), 'm').format('YYYY/MM/DD HH:mm')
    )
  }

  backToMain() {
    this.$router.push('/')
  }
}
