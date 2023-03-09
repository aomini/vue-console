import Vue from 'vue'
import Component from 'vue-class-component'
import BannerCard from './component/banner-card'
import ExtensionActivedCard from './component/extension-actived-card'
import { user } from '@/services'
import './style/actived-extension.less'
const { swiper, swiperSlide } = require('vue-awesome-swiper')

@Component({
  components: {
    swiper: swiper,
    'swiper-slide': swiperSlide,
    'banner-card': BannerCard,
    'extension-actived-card': ExtensionActivedCard,
  },
  template: `
    <div v-loading="loading">
    <div class="page-extension-list">
      <div class="home-header">
        <div class="heading-dark-16">{{ $t('My extension products') }}</div>
      </div>
      <div class="extension-list">
        <el-row :gutter="24">
          <el-col :span="8" v-for="(item, productsIndex) of activeExtensions">
            <extension-card :key="productsIndex + 1" :extension='item' :label="item.label"/>
          </el-col>
        </el-row>
      </div>
    </div>
    </div>`,
})
export default class ActivedExtension extends Vue {
  loading = false
  isOversea = user?.info?.company?.area !== 'CN'
  activeExtensions = []
  featuredExtensions = []
  featuredSwiperOption = {
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  }
  activatedSwiperOption = {
    slidesPerView: 4,
    slidesPerGroup: 4,
    spaceBetween: 20,
    observer: true,
    observeParents: true,
    pagination: {
      el: '.swiper-pagination-actived',
      clickable: true,
    },
  }

  async mounted() {
    this.loading = true
    if (this.isOversea) {
      await Promise.all([this.getFeaturedVendorList(), this.getExtensionList()])
    } else {
      await Promise.all([this.getFeaturedVendorList(), this.getActiveVendorList()])
    }
    this.loading = false
  }
  async getFeaturedVendorList() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        isFeatured: 1,
      },
    })
    this.featuredExtensions = res.data.data
  }
  async getExtensionList() {
    const res = await this.$http.get('/api/v2/marketplace/extension/list', {
      params: {
        status: 1,
      },
    })
    this.activeExtensions = res.data?.rows
  }
  async getActiveVendorList() {
    const ret = await this.$http.get('/api/v2/marketplace/company/purchased')
    const products = ret.data.rows
    this.activeExtensions = products.filter((item: any) => !!item)
  }
  getI18NValue(en: string, cn: string) {
    return this.$i18n.locale === 'en' ? en : cn
  }
}
