import Vue from 'vue'
import Component from 'vue-class-component'
import { getProjectInfo } from '@/services'
import { RegionTypeOptions } from '@/models'
import '../Project.less'
import { uuid } from 'uuidv4'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: `<div class="page-v3 create-upstream">
    <div class="d-flex">
      <span class="mr-10" @click="goToFPADetail"><i class="el-icon-arrow-left"></i></span>
      <el-breadcrumb separator="|" class="mb-20">
        <el-breadcrumb-item :to="{ path: '/project/' + projectId + '/fpa' }">{{ $t('Back') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $t('Create FPA service') }}</el-breadcrumb-item>
      </el-breadcrumb>
      <span class="ml-30 f-14" style="line-height: 1;"
        ><a :href="$t('FPA Config Doc Url')" target="_blank">{{ $t('How to config') }}</a></span
      >
    </div>
    <div class="mb-30">
      <el-steps :active="step" finish-status="success" simple>
        <el-step
          :title="$t('Please config origin site')"
          @click.native="backToConfigUpstream"
          class="cursor-pointer"
        ></el-step>
        <el-step :title="$t('Please config accelerator')"></el-step>
      </el-steps>
    </div>
    <el-tabs v-model="type" @tab-click="switchTab" type="card" class="message-tab" v-show="step === 0">
      <el-tab-pane :label="$t('Create new origin site')" name="createUpstream">
        <div class="tab-container" v-if="type === 'createUpstream'">
          <el-form :model="data" size="small" :label-width="lang==='cn'?'100px':'150px'" ref="submit-form">
            <div class="m-auto">
              <el-form-item>
                <span slot="label">
                  {{ $t('Origin site type') }}
                  <el-tooltip :content='$t("Origin site Hint")' placement="top" effect="light">
                    <i class="ml-3 el-icon-info project-tooltip"></i>
                  </el-tooltip>
                </span>
                <el-radio v-model="data.sourceType" label="ip4"> {{ $t('IPv4') }}</el-radio>
                <el-radio v-model="data.sourceType" label="domain"> {{ $t('Domain') }}</el-radio>
              </el-form-item>
              <el-form-item :label="$t('Origin site')">
                <div v-for="(item, index) in data.sourceIps" class="mb-10" style="white-space: nowrap">
                  <el-input
                    v-model="data.sourceIps[index]"
                    :placeholder="$t('Please input the origin site ip')"
                    class="d-inline-block w-400"
                  ></el-input>
                  <span class="link" @click="deleteOriginIp(index)" v-if="data.sourceIps.length > 1">
                    {{ $t('Delete') }}
                  </span>
                </div>
                <span class="link mr-20" @click="addOriginIp" v-if="data.sourceIps.length < 10"> {{ $t('Add') }} </span>
                <span
                  class="link"
                  @click="getRecommendedFilter"
                  v-if="data.sourceType === 'ip4'"
                  v-loading="getRecommandFilterLoading"
                >
                  {{ $t('Analysis origin site region') }}
                </span>
                <span v-if="showRecommandError" class="ml-5 error">{{
                  $t('Analysis region fail, please select manually')
                }}</span>
              </el-form-item>
              <el-form-item :label="$t('Origin site region')" style="white-space: nowrap">
                <span slot="label">
                  {{ $t('Origin site region') }}
                  <el-tooltip :content='$t("Origin site region Hint")' placement="top" effect="light">
                    <i class="ml-3 el-icon-info project-tooltip"></i>
                  </el-tooltip>
                </span>
                <el-select
                  multiple
                  :multiple-limit="1"
                  v-model="data.serverTags"
                  :placeholder="$t('Origin Region Placeholder')"
                  style="width: 400px"
                >
                  <el-option v-for="item in getRegionValue(data.serverType)" :key="item" :label="item" :value="item">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="sourcePort">
                <span slot="label">
                  {{ $t('Port') }}
                  <el-tooltip :content='$t("UpstreamsPortHint")' placement="top" effect="light">
                    <i class="ml-3 el-icon-info project-tooltip"></i>
                  </el-tooltip>
                </span>
                <el-input v-model="data.sourcePort" :placeholder="$t('Port Placeholder')" class="w-400"></el-input>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('Config existing origin site')" name="selectUpstream">
        <div class="tab-container" v-if="type === 'selectUpstream'">
          <el-form size="small" :label-width="lang==='cn'?'100px':'150px'" ref="submit-form">
            <el-form-item :label="$t('Origin site')">
              <el-select
                v-model="data.upstreamId"
                :placeholder="$t('Select Upstream')"
                @change="handleSelectUpstream"
                class="w-400"
              >
                <el-option v-for="item in upstreamData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Origin site information')" v-if="data.upstreamId">
              <div v-for="item in selectUpstream.sources">
                {{ item.address }}
              </div>
            </el-form-item>
            <el-form-item :label="$t('Port') + ':'" v-if="data.upstreamId">
              <div v-if="selectUpstream.sources.length > 0">
                {{ selectUpstream.sources[0].port }}
              </div>
            </el-form-item>
            <el-form-item :label="$t('Origin site region')" style="white-space: nowrap">
              <span slot="label">
                {{ $t('Origin site region') }}
                <el-tooltip :content='$t("Origin site region Hint")' placement="top" effect="light">
                  <i class="ml-3 el-icon-info project-tooltip"></i>
                </el-tooltip>
              </span>
              <el-select
                multiple
                :multiple-limit="1"
                v-model="data.serverTags"
                :placeholder="$t('Origin Region Placeholder')"
                style="width: 400px"
              >
                <el-option v-for="item in getRegionValue(data.serverType)" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="" v-show="step === 1">
      <div class="d-flex">
        <div
          class="chain-card flex-1 mr-20"
          :class="data.chainsType==='sdk'? 'active' : ''"
          @click="selectChainsType('sdk')"
        >
          <div class="heading-dark-14">
            {{ $t('SDK Mode')
            }}<console-button class="console-btn-success-outline console-btn-size-sm ml-10">{{
              $t('Recommended')
            }}</console-button>
          </div>
          <div class="heading-grey-14 mt-20">{{ $t('SDK Mode Description') }}</div>
        </div>
        <div class="chain-card flex-1" :class="data.chainsType==='ipa'? 'active' : ''" @click="selectChainsType('ipa')">
          <div class="heading-dark-14 mb-20">{{ $t('IPA Mode') }}</div>
          <el-form size="small" :label-width="lang==='cn'?'100px':'150px'" label-position="left" ref="submit-form">
            <el-form-item style="white-space: nowrap">
              <span slot="label">
                {{ $t('Acceleration region') }}
                <el-tooltip :content="$t('Acceleration region Hint')" placement="top" effect="light">
                  <i class="ml-3 el-icon-info project-tooltip"></i>
                </el-tooltip>
              </span>
              <el-select
                @focus="handleClientTagsChange"
                multiple
                v-model="data.clientTags"
                :placeholder="$t('Client Origin Region Placeholder')"
                style="width: 400px"
              >
                <el-option v-for="item in getRegionValue(data.clientType)" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <console-button
      class="console-btn-primary mt-30"
      :disabled="checkCreateUpstream"
      v-if="step === 0"
      style="width: 150px"
      @click="nextToConfigChains"
    >
      {{ $t('Next') }}
    </console-button>
    <console-button
      class="console-btn-primary mt-30"
      v-if="step === 1"
      style="width: 150px"
      @click="updateService"
      v-loading="loading"
      :disabled="checkCreateChains"
    >
      {{ $t('Save Config') }}
    </console-button>
  </div>`,
})
export default class ServiceCreateNew extends Vue {
  validatePort = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (isNaN(Number(value)) || Number(value) < 1 || Number(value) > 65534) {
      return callback(new Error(this.$t('UpstreamsPortHint') as string))
    }
    callback()
  }

  lang = this.$i18n.locale === 'en' ? 'en' : 'cn'
  projectId = ''
  loading = false
  showConfirmDialog = false
  vendorInfo: any = {}
  RegionTypeOptions = RegionTypeOptions
  RegionCity = []
  RegionCountry = []
  RegionContinent = []
  getRecommandFilterLoading = false
  showRecommandError = false
  step = 0
  type = 'createUpstream'
  data: any = {
    upstreamId: '',
    unique_id: uuid(),
    sourceType: 'ip4',
    sourcePort: '',
    sourceIps: [''],
    chainsType: 'sdk',
    ipaType: 'default',
    chainsPort: '',
    concurrency_limit: 1000,
    bandwidth_hardlimit: 10,
    use_domain_name: false,
    clientType: 'country',
    clientTags: [],
    serverType: 'city',
    serverTags: [],
  }
  upstreamData: any = []
  selectUpstream: any = {
    sources: [],
  }
  condition: any = {
    page: 1,
    limit: 1000,
  }
  IconQuestion = IconQuestion
  rules: any = {
    sourcePort: [{ required: true, validator: this.validatePort, trigger: 'blur' }],
  }

  get checkCreateUpstream() {
    if (this.type === 'selectUpstream') {
      return !this.data.upstreamId || this.data.serverTags.length === 0
    } else if (this.type === 'createUpstream') {
      if (this.data.sourceIps.length > 0) {
        if (this.data.sourceIps[0] && this.data.serverType && this.data.serverTags.length > 0 && this.data.sourcePort) {
          return false
        }
      }
    }
    return true
  }

  get checkCreateChains() {
    if (this.data.serverTags.length === 0 || this.loading) {
      return true
    }
    if (this.data.chainsType === 'ipa') {
      if (this.data.clientTags.length === 0) {
        return true
      }
    }
    return false
  }

  async mounted() {
    this.projectId = this.$route.params.id
    this.getProject()
    this.getMachines()
    this.getUpstreamsData()
  }

  switchTab(tab: any) {
    this.type = tab.name
    if (tab.name === 'createUpstream') {
      this.data.upstreamId = ''
    } else if (tab.name === 'selectUpstream') {
      this.data = {
        upstreamId: '',
        unique_id: uuid(),
        sourceType: 'ip4',
        sourcePort: '',
        sourceIps: [''],
        chainsType: 'sdk',
        ipaType: 'default',
        chainsPort: '',
        concurrency_limit: 1000,
        bandwidth_hardlimit: 10,
        use_domain_name: false,
        clientType: 'country',
        clientTags: [],
        serverType: 'city',
        serverTags: [],
      }
    }
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

  async getMachines() {
    try {
      const result = await this.$http.get(`/api/v2/fpa/machines`)
      if (result.data) {
        this.RegionContinent = result.data.continent
        this.RegionCountry = result.data.country
        this.RegionCity = result.data.city
      }
    } catch (e) {}
  }

  addOriginIp() {
    if (this.data.sourceIps.length >= 10) {
      return
    }
    this.data.sourceIps.push('')
  }

  deleteOriginIp(index: number) {
    if (this.data.sourceIps.length <= 1) {
      return
    }
    this.data.sourceIps.splice(index, 1)
  }

  handleServerTypeChange() {
    this.data.serverTags = []
  }

  handleClientTypeChange() {
    this.data.clientTags = []
  }

  getRegionValue(regionType: string) {
    if (regionType === 'city') {
      return this.RegionCity
    } else if (regionType === 'country') {
      return this.RegionCountry
    } else if (regionType === 'continent') {
      return this.RegionContinent
    } else {
      return []
    }
  }

  async getUpstreamsData() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/upstreams`, {
        params: this.condition,
      })
      this.condition.total = res.data.total
      this.upstreamData = res.data.upstreams
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.backToEditProject()
    }
    this.loading = false
  }

  handleSelectUpstream(value: number) {
    this.selectUpstream = this.upstreamData.find((item: any) => item.id === value)
    this.data.sourceIps = this.selectUpstream.sources.map((item: any) => item.address)
    this.getRecommendedFilter()
  }

  nextToConfigChains() {
    this.step = 1
  }

  backToConfigUpstream() {
    this.step = 0
  }

  selectChainsType(type: string) {
    if (type === this.data.chainsType) {
      return
    }
    this.data.chainsType = type
    if (type === 'sdk') {
      this.data.clientType = 'country'
      this.data.clientTags = []
    }
  }

  handleClientTagsChange() {
    if (this.data.chainsType !== 'ipa') {
      this.data.chainsType = 'ipa'
    }
  }

  async getRecommendedFilter() {
    if (this.data.sourceIps.length === 0 || !this.data.sourceIps[0]) {
      return
    }
    try {
      this.showRecommandError = false
      this.getRecommandFilterLoading = true
      const res = await this.$http.post(`/api/v2/fpa/recommendedFilter`, { machineIps: this.data.sourceIps })
      if (res.data && res.data.filter) {
        this.data.serverTags = []
        const tags = res.data.filter.tags
        const tagsOptions: any = this.RegionCity
        for (const tag of tags) {
          if (tagsOptions.includes(tag)) {
            this.data.serverTags.push(tag)
          }
        }
      } else if (res.data.code === 1) {
        this.showRecommandError = true
      }
    } catch (e) {
      console.info(e)
    }
    this.getRecommandFilterLoading = false
  }

  async updateService() {
    try {
      this.loading = true
      await this.$http.post(`/api/v2/project/${this.projectId}/v2/fpa`, this.data)
      if (this.data.ipaType !== 'default' || this.data.use_domain_name) {
        this.$message({
          message: this.$t('Manual application created successfully') as string,
          type: 'success',
        })
      } else {
        this.$message({
          message: this.$t('create_success') as string,
          type: 'success',
        })
      }
      this.showConfirmDialog = false
      this.goToFPADetail()
    } catch (e) {
      if (e.response && e.response.data.code === 810) {
        this.$message.error(this.$t('Invalid parameter') as string)
      } else if (e.response.data.code === 940 || e.response.data.code === 941 || e.response.data.code === 942) {
        this.$message.error(this.$t('Resources not enough') as string)
      } else {
        this.$message.error(this.$t('SubmitFailed') as string)
      }
    }
    this.loading = false
  }

  goToFPADetail() {
    this.$router.push({ name: 'FPA', params: { id: this.projectId } })
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }
}
