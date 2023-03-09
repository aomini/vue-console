import Vue from 'vue'
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
const IconSetting = require('@/assets/icon/icon-setting.png')
const PicLocked = require('@/assets/icon/pic-locked.png')
import '../Usage.less'
import { user } from '@/services'

@Component({
  template: `
    <div class="transcoding" v-loading="loading">
      <div>
        <div class="usage-title-box cloud-title d-flex justify-between">
          <div>
            <div
              v-for="(setting, key) of settings"
              :key="key"
              class="tab-button"
              :class='{ "active-btn": condition.type === setting, "switch-btn": true }'
              @click="setType(setting)"
            >
              {{ $t(setting) }}
            </div>
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
    </div>
  `,
})
export default class TranscodingView extends Vue {
  settings = ['H264 Duration', 'H265 Duration']
  uapOpen = false
  configLoading = false
  loading = false
  uapSetting: any = undefined
  streaming3Id = 8
  condition: any = {
    type: 0,
    intervalType: 0,
    fromTs: undefined,
    endTs: undefined,
    model: 'transcoding',
    business: 'transcodeDuration',
    vids: undefined,
    projectId: undefined,
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
  IconSetting = IconSetting
  PicLocked = PicLocked

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
    console.info(type)
    this.$router.push({ name: 'usage.transcoding.channels.' + type, query: Object.assign({}, this.condition) } as any)
  }

  changeDate() {
    if (!!this.daterange && this.daterange[0] && this.daterange[1]) {
      this.condition.fromTs = new Date(this.daterange[0]).getTime() / 1000
      this.condition.endTs = new Date(this.daterange[1]).getTime() / 1000
      this.condition.intervalType = -1
    }
    this.$router.push({ query: Object.assign({}, this.condition) })
  }

  setDate(type: number) {
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

    if (this.condition.type) {
      this.$router.push({
        name: 'usage.transcoding.channels.' + this.condition.type,
        query: Object.assign({}, this.condition),
      })
    }
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
      this.settings = projectSetting['Transcoding'] || []
    }
    if (this.settings.length === 0) {
      this.$router.push({
        name: 'usage.duration',
        query: Object.assign({}, { vids: this.condition.vids, projectId: this.condition.projectId }),
      })
    }
    if (this.settings.includes(this.$route.query.type as string)) {
      this.condition.type = this.$route.query.type
    } else {
      this.condition.type = this.settings[0]
    }
  }

  async create() {
    this.init()
    if (!this.condition.fromTs || !this.condition.endTs) {
      this.setDate(0)
    }
  }
}
