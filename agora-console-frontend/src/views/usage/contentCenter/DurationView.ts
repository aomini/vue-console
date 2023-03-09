import Vue from 'vue'
import moment from 'moment'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import { RouteRecord } from 'vue-router/types/router'
const IconSetting = require('@/assets/icon/icon-setting.png')
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-loading="loading" class="cloud-container">
      <div>
        <div class="usage-title-box cloud-title d-flex justify-between align-center">
          <div class="d-inline-block mr-3 page-title">{{ $t('ContentCenterUsageTitle') }}</div>
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
          <el-table-column
            prop="date"
            :label='$t("date")'
            label-class-name="table-title"
            class-name="table-content"
            :sortable="true"
          >
          </el-table-column>
          <el-table-column
            prop="count"
            :label='$t("Content Center Duraion")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.count }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!isEmpty" class="card mt-20">
          <div>{{ $t('TableExplain2') }}</div>
          <div>{{ $t('TableExplain1') }}</div>
          <div>
            {{ $t('KTVBillingExplain') }} <a :href="$t('KTVBllingUrl')" target="_blank">{{ $t('billing FAQ') }}</a>
          </div>
          <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
        </div>
      </div>
    </div>
  `,
})
export default class DurationView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  condition: any = {
    type: 0,
    fromTs: undefined,
    endTs: undefined,
    intervalType: 0,
    model: 'counter',
    business: 'ktv',
    vids: undefined,
    timeType: '1',
    timezoneOffset: new Date().getTimezoneOffset(),
  }
  date: any = ''
  daterange: any = []
  dateOpt = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(3, 'months')
    },
  }
  user = user
  IconSetting = IconSetting
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

  getSummaries(param: any) {
    const { columns, data } = param
    const sums: any = []
    columns.forEach((column: any, index: number) => {
      if (index === 0) {
        sums[index] = this.$t('total')
        return
      }
      const values = data.map((item: any) => Number(item[column.property]))
      if (!values.every((value: any) => isNaN(value))) {
        sums[index] = values.reduce((prev: any, curr: any) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            return prev + curr
          } else {
            return prev
          }
        }, 0)
      } else {
        sums[index] = 'N/A'
      }
    })
    return sums
  }

  changeDate() {
    if (this.condition.timeType === '1') {
      if (!!this.daterange && this.daterange[0] && this.daterange[1]) {
        this.condition.fromTs = new Date(this.daterange[0]).getTime() / 1000
        this.condition.endTs = new Date(this.daterange[1]).getTime() / 1000
        this.condition.intervalType = -1
      }
    } else if (this.condition.timeType === '3') {
      const dateTs = Date.UTC(this.date.getFullYear(), this.date.getMonth())
      this.condition.fromTs = dateTs / 1000
      this.condition.endTs = dateTs / 1000
      this.condition.intervalType = -1
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

  init() {
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.daterange = this.daterange || []
    this.daterange[0] = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : undefined
    this.daterange[1] = this.condition.endTs ? moment(this.condition.endTs * 1000) : undefined
    this.date = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : ''
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
  }

  setDate(type: number) {
    this.condition.timeType = '1'
    this.date = ''
    if (type === 0) {
      const current = new Date()
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      const weekAgo = new Date(moment(todayDate).subtract(6, 'days') as any)
      this.condition.fromTs = weekAgo.getTime() / 1000
      this.condition.endTs = todayDate.getTime() / 1000
    } else if (type === 1) {
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
    this.condition.intervalType = type
    this.$router.push({ query: Object.assign({}, this.condition) })
  }

  getLineChartInfo() {
    let displayFormat = 'MM-DD'
    if (this.condition.timeType === '2') {
      displayFormat = 'HH:00'
    } else if (this.condition.timeType === '3') {
      displayFormat = 'YYYY-MM'
    }
    const flatData = this.data.map((x: any) => [
      {
        date: moment(x.date).format(displayFormat),
        usage: x.count,
        type: this.$t('Content Center Duraion'),
        format: 'channel',
      },
    ])

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    const { audioSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          audioSum: pre.audioSum + cur.count,
        }
      },
      { audioSum: 0 }
    )

    const total = Math.max(audioSum, 1)
    const dataArray = [
      {
        index: '0',
        type: this.$t('ContentCenterUsageTitle'),
        dataType: 'contentCenter',
        percentage: audioSum / total,
        value: audioSum,
        restName: this.$t('Rest'),
        content: this.$t('Content Center Duraion'),
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
        let total = 0
        total = x.count
        return { date: x.date, count: x.count, total: total }
      })
      this.getLineChartInfo()
      this.getBarChartInfo()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  async create() {
    this.init()
    this.changeBreadcrumb()
    if ((!this.condition.fromTs || !this.condition.endTs) && this.condition.timeType !== '2') {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: 'Usage',
        },
      },
      {
        path: this.$route.fullPath,
        meta: {
          breadcrumb: 'ContentCenterUsageTitle',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
