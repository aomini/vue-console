import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
import { ExtensionType } from '../../../../models/paasModels'
import './style.less'

@Component({
  template: `
    <div
      class="extension-card"
      @click="learnMore(extension.serviceName)"
      :style="{ height: location === 'overview' ? '80px' : '120px', padding: location === 'overview' ? '12px 16px' : '16px'  }"
    >
      <template v-if="location === 'overview'">
        <div class="logo">
          <div
            class="logo-bg"
            :style="{ backgroundImage: 'url(' + extension.productPhotoUrl + ')', width: '56px', height: '56px' }"
            v-if="extension.productPhotoUrl"
          ></div>
        </div>
        <div class="text" style="text-align: left; padding: 4px 0;">
          <div class="title" style="font-size: 14px; margin-bottom: 8px;">{{ getProductTitle(extension) }}</div>
          <div class="name" style="font-size: 13px; margin-bottom: 0px">{{ getVendorName(extension) }}</div>
        </div>
      </template>
      <template v-else>
        <div class="logo">
          <div class="logo-bg" :style="{ backgroundImage: 'url(' + extension.productPhotoUrl + ')' }"></div>
        </div>
        <div class="text" :class="[ isOversea ? 'text-oversea' : '' ]">
          <div class="title">{{ getProductTitle(extension) }}</div>
          <div class="name">{{ getVendorName(extension) }}</div>
          <div
            class="label"
            :style="{ color: labelColorList[ExtensionType[extension.category]], borderColor: labelColorList[ExtensionType[extension.category]] }"
            v-if="!isOversea && extension.category"
          >
            {{ $t(ExtensionType[extension.category]) }}
          </div>
        </div>
      </template>
    </div>
  `,
})
export default class ExtensionCard extends Vue {
  @Prop({ default: [], type: Object }) readonly extension!: Record<string, unknown>
  @Prop({ default: '', type: String }) readonly location?: String

  index = 0
  isOversea = user?.info?.company?.area !== 'CN'
  cardColourList = ['#EFF7FD', '#EFF5FD', '#EFF2FD', '#F4F7FF']
  labelColorList = {
    'Component/Plugin': '#1890FF',
    IOT: '#36CFC9',
    SaaS: '#FA8C16',
  }
  ExtensionType = ExtensionType

  getProductTitle(item: { productEnName: string; productCnName: string }) {
    return item.productCnName
  }

  getVendorName(item: { enName: string; cnName: string }) {
    return item.cnName
  }
  learnMore(serviceName: string) {
    if (this.isOversea) {
      this.$router.push({ path: '/marketplace/extension/introduce', query: { serviceName: serviceName } })
    } else if (this.location === 'own') {
      this.$router.push({ path: '/marketplace/actived/detail', query: { serviceName } })
    } else if (this.extension.payment === 'license') {
      this.$router.push({ path: '/marketplace/license/introduce', query: { serviceName: serviceName } })
    } else {
      this.$router.push({ path: '/marketplace/introduce', query: { serviceName: serviceName } })
    }
  }

  created() {
    if (this.index % 2 === 0) {
      this.cardColourList.reverse()
    }
  }
}
