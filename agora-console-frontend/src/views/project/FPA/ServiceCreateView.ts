import Vue from 'vue'
import Component from 'vue-class-component'
import { RegionTypeOptions } from '@/models'
import { getProjectInfo } from '@/services'
import { uuid } from 'uuidv4'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: `<div class="page-v3 create-upstream">
    <div class="d-flex">
      <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
      <el-breadcrumb separator="|" class="mb-20">
        <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $t('Create FPA service') }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="card" v-loading="loading">
      <el-form :model="data" size="small" label-width="180px" ref="submit-form">
        <div class="module-item-title">{{ $t('Origin site information') }}</div>
        <div class="w-500 m-auto">
          <el-form-item :label="$t('Origin site type') + ':'">
            <el-radio v-model="data.sourceType" label="ip4"> {{ $t('IPv4') }}</el-radio>
            <el-radio v-model="data.sourceType" label="domain"> {{ $t('Domain') }}</el-radio>
          </el-form-item>
          <el-form-item prop="sourcePort">
            <span slot="label">
              <el-tooltip :content='$t("UpstreamsPortHint")' placement="top" effect="light">
                <img class="ml-3 vertical-middle" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
              {{ $t('Port') + ':' }}
            </span>
            <el-input v-model="data.sourcePort" :placeholder="$t('Port')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Origin site') + ':'">
            <div v-for="(item, index) in data.sourceIps" class="mb-10" style="white-space: nowrap">
              <el-input
                v-model="data.sourceIps[index]"
                :placeholder="$t('Please input the origin site ip')"
                class="d-inline-block"
              ></el-input>
              <span class="link" @click="deleteOriginIp(index)" v-if="data.sourceIps.length > 1">
                {{ $t('Delete') }}
              </span>
            </div>
            <span class="link" @click="addOriginIp" v-if="data.sourceIps.length < 10"> {{ $t('Add') }} </span>
          </el-form-item>
          <el-form-item style="white-space: nowrap">
            <span slot="label">
              <el-tooltip :content='$t("PassThroughHint")' placement="top" effect="light">
                <img class="ml-3 vertical-middle" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
              {{ $t('Pass-through') + ':' }}
            </span>
            <el-radio v-model="data.protocol" label="tcp"> {{ $t('tcp') }}</el-radio>
            <el-radio v-model="data.protocol" label="proxy_protocol_v1"> {{ $t('proxy_protocol_v1') }}</el-radio>
            <el-radio v-model="data.protocol" label="proxy_protocol_v2"> {{ $t('proxy_protocol_v2') }}</el-radio>
          </el-form-item>
        </div>
        <div class="module-item-title">{{ $t('Services') }}</div>
        <div class="w-500 m-auto">
          <el-form-item :label="$t('Mode') + ':'">
            <el-radio-group v-model="data.chainsType">
              <el-radio label="ipa"> {{ $t('IPA') }}</el-radio>
              <el-tooltip
                :content='$t("IPAHint")'
                placement="top"
                effect="light"
                class="mr-10"
                style="position: relative;top: 3px"
              >
                <img class="ml-3" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
              <el-radio label="sdk"> {{ $t('SDK') }}</el-radio>
              <el-tooltip :content='$t("SDKHint")' placement="top" effect="light" style="position: relative;top: 3px">
                <img class="ml-3" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('IPA configuration') + ':'" v-if="data.chainsType === 'ipa'">
            <el-radio-group v-model="data.ipaType" @change="handleIpaTypeChange">
              <el-radio label="default"> {{ $t('Default') }}</el-radio>
              <el-tooltip :content='$t("DefaultHint")' placement="top" effect="light" class="mr-5">
                <img
                  class="ml-3"
                  width="15"
                  :src="IconQuestion"
                  alt=""
                  style="position:relative;top:3px;margin-right: 10px"
                />
              </el-tooltip>
              <el-radio label="customized">
                <span>{{ $t('Customized') }}</span>
              </el-radio>
              <el-tooltip :content='$t("CustomizedTip")' placement="top" effect="light" class="mr-5">
                <img class="ml-3" width="15" :src="IconQuestion" alt="" style="position:relative;top:3px;" />
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="data.chainsType === 'ipa'">
            <span slot="label">
              <el-tooltip :content='$t("ServicePortHint")' placement="top" effect="light">
                <img class="ml-3 vertical-middle" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
              {{ $t('Service Port') + ':' }}
            </span>
            <el-input
              v-model="data.chainsPort"
              :placeholder="$t('Randomly assigned')"
              v-if="data.ipaType === 'default'"
              disabled
            ></el-input>
            <el-input v-model="data.chainsPort" :placeholder="$t('Port')" v-else></el-input>
          </el-form-item>
          <el-form-item :label="$t('Connection limit') + ':'">
            <el-input
              v-model="data.concurrency_limit"
              :placeholder="$t('Connection limit')"
              :disabled="ipaDefault"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('Bandwidth limit') + ':'" style="white-space: nowrap">
            <el-input
              v-model="data.bandwidth_hardlimit"
              :placeholder="$t('Bandwidth limit')"
              :disabled="ipaDefault"
            ></el-input>
            <span class="ml-10">Mbps</span>
          </el-form-item>
          <!--          <el-form-item :label="$t('Global Traffic Manager') + ':'" v-if="data.chainsType === 'ipa'">-->
          <!--            <el-radio-group v-model="data.use_domain_name" @change="handleGlobalDoaminChange" :disabled="true">-->
          <!--              <el-radio :label="true">-->
          <!--                <span>{{ $t('Enabled') }}</span>-->
          <!--              </el-radio>-->
          <!--              <el-tooltip :content='$t("GlobalDomainTip")' placement="top" effect="light" class="mr-5">-->
          <!--                <img-->
          <!--                  class="ml-3"-->
          <!--                  width="15"-->
          <!--                  :src="IconQuestion"-->
          <!--                  alt=""-->
          <!--                  style="position:relative;top:3px;margin-right: 10px"-->
          <!--                />-->
          <!--              </el-tooltip>-->
          <!--              <el-radio :label="false" :disabled="!ipaCustomized"> {{ $t('Disabled') }}</el-radio>-->
          <!--            </el-radio-group>-->
          <!--          </el-form-item>-->
          <el-form-item :label="$t('Origin Site attribution Region') + ':'" style="white-space: nowrap">
            <el-select v-model="data.serverType" :placeholder="$t('Region Type')" @change="handleServerTypeChange">
              <el-option v-for="item in RegionTypeOptions" :key="item" :label="item" :value="item"> </el-option>
            </el-select>
            <el-select multiple v-model="data.serverTags" :placeholder="$t('Origin Region')">
              <el-option v-for="item in getRegionValue(data.serverType)" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('Acceleration region') + ':'"
            style="white-space: nowrap"
            v-if="data.chainsType === 'ipa' && !data.use_domain_name"
          >
            <el-select v-model="data.clientType" :placeholder="$t('Region Type')" @change="handleClientTypeChange">
              <el-option v-for="item in RegionTypeOptions" :key="item" :label="item" :value="item"> </el-option>
            </el-select>
            <el-select multiple v-model="data.clientTags" :placeholder="$t('Origin Region')">
              <el-option v-for="item in getRegionValue(data.clientType)" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div class="link text-right mt-10">
        <a :href="$t('FPA Config Doc Url')" target="_blank">{{ $t('ApaasTip') }}</a>
      </div>
    </div>
    <div class="mt-20 text-center">
      <console-button class="console-btn-white" @click="goBack">
        {{ $t('Cancel') }}
      </console-button>
      <console-button class="console-btn-primary" @click="updateService()" :disabled="loading" v-loading="loading">
        {{ $t('Save') }}
      </console-button>
    </div>
  </div>`,
})
export default class ServiceCreateView extends Vue {
  validatePort = (rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('RequiredMissing') as string))
    }
    if (isNaN(Number(value)) || Number(value) < 1 || Number(value) > 65534) {
      return callback(new Error(this.$t('UpstreamsPortHint') as string))
    }
    callback()
  }
  projectId = ''
  loading = false
  showCustomizedTip = false
  showGlobalDomainTip = false
  showConfirmDialog = false
  vendorInfo: any = {}
  data: any = {
    unique_id: uuid(),
    sourceType: 'ip4',
    sourcePort: '',
    sourceIps: [''],
    protocol: 'tcp',
    chainsType: 'ipa',
    ipaType: 'default',
    chainsPort: '',
    concurrency_limit: 1000,
    bandwidth_hardlimit: 10,
    use_domain_name: false,
    clientType: '',
    clientTags: [],
    serverType: '',
    serverTags: [],
  }
  RegionTypeOptions = RegionTypeOptions
  RegionCity = []
  RegionCountry = []
  RegionContinent = []
  IconQuestion = IconQuestion
  rules: any = {
    sourcePort: [{ required: true, validator: this.validatePort, trigger: 'blur' }],
  }

  get ipaDefault() {
    return this.data.chainsType === 'ipa' && this.data.ipaType === 'default'
  }

  get ipaCustomized() {
    return this.data.chainsType === 'ipa' && this.data.ipaType === 'customized'
  }

  async mounted() {
    this.projectId = this.$route.params.id
    this.getProject()
    this.getMachines()
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

  addOriginIp() {
    this.data.sourceIps.push('')
  }

  deleteOriginIp(index: number) {
    this.data.sourceIps.splice(index, 1)
  }

  handleIpaTypeChange(value: string) {
    this.showCustomizedTip = value === 'customized'
    if (value === 'default') {
      this.data.chainsPort = ''
      this.data.concurrency_limit = 1000
      this.data.bandwidth_hardlimit = 10
      this.data.use_domain_name = false
    }
  }

  handleGlobalDoaminChange(value: string) {
    this.showGlobalDomainTip = !!value
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

  async updateService() {
    try {
      this.loading = true
      await this.$http.post(`/api/v2/project/${this.projectId}/fpa`, this.data)
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

  goToFPADetail() {
    this.$router.push({ name: 'FPA', params: { id: this.projectId } })
  }

  goBack() {
    this.$router.go(-1)
  }
}
