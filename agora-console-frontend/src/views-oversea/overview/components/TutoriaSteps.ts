import Vue from 'vue'
import { getCashInfo, user } from '@/services'
import Component from 'vue-class-component'
import './Component.less'
import { Prop } from 'vue-property-decorator'

@Component({
  template: ` <div v-loading="loading">
    <el-tooltip class="item" effect="light" placement="bottom">
      <el-progress
        class="cursor-pointer"
        type="circle"
        :percentage="getPercentage"
        :width="46"
        :stroke-width="4"
        status="text"
        :color="getPercentage < 60 ? '#FF4CA5' : '#099DFD'"
      >
        <span class="heading-dark-03">{{ CompleteStepCount }}/{{ showItems.length }}</span>
      </el-progress>
      <div slot="content" class="tooltip-content">
        <div class="heading-dark-03 mb-10">{{ $t('GettingStarted') }}</div>
        <div class="tutorial-row" @click="goOnboarding">
          <div class="heading-dark-04">{{ $t('CompleteOnboarding') }}</div>
          <template v-if="tutorialStatus.onboarding">
            <div v-if="user.info.company.area === 'CN'" class="heading-light-05">
              {{ $t('Finish') }}
            </div>
            <div v-else class="heading-light-05 cursor-pointer" @click="goOnboarding">
              {{ $t('Finish') }}
            </div>
          </template>
          <div class="link f-13" @click="goOnboarding" v-else>{{ $t('Go') }}</div>
        </div>
        <div class="tutorial-row" v-if="showIdentity" @click="jumpPage({ path: '/settings/authentication' })">
          <div class="heading-dark-04">{{ $t('IDAuthentication') }}</div>
          <div class="heading-light-05 cursor-pointer" v-if="tutorialStatus.authentication">{{ $t('Finish') }}</div>
          <div class="link f-13" v-else>{{ $t('Go') }}</div>
        </div>
        <div
          class="tutorial-row"
          v-if="this.cashInfo.accountCurrency && this.cashInfo.accountCurrency === 'CNY'"
          @click="jumpPage({ path: '/finance/deposit/alipay' })"
        >
          <div class="heading-dark-04">{{ $t('MakePayment') }}</div>
          <div class="heading-light-05 cursor-pointer" v-if="tutorialStatus.makePayment">{{ $t('Finish') }}</div>
          <div class="link f-13" v-else>{{ $t('Go') }}</div>
        </div>
        <div
          class="tutorial-row"
          v-if="this.cashInfo.accountCurrency && this.cashInfo.accountCurrency === 'USD'"
          @click="jumpPage({ path: '/finance/deposit/creditcard' })"
        >
          <div class="heading-dark-04">{{ $t('SaveCreditCard') }}</div>
          <div class="heading-light-05 cursor-pointer" v-if="tutorialStatus.creditCard">{{ $t('Finish') }}</div>
          <div class="link f-13" v-else>{{ $t('Go') }}</div>
        </div>
        <div class="tutorial-row" @click="jumpPage({ path: '/settings/member' })">
          <div class="heading-dark-04">{{ $t('InviteMember') }}</div>
          <div class="heading-light-05 cursor-pointer" v-if="tutorialStatus.memberInvite">{{ $t('Finish') }}</div>
          <div class="link f-13" v-else>{{ $t('Go') }}</div>
        </div>
        <div class="tutorial-row" v-if="projectPermission" @click="jumpPage({ path: '/projects' })">
          <div class="heading-dark-04">{{ $t('LabelProjectLive') }}</div>
          <div class="heading-light-05 cursor-pointer" v-if="tutorialStatus.launchProject">{{ $t('Finish') }}</div>
          <div class="link f-13" v-else>{{ $t('Go') }}</div>
        </div>
        <div class="tutorial-row" v-if="user.info.company.country === 'CN'" @click="jumpFeedback">
          <div class="heading-dark-04">{{ $t('Experience feedback') }}</div>
          <div class="heading-light-05 cursor-pointer" v-if="tutorialStatus.feedback">{{ $t('Finish') }}</div>
          <div class="link f-13" v-else>{{ $t('Go') }}</div>
        </div>
      </div>
    </el-tooltip>
  </div>`,
})
export default class TutoriaSteps extends Vue {
  @Prop({ type: Function }) readonly startOnboarding!: () => Promise<void>

  loading = true
  cashInfo: any = {}
  cardsInfo: any = {}
  identity: any = {}
  showIdentity = true
  financePermission = user.info.permissions['FinanceCenter'] > 0 && !user.info.isRoot
  projectPermission = user.info.permissions['ProjectManagement'] > 0
  memberPermission = user.info.permissions['Member&RoleManagement'] > 0
  tutorialStatus: any = {
    onboarding: false,
    authentication: false,
    makePayment: false,
    creditCard: false,
    viewAA: false,
    memberInvite: false,
    launchProject: false,
    feedback: false,
  }
  showItems: any = []
  user = user

  get CompleteStepCount() {
    let total = 0
    for (const item of this.showItems) {
      if (this.tutorialStatus[item]) {
        total += 1
      }
    }
    return total
  }

  get getPercentage() {
    return parseInt(((this.CompleteStepCount / this.showItems.length) * 100).toString()) || 0
  }

  async created() {
    if (this.financePermission) {
      this.cashInfo = (await getCashInfo()) || {}
    }
    this.loading = true
    await this.init()
    this.loading = false
  }

  async init() {
    await Promise.all([
      this.getIdentity(),
      this.getTransactions(),
      this.getMembers(),
      this.getProjects(),
      this.getCompanyField(),
      this.getCards(),
    ])
    this.initShowItems()
  }

  async getIdentity() {
    if (
      user.info.company.source === 2 ||
      user.info.company.country !== 'CN' ||
      user.info.permissions['FinanceCenter'] === 0 ||
      user.info.isRoot
    ) {
      this.showIdentity = false
      return
    }
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data) {
        this.identity = identity.data
        if (identity.data.authStatus === -1) {
          this.showIdentity = false
        }
        if ('authStatus' in this.identity && this.identity.authStatus === 1) {
          this.tutorialStatus.authentication = true
        }
      }
    } catch (e) {
      console.info(e)
    }
  }

  async getTransactions() {
    if (!this.financePermission || this.cashInfo.accountCurrency !== 'CNY' || user.info.company.country !== 'CN') {
      return
    }
    try {
      const ret = await this.$http.get(`/api/v2/finance/transactions`, { params: { types: '2,4', page: 1, limit: 10 } })
      if (ret.data && ret.data.total > 0) {
        this.tutorialStatus.makePayment = true
      }
    } catch (e) {
      this.$message.error(this.$t('getInfoErr') as string)
    }
  }

  async getCards() {
    if (!this.financePermission || this.cashInfo.accountCurrency !== 'USD' || user.info.company.country === 'CN') {
      return
    }
    try {
      const getCards = await this.$http.get('/api/v2/finance/creditCard/cards')
      this.cardsInfo = getCards.data
      if (this.cardsInfo.length > 0) {
        this.tutorialStatus.creditCard = true
      }
    } catch (e) {}
  }

  async getMembers() {
    try {
      if (!this.memberPermission) {
        this.tutorialStatus.memberInvite = true
        return
      }
      const membersInfo = await this.$http.get('/api/v2/member-amount')

      this.tutorialStatus.memberInvite = membersInfo.data.count && membersInfo.data.count > 0
    } catch (e) {
      this.$message.error(this.$t('FailedGetMembers') as string)
    }
  }

  async getProjects() {
    try {
      if (!this.projectPermission) return
      const ret = await this.$http.get('/api/v2/projects', { params: { page: 1, limit: 10, stage: 2 } })
      if (ret.data && ret.data.total > 0) {
        this.tutorialStatus.launchProject = true
      }
    } catch (e) {}
  }
  async getCompanyField() {
    try {
      const ret = await this.$http.get('/api/v2/company/field')
      if (ret.data) {
        if (ret.data.onboardingStatus === 1) {
          this.tutorialStatus.onboarding = true
        }
        if (ret.data.feedbackStatus === 1) {
          this.tutorialStatus.feedback = true
        }
      }
    } catch (e) {}
  }

  async setFeedbackStatus() {
    try {
      await this.$http.post('/api/v2/company/field', { fieldType: 'feedback' })
      this.tutorialStatus.feedback = true
    } catch (e) {}
  }

  initShowItems() {
    this.showItems = []
    this.showItems.push('onboarding')
    if (this.showIdentity) {
      this.showItems.push('authentication')
    }
    if (this.cashInfo.accountCurrency && this.cashInfo.accountCurrency === 'CNY') {
      this.showItems.push('makePayment')
    }
    if (this.cashInfo.accountCurrency && this.cashInfo.accountCurrency === 'USD') {
      this.showItems.push('creditCard')
    }
    this.showItems.push('memberInvite')
    if (this.projectPermission) {
      this.showItems.push('launchProject')
    }
    if (this.user.info.company.country === 'CN') {
      this.showItems.push('feedback')
    }
  }

  goOnboarding() {
    if (user.info.permissions['ProjectManagement'] === 0) {
      this.$message.warning(this.$t('NoProjectPermission') as string)
      return
    }
    this.startOnboarding()
  }
  jumpPage(path: any) {
    this.$router.push(path)
  }

  jumpFeedback() {
    window.open('https://www.wenjuan.com/s/UZBZJvQOZDj/#', '_blank')
    this.setFeedbackStatus()
  }
}
