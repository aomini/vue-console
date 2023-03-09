import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './style.less'

@Component({
  template: ` <el-dialog
    :visible.sync="visible"
    :title="$t('Data Sharing Permission Request and Terms of Service')"
    :show-close="false"
    width="700px"
  >
    <div class="extension-confirm-dialog">
      <div class="tip">
        {{ $t('To activate this extension, we need to share the following data with') }}
        <span style="color:#191919;">{{ vendorName }}</span> {{ $t('and have acceptance of their Terms of Service.') }}
      </div>
      <div class="content">
        <div class="item">
          <div class="label" :class="$i18n.locale === 'en' ? 'width-100' : 'width-50' ">{{ $t('Your name:') }}</div>
          <div class="value">
            <div>{{ userInfo.displayName }}</div>
          </div>
        </div>
        <div class="item" style="margin-top: 10px; margin-bottom: 10px;">
          <div class="label" :class="$i18n.locale === 'en' ? 'width-100' : 'width-50' ">{{ $t('Your email:') }}</div>
          <div class="value">
            <div>{{ userInfo.email }}</div>
          </div>
        </div>
        <div class="item">
          <div class="label" :class="$i18n.locale === 'en' ? 'width-100' : 'width-50' ">{{ $t('Phone number:') }}</div>
          <div class="value">
            <div>{{ userInfo.phoneNumber }}</div>
          </div>
        </div>
      </div>
      <div class="tip" v-if="$i18n.locale === 'en'">
        This data and usage will be subject to <span>{{ vendorName }}</span
        >’s <span @click="goToPolicyPage" style="color: #099DFD; cursor: pointer;">Privacy Policy</span> and
        <span @click="goToTermServicePage" style="color: #099DFD; cursor: pointer;">Terms of Service</span>, and the
        <a href="https://www.agora.io/en/extensions-marketplace/terms-of-use" target="_blank"
          >Agora Extensions Marketplace Terms of Use.</a
        >
      </div>
      <div class="tip" v-else>
        这些数据将受<span>{{ vendorName }}</span
        >的<span @click="goToTermServicePage" style="color: #099DFD; cursor: pointer;">服务条款</span>和<span
          @click="goToPolicyPage"
          style="color: #099DFD; cursor: pointer;"
          >隐私政策</span
        >的约束。
      </div>
      <div class="tip" v-if="$i18n.locale === 'en'">
        <el-checkbox v-model="checked"></el-checkbox>
        By checking this box, I agree to {{ vendorName }}’s Terms of Service and Privacy Policy, and the Agora
        Extensions Marketplace Terms of Use.
      </div>
      <div class="tip" v-else>
        <el-checkbox v-model="checked"></el-checkbox>
        通过选中此框，我同意 {{ vendorName }} 的服务条款和隐私政策。
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{ $t('Cancel') }}</el-button>
      <el-button type="primary" @click="agree">{{ $t('Confirm') }}</el-button>
    </span>
  </el-dialog>`,
})
export default class ExtensionConfirmDialog extends Vue {
  @Prop({ default: false, type: Boolean }) readonly visible!: boolean
  @Prop({ type: Function }) readonly confirm!: () => any
  @Prop({ type: Function }) readonly cancel!: () => any
  @Prop({ type: String }) readonly tosUrl!: string
  @Prop({ type: String }) readonly privacyPolicyUrl!: string
  @Prop({ type: Object }) readonly userInfo!: Record<string, any>
  @Prop({ type: String }) readonly vendorName!: string
  checked = false
  agree() {
    if (this.checked) {
      this.confirm()
    } else {
      this.$message.error(this.$t('please agree to the Privacy Policy first') as string)
    }
  }
  goToTermServicePage() {
    window.open(this.tosUrl?.split(' ')[0])
  }
  goToPolicyPage() {
    if (this.privacyPolicyUrl) {
      window.open(this.privacyPolicyUrl)
    } else if (this.tosUrl?.split(' ').length > 1) {
      window.open(this.tosUrl?.split(' ')[1])
    }
  }
}
