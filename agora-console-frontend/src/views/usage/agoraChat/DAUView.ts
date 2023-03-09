import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
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
      <line-chart
        v-if="!isEmpty"
        :data="lineData"
        :peakValue="this.peakValue"
        :peakText='this.$t("dau")'
        type="channels"
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
          prop="userDau"
          :label='this.$t("dau")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.userDau }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!isEmpty" class="card mt-20">
        <div>{{ $t('TableExplain') }}</div>
        <div>{{ $t('TableExplain6') }}</div>
      </div>
    </div>
  `,
})
export default class DAUView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  peakValue = 0
  lineData: any = []
  condition: any = {
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: 'duration',
    business: 'IMGEEK',
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
      if (this.peakValue < x.dau) {
        this.peakValue = x.dau
      }
      return [{ date: moment(x.date).format('MM-DD'), usage: x.userDau, type: this.$t('dau'), format: 'channel' }]
    })
    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
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
    this.getUsageInfo()
  }
  create() {
    this.init()
  }
}
