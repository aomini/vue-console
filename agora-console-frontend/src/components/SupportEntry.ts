import Vue from 'vue'
import Component from 'vue-class-component'
const IconBot = require('@/assets/icon/icon-bot.png')
@Component({
  template: ` <div class="support-container">
    <el-tooltip placement="left" effect="light" popper-class="support-box" :disabled="showBot">
      <div class="support-entry" @click="openSupport">
        <img :src="IconBot" width="46" height="46" />
      </div>
      <div v-if="!showBot" slot="content">
        <div class="support-menu" @click="openTicketBot">
          <div class="support-title d-flex align-center">
            <span class="iconfont support-menu-icon iconicon-kefu"></span>
            <span>{{ $t('Online Support') }}</span>
          </div>
          <div class="support-content">{{ $t('Online Support Hint') }}</div>
        </div>
        <div class="support-menu" @click="openFeedback">
          <div class="support-title d-flex align-center">
            <span class="iconfont support-menu-icon iconjianyifankui"></span>
            <span>{{ $t('Feedback') }}</span>
          </div>
          <div class="support-content">{{ $t('Feedback Hint') }}</div>
        </div>
      </div>
    </el-tooltip>
    <div class="support-iframe" v-show="showBot" v-loading="loading">
      <i class="support-close cursor-pointer iconfont iconicon-guanbi" @click="showBot = false"></i>
      <iframe
        ref="support"
        class="support-bot"
        :src="ticketBotUrl"
        width="100%"
        height="100%"
        frameborder="0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-downloads allow-modals"
      ></iframe>
    </div>
  </div>`,
})
export default class SupportEntry extends Vue {
  IconBot = IconBot
  showBot = false
  ticketBotUrl = `${this.GlobalConfig.config.ticketUrl}/pure-bot`
  loading = false

  openSupport() {
    if (this.showBot) {
      this.showBot = false
    }
  }

  openTicketBot() {
    this.showBot = true
  }

  openFeedback() {
    window.open(this.$t('FeedbackUrl') as string, '_blank')
  }
}
