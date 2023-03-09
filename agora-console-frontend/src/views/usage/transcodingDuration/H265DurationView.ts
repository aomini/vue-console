import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
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
      <bar-chart v-if="!isEmpty" :data="barData" class="mb-60"> </bar-chart>
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
        <el-table-column prop="date" :label='$t("date")' :sortable="true"> </el-table-column>

        <el-table-column
          prop="hevcAudio"
          :label='$t("Audio")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.hevcAudio | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column prop="hevcSd" :label='$t("VideoSD")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            {{ scope.row.hevcSd | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column prop="hevcHd" :label='$t("VideoHD")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            {{ scope.row.hevcHd | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="hevcHdp"
          :label='$t("VideoHDP")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.hevcHdp | formatUsage('usage') }}
          </template>
        </el-table-column>

        <el-table-column
          prop="total"
          :label='$t("total")'
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
        <div>{{ $t('TableExplain3') }}</div>
        <div>{{ $t('TableExplain4') }}</div>
        <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
      </div>
    </div>
  `,
})
export default class H265DurationView extends Vue {
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
    model: 'transcoding',
    business: 'transcodeDuration',
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

  getLineChartInfo() {
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    const flatData = this.data.map((x: any) => [
      { date: moment(x.date).format(displayFormat), usage: x.hevcAudio, type: this.$t('Audio') },
      { date: moment(x.date).format(displayFormat), usage: x.hevcSd, type: this.$t('VideoSD') },
      { date: moment(x.date).format(displayFormat), usage: x.hevcHd, type: this.$t('VideoHD') },
      { date: moment(x.date).format(displayFormat), usage: x.hevcHdp, type: this.$t('VideoHDP') },
    ])
    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    const { audioSum, videosdSum, videohdSum, videohdpSum } = this.tableData.reduce(
      (pre: any, cur: any) => {
        return {
          audioSum: pre.audioSum + cur.hevcAudio,
          videosdSum: pre.videosdSum + cur.hevcSd,
          videohdSum: pre.videohdSum + cur.hevcHd,
          videohdpSum: pre.videohdpSum + cur.hevcHdp,
        }
      },
      { audioSum: 0, videosdSum: 0, videohdSum: 0, videohdpSum: 0 }
    )

    const total = Math.max(audioSum + videosdSum + videohdSum + videohdpSum, 1)
    const dataArray = [
      {
        index: '0',
        type: this.$t('Audio'),
        dataType: 'voice',
        percentage: audioSum / total,
        value: audioSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '1',
        type: this.$t('VideoSD'),
        dataType: 'videoSD',
        percentage: videosdSum / total,
        value: videosdSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '2',
        type: this.$t('VideoHD'),
        dataType: 'videoHD',
        percentage: videohdSum / total,
        value: videohdSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '3',
        type: this.$t('VideoHDP'),
        dataType: 'videoHDP',
        percentage: videohdpSum / total,
        value: videohdpSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
    ]
    this.barData = dataArray
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
      this.tableData = this.data.map((x: any) => {
        const total = x.hevcAudio + x.hevcSd + x.hevcHd + x.hevcHdp
        return Object.assign({}, x, { total: total })
      })

      this.getLineChartInfo()
      this.getBarChartInfo()
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

  init() {
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    this.condition.timeType = this.$route.query.timeType || undefined
  }
  create() {
    this.init()
    this.getUsageInfo()
  }
}
