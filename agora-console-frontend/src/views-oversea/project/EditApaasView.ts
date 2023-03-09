import Vue from 'vue'
import Component from 'vue-class-component'
import { getLifeCycle, getProjectInfo, user } from '@/services'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import { Input } from 'element-ui'
import PasswordInput from '@/components/PasswordInput'
import './Project.less'
import {
  getApaasConfiguration,
  getNetlessConfiguration,
  updateApaasConfiguration,
  updateNetlessToken,
} from '@/services/apaas'

@Component({
  components: {
    'el-input': Input,
    'password-input': PasswordInput,
    'two-factor-confirm': TwoFactorConfirm,
  },
  template: `
    <div>
      <div class="page-v3 edit-project" v-loading="loading">
        <el-row type="flex" align="middle">
          <span class="mr-10" @click="pageToEditProject"><i class="el-icon-arrow-left"></i></span>
          <el-breadcrumb separator="|" class="mr-10 d-inline-block">
            <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('Flexible classroom configuration') }}</el-breadcrumb-item>
          </el-breadcrumb>
        </el-row>

        <div :style="showDocs ? 'width: 40%' : 'width: 100%'">
          <!--应用配置-->
          <div class="top-tips">
            {{ $t('ApaasTopTips') }}
            <a v-bind:href="$t('ApaasTopTipsLink')" target="_blank">{{ $t('ApaasTopTipsLinkTxt') }}</a>
          </div>
          <el-form size="small" label-width="150px" label-position="left">
            <div class="project-module mb-20">
              <div class="module-item-title">{{ $t('Whiteboard') }}</div>
              <div class="module-content">
                <el-form-item :label="$t('App Identifier')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <password-input :passwordValue="netlessModel.appId" :isDisabled="true"></password-input>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('SDK Token')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="netlessModel.token" v-show="false"></el-input>
                    <el-button type="text" @click="generateSDKToken" :disabled="accountBlocked || loading">
                      {{
                        !remoteApaaSConfiguration?.appConfigs?.netless?.appId ? $t('GenerateToken') : $t('UpdateToken')
                      }}
                    </el-button>
                    <p v-if="needNetlessTokenTip" class="error">{{ needNetlessTokenTip }}</p>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('Storage config')">
                  <el-col
                    :xs="24"
                    :sm="24"
                    :md="20"
                    :lg="14"
                    :xl="10"
                    style="padding: 20px; background: #f9f9fc; border-radius: 4px; margin: 0 24px 24px 0;"
                  >
                    <el-form-item :label="$t('vendor')">
                      <el-select v-model="netlessModel.oss.vendor" style="width: 100%;">
                        <el-option :value="2" label="Aliyun OSS"></el-option>
                        <el-option :value="1" label="AWS S3"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('region')">
                      <el-input v-model="netlessModel.oss.region"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('endpoint')">
                      <el-input v-model="netlessModel.oss.endpoint"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('bucket')">
                      <el-input v-model="netlessModel.oss.bucket"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('folder')">
                      <el-input v-model="netlessModel.oss.folder"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('accessKey')">
                      <el-input v-model="netlessModel.oss.accessKey"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('secretKey')">
                      <el-input v-model="netlessModel.oss.secretKey"></el-input>
                    </el-form-item>
                    <p v-if="netlessErrorTip" class="error">{{ netlessErrorTip }}</p>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="20" :lg="6" :xl="4">
                    <div class="status-tip" style="border-radius: 4px; margin: 0;">
                      <div class="deep-grey">
                        <span>{{ $t('Advanced services') }}</span>
                        <el-tooltip :content="$t('AdvancedServicesTips')" placement="top" effect="light">
                          <i class="el-icon-info project-tooltip"></i>
                        </el-tooltip>
                      </div>
                      <div>
                        <i
                          :class="enabledNetlessServiceDynamicConversion ? 'el-icon-success green' : 'el-icon-error'"
                        ></i>
                        <span>{{ $t('Docs to web') }}</span>
                      </div>
                      <div>
                        <i
                          :class="enabledNetlessServiceStaticConversion ? 'el-icon-success green' : 'el-icon-error'"
                        ></i>
                        <span>{{ $t('Docs to Picture') }}</span>
                      </div>
                      <div>
                        <i :class="enabledNetlessServiceSnapshot ? 'el-icon-success green' : 'el-icon-error'"></i>
                        <span>{{ $t('Screenshot') }}</span>
                      </div>
                      <div>
                        <el-button type="text" size="small" @click="pageGoToNetlessConfig">
                          <i class="el-icon-arrow-right"></i> {{ $t('Go to config') }}
                        </el-button>
                      </div>
                    </div>
                  </el-col>
                </el-form-item>
              </div>
            </div>
            <!--云录制配置-->
            <div class="project-module mb-20">
              <div class="module-item-title">{{ $t('Cloud Recording') }}</div>
              <div class="module-content">
                <el-form-item :label="$t('Recording config')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-radio-group v-model="cloudRecordingConfigurationSwitcher">
                      <el-radio label="1">{{ $t('Default') }}</el-radio>
                      <el-radio label="2">{{ $t('Customized') }}</el-radio>
                    </el-radio-group>
                  </el-col>
                </el-form-item>
                <el-form-item v-if="cloudRecordingConfigurationSwitcher === '2'" label="">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input
                      v-model="cloudRecordModel.recordingConfig"
                      type="textarea"
                      rows="8"
                      :placeholder="cloudRecordRecordingConfigExample"
                    ></el-input>
                  </el-col>
                </el-form-item>
                <p v-if="cloudRecordingConfigErrorTip" class="error">{{ cloudRecordingConfigErrorTip }}</p>
                <el-form-item :label="$t('Storage config')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-radio-group v-model="cloudRecordingStorageConfigurationSwitcher">
                      <el-radio label="1">{{ $t('Default') }}</el-radio>
                      <el-radio label="2">{{ $t('Customized') }}</el-radio>
                    </el-radio-group>
                  </el-col>
                </el-form-item>
                <el-form-item v-if="cloudRecordingStorageConfigurationSwitcher === '2'" label="">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input
                      v-model="cloudRecordModel.storageConfig"
                      type="textarea"
                      rows="8"
                      :placeholder="cloudRecordStorageConfigExample"
                    ></el-input>
                  </el-col>
                </el-form-item>
                <p v-if="cloudRecordingStorageErrorTip" class="error">{{ cloudRecordingStorageErrorTip }}</p>
              </div>
            </div>
            <!--环信IM配置（仅中国）-->
            <div class="project-module mb-20">
              <div class="module-item-title">{{ $t('EN IM') }}</div>
              <div class="module-content">
                <el-form-item :label="$t('Enable')">
                  <el-switch
                    v-model="huanxinModel.enabled"
                    :active-value="true"
                    :inactive-value="false"
                    active-color="#13ce66"
                    inactive-color="#c1c1c1"
                  ></el-switch>
                </el-form-item>
                <el-form-item :label="$t('API host')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="huanxinModel.huanxin.apiHost" :disabled="!huanxinModel.enabled"></el-input>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('orgName')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="huanxinModel.huanxin.orgName" :disabled="!huanxinModel.enabled"></el-input>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('superAdmin')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="huanxinModel.huanxin.superAdmin" :disabled="!huanxinModel.enabled"></el-input>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('appName')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="huanxinModel.huanxin.appName" :disabled="!huanxinModel.enabled"></el-input>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('appKey')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="huanxinModel.huanxin.appKey" :disabled="!huanxinModel.enabled"></el-input>
                  </el-col>
                </el-form-item>
                <p v-if="huanxinErrorTip" class="error">{{ huanxinErrorTip }}</p>
              </div>
            </div>
            <!--CDN配置-->
            <div class="project-module mb-20">
              <div class="module-item-title">{{ $t('Fusion CDN') }}</div>
              <div class="module-content">
                <el-form-item :label="$t('aPaaS Push Domain')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="cdnModel.pushDomain"></el-input>
                  </el-col>
                </el-form-item>
                <el-form-item :label="$t('aPaaS Pull Domain')">
                  <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                    <el-input v-model="cdnModel.pullDomain"></el-input>
                  </el-col>
                </el-form-item>
              </div>
            </div>
            <el-form-item style="padding: 20px">
              <el-col :xs="24" :sm="24" :md="20" :lg="14" :xl="10">
                <console-button class="console-btn-size-md console-btn-white" @click="pageToEditProject">
                  {{ $t('Cancel') }}
                </console-button>
                <console-button
                  class="console-btn-size-md console-btn-primary"
                  :disabled="accountBlocked || loading"
                  :loading="loading"
                  @click="onClickSave"
                >
                  {{ $t('Save') }}
                </console-button>
              </el-col>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <el-dialog :title='$t("Warning")' :visible.sync="showWhiteboardSDKTokenDialog" width="500px">
        <div class="p-2">
          <div class="bk-orange color-orange">{{ $t('Generate sdk Token Tip') }}</div>
          <div class="bk-grey">{{ netlessModel.token }}</div>
          <div class="al-center">
            <console-button class="console-btn-primary" v-clipboard:copy="netlessModel.token" @click="copySDKToken">
              {{ $t('Copy SDK Token') }}
            </console-button>
          </div>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class EditApaasView extends Vue {
  // 基础数据
  user = user
  accountBlocked: boolean = false
  projectId = this.$route.params.id
  vendorId = ''
  // 缓存 ApaaS 配置
  remoteApaaSConfiguration: any = {}

  // 缓存白板配置（netless）
  netlessAppUUID = ''
  netlessTeamUUID = ''
  netlessAK = ''
  netlessSK = ''
  enabledNetlessServiceDynamicConversion = 0
  enabledNetlessServiceStaticConversion = 0
  enabledNetlessServiceSnapshot = 0

  // render 相关
  loading: boolean = false
  showDocs: boolean = false
  cloudRecordingConfigurationSwitcher: '1' | '2' = '1'
  cloudRecordingStorageConfigurationSwitcher: '1' | '2' = '1'
  showWhiteboardSDKTokenDialog = false
  needNetlessTokenTip = ''
  netlessErrorTip = ''
  cloudRecordingConfigErrorTip = ''
  cloudRecordingStorageErrorTip = ''
  huanxinErrorTip = ''

  // 表单 Model
  netlessModel = {
    enabled: false,
    appId: '',
    token: '',
    oss: { vendor: 2 } as any,
  }
  cloudRecordModel = {
    enabled: false,
    recordingConfig: '' as any,
    storageConfig: '' as any,
  }
  huanxinModel = {
    enabled: false,
    vendor: 1,
    huanxin: {
      type: 1,
      apiHost: '',
      orgName: '',
      superAdmin: '',
      appName: '',
      appKey: '',
    } as any,
  }
  cdnModel = {
    pushDomain: '',
    pullDomain: '',
  }

  // aPaaS API 返回的默认值
  defaultCloudRecordStorageConfig = JSON.stringify(
    {
      bucket: '',
      fileNamePrefix: [],
      accessKey: '',
      secretKey: '******',
      endpoint: '',
    },
    null,
    4
  )

  // 从文档里找来的 https://docs.agora.io/cn/cloud-recording/cloud_recording_composite_mode?platform=RESTful
  cloudRecordRecordingConfigExample = JSON.stringify(
    {
      maxIdleTime: 30,
      streamTypes: 2,
      audioProfile: 1,
      channelType: 0,
      videoStreamType: 0,
      transcodingConfig: {
        height: 640,
        width: 360,
        bitrate: 500,
        fps: 15,
        mixedVideoLayout: 1,
        backgroundColor: '#FF0000',
      },
      subscribeVideoUids: ['123', '456'],
      subscribeAudioUids: ['123', '456'],
      subscribeUidGroup: 0,
    },
    null,
    4
  )

  // 从文档里找来的
  cloudRecordStorageConfigExample = JSON.stringify(
    {
      accessKey: 'xxxxxxf',
      region: 3,
      bucket: 'xxxxx',
      secretKey: 'xxxxx',
      vendor: 2,
      fileNamePrefix: ['directory1', 'directory2'],
    },
    null,
    4
  )

  async mounted() {
    this.loading = true
    await this.fetchAllData()
    this.loading = false
  }

  async onClickSave() {
    this.loading = true
    await this.updateApaasConfiguration()
    this.loading = false
  }

  async fetchAllData() {
    const lifeCycleInfo = await getLifeCycle()
    await this.fetchProjectInfo()
    await this.fetchApaasConfiguration()
    this.fetchNetlessConfiguration()
    this.setDefaultVendor()
    this.accountBlocked = [2, 3, 4].indexOf(lifeCycleInfo.financialStatus) >= 0
    if (this.accountBlocked) {
      this.$message.error(this.$t('AccountBlockedProject') as string)
    }
  }

  async fetchProjectInfo() {
    try {
      const project = await getProjectInfo(this.projectId)
      this.vendorId = project.info.id
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' }).then(() => {})
    }
  }

  async fetchApaasConfiguration() {
    const config = await getApaasConfiguration(this.projectId)
    this.remoteApaaSConfiguration = config
    this.netlessModel = Object.assign({}, this.netlessModel, config.appConfigs?.netless || {})
    this.cloudRecordModel = Object.assign({}, this.cloudRecordModel, config.appConfigs?.cloudRecording || {})
    this.huanxinModel = Object.assign({}, this.huanxinModel, config.appConfigs?.im || {})
    this.cdnModel = Object.assign({}, this.cdnModel, config.appConfigs?.fusionCDN || {})
    this.convertCloudRecordJson()
  }

  async fetchNetlessConfiguration() {
    try {
      const data = await getNetlessConfiguration(this.vendorId)
      this.netlessAK = data?.basicInfo?.ak
      this.netlessSK = data?.basicInfo?.sk
      this.netlessAppUUID = data?.basicInfo?.appUUID
      this.netlessTeamUUID = data?.basicInfo?.teamUUID
      this.netlessModel.enabled =
        !!this.netlessAK && !!this.netlessSK && !!this.netlessAppUUID && !!this.netlessTeamUUID
      if (!this.netlessModel.appId && this.netlessTeamUUID && this.netlessAppUUID) {
        this.netlessModel.appId = [this.netlessTeamUUID, this.netlessAppUUID].join('/')
      }
      this.parseNetlessServiceStatus(data?.serviceInfo)
    } catch (e) {
      this.$message.error(this.$t('FailedGetNetlessInfo') as string)
    }
  }

  generateSDKToken() {
    try {
      this.$alert(this.$t('ConfirmUpdateSDKtoken') as string, this.$t('UpdateSDKtoken') as string, {
        showCancelButton: true,
        cancelButtonText: this.$t('ButtonCancelUpdateSDKToken') as string,
        confirmButtonText: this.$t('ButtonUpdateSDKToken') as string,
        callback: async (action) => {
          if (action === 'confirm') {
            this.netlessModel.token = await updateNetlessToken(this.vendorId, {
              ak: this.netlessAK,
              sk: this.netlessSK,
            })
            this.showWhiteboardSDKTokenDialog = true
            this.needNetlessTokenTip = ''
          }
        },
      }).then(() => {})
    } catch (e) {
      this.$message.error(this.$t('UpdateWhiteboardTokenError') as string)
      return false
    }
  }

  async updateApaasConfiguration() {
    try {
      this.emptyTips()
      if (this.isTheFirstConfig() && !this.existNewNetlessToken()) {
        this.$message.warning(this.$t('Generate a token first') as string)
        this.needNetlessTokenTip = this.$t('Generate a token first') as string
        return
      }
      const payload = this.formatFormData()
      if (!payload) return
      const data = await updateApaasConfiguration(this.projectId, payload)
      if (data.code === 0) {
        this.$message.success(this.$t('ApplySuccess') as string)
        this.$router.push({ path: `/project/${this.projectId}` }).then()
      } else {
        this.$message.warning(data.msg)
      }
    } catch (e) {
      if (e.response && e.response.data.code === 15000) {
        this.$message.warning(this.$t('FailedGetRestfulKeys') as string)
      } else if (e.response && e.response.data.code !== 500 && e.response.data.msg) {
        this.$message.warning(e.response.data.msg)
      } else {
        this.$message.warning(this.$t('UpdateAPaasConfigError') as string)
      }
    }
    await this.fetchAllData()
  }

  parseNetlessServiceStatus(serviceInfo: any) {
    if (serviceInfo?.dynamic_conversion?.length > 0) {
      for (const conf of serviceInfo.dynamic_conversion) {
        if (conf.isEnabled === 1) {
          this.enabledNetlessServiceDynamicConversion = 1
          break
        }
      }
    }
    if (serviceInfo?.snapshot?.length > 0) {
      for (const conf of serviceInfo.snapshot) {
        if (conf.isEnabled === 1) {
          this.enabledNetlessServiceSnapshot = 1
          break
        }
      }
    }
    if (serviceInfo?.static_conversion?.length > 0) {
      for (const conf of serviceInfo.static_conversion) {
        if (conf.isEnabled === 1) {
          this.enabledNetlessServiceStaticConversion = 1
          break
        }
      }
    }
  }

  existNewNetlessToken() {
    return this.netlessModel.token && !this.netlessModel.token.includes('**')
  }

  isTheFirstConfig() {
    // 如果服务端没有存过白板 appid，那就说明本次配置是第一次
    const remoteNetlessAppId = this.remoteApaaSConfiguration?.appConfigs?.netless?.appId || ''
    return !remoteNetlessAppId
  }

  setCloudRecordRecordingConfigAsCustomized() {
    this.cloudRecordingConfigurationSwitcher = '2'
  }

  setCloudRecordStorageConfigAsCustomized() {
    this.cloudRecordingStorageConfigurationSwitcher = '2'
  }

  setCloudRecordRecordingConfigAsDefault() {
    this.cloudRecordModel.recordingConfig = ''
    this.cloudRecordingConfigurationSwitcher = '1'
  }

  setCloudRecordStorageConfigAsDefault() {
    this.cloudRecordModel.storageConfig = ''
    this.cloudRecordingStorageConfigurationSwitcher = '1'
  }

  emptyTips() {
    this.cloudRecordingConfigErrorTip = ''
    this.cloudRecordingStorageErrorTip = ''
    this.needNetlessTokenTip = ''
    this.huanxinErrorTip = ''
    this.netlessErrorTip = ''
  }

  formatFormData() {
    this.netlessModel.enabled = true
    this.cloudRecordModel.enabled = true
    // this.huanxinModel.enabled = true
    if (!this.huanxinModel.enabled) {
      this.huanxinModel = { enabled: false, vendor: 1, huanxin: {} }
    }
    let recordingConfig = {}
    if (this.cloudRecordingConfigurationSwitcher === '2' && this.cloudRecordModel.recordingConfig) {
      try {
        recordingConfig = JSON.parse(this.cloudRecordModel.recordingConfig)
      } catch (e) {
        this.cloudRecordingConfigErrorTip = this.$t('ParameterError') as string
        return null
      }
    }
    let storageConfig = {}
    if (this.cloudRecordingStorageConfigurationSwitcher === '2' && this.cloudRecordModel.storageConfig) {
      try {
        storageConfig = JSON.parse(this.cloudRecordModel.storageConfig)
      } catch (e) {
        this.cloudRecordingStorageErrorTip = this.$t('ParameterError') as string
        return null
      }
    }
    return {
      netlessJson: JSON.stringify(this.netlessModel),
      cloudRecordingJson: JSON.stringify({
        enabled: this.cloudRecordModel.enabled,
        recordingConfig: recordingConfig,
        storageConfig: storageConfig,
      }),
      IMJson: JSON.stringify(this.huanxinModel),
      fusionCDNJson: JSON.stringify(this.cdnModel),
    }
  }

  convertCloudRecordJson() {
    try {
      this.cloudRecordModel.recordingConfig = JSON.stringify(this.cloudRecordModel.recordingConfig, null, 4)
      this.cloudRecordModel.storageConfig = JSON.stringify(this.cloudRecordModel.storageConfig, null, 4)
      if (['', '""', '{}'].indexOf(this.cloudRecordModel.recordingConfig) !== -1) {
        this.setCloudRecordRecordingConfigAsDefault()
      } else {
        this.setCloudRecordRecordingConfigAsCustomized()
      }
      if (['', '""', '{}', this.defaultCloudRecordStorageConfig].indexOf(this.cloudRecordModel.storageConfig) !== -1) {
        this.setCloudRecordStorageConfigAsDefault()
      } else {
        this.setCloudRecordStorageConfigAsCustomized()
      }
    } catch (e) {
      this.setCloudRecordRecordingConfigAsDefault()
      this.setCloudRecordStorageConfigAsDefault()
    }
  }

  copySDKToken() {
    this.$message({
      message: this.$t('SDK Token Copied') as string,
      type: 'success',
    })
  }

  setDefaultVendor() {
    this.huanxinModel.vendor = 1
    this.huanxinModel.huanxin.type = 1
    if (!this.netlessModel.oss.vendor) {
      this.netlessModel.oss.vendor = 2
    }
  }

  pageGoToNetlessConfig() {
    this.$alert(this.$t('GoToWhiteboardConfigTips') as string, this.$t('GoToWhiteboardConfig') as string, {
      showCancelButton: true,
      cancelButtonText: this.$t('Cancel') as string,
      confirmButtonText: this.$t('Confirm') as string,
      callback: (action) => {
        if (action === 'confirm') {
          this.$router.push({ path: `/project/${this.projectId}/whiteboard` })
        }
      },
    }).then(() => {})
  }

  pageToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }
}
