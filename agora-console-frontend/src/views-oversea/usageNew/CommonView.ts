import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
import './Usage.less'
import PackageRemainingTip from '@/views-oversea/usageNew/components/PackageRemainingTip'
import UsageDateSelector from '@/views-oversea/usageNew/components/UsageDateSelector'
import UsageTable from '@/views-oversea/usageNew/components/UsageTable'
import {
  IntervalTypeEnum,
  ProductUsageModel,
  TimeTypeEnum,
  UsageConditionModel,
  UsageDateCondition,
  UsageGroupModel,
  UsageResolutionModel,
  UsageRenderType,
} from '../../models/usageModel'
import LineChart from '@/components/LineChart'
import BarChart from './components/BarChart'
import moment from 'moment'
import { usageConfig } from '@/services/usage'
import { productConfig } from '@/services/product'
import { ExtensionModel } from '@/models'

const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  components: {
    'package-remaining-tip': PackageRemainingTip,
    'usage-date-selector': UsageDateSelector,
    'usage-table': UsageTable,
    'line-chart': LineChart,
    'bar-chart': BarChart,
  },
  template: `
    <div v-if="usageModel && extension" v-loading="loading">
      <div class="d-inline-block mr-3 page-title mb-20 heading-dark-14">{{ getModelTitle }}</div>
      <package-remaining-tip
        :type="usageModel?.packageType"
        v-if="usageModel?.packageType !== 0"
      ></package-remaining-tip>
      <div class="usage-title-box-with-remaining d-flex justify-between mb-50">
        <div>
          <template v-for="item in groupList">
            <div
              class="tab-button tab-button--usage"
              :class='{ "active-btn": selectedGroup === item.nameEn, "switch-btn": true }'
              @click="changeGroup(item)"
            >
              {{ isCNLang ? item.nameCn : item.nameEn }}
            </div>
          </template>
          <el-tooltip :content='$t("UsageTooltip")' placement="top" v-if="showUsageTooltip">
            <img class="ml-3 vertical-middle" width="15" :src="IconQuestion" alt="" />
          </el-tooltip>
        </div>
        <div class="float-right">
          <usage-date-selector :type="getDateType" @changeDate="changeDate"></usage-date-selector>
        </div>
      </div>
      <bar-chart
        v-if="!isEmpty"
        :data="barData"
        :type="usageModel?.fetchParams.model"
        :business="usageModel?.fetchParams.business"
        class="mb-60"
      ></bar-chart>
      <line-chart v-if="!isEmpty" :data="lineData" class="mb-30"></line-chart>
      <usage-table
        :table-data="tableData"
        :resolution-list="resolutionList"
        :render-type="usageModel?.renderParams.renderType"
        :model="usageModel?.fetchParams.model"
        :model-id="usageModel.modelId"
        v-if="tableData.length"
      ></usage-table>
      <div v-if="!isEmpty && getUsageFAQ" class="card mt-20 usage-faq" v-html="getUsageFAQ"></div>
    </div>
  `,
})
export default class CommonView extends Vue {
  settings: string[] = []
  condition: UsageConditionModel = {
    modelId: '',
    intervalType: IntervalTypeEnum.Last7,
    fromTs: 0,
    endTs: 0,
    timeType: TimeTypeEnum.Daily,
    timezoneOffset: new Date().getTimezoneOffset(),
    model: '',
    business: '',
    vids: '0',
    projectId: '',
  }
  selectedGroup = ''
  user = user
  isCNLang = user.info.language === 'chinese'
  IconQuestion = IconQuestion
  usageModel: ProductUsageModel | null = null
  groupList: UsageGroupModel[] = []
  allResolutionList: UsageResolutionModel[] = []
  resolutionList: UsageResolutionModel[] = []
  loading = false
  isEmpty = false
  data: any = []
  tableData: any = []
  lineData: any = []
  barData: any = []
  extension: ExtensionModel | null = null
  UsageRenderType = UsageRenderType

  @Watch('$route')
  async onRouteChange(newRoute: any, oldRoute: any) {
    if (newRoute.fullPath === oldRoute.fullPath || !newRoute.query.vids) {
      return
    }
    this.condition.modelId = this.$route.query.modelId as string
    this.condition.vids = this.$route.query.vids as string
    this.condition.projectId = this.$route.query.projectId as string
    if (newRoute.query.vids && newRoute.query.fromTs && newRoute.query.endTs) {
      await this.prepareUsageModel()
    }
  }

  get getModelTitle() {
    return this.isCNLang
      ? `${this.extension?.nameCn} - ${this.usageModel?.nameCn}`
      : `${this.extension?.nameEn} - ${this.usageModel?.nameEn}`
  }

  get getDateType() {
    // TODO: 日期选择器可以配置化
    const modelList = ['counter', 'bandwidth']
    const businessList = ['concurrentChannel']
    if (
      modelList.find((model) => this.usageModel?.fetchParams.model === model) ||
      businessList.find((business) => this.usageModel?.fetchParams.business === business)
    )
      return 0
    return 1
  }

  get remainingUsagePermission() {
    return this.user.info.company.area === 'CN' && this.user.info.permissions['FinanceCenter'] > 0
  }

  get showUsageTooltip() {
    return this.usageModel?.renderParams.groupList.find(
      (group) => group.nameEn === 'Host' || group.nameCn === 'Audience'
    )
  }

  get getUsageFAQ() {
    return this.isCNLang ? this.usageModel?.tipCn : this.usageModel?.tipEn
  }

  async mounted() {
    await this.prepareUsageModel()
  }

  async prepareUsageModel() {
    const modelId = this.$route.query.modelId as string
    this.usageModel = (await usageConfig.getUsageModel(modelId)) as ProductUsageModel
    this.initCondition()
    const fullGroupList = this.usageModel.renderParams.groupList
    this.groupList = fullGroupList.filter((item) => {
      return !item.settingValue || this.settings.includes(item.settingValue)
    })
    this.allResolutionList = this.usageModel.renderParams.resolutionList
    const selectedGroup = this.groupList.find((item) => item.nameEn === this.selectedGroup)
    if (this.groupList.length > 0 && !selectedGroup) {
      this.changeGroup(this.groupList[0])
    } else if (selectedGroup) {
      this.changeGroup(selectedGroup)
    } else if (this.groupList.length === 0) {
      this.prepareResolutionList('')
    }
    this.extension = (await productConfig.getExtension(this.usageModel?.extensionId)) as ExtensionModel
    if (modelId && this.condition.fromTs && this.condition.endTs) {
      await this.getUsageInfo()
    }
  }

  changeGroup(group: UsageGroupModel) {
    this.selectedGroup = group.nameEn
    this.prepareResolutionList(group.groupId)
    this.prepareTableData()
    this.getLineChartInfo()
    this.getBarChartInfo()
  }

  prepareResolutionList(groupId: string) {
    this.resolutionList = []
    const projectSetting = user.info.settings[this.condition.projectId]
    this.resolutionList = this.allResolutionList.filter((resolution) => resolution.groupId === groupId)
    this.resolutionList = this.resolutionList.filter((resolution) => {
      if (!resolution.settingValue) {
        return true
      }
      if (
        resolution.settingValue &&
        projectSetting &&
        this.usageModel?.settingValue &&
        projectSetting[this.usageModel?.settingValue] &&
        projectSetting[this.usageModel?.settingValue].includes(resolution.settingValue)
      ) {
        return true
      }
      return false
    })
    // TODO(sun): 处理重复的计量项
    for (let i = 1; i < this.resolutionList.length; i++) {
      if (this.resolutionList[i].resolutionId === this.resolutionList[i - 1].resolutionId) {
        this.resolutionList.splice(i, 1)
        break
      }
    }
  }

  initCondition() {
    this.condition.vids = this.$route.query.vids as string
    this.condition.projectId = this.$route.query.projectId as string
    this.condition.business = this.usageModel!.fetchParams.business
    this.condition.model = this.usageModel!.fetchParams.model
    this.condition.modelId = this.usageModel!.modelId
    this.settings = []
    const projectSetting = user.info.settings[this.condition.projectId]
    if (projectSetting && this.usageModel?.settingValue) {
      this.settings = [...(projectSetting[this.usageModel?.settingValue] || [])]
    }
  }

  changeDate(dateCondition: UsageDateCondition) {
    this.condition.intervalType = dateCondition.intervalType
    this.condition.timeType = dateCondition.timeType
    this.condition.fromTs = dateCondition.fromTs
    this.condition.endTs = dateCondition.endTs
    this.condition.modelId = this.$route.query.modelId as string
    this.$router.push({ query: Object.assign({}, this.condition) as any })
  }

  async getUsageInfo() {
    this.loading = true
    try {
      // 峰值累加配置
      const aggregateSettingValue = this.usageModel?.fetchParams.aggregateSettingValue
      if (
        this.usageModel?.fetchParams.aggregate &&
        ((aggregateSettingValue && this.settings.includes(aggregateSettingValue)) || !aggregateSettingValue)
      ) {
        const ret = await this.$http.get(`/api/v2/usage/usageInfoBySku`, {
          params: Object.assign({}, this.condition, { aggregate: 1 }),
        })
        this.data = ret.data
      } else {
        const ret = await this.$http.get(`/api/v2/usage/usageInfoBySku`, { params: Object.assign({}, this.condition) })
        this.data = ret.data
      }

      if (this.data.length === 0) {
        this.isEmpty = true
        this.loading = false
        return
      } else {
        this.isEmpty = false
      }
      this.prepareTableData()
      this.getLineChartInfo()
      this.getBarChartInfo()
    } catch (e) {
      this.isEmpty = true
      console.info(e)
      this.$message.error(this.$t('UsageFailed') as string)
    }
    this.loading = false
  }

  prepareTableData() {
    this.tableData = this.data.map((x: any) => {
      const rowData: Record<string, string | number> = {
        date: x.date,
        total: 0,
      }
      let total = 0
      this.resolutionList.forEach((resolution) => {
        const key = resolution.key
        const value = x[key]
        total += value
        rowData[resolution.key] = value
      })
      rowData.total = total
      return rowData
    })
  }

  getLineChartInfo() {
    let flatData = []
    const displayFormat = this.condition.timeType === TimeTypeEnum.Hourly ? 'HH:00' : 'MM-DD'
    flatData = this.data.map((x: any) => {
      return this.resolutionList.map((resolution) => {
        const key = resolution.key
        const value = x[key]
        return {
          date: moment(x.date).format(displayFormat),
          usage: value,
          type: this.isCNLang ? resolution.nameCn : resolution.nameEn,
          format:
            this.usageModel?.renderParams.renderType === UsageRenderType.Max ||
            this.usageModel?.fetchParams.model === 'fpa'
              ? 'channel'
              : null,
        }
      })
    })
    const dataArray = [].concat(...flatData)
    this.lineData = dataArray
  }

  getBarChartInfo() {
    const sumObj: Record<string, number> = {}
    this.resolutionList.map((resolution) => {
      sumObj[resolution.resolutionId] = 0
    })

    this.data.forEach((x: any) => {
      this.resolutionList.forEach((resolution) => {
        const key = resolution.key
        const value = x[key]
        if (this.usageModel?.renderParams.renderType === UsageRenderType.Max) {
          sumObj[resolution.resolutionId] =
            sumObj[resolution.resolutionId] < value ? value : sumObj[resolution.resolutionId]
        } else {
          sumObj[resolution.resolutionId] += value
        }
      })
    })
    const dataArray = this.resolutionList.map((resolution) => {
      return {
        index: resolution.resolutionId,
        type: this.isCNLang ? resolution.nameCn : resolution.nameEn,
        dataType: resolution.icon,
        value: sumObj[resolution.resolutionId],
        content: this.isCNLang ? resolution.unitCn : resolution.unitEn,
      }
    })
    this.barData = dataArray
  }
}
