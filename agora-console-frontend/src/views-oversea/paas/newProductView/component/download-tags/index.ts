import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `
    <div class="download-tags">
      <div v-if="!isServerPlatform">
        <div class="label-type title">
          <div class="w-105">{{ $t('Platform') }}</div>
          <div class="w-150" v-if="sdkDownloadUrls.ios || demoDownloadUrls.ios">iOS</div>
          <div class="w-150" v-if="sdkDownloadUrls.android || demoDownloadUrls.android">Android</div>
          <div class="w-150" v-if="sdkDownloadUrls.web || demoDownloadUrls.web">Web</div>
        </div>
        <div class="label-type">
          <div class="w-105">{{ $t('SDK Download') }}</div>
          <div class="w-150" v-if="sdkDownloadUrls.ios || demoDownloadUrls.ios">
            <div class="w-150 download-tag" v-if="sdkDownloadUrls.ios" @click="openUrl(sdkDownloadUrls.ios)">
              {{ $t('Download') }}
            </div>
          </div>
          <div class="w-150" v-if="sdkDownloadUrls.android || demoDownloadUrls.android">
            <div class="w-150 download-tag" v-if="sdkDownloadUrls.android" @click="openUrl(sdkDownloadUrls.android)">
              {{ $t('Download') }}
            </div>
          </div>
          <div class="w-150" v-if="sdkDownloadUrls.web || demoDownloadUrls.web">
            <div class="w-150 download-tag" v-if="sdkDownloadUrls.web" @click="openUrl(sdkDownloadUrls.web)">
              {{ $t('Download') }}
            </div>
          </div>
        </div>
        <div class="label-type">
          <div class="w-105">{{ $t('Demo Download') }}</div>
          <div class="w-150" v-if="sdkDownloadUrls.ios || demoDownloadUrls.ios">
            <div class="w-150 download-tag" v-if="demoDownloadUrls.ios" @click="openUrl(demoDownloadUrls.ios)">
              {{ $t('Download') }}
            </div>
          </div>
          <div class="w-150" v-if="sdkDownloadUrls.android || demoDownloadUrls.android">
            <div class="w-150 download-tag" v-if="demoDownloadUrls.android" @click="openUrl(demoDownloadUrls.android)">
              {{ $t('Download') }}
            </div>
          </div>
          <div class="w-150" v-if="sdkDownloadUrls.web || demoDownloadUrls.web">
            <div class="w-150 download-tag" v-if="demoDownloadUrls.web" @click="openUrl(demoDownloadUrls.web)">
              {{ $t('Download') }}
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div>This is a server-side extension, no downloads required.</div>
        <div>Please follow the user guide or contact sales for support.</div>
      </div>
    </div>
  `,
})
export default class DownloadTags extends Vue {
  @Prop({ default: () => {}, type: Object }) readonly demoDownloadUrls!: Record<string, unknown>
  @Prop({ default: () => {}, type: Object }) readonly sdkDownloadUrls!: Record<string, unknown>
  @Prop({ default: '', type: String }) readonly platform!: string

  get isServerPlatform() {
    return this.platform.includes('Server')
  }

  agoraSDKUrls = {
    android: 'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.0.0-beta.2_FULL.zip',
    ios: 'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.0.0-beta.2_FULL.zip',
    mac: 'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.0.0-beta.2_FULL.zip',
    windows: 'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.0.0-beta.2_FULL.zip',
    web: 'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_12_2_FULL.zip',
  }

  openUrl(url: string) {
    window.open(url, '_blank')
  }
}
