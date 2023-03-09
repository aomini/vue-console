import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { user } from '@/services/user'
import { Prop } from 'vue-property-decorator'
import { getLifeCycle } from '@/services'
import { ProjectStage } from '@/models'
import PasswordInput from '@/components/PasswordInput'
import ProjectTableView from '@/views/project/projectTableView'
const NoPermissionImg = require('@/assets/image/not-allow.png')
const NoDataImg = require('@/assets/image/no-message.png')
const IconPen = require('@/assets/icon/icon-pen.png')
const IconUsage = require('@/assets/icon/icon-usage.png')
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  components: {
    'password-input': PasswordInput,
    'project-table': ProjectTableView,
  },
  template: `
    <div class="card-box project-card mb-24" v-loading="loading">
      <div class="card-header border-bottom pb-10 mb-24">
        <div class="header-title">
          <span class="heading-dark-03 f-16 f-w-500">{{ $t('OverviewProjectTitle') }}</span>
        </div>
        <div class="header-right" @click="goToProjectPage">
          <span class="heading-dark-03">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div class="flex-1">
        <div v-if="!projectReadPermission" class="text-center overview-empty">
          <img height="90px" class="mr-5 my-2" :src="NoPermissionImg" />
          <div class="permission-text my-auto mx-4 heading-light-05">{{ $t('PermissionText') }}</div>
        </div>
        <div v-else class="h-100">
          <div v-if="tableData.length === 0" class="h-100">
            <div v-if="isMember || isCocos" class="overview-empty text-center">
              {{ $t('EmptyProjectMessage') }}
            </div>
            <div v-else class="overview-empty text-center">
              {{ $t('StartOnboardingMessage') }}
            </div>
          </div>
          <div class="overflow-hidden" v-else>
            <project-table :tableData="tableData" :isCocos="isCocos" :accountBlocked="accountBlocked"></project-table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class ProjectCard extends Vue {
  @Prop({ default: null, type: Function }) readonly startOnboarding!: () => Promise<void>

  isCocos = user.info.isCocos
  tableData = []
  total: number = 0
  loading = false
  projectReadPermission = user.info.permissions['ProjectManagement'] > 0
  projectWritePermission = user.info.permissions['ProjectManagement'] > 1
  usagePermission = user.info.permissions['Usage'] > 0
  inLimit = false
  accountBlocked = false
  isMember = user.info.isMember
  NoPermissionImg = NoPermissionImg
  NoDataImg = NoDataImg
  IconPen = IconPen
  IconUsage = IconUsage
  stageMap = {
    1: 'Not specified',
    2: 'Live',
    3: 'Testing',
  }
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  ProjectStage = ProjectStage

  get getOnboardingPermission() {
    return (
      this.tableData.length === 0 &&
      this.projectWritePermission &&
      !this.isCocos &&
      !this.accountBlocked &&
      !this.isMember
    )
  }

  get getCreateBtnPermission() {
    return (
      this.projectWritePermission &&
      !this.isCocos &&
      this.inLimit &&
      !this.accountBlocked &&
      ((this.tableData.length < 3 && this.tableData.length > 0) || (this.tableData.length === 0 && this.isMember))
    )
  }

  async mounted() {
    this.init()
  }

  goToProjectPage(query: any) {
    this.$router.push({ name: 'projects', query: query })
  }

  goToProjectEditPage(projectId: string) {
    this.$router.push({ name: 'editProject', params: { id: projectId } })
  }

  async init() {
    this.loading = true
    const lifeCycleInfo = await getLifeCycle()
    this.accountBlocked =
      lifeCycleInfo.financialStatus === 2 || lifeCycleInfo.financialStatus === 3 || lifeCycleInfo.financialStatus === 4
    if (this.projectWritePermission) {
      const checkLimit = await this.$http.get('/api/v2/projects/checkLimit')
      this.inLimit = checkLimit.data
    }
    try {
      let items = []
      const ret = await this.$http.get('/api/v2/projects')
      items = ret.data.items
      this.total = ret.data.total
      if (items.length === 0) {
        this.loading = false
        if (this.projectWritePermission && !this.isCocos && !this.accountBlocked && !this.isMember) {
          // this.startOnboarding()
        }
        return
      }
      this.tableData = items.slice(0, 4)
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
    }
    this.loading = false
  }

  reload() {
    this.init()
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'project-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
