import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { i18n } from '@/i18n-setup'
import { Prop, Watch } from 'vue-property-decorator'
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  components: {},
  template: `
    <div class="card-box step-card border-8 pb-24 mb-24" v-loading="loading">
      <div class="card-header border-bottom pb-10 mb-24">
        <div class="header-title">
          <span class="heading-dark-03 f-16">{{ $t('OnboardingCardTitle') }}</span>
        </div>
        <div class="header-right"></div>
      </div>
      <el-tabs v-model="activeName">
        <el-tab-pane :label="$t('OnboardingStep1')" name="authentication">
          <div class="step-card__content">
            <template v-if="authStatus">
              <p>
                {{ $t('AuthSuccessContent') }}
                <a @click="redirect('/settings/authentication')">{{ $t('ViewAuthentication') }}</a>
              </p>
            </template>
            <template v-else>
              <p>
                <span class="step-card__tag">{{ $t('Recommended') }}</span>
                <span v-html="$t('PersonAuthContent')"></span>
                <a @click="$emit('openAuthDialog')">{{ $t('GetStart') }}</a>
              </p>
              <p>
                <span v-html="$t('EnterpriseAuthContent')"></span>
                <a @click="redirect('/settings/authentication')">{{ $t('GetStart') }}</a>
                <span>{{ $t('View') }}</span>
                <span v-html="$t('DetailedIntroduction')"></span>
              </p>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('OnboardingStep2')" name="integration">
          <div class="step-card__content">
            <template v-if="!projectCreated">
              <p>
                <span class="step-card__tag step-card__tag--circle">!</span>
                <span> {{ $t('IntegrationContent') }} </span>
                <a @click="$emit('openProjectDialog')">{{ $t('CreateProject') }}</a>
              </p>
              <p v-html="$t('IntegrationContent2')"></p>
            </template>
            <template v-else>
              <p>
                {{ $t('IntegrationContent3') }} <a @click="redirect('/projects')">{{ $t('ViewProject') }}</a>
              </p>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('OnboardingStep3')" name="project">
          <div class="step-card__content">
            <p>
              <span class="step-card__tag step-card__tag--circle">!</span>
              <span>{{ $t('ProjectContent') }}</span>
              <a @click="redirect('/usage')">{{ $t('CheckUsage') }}</a>
            </p>
            <p>
              <span v-html="$t('ProjectContent2')"></span>
              <a :href="aaLiveDemoHost" target="_blank">{{ $t('overview_card_aa_advertisement_action') }}</a>
            </p>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('OnboardingStep4')" name="package">
          <div class="step-card__content">
            <p>
              <span class="step-card__tag step-card__tag--circle">!</span>
              <span> {{ $t('PackageContent') }} </span>
              <a @click="redirect('/finance')">{{ $t('Recharge') }}</a>
              <span v-html="$t('PackageContent2')"></span>
            </p>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('OnboardingStep5')" name="billing">
          <div class="step-card__content">
            <p>
              <span class="step-card__tag step-card__tag--circle">!</span>
              <a @click="redirect('/finance/receipt')">{{ $t('BillingContent') }}</a>
            </p>
            <p v-html="$t('BillingContent2')"></p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  `,
})
export default class OnboardingCard extends Vue {
  @Prop({ default: false, type: Boolean }) readonly authStatus!: boolean
  projectCreated = false
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  activeName = this.authStatus ? 'integration' : 'authentication'
  config = this.GlobalConfig.config
  isZh = i18n.locale === 'cn'
  lang = this.isZh ? 'zh-CN' : 'en'
  aaLiveDemoHost = `${this.config.aaLiveDemoHost}?source=console-overview&lang=${this.lang}`
  loading = false
  showProjectDialog = false

  @Watch('authStatus')
  onAuthStatusChange() {
    this.activeName = this.authStatus ? 'integration' : 'authentication'
  }

  async created() {
    this.loading = true
    await this.getOnboardingStatus()
    this.loading = false
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'resource-card')
  }

  confirmDelete() {
    this.deleteCard()
  }

  redirect(path: string) {
    this.$router.push({
      path: path,
    })
  }

  async getOnboardingStatus() {
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: { fetchAll: true } })
      const projectList = ret.data.items
      this.projectCreated = projectList.length > 0 ? true : false
    } catch (e) {}
  }
}
