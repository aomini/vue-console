import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import ProductCard from '@/views/onboardingNew/ProductCard'
import { ProductType } from '@/models/ProductModels'
import { productConfig } from '@/services/product'
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  components: {
    'product-card': ProductCard,
  },
  template: `
    <div class="card-box resource-card border-8">
      <div class="card-header border-bottom pb-10 mb-24">
        <div class="header-title">
          <span class="heading-dark-03 f-16">{{ $t('HelpDocs') }}</span>
        </div>
        <div class="header-right" @click="goToDocs">
          <span class="heading-dark-03">{{ $t('AllDocs') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div>
        <div class="resource-content">
          <el-row :gutter="24">
            <el-col :sm="12" :md="8" :lg="8" :xl="6" v-for="(product, productsIndex) of productList">
              <product-card
                size="medium"
                :key="productsIndex + 1"
                :product="product"
                @click.native="openDocs(product)"
              ></product-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  `,
})
export default class ResourceCard extends Vue {
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  productList: ProductType[] = []

  async mounted() {
    await this.getProductCategory()
  }

  goToDocs() {
    window.open(`https://docs.agora.io/cn`, '_blank')
  }

  async getProductCategory() {
    const fullProductList = (await productConfig.getProductMetaData()) as ProductType[]
    this.productList = fullProductList.filter((item) => item.showOverview)
  }

  openDocs(product: ProductType) {
    window.open(product.platform[0].docCn, '_blank')
  }
}
