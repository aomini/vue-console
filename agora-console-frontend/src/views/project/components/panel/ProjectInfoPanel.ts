import Vue from 'vue'
import Component from 'vue-class-component'
import { getLifeCycle, sendCertificateEmail, updateProject, updateProjectStatus, user } from '@/services'
import { CertificateBackupStatus } from '@/common/project'
import { ProjectStage, ProjectStatus } from '@/models'
import 'intro.js/introjs.css'
import CertificateBox from '@/components/CertificateBox'
import WebDemo from '@/views/project/components/webDemo/WebDemo'
import PasswordInput from '@/components/PasswordInput'
import moment from 'moment'
import { ProductType } from '@/models/ProductModels'
import { productConfig } from '@/services/product'
import CertificateBackupBox from '@/components/CertificateBackupBox'
import TokenBox from '@/views/project/components/panel/TokenBox'
import { Prop, Watch } from 'vue-property-decorator'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'

@Component({
  components: {
    'password-input': PasswordInput,
    'certificate-box': CertificateBox,
    'certificate-backup-box': CertificateBackupBox,
    'token-box': TokenBox,
    'web-demo': WebDemo,
    'two-factor-confirm': TwoFactorConfirm,
  },
  template: `
    <div class="project-info-panel" v-loading="loading">
      <div class="project-module">
        <div class="project-module__title">
          {{ $t('BasicInfo') }}
          <el-tooltip :content="$t('edit')" placement="top">
            <i
              class="iconfont iconicon-bianjineirong f-18 popover-btn cursor-pointer"
              @click="$emit('editProject')"
            ></i>
          </el-tooltip>
        </div>
        <template v-if="vendorInfo.key">
          <el-row>
            <el-col :span="4">
              <span>{{ $t('Project name') }}</span>
            </el-col>
            <el-col :span="8">
              <span>{{ vendorInfo.name }}</span>
            </el-col>
            <el-col :span="4">
              <span>{{ $t('CreatedTime') }}</span>
            </el-col>
            <el-col :span="8">
              <span>{{ formatCreatedTime }}</span>
            </el-col>
          </el-row>
          <el-row type="flex" align="middle">
            <el-col :span="4">
              <span>{{ $t('APPID') }}</span>
            </el-col>
            <el-col :span="8">
              <div class="w-200">
                <password-input
                  :passwordValue="vendorInfo.key"
                  :isDisabled="true"
                  :size="'small'"
                  type="text"
                ></password-input>
              </div>
            </el-col>
            <el-col :span="4">
              <span>{{ $t('UseCase') }}</span>
            </el-col>
            <el-col :span="8">
              <span>{{ selectedProductType }}</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">
              <span>{{ $t('Stage') }}</span>
            </el-col>
            <el-col :span="8">
              <span v-if="vendorStage === 2" class="stage-live">{{ $t('Live') }}</span>
              <span v-else class="stage-test">{{ $t('Testing') }}</span>
            </el-col>
            <el-col :span="4">
              <span>{{ $t('Project status') }}</span>
            </el-col>
            <el-col :span="8">
              <el-switch
                v-model="vendorInfo.status"
                @change="statusChange"
                :active-value="1"
                :inactive-value="2"
              ></el-switch>
            </el-col>
          </el-row>
        </template>
      </div>
      <div class="project-module">
        <div class="project-module__title">{{ $t('AppConfiguration') }}</div>
        <el-row :gutter="20">
          <el-col :span="4">
            <span>{{ $t('App certificate') }}</span>
            <el-tooltip :content="$t('appCertificateHover')" placement="right" popper-class="mw-250" effect="light">
              <i class="el-icon-info project-tooltip"></i>
            </el-tooltip>
          </el-col>
          <el-col :span="7">
            <certificate-box
              type="primary"
              :enable="!!vendorInfo.signkey"
              :keyValue="vendorInfo.signkey"
              :enableCert="() => showEnableMainCertConfirm = true"
              :allowDelete="false"
              :accountBlocked="accountBlocked"
            >
            </certificate-box>
          </el-col>
          <el-col v-if="!!vendorInfo.signkey" :span="7">
            <certificate-backup-box
              type="secondary"
              class="two-factor-confirm-cert"
              v-if="!!vendorInfo.signkey"
              :enable="!!vendorInfo.signkeyBackup"
              :keyValue="vendorInfo.signkeyBackup"
              :backupCertStatus="backupCertStatus"
              :allowDelete="true"
              :switchCert="() => showSwitchCertConfirm = true"
              :enableCert="() => showEnableBackupCertConfirm = true"
              :deleteCert="deleteBackupCert"
              :updateBackupCertStatus="updateBackupCertStatus"
            >
            </certificate-backup-box>
          </el-col>
          <el-col v-if="vendorInfo.allowStaticWithDynamic || (!vendorInfo.signkey)" :span="5">
            <certificate-box
              v-if="vendorInfo.allowStaticWithDynamic || (!vendorInfo.signkey)"
              type="none"
              :enable="true"
              :deleteCert="deleteNoCert"
              :allowDelete="!!vendorInfo.signkey || !!vendorInfo.signkeyBackup"
            >
            </certificate-box>
          </el-col>
        </el-row>
      </div>
      <token-box :show-token-btn="!!vendorInfo.signkey && !vendorInfo.allowStaticWithDynamic"></token-box>
      <web-demo :vendor-info="vendorInfo" :account-blocked="accountBlocked"></web-demo>
      <div v-if="showTwoFactorVerification">
        <two-factor-confirm
          :afterSuccess="() => afterVerificationSuccess()"
          :afterFail="() => {}"
          :cancelVerification="() => cancelVerification()"
        >
        </two-factor-confirm>
      </div>
      <div v-if="isTwoFactorVerificationVisible">
        <two-factor-confirm
          :afterSuccess="() => delSecondaryCerByTowVerificationSuccess()"
          :afterFail="() => {}"
          :cancelVerification="() => isTwoFactorVerificationVisible = false"
        ></two-factor-confirm>
      </div>
      <el-dialog :title='$t("EnableSecondaryCertTitle")' :visible.sync="showEnableBackupCertConfirm" width="380px">
        <div class="p-2">
          <div>
            <span>{{ $t('EnableSecondaryCertDesc') }} </span>
            <a :href='$t("CertDocLink")' target="_blank"> {{ $t('EnableSecondaryCertDesc2') }}</a>
          </div>
          <div class="ml-auto text-right mt-20">
            <console-button class="console-btn-primary" @click="enableBackupCert">
              {{ $t('Confirm') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showEnableBackupCertConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("EnablePrimaryCertTitle")' :visible.sync="showEnableMainCertConfirm" width="380px">
        <div class="p-2">
          <div>
            <span>{{ $t('EnablePrimaryCertDesc') }} </span>
            <a :href='$t("CertDocLink")' target="_blank"> {{ $t('EnableSecondaryCertDesc2') }}</a>
          </div>
          <div class="ml-auto text-right mt-20">
            <console-button class="console-btn-primary" @click="enablePrimaryCert">
              {{ $t('Confirm') }}
            </console-button>
            <console-button
              class="console-btn-white"
              @click="() => 
          showEnableMainCertConfirm = false"
            >
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("SetAsPrimaryCert")' :visible.sync="showSwitchCertConfirm" width="380px">
        <div class="p-2">
          <div>{{ $t('SetAsPrimaryCertDesc') }}</div>
          <div class="text-right mt-20">
            <console-button class="console-btn-primary" @click="switchToPrimary"> {{ $t('Confirm') }}</console-button>
            <console-button class="console-btn-white" @click="() => showSwitchCertConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("DeleteAuthMethod")' :visible.sync="showDeleteCertConfirm" width="380px">
        <div class="p-2">
          <span> {{ $t('DeleteAuthMethodDesc') }} </span>
          <div class="text-right mt-20">
            <console-button class="console-btn-danger" @click="deleteCert"> {{ $t('Delete') }}</console-button>
            <console-button class="console-btn-white" @click="() => showDeleteCertConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("DeleteAuthMethod")' :visible.sync="showDeleteBackCertConfirm" width="380px">
        <div class="p-2">
          <span> {{ $t('DeleteAuthMethodDesc') }} </span>
          <div class="text-right mt-20">
            <console-button class="console-btn-danger" @click="() => showTwoFactorBackCert()">
              {{ $t('Delete') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showDeleteBackCertConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("DeleteAuthMethod")' :visible.sync="showCreatorEmailConfirm" width="380px">
        <div class="p-2">
          <b> {{ $t('Warning') }} </b>
          <span> {{ $t('DeleteCertDesc1') }} </span>
          <div class="mb-10">{{ $t('DeleteCertDesc2') }}</div>
          <el-input class="content-input" :placeholder='$t("Account owner email address")' v-model="creatorEmail">
          </el-input>
          <div class="text-right mt-20">
            <console-button class="console-btn-danger" @click="checkCreatorEmail">
              {{ $t('Next Step') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showCreatorEmailConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class ProjectInfoPanel extends Vue {
  @Prop({ type: Object }) readonly project!: any

  activeName = 'project-info'
  vendorInfo: any = {
    signkey: '',
    key: '',
    name: '',
    createdAt: '',
    status: 1,
    stage: ProjectStage.Testing,
    id: 0,
  }
  vendorName: string = ''
  vendorStage: number = ProjectStage.Testing
  projectPopoverVisible = false
  isTwoFactorVerificationVisible = false
  showDeleteBackCertConfirm = false
  tokenSwitch = 0
  showAbout = false
  user = user
  loading = false
  accountBlocked = false
  creatorEmail = ''
  showSwitchCertConfirm = false
  showDeleteCertConfirm = false
  showCreatorEmailConfirm = false
  showEnableMainCertConfirm = false
  showEnableBackupCertConfirm = false
  isDeleteNoCert = false
  showTwoFactorVerification = false
  restfulEnabled = false
  isCN = user.info.company.area === 'CN'
  isCNLang = user.info.language === 'chinese'
  isJP = user.info.company.country === 'JP'
  emailStatus = {
    NotVerified: 0,
    Verified: 1,
  }
  agoraSource = 1
  backupCertStatus = CertificateBackupStatus.DEFAULT
  productTypeList: ProductType[] = []

  get formatCreatedTime() {
    return moment(this.vendorInfo.createdAt).format('YYYY/MM/DD')
  }

  get selectedProductType() {
    if (this.vendorInfo.productTypeId) {
      const productType = this.productTypeList.filter(
        (item: ProductType) => item.productTypeId === this.vendorInfo.productTypeId
      )[0]
      return this.isCNLang ? productType?.nameCn : productType?.nameEn
    }
    return '-'
  }

  @Watch('project')
  async onProjectChanged() {
    await this.getProject()
  }

  async mounted() {
    if (!this.isCN) {
      this.$router.replace({
        name: 'editProjectEn',
        params: {
          id: this.$route.params.id,
        } as any,
      })
    }
    this.loading = true
    const lifeCycleInfo = await getLifeCycle()
    this.accountBlocked =
      lifeCycleInfo.financialStatus === 2 || lifeCycleInfo.financialStatus === 3 || lifeCycleInfo.financialStatus === 4
    this.productTypeList = (await productConfig.getProductMetaData()) as ProductType[]
    await this.getProject()
    await this.getRestFulKeys()
    this.loading = false
    await this.getBackupCertStatus()
  }

  async getProject() {
    // const projectId = this.$route.params.id
    try {
      // const project = await getProjectInfo(projectId)
      const project = this.project
      this.vendorInfo = project
      this.vendorName = project.name
      this.vendorStage = project.stage
      this.tokenSwitch = !project.vendorSignal || project.vendorSignal.needToken === 0 ? 1 : 0
    } catch (e) {
      console.info(e)
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' })
    }
  }
  async onClickSave() {
    const name = this.vendorInfo.name.trim()
    const pattern = new RegExp("[`~#$^*=|':;',\\[\\]./?~#￥……&*——|‘；：”“'。，、？]")
    if (pattern.test(name)) {
      return this.$message.error(this.$t('ProjectNameSpecialChar') as string)
    }
    if (name.length < 1) {
      this.$message.error(this.$t('ProjectNameRequired') as string)
      return
    }
    this.loading = true
    try {
      await updateProject(this.$route.params.id, name, this.tokenSwitch === 1, this.vendorInfo.stage, '')
      this.$message({
        message: this.$t('UpdateProjectSuccess') as string,
        type: 'success',
      })
      this.projectPopoverVisible = false
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
    }
    this.loading = false
  }

  async updateProjectStatus() {
    this.loading = true
    try {
      await updateProjectStatus(this.$route.params.id, this.vendorInfo.status === 1)
      this.$message({
        message: this.$t('UpdateProjectSuccess') as string,
        type: 'success',
      })
    } catch (e) {
      this.$message.error(this.$t('GerneralError') as string)
    }
    this.loading = false
  }

  async onEnable() {
    try {
      if (!this.user.info.email) {
        this.$message.warning(this.$t('EmailNotExist') as string)
        return
      }
      await sendCertificateEmail(this.$route.params.id)
      this.showAbout = false
      this.$message({
        message: this.$t('CertificateEmailSuccess') as string,
        type: 'success',
      })
    } catch (e) {
      this.$message.warning(this.$t('EmailFail') as string)
    }
  }

  async getRestFulKeys() {
    try {
      const { data } = await this.$http.get(`/api/v2/restful-api/keys/own`)
      this.restfulEnabled = typeof data !== 'string' && data.length > 0
    } catch (e) {
      this.$message.error(this.$t('FailedGetRestfulKey') as string)
    }
  }

  tokenSwitchChange(val: number) {
    const notificationMsg = val === 1 ? this.$t('ConfirmOpenToken') : this.$t('ConfirmCloseToken')
    this.$confirm(notificationMsg as string, this.$t('Warning') as string, {
      confirmButtonText: this.$t('Confirm') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    }).catch(() => {
      this.tokenSwitch = val === 1 ? 0 : 1
    })
  }
  statusChange(val: number) {
    const notificationMsg = this.$t('statusConfirm') as string
    if (this.vendorInfo.status === ProjectStatus.INACTIVE) {
      this.$confirm(notificationMsg, this.$t('Warning') as string, {
        confirmButtonText: this.$t('Confirm') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
      })
        .then(() => {
          this.showTwoFactorVerification = true
        })
        .catch(() => {
          this.vendorInfo.status = val === ProjectStatus.INACTIVE ? ProjectStatus.ACTIVE : ProjectStatus.INACTIVE
        })
    } else {
      this.showTwoFactorVerification = true
    }
  }
  afterVerificationSuccess() {
    this.showTwoFactorVerification = false
    this.updateProjectStatus()
  }
  showTwoFactorBackCert() {
    this.showDeleteBackCertConfirm = false
    this.isTwoFactorVerificationVisible = true
  }
  delSecondaryCerByTowVerificationSuccess() {
    this.isTwoFactorVerificationVisible = false
    this.deleteCert()
  }
  cancelVerification() {
    this.showTwoFactorVerification = false
    this.vendorInfo.status =
      this.vendorInfo.status === ProjectStatus.INACTIVE ? ProjectStatus.ACTIVE : ProjectStatus.INACTIVE
  }
  stageSwitchChange(val: number) {
    this.vendorInfo.stage = val
  }

  async createNewRestFulKey() {
    try {
      await this.$http.post('/api/v2/restful-api/keys')
    } catch (e) {
      if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ParameterError') as string)
      } else if (e.response.data.code === 15005) {
        this.$message.error(this.$t('RestfulKeyOutOfLimit') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
    }
  }

  async enablePrimaryCert() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/enable-primary-cert`)
      this.showEnableMainCertConfirm = false
      this.$message.success(this.$t('EnablePrimarySuccess') as string)
      await this.updateProject()
    } catch (e) {
      this.$message.warning(this.$t('EnablePrimaryFail') as string)
    }
    this.loading = false
  }
  async enableBackupCert() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/enable-backup-cert`)
      this.showEnableBackupCertConfirm = false
      this.$message.success(this.$t('EnableSecondarySuccess') as string)
      await this.updateProject()
      await this.getBackupCertStatus()
    } catch (e) {
      this.$message.warning(this.$t('EnableSecondaryFail') as string)
    }
    this.loading = false
  }
  async getBackupCertStatus() {
    const res = await this.$http.get(`/api/v2/project/${this.vendorInfo.projectId}/backup-cert`)
    if (res.data?.status) {
      this.backupCertStatus = res.data.status
    } else {
      this.backupCertStatus = CertificateBackupStatus.DEFAULT
    }
  }
  async updateBackupCertStatus(status: number) {
    await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/update-backup-cert`, {
      status,
    })
    await this.getBackupCertStatus()
    await this.updateProject()
  }
  async deleteCert() {
    this.loading = true
    try {
      if (this.isDeleteNoCert) {
        await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/delete-no-cert`)
      } else {
        await this.$http.delete(`/api/v2/project/${this.vendorInfo.projectId}/delete-backup-cert`)
      }
      await this.getBackupCertStatus()
      this.showDeleteCertConfirm = false
      this.$message.success(this.$t('DeleteCertSuccess') as string)
      await this.updateProject()
    } catch (e) {
      this.$message.warning(this.$t('DeleteCerFail') as string)
    }
    this.loading = false
  }
  async switchToPrimary() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/switch-primary-cert`)
      this.showSwitchCertConfirm = false
      await this.updateProject()
      this.$message.success(this.$t('SwitchSuccess') as string)
    } catch (e) {
      this.$message.warning(this.$t('SwitchFail') as string)
    }
    this.loading = false
  }
  async checkCreatorEmail() {
    try {
      const checkRes = await this.$http.post(`/api/v2/account/check-creator-email`, { creatorEmail: this.creatorEmail })
      if (checkRes.data) {
        this.showCreatorEmailConfirm = false
        this.showDeleteCertConfirm = true
      } else {
        this.$message.warning(this.$t('IncorrectEmail') as string)
      }
      return
    } catch (e) {
      this.$message.warning(this.$t('FailToCheckEmail') as string)
    }
  }
  deleteBackupCert() {
    this.showDeleteBackCertConfirm = true
    this.isDeleteNoCert = false
  }
  deleteNoCert() {
    console.info('deleteCert')
    this.isDeleteNoCert = true
    this.showCreatorEmailConfirm = true
  }

  switchToLiveStatus() {
    this.vendorInfo.stage = ProjectStage.Live
    this.onClickSave()
  }

  async updateProject() {
    await this.getProject()
    await this.$emit('updateProject')
  }
}
