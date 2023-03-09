import Vue from 'vue'
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services'
import Component from 'vue-class-component'
const IconQuestion = require('@/assets/icon/icon-question.png')
import '../Usage.less'

@Component({
  template: `
    <div>
      <div class="usage-title-box-with-remaining d-flex justify-between">
        <div class="d-flex align-center">
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
          <el-tooltip :content='$t("UsageTooltip")' placement="top" class="ml-5">
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
          </div>
        </div>
      </div>
      <router-view></router-view>
    </div>
  `,
})
export default class BandWidthView extends Vue {
  settings: any = ['All']
  condition: any = {
    type: 'All',
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: 'bandwidth',
    vids: undefined,
    projectId: undefined,
  }
  daterange: any = []
  dateOpt: any = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(3, 'months')
    },
  }
  IconQuestion = IconQuestion

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

  async setType(type: string) {
    this.condition.type = type
    this.$router.push({ name: 'usage.bandwidth.' + this.condition.type, query: Object.assign({}, this.condition) })
  }

  changeDate() {
    if (!!this.daterange && this.daterange[0] && this.daterange[1]) {
      this.condition.fromTs = new Date(this.daterange[0]).getTime() / 1000
      this.condition.endTs = new Date(this.daterange[1]).getTime() / 1000
      this.condition.intervalType = -1
    }
    this.$router.push({ query: Object.assign({}, this.condition) })
  }

  setDate(intervalType: number) {
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
    this.$router.push({ name: 'usage.bandwidth.' + this.condition.type, query: Object.assign({}, this.condition) })
  }

  init() {
    this.condition.fromTs = this.$route.query.fromTs || undefined
    this.condition.endTs = this.$route.query.endTs || undefined
    this.daterange = this.daterange || []
    this.daterange[0] = this.condition.fromTs ? moment(this.condition.fromTs * 1000) : undefined
    this.daterange[1] = this.condition.endTs ? moment(this.condition.endTs * 1000) : undefined
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting) {
      this.settings = projectSetting['Bandwidth'] || []
    }
    if (this.settings.length === 0) {
      this.$router.push({
        name: 'usage.duration',
        query: Object.assign({}, { vids: this.condition.vids, projectId: this.condition.projectId }),
      })
    }
    if (this.settings.includes(this.$route.query.type)) {
      this.condition.type = this.$route.query.type
    } else {
      this.condition.type = this.settings[0]
    }
  }

  create() {
    this.init()
    if (!this.condition.fromTs || !this.condition.endTs) {
      this.setDate(0)
    }
  }
}
