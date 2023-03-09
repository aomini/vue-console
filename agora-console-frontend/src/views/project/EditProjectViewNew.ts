import Vue from 'vue'
import Component from 'vue-class-component'
import ProjectInfoPanel from './components/panel/ProjectInfoPanel'
import { RouteRecord } from 'vue-router/types/router'
import './Project.less'
import { getProjectInfo } from '@/services'
import DocsCard from './components/card/DocsCard'
import ProjectDialog from '@/views/project/components/panel/ProjectDialog'
import ServiceConfigPanel from '@/views/project/components/panel/ServiceConfigPanel'

@Component({
  components: {
    'project-info-panel': ProjectInfoPanel,
    'service-config-panel': ServiceConfigPanel,
    'docs-card': DocsCard,
    'project-dialog': ProjectDialog,
  },
  template: `
    <el-row type="flex" class="p-0 project-info-panel">
      <el-col class="bg-white p-24 border-8">
        <div class="page-v3 project-detail" v-loading="loading">
          <el-tabs v-model="activeName">
            <el-tab-pane :label="$t('Project Info')" name="project-info">
              <project-info-panel
                v-if="activeName === 'project-info' && project"
                :project="project"
                @updateProject="updateProject"
                @editProject="showProjectEditDialog = true"
              ></project-info-panel>
            </el-tab-pane>
            <el-tab-pane :label="$t('Service Config')" name="service-config">
              <service-config-panel v-if="activeName === 'service-config'" :project="project"></service-config-panel>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
      <el-col class="ml-24" style="width: 378px" v-if="activeName === 'project-info'">
        <docs-card :default-product="project?.productTypeId" v-if="project.key"></docs-card>
      </el-col>
      <project-dialog
        type="edit"
        :showDialog="showProjectEditDialog"
        :vendor-info="project"
        v-if="project.key"
        @closeDialog="showProjectEditDialog = false"
        @updateProject="updateProject"
      ></project-dialog>
    </el-row>
  `,
})
export default class EditProjectViewNew extends Vue {
  activeName = 'project-info'
  project: any = {}
  showProjectEditDialog = false
  loading = false

  async mounted() {
    await this.changeBreadcrumb()
    await this.getProject()
  }

  async getProject() {
    this.loading = true
    const projectId = this.$route.params.id
    this.project = {}
    try {
      this.project = Object.assign({}, (await getProjectInfo(projectId)).info)
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' })
    }
    this.loading = false
  }

  async updateProject() {
    this.showProjectEditDialog = false
    await this.getProject()
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: '/projects',
        meta: {
          breadcrumb: 'Project Management',
        },
      },
      {
        path: 'project',
        meta: {
          breadcrumb: 'Project Config',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
