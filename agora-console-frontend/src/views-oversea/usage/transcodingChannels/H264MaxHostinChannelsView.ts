import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
import LineChart from '@/components/LineChart'
import { user } from '@/services'
const PicCreate = require('@/assets/icon/pic-create.png')
const PicDau = require('@/assets/icon/bandwidth-blue.png')
const PicDau1 = require('@/assets/icon/bandwidth-01.png')
const PicDau2 = require('@/assets/icon/bandwidth-02.png')
const PicDau3 = require('@/assets/icon/bandwidth-03.png')

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
      <div class="d-flex justify-between mb-20">
        <div class="flex-1 sm-card">
          <div class="text-center">
            <div class="d-flex justify-center align-center mb-10">
              <img :src="PicDau" width="30px" class="icon" />
              <div class="heading-light-03">{{ $t('audioHostin') }}</div>
            </div>
            <div class="heading-dark-01 mb-5">{{ audioHostinPeakValue | formatUsage('channels') }}</div>
            <div class="heading-light-03">channels</div>
          </div>
        </div>
        <div class="flex-1 sm-card">
          <div class="text-center">
            <div class="d-flex justify-center align-center mb-10">
              <img :src="PicDau1" width="30px" class="icon" />
              <div class="heading-light-03">{{ $t('VideoSD') }}</div>
            </div>
            <div class="heading-dark-01 mb-5">{{ avcSdPeakValue | formatUsage('channels') }}</div>
            <div class="heading-light-03">channels</div>
          </div>
        </div>
        <div class="flex-1 sm-card">
          <div class="text-center">
            <div class="d-flex justify-center align-center mb-10">
              <img :src="PicDau2" width="30px" class="icon" />
              <div class="heading-light-03">{{ $t('VideoHD') }}</div>
            </div>
            <div class="heading-dark-01 mb-5">{{ avcHdPeakValue | formatUsage('channels') }}</div>
            <div class="heading-light-03">channels</div>
          </div>
        </div>
        <div class="flex-1 sm-card">
          <div class="text-center">
            <div class="d-flex justify-center align-center mb-10">
              <img :src="PicDau3" width="30px" class="icon" />
              <div class="heading-light-03">{{ $t('VideoHDP') }}</div>
            </div>
            <div class="heading-dark-01 mb-5">{{ avcHdpPeakValue | formatUsage('channels') }}</div>
            <div class="heading-light-03">channels</div>
          </div>
        </div>
      </div>
      <line-chart v-if="!isEmpty" :data="lineData" class="mb-30"></line-chart>
      <el-table
        v-if="!isEmpty"
        :data="data"
        stripe
        :default-sort="{ prop: 'date', order: 'descending' }"
        :empty-text='$t("UsageEmptyText")'
        cell-class-name="text-truncate"
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
          prop="audioHostin"
          :label='this.$t("audioHostin")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.audioHostin | formatUsage('channels') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="avcSd"
          :label='this.$t("VideoSD")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.avcSd | formatUsage('channels') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="avcHd"
          :label='this.$t("VideoHD")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.avcHd | formatUsage('channels') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="avcHdp"
          :label='this.$t("VideoHDP")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.avcHdp | formatUsage('channels') }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!isEmpty" class="card mt-20">
        <div>{{ $t('TableExplain') }}</div>
        <div>{{ $t('TableExplain4') }}</div>
        <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
      </div>
    </div>
  `,
})
export default class H264MaxHostinChannelsView extends Vue {
  loading = false
  isEmpty = false
  audioHostinPeakValue = 0
  avcSdPeakValue = 0
  avcHdPeakValue = 0
  avcHdpPeakValue = 0
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  settings: any = []
  condition: any = {
    type: undefined,
    fromTs: undefined,
    endTs: undefined,
    model: 'transcoding',
    business: 'concurrentChannel',
    vids: undefined,
    projectId: undefined,
  }
  PicCreate = PicCreate
  PicDau = PicDau
  PicDau1 = PicDau1
  PicDau2 = PicDau2
  PicDau3 = PicDau3

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
    this.audioHostinPeakValue = 0
    this.avcSdPeakValue = 0
    this.avcHdPeakValue = 0
    this.avcHdpPeakValue = 0
    const flatData = this.data.map((x: any) => {
      if (x.audioHostin > this.audioHostinPeakValue) {
        this.audioHostinPeakValue = x.audioHostin
      }
      if (x.avcSd > this.avcSdPeakValue) {
        this.avcSdPeakValue = x.avcSd
      }
      if (x.avcHd > this.avcHdPeakValue) {
        this.avcHdPeakValue = x.avcHd
      }
      if (x.avcHdp > this.avcHdpPeakValue) {
        this.avcHdpPeakValue = x.avcHdp
      }
      return [
        { date: moment(x.date).format('MM-DD'), usage: x.audioHostin, type: this.$t('audioHostin'), format: 'channel' },
        { date: moment(x.date).format('MM-DD'), usage: x.avcSd, type: this.$t('VideoSD'), format: 'channel' },
        { date: moment(x.date).format('MM-DD'), usage: x.avcHd, type: this.$t('VideoHD'), format: 'channel' },
        { date: moment(x.date).format('MM-DD'), usage: x.avcHdp, type: this.$t('VideoHDP'), format: 'channel' },
      ]
    })
    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  async getUsageInfo() {
    this.loading = true
    try {
      if (this.condition.projectId === '0' && this.settings.includes('Channels Aggregate')) {
        const ret = await this.$http.get(`/api/v2/usage/usageInfo`, {
          params: Object.assign({}, this.condition, { aggregate: 1 }),
        })
        const usageData = ret.data
        const usageObj: any = {}
        for (const data of usageData) {
          if (data.date in usageObj) {
            usageObj[data.date] = {
              audioHostin: usageObj[data.date].audioHostin + data.audioHostin,
              avcSd: usageObj[data.date].avcSd + data.avcSd,
              avcHd: usageObj[data.date].avcHd + data.avcHd,
              avcHdp: usageObj[data.date].avcHdp + data.avcHdp,
            }
          } else {
            usageObj[data.date] = {
              audioHostin: data.audioHostin,
              avcSd: data.avcSd,
              avcHd: data.avcHd,
              avcHdp: data.avcHdp,
            }
          }
        }
        const dataArray = []
        for (const date of Object.keys(usageObj)) {
          dataArray.push({
            date,
            audioHostin: usageObj[date].audioHostin,
            avcSd: usageObj[date].avcSd,
            avcHd: usageObj[date].avcHd,
            avcHdp: usageObj[date].avcHdp,
          })
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

  getMax(param: any) {
    const { columns, data } = param
    const max: any = []
    columns.forEach((column: any, index: any) => {
      if (index === 0) {
        max[index] = this.$t('max')
        return
      }
      const values = data.map((item: any) => Number(item[column.property]))
      if (!values.every((value: any) => isNaN(value))) {
        max[index] = (this.$options as any).filters.formatUsage(Math.max(...values), 'channels')
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
    if (projectSetting) this.settings = projectSetting['Transcoding'] || []
  }

  create() {
    this.init()
    this.getUsageInfo()
  }
}
