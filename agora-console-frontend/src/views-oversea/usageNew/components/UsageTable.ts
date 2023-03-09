import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { Prop } from 'vue-property-decorator'
import { UsageResolutionModel, UsageRenderType } from '../../../models/usageModel'

@Component({
  template: `
    <el-table
      v-if="renderType === UsageRenderType.Max"
      :data="tableData"
      stripe
      :default-sort="{ prop: 'date', order: 'descending' }"
      :empty-text='$t("UsageEmptyText")'
      show-summary
      :summary-method="getSummariesForMax"
    >
      <el-table-column
        prop="date"
        :label='this.$t("date")'
        label-class-name="table-title"
        class-name="table-content"
        :sortable="true"
      >
      </el-table-column>
      <template v-for="resolution in resolutionList">
        <el-table-column :prop="resolution.key" :key="modelId + resolution.key">
          <template v-slot:header>
            {{ isCNLang ? resolution.nameCn : resolution.nameEn }}
          </template>
          <template slot-scope="scope">
            {{ scope.row[resolution.key] | formatUsage('bandwidth') }}
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-table
      v-else
      :data="tableData"
      stripe
      :default-sort="{ prop: 'date', order: 'descending' }"
      :empty-text='$t("UsageEmptyText")'
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column prop="date" :label='this.$t("date")' :sortable="true"></el-table-column>
      <template v-for="resolution in resolutionList">
        <el-table-column :prop="resolution.key" :key="modelId + resolution.key">
          <template v-slot:header>
            {{ isCNLang ? resolution.nameCn : resolution.nameEn }}
          </template>
          <template slot-scope="scope">
            {{ scope.row[resolution.key] | formatUsage(model) }}
          </template>
        </el-table-column>
      </template>
      <el-table-column
        prop="total"
        :label='this.$t("total")'
        label-class-name="table-title"
        class-name="table-content font-weight-bold"
      >
        <template slot-scope="scope">
          {{ scope.row.total | formatUsage(model) }}
        </template>
      </el-table-column>
    </el-table>
  `,
})
export default class UsageTable extends Vue {
  @Prop({ default: [], type: Array }) readonly tableData!: any
  @Prop({ default: [], type: Array }) readonly resolutionList!: UsageResolutionModel[]
  @Prop({ default: '' }) renderType!: number
  @Prop({ default: '' }) modelId!: string
  @Prop({ default: 'usage' }) model!: string
  user = user
  isCNLang = user.info.language === 'chinese'
  UsageRenderType = UsageRenderType

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
          this.model
        )
      } else {
        sums[index] = 'N/A'
      }
    })
    return sums
  }

  getSummariesForMax(param: any) {
    const { columns, data } = param
    const max: any = []
    columns.forEach((column: any, index: number) => {
      if (index === 0) {
        max[index] = this.$t('max')
        return
      }
      const values = data.map((item: any) => Number(item[column.property]))
      if (!values.every((value: any) => isNaN(value))) {
        max[index] = (this.$options.filters as any).formatUsage(Math.max(...values), 'bandwidth')
      } else {
        max[index] = 'N/A'
      }
    })
    return max
  }
}
