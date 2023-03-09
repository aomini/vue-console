import Vue from 'vue'
import Component from 'vue-class-component'
import CertificateCard from './CertificateCard'
import DomainCard from './DomainCard'
import SourceDomainCard from './SourceDomainCard'
import { getProjectInfo, user } from '@/services'
import {
  CallbackModel,
  CDNModel,
  CertificateModel,
  DomainModel,
  DomainType,
  SourceDomainModel,
} from '@/models/CDNModels'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  components: {
    'certificate-card': CertificateCard,
    'domain-card': DomainCard,
    'source-domain-card': SourceDomainCard,
  },
  template: `
    <div class="page-v3 enable-cdn">
      <div class="d-flex justify-between mb-20">
        <div class="d-flex">
          <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
          <el-breadcrumb separator="|">
            <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('Enable Fusion-CDN service') }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <a :href="$t('CDN Config Doc')" target="_blank" class="link config-button">{{ $t('How to config') }}</a>
      </div>

      <div class="project-module mb-20" v-loading="domainLoading">
        <div class="module-item-title">{{ $t('Domain information') }}</div>
        <div class="mx-20 pb-10" :class="[user.language === 'chinese' ? 'w-600' : 'w-800']">
          <el-radio-group size="small" v-model="mode" class="mb-10">
            <el-tooltip placement="top" :content="$t('Push and delivery hint')" effect="light">
              <el-radio-button label="Push and delivery">
                {{ $t('Push and delivery') }}
              </el-radio-button></el-tooltip
            >
            <el-tooltip placement="top" :content="$t('Pull stream from your source hint')" effect="light">
              <el-radio-button label="Pull stream from your source">
                {{ $t('Pull stream from your source') }}
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
          <div v-if="mode === 'Pull stream from your source'">
            <el-row type="flex" style="margin: 8px 0">
              <span class="mr-20">{{ $t('Source domain') }}</span>
              <el-switch
                class="vertical-middle"
                v-model="sourceDomain.enabled"
                @change="changeSourceStatus"
              ></el-switch>
            </el-row>
            <source-domain-card
              v-if="sourceDomain.enabled"
              :source-domain="sourceDomain"
              :project-id="projectId"
              :enablePushMode="streamPushingDomain.filter(item => item.status === 'enabled').length > 0"
              @updateDomain="getOriginSite"
            ></source-domain-card>
          </div>
          <div v-if="mode === 'Push and delivery'">
            <el-row type="flex" align="middle" class="mb-16">
              <span class="mr-20"> {{ $t('Stream-pushing domain') }}</span>
              <el-button
                size="small"
                type="text"
                @click="addDomain('publish')"
                :disabled="streamPushingDomain.length >= 5"
                >{{ $t('Add') }}
              </el-button>
            </el-row>
            <domain-card
              v-for="(item, index) in streamPushingDomain"
              :key="'streamPushingDomain' + index"
              :domain="item"
              :certificate-list="certificateList"
              :projectId="projectId"
              @updateDomain="getDomain"
              @deleteUncreatedDomain="streamPushingDomain.splice(index, 1)"
            ></domain-card>
          </div>
          <el-row type="flex" align="middle" class="mb-16">
            <span class="mr-20">
              {{ $t('Playback domain') }}
              <el-tooltip
                :content='$t("PlaybackDomainHint")'
                placement="top"
                effect="light"
                class="mr-10 prject-tooltip"
              >
                <img class="ml-3" width="15" :src="IconQuestion" alt=""
              /></el-tooltip>
            </span>
            <el-button size="small" type="text" @click="addDomain('play')" :disabled="playbackDomain.length >= 5">{{
              $t('Add')
            }}</el-button>
          </el-row>
          <domain-card
            v-for="(item, index) in playbackDomain"
            :key="'playbackDomain' + index"
            :domain="item"
            :domain-list="domainList"
            :certificate-list="certificateList"
            :projectId="projectId"
            @updateDomain="getDomain"
            @deleteUncreatedDomain="playbackDomain.splice(index, 1)"
          ></domain-card>
        </div>
      </div>
      <div class="project-module mb-20 pb-20" v-loading="certificateLoading">
        <div class="module-item-title">{{ $t('Certification') }}</div>
        <div class="mx-20" :class="[user.language === 'chinese' ? 'w-600' : 'w-800']">
          <el-row type="flex" align="middle">
            <span class="mr-20"> {{ $t('Certification') }} </span>
            <el-button size="small" type="text" @click="addCerticateBox">{{ $t('Add') }}</el-button>
          </el-row>
          <certificate-card
            v-for="(item, index) in certificateList"
            :key="'certificate' + index"
            :projectId="projectId"
            :certificate="item"
            @updateCertificate="getCertificateList"
            @deleteUncreatedCertificate="certificateList.splice(index, 1)"
          ></certificate-card>
        </div>
      </div>
      <div class="project-module mb-20 pb-20" v-loading="notificationLoading">
        <div class="module-item-title">{{ $t('CDNNotification') }}</div>
        <div class="mx-20" :class="[user.language === 'chinese' ? 'w-600' : 'w-800']">
          <el-row>
            <el-col :span="7"> {{ $t('Callback') }}</el-col>
            <el-col :span="6">
              <el-switch v-model="callback.enabled" @change="changeCallbackSetting"></el-switch>
            </el-col>
          </el-row>
          <div class="form-box" v-if="callback.enabled">
            <el-row type="flex" align="middle">
              <el-col :span="7">
                <span :class="{ 'required': callback.editable }">{{ $t('Callback Address') }} </span></el-col
              >
              <el-col :span="17">
                <el-input
                  v-if="callback.editable"
                  v-model="callback.url"
                  :placeholder="$t('Callback Address')"
                  size="small"
                ></el-input>
                <span v-else> {{ callback.url }} </span>
              </el-col>
            </el-row>
            <el-row type="flex" justify="end" v-if="callback.editable">
              <el-button size="small" @click="cancelCallbackSetting">
                {{ $t('Cancel') }}
              </el-button>
              <el-button size="small" type="primary" @click="saveCallbackSetting">
                {{ $t('Save') }}
              </el-button>
            </el-row>
            <div class="form-box_buttons" v-if="callback.status !== 'init'" style="right: -30px">
              <el-button type="text" @click="callback.editable = true">
                <i class="iconfont iconicon-bianjineirong f-20 popover-btn" style="color: #409EFF"></i>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class FusionCDNView extends Vue {
  projectId = ''
  loading = false
  vendorInfo: any = {}
  mode: CDNModel = 'Push and delivery'
  sourceDomain: SourceDomainModel = {
    enabled: false,
    domain: '',
    editable: false,
    status: 'init',
  }
  streamPushingDomain: DomainModel[] = []
  playbackDomain: DomainModel[] = []
  domainList: DomainModel[] = []
  rules: any = {
    domain: [{ required: true, trigger: 'blur' }],
    scope: [{ required: true, trigger: 'blur' }],
  }
  IconQuestion = IconQuestion
  certificateList: CertificateModel[] = []
  callback: CallbackModel = {
    enabled: false,
    url: '',
    status: 'init',
    editable: false,
  }
  oldCallback: CallbackModel = {
    enabled: false,
    url: '',
    status: 'init',
    editable: false,
  }
  domainLoading = false
  certificateLoading = false
  notificationLoading = false
  user = user.info
  goodsInfo = null
  currentGoods = []
  subscribedGoods = []

  get aaPackageConfig() {
    return this.GlobalConfig.config.aaPackage
  }

  get hasCDNPackage() {
    return (
      this.currentGoods &&
      this.currentGoods.length &&
      this.currentGoods.find((item: any) => {
        return item.mutexTag.toUpperCase() === 'CDN' && item.orderStatus === 'Paid'
      })
    )
  }

  get hasCDNPackageSubscription() {
    return (
      this.subscribedGoods &&
      this.subscribedGoods.length &&
      this.subscribedGoods.find((item: any) => {
        return item.customUid === this.aaPackageConfig.cdnCustomUid && item.subscriptionStatus === 'Active'
      })
    )
  }

  async mounted() {
    this.projectId = this.$route.params.id
    await this.getProject()
    await this.getCDNGoods()
    await this.getCurrentOrders()
    await this.getSubscribedGoods()
    await this.enableCDNService()
    this.getCallbackSetting()
    this.getDomain()
    this.getCertificateList()
    this.getOriginSite()
  }

  async enableCDNService() {
    const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/cdn`)
    if (res.data.enabled) {
      return
    }
    try {
      await this.$http.post(`/api/v2/project/${this.$route.params.id}/cdn/create-app`)
      if (this.hasCDNPackage || this.hasCDNPackageSubscription) {
        return
      }
      this.payAAFree(this.goodsInfo)
    } catch (e) {
      this.$message.error(e.message)
    }
  }

  async getCDNGoods() {
    try {
      const result = await this.$http.get('/api/v2/goods/tag/cdn')
      this.goodsInfo = result.data
    } catch (e) {}
  }

  async payAAFree(targetGoods: any) {
    this.loading = true
    try {
      const params: any = {
        goodsId: targetGoods.goodsId,
      }
      await this.$http.post('/api/v2/goods/order/free', params)
      await this.getCurrentOrders()
      await this.getSubscribedGoods()
    } catch (e) {}
    this.loading = false
  }

  async getCurrentOrders() {
    const { data } = await this.$http.get('/api/v2/goods/company/order/all')
    this.currentGoods = data
  }

  async getSubscribedGoods() {
    const { data } = await this.$http.get('/api/v2/goods/company/subscription/all')
    this.subscribedGoods = data
  }

  async getProject() {
    const projectId = this.$route.params.id
    try {
      const project = await getProjectInfo(projectId)
      this.vendorInfo = project.info
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' })
    }
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }

  async getDomain() {
    this.domainLoading = true
    this.streamPushingDomain = []
    this.playbackDomain = []
    this.domainList = []
    const result = await this.$http.get(`/api/v2/project/${this.projectId}/cdn/domain`)
    if (result.data) {
      result.data.domainList.forEach((domain: any) => {
        domain.crossDomainEnabled = !domain.crossDomain || domain.crossDomain === '' ? false : true
        if (domain.type === 'publish') {
          domain.enableRtmps = domain.enableRtmps ? true : false
        } else {
          domain.enableHttps = domain.enableHttps ? true : false
        }
        domain.status = domain.state === 0 ? 'configuring' : 'enabled'
        domain.editable = false
        if (domain.type === 'publish') {
          this.streamPushingDomain.push(domain)
        } else {
          this.playbackDomain.push(domain)
        }
        this.domainList.push(domain)
      })
    }
    this.domainLoading = false
  }

  addDomain(type: DomainType) {
    if (type === 'publish') {
      this.streamPushingDomain.unshift({
        name: '',
        scope: 'domestic',
        type: 'publish',
        editable: true,
        status: 'init',
      })
    } else {
      this.playbackDomain.unshift({
        name: '',
        scope: 'domestic',
        type: 'play',
        editable: true,
        status: 'init',
      })
    }
  }

  addCerticateBox() {
    if (this.certificateList.filter((item: CertificateModel) => item.editable).length) {
      return
    }
    this.certificateList.unshift({
      name: '',
      crt: '',
      key: '',
      editable: true,
      hasCreated: false,
      crtFile: undefined,
      keyFile: undefined,
    })
  }

  async getCertificateList() {
    this.certificateLoading = true
    this.certificateList = []
    const result = await this.$http.get(`/api/v2/project/${this.projectId}/cdn/certificate`)
    if (result.data && result.data.certificateList) {
      result.data.certificateList.forEach((certificate: CertificateModel) => {
        certificate.editable = false
        this.certificateList.push(certificate)
      })
    }
    this.certificateLoading = false
  }

  async getCallbackSetting() {
    this.notificationLoading = true
    try {
      const result = await this.$http.get(`/api/v2/project/${this.projectId}/cdn/callback`)
      if (result.data) {
        this.callback.editable = false
        this.callback.enabled = result.data.enabled
        this.callback.url = result.data.url
        if (result.data.enabled) {
          this.callback.status = 'enabled'
        }
        this.oldCallback = Object.assign({}, this.callback)
      }
    } catch (e) {
      this.$message.error(this.$t(`CDN Wrong Message.${e.message}`) as string)
    }
    this.notificationLoading = false
  }

  cancelCallbackSetting() {
    this.callback.editable = false
    this.callback.url = this.oldCallback.url
    if (this.callback.status === 'init') {
      this.callback.enabled = false
    }
  }

  async saveCallbackSetting() {
    if (!this.callback.url && this.callback.enabled) {
      this.$message.warning(this.$t('Invalid parameter') as string)
      return
    }
    this.notificationLoading = true
    try {
      await this.$http.put(`/api/v2/project/${this.projectId}/cdn/callback`, {
        ...this.callback,
      })
      await this.getCallbackSetting()
      this.$message.success(
        this.callback.enabled ? (this.$t('SavedSuccess') as string) : (this.$t('DisableSuccess') as string)
      )
    } catch (e) {
      this.$message.error(this.$t(`CDN Wrong Message.${e.message}`) as string)
    }

    this.notificationLoading = false
  }

  async changeCallbackSetting(value: boolean) {
    if (!value && this.callback.status === 'enabled') {
      this.$confirm(this.$t('Disable Callback Hint') as string, this.$t('Disable Callback') as string, {
        confirmButtonText: this.$t('CDNDisable') as string,
        cancelButtonText: this.$t('Cancel') as string,
        customClass: 'message-box-warning',
        dangerouslyUseHTMLString: true,
      })
        .then(async () => {
          this.callback.enabled = false
          await this.saveCallbackSetting()
          this.callback.status = 'init'
        })
        .catch(() => {
          this.callback.enabled = true
        })
    } else if (value) {
      this.callback.editable = true
    }
  }

  async getOriginSite() {
    const result = await this.$http.get(`/api/v2/project/${this.projectId}/cdn/origin-site`)
    if (result.data) {
      if (result.data.enabled) {
        this.sourceDomain.enabled = true
        this.sourceDomain.domain = result.data.domain
        this.sourceDomain.status = 'enabled'
        this.sourceDomain.editable = false
      }
    }
  }

  async changeSourceStatus(value: boolean) {
    if (!value && this.sourceDomain.status === 'enabled') {
      this.$confirm(this.$t('Disable Source Domain Hint') as string, this.$t('Disable Domain') as string, {
        confirmButtonText: this.$t('CDNDisable') as string,
        cancelButtonText: this.$t('Cancel') as string,
        customClass: 'message-box-warning',
        dangerouslyUseHTMLString: true,
      })
        .then(async () => {
          await this.disableSourceDomain()
        })
        .catch(() => {
          this.sourceDomain.enabled = true
        })
    }
  }

  async disableSourceDomain() {
    this.domainLoading = true
    try {
      const sourceDomain: SourceDomainModel = {
        enabled: false,
        domain: '',
        status: 'init',
      }
      await this.$http.post(`/api/v2/project/${this.projectId}/cdn/origin-site`, {
        ...sourceDomain,
      })
      this.sourceDomain.enabled = false
      this.sourceDomain.domain = ''
      this.sourceDomain.status = 'init'
      this.$message.success(this.$t('DisableSuccess') as string)
    } catch (e) {
      this.$message.error(e.message)
    }
    this.domainLoading = false
  }
}
