import { CompanyProductLicenseQuotaResponse, LicenseVendorInfo } from '@/models/licenseModels'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {},
  template: `
    <el-dialog
      :title="$t('LicenseQuotaManage')"
      width="fit-content"
      top="5vh"
      :visible="dialogVisible"
      @update:visible="handleVisibleChange"
    >
      <div w:border="~ blue-200 rounded" w:p="y-8px x-8px" w:flex="~" w:align="items-center" w:bg="blue-50">
        <span class="iconfont iconjinggaotixing" w:text="base yellow-500"></span>
        <div w:text="base gray-500">
          【PID：{{ activeProductId }}】 {{ $t('AvailableLicenseCount') }}{{ unAllocate }}
        </div>
      </div>
      <div v-loading="loading" w:m="t-24px">
        <div w:p="y-8px x-16px" w:flex="~" w:align="items-center" w:bg="gray-50" w:text="base gray-500">
          <div w:w="3/10">{{ $t('Project Name') }}</div>
          <div w:w="2/10">{{ $t('InactivatedCount') }}</div>
          <div w:w="4/10">{{ $t('QuotedQuantity') }}</div>
          <div w:w="1/10">{{ $t('Action') }}</div>
        </div>
        <div
          v-for="(item, index) in vendorList"
          :key="item.id"
          w:h="40px"
          w:p="x-16px"
          w:flex="~"
          w:align="items-center"
          w:text="base gray-900"
        >
          <div w:w="3/10" w:text="truncate">{{ item.name }}</div>
          <div w:w="2/10">{{ item.unActiveCount }}</div>
          <div w:w="4/10">
            <el-input-number
              v-model="quotaList[index]"
              :min="0"
              :max="unAllocate"
              :step-strictly="true"
              :controls="false"
              :placeholder="$t('Please enter the quota quantity')"
              size="small"
            ></el-input-number>
          </div>
          <el-popover placement="top" width="314" trigger="manual" v-model="popoverVisibleList[index]">
            <div w:m="t-12px b-16px x-4px">
              {{ $t('After confirmation, the quota operation cannot be reversed, whether to confirm the quota.') }}
            </div>
            <div w:flex="~" w:justify="end">
              <el-button size="mini" type="text" @click="handlePopoverVisibleChange(index, false)">
                {{ $t('Cancel') }}
              </el-button>
              <el-button type="primary" size="mini" :loading="quotaLoading" @click="handleQuotaClick(item.id, index)">
                {{ $t('Confirm Quota') }}
              </el-button>
            </div>
            <div
              w:text="blue-500 hover:blue-300"
              w:cursor="pointer"
              slot="reference"
              @click="handlePopoverVisibleChange(index, true)"
            >
              {{ $t('Confirm') }}
            </div>
          </el-popover>
        </div>
        <el-pagination
          w:m="t-8px"
          w:border="t gray-100"
          w:flex="~"
          w:justify="center"
          :hide-on-single-page="true"
          layout="prev, pager, next"
          :total="vendorCount"
          :current-page.sync="currentPage"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </el-dialog>
  `,
})
export default class QuotaDialog extends Vue {
  @Prop({ default: false }) readonly dialogVisible!: boolean
  @Prop({ default: '' }) readonly activeProductId!: string

  loading = true
  quotaLoading = false
  unAllocate = 0
  vendorList: LicenseVendorInfo[] = []
  vendorCount = 0
  currentPage = 1
  quotaList = Array(10).fill(undefined)
  popoverVisibleList = Array(10).fill(false)

  @Watch('activeProductId', { immediate: false })
  async watchActiveProduct() {
    this.fetchActiveProduct()
  }

  async fetchActiveProduct() {
    try {
      this.loading = true
      const res = await this.$http.request<CompanyProductLicenseQuotaResponse>({
        url: `/api/v2/license/${this.activeProductId}/quota`,
        params: {
          page: this.currentPage,
        },
      })
      this.unAllocate = res.data.unAllocate
      this.vendorCount = res.data.vendorCount
      this.vendorList = res.data.vendorList
    } catch {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    } finally {
      this.loading = false
    }
  }

  handlePageChange() {
    this.fetchActiveProduct()
    this.quotaList = Array(10).fill(undefined)
    this.popoverVisibleList = Array(10).fill(false)
  }

  handleVisibleChange(visible: boolean) {
    this.currentPage = 1
    this.quotaList = Array(10).fill(undefined)
    this.popoverVisibleList = Array(10).fill(false)
    this.$emit('setVisible', visible)
  }

  validateQuota(index: number) {
    const count = this.quotaList[index]
    if (!count || count > this.unAllocate || count <= 0) {
      this.$message.warning(this.$t('Not within the quota range, please confirm and re quota') as string)
      return false
    }
    return true
  }

  handlePopoverVisibleChange(index: number, visible: boolean) {
    if (visible && !this.validateQuota(index)) return

    this.popoverVisibleList = Array(10).fill(false)
    this.popoverVisibleList.splice(index, 1, visible)
  }

  async handleQuotaClick(vid: number, index: number) {
    if (!this.validateQuota(index)) return

    try {
      const count = this.quotaList[index]
      const vendor = this.vendorList[index]
      this.quotaLoading = true

      await this.$http.request({
        method: 'POST',
        url: `/api/v2/license/quota`,
        data: {
          pid: this.activeProductId,
          vid,
          count,
        },
      })

      this.unAllocate -= count
      this.popoverVisibleList = Array(10).fill(false)
      this.quotaList.splice(index, 1, undefined)
      this.vendorList.splice(index, 1, { ...vendor, unActiveCount: vendor.unActiveCount + count })
      this.$emit('quotaCallback', count)
      this.$message.success(this.$t('Quota succeeded') as string)
    } catch (e) {
      this.$message.error((e as any)?.response?.data?.message || (this.$t('LicenseQuotaFailed') as string))
    } finally {
      this.quotaLoading = false
    }
  }
}
