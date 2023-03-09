import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'
import { XunfeiPackageTypeMapping } from '@/models/paasModels'
import { getCashInfo, user } from '@/services'

@Component({
  template: ` <div class="mini-project-list">
    <div class="list-title" v-if="showTitle">{{ $t('Projects') }}</div>
    <div class="projects">
      <div class="project-item" v-for="item in projectList" :key="item.id">
        <div class="project-name">{{ item.name }}</div>
        <el-switch
          :value="item.AppInfo && item.AppInfo.disabled === 0"
          @change="confirmAction(item, item.AppInfo && item.AppInfo.disabled === 0 ? 1 : 0)"
          active-color="#69CCC7"
          inactive-color="#E3E3EC"
        >
        </el-switch>
      </div>
    </div>
    <el-dialog
      :title='$t("appKey Confirm")'
      :visible.sync="showAppKeyDialog"
      width="800px"
      @close="() => { showAppKeyDialog = false }"
    >
      <div class="p-2">
        <div class="dialog-info-withbgd" style="width: auto">
          <div v-if="appid" class="line-height-30 d-flex">
            <div class="appkey-label heading-grey-13 label">appid:</div>
            <div class="heading-dark-13 ml-5 flex-1">{{ appid }}</div>
          </div>
          <div class="line-height-30 d-flex">
            <div class="appkey-label heading-grey-13 label">appKey:</div>
            <div class="heading-dark-13 ml-5 flex-1">{{ appKey }}</div>
          </div>
          <div class="line-height-30 d-flex">
            <div class="appkey-label heading-grey-13 label">appSecret:</div>
            <div class="heading-dark-13 ml-5 flex-1">{{ appSecret }}</div>
          </div>
        </div>
        <div class="heading-grey-13 mt-30">appKey 和 appSecret 已发送至邮箱，请保存后再关闭对话框。</div>
        <div class="text-right mt-30">
          <console-button class="console-btn-primary" @click="() => { showAppKeyDialog = false }">
            {{ $t('Confirm') }}
          </console-button>
        </div>
      </div>
    </el-dialog>
  </div>`,
})
export default class MiniProjectList extends Vue {
  @Prop({ default: true, type: Boolean }) readonly showTitle!: boolean
  loading = false
  provider: any = {}
  account: any = {
    accountBalance: 0,
  }
  serviceName = ''
  condition = {
    page: 1,
    limit: 10,
    key: undefined,
    marketplaceStatus: 2,
    serviceName: '',
    sortProp: 'stage',
    sortOrder: 'DESC',
  }
  form = {
    enable: false,
    params: [],
    createParams: [],
    deleteParams: [],
  }
  projectList: any[] = []
  hasProductProjects = false
  productProject: any = {}
  useV2APIVendors = ['iflytek-asr']
  XunfeiPackageTypeMapping: any = XunfeiPackageTypeMapping
  marketplacePackageId = ''
  appKey = ''
  appSecret = ''
  appid = ''
  projectWritePermission = user.info.permissions['ProjectManagement'] > 1
  showLaunchDialog = false
  showAppKeyDialog = false
  actionLoading = false
  selectProject: any = {}

  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }

  get getProductTitle() {
    return this.provider.productCnName
  }

  created() {
    this.serviceName = (this.$route.query.serviceName || this.$route.params.serviceName) as string
    this.condition.serviceName = this.serviceName
  }

  async mounted() {
    this.loading = true
    this.account = await getCashInfo()
    await this.refreshData()
    this.loading = false
  }

  async refreshData() {
    await this.getVendorInfo()
    await this.getProjects()
    await this.getCompanyProductProjects()
    await this.getCompanyServicePackage()
  }

  initParam() {
    this.form.params = this.provider['params']
    this.provider['createParams'] && (this.form.createParams = this.provider['createParams'])
    this.provider['deleteParams'] && (this.form.deleteParams = this.provider['deleteParams'])
  }

  async getVendorInfo() {
    try {
      const res = await this.$http.get(`/api/v2/marketplace/vendor/${this.serviceName}`)
      this.provider = res.data
      this.initParam()
    } catch (e) {}
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

  async getCompanyProductProjects() {
    try {
      const ret = await this.$http.get(`/api/v2/marketplace/company/${this.serviceName}/projects`)
      if (ret.data && ret.data.count > 0) {
        this.hasProductProjects = true
        this.productProject = ret.data.rows[0]
        const projectInfo = this.projectList.find((project) => {
          return project.key === this.productProject.appId
        })
        if (projectInfo) {
          this.productProject.name = projectInfo.name || ''
        }
      }
    } catch (e) {}
  }

  async getCompanyServicePackage() {
    try {
      const ret = await this.$http.get(`/api/v2/marketplace/company/${this.serviceName}/packages`)
      if (ret.data && ret.data.length > 0) {
        this.marketplacePackageId = ret.data[ret.data.length - 1].marketplacePackageId
      }
    } catch (e) {}
  }

  async confirmAction(project: any, disabled: number) {
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
    let enabledMsg = this.$t('ConfirmEnable', {
      productName: this.getProductTitle,
      projectName: project.name,
    }) as string
    // 讯飞类套餐包只能用于一个项目
    if (disabled === 0 && this.useV2APIVendors.includes(this.serviceName)) {
      // 查看是否有已绑定的项目
      if (this.hasProductProjects && this.productProject.appId !== project.key) {
        this.$confirm(
          this.$t('AlreadyActiveTip', {
            productName: this.getProductTitle,
            projectName: this.productProject.name,
          }) as string,
          this.$t('ConfirmPaas') as string,
          {
            confirmButtonText: this.$t('Confirm') as string,
            cancelButtonText: this.$t('Cancel') as string,
          }
        )
        return
      }
      enabledMsg = this.$t('ConfirmEnableTypeOnly', {
        productName: this.getProductTitle,
        projectName: project.name,
      }) as string
    }
    this.selectProject = project
    if (disabled === 0 && (this.form.params?.length > 0 || this.form.createParams?.length > 0)) {
      this.showLaunchDialog = true
    } else {
      this.$confirm(
        disabled === 1
          ? (this.$t('ConfirmDisable', { productName: this.getProductTitle, projectName: project.name }) as string)
          : enabledMsg,
        this.$t('ConfirmPaas') as string,
        {
          confirmButtonText: this.$t('Confirm') as string,
          cancelButtonText: this.$t('Cancel') as string,
        }
      )
        .then(() => {
          disabled === 1 ? this.closeService(project) : this.launchService(project)
        })
        .catch(() => {})
    }
  }

  async launchService(project: any) {
    const params: any = {
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

    this.appKey = ''
    this.appSecret = ''
    this.appid = ''
    try {
      this.actionLoading = true
      let url = `/api/v2/marketplace/company/${this.serviceName}`
      if (this.useV2APIVendors.includes(this.serviceName)) {
        url = `/api/v2/marketplace/v2/company/${this.serviceName}`
        params['type'] = this.XunfeiPackageTypeMapping[this.marketplacePackageId]
      }
      const res = await this.$http.post(url, params)
      if (res.data.status === 'success') {
        if (this.serviceName === 'aliyun_voice_async_scan') {
          this.$message.success(`${project.name} ${this.$t('LaunchSuccess', { productName: this.getProductTitle })}`)
        } else {
          this.appKey = res.data.data.appKey
          this.appSecret = res.data.data.appSecret
          if (res.data.data.appid) {
            this.appid = res.data.data.appid
          }
          this.showAppKeyDialog = true
        }
        this.showLaunchDialog = false
        this.refreshData()
      } else {
        this.$message.error(this.$t('NetworkError') as string)
      }
    } catch (e) {
      this.$message.error(this.$t('NetworkError') as string)
    }
    this.actionLoading = false
  }

  async closeService(project: any) {
    const params = {
      enable: false,
      deleteParams: this.form.deleteParams,
      name: project.name,
      projectId: project.projectId,
      appId: project.key,
      vid: project.id,
      serviceName: this.serviceName,
    }
    try {
      const res = await this.$http.delete(`/api/v2/marketplace/company/${this.serviceName}`, { data: params })
      if (res.data.status === 'success') {
        this.$message.success(`${project.name} ${this.$t('CloseSuccess', { productName: this.getProductTitle })}`)
        this.refreshData()
      } else {
        this.$message.error(this.$t('RequestFailed') as string)
      }
    } catch (e) {
      this.$message.error(this.$t('RequestFailed') as string)
    }
  }

  checkActivePermission() {
    return this.account.accountBalance >= 0 || this.provider.payment === 'free'
  }

  goToDeposite() {
    if (this.getCurrency === '$') {
      this.$router.push({ name: 'finance.creditCard' })
    } else {
      this.$router.push({ name: 'finance.alipay' })
    }
  }
}
