import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
const IconQuestion = require('@/assets/icon/icon-question.png')
import '../Usage.less'
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
      <div class="usage-title-box-with-remaining d-flex justify-between">
        <div>
          <div
            class="tab-button"
            v-if='settings.includes("Audience")'
            :class='{ "active-btn": true, "switch-btn": true }'
          >
            {{ $t('audience') }}
          </div>
          <el-tooltip :content='$t("UsageTooltip")' placement="top">
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
          :label='this.$t("date")'
          label-class-name="table-title"
          class-name="table-content"
          :sortable="true"
        >
        </el-table-column>
        <el-table-column
          prop="audio"
          :label='this.$t("Audio")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.audio | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          v-if='settings.includes("Separate SD")'
          prop="videoSD"
          :label='this.$t("VideoSD")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.videoSD | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="videoHD"
          :label='this.$t("VideoHD")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.videoHD | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="videoHDP"
          :label="this.$t('Video Total Duration(Full HD)')"
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.videoHDP | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="video2K"
          :label='this.$t("Video2K")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.video2K | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="video4K"
          :label='this.$t("Video2K+")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.video4K | formatUsage('usage') }}
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
        <div>{{ $t('TableExplain2') }}</div>
        <div>{{ $t('TableExplain3') }}</div>
        <div>{{ $t('TableExplain4') }}</div>
        <div>{{ $t('You can check the usage data collected within one year.') }}</div>
      </div>
    </div>
  `,
})
export default class DurationView extends Vue {
  loading = false
  condition: any = {
    type: undefined,
    intervalType: 1,
    fromTs: undefined,
    endTs: undefined,
    model: 'duration',
    vids: undefined,
    projectId: undefined,
    timeType: '1',
    timezoneOffset: new Date().getTimezoneOffset(),
  }
  isEmpty = false
  date: any = ''
  data: any = []
  daterange: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  settings: any = []
  dateOpt: any = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(12, 'months')
    },
  }
  user = user
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
    }
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
    let flatData = []
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    if (this.settings.includes('Separate SD')) {
      flatData = this.data.map((x: any) => [
        { date: moment(x.date).format(displayFormat), usage: x.standardAudioAudience, type: this.$t('Audio') },
        { date: moment(x.date).format(displayFormat), usage: x.standardSdAudience, type: this.$t('VideoSD') },
        { date: moment(x.date).format(displayFormat), usage: x.standardHdAudience, type: this.$t('VideoHD') },
        {
          date: moment(x.date).format(displayFormat),
          usage: x.standard1080pAudience,
          type: this.$t('Video Total Duration(Full HD)'),
        },
        { date: moment(x.date).format(displayFormat), usage: x.standard2kAudience, type: this.$t('Video2K') },
        { date: moment(x.date).format(displayFormat), usage: x.standard4kAudience, type: this.$t('Video2K+') },
      ])
    } else {
      flatData = this.data.map((x: any) => [
        { date: moment(x.date).format(displayFormat), usage: x.standardAudioAudience, type: this.$t('Audio') },
        {
          date: moment(x.date).format(displayFormat),
          usage: x.standardSdAudience + x.standardHdAudience,
          type: this.$t('VideoHD'),
        },
        {
          date: moment(x.date).format(displayFormat),
          usage: x.standard1080pAudience,
          type: this.$t('Video Total Duration(Full HD)'),
        },
        { date: moment(x.date).format(displayFormat), usage: x.standard2kAudience, type: this.$t('Video2K') },
        { date: moment(x.date).format(displayFormat), usage: x.standard4kAudience, type: this.$t('Video2K+') },
      ])
    }

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    let dataArray = []
    const { audioSum, videosdSum, videohdSum, videohdpSum, video2kSum, video4kSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          audioSum: pre.audioSum + cur.standardAudioAudience,
          videosdSum: pre.videosdSum + cur.standardSdAudience,
          videohdSum: pre.videohdSum + cur.standardHdAudience,
          videohdpSum: pre.videohdpSum + cur.standard1080pAudience,
          video2kSum: pre.video2kSum + cur.standard2kAudience,
          video4kSum: pre.video4kSum + cur.standard4kAudience,
        }
      },
      { audioSum: 0, videosdSum: 0, videohdSum: 0, videohdpSum: 0, video2kSum: 0, video4kSum: 0 }
    )

    const total = Math.max(audioSum + videosdSum + videohdSum + videohdpSum + video2kSum + video4kSum, 1)
    if (this.settings.includes('Separate SD')) {
      dataArray = [
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
          type: this.$t('Video Total Duration(Full HD)'),
          dataType: 'videoHDP',
          percentage: videohdpSum / total,
          value: videohdpSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '4',
          type: this.$t('Video2K'),
          dataType: 'video2K',
          percentage: video2kSum / total,
          value: video2kSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '5',
          type: this.$t('Video2K+'),
          dataType: 'video4K',
          percentage: video4kSum / total,
          value: video4kSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
      ]
    } else {
      dataArray = [
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
          type: this.$t('VideoHD'),
          dataType: 'videoHD',
          percentage: (videosdSum + videohdSum) / total,
          value: videosdSum + videohdSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '2',
          type: this.$t('Video Total Duration(Full HD)'),
          dataType: 'videoHDP',
          percentage: videohdpSum / total,
          value: videohdpSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '3',
          type: this.$t('Video2K'),
          dataType: 'video2K',
          percentage: video2kSum / total,
          value: video2kSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '4',
          type: this.$t('Video2K+'),
          dataType: 'video4K',
          percentage: video4kSum / total,
          value: video4kSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
      ]
    }
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
        const total =
          x.standardAudioAudience +
          x.standardSdAudience +
          x.standardHdAudience +
          x.standard1080pAudience +
          x.standard2kAudience +
          x.standard4kAudience
        if (this.settings.includes('Separate SD')) {
          return {
            date: x.date,
            audio: x.standardAudioAudience,
            videoSD: x.standardSdAudience,
            videoHD: x.standardHdAudience,
            videoHDP: x.standard1080pAudience,
            video2K: x.standard2kAudience,
            video4K: x.standard4kAudience,
            total: total,
          }
        } else {
          return {
            date: x.date,
            audio: x.standardAudioAudience,
            videoHD: x.standardSdAudience + x.standardHdAudience,
            videoHDP: x.standard1080pAudience,
            video2K: x.standard2kAudience,
            video4K: x.standard4kAudience,
            total: total,
          }
        }
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
    this.daterange = this.daterange || []
    this.daterange[0] = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : undefined
    this.daterange[1] = this.condition.endTs ? moment(this.condition.endTs * 1000) : undefined
    this.date = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : ''
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    this.settings = []
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting && projectSetting['Duration']) {
      this.settings = projectSetting['Duration'] || []
    }
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
