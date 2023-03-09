import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
const VerifyPhoneImg = require('@/assets/icon/verify-phone.png')
const VerifyEmailImg = require('@/assets/icon/verify-email.png')
const EmailFailedImg = require('@/assets/icon/email-failed.png')
import './Components.less'

@Component({
  template: ` <div class="layout">
    <el-dialog
      :title='$t("IdentityVerify")'
      width="480px"
      top="20vh"
      :show-close="!!cancelVerification"
      :visible="true"
      :before-close="cancelVerification"
    >
      <div :style="{ fontSize: '12px' }">
        <div v-if='step === "1"'>
          <div style="margin-bottom: 10px;">{{ $t('SupportDesc0') }}</div>
          <div style="margin-bottom: 10px;">{{ $t('SupportDesc5') }}</div>
          <div class="card mb-10">
            <div class="d-flex align-center">
              <img height="64px" class="img" :src="VerifyPhoneImg" />
              <div class="ml-20 w-250 flex-1 mr-10">
                <div class="verify-header">{{ $t('PhoneVerify') }}</div>
                <div v-if="phoneVerified">{{ $t('PhoneVerifyDesc', { phone }) }}</div>
                <div v-else>{{ $t('NoVerifiedPhone') }}</div>
              </div>
              <console-button
                size="sm"
                :disabled="!phoneVerified"
                class="console-btn-primary"
                @click="verificateByPhone"
              >
                {{ $t('StartVerify') }}
              </console-button>
            </div>
          </div>
          <div class="card mb-10">
            <div class="d-flex align-center">
              <img height="64px" class="img" :src="VerifyEmailImg" />
              <div class="ml-20 w-250 flex-1 mr-10">
                <div class="verify-header">{{ $t('EmailVerify') }}</div>
                <div v-if="emailVerfied">{{ $t('EmailVerifyDesc', { email }) }}</div>
                <div v-else>{{ $t('NoVerifiedEmail') }}</div>
              </div>
              <console-button
                size="sm"
                :disabled="!emailVerfied"
                class="console-btn-primary"
                @click="verificateByEmail"
              >
                {{ $t('StartVerify') }}
              </console-button>
            </div>
          </div>
        </div>
        <div v-if='step === "phone verification"'>
          <div>{{ $t('InputPhoneVerification', { phone }) }}</div>
          <div class="phone-input-box d-flex">
            <el-input size="medium" class="w-280" v-model="phoneCode"></el-input>
            <console-button v-if="timeCount > 0" class="console-btn-white w-150" disabled>
              {{ timeCount }}
            </console-button>
            <console-button class="console-btn-primary w-150" @click="verificateByPhone" v-else>
              {{ $t('SendVerificationCode') }}
            </console-button>
          </div>
          <div class="button-group">
            <console-button
              class="console-btn-size-md console-btn-primary w-100 mb-10"
              @click="confirmVerificationCode(phoneCode, 1)"
            >
              {{ $t('Confirm') }}
            </console-button>
            <console-button class="console-btn-size-md console-btn-white w-100 mb-10" @click='setStep("1")'>
              {{ $t('UseOtherMethod') }}
            </console-button>
          </div>
        </div>
        <div v-if='step === "email verification"'>
          <div>{{ $t('EmailVerification', { email }) }}</div>
          <div class="d-flex my-10 phone-input-box">
            <el-input size="medium" v-model="emailCode"></el-input>
          </div>

          <div class="button-group">
            <console-button
              class="console-btn-size-md console-btn-primary w-100 mb-10"
              @click="confirmVerificationCode(emailCode, 2)"
            >
              {{ $t('Confirm') }}
            </console-button>
            <console-button
              class="console-btn-size-md console-btn-white w-100 mb-10"
              style="margin-left:0"
              @click='setStep("1")'
            >
              {{ $t('UseOtherMethod') }}
            </console-button>
          </div>
        </div>

        <div v-if='step === "email error"'>
          <div class="mb-10">{{ $t('EmailError') }}</div>
          <div class="failed-img text-center">
            <img height="90px" :src="EmailFailedImg" />
          </div>
          <div class="button-group">
            <console-button
              class="console-btn-size-md console-btn-primary w-100 mb-10 mt-10"
              @click="confirmVerificationCode(emailCode, 2)"
            >
              {{ $t('Confirm') }}
            </console-button>
            <console-button class="console-btn-size-md console-btn-white w-100 mb-10" @click='setStep("1")'>
              {{ $t('UseOtherMethod') }}
            </console-button>
          </div>
        </div>
        <span> {{ $t('SupportDesc1') }} </span>
        <a href="javascript:void(0)" @click="goToSettings">{{ $t('SupportDesc2') }}</a>
        <span> {{ $t('SupportDesc3') }} </span>
        <a href="javascript:void(0)" @click="submitTicket">{{ $t('SupportDesc6') }}</a>
      </div>
    </el-dialog>
  </div>`,
})
export default class TwoFactorConfirm extends Vue {
  @Prop({ default: null, type: Function }) readonly afterSuccess!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly afterFail!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly cancelVerification!: () => Promise<void>

  step = '1'
  timeCount = 0
  emailCode = ''
  phoneCode = ''
  phone = user.info.verifyPhone || user.info.phone
  email = user.info.email
  area = user.info.company.area
  locale: string = user.info.locale
  phoneVerified = !!user.info.verifyPhone
  emailVerfied = user.info.emailStatus === 1
  VerifyPhoneImg = VerifyPhoneImg
  VerifyEmailImg = VerifyEmailImg
  EmailFailedImg = EmailFailedImg

  setStep(step: string) {
    this.step = step
  }

  startToCountDown() {
    const timeInterval = setInterval(() => {
      if (this.timeCount > 0) {
        this.timeCount = this.timeCount - 1
      } else {
        clearInterval(timeInterval)
      }
    }, 1000)
  }

  async verificateByPhone() {
    this.setStep('phone verification')
    try {
      await this.$http.post('/api/v2/verification/phone')
      this.timeCount = 60
      this.startToCountDown()
    } catch (e) {
      if (e.response.data.code === 13003) {
        this.$message.warning(this.$t('TimeLimitError') as string)
      }
    }
  }

  async verificateByEmail() {
    try {
      this.setStep('email verification')
      await this.$http.post('/api/v2/verification/email')
    } catch (e) {
      if (e.response.data.code === 13003) {
        this.$message.warning(this.$t('TimeLimitError') as string)
      } else {
        this.setStep('email error')
      }
    }
  }

  async confirmVerificationCode(verificationCode: number, type: string) {
    try {
      await this.$http.post('/api/v2/verification/check', { verificationCode, type })
      this.afterSuccess()
    } catch (e) {
      this.afterFail()
      this.$message.warning(this.$t('Incorrect verification code') as string)
    }
  }

  goToSettings() {
    const language = user.info.language === 'chinese' ? 'cn' : 'en'
    window.open(`${this.GlobalConfig.config.ssoUrl}/${language}/profile`)
  }

  submitTicket() {
    window.open('https://agora-ticket.agora.io')
  }

  logOut() {
    ;(window as any).location = '/action/signout'
  }
}
