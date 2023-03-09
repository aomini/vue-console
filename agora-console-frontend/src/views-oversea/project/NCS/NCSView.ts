import Vue from 'vue'
import Component from 'vue-class-component'
const shortid = require('shortid')
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: `<div class="ncs">
    <div class="d-flex">
      <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
      <el-breadcrumb separator="|" class="mb-20">
        <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $t('Notification Center Service Configuration') }}</el-breadcrumb-item>
      </el-breadcrumb>
      <span class="ml-30 f-14" style="line-height: 1;"
        ><a :href="link.main" target="_blank">{{ $t('How to config') }}</a></span
      >
    </div>
    <div class="card" v-loading="loading">
      <div class="module-hint mb-20" v-if="isReviewing">{{ $t('NCS Reviewing Hint') }}</div>
      <div v-if="info.enabled">
        <div class="mb-20">
          <console-button class="console-btn-primary" @click="() => {isEditing = true}">
            {{ $t('Config Notification Service') }}
          </console-button>
          <console-button class="console-btn-white" @click="healthCheckAll(true)">
            {{ $t('Test health status') }}
          </console-button>
        </div>
      </div>
      <el-form size="small" label-width="180px" ref="form" :model="info" :rules="rules">
        <div class="w-500 m-auto">
          <el-form-item :label="$t('Status') + ':'" v-if="info.enabled">
            <el-switch v-model="info.enabled" @change="handleStatusChange"> </el-switch>
          </el-form-item>
          <el-form-item :label="$t('Status') + ':'" v-if="isReviewing">
            <span v-if="isReviewing">{{ $t('Configuring') }}</span>
          </el-form-item>
          <el-form-item :label="$t('Product Name') + ':'" prop="productId">
            <span>{{ $t('RTC channel event callbacks') }}</span>
          </el-form-item>
          <el-form-item :label="$t('Event') + ':'" style="white-space: nowrap" required prop="eventIds">
            <span slot="label">
              <el-tooltip placement="top" effect="light" class="prject-tooltip">
                <img class="ml-3" width="15" :src="IconQuestion" alt="" />
                <div slot="content">
                  <a :href="link.eventCallbacks" target="_blank">{{ $t('View channel event callbacks') }}</a>
                </div>
              </el-tooltip>
              {{ $t('Event') + ':' }}
            </span>
            <span v-if="isReviewing || (!isEditing && info.enabled)">{{ eventLabel }}</span>
            <el-select
              v-else
              v-model="info.eventIds"
              :placeholder="$t('NCS Event Placeholder')"
              multiple
              @change="handleEventChange"
              style="width: 320px"
            >
              <el-option
                v-for="item in eventOptions"
                :key="item.id"
                :label="item.displayName + '=' + item.eventType"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('Receive Server Location') + ':'"
            style="white-space: nowrap"
            required
            prop="urlRegion"
          >
            <span v-if="isReviewing || (!isEditing && info.enabled)">{{ info.urlRegion }}</span>
            <el-select
              v-else
              v-model="info.urlRegion"
              :placeholder="$t('Please select the receive server location')"
              style="width: 320px"
            >
              <el-option v-for="item in urlRegionOptions" :key="item.value" :label="$t(item.label)" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('Receive Server URL') + ':'" required prop="url">
            <span v-if="isReviewing || (!isEditing && info.enabled)">{{ info.url }}</span>
            <el-input v-else v-model="info.url" placeholder="https://XXXXXX.com/webhook"></el-input>
          </el-form-item>
          <el-form-item>
            <span slot="label">
              <el-tooltip effect="light" class="prject-tooltip" placement="top">
                <img class="ml-3" width="15" :src="IconQuestion" alt="" />
                <div slot="content">
                  {{ $t('What is') }} <a :href="link.secret" target="_blank">{{ $t('Secret') }}</a>
                </div>
              </el-tooltip>
              {{ $t('Secret') + ':' }}
            </span>
            <span>{{ info.secret }}</span>
          </el-form-item>
          <el-form-item>
            <span slot="label">
              <el-tooltip placement="top" effect="light" class="prject-tooltip">
                <img class="ml-3" width="15" :src="IconQuestion" alt="" />
                <div slot="content">
                  {{ $t('Allowed IP List Hint') }}
                  <a :href="link.ipWhiteList" target="_blank">{{ $t('How to get Allowed IP List') }}</a>
                </div>
              </el-tooltip>
              {{ $t('Allowed IP List') + ':' }}
            </span>
            <span v-if="isReviewing || (!isEditing && info.enabled)">{{
              info.useIpWhitelist ? $t('Enabled') : $t('Disabled')
            }}</span>
            <el-checkbox v-else v-model="info.useIpWhitelist"></el-checkbox>
          </el-form-item>
        </div>
      </el-form>
      <div class="mt-20 text-center" v-if="!isReviewing && !(info.enabled && !isEditing)">
        <console-button class="console-btn-white" @click="backToEditProject">
          {{ $t('Cancel') }}
        </console-button>
        <console-button class="console-btn-primary" @click="healthCheckAll" :disabled="loading" v-loading="loading">
          {{ $t('Save') }}
        </console-button>
      </div>
    </div>
    <el-dialog :visible="showHealthDialog" :before-close="cancel" :title="$t('NCS Health Test')">
      <div style="min-height: 100px">
        <div v-if="isHealthChecking" class="text-center">{{ $t('NCS Health test in progress. Please wait...') }}</div>
        <div v-else-if="healthCheckResult" class="text-center mb-30">
          <div class="heading-dark-14 mb-20">{{ $t('NCS Health Test Result') }}</div>
          <span class="f-14 color-success" v-if="healthCheckResult === 'success'"
            ><i class="el-icon-success green mr-5"></i>{{ $t(healthCheckResult) }}</span
          >
          <span class="f-14 error" v-else><i class="el-icon-error mr-5"></i>{{ $t(healthCheckResult) }}</span>
          <div class="mt-10 text-left" v-if="healthCheckResult === 'failed' && healthCheckResponse">
            {{ healthCheckResponse }}
          </div>
        </div>
        <div class="text-right mt-20" v-if="!isHealthChecking && healthCheckResult">
          <console-button class="console-btn-size-md" @click="cancel">
            {{ $t('Cancel') }}
          </console-button>
          <console-button
            class="console-btn-size-md console-btn-primary"
            @click="showNote"
            v-if="healthCheckStatus && !isOnlyHealthCheck"
          >
            {{ $t('Save NCS Configuration') }}
          </console-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog :visible="showConfigDialog" :before-close="cancel" :title="$t('Notification')">
      <div>
        <span class="heading-dark-14">{{ $t('NCS Notification') }}</span>
      </div>
      <div class="text-right mt-20" v-if="!isHealthChecking && healthCheckResult === 'success'">
        <console-button class="console-btn-size-md" @click="cancel">
          {{ $t('Cancel') }}
        </console-button>
        <console-button class="console-btn-size-md console-btn-primary" @click="saveConfig" v-loading="configLoading">
          {{ $t('Save NCS Configuration') }}
        </console-button>
      </div>
    </el-dialog>
  </div>`,
})
export default class NCSView extends Vue {
  projectId = ''
  loading = false
  configLoading = false
  isHealthChecking = false
  healthCheckStatus = false
  healthCheckResult = ''
  healthCheckResponse = ''
  showHealthDialog = false
  showConfigDialog = false
  isOnlyHealthCheck = false
  test = []
  configId: any = 0
  isReviewing = false
  isEditing = false
  info: any = {
    eventIds: [],
    productId: 1,
    secret: shortid.generate(),
    url: '',
    useIpWhitelist: false,
    urlRegion: '',
  }
  eventOptions = []
  selectEvents = []
  urlRegionOptions = [
    { value: 'cn', label: 'cn - P.R.China' },
    { value: 'sea', label: 'sea - APAC' },
    { value: 'na', label: 'na - NCSA' },
    { value: 'eu', label: 'eu - EMEA' },
  ]
  link = {
    main: 'https://docs.agora.io/cn/Interactive%20Broadcast/enable_webhook_ncs?platform=RESTful',
    secret: 'https://docs.agora.io/cn/Interactive%20Broadcast/signature_verify?platform=RESTful',
    retry:
      'https://docs-preview.agoralab.co/cn/Agora%20Platform/ncs?platform=All%20Platforms' +
      '#%E7%94%A8%E6%88%B7%E9%85%8D%E7%BD%AE',
    ipWhiteList: 'https://docs.agora.io/cn/Video/enable_webhook_ncs?platform=RESTful#查询消息通知服务器的-ip-地址',
    eventCallbacks: 'https://docs.agora.io/cn/Interactive%20Broadcast/rtc_channel_event?platform=RESTful',
  }
  IconQuestion = IconQuestion
  rules = {
    eventIds: [{ required: true, message: this.$t('NCS Event Placeholder'), trigger: 'blur' }],
    url: [
      {
        required: true,
        message: this.$t('Please enter the receive server url'),
        pattern: /(https):\/\/([\w.]+\/?)\S*/,
        trigger: 'blur',
      },
    ],
    urlRegion: [{ required: true, message: this.$t('Please select the receive server location'), trigger: 'blur' }],
  }

  get eventLabel() {
    return this.selectEvents.map((event: any) => event.displayName + '=' + event.eventType).join(',')
  }

  async mounted() {
    this.projectId = this.$route.params.id
    await this.init()
  }

  async init() {
    this.info['enabled'] = false
    this.loading = true
    await this.getNCSEvents()
    await this.getNCSAuditInfo()
    if (!this.isReviewing) {
      await this.getNCSInfo()
    }
    this.loading = false
  }

  async getNCSInfo() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/ncs`)
      if (res.data) {
        this.configId = res.data.id
        this.info.eventIds = res.data.events.map((event: any) => event.eventId)
        this.info.url = res.data.url
        this.info.enabled = res.data.enabled
        this.info.useIpWhitelist = res.data.useIpWhitelist
        this.info.urlRegion = res.data.urlRegion
        this.info.secret = res.data.secret
        this.handleEventChange(this.info.eventIds)
      }
    } catch (e) {}
  }

  async getNCSAuditInfo() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/ncs/audit`)
      if (res.data && res.data.vid) {
        this.isReviewing = true
        this.info.eventIds = res.data.event
        this.info.url = res.data.url
        this.info.useIpWhitelist = !!res.data.use_ip_whitelist
        this.info.urlRegion = res.data.url_region
        this.info.secret = res.data.secret
        this.handleEventChange(this.info.eventIds)
      }
    } catch (e) {}
  }

  async getNCSEvents() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/ncs/events`)
      if (res.data) {
        this.eventOptions = res.data.filter((item: any) => item.eventType !== 114)
      }
    } catch (e) {}
  }

  async healthCheck(event: any) {
    try {
      const params = {
        url: this.info.url,
        secret: this.info.secret,
        productId: this.info.productId,
        eventType: event.eventType,
        payload: event.payload,
        urlRegion: this.info.urlRegion,
      }
      const res = await this.$http.post(`/api/v2/project/${this.projectId}/ncs/check`, params)
      if (res.data && res.data.success) {
        return true
      }
      this.healthCheckResponse = JSON.stringify(
        {
          success: res.data.success,
          httpCode: res.data.httpCode,
          error: res.data.error,
          response: res.data.response,
        },
        null,
        '\t'
      )
      return false
    } catch (e) {
      this.healthCheckResponse = this.$t('Fail, please try again') as string
      return false
    }
  }

  async healthCheckAll(isOnlyHealthCheck = false) {
    ;(this.$refs['form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.healthCheckStatus = false
        this.showHealthDialog = true
        this.isHealthChecking = true
        let tempHealth = true
        this.healthCheckResult = 'success'
        for (const event of this.selectEvents) {
          const health = await this.healthCheck(event)
          if (!health) {
            tempHealth = false
            this.healthCheckResult = 'failed'
            break
          }
        }
        this.isOnlyHealthCheck = isOnlyHealthCheck
        this.healthCheckStatus = tempHealth
        this.isHealthChecking = false
      } else {
        return false
      }
    })
  }

  handleEventChange(events: any) {
    this.selectEvents = []
    events.forEach((event: any) => {
      const res = this.eventOptions.find((item: any) => item.id === event)
      if (res) {
        this.selectEvents.push(res)
      }
    })
  }

  async saveConfig() {
    if (!this.healthCheckStatus) return
    this.configLoading = true
    try {
      const params = {
        configId: this.configId,
        url: this.info.url,
        secret: this.info.secret,
        productId: this.info.productId,
        urlRegion: this.info.urlRegion,
        // eventType: this.selectEvents.map((event: any) => event.displayName + '=' + event.eventType),
        eventIds: this.info.eventIds,
        useIpWhitelist: this.info.useIpWhitelist,
      }
      await this.$http.post(`/api/v2/project/${this.projectId}/ncs/audit`, params)
      this.showConfigDialog = false
      this.$message({
        message: this.$t('create_success') as string,
        type: 'success',
      })
      this.init()
    } catch (e) {
      console.info(e)
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.configLoading = false
  }

  showNote() {
    this.showHealthDialog = false
    this.showConfigDialog = true
  }

  cancel() {
    this.showHealthDialog = false
    this.healthCheckResult = ''
    this.healthCheckResponse = ''
    this.isHealthChecking = false
    this.healthCheckStatus = false
    this.showConfigDialog = false
    this.isOnlyHealthCheck = false
    this.getNCSInfo()
  }

  handleStatusChange(value: any) {
    if (!value) {
      this.$confirm(this.$t('NCS Disable Hint') as string, this.$t('Disable Notification Center Service') as string, {
        confirmButtonText: this.$t('Disable') as string,
        cancelButtonText: this.$t('Cancel') as string,
      })
        .then(() => {
          this.closeNCSConfig()
        })
        .catch(() => {})
    }
  }

  async closeNCSConfig() {
    this.loading = true
    try {
      await this.$http.delete(`/api/v2/project/${this.projectId}/ncs/${this.configId}`)
      this.$message({
        message: this.$t('Update successfully') as string,
        type: 'success',
      })
      this.getNCSInfo()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  backToEditProject() {
    if (this.isEditing) {
      this.isEditing = false
      this.getNCSInfo()
    } else {
      this.$router.push({ path: '/project/' + this.projectId })
    }
  }
}
