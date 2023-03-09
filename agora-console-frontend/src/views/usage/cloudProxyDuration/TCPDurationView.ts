import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import { BusinessEnum, MeterModelEnum } from '@/views/usage/Constant'
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-loading="loading">
      <div class="text-center empty-content">
        <img v-if="isEmpty" width="400px" class="mx-auto my-2" :src="PicCreate" />
        <div v-if="isEmpty" class="mx-auto heading-grey-13 mt-20">{{ $t('NoUsage') }}</div>
      </div>
      <bar-chart v-if="!isEmpty" :data="barData" class="mb-60"></bar-chart>
      <line-chart v-if="!isEmpty" :data="lineData" class="mb-30"></line-chart>

      <el-table
        v-if="!isEmpty"
        :data="tableData"
        stripe
        :default-sort="{ prop: 'date', order: 'descending' }"
        :empty-text='$t("UsageEmptyText")'
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column
          prop="date"
          :label='this.$t("date")'
          label-class-name="table-title"
          class-name="table-content"
          :sortable="true"
        >
        </el-table-column>
        <el-table-column
          prop="tcpAudio"
          :label='this.$t("sku_tcpAudio")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.tcpAudio | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="tcpHd"
          :label='this.$t("sku_tcpHd")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.tcpHd | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="tcp1080p"
          :label='this.$t("sku_tcp1080p")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.tcp1080p | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="tcp2k"
          :label='this.$t("sku_tcp2k")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.tcp2k | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="tcp4k"
          :label='this.$t("sku_tcp4k")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.tcp4k | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total"
          :label='this.$t("total")'
          label-class-name="table-title"
          class-name="table-content font-weight-bold"
        >
          <template slot-scope="scope">
            {{ scope.row.total | formatUsage('usage') }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!isEmpty" class="card mt-20">
        <div>{{ $t('TableHourExplain') }}</div>
        <div>
          {{ $t('TableExplain3_Front') }}
          <a href="https://docs.agora.io/en/Interactive%20Broadcast/billing_rtc?platform=Android" target="_blank">
            {{ $t('TableExplain3_Doc') }}
          </a>
          {{ $t('TableExplain3_Tail') }}
        </div>
        <div>{{ $t('TableExplain4') }}</div>
        <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
      </div>
    </div>
  `,
})
export default class TCPDurationView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  settings: any = []
  condition: any = {
    type: 0,
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: MeterModelEnum.Duration,
    business: BusinessEnum.CloudProxy,
    vids: undefined,
    projectId: undefined,
    timeType: '1',
    timezoneOffset: new Date().getTimezoneOffset(),
  }
  PicCreate = PicCreate

  @Watch('$route')
  onRouteChange(to: any) {
    if (to.query.vids) {
      this.condition.vids = to.query.vids
      this.condition.projectId = to.query.projectId
      this.create()
    }
  }

  created() {
    this.create()
  }

  setTable() {
    this.tableData = this.data.map((x: any) => {
      const total = x.tcpAudio + x.tcpHd + x.tcp1080p + x.tcp2k + x.tcp4k
      return Object.assign({}, x, { total: total })
    })
  }

  setLineChart() {
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    const flatData = this.data.map((x: any) => [
      { date: moment(x.date).format(displayFormat), usage: x.tcpAudio, type: this.$t('sku_tcpAudio') },
      { date: moment(x.date).format(displayFormat), usage: x.tcpHd, type: this.$t('sku_tcpHd') },
      { date: moment(x.date).format(displayFormat), usage: x.tcp1080p, type: this.$t('sku_tcp1080p') },
      { date: moment(x.date).format(displayFormat), usage: x.tcp2k, type: this.$t('sku_tcp2k') },
      { date: moment(x.date).format(displayFormat), usage: x.tcp4k, type: this.$t('sku_tcp4k') },
    ])
    this.lineData = [].concat(...flatData)
  }

  setBarChart() {
    const { tcpAudioSum, tcpHdSum, tcp1080pSum, tcp2kSum, tcp4kSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          tcpAudioSum: pre.tcpAudioSum + cur.tcpAudio,
          tcpHdSum: pre.tcpHdSum + cur.tcpHd,
          tcp1080pSum: pre.tcp1080pSum + cur.tcp1080p,
          tcp2kSum: pre.tcp2kSum + cur.tcp2k,
          tcp4kSum: pre.tcp4kSum + cur.tcp4k,
        }
      },
      { tcpAudioSum: 0, tcpHdSum: 0, tcp1080pSum: 0, tcp2kSum: 0, tcp4kSum: 0 }
    )

    const total = Math.max(tcpAudioSum + tcpHdSum + tcp1080pSum + tcp2kSum + tcp4kSum, 1)
    this.barData = [
      {
        index: '0',
        type: this.$t('sku_udpAudio'),
        dataType: 'audio',
        percentage: tcpAudioSum / total,
        value: tcpAudioSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '1',
        type: this.$t('sku_tcpHd'),
        dataType: 'videoHD',
        percentage: tcpHdSum / total,
        value: tcpHdSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '2',
        type: this.$t('sku_tcp1080p'),
        dataType: 'videoHDP',
        percentage: tcp1080pSum / total,
        value: tcp1080pSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '3',
        type: this.$t('sku_tcp2k'),
        dataType: 'video2K',
        percentage: tcp2kSum / total,
        value: tcp2kSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '4',
        type: this.$t('sku_tcp4k'),
        dataType: 'video4K',
        percentage: tcp4kSum / total,
        value: tcp4kSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
    ]
  }

  async getUsageInfo() {
    this.loading = true
    try {
      const ret = await this.$http.get(`/api/v2/usage/usageInfo`, { params: Object.assign({}, this.condition) })
      this.data = ret.data
      if (this.data.length === 0) {
        this.isEmpty = true
        this.loading = false
        return
      } else {
        this.isEmpty = false
      }
      this.setTable()
      this.setLineChart()
      this.setBarChart()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  getSummaries(param: any) {
    const { columns, data } = param
    const sums: any = []
    columns.forEach((column: any, index: any) => {
      if (index === 0) {
        sums[index] = this.$t('total')
        return
      }
      const values = data.map((item: any) => Number(item[column.property]))
      if (!values.every((value: any) => isNaN(value))) {
        sums[index] = (this.$options.filters as any).formatUsage(
          values.reduce((prev: any, curr: any) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0),
          'usage'
        )
      } else {
        sums[index] = 'N/A'
      }
    })
    return sums
  }

  create() {
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    this.condition.timeType = this.$route.query.timeType || undefined
    this.getUsageInfo()
  }
}
