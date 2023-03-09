import Vue from 'vue'
import moment from 'moment'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import { RouteRecord } from 'vue-router/types/router'

const IconSetting = require('@/assets/icon/icon-setting.png')
const IconQuestion = require('@/assets/icon/icon-question.png')
const PicLocked = require('@/assets/icon/pic-locked.png')
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-loading="loading" class="cloud-container">
      <div class="remaining-usage-tip" v-if="remainingUsagePermission">
        <div class="remaining-usage">
          <div class="remaining-usage-btn">
            <el-tooltip :content='$t("packageRemainingTooltip")' placement="top" effect="light">
              <img width="15" :style='{ marginRight: "5px" }' class="vertical-middle t-1" :src="IconQuestion" alt="" />
            </el-tooltip>
            <span>{{ $t('packageRemaining', { amount: totalRemainingUsage.toLocaleString() }) }} </span>
            <span
              class="heading-dark-13 float-right d-flex align-center hover-link vertical-middle"
              @click="goToPackageManagement"
            >
              <span class="">{{ $t('packageManagement') }}</span>
              <i class="iconfont iconicon-go f-18"></i>
            </span>
          </div>

          <div class="remaining-usage-box border">
            <div class="heading-grey-14 mb-10">{{ $t('remainingMins') }}</div>
            <div class="my-1">
              {{
                $t('audioRemaining', {
                  amount: remainingMinutes['Audio'] ? remainingMinutes['Audio'].toLocaleString() : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('videoHdRemaining', {
                  amount: remainingMinutes['Video(HD)'] ? remainingMinutes['Video(HD)'].toLocaleString() : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('fullHDRemaining', {
                  amount: remainingMinutes['Video Total Duration(Full HD)']
                    ? remainingMinutes['Video Total Duration(Full HD)'].toLocaleString()
                    : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('hd2kRemaining', {
                  amount: remainingMinutes['Video Total Duration(2K)']
                    ? remainingMinutes['Video Total Duration(2K)'].toLocaleString()
                    : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('hd4kRemaining', {
                  amount: remainingMinutes['Video Total Duration(2K+)']
                    ? remainingMinutes['Video Total Duration(2K+)'].toLocaleString()
                    : 0
                })
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="text-center empty-content" v-if="!uapOpen && !configLoading">
        <img width="400px" class="mx-auto my-2" :src="PicLocked" />
        <div class="mx-auto heading-grey-13 mt-20">
          {{ $t('CloudOpenHint') }}
        </div>
        <div class="apply-line mt-20">
          <console-button class="console-btn-primary" @click="jumpSetting">{{ $t('CloudApplyButton') }}</console-button>
        </div>
      </div>
      <div v-if="uapOpen">
        <div class="usage-title-box-with-remaining d-flex justify-between">
          <div class="d-flex align-center">
            <div class="d-inline-block mr-3 page-title">{{ $t('CloudTitle') }}</div>
            <img
              :src="IconSetting"
              v-if="uapOpen&&condition.projectId!=='0'"
              @click="jumpSetting"
              class="w-26 ml-5 cursor-pointer"
            />
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
        <bar-chart v-if="!isEmpty" :data="barData" class="mb-60"></bar-chart>
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
            prop="audioNoTrans"
            :label='this.$t("AudioNoTrans")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.audioNoTrans | formatUsage('usage') }}
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
            :label='this.$t("VideoHDP")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.videoHDP | formatUsage('usage') }}
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
          <div>{{ $t('TableExplain4') }}</div>
          <div>{{ $t('CloudHint') }}</div>
          <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
        </div>
      </div>
    </div>
  `,
})
export default class CloudRecordingView extends Vue {
  loading = false
  applyLoading = false
  configLoading = false
  isEmpty = false
  data: any = []
  dataExt: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  uapOpen = false
  uapSetting: any = undefined
  condition: any = {
    type: 0,
    fromTs: undefined,
    endTs: undefined,
    intervalType: 0,
    model: 'duration',
    business: 'cloudrecording',
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
  remainingMinutes: any = {}
  totalRemainingUsage = 0
  IconSetting = IconSetting
  IconQuestion = IconQuestion
  PicLocked = PicLocked
  PicCreate = PicCreate

  @Watch('$route')
  onRouteChange(to: any) {
    if (to.query.vids) {
      this.condition.vids = to.query.vids
      this.condition.projectId = to.query.projectId
      this.create()
    }
  }

  get remainingUsagePermission() {
    return this.user.info.company.area === 'CN' && this.user.info.permissions['FinanceCenter'] > 0
  }

  created() {
    this.create()
    this.changeBreadcrumb()
  }

  goToPackageManagement() {
    this.$router.push({ name: 'package.myMinPackage' })
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

  setTable() {
    let tableData: any[] = []
    if (this.dataExt.length === this.data.length) {
      for (let i = 0; i < this.data.length; i++) {
        const origin = this.data[i]
        const audioNoTrans = this.dataExt[i]
        if (origin.date !== audioNoTrans.date) continue
        const total = origin.audioAll + origin.sdAll + origin.hdAll + origin.hdpAll + audioNoTrans.audioAll
        tableData.push({
          date: origin.date,
          audio: origin.audioAll,
          audioNoTrans: audioNoTrans.audioAll,
          videoHD: origin.sdAll + origin.hdAll,
          videoHDP: origin.hdpAll,
          total: total,
        })
      }
    } else {
      tableData = this.data.map((x: any) => {
        const total = x.audioAll + x.sdAll + x.hdAll + x.hdpAll
        return { date: x.date, audio: x.audioAll, videoHD: x.sdAll + x.hdAll, videoHDP: x.hdpAll, total: total }
      })
    }
    this.tableData = tableData
  }

  setLineChart() {
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    let lineChartData: any[] = []
    if (this.dataExt.length === this.data.length) {
      for (let i = 0; i < this.data.length; i++) {
        const origin = this.data[i]
        const audioNoTrans = this.dataExt[i]
        if (origin.date !== audioNoTrans.date) continue
        lineChartData.push([
          { date: moment(origin.date).format(displayFormat), usage: origin.audioAll, type: this.$t('Audio') },
          {
            date: moment(origin.date).format(displayFormat),
            usage: audioNoTrans.audioAll,
            type: this.$t('AudioNoTrans'),
          },
          {
            date: moment(origin.date).format(displayFormat),
            usage: origin.sdAll + origin.hdAll,
            type: this.$t('VideoHD'),
          },
          { date: moment(origin.date).format(displayFormat), usage: origin.hdpAll, type: this.$t('VideoHDP') },
        ])
      }
    } else {
      lineChartData = this.data.map((x: any) => [
        { date: moment(x.date).format(displayFormat), usage: x.audioAll, type: this.$t('Audio') },
        { date: moment(x.date).format(displayFormat), usage: x.sdAll + x.hdAll, type: this.$t('VideoHD') },
        { date: moment(x.date).format(displayFormat), usage: x.hdpAll, type: this.$t('VideoHDP') },
      ])
    }

    this.lineData = [].concat(...lineChartData)
  }

  setBarChart() {
    const { audioSum, videosdSum, videohdSum, videohdpSum } = this.data.reduce(
      (total: any, cur: any) => ({
        audioSum: total.audioSum + cur.audioAll,
        videosdSum: total.videosdSum + cur.sdAll,
        videohdSum: total.videohdSum + cur.hdAll,
        videohdpSum: total.videohdpSum + cur.hdpAll,
      }),
      { audioSum: 0, videosdSum: 0, videohdSum: 0, videohdpSum: 0 }
    )
    const { audioNoTransSum } = this.dataExt.reduce(
      (total: any, cur: any) => ({
        audioNoTransSum: total.audioNoTransSum + cur.audioAll,
      }),
      { audioNoTransSum: 0 }
    )

    const total = Math.max(audioSum + videosdSum + videohdSum + videohdpSum + audioNoTransSum, 1)
    const barChartData = [
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
        type: this.$t('AudioNoTrans'),
        dataType: 'audioNoTrans',
        percentage: audioNoTransSum / total,
        value: audioNoTransSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '2',
        type: this.$t('VideoHD'),
        dataType: 'videoHD',
        percentage: (videosdSum + videohdSum) / total,
        value: videosdSum + videohdSum,
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
    this.barData = barChartData
  }

  async getUsageInfo() {
    this.loading = true
    try {
      const [ret1, ret2] = await Promise.all([
        this.$http.get(`/api/v2/usage/usageInfo`, { params: Object.assign({}, this.condition) }),
        this.$http.get(`/api/v2/usage/usageInfo`, {
          params: Object.assign({}, this.condition, {
            model: 'duration',
            business: 'recording_no_trans',
          }),
        }),
      ])
      this.data = ret1.data
      this.dataExt = ret2.data
      if (this.data.length === 0) {
        this.isEmpty = true
        this.loading = false
        return
      } else {
        this.isEmpty = false
      }
      this.setTable()
      this.setLineChart()
      this.setBarChart()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
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

  async getUapSetting() {
    if (this.$route.query.projectId && this.$route.query.projectId !== '0') {
      try {
        this.loading = true
        this.configLoading = true
        const ret = await this.$http.get(`/api/v2/usage/uap/setting`, {
          params: { vids: this.condition.vids, cloudTypeId: 7 },
        })
        this.loading = false
        this.configLoading = false
        if (ret.data) {
          this.uapSetting = ret.data
          if (this.uapSetting.status === 1) {
            this.uapOpen = true
          }
        }
      } catch (e) {
        this.loading = false
        this.configLoading = false
      }
    } else {
      this.uapOpen = true
    }
  }

  jumpSetting() {
    this.$router.push({
      name: 'usage.cloudRecording.Duration.setting',
      query: { vids: this.condition.vids, projectId: this.condition.projectId },
    })
  }
  JumpBilling() {
    this.$router.push({ path: '/finance/billing' })
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

  async create() {
    this.uapOpen = false
    this.uapSetting = undefined
    this.init()
    await this.getUapSetting()
    if ((!this.condition.fromTs || !this.condition.endTs) && this.condition.timeType !== '2') {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }

    try {
      const getRemainingMinutes = await this.$http.get(`/api/v2/usage/cloud-recording-remaining`)
      this.remainingMinutes = getRemainingMinutes.data
      this.totalRemainingUsage = (Object.values(this.remainingMinutes) as any).reduce(
        (x: number, y: number) => x + y,
        0
      )
    } catch (e) {}
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
          breadcrumb: 'CloudUsageTitle',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
