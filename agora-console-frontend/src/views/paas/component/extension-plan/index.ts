import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import './style.less'

@Component({
  template: ` <div class="extension-plan">
    <div class="extension-plan-title">
      <span>Plan</span>
    </div>
    <el-table ref="tableRadio" :data="plans" border style="width: 100%" :show-header="false" @row-click="clickRow">
      <el-table-column label="" width="35">
        <template slot-scope="scope"><el-radio v-model="id" :label="scope.row.key"></el-radio></template>
      </el-table-column>
      <el-table-column style="width: 100%;">
        <template slot-scope="scope">
          <div @click.stop="clickHtml" v-html="scope.row.value" style="word-break: break-word"></div>
        </template>
      </el-table-column>
    </el-table>
  </div>`,
})
export default class ExtensionPlan extends Vue {
  @Prop({ default: () => [], type: Array }) readonly plans!: Record<string, unknown>
  @Prop({ type: String }) readonly planId!: string
  @Prop({ type: String }) readonly serviceName!: string
  @Prop({ type: Boolean }) readonly isHasPlan!: boolean
  @Prop({ type: Function }) readonly planChange!: (v: string) => any
  private tableRadio: any
  id = ''
  isClickHtml = false
  @Watch('planId')
  planIdChange() {
    this.setId()
  }
  mounted() {
    this.setId()
  }
  setId() {
    if (!this.planId) {
      this.id = ''
    } else {
      this.id = Number(this.planId) as any
    }
  }
  clickHtml() {
    this.isClickHtml = true
    setTimeout(() => {
      this.isClickHtml = false
    }, 20)
  }
  async clickRow(item: any) {
    if (this.isClickHtml === true) {
      this.isClickHtml = false
      return
    }
    this.tableRadio = item
    if (this.isHasPlan) {
      this.isClickHtml = true
      await this.$http.put(`/api/v2/marketplace/extension/${this.serviceName}`, {
        planId: item.key?.toString(),
      })
      this.isClickHtml = false
      this.planChange(item.key?.toString())
    } else {
      this.planChange(item.key?.toString())
    }
  }
}
