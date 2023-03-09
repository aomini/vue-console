import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'
import { getCashInfo, user } from '@/services'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: ` <div class="mini-project-list">
    <div class="list-title" v-if="showTitle">{{ $t('Projects') }}</div>
    <div class="projects">
      <div class="project-item" v-for="item in projectList" :key="item.id">
        <div class="project-name">{{ item.name }}</div>
        <el-switch
          :value="item.AppInfo && item.AppInfo.disabled === 0"
          @change="(!item.AppInfo || item.AppInfo.disabled === 1) ? showDialogForm(item) : confirmAction(item, item.AppInfo && item.AppInfo.disabled === 0 ? 1 : 0)"
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
    <el-dialog :title="$t('Config')" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item
          :label="item.label || item.name"
          :label-width="formLabelWidth"
          v-for="(item, i) in commonFormParams"
          :key="i"
          required
        >
          <div slot="label" v-if="item.desc" style="display: inline-block">
            <span>{{ item.label || item.name }}</span>
            <el-tooltip placement="top" effect="light" class="mr-10 prject-tooltip">
              <div slot="content">
                <div v-html="item.desc"></div>
              </div>
              <img class="ml-3" width="15" :src="IconQuestion" alt=""
            /></el-tooltip>
          </div>
          <el-input
            v-if="item.type === 'string'"
            v-model="form[item.name]"
            autocomplete="off"
            :placeholder="item.name === 'companyShortName' ? '由英文或数字组成' : '' "
          ></el-input>
          <el-select v-if="item.name === 'package' && item.defaultValue" v-model="form[item.name]" disabled>
            <el-option :label="$t('Selected')" :value="Number(item.defaultValue)"></el-option>
          </el-select>
          <el-input-number
            v-else-if="item.type === 'int' "
            v-model="form[item.name]"
            autocomplete="off"
          ></el-input-number>
          <el-radio-group v-if="item.type === 'radio'" v-model="form[item.name]" style="line-height: 47px;">
            <el-radio v-for="(item, i) in JSON.parse(item.defaultValue)" :label="item.value" :key="i">{{
              item.label
            }}</el-radio>
          </el-radio-group>
          <el-checkbox-group v-if="item.type === 'checkbox'" v-model="form[item.name]">
            <el-checkbox v-for="(group, i) in JSON.parse(item.defaultValue)" :label="group.value" :key="i">
              {{ group.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAction(selectProject, 0)">确 定</el-button>
      </div>
    </el-dialog>
  </div>`,
})
export default class SdkProjectList extends Vue {
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
  form: any = {
    reductionMode: 'soft',
  }
  projectList: any[] = []
  hasProductProjects = false
  productProject: any = {}
  marketplacePackageId = ''
  appKey = ''
  appSecret = ''
  appid = ''
  projectWritePermission = user.info.permissions['ProjectManagement'] > 1
  showLaunchDialog = false
  showAppKeyDialog = false
  selectProject: any = {}
  dialogFormVisible = false
  commonFormParams = []
  formLabelWidth = '150px'
  IconQuestion = IconQuestion

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
    const enabledMsg = this.$t('ConfirmEnable', {
      productName: this.getProductTitle,
      projectName: project.name,
    }) as string
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
    this.loading = true
    this.dialogFormVisible = false
    const res = await this.$http.post(`/api/v2/marketplace/sdk-deliver/${this.serviceName}/activated`, {
      ...this.form,
      projectId: project.projectId,
      vid: project.id,
      appId: project.key,
    })
    if (res.data.status === 'success') {
      this.$message('激活成功')
      this.refreshData()
    } else {
      this.$message(JSON.stringify(res.data))
    }
    this.loading = false
  }

  async closeService(project: any) {
    const params = {
      projectId: project.projectId,
      appId: project.key,
      vid: project.id,
      serviceName: this.serviceName,
    }
    try {
      const res = await this.$http.delete(`/api/v2/marketplace/sdk-deliver/${this.serviceName}`, { data: params })
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

  showDialogForm(project: any) {
    this.selectProject = project
    this.dialogFormVisible = true
    if (this.provider.projectCreateParam) {
      this.commonFormParams = this.provider.projectCreateParam
      this.commonFormParams.forEach((item: any) => {
        if (item.type === 'string') {
          this.form[item.name] = item.defaultValue
        }
        if (item.name === 'package') {
          this.form[item.name] = Number(item.defaultValue)
        }
        if (item.type === 'checkbox') {
          this.$set(this.form, item.name, [])
        }
      })
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
