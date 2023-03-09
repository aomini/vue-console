import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import PasswordInput from '@/components/PasswordInput'
import './CertificateBox.less'
import moment from 'moment'
import { TokenType } from '@/models/TokenModels'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: `
    <div class="card certificate-box">
      <div class="d-flex align-center justify-between mb-10 certificate-box-header">
        <span class="d-flex align-center">
          <span class="mr-8 iconfont iconicon-certificate heading-grey-13"></span>
          <span v-if='type === "primary"' class="heading-grey-05">{{ $t('Primary certificate') }}</span>
          <span v-if='type === "secondary"' class="heading-grey-05">{{ $t('Secondary certificate') }}</span>
          <span v-if='type === "none"' class="heading-grey-05">{{ $t('No certificate') }}</span>
        </span>
        <span v-if='type === "secondary" && enable' class="cert-box-action-btn" @click="switchCert()">
          {{ $t('Set as Primary') }}
        </span>
        <span v-if="allowDelete && enable" class="cert-box-action-btn link" @click="deleteCert()">
          {{ $t('Delete') }}
        </span>
      </div>
      <div class="d-flex justify-between heading-dark-03 mb-10">
        <span class="heading-light-05">{{ $t('Status') }}: {{ enable ? $t('Enabled') : $t('Disabled') }}</span>
        <el-switch
          :value="enable ? true : false"
          :active-value="true"
          :inactive-value="false"
          @change="changeStatus"
          :disabled="enable"
        >
        </el-switch>
      </div>
      <password-input
        v-if='type !== "none" && !!keyValue'
        :passwordValue="keyValue"
        :isDisabled="true"
      ></password-input>
    </div>
  `,
})
export default class CertificateBox extends Vue {
  @Prop({ default: '', type: String }) readonly type!: string
  @Prop({ default: false, type: Boolean }) readonly enable!: boolean
  @Prop({ default: false, type: Boolean }) readonly allowDelete!: boolean
  @Prop({ default: '', type: String }) readonly keyValue!: string
  @Prop({ default: false, type: Boolean }) readonly accountBlocked?: boolean
  @Prop({ default: null, type: Function }) readonly enableCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly switchCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly deleteCert!: () => Promise<void>

  channelName = ''
  channelNameChanged = false
  accessToken: string = ''
  expiredDate: string = ''
  tokenPopoverVisible: boolean = false
  tokenLoading = false

  async onClickGenerate() {
    if (!this.channelName) {
      this.$message.warning(this.$t('EmptyChannel') as string)
      return
    }
    const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$')
    if (!pattern.test(this.channelName)) {
      this.$message.warning(this.$t('InvalidChannel') as string)
      return
    }
    try {
      this.tokenLoading = true
      const token = await this.$http.get('/api/v2/token', {
        params: { id: this.$route.params.id, channel: this.channelName, type: TokenType.TempToken },
      })
      this.accessToken = token.data?.token
      this.expiredDate = moment.utc(moment.unix(token.data.expiredTs)).format('LLL')
      this.$message.success(this.$t('TokenGenerated') as string)
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 6014) {
        this.$message.warning(this.$t('EmptyChannel') as string)
      } else if (errorCode === 6015) {
        this.$message.warning(this.$t('InvalidChannel') as string)
      } else {
        this.$message.error(this.$t('FailedGetToken') as string)
      }
    }
    this.channelNameChanged = false
    this.tokenLoading = false
  }

  async changeStatus() {
    await this.enableCert()
  }

  copyToken() {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
  }

  select(event: any) {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
    event.currentTarget.select()
  }
}
