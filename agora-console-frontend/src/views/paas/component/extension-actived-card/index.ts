import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
import './style.less'

@Component({
  template: ` <div class="extension-actived-card" @click="learnMore(activeExtension.serviceName)">
    <div class="logo-container">
      <div class="logo">
        <img width="70px" height="70px" :src="activeExtension.productPhotoUrl" v-if="activeExtension.productPhotoUrl" />
        <div class="tip">
          {{ $t('View') }}
          <img width="18px" :src="getImgUrl('icon-go')" />
        </div>
      </div>
    </div>
    <div class="card-text">
      <div class="extension-title">{{ getExtensionTitle(activeExtension) }}</div>
      <div class="extension-name">{{ getExtensionName(activeExtension) }}</div>
    </div>
  </div>`,
})
export default class ExtensionActivedCard extends Vue {
  @Prop({ default: [], type: Object }) readonly activeExtension!: Record<string, unknown>
  isOversea = user?.info?.company?.area !== 'CN'
  getExtensionTitle(item: { productEnName: string; productCnName: string }) {
    return this.$i18n.locale === 'en' ? item.productEnName : item.productCnName
  }
  getExtensionName(item: { enName: string; cnName: string }) {
    return this.$i18n.locale === 'en' ? item.enName : item.cnName
  }
  learnMore(serviceName: string) {
    if (this.isOversea) {
      this.$router.push({ path: '/marketplace/extension/oversea/introduce', query: { serviceName } })
    } else {
      this.$router.push({ path: '/marketplace/actived/detail', query: { serviceName } })
    }
  }
  getImgUrl(icon: string) {
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./' + icon + '.png')
  }
}
