import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import BannerCard from './component/banner-card'
import ExtensionCard from './component/extension-card'
import './style/paas.less'
import { Watch } from 'vue-property-decorator'
import { I18nTitle, ExtensionType } from '@/models/paasModels'
const NoDataImg = require('@/assets/image/pic-nodata.png')
const { swiper, swiperSlide } = require('vue-awesome-swiper')

@Component({
  components: {
    swiper: swiper,
    'swiper-slide': swiperSlide,
    'banner-card': BannerCard,
    'extension-card': ExtensionCard,
  },
  template: `
    <div v-loading="loading">
    <div class="page-extension-list">
      <div class="home-header">
        <div class="heading-dark-16">{{ $t(I18nTitle[type]) }}</div>
      </div>
      <div class="extension-list" v-if="allExtensions.length || activeExtensions.length">
        <el-row :gutter="24" v-if="type === 'own'">
          <el-col :lg="8" :md="12" :xl="6" v-for="(item, productsIndex) of activeExtensions">
            <extension-card :key="productsIndex + 1" :extension='item' :location="type" />
          </el-col>
        </el-row>
        <el-row :gutter="24" v-else>
          <el-col :lg="8" :md="12" :xl="6" v-for="(item, productsIndex) of allExtensions">
            <extension-card :key="productsIndex + 1" :extension='item' :location="type" />
          </el-col>
        </el-row>
      </div>
      <div class="m-auto text-center" v-else>
        <img width="240px" :src="NoDataImg" />
        <div class="empty-text mt-2 text-center">{{ $t('No Extension') }}</div>
      </div>
    </div>
    </div>
  `,
})
export default class HomeView extends Vue {
  loading: boolean = false
  isOversea = user?.info?.company?.area !== 'CN'
  normalExtensions: any[] = []
  overSeaExtensions: any[] = []
  allExtensions: any[] = []
  activeExtensions: any[] = []
  index: number = 0
  type: string = this.$route.params.type
  I18nTitle: any = I18nTitle
  NoDataImg = NoDataImg

  mounted() {
    this.init()
  }

  @Watch('$route')
  async onRouteChange(to: any) {
    if (to.params.type) {
      this.type = to.params.type
      await this.init()
    }
  }

  async init() {
    this.loading = true
    this.allExtensions = []
    switch (this.type) {
      case 'own':
        await this.getActiveExtension()
        break
      case 'all':
        await this.getAllExtensions()
        break
      case 'plugin':
        await this.getNormalExtensions()
        this.allExtensions = this.normalExtensions[1].data
        break
      case 'IOT':
        await this.getIotExtensions()
        this.allExtensions = this.normalExtensions[2].data
        break
      case 'SaaS':
        await this.getSaasExtensions()
        this.allExtensions = this.normalExtensions[3].data
        break
      case 'plugin_videoModifiers':
        await this.getNormalExtensions()
        this.allExtensions = this.normalExtensions[1].data.filter(
          (item: any) => item.category2 === ExtensionType['Plugin VideoModifiers']
        )
        break
      case 'plugin_transcriptions':
        await this.getNormalExtensions()
        this.allExtensions = this.normalExtensions[1].data.filter(
          (item: any) => item.category2 === ExtensionType['Plugin Transcriptions']
        )
        break
      case 'plugin_contentModeration':
        await this.getNormalExtensions()
        this.allExtensions = this.normalExtensions[1].data.filter(
          (item: any) => item.category2 === ExtensionType['Plugin ContentModeration']
        )
        break
      case 'plugin_others':
        await this.getNormalExtensions()
        this.allExtensions = this.normalExtensions[1].data.filter(
          (item: any) => item.category2 === ExtensionType['Plugin Others']
        )
        break
      case 'VideoEffects':
        await this.getVideoModifiersExtensions()
        this.allExtensions = this.overSeaExtensions[2].data
        break
      case 'AudioEffects':
        await this.getAudioModifiersExtensions()
        this.allExtensions = this.overSeaExtensions[3].data
        break
      case 'VideoModifiers':
        this.$router.replace({ path: '/marketplace/list/VideoEffects' })
        break
      case 'AudioModifiers':
        this.$router.replace({ path: '/marketplace/list/AudioEffects' })
        break
      case 'Transcriptions':
        await this.getTranscriptionsExtensions()
        this.allExtensions = this.overSeaExtensions[4].data
        break
      case 'ContentModeration':
        await this.getContentModerationExtensions()
        this.allExtensions = this.overSeaExtensions[5].data
        break
    }
    this.loading = false
  }

  async getAllExtensions() {
    if (this.isOversea) {
      await Promise.all([
        this.getToolsExtensions(),
        this.getMediaExtensions(),
        this.getVideoModifiersExtensions(),
        this.getAudioModifiersExtensions(),
        this.getTranscriptionsExtensions(),
        this.getContentModerationExtensions(),
      ])
      this.allExtensions = []
      this.overSeaExtensions.forEach((extension) => {
        this.allExtensions = this.allExtensions.concat(extension.data)
      })
    } else {
      await Promise.all([this.getSaasExtensions(), this.getNormalExtensions(), this.getIotExtensions()])
      this.allExtensions = []
      this.normalExtensions.forEach((extension) => {
        this.allExtensions = this.allExtensions.concat(extension.data)
      })
      this.allExtensions = _.sortBy(this.allExtensions, (item) => {
        return -item.updatedAt
      })
      this.allExtensions = _.sortBy(this.allExtensions, (item) => {
        return item.displayPriority
      })
    }
  }

  async getNormalExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType['Component/Plugin'],
      },
    })
    this.normalExtensions[1] = {
      label: 'Component/Plugin',
      data: res.data.data,
    }
  }
  async getIotExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType.IOT,
      },
    })
    this.normalExtensions[2] = {
      label: 'IOT',
      data: res.data.data,
    }
  }
  async getSaasExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType.SaaS,
      },
    })
    this.normalExtensions[3] = {
      label: 'SaaS',
      data: res.data.data,
    }
  }
  async getMediaExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType['Video and Audio Modifiers'],
      },
    })
    this.overSeaExtensions[0] = {
      label: 'Video and Audio Modifiers',
      data: res.data.data,
    }
  }
  async getToolsExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType.Tools,
      },
    })
    this.overSeaExtensions[1] = {
      label: 'Tools',
      data: res.data.data,
    }
  }
  async getVideoModifiersExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType['VideoModifiers'],
      },
    })
    this.overSeaExtensions[2] = {
      label: 'Video Effects',
      data: res.data.data,
    }
  }
  async getAudioModifiersExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType['AudioModifiers'],
      },
    })
    this.overSeaExtensions[3] = {
      label: 'Audio Effects',
      data: res.data.data,
    }
  }
  async getTranscriptionsExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType['Transcriptions'],
      },
    })
    this.overSeaExtensions[4] = {
      label: 'Transcriptions',
      data: res.data.data,
    }
  }
  async getContentModerationExtensions() {
    const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
      params: {
        category: ExtensionType['ContentModeration'],
      },
    })
    this.overSeaExtensions[5] = {
      label: 'Content Moderation',
      data: res.data.data,
    }
  }
  getI18NValue(en: string, cn: string) {
    return this.$i18n.locale === 'en' ? en : cn
  }

  async getActiveExtension() {
    if (this.isOversea) {
      await this.getExtensionList()
    } else {
      await this.getActiveVendorList()
    }
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
}
