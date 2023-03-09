import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './style.less'
import { user } from '@/services'

@Component({
  template: `
    <div class="banner-card">
      <div class="banner-logo">
        <img width="240px" :src="bannerImage" />
      </div>
      <div class="banner-desc-box">
        <img width="100px" style="margin-bottom: 15px;" :src="bannerLogo" v-if="!isOversea" />
        <div class="banner-extension-name" @click="goToDetails">{{ extensionDesc }}</div>
        <div class="banner-learn-more" @click="goToDetails">
          <el-button type="text"> {{ $t('LearnMore') }}</el-button>
          <img width="14px" :src="getIconUrl(goIcon)" />
        </div>
      </div>
    </div>
  `,
})
export default class BannerCard extends Vue {
  @Prop({ default: '', type: String }) readonly extensionName!: string
  @Prop({ default: '', type: String }) readonly bannerImage!: string
  @Prop({ default: '', type: String }) readonly bannerLogo!: string
  @Prop({ default: '', type: String }) readonly extensionDesc!: string
  @Prop({ default: '', type: String }) readonly logoPhotoUrl!: string
  @Prop({ default: '', type: String }) readonly productPhotoUrl!: string
  @Prop({ default: '', type: String }) readonly serviceName!: string
  isOversea = user?.info?.company?.area !== 'CN'
  goIcon = 'icon-go-blue'
  bannerImgUrl = {
    aliyun_voice_async_scan: 'paas-banner-ali',
    hivoice_translation: 'paas-banner-yzs',
    hivoice_oral: 'paas-banner-yzs',
  }
  bannerIconUrl = {
    aliyun_voice_async_scan: 'banner-logo-ali',
    hivoice_translation: 'banner-logo-yzs',
    hivoice_oral: 'banner-logo-yzs',
  }
  getIconUrl(icon: string) {
    if (!icon) return
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./' + icon + '.png')
  }
  getImgUrl(img: string) {
    if (!img) return
    const images = require.context('@/assets/image/', false, /\.png$/)
    return images('./' + img + '.png')
  }
  goToDetails() {
    if (this.isOversea) {
      this.$router.push({ path: '/marketplace/extension/introduce', query: { serviceName: this.serviceName } })
    } else if (this.serviceName === 'faceunity_ai') {
      this.$router.push({ path: '/marketplace/license/introduce', query: { serviceName: this.serviceName } })
    } else {
      this.$router.push({ path: '/marketplace/introduce', query: { serviceName: this.serviceName } })
    }
  }
}
