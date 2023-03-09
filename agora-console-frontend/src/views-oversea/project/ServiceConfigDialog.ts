import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { DataRegionsCN, DataRegionsEN, EnabledStatus } from '@/models/netless'
import { user } from '@/services'
import WhiteboardServiceStorage from '@/views-oversea/project/WhiteboardServiceStorage'
import { listStorage } from '@/services/whiteboard'

@Component({
  components: {
    'whiteboard-service-storage': WhiteboardServiceStorage,
  },
  template: ` <div>
    <el-dialog
      :visible="visible"
      :title="$t('Services configuration')"
      :before-close="() => showConfigWhiteboard(false, true)"
      style="margin-top: -10vh;"
    >
      <el-alert :title="$t('udpateNetlessWarning')" type="warning" :closable="false" class="mb-3"></el-alert>
      <el-form :model="netlessInfo" size="small" label-width="160px" ref="submit-form" :rules="rules">
        <div class="w-500 m-auto">
          <el-form-item :label="$t('Data Center')">
            <span>{{ $t(dataCenter.find(e => e.value === dataRegion)?.label) }}</span>
          </el-form-item>
          <el-form-item :label="$t('Docs to Picture')">
            <el-radio
              v-model="netlessInfo.static_conversion.isEnabled"
              :label="enabledStatus.Enabled"
              @change="handleServiceEnable"
            >
              {{ $t('Enabled') }}
            </el-radio>
            <el-radio
              v-model="netlessInfo.static_conversion.isEnabled"
              :label="enabledStatus.Disabled"
              @change="handleServiceEnable"
            >
              {{ $t('Disabled') }}
            </el-radio>
            <div v-if="netlessInfo.static_conversion.isEnabled === enabledStatus.Enabled" class="tip">
              {{ $t('Service Tip') }}<a target="_blank" :href="$t('WhiteboardPricingLink')">{{ $t('BillingDetail') }}</a
              >{{ $t('for more information') }}
            </div>
          </el-form-item>
          <div v-if="netlessInfo.static_conversion.isEnabled === enabledStatus.Enabled">
            <el-form-item :label="$t('QPS')">
              <el-input-number
                v-model="netlessInfo.static_conversion.maxConcurrentNumber"
                controls-position="right"
                :min="1"
                :max="20"
                class="w-220"
                :disabled="true"
              ></el-input-number>
              <div class="tip mt-2">{{ $t('If you need more QPS please contact sales') }}</div>
            </el-form-item>
            <el-form-item :label="$t('Storage')" prop="static_conversion.storageInfo.selectStorageId">
              <el-select
                filterable
                v-model="netlessInfo.static_conversion.storageInfo.selectStorageId"
                size="mini"
                @change="handlePicStorageChange"
                class="w-220"
                style="z-index: 2036!important;"
              >
                <el-option
                  v-for="item in storageInfo.storages"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                  v-if="filterSelectableStorage(item)"
                >
                  <span style="float: left">{{ item.name }}</span>
                  <div style="float: right; color: #8492a6; font-size: 13px; margin-left: 8px;">
                    <el-button
                      type="text"
                      size="small"
                      @click="showStorageEditor(parseInt(item.id), 'static_conversion')"
                      :disabled="item.id === 'default'"
                    >
                      {{ $t('edit') }}
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click="showStorageEditor(parseInt(item.id), 'static_conversion', true)"
                      :disabled="item.id === 'default'"
                    >
                      {{ $t('Copy') }}
                    </el-button>
                  </div>
                </el-option>
              </el-select>
              <el-button @click="showStorageEditor(undefined, 'static_conversion', true)">
                <i class="el-icon-plus"></i> {{ $t('Create') }}
              </el-button>
            </el-form-item>
          </div>
          <div class="divider" style="width: 400px; margin-left: 80px;"></div>
          <el-form-item :label="$t('Docs to web')">
            <el-radio
              v-model="netlessInfo.dynamic_conversion.isEnabled"
              :label="enabledStatus.Enabled"
              @change="handleServiceEnable"
            >
              {{ $t('Enabled') }}
            </el-radio>
            <el-radio
              v-model="netlessInfo.dynamic_conversion.isEnabled"
              :label="enabledStatus.Disabled"
              @change="handleServiceEnable"
            >
              {{ $t('Disabled') }}
            </el-radio>
            <div v-if="netlessInfo.dynamic_conversion.isEnabled === enabledStatus.Enabled" class="tip">
              {{ $t('Service Tip') }}<a target="_blank" :href="$t('WhiteboardPricingLink')">{{ $t('BillingDetail') }}</a
              >{{ $t('for more information') }}
            </div>
          </el-form-item>
          <div v-if="netlessInfo.dynamic_conversion.isEnabled === enabledStatus.Enabled">
            <el-form-item :label="$t('QPS')">
              <el-input-number
                v-model="netlessInfo.dynamic_conversion.maxConcurrentNumber"
                controls-position="right"
                :min="1"
                :max="20"
                class="w-220"
                :disabled="true"
              ></el-input-number>
              <div class="tip mt-2">{{ $t('If you need more QPS please contact sales') }}</div>
            </el-form-item>
            <el-form-item :label="$t('Storage')" prop="dynamic_conversion.storageInfo.selectStorageId">
              <el-select
                filterable
                v-model="netlessInfo.dynamic_conversion.storageInfo.selectStorageId"
                size="mini"
                @change="handleDynamicStorageChange"
                class="w-220"
              >
                <el-option
                  v-for="item in storageInfo.storages"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                  v-if="filterSelectableStorage(item)"
                >
                  <span style="float: left">{{ item.name }}</span>
                  <div style="float: right; color: #8492a6; font-size: 13px; margin-left: 8px;">
                    <el-button
                      type="text"
                      size="small"
                      @click="showStorageEditor(parseInt(item.id), 'dynamic_conversion')"
                      :disabled="item.id === 'default'"
                    >
                      {{ $t('edit') }}
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click="showStorageEditor(parseInt(item.id), 'dynamic_conversion', true)"
                      :disabled="item.id === 'default'"
                    >
                      {{ $t('Copy') }}
                    </el-button>
                  </div>
                </el-option>
              </el-select>
              <el-button @click="showStorageEditor(undefined, 'dynamic_conversion', true)">
                <i class="el-icon-plus"></i> {{ $t('Create') }}
              </el-button>
            </el-form-item>
          </div>
          <div class="divider" style="width: 400px; margin-left: 80px;"></div>
          <el-form-item :label="$t('Screenshot')">
            <el-radio v-model="netlessInfo.snapshot.isEnabled" :label="enabledStatus.Enabled">
              {{ $t('Enabled') }}
            </el-radio>
            <el-radio v-model="netlessInfo.snapshot.isEnabled" :label="enabledStatus.Disabled">
              {{ $t('Disabled') }}
            </el-radio>
            <div v-if="netlessInfo.snapshot.isEnabled === enabledStatus.Enabled" class="tip">
              {{ $t('Service Tip') }}<a target="_blank" :href="$t('WhiteboardPricingLink')">{{ $t('BillingDetail') }}</a
              >{{ $t('for more information') }}
            </div>
          </el-form-item>
          <div v-if="netlessInfo.snapshot.isEnabled === enabledStatus.Enabled">
            <el-form-item :label="$t('Storage')" prop="snapshot.storageInfo.selectStorageId">
              <el-select
                filterable
                v-model="netlessInfo.snapshot.storageInfo.selectStorageId"
                size="mini"
                @change="handleSnapshotStorageChange"
                class="w-220"
              >
                <el-option
                  v-for="item in storagesForSnapshot"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                  v-if="filterSelectableStorage(item)"
                >
                  <span style="float: left">{{ item.name }}</span>
                  <div style="float: right; color: #8492a6; font-size: 13px; margin-left: 8px;">
                    <el-button
                      type="text"
                      size="small"
                      @click="showStorageEditor(parseInt(item.id), 'snapshot')"
                      :disabled="item.id === 'default'"
                    >
                      {{ $t('edit') }}
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click="showStorageEditor(parseInt(item.id), 'snapshot', true)"
                      :disabled="item.id === 'default'"
                    >
                      {{ $t('Copy') }}
                    </el-button>
                  </div>
                </el-option>
              </el-select>
              <el-button @click="showStorageEditor(undefined, 'snapshot', true)">
                <i class="el-icon-plus"></i> {{ $t('Create') }}
              </el-button>
            </el-form-item>
          </div>
          <el-form-item>
            <console-button class="console-btn-size-md console-btn-primary" @click="comfirmCommit()">
              {{ $t('Save') }}
            </console-button>
            <console-button class="console-btn-size-md" @click="showConfigWhiteboard(false, true)">
              {{ $t('Cancel') }}
            </console-button>
          </el-form-item>
        </div>
      </el-form>
    </el-dialog>
    <el-dialog :title="$t('edit')" :visible.sync="showServiceEditorDialog">
      <whiteboard-service-storage
        v-if="showServiceEditorDialog"
        :vendor-id="vendorId"
        :data-region="storageInfo.dataCenterToRegion[dataRegion]"
        :storage-id="storageId"
        :on-success="getStorages"
        :on-close="closeStorageEditor"
        :create-new="createNew"
      ></whiteboard-service-storage>
    </el-dialog>
  </div>`,
})
export default class ServiceConfigDialog extends Vue {
  @Prop({ default: false, type: Boolean }) readonly visible!: boolean
  @Prop({ default: 0, required: true, type: Number }) readonly vendorId!: number
  @Prop({ default: '', type: String }) readonly dataRegion!: string
  @Prop({ default: null, type: Object }) readonly netlessInfo!: any
  @Prop({ default: null, type: Function }) readonly showConfigWhiteboard!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly updateWhiteboard!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly onConfirm!: () => Promise<void>
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean

  storageInfo: any = {}
  storagesForSnapshot: any[] = []
  isCN = user.info.company.area === 'CN'
  dataCenter = this.isCN ? DataRegionsCN : DataRegionsEN
  storageId: number = 0
  createNew: boolean = false
  enabledStatus = EnabledStatus
  showServiceEditorDialog = false

  async mounted() {
    this.getStorages()
  }

  showStorageEditor(storageId: number, serviceType: string, createNew = false) {
    this.storageId = storageId
    this.createNew = createNew
    this.showServiceEditorDialog = true
  }

  closeStorageEditor() {
    this.showServiceEditorDialog = false
  }

  async getStorages() {
    const storageInfo = await listStorage(this.vendorId)
    this.storageInfo = storageInfo
    this.storagesForSnapshot = this.storageInfo.storages.filter((storage: any) => storage.id !== 'default')
  }

  validateStaticDomain = (rule: any, value: string, callback: any) => {
    if (this.netlessInfo.static_conversion.storageInfo.provider === 'qiniu' && !value) {
      return callback(new Error(this.$t('InvalidParam') as string))
    }
    callback()
  }
  validateDynamicDomain = (rule: any, value: string, callback: any) => {
    if (this.netlessInfo.dynamic_conversion.storageInfo.provider === 'qiniu' && !value) {
      return callback(new Error(this.$t('InvalidParam') as string))
    }
    callback()
  }
  validateSnapshotDomain = (rule: any, value: string, callback: any) => {
    if (this.netlessInfo.snapshot.storageInfo.provider === 'qiniu' && !value) {
      return callback(new Error(this.$t('InvalidParam') as string))
    }
    callback()
  }

  handlePicStorageChange(value: string) {
    const storageInfo = this.storageInfo.storages.find((item: any) => item.id === value)
    if (storageInfo) {
      this.netlessInfo.static_conversion.storageInfo = Object.assign(
        {},
        this.netlessInfo.static_conversion.storageInfo,
        storageInfo
      )
    }
  }

  handleDynamicStorageChange(value: string) {
    const storageInfo = this.storageInfo.storages.find((item: any) => item.id === value)
    if (storageInfo) {
      this.netlessInfo.dynamic_conversion.storageInfo = Object.assign(
        {},
        this.netlessInfo.dynamic_conversion.storageInfo,
        storageInfo
      )
    }
  }
  handleSnapshotStorageChange(value: string) {
    const storageInfo = this.storageInfo.storages.find((item: any) => item.id === value)
    if (storageInfo) {
      this.netlessInfo.snapshot.storageInfo = Object.assign({}, this.netlessInfo.snapshot.storageInfo, storageInfo)
    }
  }

  handleServiceEnable() {
    // this.formatStorageInfo()
  }

  filterSelectableStorage(storage: any) {
    if (this.dataRegion === 'cn-hz') {
      return this.storageInfo.chinaRegionValues.includes(storage.region) || storage.id === 'default' // 默认配置仅国内可选
    } else {
      return this.storageInfo.overseaRegionValues.includes(storage.region)
    }
  }

  comfirmCommit() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.onConfirm ? this.onConfirm() : null
      } else {
        return false
      }
    })
  }

  rules: any = {
    'static_conversion.storageInfo.selectStorageId': [
      { required: true, message: this.$t('InvalidParam'), trigger: 'blur' },
    ],
    'static_conversion.storageInfo.provider': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'static_conversion.storageInfo.region': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'static_conversion.storageInfo.ak': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'static_conversion.storageInfo.sk': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'static_conversion.storageInfo.bucket': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'dynamic_conversion.storageInfo.selectStorageId': [
      { required: true, message: this.$t('InvalidParam'), trigger: 'blur' },
    ],
    'dynamic_conversion.storageInfo.provider': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'dynamic_conversion.storageInfo.ak': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'dynamic_conversion.storageInfo.region': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'dynamic_conversion.storageInfo.sk': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'dynamic_conversion.storageInfo.bucket': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'snapshot.storageInfo.selectStorageId': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'snapshot.storageInfo.provider': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'snapshot.storageInfo.region': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'snapshot.storageInfo.ak': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'snapshot.storageInfo.sk': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'snapshot.storageInfo.bucket': [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    'static_conversion.storageInfo.domain': [
      { message: this.$t('InvalidParam'), validator: this.validateStaticDomain, trigger: 'blur' },
    ],
    'dynamic_conversion.storageInfo.domain': [
      { message: this.$t('InvalidParam'), validator: this.validateDynamicDomain, trigger: 'blur' },
    ],
    'snapshot.storageInfo.domain': [
      { message: this.$t('InvalidParam'), validator: this.validateSnapshotDomain, trigger: 'blur' },
    ],
  }
}
