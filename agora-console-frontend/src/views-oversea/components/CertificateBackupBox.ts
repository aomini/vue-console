import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import PasswordInput from '@/components/PasswordInput'
import { CertificateBackupStatus } from '@/common/project'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
const IconCertificate = require('@/assets/icon/icon-certificate.png')
import './CertificateBox.less'

@Component({
  components: {
    'password-input': PasswordInput,
    'two-factor-confirm': TwoFactorConfirm,
  },
  template: `
    <div class="card">
      <div class="d-flex">
        <img height="60px" :src="IconCertificate" />
        <div class="ml-14 w-100">
          <div v-if='type === "primary"' class="heading-dark-03">{{ $t('Primary certificate') }}</div>
          <div v-if='type === "secondary"' class="heading-dark-03">{{ $t('Secondary certificate') }}</div>
          <div v-if='type === "none"' class="heading-dark-03">{{ $t('No certificate') }}</div>
          <div class="heading-grey-05">
            {{ enable || backupCertStatus === CertificateBackupStatus.ENABLED ? $t('Enabled') : $t('Disabled') }}
          </div>
          <div
            class="d-flex justify-between heading-dark-03"
            style="display: flex; justify-content: space-between; align-items: center;"
          >
            <el-switch
              :value="backupCertStatus || (Number(enable) ? CertificateBackupStatus.ENABLED : CertificateBackupStatus.DISABLED)"
              :active-value="CertificateBackupStatus.ENABLED"
              :inactive-value="CertificateBackupStatus.DISABLED"
              @change="changeStatus"
            >
            </el-switch>
            <span
              v-if='type === "secondary" && enable && backupCertStatus !== CertificateBackupStatus.DISABLED'
              class="cert-box-action-btn"
              @click="switchCert()"
            >
              {{ $t('Set as Primary') }}
            </span>
            <span
              v-if="allowDelete && backupCertStatus === CertificateBackupStatus.DISABLED"
              class="cert-box-action-btn link"
              @click="deleteCert()"
            >
              {{ $t('Delete') }}
            </span>
          </div>
        </div>
      </div>
      <password-input
        v-if='type !== "none" && !!keyValue'
        :passwordValue="keyValue"
        :isDisabled="true"
      ></password-input>
      <div v-if="isTwoFactorVerificationVisible" style="line-height: 12px;">
        <two-factor-confirm
          v-if="isTwoFactorVerificationVisible"
          :afterSuccess="() => handleSuccessBack()"
          :afterFail="() => {}"
          :cancelVerification="() => isTwoFactorVerificationVisible = false"
        ></two-factor-confirm>
      </div>
    </div>
  `,
})
export default class CertificateBox extends Vue {
  @Prop({ default: '', type: String }) readonly type!: string
  @Prop({ default: false, type: Boolean }) readonly enable!: boolean
  @Prop({ default: false, type: Boolean }) readonly allowDelete!: boolean
  @Prop({ default: '', type: String }) readonly keyValue!: string
  @Prop({ default: '', type: Number }) readonly backupCertStatus!: number
  @Prop({ default: null, type: Function }) readonly enableCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly switchCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly deleteCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly updateBackupCertStatus!: (status: number) => Promise<void>

  IconCertificate = IconCertificate
  CertificateBackupStatus = CertificateBackupStatus
  isTwoFactorVerificationVisible = false
  async handleSuccessBack() {
    await this.updateBackupCertStatus(CertificateBackupStatus.DISABLED)
    this.isTwoFactorVerificationVisible = false
  }
  changeStatus() {
    if (
      (this.backupCertStatus === CertificateBackupStatus.DISABLED ||
        this.backupCertStatus === CertificateBackupStatus.DEFAULT) &&
      !this.enable
    ) {
      this.$confirm(
        this.$t('EnableSecondaryCertificateDesc') as string,
        this.$t('Enable secondary certificate') as string,
        {
          confirmButtonText: this.$t('Confirm') as string,
          cancelButtonText: this.$t('Cancel') as string,
          dangerouslyUseHTMLString: true,
        }
      ).then(async () => {
        await this.updateBackupCertStatus(CertificateBackupStatus.ENABLED)
      })
    } else {
      this.$confirm(
        this.$t('DisableSecondaryCertificateDesc') as string,
        this.$t('Disable secondary certificate') as string,
        {
          confirmButtonText: this.$t('Confirm') as string,
          cancelButtonText: this.$t('Cancel') as string,
        }
      ).then(() => {
        this.isTwoFactorVerificationVisible = true
      })
    }
  }
}
