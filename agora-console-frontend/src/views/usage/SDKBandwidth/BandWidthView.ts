import Vue from 'vue'
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
const IconQuestion = require('@/assets/icon/icon-question.png')
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div>
      <div class="usage-title-box-with-remaining d-flex justify-between">
        <div class="d-flex align-center">
          <div class="d-inline-block mr-3 page-title">{{ $t('Bandwidth') }}</div>
          <el-tooltip :content='$t("UsageTooltip")' placement="top" class="ml-5">
            <img class="ml-3" width="15" :src="IconQuestion" alt="" />
          </el-tooltip>
        </div>
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
        :peakText='this.$t("maxBandwidth")'
        type="channels"
        valueType="kbps"
        class="mb-30"
      ></line-chart>

      <el-table
        v-if="!isEmpty"
        :data="tableData"
        stripe
        :default-sort="{ prop: 'date', order: 'descending' }"
        :empty-text='$t("UsageEmptyText")'
        show-summary
        :summary-method="getMax"
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
          prop="audienceMax"
          :label='this.$t("maxBandwidth")'
          label-class-name="table-title"
          class-name="table-content font-weight-bold"
        >
          <template slot-scope="scope">
            {{ scope.row.audienceMax | formatUsage('bandwidth') }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!isEmpty" class="card mt-20">
        <div>{{ $t('TableExplain') }}</div>
        <div>{{ $t('TableExplain2') }}</div>
        <div>{{ $t('TableExplain4') }}</div>
        <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
      </div>
    </div>
  `,
})
export default class BandWidthView extends Vue {
  condition: any = {
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: 'bandwidth',
    business: 'recording',
    vids: undefined,
    projectId: undefined,
  }
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  settings: any = []
  peakValue = 0
  daterange: any = []
  dateOpt = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(3, 'months')
    },
  }
  IconQuestion = IconQuestion
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

  async setType(type: string) {
    this.condition.type = type
    this.$router.push({ name: 'usage.bandwidth.' + this.condition.type, query: Object.assign({}, this.condition) })
  }

  changeDate() {
    if (!!this.daterange && this.daterange[0] && this.daterange[1]) {
      this.condition.fromTs = new Date(this.daterange[0]).getTime() / 1000
      this.condition.endTs = new Date(this.daterange[1]).getTime() / 1000
      this.condition.intervalType = -1
    }
    this.$router.push({ query: Object.assign({}, this.condition) })
  }

  setDate(intervalType: number) {
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

  getLineChartInfo() {
    this.peakValue = 0
    const flatData = this.data.map((x: any) => {
      if (this.peakValue < x.audienceMax) {
        this.peakValue = x.audienceMax
      }
      return [
        {
          date: moment(x.date).format('MM-DD'),
          usage: x.audienceMax,
          type: this.$t('maxBandwidth'),
          format: 'channel',
        },
      ]
    })
    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  async getUsageInfo() {
    this.loading = true
    try {
      if (this.condition.projectId === '0' && this.settings.includes('SDK Aggregate')) {
        const ret = await this.$http.get(`/api/v2/usage/usageInfo`, {
          params: Object.assign({}, this.condition, { aggregate: 1 }),
        })
        const usageData = ret.data
        const usageObj: any = {}
        for (const data of usageData) {
          if (data.date in usageObj) {
            usageObj[data.date] = usageObj[data.date] + data.audienceMax
          } else {
            usageObj[data.date] = data.audienceMax
          }
        }
        const dataArray = []
        for (const date of Object.keys(usageObj)) {
          dataArray.push({ date, audienceMax: usageObj[date] })
        }
        this.data = dataArray
      } else {
        const ret = await this.$http.get(`/api/v2/usage/usageInfo`, { params: Object.assign({}, this.condition) })
        this.data = ret.data
      }
      if (this.data.length === 0) {
        this.isEmpty = true
        this.loading = false
        return
      } else {
        this.isEmpty = false
      }
      this.tableData = this.data
      this.getLineChartInfo()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  getMax(param: any) {
    const { columns, data } = param
    const max: any = []
    columns.forEach((column: any, index: number) => {
      if (index === 0) {
        max[index] = this.$t('max')
        return
      }
      const values = data.map((item: any) => Number(item[column.property]))
      if (!values.every((value: any) => isNaN(value))) {
        max[index] = (this.$options.filters as any).formatUsage(Math.max(...values), 'bandwidth')
      } else {
        max[index] = 'N/A'
      }
    })
    return max
  }
  init() {
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.daterange = this.daterange || []
    this.daterange[0] = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : undefined
    this.daterange[1] = this.condition.endTs ? moment(this.condition.endTs * 1000) : undefined
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting) {
      this.settings = projectSetting['Recording SDK'] || []
      this.settings = this.settings.filter((x: any) => x !== 'Separate SD')
    }
    if (this.settings.length === 0) {
      this.$router.push({
        name: 'usage.duration',
        query: Object.assign({}, { vids: this.condition.vids, projectId: this.condition.projectId }),
      })
    }
    if (this.settings.includes(this.$route.query.type)) {
      this.condition.type = this.$route.query.type
    } else {
      this.condition.type = this.settings[0]
    }
  }

  create() {
    this.init()
    if (!this.condition.fromTs || !this.condition.endTs) {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }
  }
}
