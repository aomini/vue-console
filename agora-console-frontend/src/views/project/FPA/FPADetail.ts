import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import '../Project.less'
import { OriginType, RegionTypeOptions } from '@/models'

@Component({
  template: `
    <div class="fpa-detail">
      <div v-if="type === 'upstreams' && data.id">
        <div class="text-right link" @click="handleEdit(true)" v-show="!editing">{{ $t('edit') }}</div>
        <div>
          <div class="label-item">
            <div class="label">{{ $t('ID') }}：</div>
            <div class="content">{{ data.id }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Origin site name') }}：</div>
            <div class="content text-truncate" v-if="!editing">{{ data.name }}</div>
            <div class="content" v-else><el-input v-model="editData.name" size="mini"></el-input></div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Origin site type') }}：</div>
            <div class="content" v-if="!editing">{{ $t(OriginType[data.sources[0].type]) }}</div>
            <div class="content" v-else>
              <el-radio v-model="editData.sourceType" label="ip4"> {{ $t('IPv4') }}</el-radio>
              <el-radio v-model="editData.sourceType" label="domain"> {{ $t('Domain') }}</el-radio>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Port') }}：</div>
            <div class="content" v-if="!editing">{{ data.sources[0].port }}</div>
            <div class="content" v-else>
              <el-input v-model="editData.port" size="mini"></el-input>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Origin site') }}：</div>
            <div class="content d-flex align-center">
              <div class="d-flex flex-column">
                <div v-for="(item, index) in editData.sourceIps" :key="index" style="white-space: nowrap">
                  <span v-if="!editing">{{ item }}</span>
                  <el-input
                    v-model="editData.sourceIps[index]"
                    :placeholder="$t('Please input the origin site ip')"
                    class="d-inline-block mb-5"
                    size="mini"
                    v-else
                  ></el-input>
                  <span class="link" @click="deleteOriginIp(index)" v-if="editing && editData.sourceIps.length > 1">
                    {{ $t('Delete') }}
                  </span>
                </div>
                <span class="link" @click="addOriginIp" v-if="editing && editData.sourceIps.length < 10">
                  {{ $t('Add') }}
                </span>
              </div>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Pass-through') }}：</div>
            <div class="content" v-if="!editing">{{ $t(data.protocol) }}</div>
            <div class="content" v-else>
              <div>
                <el-radio v-model="editData.protocol" label="tcp"> {{ $t('tcp') }}</el-radio>
              </div>
              <div>
                <el-radio v-model="editData.protocol" label="proxy_protocol_v1">
                  {{ $t('proxy_protocol_v1') }}</el-radio
                >
              </div>
              <div>
                <el-radio v-model="editData.protocol" label="proxy_protocol_v2">
                  {{ $t('proxy_protocol_v2') }}</el-radio
                >
              </div>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('CreateTime') }}：</div>
            <div class="content">{{ data.create_time | formatTimeStamp }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('UpdateTime') }}：</div>
            <div class="content">{{ data.update_time | formatTimeStamp }}</div>
          </div>
          <div class="label-item">
            <div class="label"></div>
            <console-button class="console-btn-primary" @click="updateUpstreams" v-if="editing">
              {{ $t('Save') }}
            </console-button>
          </div>
        </div>
      </div>
      <div v-if="type === 'chains'">
        <div class="text-right link" @click="handleEdit(true)" v-show="!editing">{{ $t('edit') }}</div>
        <div>
          <div class="label-item">
            <div class="label">{{ $t('ID') }}：</div>
            <div class="content">{{ data.id }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Name Text') }}：</div>
            <div class="content text-truncate" v-if="!editing">{{ data.hint }}</div>
            <div class="content" v-else><el-input v-model="editChainData.hint" size="mini"></el-input></div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Edge IP') }}：</div>
            <div>
              <div class="content" v-for="item in data.client_infos">{{ item.ip + '(' + item.city + ')' }}</div>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Gateway IP') }}：</div>
            <div>
              <div class="content" v-for="item in data.server_infos">{{ item.ip + '(' + item.city + ')' }}</div>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Protocol/Port') }}：</div>
            <div class="content" v-if="data.inbound">{{ data.inbound.protocol + '/' + data.port }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Bandwith Limit') }}：</div>
            <div class="content">{{ data.bandwidth_hardlimit | bpsToMbps }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Connection Limit') }}：</div>
            <div class="content">{{ data.concurrency_limit }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Origin site id') }}：</div>
            <div class="content">{{ data.upstream_id }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Acceleration region') }}：</div>
            <div class="content" v-if="!editing">
              <span> {{ editChainData.clientTags.join(',') }} </span>
            </div>
            <div class="content" v-else>
              <el-select multiple size="mini" v-model="editChainData.clientTags" :placeholder="$t('Origin Region')">
                <el-option
                  v-for="item in getRegionValue(editChainData.clientType)"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('CreateTime') }}：</div>
            <div class="content">{{ data.create_time | formatTimeStamp }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('UpdateTime') }}：</div>
            <div class="content">{{ data.update_time | formatTimeStamp }}</div>
          </div>
          <div class="label-item">
            <div class="label"></div>
            <console-button class="console-btn-primary" @click="updateChains" v-if="editing">
              {{ $t('Save') }}
            </console-button>
          </div>
        </div>
      </div>
      <div v-if="type === 'sdk'">
        <div class="text-right link" @click="handleEdit(true)" v-show="!editing">{{ $t('edit') }}</div>
        <div>
          <div class="label-item">
            <div class="label">{{ $t('ID') }}：</div>
            <div class="content">{{ data.id }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Name Text') }}：</div>
            <div class="content text-truncate" v-if="!editing">{{ data.name }}</div>
            <div class="content" v-else><el-input v-model="editSDKChainData.name" size="mini"></el-input></div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Gateway IP') }}：</div>
            <div>
              <div class="content" v-for="item in data.server_infos">{{ item.ip }}</div>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Bandwith Limit') }}：</div>
            <div class="content">{{ data.bandwidth | bpsToMbps }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Connection Limit') }}：</div>
            <div class="content">{{ data.concurrency_limit }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Origin site id') }}：</div>
            <div class="content">{{ data.upstream }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('Origin Site attribution Region') }}：</div>
            <div class="content" v-if="!editing">
              <span> {{ data.server_filters.tags.join(',') }} </span>
            </div>
            <div class="content" v-else>
              <el-select
                v-model="data.server_filters.type"
                :placeholder="$t('Region Type')"
                @change="handleServerTypeChange"
                disabled
                size="mini"
              >
                <el-option v-for="item in RegionTypeOptions" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
              <el-select
                multiple
                size="mini"
                v-model="data.server_filters.tags"
                :placeholder="$t('Origin Region')"
                disabled
              >
                <el-option
                  v-for="item in getRegionValue(data.server_filters.type)"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('CreateTime') }}：</div>
            <div class="content">{{ data.create_time | formatTimeStamp }}</div>
          </div>
          <div class="label-item">
            <div class="label">{{ $t('UpdateTime') }}：</div>
            <div class="content">{{ data.update_time | formatTimeStamp }}</div>
          </div>
          <div class="label-item">
            <div class="label"></div>
            <console-button class="console-btn-primary" @click="updateSDKChains" v-if="editing">
              {{ $t('Save') }}
            </console-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class FPADetail extends Vue {
  @Prop({ default: '', type: String }) readonly type!: string
  @Prop({ type: Object }) readonly data!: any
  @Prop({ default: false, type: Boolean }) readonly editing!: boolean
  @Prop({ default: null, type: Function }) readonly handleEdit!: (edit: boolean) => Promise<void>

  OriginType = OriginType
  editData: any = {
    name: '',
    sourceType: '',
    port: '',
    sourceIps: [],
    protocol: '',
  }
  editChainData: any = {
    hint: '',
    clientType: 'country',
    clientTags: [],
  }
  editSDKChainData: any = {
    name: '',
  }
  RegionTypeOptions = RegionTypeOptions
  RegionCity = []
  RegionCountry = []
  RegionContinent = []

  @Watch('data')
  dataChange() {
    if (this.type === 'upstreams') {
      this.editData.name = this.data.name
      this.editData.sourceType = this.data.sources[0].type
      this.editData.port = this.data.sources[0].port
      this.editData.protocol = this.data.protocol
      this.editData.sourceIps = []
      this.data.sources.forEach((item: any) => {
        this.editData.sourceIps.push(item.address)
      })
    } else if (this.type === 'chains') {
      this.editChainData.clientType = this.data.client_filters.type
      this.editChainData.clientTags = this.data.client_filters.tags
      this.editChainData.hint = this.data.hint
    } else if (this.type === 'sdk') {
      this.editSDKChainData.serverType = this.data.server_filters.type
      this.editSDKChainData.serverTags = this.data.server_filters.tags
      this.editSDKChainData.name = this.data.name
    }
  }

  mounted() {
    this.getMachines()
  }

  deleteOriginIp(index: number) {
    this.editData.sourceIps.splice(index, 1)
  }

  addOriginIp() {
    this.editData.sourceIps.push('')
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

  handleClientTypeChange() {
    this.editChainData.clientTags = []
  }

  handleServerTypeChange() {
    this.editSDKChainData.serverTags = []
  }

  updateUpstreams() {
    this.$emit('updateUpstreams', this.data.id, this.editData)
  }

  updateChains() {
    this.$emit('updateChains', this.data.id, this.editChainData)
  }

  updateSDKChains() {
    this.$emit('updateSDKChains', this.data.id, this.editSDKChainData)
  }
}
