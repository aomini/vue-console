import Vue from 'vue'
import Component from 'vue-class-component'
import '../Project.less'
import { getProjectInfo, user } from '@/services'
import { CloudTypeMap } from '@/models/uapModels'
import { RouteRecord } from 'vue-router/types/router'

@Component({
  template: `
    <div class="rtmp" v-loading="loading">
      <div class="d-flex">
        <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
        <el-breadcrumb separator="|" class="mb-20">
          <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ $t('Media push configuration') }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="blue-hint">
        <span class="heading-dark-14" v-html="DefaultQuotaHint"></span>
      </div>
      <div class="config-item mb-20">
        <div class="header">
          <div class="item-title">
            <span class="heading-dark-16">{{ $t('SDK API') }}</span>
            <el-tooltip :content="$t('SDK API Hint')" placement="right" popper-class="mw-250" effect="light">
              <i class="el-icon-info project-tooltip"></i>
            </el-tooltip>
          </div>
        </div>
        <div class="content-box">
          <div class="content">
            <div class="d-flex">
              <span class="heading-dark-13 mr-20"> {{ $t('Status') }} </span>
              <el-switch v-model="SDKStatus" :disabled="SDKStatus" @change="handleSDKStatus"></el-switch>
              <span class="heading-grey-13 ml-10"> {{ SDKStatus ? $t('Enabled') : $t('Disabled') }} </span>
            </div>
          </div>
        </div>
      </div>
      <div class="config-item">
        <div class="header">
          <div class="item-title">
            <span class="heading-dark-16">{{ $t('Server-side RESTful API') }}</span>
            <el-tooltip :content="$t('REST API Hint')" placement="right" popper-class="mw-250" effect="light">
              <i class="el-icon-info project-tooltip"></i>
            </el-tooltip>
          </div>
        </div>
        <div class="content-box">
          <div class="content">
            <div class="d-flex">
              <span class="heading-dark-13 mr-20"> {{ $t('Status') }} </span>
              <el-switch v-model="RESTStatus" :disabled="RESTStatus" @change="handleRESTStatus"></el-switch>
              <span class="heading-grey-13 ml-10"> {{ RESTStatus ? $t('Enabled') : $t('Disabled') }} </span>
            </div>
          </div>
        </div>
      </div>
      <div class="text-right">
        <div class="link mt-20">
          <a :href="$t('RTMP Config Url')" target="_blank">{{ $t('Integrated documentation') }}</a>
        </div>
      </div>

      <el-dialog :title='$t("Enable Media push SDK API")' :visible="showSDKDialog" :before-close="handleSDKClose">
        <div class="heading-grey-13 mb-10">
          {{
            $t('Media push SDK API cannot be disabled after enabling. No additional charges if not used after enabling')
          }}
        </div>
        <div class="heading-grey-13 link">
          <a target="_blank" :href="$t('RTMP Billing Doc Url')">{{ $t('Pricing for Media push') }}</a>
        </div>
        <div class="text-right mt-30">
          <console-button class="console-btn-white" @click="handleSDKClose">
            {{ $t('Cancel') }}
          </console-button>
          <console-button class="console-btn-primary" :disabled="loading" :loading="loading" @click="enableSDK">
            {{ $t('Save') }}
          </console-button>
        </div>
      </el-dialog>

      <el-dialog :title='$t("Enable Media push REST API")' :visible="showRESTDialog" :before-close="handleRESTClose">
        <div class="heading-grey-13 mb-10">
          {{
            $t(
              'Media push REST API cannot be disabled after enabling. No additional charges if not used after enabling'
            )
          }}
        </div>
        <div class="heading-grey-13 link">
          <a target="_blank" :href="$t('RTMP Billing Doc Url')">{{ $t('Pricing for Media push') }}</a>
        </div>
        <div class="text-right mt-30">
          <console-button class="console-btn-white" @click="handleRESTClose">
            {{ $t('Cancel') }}
          </console-button>
          <console-button class="console-btn-primary" :disabled="loading" :loading="loading" @click="enableREST">
            {{ $t('Save') }}
          </console-button>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class ConfigurationView extends Vue {
  loading = false
  projectId = ''
  SDKStatus = false
  RESTStatus = false
  showSDKDialog = false
  showRESTDialog = false
  vendorInfo: any = {}
  isCN = user.info.company.area === 'CN'
  region = user.info.company.country === 'CN' ? '1' : '2'

  async mounted() {
    this.projectId = this.$route.params.id
    this.changeBreadcrumb()
    this.getProject()
    this.initExtensionStatus()
  }

  get DefaultQuotaHint() {
    return this.isCN ? this.$t('MediaPushDefaultQuotaHintCN') : this.$t('MediaPushDefaultQuotaHintEN')
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }

  async initExtensionStatus() {
    try {
      this.loading = true
      const extensionSetting = await this.$http.get(`/api/v2/project/${this.projectId}/extension-setting`)
      this.SDKStatus = extensionSetting.data['PushStreaming3.0']
      this.RESTStatus = extensionSetting.data.RTMPConverter
    } catch (e) {}
    this.loading = false
  }

  async getProject() {
    try {
      const project = await getProjectInfo(this.projectId)
      this.vendorInfo = project.info
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' })
    }
  }

  async openUapSetting(type: number) {
    try {
      this.loading = true
      await this.$http.post(`/api/v2/usage/uap/setting`, {
        vids: this.vendorInfo.id,
        typeId: type,
        region: this.region,
      })
      if (type === CloudTypeMap['PushStreaming3.0']) {
        this.showSDKDialog = false
      } else {
        this.showRESTDialog = false
      }
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.initExtensionStatus()
    } catch (e) {
      this.$message.error(this.$t('NetworkError') as string)
    }
    this.loading = false
  }

  async enableSDK() {
    await this.openUapSetting(CloudTypeMap['PushStreaming3.0'])
  }

  async enableREST() {
    await this.openUapSetting(CloudTypeMap['RTMPConverter'])
  }

  handleRESTStatus(value: boolean) {
    if (value) {
      this.showRESTDialog = true
    }
  }

  handleSDKStatus(value: boolean) {
    if (value) {
      this.showSDKDialog = true
    }
  }

  handleSDKClose() {
    this.showSDKDialog = false
    this.SDKStatus = false
  }

  handleRESTClose() {
    this.showRESTDialog = false
    this.RESTStatus = false
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: '/projects',
        meta: {
          breadcrumb: 'ProjectList',
        },
      },
      {
        path: `/project/${this.projectId}`,
        meta: {
          breadcrumb: 'ProjectDetail',
        },
      },
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: 'Media push configuration',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
