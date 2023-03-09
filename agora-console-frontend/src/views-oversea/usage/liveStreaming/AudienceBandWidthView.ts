import Vue from 'vue'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
import { user } from '@/services'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import '../Usage.less'
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
  },
  template: `
    <div v-loading="loading">
      <div class="text-center empty-content">
        <img v-if="isEmpty" width="400px" class="mx-auto my-2" :src="PicCreate" />
        <div v-if="isEmpty" class="mx-auto heading-grey-13 mt-20">{{ $t('NoUsage') }}</div>
      </div>
      <line-chart
        v-if="!isEmpty"
        :data="lineData"
        :peakValue="this.peakValue"
        :peakText='this.$t("peakText")'
        type="channels"
        valueType="kbps"
        class="mb-30"
      ></line-chart>
      <el-table
        v-if="!isEmpty"
        :data="data"
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
          prop="audienceStandardMax"
          :label='this.$t("audiencePeak")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.audienceStandardMax | formatUsage('bandwidth') }}
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
export default class AudienceBandWidthView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  peakValue = 0
  lineData: any = []
  settings: any = []
  condition: any = {
    type: undefined,
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: 'bandwidth',
    vids: undefined,
    projectId: undefined,
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
    this.peakValue = 0
    const flatData = this.data.map((x: any) => {
      if (this.peakValue < x.audienceStandardMax) {
        this.peakValue = x.audienceStandardMax
      }
      return [
        {
          date: moment(x.date).format('MM-DD'),
          usage: x.audienceStandardMax,
          type: this.$t('totalPeak'),
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
      if (this.condition.projectId === '0' && this.settings.includes('Standard Bandwidth')) {
        const ret = await this.$http.get(`/api/v2/usage/usageInfo`, {
          params: Object.assign({}, this.condition, { aggregate: 1 }),
        })
        const usageData = ret.data
        const usageObj: any = {}
        for (const data of usageData) {
          if (data.date in usageObj) {
            usageObj[data.date] = usageObj[data.date] + data.audienceStandardMax
          } else {
            usageObj[data.date] = data.audienceStandardMax
          }
        }
        const dataArray = []
        for (const date of Object.keys(usageObj)) {
          dataArray.push({ date, audienceStandardMax: usageObj[date] })
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
      this.getLineChartInfo()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  getSummaries(param: any) {
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
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting) this.settings = projectSetting['Standard Bandwidth'] || []
  }

  create() {
    this.init()
    this.getUsageInfo()
  }
}
