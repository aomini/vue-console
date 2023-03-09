import Vue from 'vue'
import Component from 'vue-class-component'
import {
  getLifeCycle,
  getProjectInfo,
  sendCertificateEmail,
  updateProject,
  updateProjectStatus,
  user,
} from '@/services'
import moment from 'moment'
import PasswordInput from '@/components/PasswordInput'
import { CertificateBackupStatus } from '@/common/project'
import './Project.less'
import CertificateBox from '../components/CertificateBox'
import CertificateBackupBox from '../components/CertificateBackupBox'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import { ExtensionExtraDataModel, ExtensionListModel, ExtensionModel, KTVStatu } from '@/models'
import EditContentCenter from '@/views-oversea/project/EditContentCenter'
import { enableCloudPlayer, getApaasConfiguration, updateApaasConfiguration } from '@/services/apaas'
import EnableCloudProxy from '@/views-oversea/project/CloudProxy/EnableCloudProxy'
import ExtensionItem from '@/views-oversea/components/ExtensionItem'
import { productConfig } from '@/services/product'
import EnableAgoraChatDialog from '@/views-oversea/project/AgoraChat/EnableAgoraChatDialog'

@Component({
  components: {
    'password-input': PasswordInput,
    'certificate-box': CertificateBox,
    'certificate-backup-box': CertificateBackupBox,
    'two-factor-confirm': TwoFactorConfirm,
    'edit-content-center': EditContentCenter,
    'enable-cloud-proxy': EnableCloudProxy,
    'extension-item': ExtensionItem,
    'enable-agora-chat': EnableAgoraChatDialog,
  },
  template: `
    <div>
      <div class="page-v3 edit-project">
        <div class="module-title">{{ $t('EditProjectTitle') }}</div>
        <div class="card" v-loading="loading">
          <el-form :model="vendorInfo" size="small" ref="info" :label-width='$t("Label Width")'>
            <div class="module-item-title">{{ $t('BasicInfo') }}</div>
            <div class="project-form">
              <el-form-item :label="$t('Stage')" prop="stage" class="nowrap" style="overflow: visible">
                <template>
                  <el-radio-group v-model="vendorInfo.stage" @change="stageSwitchChange">
                    <el-radio :label="3"> {{ $t('Testing') }}</el-radio>
                    <el-radio :label="2"> {{ $t('Live') }}</el-radio>
                  </el-radio-group>
                  <el-tooltip :content="$t('Stage Intro')" placement="right">
                    <i class="el-icon-question" style="margin-left: 5px"></i>
                  </el-tooltip>
                </template>
              </el-form-item>
              <el-form-item :label="$t('Create time')" prop="createdAt">
                {{ vendorInfo.createdAt | formatDate('YYYY-MM-DD') }}
              </el-form-item>
              <el-form-item :label="$t('Project name')" prop="name">
                <el-input
                  class="content-input"
                  :disabled="accountBlocked"
                  :maxlength="25"
                  :placeholder='$t("projectPlaceholder")'
                  v-model="vendorInfo.name"
                >
                </el-input>
              </el-form-item>
              <el-form-item :label="$t('Use Case')" prop="useCaseId">
                <el-cascader v-model="useCase" :options="useCaseList" class="w-100" filterable></el-cascader>
              </el-form-item>
              <el-form-item :label="$t('App ID')" prop="key">
                <el-tooltip :content="$t('appIdHover')" placement="right" effect="light" popper-class="mw-250">
                  <password-input
                    class="w-285"
                    :passwordValue="vendorInfo.key"
                    :isDisabled="true"
                    :size="'small'"
                  ></password-input>
                </el-tooltip>
              </el-form-item>
            </div>
            <div class="module-item-title">{{ $t('Security') }}</div>
            <div class="project-form">
              <el-form-item :label="$t('App certificate')" prop="signkey">
                <el-tooltip :content="$t('appCertificateHover')" placement="right" effect="light" popper-class="mw-250">
                  <div>
                    <certificate-box
                      type="primary"
                      :enable="!!vendorInfo.signkey"
                      :keyValue="vendorInfo.signkey"
                      :enableCert="() => showEnableMainCertConfirm = true"
                      :allowDelete="false"
                    >
                    </certificate-box>
                    <certificate-backup-box
                      type="secondary"
                      class="mt-20 two-factor-confirm-cert"
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
                    <certificate-box
                      v-if="vendorInfo.allowStaticWithDynamic || (!vendorInfo.signkey)"
                      type="none"
                      class="mt-20"
                      :enable="true"
                      :deleteCert="deleteNoCert"
                      :allowDelete="!!vendorInfo.signkey || !!vendorInfo.signkeyBackup"
                    >
                    </certificate-box>
                  </div>
                </el-tooltip>
              </el-form-item>
            </div>
            <div class="module-item-title">{{ $t('Features') }}</div>
            <div class="project-form" v-loading="extensionLoading">
              <el-form-item :label="$t('Web demo')">
                <div
                  v-if="vendorInfo.signkey.length === 0 || vendorInfo.allowStaticWithDynamic"
                  class="heading-grey-05"
                >
                  {{ $t('Please enable App Certificate first') }}
                </div>
                <div v-else-if="new Date().getTime() - new Date(vendorInfo.createdAt) > 2 * 60 * 1000">
                  <el-button
                    type="text"
                    class="f-13"
                    id="feature-generate-link"
                    :disabled="accountBlocked"
                    @click="goToInvitePage"
                  >
                    <span id="feature-generate-link">{{ $t('Generate link') }}</span>
                  </el-button>
                </div>
                <div class="row-content" v-else>{{ $t('WebDemoNotReady') }}</div>
              </el-form-item>
              <el-form-item :label="$t('Temp token for audio/video call')">
                <div
                  v-if="vendorInfo.signkey.length === 0 || vendorInfo.allowStaticWithDynamic"
                  class="heading-grey-05"
                >
                  {{ $t('Please enable App Certificate first') }}
                </div>
                <div v-else>
                  <el-button
                    type="text"
                    class="f-13"
                    id="feature-generate-temp-token"
                    :disabled="accountBlocked"
                    @click="goToTokenPage"
                  >
                    <span id="feature-generate-temp-token">{{ $t('Generate temp token') }}</span>
                  </el-button>
                </div>
              </el-form-item>
              <extension-item
                v-for="item in extensionList"
                :key="item.nameEn"
                :name="isCNLang ? item.nameCn : item.nameEn"
                :status="extensionsStatus[item.extensionId]"
                :track-id="item.trackId"
                :enableFunc="item.enableFunc"
                :enable-btn-text="item.enableBtnText"
                :config-func="item.configFunc"
                :config-btn-text="item.configBtnText"
                :account-blocked="accountBlocked"
                :show-sign-key-tooltip="!!item.needToken && !(vendorInfo.signkey && !vendorInfo.allowStaticWithDynamic)"
                :extension-id="item.extensionId"
              >
              </extension-item>
            </div>
            <div class="module-item-title">{{ $t('Project Status') }}</div>
            <div class="project-form">
              <el-form-item :label="$t('Project status')" prop="status">
                <template>
                  <el-radio-group v-model="vendorInfo.status" @change="statusChange">
                    <el-radio :label="1"> {{ $t('Active') }}</el-radio>
                    <el-radio :label="2"> {{ $t('Inactive') }}</el-radio>
                  </el-radio-group>
                </template>
              </el-form-item>
            </div>
          </el-form>
          <div class="text-center pager-button-line">
            <div class="divider"></div>
            <console-button
              class="console-btn-size-md console-btn-primary"
              :disabled="accountBlocked"
              @click="onClickSave"
            >
              {{ $t('Save') }}
            </console-button>
            <console-button class="console-btn-size-md" @click="onClickCancel">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
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
            {{ $t('Cloud recording') }}
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
      <el-dialog :title='$t("EnableSecondaryCertTitle")' :visible.sync="showEnableBackupCertConfirm" width="380px">
        <div class="p-2">
          <div>
            <span>{{ $t('EnableSecondaryCertDesc') }} </span>
            <a :href='$t("CertDocLink")' target="_blank"> {{ $t('EnableSecondaryCertDesc2') }}</a>
          </div>
          <div class="ml-auto text-right mt-20">
            <console-button class="console-btn-primary" @click="enableBackupCert"> {{ $t('Confirm') }}</console-button>
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
              {{ $t('Delete') }}</console-button
            >
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

      <enable-agora-chat
        v-if="showChatDialog"
        :isCN="isCN"
        :chatLoading="chatLoading"
        :enableChat="enableChat"
        :cancelEnable="() => showChatDialog = false"
      ></enable-agora-chat>
    </div>
  `,
})
export default class EditProjectView extends Vue {
  vendorInfo: any = {
    signkey: '',
    key: '',
    name: '',
    createdAt: '',
    status: 1,
    stage: 1,
    id: 0,
  }
  isTwoFactorVerificationVisible = false
  showDeleteBackCertConfirm = false
  useCase = []
  useCaseList: any = []
  useCaseData = []
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
  // showFPAData = false
  contentCenterEnabled = false
  showContentCenterDialog = false
  contentCenterInfo: any = {}
  backupCertStatus = CertificateBackupStatus.DEFAULT
  AgoraChatEnabled = false
  showChatDialog = false
  showCloudDialog = false
  chatLoading = false
  cloudLoading = false
  extensionsStatus = {
    APaaS: false,
    Whiteboard: false,
    CloudRecording: false,
    CloudPlayer: false,
    ContentCenter: false,
    CoHost: false,
    MiniApp: false,
    FPA: false,
    FusionCDN: false,
    Chat: false,
    MediaPush: false,
    CloudProxy: false,
    NCS: false,
  }
  extensionLoading = false
  extensionList: ExtensionModel[] = []
  get extensionExtraData(): ExtensionExtraDataModel[] {
    return [
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
        id: 'MediaPush',
        configBtnText: 'Config',
        enableFunc: () => this.goToRTMPConfig(),
        configFunc: () => this.goToRTMPConfig(),
      },
      {
        id: 'Chat',
        enableBtnText: 'Enable/Configure',
        configBtnText: 'Enable/Configure',
        enableFunc: () => {
          this.showChatDialog = true
        },
        statusFunc: () => this.getProjectChatStatus(),
      },
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
        id: 'FPA',
        configBtnText: 'View Details',
        enableFunc: () => this.applyToFPA(),
        configFunc: () => this.goToFPADetail(),
        statusFunc: () => this.getFPAInfo(),
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
    if (this.isCN) {
      this.$router.replace({
        name: 'editProject',
        params: {
          id: this.$route.params.id,
        } as any,
      })
    }
    this.loading = true
    const lifeCycleInfo = await getLifeCycle()
    this.accountBlocked =
      lifeCycleInfo.financialStatus === 2 || lifeCycleInfo.financialStatus === 3 || lifeCycleInfo.financialStatus === 4
    await this.getProject()
    await this.prepareExtensionMetaData()
    await this.getBackupCertStatus()
    this.loading = false
    this.extensionLoading = true
    await this.getRestFulKeys()
    await this.initExtensionStatus()
    this.extensionLoading = false
    if (window.location.hash) {
      ;(this.$el.querySelector(window.location.hash) as any).scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  async initExtensionStatus() {
    try {
      if (this.vendorInfo.inChannelPermission) {
        this.extensionsStatus.CoHost = true
      }
      const extensionSetting = await this.$http.get(`/api/v2/project/${this.vendorInfo.projectId}/extension-setting`)
      this.extensionsStatus.CloudPlayer = extensionSetting.data.CloudPlayer
      this.extensionsStatus.CloudRecording = extensionSetting.data.CloudRecording
      this.extensionsStatus.MediaPush = extensionSetting.data.RTMPConverter || extensionSetting.data['PushStreaming3.0']
      await Promise.all(this.extensionList.map((item) => (item.statusFunc ? item.statusFunc() : null)))
    } catch (e) {
      console.info(e)
    }
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
        }
      }
      this.formatUsecaseData()
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' })
    }
  }

  onClickSave() {
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
    this.showTwoFactorVerification = true
  }

  async updateProjectInfo() {
    const name = this.vendorInfo.name.trim()
    const useCaseId = this.useCase.length === 2 ? this.useCase[1] : this.useCase[2]
    try {
      await updateProject(this.$route.params.id, name, this.tokenSwitch === 1, this.vendorInfo.stage, useCaseId)
      return true
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
    return false
  }

  onClickCancel() {
    this.$router.push({ name: 'projects' })
  }

  async updateProjectStatus() {
    try {
      await updateProjectStatus(this.$route.params.id, this.vendorInfo.status === 1)
      return true
    } catch (e) {
      this.$message.error(this.$t('GerneralError') as string)
    }
    return false
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
  async goToInvitePage() {
    const expiredTs = moment().unix() + 30 * 60
    const getUUID = await this.$http.post('/api/v2/project/token-record', {
      projectId: this.vendorInfo.projectId,
      channel: 'demo',
      expiredTs,
    })
    const router = this.$router.resolve({ name: 'invite', query: { sign: getUUID.data.uuid } })
    window.open(router.href, '_blank')
  }
  goToTokenPage() {
    this.$router.push({ name: 'token', params: { id: this.$route.params.id } })
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
    if (this.vendorInfo.status === 2) {
      this.$confirm(notificationMsg, this.$t('Warning') as string, {
        confirmButtonText: this.$t('Confirm') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
      }).catch(() => {
        this.vendorInfo.status = val === 2 ? 1 : 2
      })
    }
  }
  async afterVerificationSuccess() {
    this.showTwoFactorVerification = false
    const projectInfoUpdated = await this.updateProjectInfo()
    const projectStatusUpdated = await this.updateProjectStatus()
    if (projectInfoUpdated && projectStatusUpdated) {
      this.$message({
        message: this.$t('UpdateProjectSuccess') as string,
        type: 'success',
      })
      this.$router.push({ name: 'projects' })
    }
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
  }
  stageSwitchChange(val: number) {
    this.vendorInfo.stage = val
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
  async showWhiteboardTokenDialog() {
    this.apaasLoading = true
    this.netlessEnabled = false
    this.cloudRecordingEnabled = false
    this.netlessJson = ''
    this.cloudRecordingJson = ''
    try {
      const apaasConfig = await this.$http.get(`/api/v2/project/${this.vendorInfo.projectId}/apaas`)
      if (apaasConfig.data.appConfigs) {
        apaasConfig.data.appConfigs.netless &&
          (this.netlessJson = `${JSON.stringify(apaasConfig.data.appConfigs.netless, null, 4)}`)
        apaasConfig.data.appConfigs.cloudRecording &&
          (this.cloudRecordingJson = `${JSON.stringify(apaasConfig.data.appConfigs.cloudRecording, null, 4)}`)
        apaasConfig.data.appConfigs.im && (this.IMJson = `${JSON.stringify(apaasConfig.data.appConfigs.im, null, 4)}`)
        if (apaasConfig.data.appConfigs.netless) {
          this.netlessEnabled = apaasConfig.data.appConfigs.netless.enabled || false
        }
        if (apaasConfig.data.appConfigs.cloudRecording) {
          this.cloudRecordingEnabled = apaasConfig.data.appConfigs.cloudRecording.enabled || false
        }
        if (apaasConfig.data.appConfigs.im) {
          this.IMEnabled = apaasConfig.data.appConfigs.im.enabled || false
        }
      }
    } catch (e) {}
    this.apaasLoading = false
    this.showWhiteboardToken = true
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
  async getApaasInfo() {
    try {
      const data = await getApaasConfiguration(this.vendorInfo.projectId)
      if (data.id) {
        this.extensionsStatus.APaaS = true
      }
    } catch (e) {
      console.info(e)
    }
    this.whiteboardLoading = false
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
    } catch (error) {
      this.$message.warning('')
    }
    this.showAuthenticationOverlay = false
  }
  async getWhiteboardInfo() {
    try {
      this.whiteboardLoading = true
      const netlessInfo = await this.$http.get(`/api/v2/project/${this.vendorInfo.id}/netless/check`)
      if (netlessInfo.data) {
        this.extensionsStatus.Whiteboard = true
      }
    } catch (e) {
      console.info(e)
    }
    this.whiteboardLoading = false
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
    window.open('https://marketing.agora.io/LP=47', '_blank')
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
    const upstreamsTotal = await this.getUpstreamsData()
    const chainsTotal = await this.getChainsData()
    if (upstreamsTotal > 0 || chainsTotal > 0) {
      this.extensionsStatus.FPA = true
    }
  }

  async getContentCenterInfo() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/ktv`)
      if (res.data.code === 0 && res.data.data && res.data.data.status === KTVStatu.ENABLE) {
        this.contentCenterEnabled = true
      } else {
        this.contentCenterEnabled = false
      }
      this.contentCenterInfo = res.data.data
    } catch (e) {}
  }

  async showConfigContentCenter(show = false, refresh = false) {
    this.showContentCenterDialog = show
    if (refresh) {
      await this.getContentCenterInfo()
    }
  }

  goToRTMPConfig() {
    this.$router.push({ name: 'RTMPConfiguration', params: { id: this.$route.params.id } })
  }

  async getCloudProxyStatus() {
    try {
      const result = await this.$http.get(`/api/v2/project/${this.$route.params.id}/cloud-proxy/status`)
      if (result.data) {
        this.extensionsStatus.CloudProxy = result.data.enabled
      }
    } catch (e) {}
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
            if (extension.extensionId === 'Chat') {
              extension.configBtnText = extensionExtraData?.configBtnText
              extension.enableBtnText = extensionExtraData?.enableBtnText
            } else {
              extension.configBtnText = 'Config'
              extension.enableBtnText = 'Enable'
            }
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
    extensionsMetaData.forEach((item) => {
      this.extensionList = this.extensionList.concat(item.children.filter((cItem) => cItem.isPublic === 1))
    })
  }

  goToIframeConfiguration(extensionId: string) {
    this.$router.push({ path: `/project/${this.vendorInfo.projectId}/extension`, query: { id: extensionId } })
  }

  async getCompanyChatSubscription() {
    try {
      const res = await this.$http.get(`/api/v2/chat/subscription`)
      if (res.data && res.data.subscriptions.length > 0) {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  async getProjectChatStatus() {
    try {
      if (!(await this.getCompanyChatSubscription())) {
        return
      }
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/chat/info`)
      if (res.data.instances.length > 0) {
        this.AgoraChatEnabled = true
        this.extensionsStatus.Chat = true
      }
    } catch (e) {}
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
}
