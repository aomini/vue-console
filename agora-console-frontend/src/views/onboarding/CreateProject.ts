import Vue from 'vue'
import { Prop } from 'vue-property-decorator'
import Component from 'vue-class-component'
import './Onboarding.less'
import AgoraRTC from 'agora-rtc-sdk-ng'

@Component({
  template: `
    <div v-loading="loading">
      <div class="create-project-header">
        <div class="header-sm-only">{{ $t('responsiveHeader') }}</div>
        <div class="skip-lg-only">
          <el-tooltip placement="right" :content="$t('skipTooltip')" popper-class="skip-tooltip">
            <i class="el-icon-close f-20 close-icon cursor-pointer" @click="gotoDashboard"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="create-project-box">
        <div class="heading-dark-01 mb-6">{{ $t('welcome') }}</div>
        <div class="heading-grey-13 mb-30">{{ $t('welcomeHint') }}</div>
        <div v-if="allProjects.length === 0">
          <div class="heading-grey-13 mb-6">{{ $t('createTitle') }}</div>
          <el-input class="mb-30" v-model="projectName" :maxlength="25" :placeholder="$t('projectPlaceholder')">
          </el-input>
          <div class="heading-grey-13 mb-6">{{ $t('UseCase') }}</div>
          <el-cascader v-model="useCase" :options="useCaseList" filterable style="width:350px;"></el-cascader>
          <console-button @click="createProject" :disabled="!browserSupport" class="w-100 console-btn-primary mt-50">
            {{ $t('create') }}
          </console-button>
          <div class="mt-20 heading-grey-13" v-if="!browserSupport">
            {{ $t('browserSupportHint1') }}
            <a :href="$t('browserSupportLink')" target="_blank" class="link">{{ $t('browserSupportHint2') }}</a>
            {{ $t('browserSupportHint3') }}
          </div>
        </div>
        <div v-else>
          <div class="heading-grey-13 mb-6">{{ $t('selectTitle') }}</div>
          <el-select
            v-model="currentProject"
            size="small"
            @change="selectProject"
            popper-class="project-select"
            filterable
            :filter-method="filterProject"
            class="w-100 mb-6"
          >
            <el-option v-for="item in showProjectList" :label="item.name" :value="item.projectId" :key="item.id">
            </el-option>
          </el-select>
          <console-button @click="nextStep" :disabled="!browserSupport" class="console-btn-primary w-100 mt-50">
            {{ $t('Continue') }}
          </console-button>
          <div class="mt-20 heading-grey-13" v-if="!browserSupport">
            {{ $t('browserSupportHint1') }}
            <a :href="$t('browserSupportLink')" target="_blank" class="link">{{ $t('browserSupportHint2') }}</a>
            {{ $t('browserSupportHint3') }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class CreateProject extends Vue {
  @Prop({ default: () => () => {}, type: Function }) readonly gotoDashboard!: Function
  @Prop({ default: () => () => {}, type: Function }) readonly next!: Function
  @Prop({ default: () => () => {}, type: Function }) readonly storeProject!: Function
  projectName = ''
  allProjects: any = []
  showProjectList: any = []
  browserSupport = true
  currentProject = ''
  useCase: any = []
  useCaseData: any = []
  useCaseList: any = []
  loading = false

  created() {
    this.browserSupport = AgoraRTC.checkSystemRequirements()
    this.getAllProjects()
    this.getUsecaseList()
  }

  async createProject() {
    try {
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
      const useCaseId = this.useCase.length === 2 ? this.useCase[1] : this.useCase[2]
      const usecase = this.useCaseData.find((item: any) => {
        return item.useCaseId === useCaseId
      })
      const internalIndustryMetadataNameEn = usecase['internalIndustryMetadataNameEn'] || ''
      const useCaseNameEn = usecase['useCaseNameEn'] || ''
      this.loading = true
      const ret = await this.$http.post('/api/v2/onboardingProject', {
        projectName: name,
        useCaseId: useCaseId,
        internalIndustry: this.useCase[0],
        internalIndustryMetadataNameEn: internalIndustryMetadataNameEn,
        useCaseNameEn: useCaseNameEn,
      })
      this.loading = false
      this.storeProject(ret.data.projectId)
      this.next()
    } catch (e) {
      if (e.response.data.code === 6011) {
        this.$message.error(this.$t('ProjectNameExists') as string)
      } else if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ProjectCreatedFail') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
      this.loading = false
    }
  }

  async getAllProjects() {
    try {
      this.loading = true
      const ret = await this.$http.get('/api/v2/projects', { params: { fetchAll: true } })
      this.loading = false
      this.allProjects = ret.data.items
      this.showProjectList = this.allProjects.slice(0, 10)
      if (this.allProjects.length > 0) {
        this.currentProject = this.allProjects[0].projectId
      }
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.loading = false
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

  selectProject(project: any) {
    this.currentProject = project
  }
  filterProject(queryString: string) {
    const results = queryString
      ? this.allProjects.filter(this.createFilter(queryString)).slice(0, 10)
      : this.allProjects.slice(0, 10)
    this.showProjectList = results
  }
  createFilter(queryString: string) {
    return (vendor: any) => {
      const condition =
        vendor.name.toLowerCase().indexOf(queryString.toLowerCase()) > -1 ||
        vendor.id.toString().toLowerCase().indexOf(queryString.toLowerCase()) > -1 ||
        vendor.projectId.toLowerCase().indexOf(queryString.toLowerCase()) > -1
      return condition
    }
  }

  nextStep() {
    this.storeProject(this.currentProject)
    this.next()
  }
}
