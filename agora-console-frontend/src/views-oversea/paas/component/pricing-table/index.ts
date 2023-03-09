import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './style.less'

@Component({
  template: `
    <div class="pricing-table">
      <div class="list-title cursor-pointer" v-if="hasSubscribed" @click="setShowStep()">
        <span>< </span>{{ $t('Pricing') }}
      </div>
      <div>
        <el-row class="pricing-header">
          <el-col :span="12"
            ><div class="">{{ pricingTableHeader.usage }}</div></el-col
          >
          <el-col :span="12"
            ><div class="">{{ pricingTableHeader.cost }}</div></el-col
          >
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
  @Prop({ default: null, type: Function }) setShowStep!: () => Promise<void>
  @Prop({ default: () => [], type: Array }) readonly pricingTable!: Record<string, unknown>
  @Prop({ default: { usage: 'Minutes per Month', cost: 'Cost per Minute' }, type: Object })
  readonly pricingTableHeader!: any
  @Prop({ type: String }) readonly planId!: string
  @Prop({ type: String }) readonly serviceName!: string
  @Prop({ type: Boolean }) readonly isHasPlan!: boolean
  @Prop({ type: Boolean, default: false }) readonly hasSubscribed!: boolean
}
