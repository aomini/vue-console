import Vue from 'vue'
import Component from 'vue-class-component'
import { KTVStatu } from '@/models'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `
    <el-dialog :visible="true" :title="$t('Content Conter Configuration')" :before-close="showConfigContentCenter">
      <div class="form-line">
        <div class="label w-150">{{ $t('Content Center Status') }}:</div>
        <el-radio-group v-model="data.status" class="my-auto">
          <el-radio :label="KTVStatu.ENABLE" style="margin-bottom: 0"> {{ $t('Enable') }} </el-radio>
          <el-radio :label="KTVStatu.DISABLED" style="margin-bottom: 0"> {{ $t('Disable') }} </el-radio>
        </el-radio-group>
      </div>
      <div class="form-line">
        <div class="label w-150"></div>
        <div class="heading-grey-13 flex-1">
          {{ $t('Content Center Tip')
          }}<a :href="$t('ktv billing document Url')" target="_blank">{{ $t('ktv billing document') }}</a>
        </div>
      </div>
      <div class="form-line">
        <div class="label w-150">{{ $t('Whitelist IPs') }}:</div>
        <el-input
          type="textarea"
          :rows="8"
          v-model="data.ip"
          :disabled="data.status !== KTVStatu.ENABLE"
          :placeholder="$t('KTV Placeholder')"
          class="flex-1"
        ></el-input>
      </div>
      <div class="form-line">
        <div class="label w-150"></div>
        <div class="link">
          <a :href="$t('Content Center Doc Url')" target="_blank">{{ $t('ApaasTip') }}</a>
        </div>
      </div>
      <div class="mt-20 text-right">
        <console-button class="console-btn-white w-140" @click="showConfigContentCenter(false)">
          {{ $t('Cancel') }}
        </console-button>
        <console-button class="console-btn-primary" @click="updateInfo" :loading="loading">
          {{ $t('Save') }}
        </console-button>
      </div>
    </el-dialog>
  `,
})
export default class EditContentCenter extends Vue {
  @Prop({ default: null, type: Object }) readonly info!: any
  @Prop({ default: null, type: Function }) readonly showConfigContentCenter!: () => Promise<void>
  @Prop({ default: '', type: String }) readonly companyName!: string
  @Prop({ default: '', type: String }) readonly projectId!: string

  data: any = {
    status: KTVStatu.DISABLED,
    ip: '',
    companyName: '',
  }
  KTVStatu = KTVStatu
  loading = false

  mounted() {
    if (this.info) {
      this.info.status && (this.data.status = this.info.status)
      if (this.info.status === KTVStatu.ENABLE) {
        this.info.ip && (this.data.ip = this.info.ip)
      }
    }
    this.data.companyName = this.companyName
  }

  checkIp() {
    if (!this.data.ip) {
      this.$message.error(this.$t('ip required') as string)
      return false
    }
    if (this.data.ip.split(',').length > 10) {
      this.$message.error(this.$t('ip addresses can not exceed 10 groups, please delete.') as string)
      return false
    }
    return true
  }

  async updateInfo() {
    if (this.data.status === KTVStatu.ENABLE) {
      if (!this.checkIp()) {
        return
      }
    }
    this.loading = true
    try {
      const res = await this.$http.post(`/api/v2/project/${this.projectId}/ktv`, this.data)
      if (res.data && res.data.code === 0) {
        this.$message({
          message: this.$t('Content center config saved.') as string,
          type: 'success',
        })
        this.showConfigContentCenter()
      } else {
        this.$message.error(`${this.$t('SavedFail') as string}（${res.data.msg}）`)
      }
    } catch (e) {
      this.$message.error(this.$t('SavedFail') as string)
    }
    this.loading = false
  }
}
