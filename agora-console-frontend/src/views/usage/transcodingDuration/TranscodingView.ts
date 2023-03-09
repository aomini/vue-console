import Vue from 'vue'
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
const IconSetting = require('@/assets/icon/icon-setting.png')
const PicLocked = require('@/assets/icon/pic-locked.png')
import '../Usage.less'

@Component({
  template: `
    <div class="transcoding" v-loading="loading">
      <div class="text-center empty-content" v-if="!uapOpen && !configLoading">
        <img width="400px" class="mx-auto my-2" :src="PicLocked" />
        <div class="mx-auto heading-grey-13 mt-20">
          {{ $t('OpenHint') }}<a :href="$t('BillingLink')" target="_blank" class="link"> {{ $t('Here') }} </a>
        </div>
        <div class="apply-line mt-20">
          <console-button class="console-btn-primary" @click="jumpSetting">{{ $t('ApplyButton') }}</console-button>
        </div>
      </div>
      <div v-if="uapOpen">
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
    type: 'H264 Duration',
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
    this.$router.push({ name: 'usage.transcoding.duration.' + type, query: Object.assign({}, this.condition) } as any)
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
    if (this.condition.type) {
      this.$router.push({
        name: 'usage.transcoding.duration.' + this.condition.type,
        query: Object.assign({}, this.condition),
      })
    }
  }

  async getUapSetting() {
    if (this.$route.query.projectId && this.$route.query.projectId !== '0') {
      try {
        this.loading = true
        this.configLoading = true
        const ret = await this.$http.get(`/api/v2/usage/uap/setting`, {
          params: { vids: this.condition.vids, cloudTypeId: this.streaming3Id },
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
      name: 'usage.transcoding.duration.setting',
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
    this.condition.vids = this.$route.query.vids || undefined
    this.condition.projectId = this.$route.query.projectId || undefined
    this.condition.timeType = this.$route.query.timeType || undefined
  }

  async create() {
    this.uapOpen = false
    this.uapSetting = undefined
    this.init()
    await this.getUapSetting()
    if (!this.condition.fromTs || !this.condition.endTs) {
      this.setDate(0)
    } else {
      this.$router.push({
        name: 'usage.transcoding.duration.' + this.condition.type,
        query: Object.assign({}, this.condition),
      })
    }
  }
}
