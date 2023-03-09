import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import './style.less'
import { Prop } from 'vue-property-decorator'
import { XunfeiPackageTypeMapping } from '@/models/paasModels'
const IconCheck = require('@/assets/icon/checkCircleFill.png')

@Component({
  template: ` <div class="project-list">
    <div class="project-list-title" v-if="showTitle">{{ $t('Projects') }}</div>
    <el-table
      :data="projectList"
      :header-cell-style="{background:'#FAFAFD', padding: '12px 0px', color: '#333333'}"
      v-loading="loading"
    >
      <el-table-column
        :label="$t('ProjectName')"
        prop="name"
        header-align="left"
        class-name="table-content"
      ></el-table-column>
      <el-table-column
        prop="stage"
        :label='$t("Stage")'
        label-class-name="table-title"
        class-name="table-content"
        width="180px"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span :class="{ green: scope.row.stage === 2, yellow: scope.row.stage === 3 }">
            {{ $t(formatStage(scope.row.stage)) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('CreateDate')" prop="createdAt" header-align="left" class-name="table-content">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt | formatDate('YYYY-MM-DD') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Status')" header-align="left" class-name="table-content">
        <template slot-scope="scope">
          <span v-if="scope.row.AppInfo && scope.row.AppInfo.disabled === 0">{{ $t('PaasEnabled') }}</span>
          <span v-else>{{ $t('Inactive') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="action" :label="$t('Action')">
        <template slot-scope="scope">
          <el-switch
            :value="scope.row.AppInfo && scope.row.AppInfo.disabled === 0"
            @change="confirmAction(scope.row, scope.row.AppInfo && scope.row.AppInfo.disabled === 0 ? 1 : 0)"
            active-color="#099DFD"
            inactive-color="#E3E3EC"
          >
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title='$t("ParamsList")' :visible.sync="showLaunchDialog" width="388px" @close="cancel">
      <el-form ref="form" :model="form" class="form">
        <el-form-item
          v-for="(item, index) in form.params"
          :key="index"
          :prop="'params.' + index + '.value'"
          :rules="[{ required: item.required, pattern: getPattern(item), message: $t('Invalid parameter'), trigger: 'blur' }]"
        >
          <template slot="label">
            <span>{{ $t(item.name) }} {{ $t(item.type) }}</span>
            <el-tooltip placement="top" :content="item.desc" class="question" v-if="item.desc">
              <i class="fa fa-question-circle" style="margin-left: 5px"></i>
            </el-tooltip>
          </template>
          <el-input v-model="item.value" class=""></el-input>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form.createParams"
          :key="index"
          :prop="'createParams.' + index + '.value'"
          :rules="[{ required: item.required, pattern: getPattern(item), message: 'invalid parameter', trigger: 'blur' }]"
        >
          <template slot="label">
            <div style="position: relative;">
              <span>{{ $t(item.name) }} {{ $t(item.type) }}</span>
              <el-tooltip placement="top" :content="item.desc" class="question" v-if="item.desc">
                <i class="fa fa-question-circle" style="margin-left: 5px"></i>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="item.value" class=""></el-input>
        </el-form-item>
      </el-form>
      <p class="tip border-top"><i class="el-icon-warning mr-1" style="color: #099DFD;"></i>{{ $t('LaunchTip') }}</p>
      <div class="mt-4 text-right">
        <el-button
          class="w-80 button button-mid"
          @click="checkValid(selectProject)"
          :loading="actionLoading"
          :disabled="actionLoading"
        >
          {{ $t('Save') }}
        </el-button>
        <el-button class="button button-outline-mid-secondary w-80" @click="() => { showLaunchDialog = false }">
          {{ $t('Cancel') }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title='$t("appKey Confirm")'
      :visible.sync="showAppKeyDialog"
      width="500px"
      @close="() => { showAppKeyDialog = false }"
    >
      <div class="p-2">
        <div class="text-center">
          <img :src="IconCheck" style="width: 40px" />
        </div>
        <div class="bk-grey" style="width: auto">
          <div v-if="appid" class="line-height-30">
            appid: <span class="heading-dark-13">{{ appid }}</span>
          </div>
          <div class="line-height-30 d-flex">
            <div class="appkey-label heading-grey-13">appKey:</div>
            <div class="heading-dark-13 ml-5 flex-1">{{ appKey }}</div>
          </div>
          <div class="line-height-30 d-flex">
            <div class="appkey-label heading-grey-13">appSecret:</div>
            <div class="heading-dark-13 ml-5 flex-1">{{ appSecret }}</div>
          </div>
        </div>
        <div class="heading-grey-13">appKey 和 appSecret 已发送至邮箱，请保存后再关闭对话框。</div>
        <div class="text-right mt-30">
          <console-button class="console-btn-primary" @click="() => { showAppKeyDialog = false }">
            {{ $t('Confirm') }}
          </console-button>
        </div>
      </div>
    </el-dialog>
  </div>`,
})
export default class ExtensionProjectList extends Vue {
  @Prop({ default: true, type: Boolean }) readonly showTitle!: boolean
  loading = false
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
  showLaunchDialog = false
  showAppKeyDialog = false
  actionLoading = false
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
  hasProductProjects = false
  productProject: any = {}
  useV2APIVendors = ['iflytek-asr']
  XunfeiPackageTypeMapping: any = XunfeiPackageTypeMapping
  marketplacePackageId = ''
  appKey = ''
  appSecret = ''
  appid = ''
  IconCheck = IconCheck
  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
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
  get getProductTitle() {
    return this.$i18n.locale === 'en' ? this.provider.productEnName : this.provider.productCnName
  }
  getImgUrl(icon: string) {
    const images = require.context('@/assets/image/', false, /\.png$/)
    return images('./' + icon + '.png')
  }
  formatStage(stageIndex: number) {
    return this.stageMap[stageIndex]
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
    let enabledMsg = this.$t('ConfirmEnable', { productName: this.getProductTitle }) as string
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
        disabled === 1 ? (this.$t('ConfirmDisable', { productName: this.getProductTitle }) as string) : enabledMsg,
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
  cancel() {
    this.showLaunchDialog = false
    this.initParam()
    this.$router.push('')
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
  checkValid(project: any) {
    ;(this.$refs['form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.launchService(project)
      } else {
        return false
      }
    })
  }
  checkActivePermission() {
    return this.account.accountBalance >= 0 || this.provider.payment === 'free'
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
  async refreshData() {
    await this.getVendorInfo()
    await this.getProjects()
    await this.getCompanyProductProjects()
    await this.getCompanyServicePackage()
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

  goToDeposite() {
    if (this.getCurrency === '$') {
      this.$router.push({ name: 'finance.creditCard' })
    } else {
      this.$router.push({ name: 'finance.alipay' })
    }
  }
}
