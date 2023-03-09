import Vue from 'vue'
import Component from 'vue-class-component'
import '../settings/authentication/Authentication.less'
import {
  checkChineseName,
  checkPersonID,
  checkHMCard,
  checkTWCard,
  checkHMIDCard,
  checkTWIDCard,
} from '@/utils/utility'
import { Prop } from 'vue-property-decorator'
import { certificateTypeOptions } from '@/models/authentication'
const bgQrcode = require('@/assets/image/bg-qrcode.png')
const QRCode = require('qrcodejs2')

@Component({
  components: {},
  template: `
    <el-dialog
      :title='$t("AuthPageTitle")'
      :visible.sync="showAuthDialog"
      :close-on-click-modal="false"
      :before-close="() => $emit('closeAuthDialog')"
    >
      <div slot="title">
        <span v-if="!isShowQrCode">{{ $t('AuthPageTitle') }} </span>
        <span v-else @click="backToFormView" class="cursor-pointer"
          ><i class="el-icon-arrow-left"></i>{{ $t('Back') }}
        </span>
      </div>
      <div class="page personAuth" v-loading="loading">
        <div class="d-flex flex-column align-items-baseline" v-if="!isShowQrCode">
          <label v-html='$t("PersonAuthDialogTips")'></label>
        </div>
        <div v-show="!isShowQrCode" class="form">
          <div class="auth-form">
            <el-form :model="identity" :rules="rules" label-width="35%" ref="submit-form">
              <el-form-item :label="$t('CertificateType')" prop="type" class="input-item">
                <el-select size="mini" v-model="identity.certType">
                  <el-option
                    v-for="item in certificateTypeOptions"
                    :key="item"
                    :label="$t('CertificateTypeOptions.' + item)"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('PersonFullName')" prop="name" class="input-item">
                <el-input v-model="identity.name" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item :label="$t('CertificateNumber')" prop="number" class="input-item">
                <el-input v-model="identity.number"></el-input>
              </el-form-item>
              <el-form-item>
                <div class="identity-hint">
                  {{ $t('IdentityNumberHint') }}
                  <span class="cursor-pointer" @click="openSupport">{{ $t('Contact Support Online') }}</span>
                </div>
              </el-form-item>
              <el-form-item>
                <console-button class="console-btn-primary mt-50" :disabled="disableBtn" @click="save">
                  {{ $t('SubmitAuthButton') }}
                </console-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div v-show="isShowQrCode">
          <div class="alipay">
            <div id="qrcode" class="qrcode" ref="qrcode"></div>
            <div class="title">{{ $t('AliPay Open') }}</div>
            <console-button
              class="console-btn-primary mt-30"
              id="onboarding-certification-complete"
              @click="identityRes"
            >
              <span id="onboarding-certification-complete">
                {{ $t('Certification Complete') }}
              </span>
            </console-button>
          </div>
        </div>
      </div>
    </el-dialog>
  `,
})
export default class PersonalAuthDialog extends Vue {
  validateName = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (!checkChineseName(value)) {
      return callback(new Error(this.$t('NameWarn') as string))
    }
    callback()
  }
  validateNumber = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (
      (this.identity.certType === 'IDENTITY_CARD' && !checkPersonID(value)) ||
      (this.identity.certType === 'HOME_VISIT_PERMIT_HK_MC' && !checkHMCard(value)) ||
      (this.identity.certType === 'HOME_VISIT_PERMIT_TAIWAN' && !checkTWCard(value)) ||
      (this.identity.certType === 'RESIDENCE_PERMIT_HK_MC' && !checkHMIDCard(value)) ||
      (this.identity.certType === 'RESIDENCE_PERMIT_TAIWAN' && !checkTWIDCard(value))
    ) {
      return callback(new Error(this.$t('InvalidCertificateNumber') as string))
    }
    callback()
  }

  @Prop({ default: false, type: Boolean }) readonly showAuthDialog!: boolean
  identity = {
    certType: 'IDENTITY_CARD',
    name: '',
    number: '',
    facePhotoId: '',
    backPhotoId: '',
    facePhotoKey: '',
    backPhotoKey: '',
  }
  rules = {
    name: [{ required: true, validator: this.validateName, trigger: 'blur' }],
    number: [{ required: true, validator: this.validateNumber, trigger: 'blur' }],
    facePhotoId: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'change' }],
    backPhotoId: [{ required: true, message: this.$t('RequiredMissing'), trigger: 'change' }],
  }
  disableBtn = false
  isShowQrCode = false
  qrcodeObj: any = {}
  bgQrcode = bgQrcode
  loading = false
  certificateTypeOptions = certificateTypeOptions

  save() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        // this.disableBtn = true
        this.loading = true
        const currentMsg = this.$message.info(this.$t('InSubmitting') as any)
        try {
          const res = await this.$http.post('/api/v2/identity/person', {
            certType: this.identity.certType,
            name: this.identity.name,
            IdNumber: this.identity.number,
          })
          if (res.data.code && res.data.code === 1000) {
            this.$message.error(this.$t('You have authenticated and do not need to verify again') as string)
          } else {
            this.qrcodeObj = new QRCode('qrcode', {
              width: 300,
              height: 300,
              correctLevel: QRCode.CorrectLevel.H,
            })
            this.qrcodeObj.clear()
            this.qrcodeObj.makeCode(res.data)
            this.isShowQrCode = !this.isShowQrCode
          }
          currentMsg.close()
        } catch (e) {
          console.info(e)
          this.disableBtn = false
          currentMsg.close()
          if (e.response && e.response.data.code === 9007) {
            this.$message.error(this.$t('IDNumberExist') as string)
          } else {
            this.$message.error(this.$t('SubmitFailed') as string)
          }
        }
        this.loading = false
      } else {
        return false
      }
    })
  }
  async identityRes() {
    const res = await this.$http.post('/api/v2/identity/person/result', {
      name: this.identity.name,
      IdNumber: this.identity.number,
    })
    if (res.data && res.data.code === 0) {
      this.$message.success(this.$t('Certification Success') as string)
      this.$emit('authSuccess')
    } else {
      this.$message.error(this.$t('Certification Fail') as string)
    }
  }

  backToFormView() {
    this.isShowQrCode = false
    ;(this.$refs['qrcode'] as any).innerHTML = ''
  }

  openSupport() {
    this.$emit('closeAuthDialog')
    ;(window as any).easemobim.bind({
      configId: '6adf4aaf-8607-4f93-a628-4abe942e9f9f',
      hide: true,
    })
  }
}
