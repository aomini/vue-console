import Vue from 'vue'
import Component from 'vue-class-component'
import { IntervalTypeEnum, TimeTypeEnum, UsageDateCondition } from '../../../models/usageModel'
import moment from 'moment'
import { Prop, Watch } from 'vue-property-decorator'

@Component({
  template: `
    <div class="d-flex align-center">
      <div
        class="heading-grey-13 mr-20 cursor-pointer"
        :class='{ "link": dateCondition.intervalType === 0 }'
        @click="setDateInterval(0)"
      >
        {{ $t('last7') }}
      </div>
      <div
        class="heading-grey-13 mr-20 cursor-pointer"
        :class='{ "link": dateCondition.intervalType === 1 }'
        @click="setDateInterval(1)"
      >
        {{ $t('last30') }}
      </div>
      <div
        class="heading-grey-13 mr-20 cursor-pointer"
        :class='{ "link": dateCondition.intervalType === 2 }'
        @click="setDateInterval(2)"
      >
        {{ $t('currentMonth') }}
      </div>
      <el-date-picker
        v-show='dateCondition.timeType==="1"'
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
        v-show='dateCondition.timeType==="2"'
        :picker-options="dateOpt"
        @change="changeDate"
        class="ag-date-picker mr-2 w-150"
        size="small"
        v-model="date"
      >
      </el-date-picker>
      <el-date-picker
        v-show='dateCondition.timeType==="3"'
        :picker-options="dateOpt"
        @change="changeDate"
        class="ag-date-picker mr-2 w-150"
        size="small"
        v-model="date"
      >
      </el-date-picker>
      <el-select v-if="type === 1" v-model="dateCondition.timeType" @change="setTimeType" class="w-100px" size="mini">
        <el-option :key="1" :label='$t("Daily")' value="1"></el-option>
        <el-option :key="2" :label='$t("Hourly")' value="2"></el-option>
        <el-option :key="3" :label='$t("Monthly")' value="3"></el-option>
      </el-select>
    </div>
  `,
})
export default class UsageDateSelector extends Vue {
  @Prop({ default: '', type: Number }) readonly type!: number
  dateCondition: UsageDateCondition = {
    intervalType: IntervalTypeEnum.Last7,
    fromTs: 0,
    endTs: 0,
    timeType: TimeTypeEnum.Daily,
  }
  dateOpt = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(12, 'months')
    },
  }
  daterange: any = []
  date: any = ''

  @Watch('$route.query')
  onRouteChange() {
    // 切换项目和模型后初始化日期
    if ((!this.$route.query.fromTs || !this.$route.query.endTs) && this.$route.query.timeType !== TimeTypeEnum.Hourly) {
      this.setDateInterval(IntervalTypeEnum.Last7)
    }
  }

  created() {
    this.daterange = this.daterange || []
    this.daterange[0] = this.dateCondition.fromTs ? moment(this.dateCondition.fromTs * 1000) : undefined
    this.daterange[1] = this.dateCondition.endTs ? moment(this.dateCondition.endTs * 1000) : undefined
    this.date = this.dateCondition.fromTs ? moment(this.dateCondition.fromTs * 1000) : ''
    this.setDateInterval(IntervalTypeEnum.Last7)
  }

  setDateInterval(intervalType: IntervalTypeEnum) {
    this.dateCondition.timeType = TimeTypeEnum.Daily
    this.date = ''
    const current = new Date()
    if (intervalType === IntervalTypeEnum.Last7) {
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      const weekAgo = new Date(moment(todayDate).subtract(6, 'days') as any)
      this.dateCondition.fromTs = weekAgo.getTime() / 1000
      this.dateCondition.endTs = todayDate.getTime() / 1000
    } else if (intervalType === IntervalTypeEnum.Last30) {
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      const monthAgo = new Date(moment(todayDate).subtract(1, 'months') as any)
      this.dateCondition.fromTs = monthAgo.getTime() / 1000
      this.dateCondition.endTs = todayDate.getTime() / 1000
    } else {
      const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1)
      this.dateCondition.fromTs = currentMonth.getTime() / 1000
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      this.dateCondition.endTs = todayDate.getTime() / 1000
    }
    this.daterange = []
    this.daterange[0] = this.dateCondition.fromTs ? moment(this.dateCondition.fromTs * 1000) : undefined
    this.daterange[1] = this.dateCondition.endTs ? moment(this.dateCondition.endTs * 1000) : undefined
    this.dateCondition.intervalType = intervalType
    this.changeCondition()
  }

  changeDate() {
    if (this.dateCondition.timeType === TimeTypeEnum.Daily) {
      if (!!this.daterange && this.daterange[0] && this.daterange[1]) {
        this.dateCondition.fromTs = new Date(this.daterange[0]).getTime() / 1000
        this.dateCondition.endTs = new Date(this.daterange[1]).getTime() / 1000
        this.dateCondition.intervalType = -1
      }
    } else if (this.dateCondition.timeType === TimeTypeEnum.Monthly) {
      const dateTs = Date.UTC(this.date.getFullYear(), this.date.getMonth())
      this.dateCondition.fromTs = dateTs / 1000
      this.dateCondition.endTs = dateTs / 1000
      this.dateCondition.intervalType = -1
    } else {
      if (this.date) {
        const dateTs = Date.UTC(this.date.getFullYear(), this.date.getMonth(), this.date.getDate())
        this.dateCondition.fromTs = dateTs / 1000
        this.dateCondition.endTs = dateTs / 1000
        this.dateCondition.intervalType = -1
      }
    }
    this.changeCondition()
  }

  setTimeType(timeType: TimeTypeEnum) {
    this.dateCondition.timeType = timeType
    const current = new Date()
    let todayDate = 0
    if (timeType === TimeTypeEnum.Daily) {
      this.setDateInterval(0)
      return
    } else if (timeType === TimeTypeEnum.Hourly) {
      todayDate = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())
    } else if (timeType === TimeTypeEnum.Monthly) {
      todayDate = Date.UTC(current.getFullYear(), current.getMonth())
    }
    this.dateCondition.fromTs = todayDate / 1000
    this.dateCondition.endTs = todayDate / 1000
    this.daterange = []
    this.date = todayDate
    this.changeCondition()
  }

  changeCondition() {
    this.$emit('changeDate', Object.assign({}, this.dateCondition))
  }
}
