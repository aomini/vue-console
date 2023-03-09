import Vue from 'vue'
import Component from 'vue-class-component'
import { user, getUserInfo } from '@/services/user'
import ProjectCard from '@/views/overview/components/ProjectCard'
import ProjectCardRow from '@/views-oversea/overview/components/ProjectCardRow'
import BillCard from '@/views-oversea/overview/components/BillCard'
import MemberCard from '@/views-oversea/overview/components/MemberCard'
import PackageCard from '@/views-oversea/overview/components/PackageCard'
import ResourceCard from '@/views-oversea/overview/components/ResourceCard'
import MessageCard from '@/views-oversea/overview/components/MessageCard'
import MarketplaceCard from '@/views-oversea/overview/components/MarketplaceCard'
import './Overview.less'
import TutoriaSteps from '@/views-oversea/overview/components/TutoriaSteps'
import draggable from 'vuedraggable'
import LayoutEdit from '@/views-oversea/overview/components/LayoutEdit'
import LayoutView from '@/views-oversea/onboarding/LayoutView'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import WelcomeOversea from '@/views-oversea/overview/onboarding/WelcomeOversea'

@Component({
  components: {
    'two-factor-confirm': TwoFactorConfirm,
    'project-card': ProjectCard,
    'project-card-row': ProjectCardRow,
    'bill-card': BillCard,
    'member-card': MemberCard,
    'package-card': PackageCard,
    'resource-card': ResourceCard,
    'message-card': MessageCard,
    'marketplace-card': MarketplaceCard,
    'tutoria-steps': TutoriaSteps,
    'layout-edit': LayoutEdit,
    Onboarding: LayoutView,
    draggable,
    'welcome-oversea': WelcomeOversea,
  },
  template: `
    <div class="layout-v3">
      <div class="overview-row">
        <div class="tutoria-line d-flex justify-between">
          <welcome-oversea :user-name="user.firstName"></welcome-oversea>
        </div>
        <div v-loading="loading">
          <div class="overview-placeholder" v-if="!loading && leftList.length === 0 && rightList.length === 0">
            <div class="placeholder-image"></div>
            <p>{{ $t('EmptyOverview') }}</p>
          </div>

          <project-card-row> </project-card-row>

          <el-row :gutter="20">
            <el-col :sm="12" :xs="24">
              <draggable
                v-model="leftList"
                group="card"
                @start="onDragStart"
                @end="onDragEnd"
                chosenClass="chosen-draging"
                ghost-class="draging-ghost"
                handle=".iconicon-yidong"
                animation="300"
              >
                <transition-group tag="div" class="overview-drag-group">
                  <div v-for="item in leftList" :key="item.id" :id="item.id">
                    <component
                      v-if="item.id === 'aa-card'"
                      :is="item.id"
                      ref="aa-card"
                      :class="draging ? 'draging' : ''"
                      :projectId="projectId"
                      :projectList="projectList"
                      @updateProjectId="updateProjectId"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                    <component
                      v-else-if="item.id === 'aa-data-insight-card'"
                      :is="item.id"
                      ref="aa-data-insight-card"
                      :class="draging ? 'draging' : ''"
                      :projectId="projectId"
                      :projectList="projectList"
                      @updateProjectId="updateProjectId"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                    <component
                      v-else-if="item.id !== 'project-card'"
                      :ref="item.id"
                      :is="item.id"
                      :class="draging ? 'draging' : ''"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                  </div>
                </transition-group>
              </draggable>
            </el-col>
            <el-col :sm="12" :xs="24">
              <draggable
                v-model="rightList"
                group="card"
                @start="onDragStart"
                @end="onDragEnd"
                chosenClass="chosen-draging"
                ghost-class="draging-ghost"
                handle=".iconicon-yidong"
                animation="300"
              >
                <transition-group tag="div" class="overview-drag-group">
                  <div v-for="item in rightList" :key="item.id" :id="item.id">
                    <component
                      v-if="item.id === 'project-card'"
                      :is="item.id"
                      :class="draging ? 'draging' : ''"
                      ref="project-card"
                      :startOnboarding="startOnboarding"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                    <component
                      v-else-if="item.id === 'aa-card'"
                      :is="item.id"
                      :class="draging ? 'draging' : ''"
                      :projectId="projectId"
                      :projectList="projectList"
                      :ref="item.id"
                      @updateProjectId="updateProjectId"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                    <component
                      v-else-if="item.id === 'aa-data-insight-card'"
                      :is="item.id"
                      ref="aa-data-insight-card"
                      :class="draging ? 'draging' : ''"
                      :projectId="projectId"
                      :projectList="projectList"
                      @updateProjectId="updateProjectId"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                    <component
                      v-else
                      :ref="item.id"
                      :is="item.id"
                      :class="draging ? 'draging' : ''"
                      @handleDeleteCard="handleDeleteCard"
                    ></component>
                  </div>
                </transition-group>
              </draggable>
            </el-col>
          </el-row>
        </div>

        <div v-if="!user.verified">
          <two-factor-confirm :afterSuccess="afterVerificationSuccess" :afterFail="() => {}"> </two-factor-confirm>
        </div>
      </div>
    </div>
  `,
})
export default class Overview extends Vue {
  loading = true
  showOnboarding: boolean = false
  user: any = user.info
  isCocos = user.info.isCocos
  welcomeWords: any = this.$t('WelcomeWords')
  leftList: { id: string }[] = []
  rightList: { id: string }[] = []
  draging = false
  allCards: { id: string }[] = []
  layoutSetting: any = null
  projectId = ''
  projectList: any = []

  usagePermission() {
    return this.user.permissions['Usage'] > 0
  }

  get ShowWelcomeText() {
    // return this.welcomeWords[Math.floor(Math.random() * this.welcomeWords.length)].text
    return `${this.$t('Welcome')} ${this.user.displayName}`
  }

  async created() {
    await this.getProjects()
    await this.getQualityPosition()
    await this.initData()
  }

  async initData() {
    this.loading = true
    this.allCards = []
    this.leftList = []
    this.rightList = []
    this.layoutSetting = null
    this.initCards()
    await this.initLayoutSetting()
    this.loading = false
  }

  initCards() {
    this.allCards.push({ id: 'project-card' })
    this.allCards.push({ id: 'resource-card' })
    this.allCards.push({ id: 'bill-card' })
    this.allCards.push({ id: 'message-card' })
    if (!this.isCocos && this.user.permissions['Member&RoleManagement'] > 0) {
      this.allCards.push({ id: 'member-card' })
    }
    this.allCards.push({ id: 'marketplace-card' })
  }

  async initLayoutSetting() {
    await this.getSetting()
    if (!this.layoutSetting) {
      for (const index in this.allCards) {
        const a = Number(index) % 2
        if (!a) {
          this.leftList.push(this.allCards[index])
        } else {
          this.rightList.push(this.allCards[index])
        }
      }
    } else {
      this.leftList = []
      this.rightList = []
      this.layoutSetting['left'].forEach((item: any) => {
        if (_.find(this.allCards, ['id', item.id])) {
          this.leftList.push(item)
        }
      })
      this.layoutSetting['right'].forEach((item: any) => {
        if (_.find(this.allCards, ['id', item.id])) {
          this.rightList.push(item)
        }
      })
    }
  }

  async getSetting() {
    try {
      const res = await this.$http.get('/api/v2/account/layout/setting')
      if (res.data && res.data.setting) {
        this.layoutSetting = JSON.parse(res.data.setting)
      }
    } catch (e) {}
  }

  async saveSetting() {
    const params = JSON.stringify({ left: this.leftList, right: this.rightList })
    try {
      await this.$http.post('/api/v2/account/layout/setting', { setting: params })
      this.$emit('updateLayout')
    } catch (e) {}
  }

  startOnboarding() {
    if (user.info.company.area === 'CN') {
      this.$router.push({ name: 'onboarding' })
    }
  }

  gotoDashboard(reload: boolean) {
    if (reload) {
      ;(this.$refs['project-card'] as any)[0].init()
      ;(this.$refs.steps as any).init()
      this.$emit('updateIdentity')
    }
    this.showOnboarding = false
  }

  async afterVerificationSuccess() {
    const userInfo = await getUserInfo()
    this.user = (userInfo as any).info
  }

  onDragStart() {
    this.draging = true
  }

  onDragEnd(e: any) {
    this.draging = false
    this.saveSetting()
    const refId = e['item']['id']
    ;(this.$refs[refId] as any)[0].endDragging()
  }

  async getQualityPosition() {
    if (!this.usagePermission) {
      return
    }

    try {
      const { data = [] } = await this.$http.get<any>('/api/v2/usage/projects-usage')
      const project = data.projects[0]
      if (project && project.usage7d > 0) {
        this.projectId = project.projectId
        return
      } else if (this.projectList.length > 0) {
        this.projectId = this.projectList[0].projectId
      }
    } catch (err) {
      console.info(err)
    }
  }

  async getProjects() {
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: { fetchAll: true } })
      this.projectList = ret.data.items
    } catch (e) {}
  }

  handleDeleteCard(id: string) {
    const index = this.leftList.findIndex((item) => item.id === id)
    if (index !== undefined && index !== -1) {
      this.leftList.splice(index, 1)
    } else {
      const rightIndex = this.rightList.findIndex((item) => item.id === id)
      if (rightIndex !== undefined && rightIndex !== -1) {
        this.rightList.splice(rightIndex, 1)
      }
    }
    this.saveSetting()
  }

  updateProjectId(value: any) {
    this.projectId = value
  }
}
