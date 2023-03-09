import Vue from 'vue'
import Component from 'vue-class-component'
import WelcomeView from './WelcomeView'
import SessionExpiredView from './SessionExpiredView'
import LeaveChannelView from './LeaveChannelView'
const PicLogo = require('@/assets/icon/logo-agora-all.png')

@Component({
  components: {
    WelcomeView,
    SessionExpiredView,
    LeaveChannelView,
  },
  template: `
    <div v-loading="loading">
      <div class="top-bar d-flex align-center justify-between">
        <img height="30px" class="align-middle logo-img" :src="PicLogo" @click="openSite" />
        <div class="d-flex align-center">
          <span class="heading-grey-14">{{ $t('Not registered yet') }}</span>
          <console-button class="console-btn-primary ml-12" @click="openSSOPage">{{ $t('Signup') }}</console-button>
        </div>
      </div>
      <WelcomeView v-if="currentStep === 0" :next="next" :name="name"> </WelcomeView>
      <LeaveChannelView
        v-if="currentStep === 1"
        :name="name"
        :url="url"
        :resId="resId"
        :resContent="resContent"
        :channel="channelName"
        :goBack="goBack"
      ></LeaveChannelView>
      <SessionExpiredView v-if="!timestamp"> </SessionExpiredView>
    </div>
  `,
})
export default class LayoutView extends Vue {
  currentStep = 0
  name = ''
  resId = ''
  timestamp = true
  channelName = ''
  resContent = ''
  loading = false
  url = ''
  PicLogo = PicLogo

  async created() {
    this.currentStep = Number(this.$route.query.step) || 0
    this.loading = true
    this.url = window.location.href
    try {
      const getSignDecrypted = await this.$http.get(`/api/v2/sign-decrypt`, {
        params: { sign: this.$route.query.sign },
      })
      const sign = getSignDecrypted.data.decryptedSign
      const getUrlSignRecord = await this.$http.get(`/api/v2/project/token-record/${sign}`)
      const signInfo = getUrlSignRecord.data
      if (signInfo) {
        this.name = signInfo.name || ''
        const getResId = await this.$http.get(`/api/v2/app-decrypt`, { params: { resId: signInfo.resId } })
        this.resId = getResId.data.decryptedResId || ''
        this.timestamp = !!signInfo
        this.channelName = signInfo.channel || ''
        this.resContent = signInfo.resContent.replace(new RegExp(' ', 'g'), '+') || ''
      }
      this.$router.replace({ query: Object.assign({}, this.$route.query, { step: this.currentStep }) })
    } catch (e) {}
    this.loading = false
  }

  next() {
    this.currentStep = 1
    this.$router.replace({ query: Object.assign({}, this.$route.query, { step: this.currentStep }) })
  }
  goBack(isMaxCapacity: boolean) {
    if (isMaxCapacity) {
      this.$message.error(this.$t('MaxCapacity') as string)
    }
    this.currentStep = 0
    this.$router.replace({ query: Object.assign({}, this.$route.query, { step: this.currentStep }) })
  }
  openSite() {
    window.open(this.$t('siteURL') as string, '_blank')
  }
  openSSOPage() {
    window.open(this.$t('sSSOUrl') as string, '_blank')
  }
}
