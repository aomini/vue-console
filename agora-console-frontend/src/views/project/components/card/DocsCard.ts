import Vue from 'vue'
import Component from 'vue-class-component'
import { productConfig } from '@/services/product'
import { productCategoryList, ProductDemo, ProductPlatform, ProductType } from '@/models/ProductModels'
import { Prop, Watch } from 'vue-property-decorator'
import DemoCard from '@/views/project/components/quickStart/DemoCard'
import { user } from '@/services/user'
// import { Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {
    'demo-box': DemoCard,
  },
  template: `
    <div>
      <el-card class="mb-24 border-8">
        <div slot="header">
          <span>{{ $t('QuickStartDocs') }} / {{ productTitle }}</span>
        </div>
        <div>
          <a
            v-for="item in platformList"
            :key="item.nameCn"
            :href="item.docCn"
            class="d-inline-block cursor-pointer docs-card__tag"
            target="_blank"
          >
            {{ item.nameCn }}
          </a>
        </div>
      </el-card>
      <el-card class="mb-24 border-8" v-if="demoList.length">
        <div slot="header">
          <span>{{ $t('Download') }}</span>
        </div>
        <div>
          <el-row v-for="(item, demoIndex) of demoList">
            <demo-box
              :key="demoIndex + 1"
              :demo="item"
              :class="demoIndex < demoList.length - 1 ? 'border-bottom' : ''"
            ></demo-box>
          </el-row>
        </div>
      </el-card>
    </div>
  `,
})
export default class DocsCard extends Vue {
  @Prop({ default: '', type: String }) readonly defaultProduct!: string
  platformList: ProductPlatform[] = []
  productTypeList: ProductType[] = []
  demoList: ProductDemo[] = []
  productTitle: string = ''
  isCNLang = user.info.language === 'chinese'

  @Watch('defaultProduct')
  onDefaultProductChange() {
    this.preparePlatformList()
  }

  async mounted() {
    this.productTypeList = (await productConfig.getProductMetaData()) as ProductType[]
    this.preparePlatformList()
  }

  preparePlatformList() {
    let productType = this.productTypeList.filter((item: ProductType) => item.productTypeId === this.defaultProduct)[0]
    if (!productType) {
      productType = this.productTypeList.filter((item: ProductType) => item.category === productCategoryList[0])[0]
    }
    this.platformList = productType.platform
    this.productTitle = this.isCNLang ? productType.nameCn : productType.nameEn
    this.demoList = []
    if (productType.demo) {
      this.demoList.push(...productType.demo)
    }
    if (productType.platform[0].demo) {
      this.demoList.push(...productType.platform[0].demo)
    }
  }
}
