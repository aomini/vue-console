import Vue from 'vue'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { user } from '@/services'
import { CloudTypeMap } from '@/models/uapModels'
import { RouteRecord } from 'vue-router/types/router'

@Component({
  template: `
    <div class="uap-setting" v-loading="loading">
      <div class="card">
        <h3 class="heading-dark-03 mb-20">{{ $t('MaxChannel') }}</h3>
        <div>{{ $t('CloudPlayerSettingHint', { maxSubscribeLoad }) }}</div>
        <div class="button-line mt-20 text-right">
          <console-button class="console-btn-primary" :disabled="loading" @click="updateSetting">{{
            applyButton
          }}</console-button>
          <console-button class="console-btn-white" @click="back"> {{ $t('Cancel') }} </console-button>
        </div>
      </div>
    </div>
  `,
})
export default class CloudPlayerSettingView extends Vue {
  loading = false
  applyLoading = false
  vids = ''
  uapInfo: any = undefined
  maxSubscribeLoad = 0
  applyButton = this.$t('Apply') as string
  condition: any = {
    vids: undefined,
    projectId: undefined,
  }
  region = '1'

  @Watch('$route')
  onRouteChange(to: any) {
    if (to.query.vids) {
      this.condition.vids = to.query.vids
      this.condition.projectId = to.query.projectId
      this.create()
    }
  }

  created() {
    this.create()
    this.changeBreadcrumb()
  }

  async getUapSetting() {
    if (this.$route.query.projectId && this.$route.query.projectId !== '0') {
      try {
        this.loading = true
        const ret = await this.$http.get(`/api/v2/usage/uap/setting`, {
          params: { vids: this.condition.vids, cloudTypeId: CloudTypeMap['CloudPlayer'] },
        })
        if (ret.data) {
          this.uapInfo = ret.data
          this.maxSubscribeLoad = this.uapInfo.maxSubscribeLoad
        }
        this.loading = false
      } catch (e) {
        this.loading = false
      }
    } else {
      this.$router.push({ name: 'usage.cloud-recording' })
    }
  }

  async updateSetting() {
    const defaultMax = 50
    if (defaultMax < this.maxSubscribeLoad) {
      this.$confirm(this.$t('CloudWarning') as string, this.$t('ConfirmApply') as string, {
        confirmButtonText: this.$t('Continue') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
      })
        .then(async () => {
          await this.openUapSetting()
        })
        .catch(() => {})
    } else {
      await this.openUapSetting()
    }
  }

  async openUapSetting() {
    try {
      this.applyLoading = true
      this.applyButton = this.$t('Applying') as string
      const ret = await this.$http.post(`/api/v2/usage/uap/setting`, {
        vids: this.condition.vids,
        typeId: CloudTypeMap['CloudPlayer'],
        region: this.region,
      })
      this.uapInfo = ret.data
      this.applyLoading = false
      this.applyButton = this.$t('Apply') as string
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.$router.push({
        name: 'usage.media-inject',
        query: { vids: this.condition.vids, projectId: this.condition.projectId },
      })
    } catch (e) {
      this.applyLoading = false
      this.applyButton = this.$t('Apply') as string
      this.$message.error(this.$t('NetworkError') as string)
    }
  }

  async create() {
    if (user.info && user.info.company && user.info.company.country) {
      this.region = user.info.company.country === 'CN' ? '1' : '2'
    }
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    await this.getUapSetting()
  }
  back() {
    this.$router.push({
      name: 'usage.media-inject',
      query: { vids: this.condition.vids, projectId: this.condition.projectId },
    })
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: 'Usage',
        },
      },
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: 'CloudPlayerUsageTitle',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
