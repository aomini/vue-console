import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import './Authentication.less'
import {
  checkPersonID,
  checkChineseName,
  checkHMCard,
  checkTWCard,
  checkHMIDCard,
  checkTWIDCard,
} from '@/utils/utility'
import { certificateTypeOptions } from '@/models/authentication'
const bgQrcode = require('@/assets/image/bg-qrcode.png')
const QRCode = require('qrcodejs2')

@Component({
  components: {},
  template: `
    <div class="page personAuth">
      <div class="module-title">{{ $t('PersonAuthTitle') }}</div>
      <div class="card p-4 my-3 auth-container">
        <div class="d-flex flex-column pb-2 align-items-baseline border-bottom">
          <label v-html='$t("PersonAuthTips")'></label>
        </div>
        <div v-show="!isShowQrCode" class="form">
          <div class="submit-form">
            <el-form :model="identity" :rules="rules" label-width="200px" ref="submit-form">
              <el-form-item :label="$t('CertificateType')" prop="type" class="input-item">
                <el-select v-model="identity.certType">
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
              <!-- <el-form-item :label="$t('PhotoWithFace')" class="input-item" prop="facePhotoId" :inline-message="true" ref="faceId">
              <AvatarUpload @updateURL="updatePhotoFaceURL"></AvatarUpload>
              <span class="tip-line">{{ $t('PhoneFaceTip') }}</span>
            </el-form-item>
            <el-form-item :label="$t('PhotoBack')" class="input-item" prop="backPhotoId" :inline-message="true" ref="backId">
              <AvatarUpload @updateURL="updatePhotoBackURL"></AvatarUpload>
              <span class="tip-line">{{ $t('PhoneBackTip') }}</span>
            </el-form-item> -->
            </el-form>
          </div>
          <div class="m-auto word-wrapper">
            <input type="checkbox" v-model="infoPromised" />
            <span class="ml-1"> {{ $t('PromiseInfo') }} </span>
          </div>
          <div class="m-auto">
            <div class="edit-line">
              <console-button
                class="console-btn-primary"
                size="lg"
                :disabled="disableBtn || !infoPromised"
                @click="save"
              >
                {{ $t('Submit') }}
              </console-button>
              <console-button class="console-btn-white" size="lg" @click="back">
                {{ $t('Cancel') }}
              </console-button>
            </div>
          </div>
        </div>
        <div v-show="isShowQrCode">
          <div class="alipay">
            <div id="qrcode" class="qrcode"></div>
            <img :src="bgQrcode" />
            <div class="title">{{ $t('AliPay Open') }}</div>
            <console-button size="lg" @click="identityRes">{{ $t('Certification Complete') }}</console-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class PersonAuth extends Vue {
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
  originIdentity: any = {}
  photoBack = ''
  photoFace = ''
  disableBtn = false
  infoPromised = false
  isShowQrCode = false
  qrcodeObj: any = {}
  bgQrcode = bgQrcode
  certificateTypeOptions = certificateTypeOptions

  async created() {
    await this.getIdentity()
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data && identity.data.authStatus === -1) {
        this.$router.push({ path: '/' })
      }
      if (identity.data && (user.info.company.source === 2 || user.info.company.country !== 'CN')) {
        this.$router.push({ path: '/' })
      }
      if (identity.data && identity.data.identity && identity.data.identity.name) {
        this.originIdentity = identity.data.identity
        if (this.originIdentity.status !== 2) {
          this.back()
        }
      }
    } catch (e) {
      console.info(e)
    }
  }
  updatePhotoBackURL(url: string, id: any, ossKey: string) {
    this.photoBack = url
    this.identity.backPhotoId = id
    this.identity.backPhotoKey = ossKey
    ;(this.$refs.backId as any).clearValidate()
  }
  updatePhotoFaceURL(url: string, id: any, ossKey: string) {
    this.photoFace = url
    this.identity.facePhotoId = id
    this.identity.facePhotoKey = ossKey
    ;(this.$refs.faceId as any).clearValidate()
  }
  back() {
    this.$router.push({ path: '/settings/authentication' })
  }
  save() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        // this.disableBtn = true
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
            this.qrcodeObj.makeCode(res.data)
            this.isShowQrCode = !this.isShowQrCode
          }
          currentMsg.close()
        } catch (e) {
          this.disableBtn = false
          currentMsg.close()
          if (e.response && e.response.data.code === 9007) {
            this.$message.error(this.$t('IDNumberExist') as string)
          } else {
            this.$message.error(this.$t('SubmitFailed') as string)
          }
        }
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
      window.location.href = `${window.location.origin}/settings/authentication`
    } else {
      this.$message.error(this.$t('Certification Fail') as string)
      this.$router.push({ path: '/settings/authentication' })
    }
  }
  mounted() {
    this.qrcodeObj = new QRCode('qrcode', {
      width: 300,
      height: 300,
      correctLevel: QRCode.CorrectLevel.H,
    })
  }
}
