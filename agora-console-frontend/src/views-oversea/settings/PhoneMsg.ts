import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `
    <el-dialog :title="title" :visible.sync="dialogFormVisible" class="msg-box" width="400px">
      <div class="form-label clearfix">
        <vue-tel-input
          v-bind:class="{'vue-tel-input-width': !captchaSvg}"
          v-model="phone.number"
          @input="onInputPhone"
          @blur="checkPhone"
          :validCharactersOnly="true"
          :disabledFetchingCountry="true"
          :placeholder="PhoneHolder"
          :disabled="status"
          :preferredCountries="preferred"
        >
        </vue-tel-input>
        <el-button type="primary" class="send-btn" :disabled="status" @click="sendVerifyCode">{{ btnName }}</el-button>
        <div class="tips-err phone-err">{{ phoneTipsMsg }}</div>
      </div>
      <div class="form-label">
        <el-input v-model="code" :placeholder="$t('VerifyCode')" size="medium" class="mt-23"></el-input>
        <div class="tips-err">{{ codeTipsMsg }}</div>
      </div>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">{{ $t('Cancel') }}</el-button>
        <el-button type="primary" @click="verifyPhone" :disabled="loading" v-loading="loading">{{
          $t('Verify')
        }}</el-button>
      </div>
    </el-dialog>
  `,
})
export default class PhoneMsg extends Vue {
  @Prop({ default: '', type: String }) readonly userVerify!: string
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: '', type: String }) readonly PhoneHolder!: string

  dialogFormVisible = false
  loading = false
  phone: any = {}
  status = false
  preferred = ['cn']
  timer: any = null
  code = ''
  codeTipsMsg = ''
  lang = this.$i18n.locale
  location = location
  btnResendTxt = this.$t('Resend')
  captchaSvg = ''
  captcha = ''
  phoneTipsMsg = ''
  btnName = this.$t('SendCode')
  codeSended = false

  get getPhone() {
    return this.phone.number.toString().startsWith('+')
      ? this.phone.number
      : `+${this.phone.dialCode}${this.phone.number}`
  }

  open() {
    this.dialogFormVisible = true
  }

  clear() {
    this.dialogFormVisible = false
    this.phone = {}
    this.code = ''
    this.codeTipsMsg = ''
    this.phoneTipsMsg = ''
    clearInterval(this.timer)
    this.btnName = this.$t('SendCode')
    this.status = false
  }

  onInputPhone(number: number, obj: any) {
    this.phone.number = obj.number && obj.number.international
    this.phone.isValid = obj.isValid
    this.phone.country = obj.regionCode
    this.checkPhone()
  }

  checkPhone() {
    if (!this.phone.isValid) {
      this.phoneTipsMsg = this.$t('PhoneTipsMsg') as string
      return false
    } else {
      this.phoneTipsMsg = ''
      return true
    }
  }
  checkCode() {
    if (!this.code) {
      this.codeTipsMsg = this.$t('CodeError') as string
      return false
    } else {
      return true
    }
  }
  btnTimer(cache_info: any) {
    this.phone.number = cache_info.phone || ''
    if (cache_info.phone) {
      this.phone.isValid = true
      this.phone.country = cache_info.country
    }
    if (cache_info.time && cache_info.time > 0) {
      const info = {
        country: cache_info.country,
        phone: cache_info.phone,
        time: cache_info.time,
      }
      this.codeSended = true
      this.status = true
      this.btnName = `${info.time}s`
      this.timer = setInterval(() => {
        info.time--
        this.btnName = `${info.time}s`
        if (info.time === 0) {
          info.time = null
          clearInterval(this.timer)
          this.btnName = this.btnResendTxt
          this.status = false
        }
      }, 1000)
    }
  }
  async sendVerifyCode() {
    if (!this.checkPhone()) {
      return
    }
    try {
      const params = {
        phone: this.getPhone,
        lang: this.lang,
        country: this.phone.country,
        captcha: this.captcha,
      }
      this.btnTimer(Object.assign({}, params, { time: 60 }))
      await this.$http.get(`/api/v2/verify/sms`, { params })
      this.$message({
        message: this.$t('SendSuccess') as string,
        type: 'success',
      })
    } catch (err) {
      clearInterval(this.timer)
      this.timer = null
      this.btnName = this.btnResendTxt
      this.status = false
      if (err.response && err.response.data.code === 110002) {
        this.$message.error(this.$t('PhoneExist') as string)
      } else {
        this.$message.error(this.$t('SendFailed') as string)
      }
    }
  }
  async verifyPhone() {
    if (!this.checkPhone() || !this.checkCode()) {
      return
    }
    try {
      const params = {
        phone: this.getPhone,
        code: this.code,
        country: this.phone.country,
      }
      this.loading = true
      await this.$http.post(`/api/v2/verify/phone`, params)
      this.loading = false
      this.$message({
        message: this.$t('VerifySuccess') as string,
        type: 'success',
      })
      this.clear()
      this.$emit('updateUserInfo')
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('VerifyFailed') as string)
    }
  }
}
