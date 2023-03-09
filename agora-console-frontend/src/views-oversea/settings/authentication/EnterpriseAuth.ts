import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import './Authentication.less'
import {
  validateNumber,
  validatePhoneNumber,
  checkPersonID,
  checkChineseName,
  checkSocialCreditCode,
  checkEnterpriseName,
} from '@/utils/utility'
import AvatarUpload from './AvatarUpload'

@Component({
  components: {
    AvatarUpload,
  },
  template: `
    <div class="page enterprise-auth">
      <div class="module-title">{{ $t('EnterpriseAuthTitle') }}</div>
      <div class="card auth-container">
        <div class="d-flex flex-column pb-2 align-items-baseline border-bottom">
          <label v-html='$t("EnterpriseAuthTips")'></label>
        </div>
        <div class="steps">
          <el-steps :active="step" finish-status="success" simple>
            <el-step :title="$t('Submitted authentication information')"></el-step>
            <el-step :title="$t('Check authentication information')"></el-step>
            <el-step :title="$t('SubmitSuccess')"></el-step>
          </el-steps>
        </div>
        <div class="step1-form" v-show="step === 1">
          <div class="submit-form">
            <el-form
              :model="identity"
              :rules="rules"
              :label-width="userInfo.locale === 'en' ? '250px' : '200px'"
              ref="submit-form"
            >
              <el-form-item :label="$t('EnterpriseName')" prop="name" class="input-item">
                <el-input v-model="identity.name" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item :label="$t('USCINumber')" prop="creditCode" class="input-item">
                <el-input v-model="identity.creditCode"></el-input>
              </el-form-item>
              <el-form-item
                :label="$t('LicensePhoto')"
                prop="licensePhoto"
                class="input-item"
                :inline-message="true"
                ref="licensePhoto"
              >
                <AvatarUpload @updateURL="updatePhotoBackURL" ref="avatar"></AvatarUpload>
                <span class="tip-line">{{ $t('LicensePhotoTip') }}</span>
              </el-form-item>
              <el-form-item :label="$t('BankName')" prop="bankName" class="input-item">
                <el-input v-model="identity.bankName" maxlength="256"></el-input>
              </el-form-item>
              <el-form-item :label="$t('BankBranch')" prop="bankBranch" class="input-item">
                <el-input v-model="identity.bankBranch" maxlength="256"></el-input>
              </el-form-item>
              <el-form-item :label="$t('AgentName')" prop="operatorName" class="input-item">
                <span>{{ identity.name }}</span>
              </el-form-item>
              <el-form-item :label="$t('BankAccount')" prop="bankAccount" class="input-item">
                <el-input v-model="identity.bankAccount"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="mx-auto w-500">
            <input type="checkbox" v-model="infoPromised" />
            <span class="ml-1"> {{ $t('PromiseInfo') }} </span>
          </div>
        </div>
        <div class="step2-form" v-if="step === 2">
          <div class="line">
            <label>{{ $t('Authentication Type') }}</label>
            <div class="d-inline-block">
              <span v-html="$t('Authentication Type Tip1')"></span>
              <span>{{ $t('Authentication Type Tip2', { companyName: identity.name }) }}</span>
            </div>
          </div>
          <hr />
          <div class="line">
            <label>{{ $t('Payer information') }}</label>
            <span class="edit" @click="edit">{{ $t('Edit') }}</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Name') }}</label>
            <span>{{ identity.name }}</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('BankAccount') }}</label>
            <span>{{ identity.bankAccount }}</span>
          </div>
          <hr />

          <div class="line">
            <label class="w-200">{{ $t('Payee information') }}</label>
          </div>

          <div class="line">
            <label class="sub-label">{{ $t('Name') }}</label>
            <span>上海兆言网络科技有限公司</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Account Bank') }}</label>
            <span>招商银行股份有限公司上海创智天地支行</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Receiving account') }}</label>
            <span>121 912 274 010 901</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Swift Code') }}</label>
            <span>CMBCCNBSXXX</span>
          </div>
          <hr />
        </div>

        <div class="step2-form" v-if="step === 3">
          <div class="">
            <h3>{{ $t('Received Title') }}</h3>
            <div>
              <span>{{ $t('Received Tip1', { companyName: identity.name, bankAccount: identity.bankAccount }) }}</span>
              <span v-html="$t('Received Tip2')"></span>
            </div>
          </div>
          <hr />

          <div class="line">
            <label class="w-200">{{ $t('Payee information') }}:</label>
          </div>

          <div class="line">
            <label class="sub-label">{{ $t('Name') }}</label>
            <span>上海兆言网络科技有限公司</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Account Bank') }}</label>
            <span>招商银行股份有限公司上海创智天地支行</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Receiving account') }}</label>
            <span>121 912 274 010 901</span>
          </div>
          <div class="line">
            <label class="sub-label">{{ $t('Swift Code') }}</label>
            <span>CMBCCNBSXXX</span>
          </div>
          <hr />
        </div>

        <div class="mx-auto">
          <div class="edit-line" v-if="step === 1">
            <console-button
              class="console-btn-primary"
              size="lg"
              :disabled="disableBtn || !infoPromised"
              @click="verifyInfo"
            >
              {{ $t('Next') }}
            </console-button>
            <console-button class="console-btn-white" size="lg" @click="back"> {{ $t('Cancel') }}</console-button>
          </div>

          <div class="save-line" v-if="step === 2">
            <div class="warning">
              <el-alert
                :title="$t('AuthWarning')"
                type="warning"
                :closable="false"
                style="padding:12px 15px;border: 1px solid #F0C996;"
                show-icon
              >
              </el-alert>
            </div>
            <div>
              <console-button
                class="console-btn-primary"
                size="lg"
                :disabled="disableBtn || !infoPromised"
                @click="save"
              >
                {{ $t('Submit') }}
              </console-button>
              <console-button class="console-btn-white" size="lg" @click="back"> {{ $t('Cancel') }}</console-button>
            </div>
          </div>

          <div class="save-line" v-if="step === 3">
            {{ $t('SavedTip') }}
            <div class="mt-20">
              <el-button class="button button-outline-mid-secondary" @click="back"> {{ $t('Back') }}</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class EnterpriseAuth extends Vue {
  validateName = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (!checkEnterpriseName(value)) {
      return callback(new Error(this.$t('NameWarn') as string))
    }
    callback()
  }
  validateCreditCode = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (!checkSocialCreditCode(value)) {
      return callback(new Error(this.$t('InvalidUSCINumber') as string))
    }
    callback()
  }
  validatePhone = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    callback()
  }
  legalPersonName = (rule: any, value: string, callback: any) => {
    if (value && !checkChineseName(value)) {
      return callback(new Error(this.$t('legalNameWarn') as string))
    }
    callback()
  }
  legalPersonNumber = (rule: any, value: string, callback: any) => {
    if (value && !checkPersonID(value)) {
      return callback(new Error(this.$t('InvalidIDNumber') as string))
    }
    callback()
  }
  operatorName = (rule: any, value: string, callback: any) => {
    if (value && !checkChineseName(value)) {
      return callback(new Error(this.$t('operatorNameWarn') as string))
    }
    callback()
  }
  operatorNumber = (rule: any, value: string, callback: any) => {
    if (value && !checkPersonID(value)) {
      return callback(new Error(this.$t('InvalidIDNumber') as string))
    }
    callback()
  }
  validateBankAccount = (rule: any, value: number, callback: any) => {
    if (!validateNumber(value)) {
      return callback(new Error(this.$t('InvalidParam') as string))
    }
    callback()
  }

  userInfo = user.info
  identity: any = {
    name: '',
    number: '',
    creditCode: '',
    address: '',
    phone: '',
    licensePhoto: '',
    legalPersonName: '',
    legalPersonNumber: '',
    operatorName: '',
    operatorNumber: '',
    licensePhotoKey: '',
    bankName: '',
    bankBranch: '',
    bankAccount: '',
  }
  rules = {
    name: [{ required: true, validator: this.validateName, trigger: 'blur' }],
    creditCode: [{ required: true, validator: this.validateCreditCode, trigger: 'blur' }],
    phone: [{ required: true, validator: this.validatePhone, trigger: 'blur' }],
    address: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    licensePhoto: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    legalPersonName: [{ validator: this.legalPersonName, trigger: 'blur' }],
    legalPersonNumber: [{ validator: this.legalPersonNumber, trigger: 'blur' }],
    operatorName: [{ validator: this.operatorName, trigger: 'blur' }],
    operatorNumber: [{ validator: this.operatorNumber, trigger: 'blur' }],
    bankName: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    bankBranch: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    bankAccount: [
      { required: true, message: this.$t('RequiredMissing'), trigger: 'blur' },
      { validator: this.validateBankAccount, trigger: 'blur' },
    ],
  }
  originIdentity: any = {}
  disableBtn = false
  infoPromised = false
  showNextStep = false
  step = 1
  photoBack = ''

  async created() {
    await this.getFullIdentityInfo()
  }

  async getFullIdentityInfo() {
    try {
      const identity = await this.$http.get('/api/v2/identity/full-info', {
        params: { companyId: user.info.companyId },
      })

      const fullIdentityInfo = identity.data
      if (fullIdentityInfo && fullIdentityInfo.basicInfo.status === -1) {
        this.$router.push({ path: '/' })
      }

      if (fullIdentityInfo && (user.info.company.source === 2 || user.info.company.country !== 'CN')) {
        this.$router.push({ path: '/' })
      }

      if (
        fullIdentityInfo &&
        fullIdentityInfo.companyInfo &&
        fullIdentityInfo.companyInfo.name &&
        fullIdentityInfo.companyInfo.status !== 2
      ) {
        this.originIdentity = fullIdentityInfo.companyInfo
        this.step = 3
        this.identity.name = fullIdentityInfo.companyInfo.name
        this.identity.bankAccount = fullIdentityInfo.companyInfo.bankAccount
        if (this.originIdentity.identityType === 0 && this.originIdentity.status === 1) {
          this.back()
        }
      } else if (fullIdentityInfo.companyInfo.status === 2) {
        Object.keys(this.identity).forEach((key) => {
          this.identity[key] = fullIdentityInfo.companyInfo[key]
        })
        if (fullIdentityInfo.companyInfo['licensePhotoUrl']) {
          ;(this.$refs['avatar'] as any).showUrl(fullIdentityInfo.companyInfo['licensePhotoUrl'])
          this.photoBack = fullIdentityInfo.companyInfo['licensePhotoUrl']
        }
        console.info(this.identity)
      }
    } catch (e) {
      console.info(e)
    }
  }
  checkSocialCreditCode(Code: string) {
    const patrn = /^[0-9A-Z]+$/
    if (Code.length !== 18 || patrn.test(Code) === false) {
      return false
    } else {
      let Ancode
      let Ancodevalue
      let total = 0
      const weightedfactors = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]
      const str = '0123456789ABCDEFGHJKLMNPQRTUWXY'
      for (let i = 0; i < Code.length - 1; i++) {
        Ancode = Code.substring(i, i + 1)
        Ancodevalue = str.indexOf(Ancode)
        total = total + Ancodevalue * weightedfactors[i]
      }
      let logiccheckcode: any = 31 - (total % 31)
      if (logiccheckcode === 31) {
        logiccheckcode = 0
      }
      const Str = '0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y'
      const ArrayStr = Str.split(',')
      logiccheckcode = ArrayStr[logiccheckcode]
      const checkcode = Code.substring(17, 18)
      if (logiccheckcode !== checkcode) {
        return false
      } else {
        return true
      }
    }
  }
  checkParam() {
    if (!this.identity.name) {
      this.$message.warning(this.$t('RequiredMissing') as string)
      return false
    }
    const cnReg = /^([\u4e00-\u9fa5]|\(|\)|（|）)+$/g
    if (!cnReg.test(this.identity.name)) {
      this.$message.warning(this.$t('NameWarn') as string)
      return false
    }
    if (!this.identity.creditCode) {
      this.$message.warning(this.$t('RequiredMissing') as string)
      return false
    }
    if (!this.checkSocialCreditCode(this.identity.creditCode)) {
      this.$message.warning(this.$t('InvalidUSCINumber') as string)
      return false
    }
    if (!this.identity.address) {
      this.$message.warning(this.$t('RequiredMissing') as string)
      return false
    }
    if (
      !this.identity.licensePhoto ||
      !this.identity.phone ||
      !this.identity.legalPersonName ||
      !this.identity.legalPersonNumber
    ) {
      this.$message.warning(this.$t('RequiredMissing') as string)
      return false
    }
    if (!validatePhoneNumber(this.identity.phone)) {
      this.$message.warning(this.$t('PhoneError') as string)
      return false
    }
    if (!checkChineseName(this.identity.legalPersonName)) {
      this.$message.warning(this.$t('legalNameWarn') as string)
      return false
    }
    if (this.identity.operatorName && !checkChineseName(this.identity.operatorName)) {
      this.$message.warning(this.$t('operatorNameWarn') as string)
      return false
    }
    if (
      (this.identity.operatorNumber && !checkPersonID(this.identity.operatorNumber)) ||
      !checkPersonID(this.identity.legalPersonNumber)
    ) {
      this.$message.warning(this.$t('InvalidIDNumber') as string)
      return false
    }
    return true
  }
  updatePhotoBackURL(url: string, id: any, ossKey: string) {
    this.photoBack = url
    this.identity.licensePhoto = id
    this.identity.licensePhotoKey = ossKey
    ;(this.$refs.licensePhoto as any).clearValidate()
  }
  back() {
    this.$router.push({ path: '/settings/authentication' })
  }
  goPayment() {
    this.$router.push({ path: '/finance/deposit/alipay' })
  }
  async verifyInfo() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.step = 2
      } else {
        return false
      }
    })
  }
  async save() {
    this.disableBtn = true
    const currentMsg = this.$message.info(this.$t('InSubmitting') as string)
    try {
      await this.$http.post('/api/v2/identity/enterprise', {
        name: this.identity.name,
        creditCode: this.identity.creditCode,
        licensePhoto: this.identity.licensePhoto,
        licensePhotoKey: this.identity.licensePhotoKey,
        bankName: this.identity.bankName,
        bankBranch: this.identity.bankBranch,
        bankAccount: this.identity.bankAccount,
      })
      currentMsg.close()
      this.step = 3
    } catch (e) {
      this.disableBtn = false
      currentMsg.close()
      if (e.response && e.response.data.code === 9008) {
        this.$message.error(this.$t('NumberExist') as string)
      } else if (e.response && e.response.data.code === 9017) {
        this.$message.error(this.$t('BankAccountExist') as string)
      } else if (e.response && e.response.data.code === 9018) {
        this.$message.error(this.$t('EnterpriseNameExist') as string)
      } else {
        this.$message.error(this.$t('SubmitFailed') as string)
      }
    }
  }
  edit() {
    this.step = 1
    ;(this.$refs['avatar'] as any).showUrl(this.photoBack)
  }
}
