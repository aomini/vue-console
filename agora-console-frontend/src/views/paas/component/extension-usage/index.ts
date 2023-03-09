import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop, Watch } from 'vue-property-decorator'
import moment from 'moment'

@Component({
  template: `<div class="extension-usage">
    <div class="title">
      <span>{{ $t('Usage') }} </span>
      <div>
        <div class="d-flex align-center">
          <el-date-picker
            :picker-options="dateOpt"
            v-model="monthRange"
            type="datetimerange"
            align="center"
            :range-separator="$t('To')"
            :start-placeholder="$t('StartDate')"
            :end-placeholder="$t('EndDate')"
            value-format="timestamp"
            :default-time="['00:00:00', '00:00:00']"
          >
          </el-date-picker>
          <el-select v-model="projectId" class="w-100px" style="margin-left: 20px;">
            <el-option v-for="(item, index) in projectList" :key="index" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div>
      <el-table :data="usageList" border style="width: 100%">
        <el-table-column prop="projectName" label="Project Name" width="180"> </el-table-column>
        <el-table-column prop="usage" label="Usage" width="180"> </el-table-column>
        <el-table-column prop="unit" label="Unit" width="180"> </el-table-column>
        <el-table-column prop="ts" label="Data"></el-table-column>
      </el-table>
    </div>
  </div>`,
})
export default class ExtensionUsage extends Vue {
  @Prop({ type: Number }) readonly billingItemId!: number
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
  daterange: any = []
  date: any = ''
  dateOpt: any = {
    disabledDate(time: any) {
      return time.getTime() > Date.now() || time.getTime() < moment(Date.now()).subtract(12, 'months')
    },
  }
  monthRange = []
  projectList: any[] = []
  usageList: any[] = []
  projectId: any = ''
  @Watch('monthRange')
  onMonthRangeChange() {
    this.getUsage()
  }
  @Watch('projectId')
  onProjectIdChange() {
    this.getUsage()
  }
  mounted() {
    this.getAllProjects()
  }
  async getUsage() {
    if (this.monthRange.length > 0) {
      const ret = await this.$http.get(`/api/v2/marketplace/usage`, {
        params: {
          billingItemId: this.billingItemId,
          fromTs: this.monthRange[0] / 1000,
          endTs: this.monthRange[1] / 1000,
          vid: this.projectId,
        },
      })
      const data = ret.data.data.map((item: { unit: any; projectName: any; vid: any; ts: any }) => {
        item.unit = ret.data.unitName.en_US
        item.projectName = this.projectList.filter((project) => project.id === item.vid)[0]?.name
        item.ts = moment(item.ts * 1000).format('YYYY-MM-DD')
        return item
      })
      this.usageList = data
    }
  }

  async getAllProjects() {
    const ret = await this.$http.get('/api/v2/projects', { params: { fetchAll: true } })
    this.projectList = ret.data.items
    this.projectId = this.projectList[0].id
  }
}
