import Vue from 'vue'
import Component from 'vue-class-component'
import '../onboarding/Onboarding.less'
import PersonalAuthDialog from '@/views/onboardingNew/PersonalAuthDialog'
import { productConfig } from '@/services/product'
import ProductCard from './ProductCard'
import SolutionCard from './SolutionCard'
import { user } from '@/services'
import { ProductSource, ProductType, productCategoryList } from '@/models/ProductModels'

@Component({
  components: {
    'product-card': ProductCard,
    'solution-card': SolutionCard,
    'person-auth-dialog': PersonalAuthDialog,
  },
  template: `
    <div class="onboarding-view">
      <div class="heading-dark-24 onboarding-title mb-20">{{ $t('welcome') }}</div>
      <div class="project-module">
        <div class="module-item-title project-module-header">{{ $t('ProductTitle') }}</div>
        <div class="module-content" v-loading="loading">
          <el-tabs v-model="activeName" @tab-click="switchTab">
            <el-tab-pane
              v-for="item in productCategoryList"
              :label="$t(item)"
              :name="item"
              class="category-content mb-20 mt-20"
            >
              <el-row :gutter="24" v-if="activeName === item">
                <el-col :sm="12" :md="8" :lg="6" :xl="6" v-for="(product, productsIndex) of getProducts(item)">
                  <product-card
                    v-if="item === 'Start From Scratch'"
                    :key="productsIndex + 1"
                    :product="product"
                    :selected="product.productTypeId === selectedProduct.productTypeId"
                    @click.native="selectProduct(product)"
                  ></product-card>
                  <solution-card
                    v-else
                    :key="productsIndex + 1"
                    :product="product"
                    :selected="product.productTypeId === selectedProduct.productTypeId"
                    @click.native="selectProduct(product)"
                  ></solution-card>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
          <el-button type="primary" @click="nextStep" id="onboarding-create-project">
            <span id="onboarding-create-project">&#x2192; {{ $t('CreateProjectTitle') }}</span>
          </el-button>
        </div>
      </div>
      <person-auth-dialog
        :showAuthDialog="showAuthDialog"
        @closeAuthDialog="showAuthDialog = false"
        @authSuccess="createOnboardingProject"
      ></person-auth-dialog>
    </div>
  `,
})
export default class OnboardingView extends Vue {
  activeName = 'Start From Scratch'
  productCategoryList: string[] = []
  productList: ProductType[] = []
  loading = false
  personAuth = true
  showAuthDialog = false
  selectedProduct: ProductType | any = {}
  useCaseData = []

  getProducts(productCategory: string) {
    return this.productList.filter((item: any) => item.category === productCategory)
  }

  async mounted() {
    this.loading = true
    await this.getIdentity()
    await this.getUsecaseList()
    this.productList = (await productConfig.getProductMetaData()) as ProductType[]
    this.getProductCategory()
    await this.initSelectedProduct()
    this.loading = false
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (
        user.info.company.source !== 2 &&
        user.info.company.country == 'CN' &&
        (!('authStatus' in identity.data) || (identity.data.authStatus !== 1 && identity.data.authStatus !== -1))
      ) {
        this.personAuth = false
      }
    } catch (e) {
      console.info(e)
    }
  }

  nextStep() {
    if (!this.personAuth) {
      this.showAuthDialog = true
    } else {
      this.createOnboardingProject()
    }
  }

  async createOnboardingProject() {
    try {
      this.loading = true
      const useCaseId = this.selectedProduct.useCaseId
      const usecase = this.useCaseData.find((item: any) => {
        return item.useCaseId === useCaseId
      })
      if (!usecase) {
        this.$message.error(this.$t('GerneralError') as string)
        return
      }
      const internalIndustryMetadataNameEn = usecase['internalIndustryMetadataNameEn'] || ''
      const useCaseNameEn = usecase['useCaseNameEn'] || ''
      const internalIndustry = usecase['internalIndustryId'] || ''
      const ret = await this.$http.post('/api/v2/onboardingProject', {
        projectName: 'My First Agora Project',
        useCaseId: useCaseId,
        internalIndustry: internalIndustry,
        internalIndustryMetadataNameEn: internalIndustryMetadataNameEn,
        useCaseNameEn: useCaseNameEn,
        productTypeNameEn: this.selectedProduct.nameEn,
      })
      this.loading = false
      const projectId = ret.data.projectId
      await this.setOnboardingStatus()
      await productConfig.updateVendorRelationWithProduct(
        projectId,
        this.selectedProduct.productTypeId,
        this.selectedProduct.platform[0].platformId
      )
      this.$router.push({ name: 'editProject', params: { id: projectId } })
    } catch (e) {
      if (e.response.data.code === 6011) {
        this.$message.error(this.$t('ProjectNameExists') as string)
      } else if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ProjectCreatedFail') as string)
      } else if (e.response.data.code === 6109) {
        this.$message.error(this.$t('OnboardingProjectCreated') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
      this.loading = false
    }
  }

  selectProduct(product: ProductType) {
    this.selectedProduct = product
  }

  async initSelectedProduct() {
    const source = (await productConfig.getRegistSource()) as ProductSource
    // 如果有注册来源，根据 source.product 选择对应产品
    if (source.appid) {
      const appid = source.appid,
        product = source.product
      this.selectedProduct = this.productList.filter((item: ProductType) => {
        const ssoSource = item.ssoSource.find((source: any) => source.appid === appid)
        return ssoSource?.product === product
      })[0]
    }
    if (this.selectedProduct && this.selectedProduct.category) {
      this.activeName = this.selectedProduct.category
      return
    }
    this.selectedProduct = this.productList[0]
  }

  // TODO(SUN): Use Case 的获取抽象成公共方法
  async getUsecaseList() {
    try {
      const ret = await this.$http.get('/api/v2/project/usecases')
      const useCaseData: any = []
      ret.data.forEach((item: any) => {
        if (item.hasSector === 0) {
          for (const usecase of item.children) {
            usecase['internalIndustryId'] = item.internalIndustryId
            usecase['internalIndustryMetadataNameEn'] = item.internalIndustryMetadataNameEn
          }
          useCaseData.push(...item.children)
        } else {
          for (const sector of item.children) {
            for (const usecase of sector.children) {
              usecase['internalIndustryId'] = item.internalIndustryId
              usecase['sectorId'] = sector.sectorId
            }
            useCaseData.push(...sector.children)
          }
        }
      })
      this.useCaseData = useCaseData
    } catch (error) {}
  }

  async getProductCategory() {
    productCategoryList.forEach((category) => {
      if (this.productList.filter((product: ProductType) => product.category === category).length > 0) {
        this.productCategoryList.push(category)
      }
    })
  }

  switchTab(tab: any) {
    this.selectedProduct = this.getProducts(tab.name)[0]
  }

  async setOnboardingStatus() {
    try {
      await this.$http.post('/api/v2/company/field', { fieldType: 'onboarding' })
    } catch (e) {}
  }
}
