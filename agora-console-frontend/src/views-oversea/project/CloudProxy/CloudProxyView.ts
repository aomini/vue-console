import Vue from 'vue'
import Component from 'vue-class-component'
import { getProjectInfo } from '@/services'
import EnableCloudProxy from '@/views-oversea/project/CloudProxy/EnableCloudProxy'
import DisableCloudProxy from '@/views-oversea/project/CloudProxy/DisableCloudProxy'

@Component({
  components: {
    'enable-cloud-proxy': EnableCloudProxy,
    'disable-cloud-proxy': DisableCloudProxy,
  },
  template: `
    <div class="rtmp" v-loading="loading">
      <div class="d-flex justify-between">
        <div class="d-flex">
          <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
          <el-breadcrumb separator="|" class="mb-20">
            <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('Cloud Proxy Configuration') }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div>
          <span
            >{{ $t('How to config')
            }}<a :href="$t('Agora Allowed IP List URL')" target="_blank">{{ $t('Agora Allowed IP List') }}</a></span
          >
        </div>
      </div>
      <div class="config-item mb-20">
        <div class="header">
          <div class="item-title">
            <span class="heading-dark-16">{{ $t('Cloud Proxy ( Force UDP and TCP modes )') }}</span>
          </div>
        </div>
        <div class="content-box">
          <div class="content">
            <div class="d-flex">
              <span class="heading-dark-13 mr-20"> {{ $t('Status') }} </span>
              <el-switch v-model="status" @change="handleStatus"></el-switch>
              <span class="heading-grey-13 ml-10"> {{ status ? $t('Enabled') : $t('Disabled') }} </span>
            </div>
          </div>
        </div>
      </div>
      <enable-cloud-proxy
        v-if="showEnableDialog"
        :loading="loading"
        :cancelEnable="cancelEnable"
        :enableCloud="updateCloudProxyStatus"
      ></enable-cloud-proxy>
      <disable-cloud-proxy
        v-if="showDisableDialog"
        :loading="loading"
        :cancelDisable="cancelDisable"
        :disableCloud="updateCloudProxyStatus"
        :pcuLimit="pcuLimit"
      ></disable-cloud-proxy>
    </div>
  `,
})
export default class CloudProxyView extends Vue {
  loading = false
  projectId = ''
  vendorInfo: any = {}
  status = false
  pcuLimit = 0
  showEnableDialog = false
  showDisableDialog = false

  async mounted() {
    this.projectId = this.$route.params.id
    this.getProject()
    this.getCloudProxyStatus()
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

  handleStatus(value: boolean) {
    if (value) {
      this.showEnableDialog = true
    } else {
      this.showDisableDialog = true
    }
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }

  async getCloudProxyStatus() {
    this.loading = true
    const result = await this.$http.get(`/api/v2/project/${this.projectId}/cloud-proxy/status`)
    this.status = result.data.enabled
    this.pcuLimit = result.data.pcu_limit
    this.loading = false
  }

  async updateCloudProxyStatus() {
    this.loading = true
    const params = {
      enabled: this.status,
    }
    try {
      const result = await this.$http.post(`/api/v2/project/${this.projectId}/cloud-proxy/status`, params)
      if (result.data.error) {
        this.$message.error(result.data.errMsg)
      } else {
        this.$message.success(
          this.status
            ? (this.$t('Cloud Proxy enabled successfully') as string)
            : (this.$t('Cloud Proxy disabled successfully') as string)
        )
      }
      this.showEnableDialog = false
      this.showDisableDialog = false
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
    this.getCloudProxyStatus()
    this.loading = false
  }

  cancelEnable() {
    this.showEnableDialog = false
    this.status = false
  }

  cancelDisable() {
    this.showDisableDialog = false
    this.status = true
  }
}
