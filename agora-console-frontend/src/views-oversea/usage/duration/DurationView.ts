import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
const IconQuestion = require('@/assets/icon/icon-question.png')
import '../Usage.less'

@Component({
  template: `
    <div>
      <div class="remaining-usage-tip" v-if="remainingUsagePermission">
        <div class="remaining-usage">
          <div class="remaining-usage-btn">
            <el-tooltip :content='$t("packageRemainingTooltip")' placement="top">
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
      <div class="usage-title-box-with-remaining d-flex justify-between">
        <div>
          <div
            class="tab-button"
            v-if='settings.includes("All")'
            :class='{ "active-btn": condition.type === "All", "switch-btn": true }'
            @click='setType("All")'
          >
            {{ $t('all') }}
          </div>
          <div
            class="tab-button"
            v-if='settings.includes("Host")'
            :class='{ "active-btn": condition.type === "Host", "switch-btn": true }'
            @click='setType("Host")'
          >
            {{ $t('host') }}
          </div>
          <div
            class="tab-button"
            v-if='settings.includes("Audience")'
            :class='{ "active-btn": condition.type === "Audience", "switch-btn": true }'
            @click='setType("Audience")'
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
      <router-view></router-view>
    </div>
  `,
})
export default class DurationView extends Vue {
  settings = ['All']
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
  date: any = ''
  daterange: any = []
  dateOpt = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(12, 'months')
    },
  }
  user = user
  remainingMinutes: any = {}
  remainingUsageDialog = false
  totalRemainingUsage: any = 0

  IconQuestion = IconQuestion

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
  }

  goToPackageManagement() {
    this.$router.push({ name: 'package.myMinPackage' })
  }

  async setType(tab: any) {
    const type = tab
    this.condition.type = type
    const redirect = 'usage.duration.' + type
    this.$router.push({ name: redirect, query: Object.assign({}, this.condition) })
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

  setDate(intervalType: number) {
    this.condition.timeType = '1'
    this.date = ''
    if (intervalType === 0) {
      const current = new Date()
      const todayDate = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      const weekAgo = new Date(moment(todayDate).subtract(6, 'days') as any)
      this.condition.fromTs = weekAgo.getTime() / 1000
      this.condition.endTs = todayDate.getTime() / 1000
    } else if (intervalType === 1) {
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
    this.condition.intervalType = intervalType
    this.condition.type = this.condition.type || 'All'
    if (this.condition.projectId && this.condition.vids) {
      const redirect = 'usage.duration.' + this.condition.type
      this.$router.push({ name: redirect, query: Object.assign({}, this.condition) })
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
    this.settings = ['All']
    this.condition.timeType = this.$route.query.timeType || '1'
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting) {
      this.settings = ['All', ...(projectSetting['Duration'] || [])]
    }
    this.condition.type = this.settings.includes((this.$route.query as any).type)
      ? this.$route.query.type
      : this.settings[0]
  }

  async create() {
    this.init()
    if ((!this.condition.fromTs || !this.condition.endTs) && this.condition.timeType !== '2') {
      this.setDate(0)
    }
    try {
      const getRemainingMinutes = await this.$http.get(`/api/v2/usage/rtc-remaining`)
      this.remainingMinutes = getRemainingMinutes.data
      this.totalRemainingUsage = (Object.values(this.remainingMinutes) as any).reduce(
        (x: number, y: number) => x + y,
        0
      )
    } catch (e) {}
  }
}
