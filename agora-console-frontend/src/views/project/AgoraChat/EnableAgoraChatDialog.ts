import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `<el-dialog
    :title='isChatSubscription ? $t("Enable Agora Chat") : $t("Subscribe Agora chat plan")'
    :visible="true"
    :before-close="cancelEnable"
  >
    <div v-if="!isChatSubscription" v-loading="loading">
      <div class="heading-grey-13">{{ $t('Subscribe Chat Tip1') }}</div>
      <div class="heading-grey-13">{{ $t('Subscribe Chat Tip2') }}</div>
      <div class="text-right mt-20">
        <console-button class="console-btn-white" @click="cancelEnable">{{ $t('Cancel') }}</console-button>
        <console-button class="console-btn-primary" @click="goToSwitchPlan">{{ $t('Subscribe') }}</console-button>
      </div>
    </div>
    <div v-if="isChatSubscription">
      <div class="heading-grey-13">{{ $t('Please select a data center location tip') }}</div>
      <div class="heading-grey-13 mt-20">
        Learn more about data center selection in <a href="" target="_blank">Chat Documentation.</a>
      </div>
      <div class="mt-30">
        <el-select v-model="dataCenter" class="w-100" :placeholder="$t('Select Data Center Location')">
          <el-option v-for="item in dataCenterOptions" :key="item.label" :label="$t(item.label)" :value="item.label">
          </el-option>
        </el-select>
      </div>
      <div class="text-right mt-20">
        <console-button class="console-btn-white" @click="cancelEnable">{{ $t('Cancel') }}</console-button>
        <console-button
          class="console-btn-primary"
          @click="enableChat(dataCenter)"
          :loading="chatLoading"
          :disabled="!dataCenter"
        >
          {{ $t('Submit and Continue') }}</console-button
        >
      </div>
    </div>
  </el-dialog>`,
})
export default class EnableAgoraChatDialog extends Vue {
  @Prop({ default: null, type: Function }) readonly cancelEnable!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly enableChat!: (dataCenter: string) => Promise<void>
  @Prop({ default: false, type: Boolean }) readonly isCN!: boolean
  @Prop({ default: false, type: Boolean }) readonly chatLoading!: boolean
  loading = false
  isChatSubscription = false
  subscriptionInfo: any = {}
  dataCenter = ''

  get dataCenterOptions() {
    let dataCenterOptions: any = []
    if (this.isCN) {
      if (this.subscriptionInfo.planName === 'ENTERPRISE') {
        dataCenterOptions = [{ label: 'CN1' }, { label: 'VIP6' }]
      } else {
        dataCenterOptions = [{ label: 'CN1' }]
      }
    } else {
      dataCenterOptions = [{ label: 'SGP1' }, { label: 'US1' }, { label: 'DE1' }]
    }
    return dataCenterOptions
  }

  async mounted() {
    this.loading = true
    await this.getCompanyChatSubscription()
    this.loading = false
  }

  async getCompanyChatSubscription() {
    try {
      const res = await this.$http.get(`/api/v2/chat/subscription`)
      if (res.data && res.data.subscriptions.length > 0) {
        this.isChatSubscription = true
        this.subscriptionInfo = res.data.subscriptions[0]
      }
    } catch (e) {}
  }

  goToSwitchPlan() {
    this.$router.push({ name: 'package.chat' })
  }

  goToManagePlan() {
    this.$router.push({ name: 'package.myChatPackage' })
  }
}
