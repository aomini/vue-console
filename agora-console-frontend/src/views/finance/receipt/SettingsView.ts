import Vue from 'vue'
import Component from 'vue-class-component'
import { checkEnterpriseName, checkSocialCreditCode, validateEmail } from '@/utils/utility'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services'
import './Receipt.less'
import AvatarUpload from '@/views/settings/authentication/AvatarUpload'

@Component({
  components: {
    AvatarUpload,
  },
  template: `
    <div class="page-v3 receipt-setting">
      <div class="card">
        <label class="heading-dark-02 mb-10"> {{ $t('TypeExplanation') }} </label>
        <el-table
          header-row-class-name="table-header"
          stripe
          cell-class-name="table-cell"
          :cell-style="{'font-size': '12px'}"
          :data="typeTable"
          border
        >
          <el-table-column :label="$t('ReceiptType')" prop="type"></el-table-column>
          <el-table-column :label="$t('AuthTypes')" prop="authType"></el-table-column>
          <el-table-column :label="$t('AmountLimit')" prop="limit"></el-table-column>
          <el-table-column :label="$t('ApplyType')" prop="applyType"></el-table-column>
          <el-table-column :label="$t('SendMethod')" prop="sendType"></el-table-column>
        </el-table>
        <div v-html="$t('Hint4')" class="hint"></div>
      </div>
      <div class="card receipt mt-20">
        <el-form ref="form" :model="settings" label-width="150px" size="small" :rules="rules" @submit.native.prevent>
          <label class="title"> {{ $t('ReceiptType') }} </label>
          <el-form-item class="item-block" label-width="0">
            <el-radio v-model="settings.receiptType" label="0" class="item-block" :disabled="!isPersonAuth">
              {{ $t('PersonReceipt') }}
            </el-radio>
          </el-form-item>
          <el-form-item class="item-block" label-width="0">
            <el-radio v-model="settings.receiptType" label="1" :disabled="!isPersonAuth&&!isEnterpriseAuth">
              {{ $t('EnterpriseGeneral') }}
            </el-radio>
          </el-form-item>
          <el-form-item class="item-block" label-width="0">
            <el-radio
              v-model="settings.receiptType"
              label="2"
              class="item-block d-inline-block"
              :disabled="!isEnterpriseAuth"
            >
              {{ $t('EnterpriseSpecial') }}
            </el-radio>
            <span class="heading-grey-13 ml-10" v-if="!isEnterpriseAuth">{{ $t('Please complete') }}</span
            ><span class="link heading-grey-13" @click="jumpAuth" v-if="!isEnterpriseAuth">
              {{ $t('Enterprise authentication') }}</span
            >
          </el-form-item>
          <div class="divider mt-20 mb-20"></div>
          <label class="title"> {{ $t('InvoiceTitle') }} </label>
          <div v-if="settings.receiptType=='0'">
            <div class="line d-flex align-center">
              <div class="label">验证类型：</div>
              <div>个人</div>
            </div>
            <div class="line d-flex align-center">
              <div class="label">{{ $t('Compellation') }}：</div>
              <el-input v-model="name" size="small"></el-input>
            </div>
            <div class="line d-flex align-center">
              <div class="label">{{ $t('ID Number') }}：</div>
              <el-input v-model="number" size="small"></el-input>
            </div>
            <div class="divider mt-20 mb-20"></div>
          </div>

          <div v-if="settings.receiptType=='1'">
            <el-form-item :label="$t('InvoiceTitle')" prop="name">
              <el-input
                v-model="settings.name"
                maxlength="32"
                class="input-box content-input"
                placeholder=""
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('IDNumber')" prop="creditCode">
              <el-input v-model="settings.creditCode" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Address')" prop="address">
              <el-input v-model="settings.address" maxlength="256" class="input-box cont《nt-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('OfficeNumber')" prop="phone">
              <el-input v-model="settings.phone" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>

            <label class="title"> {{ $t('BankInfo') }} </label>
            <el-form-item :label="$t('BankName')" prop="bankName">
              <el-input v-model="settings.bankName" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('OpenBank')" prop="bankBranch">
              <el-input v-model="settings.bankBranch" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('BankAccount')" prop="bankAccount">
              <el-input v-model="settings.bankAccount" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
          </div>

          <div v-if="settings.receiptType=='2'">
            <el-form-item :label="$t('EnterpriseName')" prop="name">
              <el-input
                v-model="settings.name"
                maxlength="32"
                class="input-box content-input"
                placeholder=""
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('IDNumber')" prop="creditCode">
              <el-input v-model="settings.creditCode" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Address')" prop="address">
              <el-input v-model="settings.address" maxlength="256" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('OfficeNumber')" prop="phone">
              <el-input v-model="settings.phone" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item
              :label="$t('CN Taxpayer certificate')"
              prop="certificatePhoto"
              :inline-message="true"
              ref="licensePhoto"
            >
              <AvatarUpload @updateURL="updateCertificatePhoto" ref="avatar" :showIcon="false"></AvatarUpload>
            </el-form-item>

            <label class="title"> {{ $t('BankInfo') }} </label>
            <el-form-item :label="$t('BankName')" prop="bankName">
              <el-input v-model="settings.bankName" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('OpenBank')" prop="bankBranch">
              <el-input v-model="settings.bankBranch" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('BankAccount')" prop="bankAccount">
              <el-input v-model="settings.bankAccount" maxlength="32" class="input-box content-input"></el-input>
            </el-form-item>
          </div>

          <label class="title" style="margin-top: 16px;">
            {{ $t('EmailAddress') }}
          </label>
          <el-form-item prop="email" :label="$t('Email')">
            <el-input v-model="settings.email" class="input-box content-input"></el-input>
          </el-form-item>
          <el-form-item :label="$t('cc E-mail')" v-if="settings.receiptType=='2'">
            <el-input v-model="settings.ccListStr" class="input-box content-input"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Receiver')" v-if="settings.receiptType=='2'" prop="consignee">
            <el-input v-model="settings.consignee" class="input-box content-input"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Consignee Address')" v-if="settings.receiptType=='2'" prop="consigneeAddress">
            <el-input v-model="settings.consigneeAddress" class="input-box content-input"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Consignee Phone')" v-if="settings.receiptType=='2'" prop="consigneePhone">
            <el-input v-model="settings.consigneePhone" class="input-box content-input"></el-input>
          </el-form-item>
          <el-form-item label="" v-if="settings.receiptType=='2'">
            <el-checkbox v-model="settings.autoApply" :true-label="1" :false-label="0">{{
              $t('Automatic monthly application for enterprise specialized invoice')
            }}</el-checkbox>
          </el-form-item>
          <div class="buttons">
            <console-button class="console-btn-primary" :disabled="disableBtn" @click="save">
              {{ $t('Save') }}
            </console-button>
            <console-button class="console-btn-white" @click="back">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </el-form>
      </div>
    </div>
  `,
})
export default class SettingsView extends Vue {
  validateName = (rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (!checkEnterpriseName(value)) {
      return callback(new Error(this.$t('NameWarn') as string))
    }
    callback()
  }
  validateCreditCode = (rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (!checkSocialCreditCode(value)) {
      return callback(new Error(this.$t('InvalidNumber') as string))
    }
    callback()
  }
  validatePhone = (rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    callback()
  }
  validateBankAccount = (rule: any, value: any, callback: any) => {
    const reg = /^[0-9]*$/
    if (value && !reg.test(value)) {
      return callback(new Error(this.$t('AccountError') as string))
    }
    callback()
  }
  checkEmail = (rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (!validateEmail(value)) {
      return callback(new Error(this.$t('EmailError') as string))
    }
    callback()
  }
  disableBtn = false
  typeTable = [
    {
      type: this.$t('PersonReceipt1'),
      authType: this.$t('Personal'),
      limit: '￥100',
      applyType: this.$t('Manual'),
      sendType: this.$t('Email'),
    },
    {
      type: this.$t('EnterpriseGeneral1'),
      authType: `${this.$t('Personal')}/${this.$t('Enterprise')}`,
      limit: '￥100',
      applyType: this.$t('Manual'),
      sendType: this.$t('EmailAddress2'),
    },
    {
      type: this.$t('EnterpriseSpecial1'),
      authType: this.$t('Enterprise'),
      limit: '无',
      applyType: this.$t('Automatic'),
      sendType: this.$t('Mail'),
    },
  ]
  settings: any = {}
  originSettings: any = {}
  originName = ''
  originEmail = ''
  originType = ''
  identity: any = {}
  rules = {
    name: [{ required: true, validator: this.validateName, trigger: 'blur' }],
    creditCode: [{ required: true, validator: this.validateCreditCode, trigger: 'blur' }],
    phone: [{ required: true, validator: this.validatePhone, trigger: 'blur' }],
    address: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    bankName: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    bankBranch: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    bankAccount: [{ required: true, validator: this.validateBankAccount, trigger: 'blur' }],
    email: [{ required: true, validator: this.checkEmail, trigger: 'blur' }],
    consignee: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    consigneeAddress: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
    consigneePhone: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'blur' }],
  }
  name = ''
  number = ''
  photoCertificate = ''
  isEnterpriseAuth = false
  isPersonAuth = false

  get receiptType() {
    return this.settings.receiptType
  }

  @Watch('receiptType')
  onReceiptTypeChange(newValue: any) {
    if (newValue !== this.originSettings.receiptType) {
      this.settings = {}
      this.$set(this.settings, 'receiptType', newValue)
    } else {
      if (this.originSettings) {
        this.settings = Object.assign({}, this.originSettings)
        if (this.settings.certificatePhotoUrl) {
          setTimeout(() => {
            if (this.$refs['avatar']) {
              ;(this.$refs['avatar'] as any).showUrl(this.settings.certificatePhotoUrl)
            }
          }, 500)
          this.photoCertificate = this.settings.certificatePhotoUrl
        }
      }
    }
  }

  async mounted() {
    await this.getIdentity()
    await this.getSettings()
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data && identity.data.identity && Object.keys(identity.data.identity).length > 0) {
        this.identity = identity.data.identity
        if (identity.data.identity.identityType === 0 && identity.data.authStatus === 1) {
          this.isEnterpriseAuth = true
        }
        if (identity.data.identity.identityType === 1 && identity.data.authStatus === 1) {
          this.isPersonAuth = true
        }
      }
      if (identity.data && identity.data.authStatus === -1) {
        this.$router.push({ path: '/' })
      }
    } catch (e) {
      console.info(e)
    }
  }

  async getSettings() {
    try {
      const settings = await this.$http.get('/api/v2/receipt/setting', { params: { companyId: user.info.companyId } })
      if (settings.data) {
        if (settings.data.receiptType === 0) {
          this.name = settings.data.name
          this.number = settings.data.idNumber
        }
        this.settings = settings.data
        this.settings.receiptType =
          this.settings.receiptType === 0 || this.settings.receiptType === -1
            ? '0'
            : this.settings.receiptType === 1
            ? '1'
            : '2'
      }
      if (!this.settings.receiptType) {
        if (this.identity.identityType === 1) {
          this.$set(this.settings, 'receiptType', '0')
        }
        if (this.identity.identityType === 0) {
          this.$set(this.settings, 'receiptType', '1')
        }
      }
      if (this.identity.identityType === 0 && this.settings.receiptType !== '2') {
        this.$set(this.settings, 'receiptType', '1')
      }
      if (this.settings.certificatePhotoUrl) {
        setTimeout(() => {
          if (this.$refs['avatar']) {
            ;(this.$refs['avatar'] as any).showUrl(this.settings.certificatePhotoUrl)
          }
        }, 500)
        this.photoCertificate = this.settings.certificatePhotoUrl
      }
      this.originSettings = Object.assign({}, this.settings)
      this.originType = this.settings.receiptType
    } catch (e) {
      console.info(e)
    }
  }

  async save() {
    ;(this.$refs['form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.disableBtn = true
        try {
          if (this.settings.receiptType === '0') {
            this.settings.name = this.identity.name
            this.settings.IdNumber = this.identity.number
            await this.$http.post('/api/v2/receipt/setting/person', {
              name: this.name,
              email: this.settings.email,
              IdNumber: this.number,
            })
          } else if (this.settings.receiptType === '1') {
            await this.$http.post('/api/v2/receipt/setting/enterprise', {
              receiptType: 1,
              name: this.settings.name,
              email: this.settings.email,
              credit_code: this.settings.creditCode,
              address: this.settings.address,
              phone: this.settings.phone,
              bank_name: this.settings.bankName,
              bank_branch: this.settings.bankBranch,
              bank_account: this.settings.bankAccount,
            })
          } else if (this.settings.receiptType === '2') {
            const params = {
              receiptType: 2,
              name: this.settings.name,
              email: this.settings.email,
              credit_code: this.settings.creditCode,
              address: this.settings.address,
              phone: this.settings.phone,
              bank_name: this.settings.bankName,
              bank_branch: this.settings.bankBranch,
              bank_account: this.settings.bankAccount,
              ccListStr: this.settings.ccListStr,
              certificatePhoto: this.settings.certificatePhoto,
              certificatePhotoKey: this.settings.certificatePhotoKey,
              autoApply: this.settings.autoApply,
              consignee: this.settings.consignee,
              consigneePhone: this.settings.consigneePhone,
              consigneeAddress: this.settings.consigneeAddress,
            }
            await this.$http.post('/api/v2/receipt/setting/enterprise', params)
          }
          this.disableBtn = false
          this.$message({
            message: this.$t('SaveSucess') as string,
            type: 'success',
          })
          this.$router.push({ path: '/finance/receipt' })
        } catch (e) {
          console.info(e)
          this.disableBtn = false
          this.$message.error(this.$t('SaveFailed') as string)
        }
      } else {
        return false
      }
    })
  }

  updateCertificatePhoto(url: string, id: any, ossKey: string) {
    this.photoCertificate = url
    this.settings.certificatePhoto = id
    this.settings.certificatePhotoKey = ossKey
    ;(this.$refs.licensePhoto as any).clearValidate()
  }

  back() {
    this.$router.push({ path: '/finance/receipt' })
  }

  jumpAuth() {
    this.$router.push({ path: '/settings/authentication' })
  }
}
