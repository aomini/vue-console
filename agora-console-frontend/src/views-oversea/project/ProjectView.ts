import Vue from 'vue'
import Component from 'vue-class-component'
import { getLifeCycle, user } from '@/services'
import ProjectTableRowView from '@/views-oversea/project/projectTableRowView'
import MyPagiation from '@/components/MyPagination'
const IconPen = require('@/assets/icon/icon-pen.png')

@Component({
  components: {
    'project-table-row': ProjectTableRowView,
    'my-pagination': MyPagiation,
  },
  template: `
    <div v-loading="loading">
      <div>
        <div class="card-box-row">
          <div class="card-header-row">
            <div class="header-title-row">
              <i class="icon-project-row iconfont iconicon-project" />
              <span>{{ $t('OverviewProjectTitle') }}</span>
            </div>
          </div>
          <div class='project-box-row'>
            <div v-if="!isCocos" class="module-title-tip-row" v-html="$t('ProjectMessage', { amount: appLimit })"></div>
            <div v-else class="module-title">
              <span>
                {{ $t('CocosProjectMessage1') }}
                <a :href="$t('CocosDocLink')" target="_blank"> {{ $t('CocosProjectMessage2') }} </a>
                {{ $t('CocosProjectMessage3') }}
              </span>
            </div>
            <div class="d-flex justify-between mb-20">
              <div class="d-flex">
                <el-select class="w-180 mr-2" size="medium" v-model="condition.stage" @change="changeProjectStage">
                  <el-option :key="0" :label="$t('All')" :value="0"></el-option>
                  <el-option :key="2" :label="$t('Live')" :value="2"></el-option>
                  <el-option :key="3" :label="$t('Testing')" :value="3"></el-option>
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
                    {{ $t('Create a Project') }}
                  </console-button>
                </div>
              </el-tooltip>
              <el-tooltip
                :content='$t("AccountBlocked")'
                v-if="!isCocos && accountBlocked && writePermission"
                placement="top"
              >
                <div>
                  <console-button class="console-btn-size-md" disabled> {{ $t('Create a Project') }} </console-button>
                </div>
              </el-tooltip>
            </div>
            <project-table-row
              :tableData="tableData"
              :onSort="onClickSort"
              :isCocos="isCocos"
              :accountBlocked="accountBlocked">
            </project-table-row>
            <div class="mt-2 text-right">
              <my-pagination v-model="condition" @change="changePage"></my-pagination>
            </div>
          </div>
        </div>
      </div>
      <el-dialog :title='$t("CreateProjectTitle")' :visible.sync="showOverlay" width="400px" :show-close="false">
        <div class="d-flex flex-column">
          <div>
            <div class="dialog-item-title">{{ $t('ProjectName') }}</div>
            <el-input
              class="content-input"
              ref="createInput"
              size="small"
              :maxlength="25"
              :placeholder='$t("InputPlaceHolder")'
              v-model="projectName"
            >
            </el-input>
          </div>
          <div class="mt-20">
            <div class="dialog-item-title">{{ $t('UseCase') }}</div>
            <el-cascader
              v-model="useCase"
              size="small"
              :options="useCaseList"
              style="width:100%"
              filterable
            ></el-cascader>
          </div>
          <div class="mt-20">
            <div class="d-flex mt-2 dialog-item-title">
              <div class="mr-2">{{ $t('ProjectAuthentication') }}</div>
              <a :href="$t('IntroLink')" target="_blank"> {{ $t('Whatsthis') }} </a>
            </div>
            <div class="d-flex flex-column mt-1">
              <el-radio v-model="mode" label="1">
                {{ $t('TokenOption') }}
              </el-radio>
              <div class="secure-option-description">{{ $t('TokenOptionDescription') }}</div>
              <el-radio v-model="mode" label="2">
                {{ $t('AppIdOption') }}
              </el-radio>
              <div class="appid-option-description">{{ $t('AppIdOptionDescription') }}</div>
            </div>
          </div>
          <div class="ml-auto text-right">
            <console-button
              class="console-btn-size-md console-btn-primary"
              :disabled="disableSubmit"
              @click="onClickSubmit"
            >
              {{ $t('Submit') }}
            </console-button>
            <console-button class="console-btn-size-md console-btn-white" @click="onClickCancel">
              {{ $t('Cancel') }}
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
  IconPen = IconPen
  accountBlocked = false
  showOverlay = false
  disableCreate = false
  loading = false
  projectCount = null
  tableData = []
  projectName = ''
  disableSubmit = false
  mode = '2'
  appLimit = 10
  stageMap = {
    1: 'Not specified',
    2: 'Live',
    3: 'Testing',
  }
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
  useCase: any = []
  useCaseData: any = []
  useCaseList: any = []

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
    await this.getUsecaseList()
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

  async getUsecaseList() {
    try {
      const ret = await this.$http.get('/api/v2/project/usecases')
      this.useCaseList = ret.data
      const useCaseData: any = []
      this.useCaseList.forEach((item: any) => {
        if (item.hasSector === 0) {
          for (const usecase of item.children) {
            usecase['internalIndustryId'] = item.internalIndustryId
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
      this.formatUsecaseData()
    } catch (error) {}
  }

  formatUsecaseData() {
    const useCaseDataCn: any[] = []
    const useCaseDataEn: any[] = []
    this.useCaseList.forEach((industry: any) => {
      const sectorCn: any[] = []
      const sectorEn: any[] = []
      if (industry.hasSector === 0) {
        const childrenCn: any[] = []
        const childrenEn: any[] = []
        industry.children.forEach((useCase: any) => {
          if (useCase.status === 'Active') {
            childrenCn.push({
              value: useCase.useCaseId,
              label: useCase.useCaseNameCn,
            })
            childrenEn.push({
              value: useCase.useCaseId,
              label: useCase.useCaseNameEn,
            })
          }
        })
        useCaseDataCn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameCn || this.$t(industry.internalIndustryMetadataNameEn),
          children: childrenCn,
        })
        useCaseDataEn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameEn,
          children: childrenEn,
        })
      } else {
        industry.children.forEach((sector: any) => {
          const childrenCn: any[] = []
          const childrenEn: any[] = []
          sector.children.forEach((useCase: any) => {
            if (useCase.status === 'Active') {
              childrenCn.push({
                value: useCase.useCaseId,
                label: useCase.useCaseNameCn,
              })
              childrenEn.push({
                value: useCase.useCaseId,
                label: useCase.useCaseNameEn,
              })
            }
          })
          sectorCn.push({
            value: sector.sectorId,
            label: sector.sectorNameCn,
            children: childrenCn,
          })
          sectorEn.push({
            value: sector.sectorId,
            label: sector.sectorNameEn,
            children: childrenEn,
          })
        })
        useCaseDataCn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameCn || this.$t(industry.internalIndustryMetadataNameEn),
          children: sectorCn,
        })
        useCaseDataEn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameEn,
          children: sectorEn,
        })
      }
    })
    if (this.$i18n.locale === 'en') {
      this.useCaseList = useCaseDataEn
    } else {
      this.useCaseList = useCaseDataCn
    }
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
    const name = this.projectName.trim()
    const pattern = new RegExp("[`~#$^*=|':;',\\[\\]./?~#￥……&*——|‘；：”“'。，、？]")
    if (pattern.test(name)) {
      return this.$message.error(this.$t('ProjectNameSpecialChar') as string)
    }
    if (name.length < 1) {
      return this.$message.error(this.$t('ProjectNameRequired') as string)
    }
    if (this.useCase.length < 1) {
      return this.$message.error(this.$t('UseCaseRequired') as string)
    }
    this.disableSubmit = true
    const useCaseId = this.useCase.length === 2 ? this.useCase[1] : this.useCase[2]
    try {
      await this.$http.post('/api/v2/project', {
        projectName: name,
        enableCertificate: this.mode === '1',
        useCaseId: useCaseId,
      })
      this.showOverlay = false
      this.projectName = ''
      this.getProjects()
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
    this.projectName = ''
    this.mode = '2'
  }
  onClickSort(sortCondition: any) {
    this.condition.sortProp = sortCondition.prop
    this.condition.sortOrder = sortCondition.order
    const condition = Object.assign({}, this.condition)
    this.$router.push({ query: condition })
    this.getProjects()
  }
}
