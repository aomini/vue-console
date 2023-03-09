import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'
import { getCashInfo, user } from '@/services'
import SecretKeyDialog from '@/views/paas/component/secret-key-dialog'

@Component({
  components: {
    'secret-key-dialog': SecretKeyDialog,
  },
  template: ` <div class="mini-project-list">
    <div class="list-title" v-if="showTitle">{{ $t('Projects') }}</div>
    <div class="projects">
      <div class="project-item" v-for="item in projectList" :key="item.id">
        <el-tooltip effect="light" placement="left">
          <div class="project-name">{{ item.name }}</div>
          <div slot="content" class="en-project-tooltip">
            <div class="project-tooltip-line stage-line">
              <div class="label">{{ $t('Stage') }}</div>
              <div class="label">{{ $t(formatStage(item.stage)) }}</div>
            </div>
            <div class="project-tooltip-line created-time-line">
              <div class="label">{{ $t('CreateDate') }}</div>
              <div class="label">{{ item.createdAt | formatDate('YYYY-MM-DD') }}</div>
            </div>
            <div class="project-tooltip-line credential-line" v-if="item.AppInfo && item.AppInfo.disabled === 0">
              <div class="label">{{ $t('Credentials') }}</div>
              <div>
                <el-button size="medium" type="primary" class="view-button" @click="showTwoFactorVerificationVisible(item)">View </el-button>
              </div>
            </div>
          </div>
        </el-tooltip>
        <el-switch
          :value="item.AppInfo && item.AppInfo.disabled === 0"
          @change="confirmAction(item, item.AppInfo && item.AppInfo.disabled === 0 ? 1 : 0)"
          active-color="#69CCC7"
          inactive-color="#E3E3EC"
        >
        </el-switch>
      </div>
    </div>
    <secret-key-dialog :visible="isSecretKeyDialogVisible" :confirm="() => isSecretKeyDialogVisible = false" :appForm="appForm" :isTempToken="serviceName === 'banuba'" />
  </div>`,
})
export default class EnProjectList extends Vue {
  @Prop({ type: String }) readonly payment!: string
  @Prop({ default: true, type: Boolean }) readonly showTitle!: boolean
  loading = false
  isTwoFactorVerificationPassed = false
  isSecretKeyDialogVisible = false
  appForm = {
    appSecret: '',
    appKey: '',
  }
  appId = ''
  tableData: any[] = [
    {
      productName: 'test',
      stage: 'test',
      date: '2021-01-21',
      status: 'Active',
    },
  ]
  serviceName = ''
  action = true
  stageMap: any = {
    0: 'All',
    1: 'Not specified',
    2: 'Live',
    3: 'Testing',
  }
  projectWritePermission = user.info.permissions['ProjectManagement'] > 1
  selectProject: any = {}
  form = {
    enable: false,
    params: [],
    createParams: [],
    deleteParams: [],
  }
  projectList: any[] = []
  condition = {
    page: 1,
    limit: 10,
    key: undefined,
    marketplaceStatus: 2,
    serviceName: '',
    sortProp: 'stage',
    sortOrder: 'DESC',
  }
  provider: any = {}
  account: any = {
    accountBalance: 0,
  }
  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }
  created() {
    this.serviceName = (this.$route.query.serviceName || this.$route.params.serviceName) as string
    this.condition.serviceName = this.serviceName
  }
  async mounted() {
    this.account = await getCashInfo()
    this.refreshData()
  }
  async showTwoFactorVerificationVisible(item: { key: string }) {
    this.appId = item.key
    await this.getSecret()
    this.isSecretKeyDialogVisible = true
  }
  async getSecret() {
    this.isTwoFactorVerificationPassed = true
    const res = await this.$http.get(`/api/v2/marketplace/appId/${this.appId}/serviceName/${this.serviceName}/secret`)
    this.appForm = {
      appKey: res.data.appKey,
      appSecret: res.data.appSecret,
    }
    this.isSecretKeyDialogVisible = true
  }
  formatStage(stageIndex: number) {
    return this.stageMap[stageIndex]
  }
  checkActivePermission() {
    return this.account.accountBalance >= 0 || this.payment === 'free'
  }
  confirmAction(project: any, disabled: number) {
    if (!this.projectWritePermission) {
      this.$message.warning(this.$t('PermissionText') as string)
      return
    }
    if (disabled === 0 && !this.checkActivePermission()) {
      this.$confirm(this.$t('Paas Balance negative') as string, this.$t('Warning') as string, {
        confirmButtonText: this.$t('Make deposits') as string,
        cancelButtonText: this.$t('Cancel') as string,
      })
        .then(() => {
          this.goToDeposite()
        })
        .catch(() => {})
      return
    }
    this.selectProject = project
    this.$confirm(
      disabled === 1
        ? (this.$t('ConfirmDisable', { projectName: project.name, productName: this.provider.productCnName }) as string)
        : (this.$t('ConfirmEnable', { projectName: project.name, productName: this.provider.productCnName }) as string),
      disabled === 1 ? (this.$t('Disabled') as string) : (this.$t('Confirm') as string),
      {
        confirmButtonText: this.$t('Confirm') as string,
        cancelButtonText: this.$t('Cancel') as string,
        title: 'Notification',
      }
    )
      .then(() => {
        disabled === 1 ? this.closeService(project) : this.launchService(project)
      })
      .catch(() => {})
  }
  initParam() {
    this.form.params = this.provider['params']
    this.provider['createParams'] && (this.form.createParams = this.provider['createParams'])
    this.provider['deleteParams'] && (this.form.deleteParams = this.provider['deleteParams'])
  }
  async getVendorInfo() {
    try {
      const res = await this.$http.get(`/api/v2/marketplace/vendor/${this.serviceName}`, { params: { needDoc: true } })
      this.provider = res.data
      this.initParam()
    } catch (e) {}
  }
  getPattern(item: { type: string }) {
    return item.type === 'int' ? /^\d+$/ : item.type === 'string' ? '' : /^(true|false)$/
  }
  async launchService(project: any) {
    const params = {
      enable: true,
      params: this.form.params,
      createParams: this.form.createParams,
      deleteParams: this.form.deleteParams,
      name: project.name,
      projectId: project.projectId,
      vid: project.id,
      appId: project.key,
      serviceName: this.serviceName,
    }

    try {
      this.loading = true
      const res = await this.$http.post(`/api/v2/marketplace/company/${this.serviceName}`, params)
      if (res.data.status === 'success') {
        this.$message({
          type: 'success',
          message: 'Sucessfully enabled extension',
        })
        const params = {
          appKey: res.data.data?.appKey,
          appSecret: res.data.data?.appSecret,
          vid: project.id,
        }
        await this.$http.post(`/api/v2/marketplace/appId/${project.key}/serviceName/${this.serviceName}/secret`, params)
        await this.refreshData()
      } else {
        this.$message.error(JSON.stringify(res.data))
      }
      this.loading = false
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('NetworkError') as string)
    }
  }
  async closeService(project: any) {
    const params = {
      enable: false,
      deleteParams: this.form.deleteParams,
      name: project.name,
      projectId: project.projectId,
      appId: project.key,
      serviceName: this.serviceName,
      vid: project.id,
    }
    try {
      this.loading = true
      const res = await this.$http.delete(`/api/v2/marketplace/company/${this.serviceName}`, { data: params })
      if (res.data.status === 'success') {
        this.$message.success(`Sucessfully disabled extension`)
        this.refreshData()
      } else {
        this.$message.error(this.$t('RequestFailed') as string)
      }
      this.loading = false
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('RequestFailed') as string)
    }
  }
  async refreshData() {
    this.loading = true
    await Promise.all([this.getProjects(), this.getVendorInfo()])
    this.loading = false
  }
  async getProjects() {
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: this.condition })
      this.projectList = ret.data.items
      this.projectList.forEach((item) => {
        const tmp = item.AppInfo.filter((app: { serviceName: string }) => app.serviceName === this.serviceName)
        item.AppInfo = tmp.length === 0 ? null : tmp[0]
      })
    } catch (e) {
      this.$message.error(e.message)
    }
  }

  goToDeposite() {
    if (this.getCurrency === '$') {
      this.$router.push({ name: 'finance.creditCard' })
    } else {
      this.$router.push({ name: 'finance.alipay' })
    }
  }
}
