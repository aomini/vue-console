import Vue from 'vue'
import Component from 'vue-class-component'
import {
  AliRegions,
  AWSRegions,
  EnabledStatus,
  QiNiuRegions,
  AWSRowRegions,
  DataRegionsCN,
  DataRegionsEN,
} from '@/models/netless'
import { getProjectInfo, user } from '@/services'
import { getProjectNetlessInfo, listStorage } from '@/services/whiteboard'
import PasswordInput from '@/components/PasswordInput'
import './Project.less'
import ServiceConfigDialog from '@/views/project/ServiceConfigDialog'
import { RouteRecord } from 'vue-router/types/router'

@Component({
  components: {
    'password-input': PasswordInput,
    'service-config-dialog': ServiceConfigDialog,
  },
  template: `
    <div class="page-v3">
      <div class="d-flex">
        <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
        <el-breadcrumb separator="|" class="mb-20">
          <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ $t('Whiteboard Configuration') }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="card" v-loading="loading">
        <el-form :model="netlessInfo" size="small" label-width="180px" ref="submit-form">
          <div class="module-item-title">{{ $t('Whiteboard Status') }}</div>
          <div class="w-500 m-auto">
            <el-form-item :label="$t('Whiteboard Status') + ':'">
              <el-radio v-model="netlessInfo.isEnabled" :label="1"> {{ $t('Enabled') }}</el-radio>
            </el-form-item>
          </div>
          <div class="module-item-title">{{ $t('Basic information') }}</div>
          <div class="w-500 m-auto">
            <el-form-item :label="$t('AppIdentifier:')" prop="appUUID">
              <password-input
                class="w-285"
                :passwordValue="netlessInfo.teamUUID + '/' + netlessInfo.appUUID"
                :isDisabled="true"
              ></password-input>
            </el-form-item>
            <el-form-item :label="$t('AK:')" prop="ak">
              <password-input class="w-285" :passwordValue="netlessInfo.ak" :isDisabled="true"></password-input>
            </el-form-item>
            <el-form-item :label="$t('SK:')" prop="sk">
              <password-input class="w-285" :passwordValue="netlessInfo.sk" :isDisabled="true"></password-input>
            </el-form-item>
            <el-form-item :label="$t('sdkToken:')">
              <el-button
                class="button button-outline-mid-primary w-150"
                @click="getSDKToken"
                :loading="tokenLoading"
                :disabled="tokenLoading || !netlessInfo.ak"
              >
                {{ $t('Generate sdk Token') }}
              </el-button>
            </el-form-item>
          </div>
          <div class="module-item-title">{{ $t('Services') }}</div>
          <div>
            <el-table
              :data="serviceInfos"
              row-class-name="dark-table-row"
              cell-class-name="text-truncate"
              header-cell-class-name="text-truncate"
            >
              <el-table-column :label='$t("Data Center")' label-class-name="table-title" class-name="table-content">
                <template slot-scope="scope">
                  <div>
                    <span>{{ $t(scope.row.dataRegionLabel) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label='$t("Docs to Picture")' label-class-name="table-title" class-name="table-content">
                <template slot-scope="scope">
                  <div>
                    <span>{{ scope.row.static_conversion.isEnabled ? $t('enabled') : $t('disabled') }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label='$t("Docs to web")' label-class-name="table-title" class-name="table-content">
                <template slot-scope="scope">
                  <div>
                    <span>{{ scope.row.dynamic_conversion.isEnabled ? $t('enabled') : $t('disabled') }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label='$t("Screenshot")' label-class-name="table-title" class-name="table-content">
                <template slot-scope="scope">
                  <div>
                    <span>{{ scope.row.snapshot.isEnabled ? $t('enabled') : $t('disabled') }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label='$t("Action")' label-class-name="table-title" class-name="table-content">
                <template slot-scope="scope">
                  <div>
                    <span class="link" @click="() => showServiceConfigDialog(scope.row)">{{ $t('Config') }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form>
      </div>

      <el-dialog :title='$t("Warning")' :visible.sync="showTokenDialog" width="500px">
        <div class="p-2">
          <div class="bk-green">{{ $t('Generate sdk Token Tip') }}</div>
          <div class="bk-grey">{{ sdkToken }}</div>
          <div class="al-center">
            <console-button class="console-btn-primary" v-clipboard:copy="sdkToken" @click="copySDKToken">
              {{ $t('Copy SDK Token') }}
            </console-button>
          </div>
        </div>
      </el-dialog>

      <service-config-dialog
        :visible="showServiceConfig"
        :netless-info="netlessInfo"
        :data-region="selectDataRegion"
        :show-config-whiteboard="showConfigWhiteboard"
        :update-whiteboard="updateWhiteboard"
        :loading="loading"
        :vendor-id="vendorInfo.id"
        :on-confirm="onConfirmUpdateServiceConfig"
      ></service-config-dialog>
    </div>
  `,
})
export default class EditWhiteBoardView extends Vue {
  loading = false
  vendorInfo: any = {}
  netlessInfo: any = {
    isEnabled: true,
    dynamic_conversion: { isEnabled: EnabledStatus.Disabled, maxConcurrentNumber: 1, storageInfo: {} },
    static_conversion: { isEnabled: EnabledStatus.Disabled, maxConcurrentNumber: 1, storageInfo: {} },
    snapshot: { isEnabled: EnabledStatus.Disabled, storageInfo: {} },
  }
  storageInfo: any = {}
  serviceInfos: any = []
  aliRegions = AliRegions
  qiNiuRegions = QiNiuRegions
  aWSRegions = user.info.company.area === 'CN' ? AWSRegions : AWSRowRegions
  dataCenter = user.info.company.area === 'CN' ? DataRegionsCN : DataRegionsEN
  picSelectRegions: any = []
  webSelectRegions: any = []
  snapshotSelectRegions: any = []
  showTokenDialog = false
  tokenLoading = false
  sdkToken = ''
  enabledStatus = EnabledStatus
  isCN = user.info.company.area === 'CN'
  showServiceConfig = false
  selectDataRegion = ''
  projectId = ''

  async mounted() {
    this.projectId = this.$route.params.id
    await this.changeBreadcrumb()
    await this.getProject()
    await Promise.all([this.getProjectNetlessInfo(), this.getStorageInfo()])
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }

  async getProject() {
    try {
      const project = await getProjectInfo(this.projectId)
      this.vendorInfo = project.info
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.$router.push({ name: 'projects' })
    }
  }

  async getStorageInfo() {
    const storageInfo: any = await listStorage(this.vendorInfo.id)
    this.storageInfo = storageInfo
  }

  async getProjectNetlessInfo(refreshNetlessInfo = true) {
    try {
      this.loading = true
      const projectInfo: any = await getProjectNetlessInfo(this.vendorInfo.id)
      if (refreshNetlessInfo) {
        this.netlessInfo = Object.assign(this.netlessInfo, projectInfo.basicInfo, { isEnabled: 1 })
      }
      this.serviceInfos = []
      for (const dataCenter of this.dataCenter) {
        this.serviceInfos.push({
          dataRegion: dataCenter.value,
          dataRegionLabel: dataCenter.label,
          static_conversion: Object.assign(
            { isEnabled: EnabledStatus.Disabled, maxConcurrentNumber: 1, storageInfo: {} },
            projectInfo.services[dataCenter.value]?.static_conversion || {}
          ),
          dynamic_conversion: Object.assign(
            { isEnabled: EnabledStatus.Disabled, maxConcurrentNumber: 1, storageInfo: {} },
            projectInfo.services[dataCenter.value]?.dynamic_conversion || {}
          ),
          snapshot: Object.assign(
            { isEnabled: EnabledStatus.Disabled, storageInfo: {} },
            projectInfo.services[dataCenter.value]?.snapshot || {}
          ),
        })
      }
    } catch (e) {
      this.$message.error(this.$t('FailedGetNetlessInfo') as string)
    }
    this.loading = false
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

  handlePicVendorChange(value: string, needClear = false) {
    if (value === 'qiniu') {
      this.picSelectRegions = this.qiNiuRegions
    } else if (value === 'aliyun') {
      this.picSelectRegions = this.aliRegions
    } else if (value === 'aws') {
      this.picSelectRegions = this.aWSRegions
    }
    needClear && this.$set(this.netlessInfo.static_conversion.storageInfo, 'region', undefined)
  }

  handleDynamicVendorChange(value: string, needClear = false) {
    if (value === 'qiniu') {
      this.webSelectRegions = this.qiNiuRegions
    } else if (value === 'aliyun') {
      this.webSelectRegions = this.aliRegions
    } else if (value === 'aws') {
      this.webSelectRegions = this.aWSRegions
    }
    needClear && this.$set(this.netlessInfo.dynamic_conversion.storageInfo, 'region', undefined)
  }

  handleSnapshotVendorChange(value: string, needClear = false) {
    if (value === 'qiniu') {
      this.snapshotSelectRegions = this.qiNiuRegions
    } else if (value === 'aliyun') {
      this.snapshotSelectRegions = this.aliRegions
    } else if (value === 'aws') {
      this.snapshotSelectRegions = this.aWSRegions
    }
    needClear && this.$set(this.netlessInfo.snapshot.storageInfo, 'region', undefined)
  }

  formatStorageInfo() {
    if (this.netlessInfo.dynamic_conversion) {
      if (this.netlessInfo.dynamic_conversion.isEnabled === this.enabledStatus.Enabled) {
        this.netlessInfo.dynamic_conversion.storageInfo = {}
        if (this.netlessInfo.dynamic_conversion.configuration) {
          const info = JSON.parse(this.netlessInfo.dynamic_conversion.configuration)
          if (info.storageDriverId) {
            this.$set(
              this.netlessInfo.dynamic_conversion.storageInfo,
              'selectStorageId',
              info.storageDriverId.toString()
            )
            this.handleDynamicStorageChange(info.storageDriverId.toString())
            this.handleDynamicVendorChange(this.netlessInfo.dynamic_conversion.storageInfo.provider)
          } else {
            this.$set(this.netlessInfo.dynamic_conversion.storageInfo, 'selectStorageId', this.isCN ? 'default' : '')
          }
        } else {
          this.$set(this.netlessInfo.dynamic_conversion.storageInfo, 'selectStorageId', this.isCN ? 'default' : '')
        }
      }
    }

    if (this.netlessInfo.static_conversion) {
      if (this.netlessInfo.static_conversion.isEnabled === this.enabledStatus.Enabled) {
        this.netlessInfo.static_conversion.storageInfo = {}
        if (this.netlessInfo.static_conversion.configuration) {
          const info = JSON.parse(this.netlessInfo.static_conversion.configuration)
          if (info.storageDriverId) {
            this.$set(
              this.netlessInfo.static_conversion.storageInfo,
              'selectStorageId',
              info.storageDriverId.toString()
            )
            this.handlePicStorageChange(info.storageDriverId.toString())
            this.handlePicVendorChange(this.netlessInfo.static_conversion.storageInfo.provider)
          } else {
            this.$set(this.netlessInfo.static_conversion.storageInfo, 'selectStorageId', this.isCN ? 'default' : '')
          }
        } else {
          this.$set(this.netlessInfo.static_conversion.storageInfo, 'selectStorageId', this.isCN ? 'default' : '')
        }
      }
    }

    if (this.netlessInfo.snapshot) {
      if (this.netlessInfo.snapshot.isEnabled === this.enabledStatus.Enabled) {
        this.netlessInfo.snapshot.storageInfo = {}
        if (this.netlessInfo.snapshot.configuration) {
          const info = JSON.parse(this.netlessInfo.snapshot.configuration)
          if (info.storageDriverId) {
            this.$set(this.netlessInfo.snapshot.storageInfo, 'selectStorageId', info.storageDriverId.toString())
            this.handleSnapshotStorageChange(info.storageDriverId.toString())
            this.handleSnapshotVendorChange(this.netlessInfo.snapshot.storageInfo.provider)
          } else {
            this.$set(this.netlessInfo.snapshot.storageInfo, 'selectStorageId', this.isCN ? 'default' : '')
          }
        } else {
          this.$set(this.netlessInfo.snapshot.storageInfo, 'selectStorageId', this.isCN ? 'default' : '')
        }
      }
    }
  }

  onConfirmUpdateServiceConfig() {
    this.$confirm(this.$t('ConfirmTip') as string, this.$t('Warning') as string, {
      confirmButtonText: this.$t('Confirm') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    }).then(async () => {
      this.updateWhiteboard()
    })
  }

  async updateWhiteboard() {
    try {
      this.loading = true
      await this.$http.post(`/api/v2/project/${this.vendorInfo.id}/netless/service`, this.netlessInfo)
      this.$message({
        message: this.$t('Updated successfully') as string,
        type: 'success',
      })
      this.showConfigWhiteboard(false, true)
    } catch (e) {
      if (e.response && e.response.data && e.response.data.code === 20005) {
        this.$message.error(this.$t('Failed to update Storage Info') as string)
      } else {
        this.$message.error(this.$t('Failed to update') as string)
      }
    }
    this.loading = false
  }

  async getSDKToken() {
    try {
      this.tokenLoading = true
      const data = await this.$http.post(`/api/v2/project/${this.vendorInfo.id}/netless/token`, {
        ak: this.netlessInfo.ak,
        sk: this.netlessInfo.sk,
      })
      if (data.data) {
        this.showTokenDialog = true
        this.sdkToken = data.data
      }
    } catch (e) {
      this.$message.error(this.$t('Failed to generate sdk token') as string)
    }
    this.tokenLoading = false
  }

  copySDKToken() {
    this.$message({
      message: this.$t('SDK Token Copied') as string,
      type: 'success',
    })
  }

  showServiceConfigDialog(data: any) {
    this.selectDataRegion = data.dataRegion
    this.netlessInfo = Object.assign({}, this.netlessInfo, data)
    this.formatStorageInfo()
    this.showServiceConfig = true
  }

  async showConfigWhiteboard(show = false, refresh = false) {
    this.showServiceConfig = show
    if (refresh) {
      await Promise.all([this.getProjectNetlessInfo(false), this.getStorageInfo()])
    }
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: '/projects',
        meta: {
          breadcrumb: 'ProjectList',
        },
      },
      {
        path: `/project/${this.projectId}`,
        meta: {
          breadcrumb: 'ProjectDetail',
        },
      },
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: 'Whiteboard Configuration',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
