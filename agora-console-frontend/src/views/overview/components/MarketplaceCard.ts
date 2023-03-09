import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import ExtensionCard from '@/views/paas/component/extension-card'
import { user } from '@/services'
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  components: {
    'extension-card': ExtensionCard,
  },
  template: `
    <div class="card-box overview-card-1">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03">{{ $t('Extension Marketplace') }}</span>
        </div>
        <div class="header-right" @click="getMore">
          <span class="heading-dark-03">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div class="card-content marketplace" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="12" v-for="(item, productsIndex) in products" :key="item.serviceName">
            <extension-card :key="productsIndex + 1" :extension='item' location="overview" />
          </el-col>
        </el-row>
      </div>
    </div>
  `,
})
export default class MarketplaceCard extends Vue {
  loading: boolean = false
  products: any[] = []
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  isCN = user.info.company.area === 'CN'
  rowListSort = ['hive', 'banuba', 'voicemod', 'Bose']

  mounted() {
    this.getVendors()
  }

  async getVendors() {
    this.loading = true
    try {
      const res = await this.$http.get('/api/v2/marketplace/vendor/list', {
        params: {
          isFeatured: 1,
        },
      })
      if (res.data?.data) {
        this.products = res.data.data
        if (!this.isCN) {
          this.sortProducts()
        }
      }
    } catch (e) {}
    this.loading = false
  }

  sortProducts() {
    for (const item of this.rowListSort) {
      const product = this.products.find((product) => {
        return product.serviceName === item
      })
      const index = this.products.findIndex((product) => {
        return product.serviceName === item
      })
      if (product) {
        this.products.splice(index, 1)
        this.products.unshift(product)
      }
    }
  }

  getProductTitle(item: any) {
    return this.$i18n.locale === 'en' ? item.productEnName : item.productCnName
  }
  getProductDesc(item: any) {
    return this.$i18n.locale === 'en' ? item.productEnDescription : item.productCnDescription
  }

  learnMore(serviceName: string) {
    if (serviceName === 'faceunity_ai') {
      this.$router.push({ path: '/marketplace/license/introduce', query: { serviceName: serviceName } })
    } else {
      this.$router.push({ path: '/marketplace/introduce', query: { serviceName: serviceName } })
    }
  }

  getMore() {
    this.$router.push({ path: '/marketplace' })
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'marketplace-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
