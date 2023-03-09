import Vue from 'vue'
import Component from 'vue-class-component'
import { getProjectInfo, sendCertificateEmail, updateProject, updateProjectStatus, user } from '@/services'
import { CertificateBackupStatus } from '@/common/project'
import {
  ExtensionExtraDataModel,
  ExtensionListModel,
  ExtensionModel,
  KTVStatu,
  ProjectStage,
  ProjectStatus,
} from '@/models'
import 'intro.js/introjs.css'
import { productConfig } from '@/services/product'
import { Prop } from 'vue-property-decorator'
import ExtensionBox from '@/views/project/components/extensionBox/ExtensionBox'
import { enableCloudPlayer, enableMiniApp, getApaasConfiguration, updateApaasConfiguration } from '@/services/apaas'
import Cookie from 'js-cookie'
import introJs from 'intro.js'
import { CloudTypeMap } from '@/models/uapModels'
import EditContentCenter from '@/views/project/EditContentCenter'
import EnableAgoraChatDialog from '@/views/project/AgoraChat/EnableAgoraChatDialog'
import EnableCloudProxy from '@/views/project/CloudProxy/EnableCloudProxy'
import ProductSelector from '@/views/project/components/productSelector/ProductSelector'

@Component({
  components: {
    'extension-box': ExtensionBox,
    'edit-content-center': EditContentCenter,
    'enable-agora-chat': EnableAgoraChatDialog,
    'enable-cloud-proxy': EnableCloudProxy,
    'product-selector': ProductSelector,
  },
  template: `
    <div class="project-info-panel" v-loading="loading">
      <div class="project-module">
        <el-row :gutter="20" class="extension-content">
          <template v-for="extension in extensionsMetaData">
            <el-col
              :xs="6"
              :sm="12"
              :md="8"
              :lg="6"
              v-for="item in extension.children"
              :key="item.id"
              v-if="item.isPublic === 1"
            >
              <extension-box
                :name="isCNLang ? item.nameCn : item.nameEn"
                :description="isCNLang ? item.descriptionCn : item.descriptionEn"
                :icon="item.icon"
                :status="extensionsStatus[item.extensionId]"
                :showDocs="showDocs"
                :track-id="item.trackId"
                :enableFunc="item.enableFunc"
                :enable-btn-text="item.enableBtnText"
                :config-func="item.configFunc"
                :config-btn-text="item.configBtnText"
                :account-blocked="accountBlocked"
                :show-sign-key-tooltip="!!item.needToken && !(vendorInfo.signkey && !vendorInfo.allowStaticWithDynamic)"
                :box-loading="extensionsLoading[item.extensionId]"
              >
              </extension-box>
            </el-col>
          </template>
        </el-row>
      </div>
      <el-dialog :title='$t("APaasConfig")' :visible.sync="showWhiteboardToken" width="620px">
        <div class="p-2">
          <el-checkbox class="mb-2" v-model="netlessEnabled" @change="onAPaasChecked('netless')">
            {{ $t('Whiteboard') }}
            <a :href='$t("WhiteboardDocLink")' class="link ml-8" target="_blank"> {{ $t('ApaasTip') }}</a>
          </el-checkbox>
          <el-input
            type="textarea"
            :rows="8"
            v-model="netlessJson"
            :disabled="!netlessEnabled"
            :placeholder="getNetlessPlaceHolder"
          ></el-input>
          <p class="error">{{ netlessError }}</p>
          <el-checkbox class="mb-2 mt-30" v-model="cloudRecordingEnabled" @change="onAPaasChecked('cloudRecording')">
            {{ $t('Cloud Recording') }}
            <a :href='$t("CloudRecordingDocLink")' class="link ml-8" target="_blank"> {{ $t('ApaasTip') }}</a>
          </el-checkbox>
          <el-input
            type="textarea"
            :rows="8"
            v-model="cloudRecordingJson"
            :disabled="!cloudRecordingEnabled"
            :placeholder="getCloudRecordingPlaceHolder"
          ></el-input>
          <p class="error">{{ cloudRecordingError }}</p>
          <el-checkbox class="mb-2 mt-30" v-model="IMEnabled" @change="onAPaasChecked('IM')">
            {{ $t('IM') }}
            <a :href='$t("CloudRecordingDocLink")' class="link ml-8" target="_blank"> {{ $t('ApaasTip') }}</a>
          </el-checkbox>
          <el-input
            type="textarea"
            :rows="8"
            v-model="IMJson"
            :disabled="!IMEnabled"
            :placeholder="getIMPlaceHolder"
          ></el-input>
          <p class="error">{{ IMError }}</p>
          <div class="mt-20 text-center">
            <console-button class="console-btn-primary" @click="updateApaasConfig" :loading="apaasLoading">
              {{ $t('Update') }}
            </console-button>
            <console-button class="console-btn-white w-140" @click="() => showWhiteboardToken = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        :title='$t("Enable authentication")'
        :visible.sync="showAuthenticationOverlay"
        width="400px"
        :show-close="false"
      >
        <div class="authentication-box">
          <div class="authentication-description mb-20">
            {{
              $t(
                'Enabling co-host authentication requires changing your app logic. Ensure that you read the document before enabling this service.'
              )
            }}
          </div>
          <a :href="$t('cohostAuthenticationUrl')" target="_blank">{{ $t('How do I use co-host authentication') }}</a>
          <div class="authentication-checkbox mt-20">
            <el-checkbox v-model="enableOpenAuthentication"></el-checkbox>
            <span class="authentication-checkbox-text">
              {{
                $t(
                  "I can't disable co-host token authentication after I enable it. I have read and understand the information needed to prepare for enabling it."
                )
              }}
            </span>
          </div>
          <div class="authentication-button-group mt-20 text-right">
            <console-button
              class="console-btn-primary"
              :disabled="!enableOpenAuthentication"
              @click="openAuthentication"
            >
              {{ $t('Enable') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showAuthenticationOverlay = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("EnableWhiteboardTitle")' :visible.sync="showEnableWhiteboardConfirm" width="380px">
        <div class="p-2">
          <div>
            <span>{{ $t('EnableWhiteboardDesc') }} </span>
          </div>
          <div class="mt-20 text-right">
            <console-button class="console-btn-primary" @click="enableWhiteboard()">
              {{ $t('Confirm') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showEnableWhiteboardConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        :title="$t('Migrate Netless Projects to Agora.io Console')"
        :visible.sync="showNetlessDialog"
        width="450px"
        top="30vh"
      >
        <p class="f-12">{{ $t('Netless Tip 1') }}</p>
        <p class="f-12">{{ $t('Netless Tip 2', { email: user.email }) }}</p>
        <p class="f-12">{{ $t('Netless Tip 3') }}</p>
        <el-checkbox v-model="netlessAgree">
          <div class="checkbox-text">
            {{ $t('I confirm that I own this Netless account and agree to the migration') }}
          </div>
        </el-checkbox>
        <div class="button-line mt-2">
          <console-button
            type="primary"
            size="small"
            class="console-btn-primary"
            @click="migrate()"
            :disabled="!netlessAgree || migrateLoading"
            :loading="migrateLoading"
            >{{ $t('Migrate') }}
          </console-button>
          <console-button size="small" class="console-btn-white" @click="() => showNetlessDialog = false"
            >{{ $t('Cancel') }}
          </console-button>
        </div>
      </el-dialog>
      <el-dialog
        :title="$t('Migrate Netless Projects to Agora.io Console')"
        :visible.sync="showNetlessDialog"
        width="450px"
        top="30vh"
      >
        <p class="f-12">{{ $t('Netless Tip 1') }}</p>
        <p class="f-12">{{ $t('Netless Tip 2', { email: user.email }) }}</p>
        <p class="f-12">{{ $t('Netless Tip 3') }}</p>
        <el-checkbox v-model="netlessAgree">
          <div class="checkbox-text">
            {{ $t('I confirm that I own this Netless account and agree to the migration') }}
          </div>
        </el-checkbox>
        <div class="button-line mt-2">
          <console-button
            type="primary"
            size="small"
            class="console-btn-primary"
            @click="migrate()"
            :disabled="!netlessAgree || migrateLoading"
            :loading="migrateLoading"
            >{{ $t('Migrate') }}
          </console-button>
          <console-button size="small" class="console-btn-white" @click="() => showNetlessDialog = false"
            >{{ $t('Cancel') }}
          </console-button>
        </div>
      </el-dialog>
      <el-dialog :title='$t("EnableLink")' :visible.sync="showIotDialog" width="620px">
        <div class="p-2">
          <div class="mb-10">{{ $t('IotRegionHint') }}</div>
          <div>
            <el-radio v-model="dataCenter" label="CN_EAST_1">{{ $t('China') }}</el-radio>
            <el-radio v-model="dataCenter" label="US_EAST_1">{{ $t('US_EAST') }}</el-radio>
          </div>
          <p>{{ $t('EnableLinkDesc') }}</p>
          <div style="background: #f9f9fc; padding: 10px 20px;">
            <p>
              <strong>{{ $t('ExtensionsStatus') }}</strong>
            </p>
            <p>
              <i :class="restfulEnabled ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionsRestFulStatus') }}</span>
            </p>
            <p>
              <i :class="extensionsStatus.AgoraChat ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionChatStatus') }}</span>
            </p>
            <p>
              <i :class="extensionsStatus.CloudRecording ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionsCloudRecordingStatus') }}</span>
            </p>
            <p>
              <i :class="extensionsStatus.MiniApp ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionsMiniAppStatus') }}</span>
            </p>
          </div>
          <p>{{ $t('EnableLinkDescAfter') }}</p>
          <div class="mt-20" style="text-align: right">
            <el-button size="medium" @click="() => showIotDialog = false">
              {{ $t('Cancel') }}
            </el-button>
            <el-button type="primary" size="medium" @click="prepareIotExtensions" :loading="extensionsLoading.iot">
              {{ $t('Enable') }}
            </el-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog :title='$t("EnableFlexibleClassroom")' :visible.sync="showFlexibleClassroom" width="620px">
        <div class="p-2">
          <p>{{ $t('EnableFlexibleClassroomDesc') }}</p>
          <div style="background: #f9f9fc; padding: 10px 20px;">
            <p>
              <strong>{{ $t('ExtensionsStatus') }}</strong>
            </p>
            <p>
              <i :class="restfulEnabled ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionsRestFulStatus') }}</span>
            </p>
            <p>
              <i :class="extensionsStatus.Whiteboard ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionsWhiteboardStatus') }}</span>
            </p>
            <p>
              <i :class="extensionsStatus.CloudRecording ? 'el-icon-success green' : 'el-icon-error'"></i>
              <span>{{ $t('ExtensionsCloudRecordingStatus') }}</span>
            </p>
          </div>
          <p>{{ $t('EnableFlexibleClassroomDescAfter') }}</p>
          <div class="mt-20" style="text-align: right">
            <console-button class="console-btn-white w-140" @click="() => showFlexibleClassroom = false">
              {{ $t('Cancel') }}
            </console-button>
            <console-button
              v-if="extensionsStatus.APaaS"
              class="console-btn-primary"
              @click="pageGoToApaasConfiguration"
              :loading="apaasLoading"
            >
              {{ $t('APaasConfig') }}
            </console-button>
            <console-button v-else class="console-btn-primary" @click="prepareApaasExtensions" :loading="apaasLoading">
              {{ $t('Enable') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        :title='$t("EnableClientScreenshotUploadTitle")'
        :visible.sync="showEnableModerationConfirm"
        width="380px"
      >
        <div class="p-2">
          <div>
            <span>{{ $t('EnableClientScreenshotUploadDesc') }} </span>
          </div>
          <div class="mt-20 text-right">
            <console-button class="console-btn-primary" @click="enableModerationUapSetting()">
              {{ $t('Confirm') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showEnableModerationConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
      <enable-agora-chat
        v-if="showChatDialog"
        :isCN="isCN"
        :chatLoading="chatLoading"
        :enableChat="enableChat"
        :cancelEnable="() => showChatDialog = false"
      ></enable-agora-chat>
      <enable-cloud-proxy
        v-if="showCloudDialog"
        :loading="cloudLoading"
        :cancelEnable="() => showCloudDialog = false"
        :enableCloud="updateCloudProxyStatus"
      ></enable-cloud-proxy>
      <div v-if="showContentCenterDialog">
        <edit-content-center
          :info="contentCenterInfo"
          :showConfigContentCenter="() => showConfigContentCenter(false, true)"
          :companyName="user.info.company.name"
          :projectId="$route.params.id"
        ></edit-content-center>
      </div>
    </div>
  `,
})
export default class ServiceConfigPanel extends Vue {
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
  useCase = []
  useCaseList: any = []
  useCaseData = []
  useCaseName = ''
  tokenSwitch = 0
  showAbout = false
  showWhiteboardToken = false
  showFlexibleClassroom = false
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
  cloudRecordingJson = ''
  netlessJson = ''
  apaasLoading = false
  netlessError = ''
  cloudRecordingError = ''
  IMJson = ''
  IMError = ''
  netlessEnabled = false
  cloudRecordingEnabled = false
  IMEnabled = false
  restfulEnabled = false
  showAuthenticationOverlay = false
  enableOpenAuthentication = false
  whiteboardLoading = false
  showEnableWhiteboardConfirm = false
  isCN = user.info.company.area === 'CN'
  isJP = user.info.company.country === 'JP'
  isCNLang = user.info.language === 'chinese'
  showNetlessDialog = false
  netlessAgree = false
  migrateLoading = false
  emailStatus = {
    NotVerified: 0,
    Verified: 1,
  }
  agoraSource = 1
  showContentCenterDialog = false
  contentCenterInfo: any = {}
  backupCertStatus = CertificateBackupStatus.DEFAULT
  AgoraChatEnabled = false
  isChatSubscription = false
  showChatDialog = false
  showCloudDialog = false
  chatLoading = false
  cloudLoading = false
  showDocs = false
  docsLoading = false
  showEnableModerationConfirm = false
  showIotDialog = false
  CloudTypeMap = CloudTypeMap
  extensionsStatus = {
    iot: false,
    APaaS: false,
    Whiteboard: false,
    CloudRecording: false,
    CloudPlayer: false,
    ContentCenter: false,
    CoHost: false,
    MiniApp: false,
    FPA: false,
    FusionCDN: false,
    AgoraChat: false,
    MediaPush: false,
    CloudProxy: false,
    NCS: false,
    ContentModeration: false,
  }
  extensionsLoading = {
    iot: false,
    APaaS: false,
    Whiteboard: false,
    CloudRecording: false,
    CloudPlayer: false,
    ContentCenter: false,
    CoHost: false,
    MiniApp: false,
    FPA: false,
    FusionCDN: false,
    AgoraChat: false,
    MediaPush: false,
    CloudProxy: false,
    NCS: false,
    ContentModeration: false,
  }
  docsLink = ''
  demoList = []
  extensionsMetaData: ExtensionListModel[] = []
  dataCenter = 'CN_EAST_1'

  get extensionExtraData(): ExtensionExtraDataModel[] {
    return [
      {
        id: 'iot',
        enableFunc: () => this.showIotConfirmDialog(),
        statusFunc: () => this.getIotInfo(),
      },
      {
        id: 'APaaS',
        configBtnText: 'Config',
        configFunc: () => this.pageGoToApaasConfiguration(),
        enableFunc: () => this.showApaasConfirmDialog(),
        statusFunc: () => this.getApaasInfo(),
      },
      {
        id: 'Whiteboard',
        configBtnText: 'Config',
        configFunc: () => this.goToWhiteboardConfig(),
        enableFunc: () => this.comfirmShowEnableWhiteboard(),
        statusFunc: () => this.getWhiteboardInfo(),
      },
      {
        id: 'CloudRecording',
        configBtnText: 'View usage',
        configFunc: () => this.goToCloudRecording(),
        enableFunc: () => this.goToCloudRecording(),
      },
      {
        id: 'CloudPlayer',
        configBtnText: 'View usage',
        configFunc: () => this.goToCloudPlayer(),
        enableFunc: () => this.goToCloudPlayer(),
      },
      {
        id: 'ContentCenter',
        configBtnText: 'Config',
        enableFunc: () => this.showConfigContentCenter(true),
        configFunc: () => this.showConfigContentCenter(true),
        statusFunc: () => this.getContentCenterInfo(),
      },
      {
        id: 'ContentModeration',
        configBtnText: 'Config',
        enableFunc: () => this.goToModerationConfig(),
        configFunc: () => this.goToModerationConfig(),
      },
      {
        id: 'MediaPush',
        configBtnText: 'Config',
        enableFunc: () => this.goToRTMPConfig(),
        configFunc: () => this.goToRTMPConfig(),
      },
      // {
      //   id: 'Chat',
      //   configBtnText: 'Config',
      //   enableFunc: () => {
      //     this.showChatDialog = true
      //   },
      //   configFunc: () => this.goToIMDetail(),
      // },
      {
        id: 'CoHost',
        configBtnText: 'Enabled',
        enableFunc: () => (this.showAuthenticationOverlay = true),
      },
      {
        id: 'CloudProxy',
        enableBtnText: this.isJP ? 'Contact' : 'Enable',
        configBtnText: this.isJP ? 'Contact' : 'Config',
        enableFunc: () => {
          this.isJP ? window.open(this.$t('Vcube Url') as string) : (this.showCloudDialog = true)
        },
        configFunc: () => {
          this.isJP ? window.open(this.$t('Vcube Url') as string) : this.goToCloudProxyConfig()
        },
        statusFunc: () => this.getCloudProxyStatus(),
        needSlot: true,
      },
      {
        id: 'MiniApp',
        configBtnText: 'View usage',
        enableFunc: () => this.goToMiniApp(),
        configFunc: () => this.goToMiniApp(),
      },
      {
        id: 'FPA',
        configBtnText: 'View Details',
        enableFunc: () => this.applyToFPA(),
        configFunc: () => this.goToFPADetail(),
        statusFunc: () => this.getFPAInfo(),
      },
      {
        id: 'NCS',
        configBtnText: 'Config',
        enableFunc: () => this.goToNCSInfo(),
        configFunc: () => this.goToNCSInfo(),
        statusFunc: () => this.getNCSInfo(),
      },
    ]
  }

  get getNetlessPlaceHolder() {
    return JSON.stringify(
      {
        enabled: false,
        appId: '',
        token: '',
        oss: {
          region: '',
          bucket: '',
          folder: '',
          accessKey: '',
          secretKey: '',
          endpoint: '',
        },
      },
      null,
      4
    )
  }

  get getCloudRecordingPlaceHolder() {
    return JSON.stringify(
      {
        enabled: false,
        recordingConfig: {},
        storageConfig: {
          vendor: 0,
          region: 0,
          bucket: '',
          folder: '',
          accessKey: '',
          secretKey: '',
          endpoint: '',
        },
      },
      null,
      4
    )
  }

  get getIMPlaceHolder() {
    return JSON.stringify(
      {
        enabled: false,
        huanxin: {
          apiHost: '',
          orgName: '',
          appName: '',
          superAdmin: '',
          appKey: '',
          clientId: '',
          clientSecret: '',
        },
      },
      null,
      4
    )
  }

  async mounted() {
    this.vendorInfo = this.project
    this.loading = true
    await this.prepareExtensionMetaData()
    this.loading = false
    await this.initExtensionStatus()
    await this.getRestFulKeys()
  }

  async initExtensionStatus() {
    try {
      if (this.vendorInfo.inChannelPermission) {
        this.extensionsStatus.CoHost = true
      }
      const extensionSetting = await this.$http.get(`/api/v2/project/${this.vendorInfo.projectId}/extension-setting`)
      this.extensionsStatus.CloudPlayer = extensionSetting.data.CloudPlayer
      this.extensionsStatus.CloudRecording = extensionSetting.data.CloudRecording
      this.extensionsStatus.MiniApp = extensionSetting.data.MiniApp || extensionSetting.data.MiniAppNew
      this.extensionsStatus.MediaPush = extensionSetting.data.RTMPConverter || extensionSetting.data['PushStreaming3.0']
      this.extensionsStatus.ContentModeration = extensionSetting.data.ContentModeration
      let extensionList: ExtensionModel[] = []
      this.extensionsMetaData.forEach((item) => {
        extensionList = extensionList.concat(item.children.filter((cItem) => cItem.isPublic === 1))
      })
      await Promise.all(extensionList.map((item) => (item.statusFunc ? item.statusFunc() : null)))
    } catch (e) {
      console.info(e)
    }
  }

  get showWhiteboard() {
    const APACCountry = ['IN', 'ID', 'SG', 'KR', 'AU', 'PK', 'TH', 'VN']
    const CNCountry = ['CN', 'HK', 'TW', 'MO']
    const allowCountries = APACCountry.concat(CNCountry)
    return allowCountries.includes(this.user.info.company.country)
  }
  async getProjectInfo() {
    const projectId = this.$route.params.id
    const project = await getProjectInfo(projectId)
    this.vendorInfo = project.info
  }

  async getProject() {
    const projectId = this.$route.params.id
    await this.getUsecaseList()
    this.useCase = []
    try {
      const project = await getProjectInfo(projectId)
      this.vendorInfo = project.info
      this.vendorName = project.info.name
      this.vendorStage = project.info.stage
      this.tokenSwitch = !project.info.vendorSignal || project.info.vendorSignal.needToken === 0 ? 1 : 0
      if (this.vendorInfo.useCaseId !== '0') {
        const projectUseCaseInfo = this.useCaseData.find((item: any) => {
          return item.useCaseId === this.vendorInfo.useCaseId
        })
        if (projectUseCaseInfo) {
          if (projectUseCaseInfo['sectorId']) {
            this.useCase.push(
              projectUseCaseInfo['internalIndustryId'],
              projectUseCaseInfo['sectorId'],
              projectUseCaseInfo['useCaseId']
            )
          } else {
            this.useCase.push(projectUseCaseInfo['internalIndustryId'], projectUseCaseInfo['useCaseId'])
          }
          this.useCaseName =
            this.$i18n.locale === 'en' ? projectUseCaseInfo['useCaseNameEn'] : projectUseCaseInfo['useCaseNameCn']
        }
      }
      this.formatUsecaseData()
    } catch (e) {
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
    if (this.useCase.length < 1) {
      return this.$message.error(this.$t('UseCaseRequired') as string)
    }
    const useCaseId = this.useCase.length === 2 ? this.useCase[1] : this.useCase[2]
    this.loading = true
    try {
      await updateProject(this.$route.params.id, name, this.tokenSwitch === 1, this.vendorInfo.stage, useCaseId)
      this.$message({
        message: this.$t('UpdateProjectSuccess') as string,
        type: 'success',
      })
      this.projectPopoverVisible = false
      await this.getProject()
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
  goToMiniApp() {
    this.$router.push({ name: 'usage.miniapp', query: { projectId: this.vendorInfo.projectId } })
  }
  goToCloudRecording() {
    this.$router.push({ name: 'usage.cloud-recording', query: { projectId: this.vendorInfo.projectId } })
  }
  goToCloudPlayer() {
    this.$router.push({ name: 'usage.media-inject', query: { projectId: this.vendorInfo.projectId } })
  }
  async showApaasConfirmDialog() {
    this.apaasLoading = true
    this.netlessEnabled = false
    this.cloudRecordingEnabled = false
    this.netlessJson = ''
    this.cloudRecordingJson = ''
    try {
      const data = await getApaasConfiguration(this.vendorInfo.projectId)
      const config = data.appConfigs
      if (config) {
        if (config.netless) {
          this.netlessJson = `${JSON.stringify(config.netless, null, 4)}`
          this.netlessEnabled = config.netless.enabled || false
        }
        if (config.cloudRecording) {
          this.cloudRecordingJson = `${JSON.stringify(config.cloudRecording, null, 4)}`
          this.cloudRecordingEnabled = config.cloudRecording.enabled || false
        }
        if (config.im) {
          this.IMJson = `${JSON.stringify(config.im, null, 4)}`
          this.IMEnabled = config.im.enabled || false
        }
      }
      await this.getRestFulKeys()
    } catch (e) {}
    this.apaasLoading = false
    this.showFlexibleClassroom = true
  }
  formatAPaasJson() {
    this.netlessError = ''
    this.cloudRecordingError = ''
    this.IMError = ''
    try {
      this.netlessJson && JSON.parse(this.netlessJson)
    } catch (e) {
      this.netlessError = this.$t('ParameterError') as string
      return false
    }

    try {
      this.cloudRecordingJson && JSON.parse(this.cloudRecordingJson)
    } catch (e) {
      this.cloudRecordingError = this.$t('ParameterError') as string
      return false
    }

    try {
      this.IMJson && JSON.parse(this.IMJson)
    } catch (e) {
      this.IMError = this.$t('ParameterError') as string
      return false
    }

    return true
  }
  onAPaasChecked(type: string) {
    if (!(this as any)[`${type}Enabled`]) {
      if ((this as any)[`${type}Json`]) {
        try {
          ;(this as any)[`${type}Json`] = JSON.stringify(
            Object.assign(JSON.parse((this as any)[`${type}Json`]), { enabled: false }),
            null,
            4
          )
        } catch (e) {
          ;(this as any)[`${type}Json`] = ''
        }
      }
    } else if ((this as any)[`${type}Json`]) {
      try {
        ;(this as any)[`${type}Json`] = JSON.stringify(
          Object.assign(JSON.parse((this as any)[`${type}Json`]), { enabled: true }),
          null,
          4
        )
      } catch (e) {
        ;(this as any)[`${type}Json`] = ''
      }
    }
  }
  pageGoToApaasConfiguration() {
    this.$router.push({ path: `/project/${this.vendorInfo.projectId}/apaas` })
  }
  async prepareApaasExtensions() {
    if (!this.extensionsStatus.Whiteboard) {
      await this.enableWhiteboard(false)
    }
    if (!this.restfulEnabled) {
      await this.createNewRestFulKey()
    }
    if (!this.extensionsStatus.CloudRecording) {
      await this.enableCloudRecording()
    }
    await this.enableApaas()
  }

  async prepareIotExtensions() {
    this.extensionsLoading.iot = true
    if (!this.restfulEnabled) {
      await this.createNewRestFulKey()
    }
    if (!this.extensionsStatus.CloudRecording) {
      await this.enableCloudRecording()
    }
    if (!this.extensionsStatus.MiniApp) {
      await this.enableMiniApp()
    }
    this.extensionsStatus.AgoraChat = true
    await this.enableIot()
    this.extensionsLoading.iot = false
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
  async updateApaasConfig() {
    if (!this.formatAPaasJson()) return
    this.apaasLoading = true
    try {
      const tokenResponse = await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/apaas`, {
        netlessJson: this.netlessJson,
        cloudRecordingJson: this.cloudRecordingJson,
        IMJson: this.IMJson,
      })
      if (tokenResponse.data.code === 0) {
        this.$message.success(this.$t('ApplySuccess') as string)
      } else {
        this.$message.warning(tokenResponse.data.msg)
      }
      this.apaasLoading = false
    } catch (e) {
      if (e.response && e.response.data.code === 15000) {
        this.$message.warning(this.$t('FailedGetRestfulKeys') as string)
      } else if (e.response && e.response.data.code !== 500 && e.response.data.msg) {
        this.$message.warning(e.response.data.msg)
      } else {
        this.$message.warning(this.$t('UpdateAPaasConfigError') as string)
      }
      this.apaasLoading = false
    }
    this.showFlexibleClassroom = false
  }
  async enablePrimaryCert() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/enable-primary-cert`)
      this.showEnableMainCertConfirm = false
      this.$message.success(this.$t('EnablePrimarySuccess') as string)
      await this.getProject()
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
      await this.getProject()
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
    await this.getProjectInfo()
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
      await this.getProject()
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
      await this.getProject()
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
  async getUsecaseList() {
    try {
      const ret = await this.$http.get('/api/v2/project/usecases')
      this.useCaseList = ret.data
      const useCaseData: any = []
      this.useCaseList.forEach((item: any) => {
        if (item.hasSector === 0) {
          for (const usecase of item.children) {
            usecase['internalIndustryId'] = item.internalIndustryId
          }
          useCaseData.push(...item.children)
        } else {
          for (const sector of item.children) {
            for (const usecase of sector.children) {
              usecase['internalIndustryId'] = item.internalIndustryId
              usecase['sectorId'] = sector.sectorId
            }
            useCaseData.push(...sector.children)
          }
        }
      })
      this.useCaseData = useCaseData
    } catch (error) {}
  }

  formatUsecaseData() {
    const useCaseDataCn: any[] = []
    const useCaseDataEn: any[] = []
    this.useCaseList?.forEach((industry: any) => {
      const sectorCn: any[] = []
      const sectorEn: any[] = []
      if (industry.hasSector === 0) {
        const childrenCn: any[] = []
        const childrenEn: any[] = []
        industry.children?.forEach((useCase: any) => {
          if (useCase.status === 'Active' || useCase.useCaseId === this.useCase[1]) {
            childrenCn.push({
              value: useCase.useCaseId,
              label: useCase.useCaseNameCn,
            })
            childrenEn.push({
              value: useCase.useCaseId,
              label: useCase.useCaseNameEn,
            })
          }
        })
        useCaseDataCn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameCn || this.$t(industry.internalIndustryMetadataNameEn),
          children: childrenCn,
        })
        useCaseDataEn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameEn,
          children: childrenEn,
        })
      } else {
        industry.children?.forEach((sector: any) => {
          const childrenCn: any[] = []
          const childrenEn: any[] = []
          sector.children?.forEach((useCase: any) => {
            if (useCase.status === 'Active' || useCase.useCaseId === this.useCase[2]) {
              childrenCn.push({
                value: useCase.useCaseId,
                label: useCase.useCaseNameCn,
              })
              childrenEn.push({
                value: useCase.useCaseId,
                label: useCase.useCaseNameEn,
              })
            }
          })
          sectorCn.push({
            value: sector.sectorId,
            label: sector.sectorNameCn,
            children: childrenCn,
          })
          sectorEn.push({
            value: sector.sectorId,
            label: sector.sectorNameEn,
            children: childrenEn,
          })
        })
        useCaseDataCn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameCn || this.$t(industry.internalIndustryMetadataNameEn),
          children: sectorCn,
        })
        useCaseDataEn.push({
          value: industry.internalIndustryId,
          label: industry.internalIndustryMetadataNameEn,
          children: sectorEn,
        })
      }
    })
    if (this.$i18n.locale === 'en') {
      this.useCaseList = useCaseDataEn
    } else {
      this.useCaseList = useCaseDataCn
    }
  }
  async openAuthentication() {
    try {
      await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/co-host-token`)
      await this.getProject()
      this.extensionsStatus.CoHost = true
    } catch (error) {
      this.$message.warning('')
    }
    this.showAuthenticationOverlay = false
  }
  async getWhiteboardInfo() {
    try {
      this.extensionsLoading.Whiteboard = true
      this.whiteboardLoading = true
      const netlessInfo = await this.$http.get(`/api/v2/project/${this.vendorInfo.id}/netless/check`)
      if (netlessInfo.data) {
        this.extensionsStatus.Whiteboard = true
      }
    } catch (e) {
      console.info(e)
    }
    this.whiteboardLoading = false
    this.extensionsLoading.Whiteboard = false
  }
  async enableWhiteboard(needSuccessHandler = true) {
    try {
      this.whiteboardLoading = true
      await this.$http.post(`/api/v2/project/${this.vendorInfo.id}/netless`, { name: this.vendorInfo.name })
      this.extensionsStatus.Whiteboard = true
      if (needSuccessHandler) {
        this.showEnableWhiteboardConfirm = false
        this.$message({
          message: this.$t('EnableWhiteboardSuccess') as string,
          type: 'success',
        })
      }
    } catch (e) {
      this.$message.error(this.$t('EnableWhiteboardError') as string)
    }
    this.whiteboardLoading = false
  }
  async getApaasInfo() {
    this.extensionsLoading.APaaS = true
    try {
      const data = await getApaasConfiguration(this.vendorInfo.projectId)
      if (data.id) {
        this.extensionsStatus.APaaS = true
      }
    } catch (e) {
      console.info(e)
    }
    this.whiteboardLoading = false
    this.extensionsLoading.APaaS = false
  }
  async enableApaas() {
    try {
      await updateApaasConfiguration(this.vendorInfo.projectId, {
        netlessJson: '{"enabled":true}',
        cloudRecordingJson: '{"enabled":true}',
        IMJson: '{"enabled":true}',
      })
      this.extensionsStatus.APaaS = true
      this.$message.success(this.$t('EnableApaasSuccess') as string)
      await this.pageGoToApaasConfiguration()
    } catch (e) {
      this.$message.error(this.$t('EnableApaasError') as string)
    }
  }

  async getIotInfo() {
    try {
      this.extensionsLoading.iot = true
      const result = await this.$http.get(`/api/v2/project/${this.vendorInfo.projectId}/iot`)
      if (result.data) {
        this.extensionsStatus.iot = result.data.enabled
      }
    } catch (e) {
      this.$message.error(this.$t('EnableIotError') as string)
    }
    this.extensionsLoading.iot = false
  }

  async enableIot() {
    const result = await this.$http.put(`/api/v2/project/${this.vendorInfo.projectId}/iot`, {
      datacenter: this.dataCenter,
    })
    if (result.data.success) {
      this.extensionsStatus.iot = true
      this.$message.success(this.$t('EnableIotSuccess') as string)
      await this.goToIframeConfiguration('iot')
    } else {
      this.$message.error(this.$t('EnableIotError') as string)
    }
  }

  async enableCloudRecording() {
    try {
      const data = await enableCloudPlayer(this.vendorInfo.id, this.user.info.company.country === 'CN' ? '1' : '2')
      if (!data) {
        this.$message.error(this.$t('EnableCloudRecordingError') as string)
      }
      this.extensionsStatus.CloudRecording = true
    } catch (e) {
      this.$message.error(this.$t('EnableCloudRecordingError') as string)
    }
  }

  async enableMiniApp() {
    try {
      const data = await enableMiniApp(this.vendorInfo.id, this.user.info.company.country === 'CN' ? '1' : '2')
      if (!data) {
        this.$message.error(this.$t('EnableMiniAppError') as string)
      }
      this.extensionsStatus.MiniApp = true
    } catch (e) {
      this.$message.error(this.$t('EnableMiniAppError') as string)
    }
  }

  goToWhiteboardConfig() {
    this.$router.push({ name: 'whiteboard-config', params: { id: this.$route.params.id } })
  }
  async comfirmShowEnableWhiteboard() {
    const checkNetless = await this.checkNetlessStatus()
    if (checkNetless) {
      this.showNetlessDialog = true
      return
    }
    this.showEnableWhiteboardConfirm = true
  }
  async checkNetlessStatus() {
    if (this.user.info.emailStatus === this.emailStatus.NotVerified) return false
    if (this.user.info.company.source !== this.agoraSource) return false
    if (this.user.info.isMember) return false

    try {
      const res = await this.$http.get('/api/v2/company/netless/exist')
      return res.data || false
    } catch (e) {
      return false
    }
  }
  async migrate() {
    this.migrateLoading = true
    try {
      await this.$http.post('/api/v2/company/netless/migrate')
      this.$message({
        message: this.$t('Migrate successfully') as string,
        type: 'success',
      })
      this.showNetlessDialog = false
    } catch (error) {
      this.$message.error(this.$t('Migrate Failed') as string)
    }
    this.migrateLoading = false
  }
  applyToFPA() {
    this.$router.push({ name: 'FPACreate', params: { id: this.$route.params.id } })
  }

  goToFPADetail() {
    this.$router.push({ name: 'FPA', params: { id: this.$route.params.id } })
  }

  async getUpstreamsData() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/upstreams`)
      const total = res.data.total
      return total || 0
    } catch (e) {}
  }

  async getChainsData() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/chains`)
      const total = res.data.total
      return total || 0
    } catch (e) {}
  }

  async getFPAInfo() {
    this.extensionsLoading.FPA = true
    const upstreamsTotal = await this.getUpstreamsData()
    const chainsTotal = await this.getChainsData()
    if (upstreamsTotal > 0 || chainsTotal > 0) {
      this.extensionsStatus.FPA = true
    }
    this.extensionsLoading.FPA = false
  }
  async getContentCenterInfo() {
    this.extensionsLoading.ContentCenter = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/ktv`)
      if (res.data.code === 0 && res.data.data && res.data.data.status === KTVStatu.ENABLE) {
        this.extensionsStatus.ContentCenter = true
      } else {
        this.extensionsStatus.ContentCenter = false
      }
      this.contentCenterInfo = res.data.data
    } catch (e) {}
    this.extensionsLoading.ContentCenter = false
  }

  async showConfigContentCenter(show = false, refresh = false) {
    this.showContentCenterDialog = show
    if (refresh) {
      await this.getContentCenterInfo()
    }
  }

  async showConfigMediaPush() {}

  async getProjectChatStatus() {
    this.extensionsLoading.AgoraChat = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/chat/info`)
      if (res.data.instances.length > 0) {
        this.AgoraChatEnabled = true
        this.extensionsStatus.AgoraChat = true
      }
    } catch (e) {}
    this.extensionsLoading.AgoraChat = false
  }

  async enableChat(dataCenter: string) {
    this.chatLoading = true
    try {
      await this.$http.post(`/api/v2/project/${this.$route.params.id}/chat/info`, { dataCenter })
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.showChatDialog = false
      this.getProjectChatStatus()
    } catch (e) {
      if (e.response.data.code === 22001) {
        this.$message.error(this.$t('NoSubscription Tip') as string)
      } else {
        this.$message.error(this.$t('SaveFailed') as string)
      }
    }
    this.chatLoading = false
  }

  goToIMDetail() {
    this.$router.push({ name: 'Chat', params: { id: this.$route.params.id } })
  }

  goToRTMPConfig() {
    this.$router.push({ name: 'RTMPConfiguration', params: { id: this.$route.params.id } })
  }
  changeQuickStart(docsLink: string, demoList: any) {
    this.docsLink = docsLink
    this.demoList = demoList
  }

  async getNCSInfo() {
    this.extensionsLoading.NCS = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/ncs`)
      if (res.data) {
        this.extensionsStatus.NCS = res.data.enabled
      }
    } catch (e) {}
    this.extensionsLoading.NCS = false
  }

  async getCloudProxyStatus() {
    this.extensionsLoading.CloudProxy = true
    try {
      const result = await this.$http.get(`/api/v2/project/${this.$route.params.id}/cloud-proxy/status`)
      if (result.data) {
        this.extensionsStatus.CloudProxy = result.data.enabled
      }
    } catch (e) {}
    this.extensionsLoading.CloudProxy = false
  }

  async updateCloudProxyStatus() {
    this.cloudLoading = true
    const params = {
      enabled: true,
    }
    try {
      const result = await this.$http.post(`/api/v2/project/${this.$route.params.id}/cloud-proxy/status`, params)
      if (result.data.error) {
        this.$message.error(result.data.errMsg)
      } else {
        this.$message.success(this.$t('Cloud Proxy enabled successfully') as string)
      }
      this.cloudLoading = false
      this.showCloudDialog = false
      this.getCloudProxyStatus()
    } catch (e) {
      if (e.response.data && e.response.data.errMsg) {
        if (e.response.data.errCode === 83055) {
          this.$message.error(this.$t('Duplicate entry, please contact Agora Support') as string)
        } else {
          this.$message.error(e.response.data.errMsg)
        }
      } else {
        this.$message.error(this.$t('SaveFailed') as string)
      }
    }
  }

  goToCloudProxyConfig() {
    this.$router.push({
      name: 'CloudProxyConfiguration',
      params: { id: this.$route.params.id },
    })
  }

  goToNCSInfo() {
    this.$router.push({
      name: 'NCS',
      params: { id: this.$route.params.id },
    })
  }

  switchToLiveStatus() {
    this.vendorInfo.stage = ProjectStage.Live
    this.onClickSave()
  }

  startIntro() {
    if (Cookie.get('showIntro')) {
      return
    }
    const intro = introJs()
      .setOptions({
        tooltipClass: 'product-detail-intro',
        highlightClass: 'product-detail-highlight',
        showBullets: false,
        overlayOpacity: 0.2,
        showStepNumbers: false,
        prevLabel: this.$t('Back'),
        nextLabel: this.$t('Got it'),
        skipLabel: this.$t('Skip'),
        doneLabel: this.$t('Done'),
        hidePrev: true,
        hideNext: true,
        exitOnOverlayClick: false,
      })
      .start()
    this.$nextTick(() => {
      intro.onexit(() => {
        Cookie.set('showIntro', '1')
      })
    })
  }

  async openUapSetting(typeId: number) {
    try {
      await this.$http.post(`/api/v2/usage/uap/setting`, {
        vids: this.vendorInfo.id,
        typeId: typeId,
        region: this.isCN ? '1' : '2',
      })
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
    } catch (e) {
      this.$message.error(this.$t('NetworkError') as string)
    }
  }

  async enableModerationUapSetting() {
    await this.openUapSetting(CloudTypeMap.ContentModeration)
    this.showEnableModerationConfirm = false
    this.initExtensionStatus()
  }

  goToModerationConfig() {
    if (this.extensionsStatus.ContentModeration) {
      this.$router.push({ name: 'moderation', params: { id: this.$route.params.id } })
    } else {
      this.showEnableModerationConfirm = true
    }
  }

  async prepareExtensionMetaData() {
    const extensionsMetaData = (await productConfig.getExtensionMetaData()) as ExtensionListModel[]
    extensionsMetaData.forEach((extensionType) => {
      extensionType.children = extensionType.children.filter(
        (item) => item.area !== `All${this.isCN ? 'CN' : 'EN'}Preview`
      )
      extensionType.children.forEach((extension: ExtensionModel) => {
        const extensionExtraData = this.extensionExtraData.find((item) => item.id === extension.extensionId)
        if (extension.configMode === 'iframe') {
          extension.configFunc = () => {
            this.goToIframeConfiguration(extension.extensionId)
          }
          if (extensionExtraData) {
            extension.enableFunc = extensionExtraData.enableFunc
            extension.configBtnText = 'Config'
            extension.enableBtnText = 'Enable'
          } else {
            extension.enableFunc = extension.configFunc
            extension.configBtnText = extension.enableBtnText = 'Config'
          }
        } else {
          extension.configFunc = extensionExtraData?.configFunc
          extension.enableFunc = extensionExtraData?.enableFunc
          extension.configBtnText = extensionExtraData?.configBtnText
          extension.enableBtnText = extensionExtraData?.enableBtnText
        }
        extension.statusFunc = extensionExtraData?.statusFunc
      })
    })
    this.extensionsMetaData = extensionsMetaData
  }

  goToIframeConfiguration(extensionId: string) {
    this.$router.push({ path: `/project/${this.vendorInfo.projectId}/extension`, query: { id: extensionId } })
  }

  showIotConfirmDialog() {
    this.showIotDialog = true
  }
}
