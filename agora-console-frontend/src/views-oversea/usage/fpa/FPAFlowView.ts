import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import LineChart from '@/components/LineChart'
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
  },
  template: `
    <div v-loading="loading">
      <div class="usage-title-box cloud-title d-flex justify-between align-center">
        <div></div>
        <div class="float-right">
          <div class="d-flex align-center">
            <div
              class="heading-grey-13 mr-20 cursor-pointer"
              :class='{ "link": condition.intervalType === 0 }'
              @click="setDate(0)"
            >
              {{ $t('last7') }}
            </div>
            <div
              class="heading-grey-13 mr-20 cursor-pointer"
              :class='{ "link": condition.intervalType === 1 }'
              @click="setDate(1)"
            >
              {{ $t('last30') }}
            </div>
            <div
              class="heading-grey-13 mr-20 cursor-pointer"
              :class='{ "link": condition.intervalType === 2 }'
              @click="setDate(2)"
            >
              {{ $t('currentMonth') }}
            </div>
            <el-date-picker
              v-show='condition.timeType==="1"'
              :picker-options="dateOpt"
              @change="changeDate"
              class="ag-date-picker mr-2"
              size="small"
              v-model="daterange"
              type="daterange"
              :range-separator="$t('To')"
              :start-placeholder="$t('StartDate')"
              :end-placeholder="$t('EndDate')"
            >
            </el-date-picker>

            <el-date-picker
              v-show='condition.timeType==="2"'
              :picker-options="dateOpt"
              @change="changeDate"
              class="ag-date-picker mr-2 w-150"
              size="small"
              v-model="date"
            >
            </el-date-picker>
            <el-select v-model="condition.timeType" @change="setTimeType" class="w-100px" size="mini">
              <el-option :key="1" :label='$t("Daily")' value="1"> </el-option>
              <el-option :key="2" :label='$t("Hourly")' value="2"> </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="text-center empty-content">
        <img v-if="isEmpty" width="400px" class="mx-auto my-2" :src="PicCreate" />
        <div v-if="isEmpty" class="mx-auto heading-grey-13 mt-20">{{ $t('NoUsage') }}</div>
      </div>
      <line-chart
        v-if="!isEmpty"
        :data="lineData"
        :peakValue="this.peakValue"
        :peakText='this.$t("peakText")'
        class="mb-30"
      ></line-chart>
      <el-table
        v-if="!isEmpty"
        :data="tableData"
        stripe
        :default-sort="{ prop: 'date', order: 'descending' }"
        :empty-text='$t("UsageEmptyText")'
      >
        <el-table-column
          prop="date"
          :label='this.$t("date")'
          label-class-name="table-title"
          class-name="table-content"
          :sortable="true"
        >
        </el-table-column>
        <el-table-column :label='this.$t("upstreamTraffic")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            {{ scope.row.upstreamTraffic }}
          </template>
        </el-table-column>
        <el-table-column
          :label='this.$t("downstreamTraffic")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.downstreamTraffic }}
          </template>
        </el-table-column>
        <el-table-column
          :label='this.$t("sdkUpstreamTraffic")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.sdkUpstreamTraffic }}
          </template>
        </el-table-column>
        <el-table-column
          :label='this.$t("sdkDownstreamTraffic")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.sdkDownstreamTraffic }}
          </template>
        </el-table-column>
        <el-table-column :label='this.$t("total")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            {{ scope.row.total }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!isEmpty" class="card mt-20">
        <div>{{ $t('FPAExplain1') }}</div>
        <div>{{ $t('TableExplain3') }}</div>
        <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
      </div>
    </div>
  `,
})
export default class FPAFlowView extends Vue {
  condition: any = {
    intervalType: 1,
    fromTs: undefined,
    endTs: undefined,
    model: 'fpa',
    business: 'flow',
    vids: undefined,
    projectId: undefined,
    timeType: '1',
  }
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  settings: any = []
  peakValue = 0
  date: any = ''
  daterange: any = []
  dateOpt = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(3, 'months')
    },
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

  changeDate() {
    if (this.condition.timeType === '1') {
      if (!!this.daterange && this.daterange[0] && this.daterange[1]) {
        this.condition.fromTs = new Date(this.daterange[0]).getTime() / 1000
        this.condition.endTs = new Date(this.daterange[1]).getTime() / 1000
        this.condition.intervalType = -1
      }
    } else {
      if (this.date) {
        const dateTs = Date.UTC(this.date.getFullYear(), this.date.getMonth(), this.date.getDate())
        this.condition.fromTs = dateTs / 1000
        this.condition.endTs = dateTs / 1000
        this.condition.intervalType = -1
      }
    }
    this.$router.push({ query: Object.assign({}, this.condition) })
  }

  setDate(intervalType: number) {
    this.condition.timeType = '1'
    this.date = ''
    if (intervalType === 0) {
      const current = new Date()
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      const weekAgo = new Date(moment(todayDate).subtract(6, 'days') as any)
      this.condition.fromTs = weekAgo.getTime() / 1000
      this.condition.endTs = todayDate.getTime() / 1000
    } else if (intervalType === 1) {
      const current = new Date()
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      const monthAgo = new Date(moment(todayDate).subtract(1, 'months') as any)
      this.condition.fromTs = monthAgo.getTime() / 1000
      this.condition.endTs = todayDate.getTime() / 1000
    } else {
      const current = new Date()
      const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1)
      this.condition.fromTs = currentMonth.getTime() / 1000
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      this.condition.endTs = todayDate.getTime() / 1000
    }
    this.daterange = []
    this.daterange[0] = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : undefined
    this.daterange[1] = this.condition.endTs ? moment(this.condition.endTs * 1000) : undefined
    this.condition.intervalType = intervalType
    this.$router.push({ query: Object.assign({}, this.condition) })
  }

  async getUsageInfo() {
    this.loading = true
    try {
      const ret = await this.$http.get(`/api/v2/usage/usageInfo`, {
        params: Object.assign({}, this.condition),
      })
      this.data = ret.data
      console.info(this.data)
      if (this.data.length === 0) {
        this.isEmpty = true
        this.loading = false
        return
      } else {
        this.isEmpty = false
      }
      this.tableData = this.data.map((x: any) => {
        const total = x.upstreamTraffic + x.downstreamTraffic + x.sdkUpstreamTraffic + x.sdkDownstreamTraffic
        return Object.assign({}, x, { total: total })
      })
      this.getLineChartInfo()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  init() {
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.daterange = this.daterange || []
    this.daterange[0] = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : undefined
    this.daterange[1] = this.condition.endTs ? moment(this.condition.endTs * 1000) : undefined
    this.date = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : ''
    this.condition.vids = this.$route.query.vids
    this.condition.projectId = this.$route.query.projectId
    this.condition.timeType = this.$route.query.timeType || '1'
  }

  setTimeType(timeType: string) {
    this.condition.timeType = timeType
    if (timeType === '1') {
      this.setDate(0)
    } else if (timeType === '2') {
      const current = new Date()
      const todayDate = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())
      this.condition.fromTs = todayDate / 1000
      this.condition.endTs = todayDate / 1000
      this.daterange = []
      this.date = todayDate
      this.$router.push({ query: Object.assign({}, this.condition) })
    } else if (timeType === '3') {
      const current = new Date()
      const todayDate = Date.UTC(current.getFullYear(), current.getMonth())
      this.condition.fromTs = todayDate / 1000
      this.condition.endTs = todayDate / 1000
      this.daterange = []
      this.date = todayDate
      this.$router.push({ query: Object.assign({}, this.condition) })
    }
  }

  getLineChartInfo() {
    let flatData = []
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    flatData = this.data.map((x: any) => [
      {
        date: moment(x.date).format(displayFormat),
        usage: x.upstreamTraffic,
        type: this.$t('upstreamTraffic'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.downstreamTraffic,
        type: this.$t('downstreamTraffic'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.sdkUpstreamTraffic,
        type: this.$t('sdkUpstreamTraffic'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.sdkDownstreamTraffic,
        type: this.$t('sdkDownstreamTraffic'),
        format: 'channel',
      },
    ])

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    let dataArray = []
    const { audioSum, sdSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          audioSum: pre.audioSum + cur.upstreamTraffic,
          sdSum: pre.sdSum + cur.downstreamTraffic,
        }
      },
      { audioSum: 0, sdSum: 0 }
    )

    const total = Math.max(audioSum + sdSum, 1)
    dataArray = [
      {
        index: '0',
        type: this.$t('audio'),
        dataType: 'voice',
        percentage: audioSum / total,
        value: audioSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '1',
        type: this.$t('sd'),
        dataType: 'videoSD',
        percentage: sdSum / total,
        value: sdSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
    ]
    this.barData = dataArray
  }

  async create() {
    this.init()
    if ((!this.condition.fromTs || !this.condition.endTs) && this.condition.timeType !== '2') {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }
  }
}
