import Vue from 'vue'
import moment from 'moment'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
const IconSetting = require('@/assets/icon/icon-setting.png')
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-loading="loading" class="cloud-container">
      <div>
        <div class="usage-title-box cloud-title d-flex justify-between align-center">
          <div class="d-inline-block mr-3 page-title">{{ $t('PageRecordingTitle') }}</div>
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
            prop="imageModeNormalCount"
            :label='this.$t("Cloud Image Moderation neutral and porn count")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.imageModeNormalCount | formatUsage('channels') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="imageModeSexyCount"
            :label='this.$t("Cloud Image Moderation sexy count")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.imageModeSexyCount | formatUsage('channels') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="imageModeClientNormalCount"
            :label='this.$t("Client Image Moderation neutral and porn count")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.imageModeClientNormalCount | formatUsage('channels') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="imageModeFreeUploadCount"
            :label='this.$t("Image free upload count (moderation)")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.imageModeFreeUploadCount | formatUsage('channels') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="imageModeUploadCount"
            :label='this.$t("Image upload count (supervision)")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.imageModeUploadCount | formatUsage('channels') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="imageModeQpsCount"
            :label='this.$t("Image Moderation peak QPS count")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              {{ scope.row.imageModeQpsCount | formatUsage('channels') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="total"
            :label='this.$t("total")'
            label-class-name="table-title"
            class-name="table-content font-weight-bold"
          >
            <template slot-scope="scope">
              {{ scope.row.total | formatUsage('channels') }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!isEmpty" class="card mt-20">
          <div>{{ $t('TableExplain2') }}</div>
          <div>{{ $t('TableExplain1') }}</div>
          <div>
            {{ $t('ContentModerationBillingExplain') }}
            <a :href="$t('Content moderation billing url')" target="_blank">{{ $t('billing FAQ') }}</a>
          </div>
          <div>{{ $t('You can check the usage data collected within 3 months.') }}</div>
        </div>
      </div>
    </div>
  `,
})
export default class ImageModerationView extends Vue {
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  condition: any = {
    type: 0,
    fromTs: undefined,
    endTs: undefined,
    intervalType: 0,
    model: 'COUNTER',
    business: 'IMAGE_MODE',
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
  emailStatus = {
    NotVerified: 0,
    Verified: 1,
  }
  IconSetting = IconSetting
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

  async create() {
    this.init()

    if ((!this.condition.fromTs || !this.condition.endTs) && this.condition.timeType !== '2') {
      this.setDate(0)
    } else {
      this.getUsageInfo()
    }
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
        sums[index] = values.reduce((prev: any, curr: any) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            return prev + curr
          } else {
            return prev
          }
        }, 0)
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
        usage: x.imageModeNormalCount,
        type: this.$t('Cloud Image Moderation neutral and porn count'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.imageModeSexyCount,
        type: this.$t('Cloud Image Moderation sexy count'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.imageModeClientNormalCount,
        type: this.$t('Client Image Moderation neutral and porn count'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.imageModeFreeUploadCount,
        type: this.$t('Image free upload count (moderation)'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.imageModeUploadCount,
        type: this.$t('Image upload count (supervision)'),
        format: 'channel',
      },
      {
        date: moment(x.date).format(displayFormat),
        usage: x.imageModeQpsCount,
        type: this.$t('Image Moderation peak QPS count'),
        format: 'channel',
      },
    ])

    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    const {
      imageModeNormalCount,
      imageModeSexyCount,
      imageModeClientNormalCount,
      imageModeFreeUploadCount,
      imageModeUploadCount,
      imageModeQpsCount,
    } = this.data.reduce(
      (pre: any, cur: any) => {
        return {
          imageModeNormalCount: pre.imageModeNormalCount + cur.imageModeNormalCount,
          imageModeSexyCount: pre.imageModeSexyCount + cur.imageModeSexyCount,
          imageModeClientNormalCount: pre.imageModeClientNormalCount + cur.imageModeClientNormalCount,
          imageModeFreeUploadCount: pre.imageModeFreeUploadCount + cur.imageModeFreeUploadCount,
          imageModeUploadCount: pre.imageModeUploadCount + cur.imageModeUploadCount,
          imageModeQpsCount: pre.imageModeQpsCount + cur.imageModeQpsCount,
        }
      },
      {
        imageModeNormalCount: 0,
        imageModeSexyCount: 0,
        imageModeClientNormalCount: 0,
        imageModeFreeUploadCount: 0,
        imageModeUploadCount: 0,
        imageModeQpsCount: 0,
      }
    )

    const total = Math.max(
      imageModeNormalCount +
        imageModeSexyCount +
        imageModeClientNormalCount +
        imageModeFreeUploadCount +
        imageModeUploadCount +
        imageModeQpsCount,
      1
    )
    const dataArray = [
      {
        index: '0',
        type: this.$t('Cloud Image Moderation neutral and porn count'),
        dataType: 'count',
        percentage: imageModeNormalCount / total,
        value: imageModeNormalCount,
        restName: this.$t('Rest'),
        content: this.$t('count'),
      },
      {
        index: '1',
        type: this.$t('Cloud Image Moderation sexy count'),
        dataType: 'count',
        percentage: imageModeSexyCount / total,
        value: imageModeSexyCount,
        restName: this.$t('Rest'),
        content: this.$t('count'),
      },
      {
        index: '2',
        type: this.$t('Client Image Moderation neutral and porn count'),
        dataType: 'count',
        percentage: imageModeClientNormalCount / total,
        value: imageModeClientNormalCount,
        restName: this.$t('Rest'),
        content: this.$t('count'),
      },
      {
        index: '3',
        type: this.$t('Image free upload count (moderation)'),
        dataType: 'count',
        percentage: imageModeFreeUploadCount / total,
        value: imageModeFreeUploadCount,
        restName: this.$t('Rest'),
        content: this.$t('count'),
      },
      {
        index: '4',
        type: this.$t('Image upload count (supervision)'),
        dataType: 'count',
        percentage: imageModeUploadCount / total,
        value: imageModeUploadCount,
        restName: this.$t('Rest'),
        content: this.$t('count'),
      },
      {
        index: '5',
        type: this.$t('Image Moderation peak QPS count'),
        dataType: 'count',
        percentage: imageModeQpsCount / total,
        value: imageModeQpsCount,
        restName: this.$t('Rest'),
        content: this.$t('count'),
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
        const total =
          x.imageModeNormalCount +
          x.imageModeSexyCount +
          x.imageModeClientNormalCount +
          x.imageModeFreeUploadCount +
          x.imageModeUploadCount +
          x.imageModeQpsCount
        return Object.assign({}, x, { total: total })
      })
      this.getLineChartInfo()
      this.getBarChartInfo()
    } catch (e) {
      this.isEmpty = true
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }
}
