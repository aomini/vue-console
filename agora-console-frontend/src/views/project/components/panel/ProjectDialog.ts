import Vue from 'vue'
import Component from 'vue-class-component'
import { updateProject } from '@/services'
import { productCategoryList, ProductType } from '@/models/ProductModels'
import { productConfig } from '@/services/product'
import ProductCard from '@/views/onboardingNew/ProductCard'
import { Prop } from 'vue-property-decorator'
import { ProjectFormData } from '@/models'

@Component({
  components: {
    'product-card': ProductCard,
  },
  template: `
    <el-dialog
      :title='type === "create" ? $t("CreateProjectTitle") : $t("EditProjectTitle")'
      :visible.sync="showDialog"
      width="800px"
      @close="closeDialog"
    >
      <el-form :model="projectFormData" :rules="rules" :label-width="$i18n.locale === 'en' ? '100px' : '80px'">
        <el-form-item :label="$t('Stage')" prop="stage" v-if="type === 'edit'">
          <el-radio-group v-model="projectFormData.stage" class="wd-align-baseline">
            <el-radio :label="3"> {{ $t('Testing') }}</el-radio>
            <el-radio :label="2"> {{ $t('Live') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('ProjectName')" prop="projectName">
          <el-input
            class="content-input"
            ref="createInput"
            size="mini"
            :maxlength="25"
            :placeholder='$t("InputPlaceHolder")'
            v-model="projectFormData.projectName"
          >
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('UseCase')" prop="product">
          <el-radio-group v-model="projectFormData.productCategory" class="wd-align-baseline">
            <el-radio v-for="item in productCategoryList" :key="item" :label="item">{{ $t(item) }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="24" style="margin-left: 68px; margin-top: -22px">
          <el-col
            :sm="12"
            :md="8"
            :lg="8"
            :xl="8"
            v-for="(product, productsIndex) of getProducts(projectFormData.productCategory)"
          >
            <product-card
              size="mini"
              :key="productsIndex + 1"
              :product="product"
              :selected="product.productTypeId === projectFormData.product?.productTypeId"
              @click.native="selectProduct(product)"
            ></product-card>
          </el-col>
        </el-row>
        <el-form-item :label="$t('ProjectAuthentication')" prop="mode" v-if="type === 'create' && !onboarding">
          <el-select v-model="projectFormData.mode" size="mini" style="width: 560px">
            <el-option value="1" :label="$t('TokenOption')">
            </el-option>
            <el-option value="2" :label="$t('AppIdOption')"></el-option>
          </el-select>
          <a :href="$t('IntroLink')" target="_blank"> {{ $t('Whatsthis') }} </a>
          <div v-if="projectFormData.mode === '1'">{{ $t('TokenOptionDescription') }} <span> &#128516</span></div>
          <div v-else>{{ $t('AppIdOptionDescription') }}</div>
        </el-form-item>
      </el-form>
      <div class="d-flex flex-column">
        <div class="ml-auto text-right">
          <console-button class="console-btn-size-md console-btn-white" @click="$emit('closeDialog')">
            {{ $t('Cancel') }}
          </console-button>
          <console-button
            class="console-btn-size-md console-btn-primary"
            :disabled="disableSubmit || loading"
            :loading="loading"
            @click="type === 'create' ? onClickSubmit() : onClickSave()"
          >
            {{ $t('Confirm') }}
          </console-button>
        </div>
      </div>
    </el-dialog>
  `,
})
export default class ProjectDialog extends Vue {
  @Prop({ default: false, type: Boolean }) readonly showDialog!: boolean
  @Prop({ default: false, type: Boolean }) readonly onboarding!: boolean
  @Prop({ default: () => {}, type: Object }) readonly vendorInfo!: any
  @Prop({ default: 'create', type: String }) readonly type!: string

  projectFormData: ProjectFormData = {
    projectName: '',
    useCase: '',
    productCategory: '',
    product: null,
    stage: 0,
    mode: '1',
  }
  rules = {
    projectName: [{ required: true, trigger: 'blur', message: this.$t('ProjectNameRequired') as string }],
    mode: [{ required: true, trigger: 'blur' }],
  }
  fullProductList: ProductType[] = []
  productCategoryList: string[] = []
  loading = false
  disableSubmit = false
  useCaseData = []

  async mounted() {
    if (this.type === 'edit') {
      this.projectFormData.projectName = this.vendorInfo.name
      this.projectFormData.stage = this.vendorInfo.stage
    }
    await this.getProductCategory()
    if (this.onboarding) {
      await this.getUsecaseList()
    }
  }

  async getProductCategory() {
    this.fullProductList = (await productConfig.getProductMetaData()) as ProductType[]
    this.productCategoryList = []
    productCategoryList.forEach((category) => {
      if (this.fullProductList.filter((product: ProductType) => product.category === category).length > 0) {
        this.productCategoryList.push(category)
      }
    })
    if (this.vendorInfo && this.vendorInfo.productTypeId) {
      this.projectFormData.product = this.fullProductList.find(
        (item) => item.productTypeId === this.vendorInfo.productTypeId
      )!
      this.projectFormData.productCategory = this.projectFormData.product.category
    } else {
      this.projectFormData.productCategory = this.productCategoryList[0]
      this.projectFormData.product = this.fullProductList.filter(
        (item) => item.category === this.projectFormData.productCategory
      )[0]
    }
  }

  async onClickSave() {
    const name = this.projectFormData.projectName.trim()
    this.projectFormData.mode =
      !this.vendorInfo.vendorSignal || this.vendorInfo.vendorSignal.needToken === 0 ? '1' : '0'
    const pattern = new RegExp("[`~#$^*=|':;',\\[\\]./?~#￥……&*——|‘；：”“'。，、？]")
    if (pattern.test(name)) {
      return this.$message.error(this.$t('ProjectNameSpecialChar') as string)
    }
    if (name.length < 1) {
      this.$message.error(this.$t('ProjectNameRequired') as string)
      return
    }
    this.loading = true
    try {
      await updateProject(
        this.$route.params.id,
        name,
        this.projectFormData.mode === '1',
        this.projectFormData.stage,
        this.projectFormData.product!.useCaseId
      )
      if (this.projectFormData.product!.productTypeId !== this.vendorInfo.productTypeId) {
        await productConfig.updateVendorRelationWithProduct(
          this.$route.params.id,
          this.projectFormData.product!.productTypeId,
          this.projectFormData.product!.platform[0].platformId
        )
      }

      this.$message({
        message: this.$t('UpdateProjectSuccess') as string,
        type: 'success',
      })
      this.$emit('updateProject')
    } catch (e) {
      if (e.response.data.code === 6011) {
        this.$message.error(this.$t('ProjectNameExists') as string)
      } else if (e.response.data.code === 6009) {
        this.$message.error(this.$t('FailedUpdateProject') as string)
      } else if (e.response.data.code === 6006) {
        this.$message.error(this.$t('AccountBlockedProject') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
    }
    this.loading = false
  }

  async createOnboardingProject() {
    try {
      this.loading = true
      const name = this.projectFormData.projectName.trim()
      const pattern = new RegExp("[`~#$^*=|':;',\\[\\]./?~#￥……&*——|‘；：”“'。，、？]")
      if (pattern.test(name)) {
        return this.$message.error(this.$t('ProjectNameSpecialChar') as string)
      }
      if (!this.projectFormData.product) {
        return this.$message.error(this.$t('UseCaseRequired') as string)
      }
      const useCaseId = this.projectFormData.product.useCaseId
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
        projectName: name,
        useCaseId: useCaseId,
        internalIndustry: internalIndustry,
        internalIndustryMetadataNameEn: internalIndustryMetadataNameEn,
        useCaseNameEn: useCaseNameEn,
        productTypeNameEn: this.projectFormData.product.nameEn,
      })
      this.loading = false
      const projectId = ret.data.projectId
      await productConfig.updateVendorRelationWithProduct(
        projectId,
        this.projectFormData.product.productTypeId,
        this.projectFormData.product.platform[0].platformId
      )
      this.$emit('projectCreated', projectId)
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

  async onClickSubmit() {
    if (this.onboarding) {
      await this.createOnboardingProject()
      return
    }
    const name = this.projectFormData.projectName.trim()
    const pattern = new RegExp("[`~#$^*=|':;',\\[\\]./?~#￥……&*——|‘；：”“'。，、？]")
    if (pattern.test(name)) {
      return this.$message.error(this.$t('ProjectNameSpecialChar') as string)
    }
    if (name.length < 1) {
      return this.$message.error(this.$t('ProjectNameRequired') as string)
    }
    if (!this.projectFormData.product) {
      return this.$message.error(this.$t('UseCaseRequired') as string)
    }
    this.disableSubmit = true
    const useCaseId = this.projectFormData.product.useCaseId
    try {
      const project = await this.$http.post('/api/v2/project', {
        projectName: name,
        enableCertificate: this.projectFormData.mode === '1',
        useCaseId: useCaseId,
      })
      productConfig.updateVendorRelationWithProduct(
        project.data.projectId,
        this.projectFormData.product.productTypeId,
        this.projectFormData.product.platform[0].platformId
      )
      this.$emit('projectCreated')
      this.$message({
        message: this.$t('ProjectCreatedSuccess') as string,
        type: 'success',
      })
    } catch (e) {
      if (e.response.data.code === 6011) {
        this.$message.error(this.$t('ProjectNameExists') as string)
      } else if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ProjectCreatedFail') as string)
      } else if (e.response.data.code === 6006) {
        this.$message.error(this.$t('AccountBlockedProject') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
    }
    this.disableSubmit = false
  }

  getProducts() {
    return this.fullProductList.filter((item: any) => item.category === this.projectFormData.productCategory)
  }

  selectProduct(product: ProductType) {
    this.projectFormData.product = product
  }

  closeDialog() {
    this.resetProjectFormData()
    this.$emit('closeDialog')
  }

  resetProjectFormData() {
    if (this.type === 'create') {
      this.projectFormData = {
        projectName: '',
        useCase: '',
        mode: '1',
        productCategory: this.productCategoryList[0],
        product: this.fullProductList.filter((item) => item.category === this.productCategoryList[0])[0],
        stage: 0,
      }
    } else {
      this.projectFormData.projectName = this.vendorInfo.name
      this.projectFormData.stage = this.vendorInfo.stage
      this.getProductCategory()
    }
  }
}
