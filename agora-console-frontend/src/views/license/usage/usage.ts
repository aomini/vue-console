import Vue from 'vue'
import Component from 'vue-class-component'
import { LicensePidUsage, LicenseProductTotalUsage } from '@/models/licenseModels'
import LicenseTooltip from '@/views/license/LicenseTooltip'

@Component({
  components: {
    'license-tooltip': LicenseTooltip,
  },
  template: `
    <div class="page" v-loading="loading">
      <div class="mb-10">
        <a :href="licenseExportUrl" class="export-btn">{{ $t('ExportLicenseDetails') }}</a>
      </div>
      <el-tabs v-model="activeName" @tab-click="switchTab">
        <el-tab-pane
          v-for="item in lincenseProductList"
          :label="item"
          :name="item"
          class="category-content mb-20 mt-20"
        >
          <div class="bar-chart bar-chart--license d-flex justify-between">
            <div v-for="item in chartList" :key="item.title" class="flex-1 lg-card pb-2">
              <div class="heading-grey-05 mb-10">
                <span>{{ $t(item.title) }}</span>
                <el-tooltip v-if="item.tooltip" :content="$t(item.tooltip)" effect="light">
                  <i class="el-icon-info project-tooltip"></i>
                </el-tooltip>
              </div>
              <div class="heading-dark-04 lg-card__content" v-html="item.content"></div>
              <div class="heading-dark-04 lg-card__footer d-flex justify-between" v-if="item.expired">
                <span>{{ $t('Expired') }}</span>
                <span>{{ item.expired }}</span>
              </div>
            </div>
          </div>
          <div class="card">
            <el-table
              :data="pidUsageList"
              :default-sort="{ prop: 'date', order: 'descending' }"
              :empty-text='$t("UsageEmptyText")'
              class="license-table"
            >
              <el-table-column type="expand" width="50">
                <template slot-scope="scope">
                  <el-table :data="scope.row.vidStocks" class="license-table--expand">
                    <el-table-column label-class-name="table-title" width="50"></el-table-column>
                    <el-table-column
                      prop="projectName"
                      :label='$t("Project name")'
                      label-class-name="table-title"
                      width="280"
                    >
                      <template slot-scope="scope">
                        <span v-if="scope.row.projectName">{{ scope.row.projectName }} </span>
                        <span v-else> {{ $t('Unquoted') }} </span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="count" :label='$t("QuotedQuantity")' label-class-name="table-title">
                    </el-table-column>
                    <el-table-column prop="actives" :label='$t("Activated")' label-class-name="table-title">
                    </el-table-column>
                    <el-table-column prop="unActives" :label='$t("Inactivated")' label-class-name="table-title">
                    </el-table-column>
                    <el-table-column prop="expires" :label='$t("Expired")' label-class-name="table-title">
                    </el-table-column>
                    <el-table-column label-class-name="table-title"></el-table-column>
                  </el-table>
                </template>
              </el-table-column>
              <el-table-column
                prop="pid"
                :label='$t("PID")'
                label-class-name="table-title"
                class-name="table-content"
                width="280"
              >
                <template slot-scope="scope">
                  <license-tooltip
                    :product-sku-data="scope.row.productSku"
                    :quantity="scope.row.count"
                  ></license-tooltip>
                </template>
              </el-table-column>
              <el-table-column
                prop="count"
                :label='$t("Quantity")'
                label-class-name="table-title"
                class-name="table-content"
              >
              </el-table-column>
              <el-table-column
                prop="actives"
                :label='$t("Activated")'
                label-class-name="table-title"
                class-name="table-content"
              >
              </el-table-column>
              <el-table-column
                prop="unActives"
                :label='$t("Inactivated")'
                label-class-name="table-title"
                class-name="table-content"
              >
              </el-table-column>
              <el-table-column
                prop="allocate"
                :label='$t("Quoted")'
                label-class-name="table-title"
                class-name="table-content font-weight-bold"
              >
              </el-table-column>
              <el-table-column
                prop="unAllocate"
                :label='$t("Unquoted")'
                label-class-name="table-title"
                class-name="table-content font-weight-bold"
              >
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  `,
})
export default class Usage extends Vue {
  loading = false
  activeName = 'RTC'
  lincenseProductList = ['RTC', 'RTSA', 'FPA']
  chartList = [
    {
      title: 'License Overview',
      content: '0',
    },
    {
      title: 'Activated/Inactivated',
      content: '0',
      expired: '0',
    },
    {
      title: 'Quoted/Unquoted',
      content: '0',
    },
    {
      title: 'Expires with 30 Days',
      tooltip: 'ExpiresCardHint',
      content: '0',
    },
  ]
  usageData: { [key: string]: LicenseProductTotalUsage } | null = null
  pidUsageList: LicensePidUsage[] = []
  licenseExportUrl = '/api/v2/license/info/export'

  async mounted() {
    this.loading = true
    await this.prepareLicenseUsageData()
    this.renderChartList()
    this.loading = false
  }

  async prepareLicenseUsageData() {
    try {
      const ret = await this.$http.get('/api/v2/license/usage')
      this.usageData = ret.data as { [key: string]: LicenseProductTotalUsage }
      this.pidUsageList = this.usageData![this.activeName].pidList
    } catch (e) {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    }
  }

  switchTab(tab: any) {
    this.pidUsageList = this.usageData![tab.name].pidList
    this.renderChartList()
  }

  renderChartList() {
    const usageData = this.usageData![this.activeName]
    this.chartList[0].content = `${usageData.total}`
    this.chartList[1].content = `${usageData.actives} <span style="color: #8A8A9A">/ ${usageData.unActives}</span> `
    this.chartList[1].expired = `${usageData.expires}`
    this.chartList[2].content = `${usageData.allocate} <span style="color: #8A8A9A">/ ${usageData.unAllocate}</span> `
    this.chartList[3].content = `<span style="color: #FF8227">${usageData.inThirtyDays}</span>`
  }
}
