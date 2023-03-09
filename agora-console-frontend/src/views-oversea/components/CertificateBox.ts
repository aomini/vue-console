import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import PasswordInput from '@/components/PasswordInput'
const IconCertificate = require('@/assets/icon/icon-certificate.png')
import './CertificateBox.less'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: `
    <div class="card">
      <div class="d-flex">
        <img height="60px" :src="IconCertificate" />
        <div class="ml-14 w-100">
          <div v-if='type === "primary"' class="heading-dark-03">{{ $t('Primary certificate') }}</div>
          <div v-if='type === "secondary"' class="heading-dark-03">{{ $t('Secondary certificate') }}</div>
          <div v-if='type === "none"' class="heading-dark-03">{{ $t('No certificate') }}</div>
          <div class="d-flex justify-between heading-dark-03">
            <div class="heading-grey-05">{{ enable ? $t('Enabled') : $t('Disabled') }}</div>
            <span v-if="!enable" class="cert-box-action-btn link" @click="enableCert()"> {{ $t('Enable') }} </span>
            <span v-if='type === "secondary" && enable' class="cert-box-action-btn" @click="switchCert()">
              {{ $t('Set as Primary') }}
            </span>
            <span v-if="allowDelete && enable" class="cert-box-action-btn link" @click="deleteCert()">
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
    </div>
  `,
})
export default class CertificateBox extends Vue {
  @Prop({ default: '', type: String }) readonly type!: string
  @Prop({ default: false, type: Boolean }) readonly enable!: boolean
  @Prop({ default: false, type: Boolean }) readonly allowDelete!: boolean
  @Prop({ default: '', type: String }) readonly keyValue!: string
  @Prop({ default: null, type: Function }) readonly enableCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly switchCert!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly deleteCert!: () => Promise<void>

  IconCertificate = IconCertificate
}
