import Vue from 'vue'
import Component from 'vue-class-component'
import OnboardingCard from '@/views-oversea/overview/onboarding/OnboardingCard'
import './Component.less'
import '../OverviewRow.less'
import { user } from '@/services/user'
import { getLifeCycle } from '@/services'
import { ProjectStage } from '@/models'
import Cookie from 'js-cookie'
const NoPermissionImg = require('@/assets/image/not-allow.png')
const NoDataImg = require('@/assets/image/no-message.png')
const AppBuilderImg = require('@/assets/image/app-builder.png')
@Component({
  components: {
    'onboarding-oversea': OnboardingCard,
  },
  template: `
    <div class="card-box-row" v-loading="loading">
      <div class="card-header-row">
        <div class="header-title-row">
          <i class="icon-project-row iconfont iconicon-project" />
          <span>{{ $t('OverviewProjectTitle') }}</span>
        </div>
      </div>
      <div class="card-content-row" :class="showIntro ? 'show-intro' : ''">
        <div class="project-container">
          <el-popover
            placement="top"
            width="500"
            popper-class="intro-popover"
            trigger="manual"
            @hide="hideIntro"
            v-model="showIntro">
            <p v-if="newUser">{{ $t('OverseaNoProjectOverviewIntro') }}</p>
            <p v-else>{{ $t('OverseaHasProjectOverviewIntro') }}</p>
            <div style="text-align: right; margin: 0">
              <el-button type="primary" size="mini" @click="showIntro = false">Got it!</el-button>
            </div>
            <div class="table-header-row" slot="reference">
              <span class="table-header-title-row heading-dark-16"> My Projects </span>
              <div class="d-flex">
                <el-button type="text" slot="reference" id="onboarding_create_project">
                  <span> + </span>
                  <span id="onboarding_create_project_row" class="onboarding_create_project_row" @click="createOnboardingProject()">{{ $t('Create a Project') }}</span>
                </el-button>
                <div class="line-vertical my-auto"></div>
                <el-button type="text" slot="reference" id="onboarding_create_project">
                  <span id="onboarding_create_project_row" class="onboarding_create_project_row" @click="goToProjectPage()">{{ $t('View All Projects') }}</span>
                </el-button>
              </div>
            </div>
          </el-popover>
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
            <div class="onboarding-row-project-table" v-else>
              <el-table :data="tableData" :show-header="false">
                <el-table-column prop="name" label="My projects" class-name="font-weight-bold">
                  <template slot-scope="scope">
                    <el-input
                      v-show='!!scope.row.updateProjectStatus'
                      :placeholder="scope.row.name"
                      size="large"
                      v-model="scope.row.name"
                      :ref="scope.row.id"
                      @blur="updateProjectName(scope.row.projectId, scope.row.name)"
                      @keyup.enter.native="updateProjectName(scope.row.projectId, scope.row.name)"
                    >
                      <i class="iconfont iconicon-bianjineirong row-project-table-input-copy" slot="suffix"></i>
                    </el-input>
                    <span v-show='!scope.row.updateProjectStatus'>
                    {{ scope.row.name }}
                      <span class="iconfont iconicon-bianjineirong row-copy " @click="updateProjectNameStatus(scope.row.id)"></span>
                  </span>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="Create time">
                  <template slot-scope="scope">
                    <span> Created:  {{ scope.row.createdAt | formatDate('YYYY-MM-DD') }} </span>
                  </template>
                </el-table-column>
                <el-table-column prop="stage" label="Stage">
                  <template slot-scope="scope">
                  <span>
                    {{ 'Stage: ' + stageMap[scope.row.stage] }}
                  </span>
                  </template>
                </el-table-column>
                <el-table-column label="Security">
                  <template slot-scope="scope">
                  <span>
                    {{ "Security: " + (!!scope.row.signkey ? "Enabled" : "Disabled") }}
                  </span>
                  </template>
                </el-table-column>

                <el-table-column prop="status" label="Status">
                  <template slot-scope="scope">
                  <span>
                    {{ 'Status: ' + statusMap[scope.row.status] }}
                  </span>
                  </template>
                </el-table-column>
                <el-table-column prop="key" label="App ID">
                  <template slot-scope="scope">
                    <div class="d-flex">
                      <div class="nowrap">
                        {{ 'App ID: ' + scope.row.key }}
                      </div>
                      <div v-clipboard:copy="scope.row.key">
                        <span id="appid-copy" class="iconfont iconicon-copy row-copy" @click="copied()"></span>
                      </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Configure" align="right">
                <template slot-scope="scope">
                  <div class="configure_box">
                    <el-button type="text" slot="reference">
                      <span id="onboarding_go_to_project" class="onboarding_create_project_row" @click="goToProjectEditPage(scope.row.projectId)">{{ $t('Configure') }}</span>
                    </el-button>
                    <img height="20px" class="mr-5 ml-10 mt-10" v-if="scope.row.name.includes('appbuilder')" :src="AppBuilderImg" @click="openAppBuilder()"/>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <onboarding-oversea></onboarding-oversea>
      </div>
        <div class="intro-overlay" v-if="showIntro"></div>
      </div>
    </div>
  `,
})
export default class ProjectCard extends Vue {
  isCocos = user.info.isCocos
  tableData: any[] = []
  total: number = 0
  loading = false
  projectReadPermission = user.info.permissions['ProjectManagement'] > 0
  projectWritePermission = user.info.permissions['ProjectManagement'] > 1
  inLimit = false
  accountBlocked = false
  isMember = user.info.isMember
  NoPermissionImg = NoPermissionImg
  NoDataImg = NoDataImg
  AppBuilderImg = AppBuilderImg
  currentProjectName = ''
  stageMap = {
    1: 'Not specified',
    2: 'Live',
    3: 'Testing',
  }
  statusMap = {
    1: 'Enabled',
    2: 'Disabled',
  }
  editing = false
  ProjectStage = ProjectStage
  showIntro = false
  newUser = false

  get getCreateBtnPermission() {
    return this.projectWritePermission && !this.isCocos && this.inLimit && !this.accountBlocked
  }

  async mounted() {
    this.init()
    setTimeout(() => {
      this.startIntro()
    }, 3000)
  }

  goToProjectPage(query: any) {
    this.$router.push({ name: 'projects', query: query })
  }

  async createOnboardingProject() {
    let name = 'My New Project'
    if (this.total !== 0) name = name + ' ' + this.total
    const useCaseId = '0'
    await this.$http.post('/api/v2/project', {
      projectName: name,
      enableCertificate: false,
      useCaseId: useCaseId,
    })
    await this.init()
  }

  goToProjectEditPage(projectId: string) {
    this.$router.push({ name: 'editProject', params: { id: projectId } })
  }

  copied() {
    this.$message.success(this.$t('Copied') as string)
  }

  updateProjectNameStatus(id: number) {
    const temp: any[] = []
    this.tableData.map((row: any, index: number) => {
      const tempRow = row
      if (row.id === id) {
        tempRow.updateProjectStatus = true
      }
      temp[index] = tempRow
    })
    this.tableData = temp
    this.$nextTick(() => {
      const ref: any = this.$refs[id]
      ref.focus()
    })
  }

  async updateProjectName(projectId: string, name: string) {
    const temp: any[] = []
    try {
      console.info(projectId)
      await this.$http.put(`/api/v2/project/${projectId}/name`, { name })
      this.$message.success(this.$t('Updated successfully') as string)
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
      return
    }
    this.tableData.map((row: any, index: number) => {
      const tempRow = row
      if (row.projectId === projectId) {
        tempRow.updateProjectStatus = false
      }
      temp[index] = tempRow
    })
    this.tableData = temp
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
          this.newUser = true
          this.createOnboardingProject()
        }
        return
      }
      this.tableData = items.slice(0, 5)
      for (const row of this.tableData) {
        row.updateProjectStatus = false
      }
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
    }
    this.loading = false
  }

  startIntro() {
    if (Cookie.get('showOverviewIntro')) {
      return
    }
    this.showIntro = true
    const mainContainer: any = document.getElementsByClassName('el-main')[0]
    mainContainer.style.overflowY = 'hidden'
    Cookie.set('showOverviewIntro', '1')
  }

  hideIntro() {
    const mainContainer: any = document.getElementsByClassName('el-main')[0]
    mainContainer.style.overflowY = 'auto'
  }

  openAppBuilder() {
    window.open('https://appbuilder.agora.io/create')
  }
}
