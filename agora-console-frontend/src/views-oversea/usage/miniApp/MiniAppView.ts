import Vue from 'vue'
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import { CloudTypeMap } from '@/models/uapModels'
const IconSetting = require('@/assets/icon/icon-setting.png')
const PicLocked = require('@/assets/icon/pic-locked.png')
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-loading="loading">
      <div class="text-center empty-content" v-if="!uapOpen && !configLoading">
        <img width="400px" class="mx-auto my-2" :src="PicLocked" />
        <div class="mx-auto heading-grey-13 mt-20">
          {{ $t('OpenMiniAppHint') }}
        </div>
        <div class="apply-line mt-20">
          <console-button class="console-btn-primary" @click="jumpSetting">{{
            $t('ApplyMiniAppButton')
          }}</console-button>
        </div>
      </div>
      <div v-if="uapOpen">
        <div class="usage-title-box cloud-title d-flex justify-between align-center">
          <div class="d-inline-block mr-3 page-title">{{ $t('MiniAppTitle') }}</div>
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
              <img
                :src="IconSetting"
                v-if="uapOpen&&condition.projectId!=='0'"
                @click="jumpSetting"
                class="w-26 ml-5 cursor-pointer"
              />
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
            width="200px"
            :sortable="true"
          >
          </el-table-column>
          <el-table-column
            prop="audioAll"
            v-if="condition.type !== 2"
            :label='this.$t("audioAll")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.audioAll | formatUsage('usage') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="videoAll"
            v-if="condition.type !== 2"
            :label='this.$t("videoAll")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.videoAll | formatUsage('usage') }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="condition.type !== 1"
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
          <div>{{ $t('MiniAppHint') }}</div>
          <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
        </div>
      </div>
    </div>
  `,
})
export default class MiniAppView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  uapOpen = false
  configLoading = false
  uapSetting: any = undefined
  condition: any = {
    fromTs: undefined,
    endTs: undefined,
    intervalType: 0,
    model: 'duration',
    business: 'qqWeixinMiniapp',
    vids: '0',
    timeType: '1',
    projectId: '0',
    timezoneOffset: new Date().getTimezoneOffset(),
  }
  date: any = ''
  daterange: any = []
  dateOpt = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(3, 'months')
    },
  }
  IconSetting = IconSetting
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

  getLineChartInfo() {
    const displayFormat = this.condition.timeType === '2' ? 'HH:00' : 'MM-DD'
    const flatData = this.data.map((x: any) => [
      { date: moment(x.date).format(displayFormat), usage: x.audioAll, type: this.$t('audioAll') },
      { date: moment(x.date).format(displayFormat), usage: x.videoAll, type: this.$t('videoAll') },
    ])

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    const { audioAllSum, videoAllSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          audioAllSum: pre.audioAllSum + cur.audioAll,
          videoAllSum: pre.videoAllSum + cur.videoAll,
        }
      },
      { audioAllSum: 0, videoAllSum: 0 }
    )

    const total = Math.max(audioAllSum + videoAllSum, 1)
    const dataArray = [
      {
        index: '0',
        type: this.$t('audioAll'),
        dataType: 'voice',
        percentage: audioAllSum / total,
        value: audioAllSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
      {
        index: '1',
        type: this.$t('videoAll'),
        dataType: 'videoSD',
        percentage: videoAllSum / total,
        value: videoAllSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
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
        total = x.audioAll + x.videoAll
        return { date: x.date, audioAll: x.audioAll, videoAll: x.videoAll, total: total }
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

  async getUapSetting() {
    if (this.$route.query.projectId && this.$route.query.projectId !== '0') {
      try {
        this.loading = true
        this.configLoading = true
        const ret = await this.$http.get(`/api/v2/usage/uap/setting`, {
          params: { vids: this.condition.vids, cloudTypeId: CloudTypeMap['MiniAppNew'] },
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
      name: 'usage.miniapp.setting',
      query: { vids: this.condition.vids, projectId: this.condition.projectId },
    })
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
    this.condition.timeType = this.$route.query.timeType
  }

  async create() {
    this.uapOpen = false
    this.uapSetting = undefined

    this.init()
    // 非中国用户默认不显示小程序
    if (
      user.info.company.country !== 'CN' &&
      !Object.keys(user.info.settings).includes(this.$route.query.projectId as string)
    ) {
      this.$router.push({
        name: 'usage.duration',
        query: Object.assign({}, { vids: this.condition.vids, projectId: this.condition.projectId }),
      })
      return
    }

    await this.getUapSetting()
    if (!this.condition.fromTs || !this.condition.endTs) {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }
  }
}
