import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import PasswordInput from '@/components/PasswordInput'
import './ProductSelector.less'
import { productConfig } from '@/services/product'
import { ProductType, ProductPlatform, productCategoryList } from '@/models/ProductModels'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: `
    <div class="product-selector">
      <el-select size="mini" v-model="selectedProduct" @change="handleProductSelect" value-key="productTypeId">
        <!--        <span slot="prefix" class="iconfont product-logo" :class="[ 'icon' + selectedProduct?.icon ]"></span>-->
        <el-option-group v-for="group in productCategoryList" :key="group.label" :label="group.label">
          <el-option
            v-for="item in group.productCategory"
            :key="item.productTypeId"
            :value="item"
            :label="$i18n.locale === 'en' ? item.nameEn : item.nameCn"
          >
            <!--            <span class="iconfont product-logo" :class="[ 'icon' + item.icon ]"></span>-->
            {{ $i18n.locale === 'en' ? item.nameEn : item.nameCn }}
          </el-option>
        </el-option-group>
      </el-select>
      <el-select
        size="mini"
        v-model="selectedPlatform"
        :disabled="!selectedProduct"
        @change="handlePlatformSelect"
        value-key="platformId"
      >
        <el-option
          v-for="item in platformList"
          :key="item.platformId"
          :value="item"
          :label="$i18n.locale === 'en' ? item.nameEn : item.nameCn"
        >
        </el-option>
      </el-select>
    </div>
  `,
})
export default class productSelector extends Vue {
  @Prop({ default: '', type: String }) readonly projectId!: string
  @Prop({ default: '', type: String }) readonly defaultProduct!: string
  @Prop({ default: '', type: String }) readonly defaultPlatform!: string

  selectedProduct: ProductType | any = null
  selectedPlatform: ProductPlatform | any = null
  platformId = ''
  productCategoryList: any = []
  platformList: ProductPlatform[] = []
  productTypeList: ProductType[] = []

  async mounted() {
    this.productTypeList = (await productConfig.getProductMetaData()) as ProductType[]
    this.getProductCategory()
    this.initSelectedProduct()
  }

  handleProductSelect(item: ProductType) {
    this.platformList = item.platform
    this.selectedPlatform = this.platformList[0]
    if (this.selectedPlatform) {
      this.changeQuickStart()
    }
    productConfig.updateVendorRelationWithProduct(
      this.projectId,
      this.selectedProduct?.productTypeId,
      this.selectedPlatform?.platformId
    )
  }

  handlePlatformSelect() {
    this.changeQuickStart()
    productConfig.updateVendorRelationWithProduct(
      this.projectId,
      this.selectedProduct?.productTypeId,
      this.selectedPlatform?.platformId
    )
  }

  initSelectedProduct() {
    if (this.defaultProduct) {
      this.selectedProduct = this.productTypeList.filter(
        (item: ProductType) => item.productTypeId === this.defaultProduct
      )[0]
      this.platformList = this.selectedProduct.platform
      this.selectedPlatform = this.platformList.filter(
        (item: ProductPlatform) => item.platformId === this.defaultPlatform
      )[0]
    } else {
      this.selectedProduct = this.productTypeList[0]
      this.platformList = this.selectedProduct.platform
      this.selectedPlatform = this.selectedProduct.platform[0]
    }
    this.changeQuickStart()
  }

  getProductCategory() {
    productCategoryList.forEach((category) => {
      if (this.productTypeList.filter((product: ProductType) => product.category === category).length > 0) {
        this.productCategoryList.push({
          label: category,
          productCategory: [],
        })
      }
    })
    for (let i = 0; i < this.productCategoryList.length; i++) {
      this.productCategoryList[i].productCategory = this.productTypeList.filter(
        (product: ProductType) => product.category === this.productCategoryList[i].label
      )
    }
  }

  changeQuickStart() {
    this.$emit(
      'changeQuickStart',
      this.$i18n.locale === 'en' ? this.selectedPlatform.docEn : this.selectedPlatform.docCn,
      [...this.selectedProduct.demo, ...this.selectedPlatform.demo]
    )
  }
}
