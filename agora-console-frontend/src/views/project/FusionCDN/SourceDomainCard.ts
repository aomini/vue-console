import Vue from 'vue'
import Component from 'vue-class-component'
import { SourceDomainModel } from '@/models/CDNModels'
import { Prop } from 'vue-property-decorator'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: `
    <div class="form-box mt-20" v-loading="loading">
      <template v-if="sourceDomain.editable || sourceDomain.status === 'init'">
        <el-row type="flex" align="middle">
          <el-col :span="7"> {{ $t('Domain') }}</el-col>
          <el-col :span="17">
            <el-input size="small" v-model="sourceDomain.domain"></el-input>
          </el-col>
        </el-row>
        <el-row type="flex" justify="end">
          <el-button size="small" @click="cancelSourceDomainSetting">
            {{ $t('Cancel') }}
          </el-button>
          <el-button size="small" type="primary" @click="saveSourceDomain">
            {{ $t('Save') }}
          </el-button>
        </el-row>
      </template>
      <template v-else>
        <div class="form-box_buttons" v-if="sourceDomain.status === 'enabled'" style="right: -30px">
          <el-button size="small" type="text" @click="sourceDomain.editable = true"
            ><i class="iconfont iconicon-bianjineirong f-20 popover-btn" style="color: #409EFF"></i
          ></el-button>
        </div>
        <el-row type="flex" align="middle">
          <el-col :span="7"> {{ $t('Domain') }}</el-col>
          <el-col :span="17">
            <el-row type="flex" justify="space-between" align="middle">
              <span>{{ sourceDomain.domain }}</span>
              <span :class="sourceDomain.status === 'enabled' ? 'stage-live' : 'stage-test'"
                >{{ $t('Status') }}: {{ sourceDomain.status === 'enabled' ? $t('Enabled') : $t('Configuring') }}</span
              >
            </el-row>
          </el-col>
        </el-row>
      </template>
    </div>
  `,
})
export default class SourceDomainCard extends Vue {
  @Prop({ default: {}, type: Object }) readonly sourceDomain!: SourceDomainModel
  @Prop({ default: '', type: String }) readonly projectId!: string
  @Prop({ default: false, type: Boolean }) readonly enablePushMode!: boolean
  loading = false
  vendorInfo: any = {}
  IconQuestion = IconQuestion
  oldSourceDomain: SourceDomainModel = Object.assign({}, this.sourceDomain)

  async mounted() {}

  verifyDomain(domain: string) {
    const reg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
    if (!reg.test(domain)) {
      return false
    }
    return true
  }

  async updateSourceDomain() {
    this.loading = true
    try {
      await this.$http.post(`/api/v2/project/${this.projectId}/cdn/origin-site`, {
        ...this.sourceDomain,
      })
      this.$message.success(this.$t('SavedSuccess') as string)
      await this.$emit('updateDomain')
      this.oldSourceDomain = Object.assign({}, this.sourceDomain)
    } catch (e) {
      this.$message.error(e.message)
    }
    this.loading = false
  }

  async saveSourceDomain() {
    if (!this.verifyDomain(this.sourceDomain.domain)) {
      this.$message.warning(this.$t('Invalid parameter') as string)
      return
    }
    if (this.enablePushMode) {
      this.$confirm(this.$t('Save Source Domain Hint') as string, this.$t('Save Source Domain') as string, {
        confirmButtonText: this.$t('Confirm') as string,
        cancelButtonText: this.$t('Cancel') as string,
        customClass: 'message-box-warning',
        dangerouslyUseHTMLString: true,
      }).then(async () => {
        await this.updateSourceDomain()
      })
    } else {
      await this.updateSourceDomain()
    }
  }

  cancelSourceDomainSetting() {
    this.sourceDomain.domain = this.oldSourceDomain.domain
    if (this.sourceDomain.status === 'enabled') {
      this.sourceDomain.editable = false
    } else {
      this.sourceDomain.enabled = false
    }
  }
}
