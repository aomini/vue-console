import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './style.less'

@Component({
  template: `
    <div class="pricing-table">
      <div>
        <el-row class="pricing-header">
          <el-col :span="12"><div class="">Minutes per Month</div></el-col>
          <el-col :span="12"><div class="">Cost per Minute</div></el-col>
        </el-row>
        <el-row v-for="item in pricingTable">
          <el-col :span="12"
            ><div class="">{{ item.usage }}</div></el-col
          >
          <el-col :span="12"
            ><div class="">{{ item.cost }}</div></el-col
          >
        </el-row>
      </div>
    </div>
  `,
})
export default class PricingTable extends Vue {
  @Prop({ default: () => [], type: Array }) readonly pricingTable!: Record<string, unknown>
  @Prop({ type: String }) readonly planId!: string
  @Prop({ type: String }) readonly serviceName!: string
  @Prop({ type: Boolean }) readonly isHasPlan!: boolean
}
