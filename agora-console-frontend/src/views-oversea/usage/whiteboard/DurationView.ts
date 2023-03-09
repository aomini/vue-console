import Vue from 'vue'
import moment from 'moment'
import { getProjectInfo, user } from '@/services'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
const IconSetting = require('@/assets/icon/icon-setting.png')
const PicLocked = require('@/assets/icon/pic-locked.png')
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-loading="loading" class="cloud-container">
      <div class="text-center empty-content" v-if="!whiteboardOpen && !configLoading">
        <img width="400px" class="mx-auto my-2" :src="PicLocked" />
        <div class="mx-auto heading-grey-13 mt-20">
          {{ $t('WhiteboardOpenHint') }}
        </div>
        <div class="apply-line mt-20">
          <console-button class="console-btn-primary" @click="comfirmShowEnableWhiteboard">{{
            $t('WhiteboardApplyButton')
          }}</console-button>
        </div>
      </div>
      <div v-if="whiteboardOpen">
        <div class="usage-title-box cloud-title d-flex justify-between align-center">
          <div class="d-inline-block mr-3 page-title">{{ $t('WhiteboardUsageTitle') }}</div>
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
              <el-date-picker
                v-show='condition.timeType==="3"'
                :picker-options="dateOpt"
                @change="changeDate"
                class="ag-date-picker mr-2 w-150"
                size="small"
                v-model="date"
              >
              </el-date-picker>
              <el-select v-model="condition.timeType" @change="setTimeType" class="w-100px" size="mini">
                <el-option :key="1" :label='$t("Daily")' value="1"> </el-option>
                <el-option :key="3" :label='$t("Monthly")' value="3"> </el-option>
              </el-select>
              <img
                :src="IconSetting"
                v-if="whiteboardOpen&&condition.projectId!=='0'"
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
            :sortable="true"
          >
          </el-table-column>
          <el-table-column
            prop="audio"
            :label='this.$t("Whiteboard duration")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.audio | formatUsage('usage') }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!isEmpty" class="card mt-20">
          <div>{{ $t('TableExplain2') }}</div>
          <div>{{ $t('TableExplain1') }}</div>
          <div>{{ $t('TableExplain3') }}</div>
          <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
        </div>
      </div>

      <el-dialog :title='$t("EnableWhiteboardTitle")' :visible.sync="showEnableWhiteboardConfirm" width="380px">
        <div class="p-2">
          <div>
            <span>{{ $t('EnableWhiteboardDesc') }} </span>
          </div>
          <div class="mt-20 text-right">
            <console-button
              class="console-btn-primary"
              @click="enableWhiteboard()"
              :loading="applyLoading"
              :disabled="applyLoading"
            >
              {{ $t('Confirm') }}
            </console-button>
            <console-button class="console-btn-white" @click="() => showEnableWhiteboardConfirm = false">
              {{ $t('Cancel') }}
            </console-button>
          </div>
        </div>
      </el-dialog>

      <el-dialog
        :title="$t('Migrate Netless Projects to Agora.io Console')"
        :visible.sync="showNetlessDialog"
        width="450px"
        top="30vh"
      >
        <p class="f-12">{{ $t('Netless Tip 1') }}</p>
        <p class="f-12">{{ $t('Netless Tip 2', { email: user.info.email }) }}</p>
        <p class="f-12">{{ $t('Netless Tip 3') }}</p>
        <el-checkbox v-model="netlessAgree"
          ><div class="checkbox-text">
            {{ $t('I confirm that I own this Netless account and agree to the migration') }}
          </div></el-checkbox
        >
        <div class="button-line mt-20 text-right">
          <console-button
            class="console-btn-primary"
            size="small"
            @click="migrate()"
            :disabled="!netlessAgree || migrateLoading"
            :loading="migrateLoading"
            >{{ $t('Migrate') }}</console-button
          >
          <console-button class="console-btn-white" size="small" @click="() => showNetlessDialog = false">{{
            $t('Cancel')
          }}</console-button>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class DurationView extends Vue {
  loading = false
  applyLoading = false
  configLoading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  whiteboardOpen = false
  condition: any = {
    type: 0,
    fromTs: undefined,
    endTs: undefined,
    intervalType: 0,
    model: 'DURATION',
    business: 'WHITEBOARD',
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
  showEnableWhiteboardConfirm = false
  showNetlessDialog = false
  netlessAgree = false
  migrateLoading = false
  emailStatus = {
    NotVerified: 0,
    Verified: 1,
  }
  agoraSource = 1
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

  async getWhiteboardInfo() {
    if (this.condition.vids && this.$route.query.projectId !== '0') {
      try {
        this.configLoading = true
        const netlessInfo = await this.$http.get(`/api/v2/project/${this.condition.vids}/netless/check`)
        if (netlessInfo.data) {
          this.whiteboardOpen = true
        }
      } catch (e) {
        this.$message.error(this.$t('FailedGetNetlessInfo') as string)
      }
      this.configLoading = false
    } else {
      this.whiteboardOpen = true
    }
  }

  async enableWhiteboard() {
    try {
      this.applyLoading = true
      const project = await getProjectInfo(this.condition.projectId)
      await this.$http.post(`/api/v2/project/${this.condition.vids}/netless`, { name: project.info.name })
      this.whiteboardOpen = true
      this.showEnableWhiteboardConfirm = false
      this.$message({
        message: this.$t('EnableWhiteboardSuccess') as string,
        type: 'success',
      })
      this.create()
    } catch (e) {
      this.$message.error(this.$t('EnableWhiteboardError') as string)
    }
    this.applyLoading = false
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
        usage: x.whiteBoardInteraction + x.whiteBoardReadOnly,
        type: this.$t('Audio'),
      },
    ])

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    const { audioSum } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          audioSum: pre.audioSum + cur.whiteBoardInteraction + cur.whiteBoardReadOnly,
        }
      },
      { audioSum: 0 }
    )

    const total = Math.max(audioSum, 1)
    const dataArray = [
      {
        index: '0',
        type: this.$t('Whiteboard duration'),
        dataType: 'voice',
        percentage: audioSum / total,
        value: audioSum,
        restName: this.$t('Rest'),
        content: this.$t('minutes'),
      },
    ]
    this.barData = dataArray
  }

  async getUsageInfo() {
    this.loading = true
    try {
      if (this.condition.projectId === '0') {
        const ret = await this.$http.get(`/api/v2/usage/usageInfo`, {
          params: Object.assign({}, this.condition, { aggregate: 1 }),
        })
        const usageData = ret.data
        const usageObj: any = {}
        for (const data of usageData) {
          if (data.date in usageObj) {
            usageObj[data.date]['whiteBoardInteraction'] += data.whiteBoardInteraction
            usageObj[data.date]['whiteBoardReadOnly'] += data.whiteBoardReadOnly
          } else {
            usageObj[data.date] = {
              whiteBoardInteraction: data.whiteBoardInteraction,
              whiteBoardReadOnly: data.whiteBoardReadOnly,
            }
          }
        }
        const dataArray = []
        for (const date of Object.keys(usageObj)) {
          dataArray.push(Object.assign({}, { date }, usageObj[date]))
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
      this.tableData = this.data.map((x: any) => {
        const total = x.whiteBoardInteraction + x.whiteBoardReadOnly
        return { date: x.date, audio: x.whiteBoardInteraction + x.whiteBoardReadOnly, total: total }
      })
      this.getLineChartInfo()
      this.getBarChartInfo()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  jumpSetting() {
    this.$router.push({ name: 'whiteboard-config', params: { id: this.condition.projectId } })
  }

  async create() {
    this.whiteboardOpen = false
    this.init()
    await this.getWhiteboardInfo()

    if ((!this.condition.fromTs || !this.condition.endTs) && this.condition.timeType !== '2') {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }
  }

  async comfirmShowEnableWhiteboard() {
    const checkNetless = await this.checkNetlessStatus()
    if (checkNetless) {
      this.showNetlessDialog = true
      return
    }
    this.showEnableWhiteboardConfirm = true
  }

  async checkNetlessStatus() {
    if (this.user.info.emailStatus === this.emailStatus.NotVerified) return false
    if (this.user.info.company.source !== this.agoraSource) return false
    if (this.user.info.isMember) return false

    try {
      const res = await this.$http.get('/api/v2/company/netless/exist')
      return res.data || false
    } catch (e) {
      return false
    }
  }

  async migrate() {
    this.migrateLoading = true
    try {
      await this.$http.post('/api/v2/company/netless/migrate')
      this.$message({
        message: this.$t('Migrate successfully') as string,
        type: 'success',
      })
      this.showNetlessDialog = false
    } catch (error) {
      this.$message.error(this.$t('Migrate Failed') as string)
    }
    this.migrateLoading = false
  }
}
