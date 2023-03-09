import Vue from 'vue'
import Component from 'vue-class-component'
import { CertificateModel, DomainModel, RegionTypeOptions } from '@/models/CDNModels'
import { Prop } from 'vue-property-decorator'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: `
    <div class="form-box" v-loading="domainLoading">
      <template v-if="domain.editable">
        <el-row>
          <el-col :span="7">
            <span :class="{ 'required': domain.status === 'init' }" class="form-box-label">{{ $t('Domain') }}</span>
          </el-col>
          <el-col :span="17">
            <el-input v-if="domain.status === 'init'" v-model="domain.name" size="mini"></el-input>
            <span v-else class="form-box-label">{{ domain.name }}</span>
          </el-col>
          <el-col :span="17" :offset="7" v-if="domain.status === 'init'">
            <div class="module-title-tip form-box-tip">
              {{
                domain.type === 'publish'
                  ? $t('CDNDomainTip', { domain: 'push-agora.domain.com' })
                  : $t('CDNDomainTip', { domain: 'play-agora.domain.com' })
              }}
            </div>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle" v-if="domain.status !== 'init'">
          <el-col :span="7"> {{ $t('Cname') }}</el-col>
          <el-col :span="17">
            <span>{{ domain.cname }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <span :class="{ 'required': domain.status === 'init' }" class="form-box-label">{{ $t('CDNRegion') }}</span>
          </el-col>
          <el-col :span="17">
            <el-select v-model="domain.scope" size="mini" class="w-100" v-if="domain.status === 'init'">
              <el-option
                v-for="item in Object.entries(RegionTypeOptions)"
                :key="item[1]"
                :label="$t(item[1])"
                :value="item[0]"
              >
              </el-option>
            </el-select>
            <span v-else>{{ $t(RegionTypeOptions[domain.scope]) }}</span>
          </el-col>
          <el-col
            :span="17"
            :offset="7"
            v-if="domain.status === 'init' && (domain.scope === 'domestic' || domain.scope === 'global')"
          >
            <div class="module-title-tip form-box-tip">
              {{ $t('CDNScopeTip') }}
            </div>
          </el-col>
        </el-row>
        <template v-if="domain.status !== 'init'">
          <el-row v-if="domain.type === 'publish'">
            <el-col :span="7"> {{ $t('Access via rtmps') }}</el-col>
            <el-col :span="17">
              <el-radio v-model="domain.enableRtmps" :label="true">{{ $t('Enabled') }}</el-radio>
              <el-radio v-model="domain.enableRtmps" :label="false">{{ $t('Disabled') }}</el-radio>
            </el-col>
          </el-row>
          <el-row v-if="domain.type === 'play'">
            <el-col :span="7"> {{ $t('Access via https') }}</el-col>
            <el-col :span="17">
              <el-radio v-model="domain.enableHttps" :label="true">{{ $t('Enabled') }}</el-radio>
              <el-radio v-model="domain.enableHttps" :label="false">{{ $t('Disabled') }}</el-radio>
            </el-col>
          </el-row>
          <el-row type="flex" align="middle">
            <el-col :span="7"> {{ $t('Certificate Name') }}</el-col>
            <el-col :span="17">
              <el-select v-model="domain.certName" size="mini" class="w-100" clearable>
                <el-option
                  v-for="(certificate) in certificateList"
                  :key="certificate.name"
                  :value="certificate.name"
                  :label="certificate.name"
                >
                </el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-if="domain.type === 'play'">
            <el-col :span="7">
              {{ $t('Cross-domain config') }}
              <el-tooltip
                :content='$t("Cross-domain Hint")'
                placement="top"
                effect="light"
                class="mr-10 prject-tooltip"
              >
                <img class="ml-3" width="15" :src="IconQuestion" alt=""
              /></el-tooltip>
            </el-col>

            <el-col :span="17">
              <el-radio v-model="domain.crossDomainEnabled" :label="true">{{ $t('Enabled') }}</el-radio>
              <el-radio v-model="domain.crossDomainEnabled" :label="false">{{ $t('Disabled') }}</el-radio>
            </el-col>
            <el-col :offset="7" :span="17" v-if="domain.crossDomainEnabled">
              <el-input
                v-model="domain.crossDomain"
                size="mini"
                class="w-100"
                :placeholder="$t('Cross-domain Placeholder')"
              ></el-input>

              <!--              <el-select v-model="domain.crossDomain" allow-create size="mini" class="w-100">-->
              <!--                <el-option value="*" :label="$t('All')"></el-option>-->
              <!--              </el-select>-->
            </el-col>
          </el-row>
          <el-row type="flex" align="middle">
            <el-col :span="7">
              {{
                domain.type === 'publish'
                  ? $t('Hotlink protection for pushing streams')
                  : $t('Hotlink protection for playing streams')
              }}</el-col
            >
            <el-col :span="17">
              <el-input v-model="domain.authKey" size="mini" class="w-100"></el-input>
            </el-col>
          </el-row>
        </template>
        <el-row type="flex" justify="end">
          <el-button size="mini" @click="cancelDomainSetting(domain)">
            {{ $t('Cancel') }}
          </el-button>
          <el-button size="mini" type="primary" @click="saveDomain(domain)">
            {{ domain.status === 'init' ? $t('Create') : $t('Edit') }}
          </el-button>
        </el-row>
      </template>
      <template v-else>
        <div class="form-box_buttons" v-if="domain.status !== 'init'">
          <el-button type="text" @click="deleteDomain(domain)">
            <i class="iconfont iconicon-shanchu f-20 popover-btn"></i>
          </el-button>
          <el-button type="text" @click="domain.editable = true">
            <i class="iconfont iconicon-bianjineirong f-20 popover-btn" style="color: #409EFF"></i>
          </el-button>
        </div>
        <el-row type="flex" align="middle">
          <el-col :span="7"> {{ $t('Domain') }}</el-col>
          <el-col :span="17">
            <el-row type="flex" justify="space-between" align="middle">
              <span>{{ domain.name }}</span>
              <span :class="domain.status === 'enabled' ? 'stage-live' : 'stage-test'"
                >{{ $t('Status') }}: {{ domain.status === 'enabled' ? $t('Enabled') : $t('Configuring') }}</span
              >
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7"> {{ $t('Cname') }}</el-col>
          <el-col :span="17">
            <span>{{ domain.cname }}</span>
          </el-col>
          <el-col :span="17" :offset="7" v-if="domain.status === 'configuring'">
            <div class="module-title-tip form-box-tip">
              {{ $t('CnameTip') }}
            </div>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle">
          <el-col :span="7"> {{ $t('CDNRegion') }}</el-col>
          <el-col :span="17">
            <span>{{ $t(RegionTypeOptions[domain.scope]) }}</span>
          </el-col>
        </el-row>
        <el-row v-if="domain.type === 'publish'">
          <el-col :span="7"> {{ $t('Access via rtmps') }}</el-col>
          <el-col :span="17">
            <span>{{ domain.enableRtmps ? $t('Enabled') : $t('Disabled') }}</span>
          </el-col>
        </el-row>
        <el-row v-if="domain.type === 'play'">
          <el-col :span="7"> {{ $t('Access via https') }}</el-col>
          <el-col :span="17">
            <span>{{ domain.enableHttps ? $t('Enabled') : $t('Disabled') }}</span>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle">
          <el-col :span="7"> {{ $t('Certificate Name') }}</el-col>
          <el-col :span="17">
            <span>{{ domain.certName }}</span>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle" v-if="domain.type === 'play'">
          <el-col :span="7"> {{ $t('Cross-domain config') }}</el-col>
          <el-col :span="17">
            <span v-if="domain.crossDomain === '*'">{{ $t('All') }}</span>
            <span v-else>{{ domain.crossDomain }}</span>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle">
          <el-col :span="7">
            {{
              domain.type === 'publish'
                ? $t('Hotlink protection for pushing streams')
                : $t('Hotlink protection for playing streams')
            }}</el-col
          >
          <el-col :span="17">
            <span>{{ domain.authKey }}</span>
          </el-col>
        </el-row>
      </template>
    </div>
  `,
})
export default class DomainCard extends Vue {
  @Prop({ default: {}, type: Object }) readonly domain!: DomainModel
  @Prop({ default: () => [], type: Array }) readonly certificateList!: CertificateModel[]
  @Prop({ default: '', type: String }) readonly projectId!: string
  loading = false
  vendorInfo: any = {}
  IconQuestion = IconQuestion
  RegionTypeOptions = RegionTypeOptions
  domainLoading = false
  oldDomain: DomainModel = Object.assign({}, this.domain)

  async mounted() {}

  cancelDomainSetting(domain: DomainModel) {
    if (domain.status !== 'init') {
      if (domain.type === 'publish') {
        domain.enableRtmps = this.oldDomain.enableRtmps
      } else {
        domain.enableHttps = this.oldDomain.enableHttps
        domain.crossDomain = this.oldDomain.crossDomain
        domain.crossDomainEnabled = this.oldDomain.crossDomainEnabled
      }
      domain.authKey = this.oldDomain.authKey
      domain.certName = this.oldDomain.certName
      domain.editable = false
    } else {
      this.$emit('deleteUncreatedDomain')
    }
  }

  verifyDomain(domain: DomainModel) {
    const reg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
    if (!reg.test(domain.name) || !domain.scope) {
      return false
    }
    return true
  }

  async saveDomain(domain: DomainModel) {
    if (!this.verifyDomain(domain)) {
      this.$message.warning(this.$t('Invalid parameter') as string)
      return
    }
    this.domainLoading = true
    if (domain.status !== 'init') {
      this.$confirm(this.$t('Save Domain Hint') as string, this.$t('Save Domain') as string, {
        confirmButtonText: this.$t('Confirm') as string,
        cancelButtonText: this.$t('Cancel') as string,
      }).then(async () => {
        try {
          await this.$http.put(`/api/v2/project/${this.projectId}/cdn/domain/${domain.name}`, {
            ...domain,
          })
          this.$message.success(this.$t('SavedSuccess') as string)
          domain.editable = false
          this.oldDomain = Object.assign({}, this.domain)
        } catch (e) {
          this.$message.error(this.$t(`CDN Wrong Message.${e.message}`) as string)
          await this.$emit('updateDomain')
        }
      })
    } else {
      try {
        await this.$http.post(`/api/v2/project/${this.projectId}/cdn/domain`, {
          type: domain.type,
          scope: domain.scope,
          name: domain.name,
        })
        this.$message.success(this.$t('Create Successfully') as string)
        this.oldDomain = Object.assign({}, this.domain)
        await this.$emit('updateDomain')
      } catch (e) {
        this.$message.error(this.$t(`CDN Wrong Message.${e.message}`) as string)
      }
    }
    this.domainLoading = false
  }

  deleteDomain(domain: DomainModel) {
    this.$confirm(this.$t('Delete Domain Hint') as string, this.$t('Delete Domain') as string, {
      confirmButtonText: this.$t('Confirm') as string,
      cancelButtonText: this.$t('Cancel') as string,
      customClass: 'message-box-warning',
      dangerouslyUseHTMLString: true,
    }).then(async () => {
      this.domainLoading = true
      await this.$http.delete(`/api/v2/project/${this.projectId}/cdn/domain/${domain.name}`)
      await this.$emit('updateDomain')
      this.$message.success(this.$t('DeleteSuccess') as string)
      this.domainLoading = false
    })
  }
}
