import Vue from 'vue'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { CloudTypeMap } from '@/models/uapModels'

@Component({
  template: `
    <div class="uap-setting">
      <div class="module-title">{{ $t('MiniAppUsageTitle') }}</div>
      <div class="card">
        <h3 class="heading-dark-03 mb-20">{{ $t('MaxChannel') }}</h3>
        <div>{{ $t('Hint1') }} {{ maxSubscribeLoad }}</div>
        <div>{{ $t('Hint2') }} 300</div>
        <div>{{ $t('Hint3') }}</div>
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
export default class MiniAppSettingView extends Vue {
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
  region = '0'

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
  }

  async getUapSetting() {
    if (this.$route.query.projectId && this.$route.query.projectId !== '0') {
      try {
        this.loading = true
        const ret = await this.$http.get(`/api/v2/usage/uap/setting`, {
          params: { vids: this.condition.vids, cloudTypeId: CloudTypeMap['MiniAppNew'] },
        })
        this.loading = false
        if (ret.data) {
          this.uapInfo = ret.data
          this.maxSubscribeLoad = this.uapInfo.maxSubscribeLoad
          this.region = this.uapInfo.region.toString()
        }
      } catch (e) {
        this.loading = false
      }
    } else {
      this.$router.push({ name: 'usage.miniapp' })
    }
  }

  async updateSetting() {
    const defaultMax = 300
    if (defaultMax < this.maxSubscribeLoad) {
      this.$confirm(this.$t('MiniAppWarning') as string, this.$t('ConfirmApply') as string, {
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
        typeId: CloudTypeMap['MiniAppNew'],
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
        name: 'usage.miniapp',
        query: { vids: this.condition.vids, projectId: this.condition.projectId },
      })
    } catch (e) {
      this.applyLoading = false
      this.applyButton = this.$t('Apply') as string
      this.$message.error(this.$t('NetworkError') as string)
    }
  }

  async create() {
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId
    await this.getUapSetting()
  }
  back() {
    this.$router.push({
      name: 'usage.miniapp',
      query: { vids: this.condition.vids, projectId: this.condition.projectId },
    })
  }
}
