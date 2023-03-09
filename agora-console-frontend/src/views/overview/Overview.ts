import Vue from 'vue'
import Component from 'vue-class-component'
import { user, getUserInfo } from '@/services/user'
import ProjectCard from '@/views/overview/components/ProjectCard'
import BillCard from '@/views/overview/components/BillCard'
import PackageCard from '@/views/overview/components/PackageCard'
import ResourceCard from '@/views/overview/components/ResourceCard'
import OnboardingCard from '@/views/overview/components/OnboardingCard'
import './Overview.less'
import TutoriaSteps from '@/views/overview/components/TutoriaSteps'
import draggable from 'vuedraggable'
import LayoutEdit from '@/views/overview/components/LayoutEdit'
import LayoutView from '@/views/onboarding/LayoutView'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import ProjectDialog from '@/views/project/components/panel/ProjectDialog'
import PersonalAuthDialog from '@/views/onboardingNew/PersonalAuthDialog'

@Component({
  components: {
    'two-factor-confirm': TwoFactorConfirm,
    'onboarding-card': OnboardingCard,
    'project-card': ProjectCard,
    'bill-card': BillCard,
    'package-card': PackageCard,
    'resource-card': ResourceCard,
    'tutoria-steps': TutoriaSteps,
    'layout-edit': LayoutEdit,
    Onboarding: LayoutView,
    'project-dialog': ProjectDialog,
    'personal-auth-dialog': PersonalAuthDialog,
    draggable,
  },
  template: `
    <div class="layout-v3">
      <div v-loading="loading">
        <el-row :gutter="20" type="flex" align="top" class="mb-0">
          <el-col w:min-w="0">
            <onboarding-card
              v-if="!user.isMember"
              ref="onboarding-card"
              :auth-status="authStatus"
              @openProjectDialog="openProjectDialog"
              @openAuthDialog="openAuthDialog"
            ></onboarding-card>
            <project-card ref="project-card"></project-card>
            <resource-card></resource-card>
          </el-col>
          <el-col style="width: 398px">
            <div class="layout-v3__sidebar">
              <bill-card></bill-card>
              <package-card></package-card>
            </div>
          </el-col>
        </el-row>
      </div>

      <div v-if="!user.verified">
        <two-factor-confirm :afterSuccess="afterVerificationSuccess" :afterFail="() => {}"> </two-factor-confirm>
      </div>
      <project-dialog
        type="create"
        onboarding="true"
        :showDialog="showProjectDialog"
        @projectCreated="onboardingProjectCreated"
        @closeDialog="showProjectDialog = false"
      ></project-dialog>
      <personal-auth-dialog
        :showAuthDialog="showAuthDialog"
        @closeAuthDialog="showAuthDialog = false"
        @authSuccess="authSuccess"
      ></personal-auth-dialog>
    </div>
  `,
})
export default class Overview extends Vue {
  loading = false
  showOnboarding: boolean = false
  user: any = user.info
  isCocos = user.info.isCocos
  isCN = user.info.company.area === 'CN'
  draging = false
  projectId = ''
  projectList: any = []
  showProjectDialog = false
  authStatus = true
  showAuthDialog = false

  usagePermission() {
    return this.user.permissions['Usage'] > 0
  }

  async created() {
    this.loading = true
    await this.getIdentity()
    this.loading = false
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

  // async getQualityPosition() {
  //   if (!this.usagePermission) {
  //     return
  //   }
  //
  //   try {
  //     const { data = [] } = await this.$http.get('/api/v2/usage/projects-usage')
  //     const project = data.projects[0]
  //     if (project && project.usage7d > 0) {
  //       this.projectId = project.projectId
  //       return
  //     } else if (this.projectList.length > 0) {
  //       this.projectId = this.projectList[0].projectId
  //     }
  //   } catch (err) {
  //     console.info(err)
  //   }
  // }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (
        user.info.company.source !== 2 &&
        user.info.company.country == 'CN' &&
        (!('authStatus' in identity.data) || (identity.data.authStatus !== 1 && identity.data.authStatus !== -1))
      ) {
        this.authStatus = false
      }
    } catch (e) {
      console.info(e)
    }
  }

  updateProjectId(value: any) {
    this.projectId = value
  }

  openProjectDialog() {
    if (this.authStatus === false) {
      this.$message.warning(this.$t('identityWarn') as string)
      return
    }
    this.showProjectDialog = true
  }

  openAuthDialog() {
    this.showAuthDialog = true
  }

  async onboardingProjectCreated(projectId: string) {
    this.showProjectDialog = false
    ;(this.$refs['project-card'] as any).reload()
    ;(this.$refs['onboarding-card'] as any).getOnboardingStatus()
    await this.setOnboardingStatus()
    this.$router.push({ name: 'editProject', params: { id: projectId } })
  }

  async setOnboardingStatus() {
    try {
      await this.$http.post('/api/v2/company/field', { fieldType: 'onboarding' })
    } catch (e) {}
  }

  authSuccess() {
    this.showAuthDialog = false
    this.authStatus = true
  }
}
