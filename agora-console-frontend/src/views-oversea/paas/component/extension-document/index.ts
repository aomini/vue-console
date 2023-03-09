import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `<div class="extension-document">
    <div class="doc-box">
      <div class="card doc-card" :class="apiUrl ? '' : 'disabled'" @click="goToApi">
        <img width="58" :src='getImgUrl("icon-doc-api")' />
        <div class="doc-text-box">
          <div class="doc-text-title">{{ $t('Implementation Guides') }}</div>
        </div>
      </div>
      <div class="card doc-card" :class="sdkDownLoadUrl ? '' : 'disabled'" @click="goToSdkDownload">
        <img width="58" :src='getImgUrl("icon-sdk-download")' />
        <div class="doc-text-box">
          <div class="doc-text-title">{{ $t('SDK Download') }}</div>
        </div>
      </div>
      <div class="card doc-card" :class="demoDownLoadUrl ? '' : 'disabled'" v-if="isCN" @click="goToDemoDownload">
        <img width="58" :src='getImgUrl("icon-demo-download")' />
        <div class="doc-text-box">
          <div class="doc-text-title">{{ $t('Demo Download') }}</div>
        </div>
      </div>
      <div class="card doc-card" :class="supportUrl ? '' : 'disabled'" @click="goToSupport">
        <img width="58" :src='getImgUrl("icon-doc-support")' />
        <div class="doc-text-box">
          <div class="doc-text-title">{{ $t('Paas Support') }}</div>
        </div>
      </div>
    </div>
  </div>`,
})
export default class ExtensionDocument extends Vue {
  @Prop({ default: '', type: String }) readonly apiUrl!: string
  @Prop({ default: '', type: String }) readonly supportUrl!: string
  @Prop({ default: '', type: String }) readonly sdkDownLoadUrl!: string
  @Prop({ default: '', type: String }) readonly demoDownLoadUrl!: string
  @Prop({ default: '', type: String }) readonly vendorName!: string
  @Prop({ default: false, type: Boolean }) readonly isCN!: boolean
  getImgUrl(icon: string) {
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./' + icon + '.png')
  }
  goToApi() {
    this.apiUrl && window.open(this.apiUrl)
  }
  goToSupport() {
    this.supportUrl && window.open(this.supportUrl)
  }
  goToSdkDownload() {
    this.sdkDownLoadUrl && window.open(this.sdkDownLoadUrl)
  }
  goToDemoDownload() {
    this.demoDownLoadUrl && window.open(this.demoDownLoadUrl)
  }
}
