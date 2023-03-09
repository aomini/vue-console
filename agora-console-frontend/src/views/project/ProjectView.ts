import Vue from 'vue'
import Component from 'vue-class-component'
import { getLifeCycle, user } from '@/services'
import ProjectTableView from '@/views/project/projectTableView'
import MyPagiation from '@/components/MyPagination'
import { productCategoryList, ProductType } from '@/models/ProductModels'
import { productConfig } from '@/services/product'
import ProductCard from '@/views/onboardingNew/ProductCard'
import { ProjectFormData } from '@/models'

@Component({
  components: {
    'project-table': ProjectTableView,
    'my-pagination': MyPagiation,
    'product-card': ProductCard,
  },
  template: `
    <div v-loading="loading">
      <div class="page-v3">
        <div v-if="isCocos" class="module-title">
          <span>
            {{ $t('CocosProjectMessage1') }}
            <a :href="$t('CocosDocLink')" target="_blank"> {{ $t('CocosProjectMessage2') }} </a>
            {{ $t('CocosProjectMessage3') }}
          </span>
        </div>
        <div class="d-flex justify-between mb-20 pb-20 border-bottom">
          <div class="d-flex">
            <el-select class="w-180 mr-2" size="medium" v-model="condition.stage" @change="changeProjectStage">
              <el-option :key="0" :label="$t('All')" :value="0"></el-option>
              <el-option :key="2" :label="$t('LiveEnv')" :value="2"></el-option>
              <el-option :key="3" :label="$t('TestingEnv')" :value="3"></el-option>
            </el-select>
            <el-select class="w-180 mr-10 ml-10" size="medium" v-model="condition.status" @change="changeProjectStatus">
              <el-option :key="1" :label="$t('Active')" :value="1"></el-option>
              <el-option :key="2" :label="$t('Inactive')" :value="2"></el-option>
            </el-select>
            <el-input
              :placeholder='$t("CreateProjectPlaceholder")'
              ref="searchProject"
              size="medium"
              v-model="condition.key"
              @keyup.enter.native="changePage(1)"
              @change="onChange"
            >
              <i slot="prefix" class="el-input__icon el-icon-search cursor-pointer" @click="changePage(1)"></i>
            </el-input>
          </div>
          <!-- cocos用户隐藏创建项目 -->
          <el-tooltip
            :content='$t("AppLimitReached")'
            v-if="!isCocos && !accountBlocked && writePermission"
            placement="top"
            :disabled="!disableCreate"
          >
            <div>
              <console-button
                class="console-btn-primary console-btn-size-md"
                @click="showOverlayPopup"
                :disabled="disableCreate"
              >
                <span class="el-icon-plus"> {{ $t('CreateProject') }} </span>
              </console-button>
            </div>
          </el-tooltip>
          <el-tooltip
            :content='$t("AccountBlocked")'
            v-if="!isCocos && accountBlocked && writePermission"
            placement="top"
          >
            <div>
              <console-button class="console-btn-size-md" disabled> {{ $t('Create') }} </console-button>
            </div>
          </el-tooltip>
        </div>
        <project-table
          :tableData="tableData"
          :onSort="onClickSort"
          :isCocos="isCocos"
          :accountBlocked="accountBlocked"
        ></project-table>
        <div class="mt-2 text-right">
          <my-pagination v-model="condition" @change="changePage"></my-pagination>
        </div>
      </div>
      <el-dialog :title='$t("CreateProjectTitle")' :visible.sync="showOverlay" width="800px" @close="onClickCancel">
        <el-form :model="projectFormData" :rules="rules" :label-width="$i18n.locale === 'en' ? '100px' : '80px'">
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
            <el-col :sm="12" :md="8" :lg="8" :xl="8" v-for="(product, productsIndex) of getProducts(projectFormData.productCategory)">
              <product-card
                  size="mini"
                  :key="productsIndex + 1"
                  :product="product"
                  :selected="product.productTypeId === projectFormData.product?.productTypeId"
                  @click.native="selectProduct(product)"
              ></product-card>
            </el-col>
          </el-row>
          <el-form-item :label="$t('ProjectAuthentication')" prop="mode">
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
            <console-button class="console-btn-size-md console-btn-white" @click="onClickCancel">
              {{ $t('Cancel') }}
            </console-button>
            <console-button
              class="console-btn-size-md console-btn-primary"
              :disabled="disableSubmit"
              @click="onClickSubmit"
            >
              {{ $t('CreateProject') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class ProjectView extends Vue {
  isCocos = user.info.isCocos
  writePermission = user.info.permissions['ProjectManagement'] > 1
  accountBlocked = false
  showOverlay = false
  disableCreate = false
  loading = false
  projectCount = null
  tableData = []
  disableSubmit = false
  appLimit = 10
  condition: any = {
    page: 1,
    limit: 10,
    key: undefined,
    sortProp: 'stage',
    sortOrder: 'DESC',
    status: 1,
    stage: 0,
    total: 0,
  }
  projectFormData: ProjectFormData = {
    projectName: '',
    useCase: '',
    mode: '1',
    productCategory: '',
    product: null,
    stage: 0,
  }
  rules = {
    projectName: [{ required: true, trigger: 'blur', message: this.$t('ProjectNameRequired') as string }],
    mode: [{ required: true, trigger: 'blur' }],
  }
  productCategoryList: string[] = []
  fullProductList: ProductType[] = []

  async mounted() {
    this.loading = true
    const lifeCycleInfo = await getLifeCycle()
    this.accountBlocked =
      lifeCycleInfo.financialStatus === 2 || lifeCycleInfo.financialStatus === 3 || lifeCycleInfo.financialStatus === 4
    this.condition.limit = Number(this.$route.query.limit) || 0
    if (this.condition.limit <= 0) this.condition.limit = 10
    this.condition.page = this.$route.query.page || 1
    if (this.condition.page < 0) this.condition.page = 1
    this.condition.key = this.$route.query.key
    this.condition.stage = Number(this.$route.query.stage) | 0
    this.showOverlay = (this.$route.query as any).openOverlay === 1 && !this.accountBlocked
    await this.getProjects()
    await this.getProductCategory()
    this.loading = false
    this.appLimit = user.info.company.appLimit
    ;((this.$refs.searchProject as Vue).$el.children[0] as any).focus()
  }

  showOverlayPopup() {
    if (this.projectCount === 0 && user.info.company.area === 'CN') {
      this.$router.push({ path: '/onboarding' })
      return
    }
    this.showOverlay = !this.showOverlay
    if (this.showOverlay) {
      Vue.nextTick(() => {
        ;((this.$refs.createInput as Vue).$el.children[0] as any).focus()
      })
    }
  }

  async getProjects() {
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: this.condition })
      this.tableData = ret.data.items
      this.projectCount = ret.data.projectCount
      this.condition.total = ret.data.total
      const checkLimit = await this.$http.get('/api/v2/projects/checkLimit')
      this.disableCreate = !checkLimit.data
    } catch (e) {
      this.$message.error(e.message)
    }
  }

  async getProductCategory() {
    this.fullProductList = (await productConfig.getProductMetaData()) as ProductType[]
    productCategoryList.forEach((category) => {
      if (this.fullProductList.filter((product: ProductType) => product.category === category).length > 0) {
        this.productCategoryList.push(category)
      }
    })
    this.projectFormData.productCategory = this.productCategoryList[0]
  }

  changePage() {
    const condition = Object.assign({}, this.condition)
    this.$router.push({ query: condition })
    this.getProjects()
  }
  changeProjectStage(stage: number) {
    this.condition.stage = stage
    this.condition.page = 1
    this.changePage()
  }
  onChange() {
    if (!this.condition.key) {
      this.condition.page = 1
      this.changePage()
    }
  }
  changeProjectStatus(status: number) {
    this.condition.status = status
    this.condition.page = 1
    this.changePage()
  }

  async onClickSubmit() {
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
      this.showOverlay = false
      await productConfig.updateVendorRelationWithProduct(
        project.data.projectId,
        this.projectFormData.product.productTypeId,
        this.projectFormData.product.platform[0].platformId
      )
      this.getProjects()
      this.resetProjectFormData()
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

  onClickCancel() {
    this.showOverlay = false
    this.resetProjectFormData()
  }
  onClickSort(sortCondition: any) {
    this.condition.sortProp = sortCondition.prop
    this.condition.sortOrder = sortCondition.order
    const condition = Object.assign({}, this.condition)
    this.$router.push({ query: condition })
    this.getProjects()
  }

  resetProjectFormData() {
    this.projectFormData = {
      projectName: '',
      useCase: '',
      mode: '1',
      productCategory: this.productCategoryList[0],
      product: null,
      stage: 0,
    }
  }

  getProducts() {
    return this.fullProductList.filter((item: any) => item.category === this.projectFormData.productCategory)
  }

  selectProduct(product: ProductType) {
    this.projectFormData.product = product
  }
}
