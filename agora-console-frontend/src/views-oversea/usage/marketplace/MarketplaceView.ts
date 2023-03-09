import moment from 'moment'
import Vue from 'vue'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
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
      <line-chart v-if="!isEmpty" :data="lineData" class="mb-30"></line-chart>
      <el-table
        v-if="!isEmpty"
        :data="data"
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
        <el-table-column
          prop="usage"
          :label='this.$t("duration")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.usage }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!isEmpty" class="card mt-20">
        <div>{{ $t('TableExplain') }}</div>
        <div>{{ $t('TableExplain5') }}</div>
        <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
      </div>
    </div>
  `,
})
export default class MarketplaceView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  peakValue = 0
  lineData: any = []
  serviceName = ''
  condition: any = {
    fromTs: undefined,
    endTs: undefined,
    sku: '',
    vids: undefined,
    projectId: undefined,
  }
  PicCreate = PicCreate

  @Watch('$route')
  onRouteChange(to: any) {
    if (to.query.vids) {
      this.condition.vids = to.query.vids
      this.condition.projectId = to.query.projectId
      this.init()
    }
  }

  created() {
    this.init()
  }

  init() {
    this.serviceName = this.$route.params.serviceName
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    this.condition.sku = this.serviceName
    this.getUsageInfo()
  }

  getLineChartInfo() {
    const flatData = this.data.map((x: any) => {
      return [{ date: moment(x.date).format('MM-DD'), usage: x.usage, type: this.$t('duration'), format: 'channel' }]
    })
    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getFormatData(data: any) {
    const target: any = []
    const dateArr: any = [...new Set(data.map((item: any) => item.date))]
    dateArr.forEach((date: any) => {
      const arr = data.filter((keys: any) => keys.date === date)
      const sum = arr.reduce((a: any, b: any) => a + b.usage, 0)
      target.push({
        date: date,
        usage: sum,
      })
    })
    return target
  }

  async getUsageInfo() {
    this.loading = true
    try {
      const ret = await this.$http.get(`/api/v2/usage/usageInfo/vendor`, { params: Object.assign({}, this.condition) })
      this.data = this.getFormatData(ret.data)
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
}
