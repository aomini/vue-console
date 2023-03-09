import Vue from 'vue'
import Component from 'vue-class-component'
import './VerifyEmail.less'
const emailVerified = require('@/assets/icon/email-verified.png')
const emailExpired = require('@/assets/icon/email-expired.png')

@Component({
  template: `
    <div class="verify-email" v-loading="waiting">
      <div class="verify-success" v-if="!verifyFail">
        <div class="verify-img">
          <img :src="emailVerified" />
        </div>
        <div class="verify-title">
          {{ $t('VerifySucess') }}
        </div>
        <div class="verify-hint">
          <span>{{ $t('VerifySucessHint') }}</span>
          <span @click="login" class="login link">{{ $t('Login') }}</span
          ><span>{{ $t('Here.') }}</span>
        </div>
      </div>

      <div class="verify-fail" v-if="verifyFail">
        <div class="verify-img">
          <img :src="emailExpired" />
        </div>
        <div class="verify-title">
          {{ $t('VerifyFail') }}
        </div>
        <div class="verify-hint login">
          <span>{{ $t('VerifyFailHintLeft') }}</span>
          <span class="link" @click="jumpSetting">{{ $t('Login') }}</span>
          <span>{{ $t('VerifyFailHint') }}</span>
        </div>
      </div>
    </div>
  `,
})
export default class VerifyEmail extends Vue {
  query: any = undefined
  waiting = true
  verifyFail = false
  emailVerified = emailVerified
  emailExpired = emailExpired

  checkQuery() {
    if (!this.query || !this.query.token || !this.query.email) {
      this.verifyFail = true
      return false
    }
    return true
  }
  async verifyEmail() {
    if (!this.checkQuery()) {
      this.waiting = false
      return
    }
    try {
      const ret = await this.$http.post('/api/v2/external/verify/checkEmail', {
        email: this.query.email,
        token: this.query.token,
        type: this.query.type || 'verify',
        source: this.query.source,
      })
      this.waiting = false
      if (ret.data) {
        setTimeout(() => {
          this.$router.push({ path: '/' })
        }, 1000)
      } else {
        this.verifyFail = true
      }
    } catch (e) {
      this.waiting = false
      this.verifyFail = true
    }
  }
  login() {
    this.$router.push({ path: '/' })
  }
  jumpSetting() {
    this.$router.push({ name: 'settings' })
  }

  async created() {
    const sign = this.$route.query.sign
    if (!sign) {
      this.$message.error(this.$t('FailedResetPassword') as string)
      return
    }

    const getUrlSignRecord = await this.$http.get(`/api/v2/project/token-record/${sign}`)
    if (!getUrlSignRecord.data) {
      this.$message.error(this.$t('UrlExpired') as string)
      return
    }

    const queryInfo = getUrlSignRecord.data
    this.query = queryInfo

    this.verifyEmail()
  }
}
