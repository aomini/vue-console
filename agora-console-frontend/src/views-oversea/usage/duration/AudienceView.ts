import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
import { user } from '@/services'
const PicCreate = require('@/assets/icon/pic-create.png')
import '../Usage.less'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'

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
        <el-table-column prop="date" :label='this.$t("date")' :sortable="true"> </el-table-column>
        <el-table-column prop="audio" :label='this.$t("audio")'>
          <template slot-scope="scope">
            {{ scope.row.audio | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          v-if='settings.includes("Separate SD")'
          prop="sd"
          :label='this.$t("sd")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.sd | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column prop="hd" :label='this.$t("hd")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            {{ scope.row.hd | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="hdp"
          :label='this.$t("Video Total Duration(Full HD)")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.hdp | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="video2k"
          :label='this.$t("Video2K")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.video2k | formatUsage('usage') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="video4k"
          :label='this.$t("Video2K+")'
          label-class-name="table-title"
          class-name="table-content"
        >
          <template slot-scope="scope">
            {{ scope.row.video4k | formatUsage('usage') }}
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
export default class AudienceView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  settings: any = []
  condition: any = {
    type: undefined,
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: 'duration',
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
    let flatData = []
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    if (this.settings.includes('Separate SD')) {
      flatData = this.data.map((x: any) => [
        { date: moment(x.date).format(displayFormat), usage: x.premiumAudioAudience, type: this.$t('audio') },
        { date: moment(x.date).format(displayFormat), usage: x.premiumSdAudience, type: this.$t('sd') },
        { date: moment(x.date).format(displayFormat), usage: x.premiumHdAudience, type: this.$t('hd') },
        {
          date: moment(x.date).format(displayFormat),
          usage: x.premium1080pAudience,
          type: this.$t('Video Total Duration(Full HD)'),
        },
        { date: moment(x.date).format(displayFormat), usage: x.premium2kAudience, type: this.$t('Video2K') },
        { date: moment(x.date).format(displayFormat), usage: x.premium4kAudience, type: this.$t('Video2K+') },
      ])
    } else {
      flatData = this.data.map((x: any) => [
        { date: moment(x.date).format(displayFormat), usage: x.premiumAudioAudience, type: this.$t('audio') },
        {
          date: moment(x.date).format(displayFormat),
          usage: x.premiumSdAudience + x.premiumHdAudience,
          type: this.$t('hd'),
        },
        {
          date: moment(x.date).format(displayFormat),
          usage: x.premium1080pAudience,
          type: this.$t('Video Total Duration(Full HD)'),
        },
        { date: moment(x.date).format(displayFormat), usage: x.premium2kAudience, type: this.$t('Video2K') },
        { date: moment(x.date).format(displayFormat), usage: x.premium4kAudience, type: this.$t('Video2K+') },
      ])
    }

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    let dataArray = []
    const { audioSum, sdSum, hdSum, hdpSum, video2kSum, video4kSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          audioSum: pre.audioSum + cur.premiumAudioAudience,
          sdSum: pre.sdSum + cur.premiumSdAudience,
          hdSum: pre.hdSum + cur.premiumHdAudience,
          hdpSum: pre.hdpSum + cur.premium1080pAudience,
          video2kSum: pre.video2kSum + cur.premium2kAudience,
          video4kSum: pre.video4kSum + cur.premium4kAudience,
        }
      },
      { audioSum: 0, sdSum: 0, hdSum: 0, hdpSum: 0, video2kSum: 0, video4kSum: 0 }
    )

    const total = Math.max(audioSum + sdSum + hdSum + hdpSum + video2kSum + video4kSum, 1)
    if (this.settings.includes('Separate SD')) {
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
        {
          index: '2',
          type: this.$t('hd'),
          dataType: 'videoHD',
          percentage: hdSum / total,
          value: hdSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '3',
          type: this.$t('Video Total Duration(Full HD)'),
          dataType: 'videoHDP',
          percentage: hdpSum / total,
          value: hdpSum,
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
          type: this.$t('audio'),
          dataType: 'voice',
          percentage: audioSum / total,
          value: audioSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '1',
          type: this.$t('hd'),
          dataType: 'videoHD',
          percentage: (sdSum + hdSum) / total,
          value: sdSum + hdSum,
          restName: this.$t('Rest'),
          content: this.$t('minutes'),
        },
        {
          index: '2',
          type: this.$t('Video Total Duration(Full HD)'),
          dataType: 'videoHDP',
          percentage: hdpSum / total,
          value: hdpSum,
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
          x.premiumAudioAudience +
          x.premiumSdAudience +
          x.premiumHdAudience +
          x.premium1080pAudience +
          x.premium2kAudience +
          x.premium4kAudience
        if (this.settings.includes('Separate SD')) {
          return {
            date: x.date,
            audio: x.premiumAudioAudience,
            sd: x.premiumSdAudience,
            hd: x.premiumHdAudience,
            hdp: x.premium1080pAudience,
            video2k: x.premium2kAudience,
            video4k: x.premium4kAudience,
            total: total,
          }
        } else {
          return {
            date: x.date,
            audio: x.premiumAudioAudience,
            hd: x.premiumSdAudience + x.premiumHdAudience,
            hdp: x.premium1080pAudience,
            video2k: x.premium2kAudience,
            video4k: x.premium4kAudience,
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
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    this.condition.timeType = this.$route.query.timeType || undefined
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting && projectSetting['Duration']) this.settings = projectSetting['Duration'] || []
  }

  create() {
    this.init()
    this.getUsageInfo()
  }
}
