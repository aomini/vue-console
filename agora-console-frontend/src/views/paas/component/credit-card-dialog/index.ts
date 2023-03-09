import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './style.less'

@Component({
  template: `<el-dialog :visible.sync="visible" title="Please add a credit card" :show-close="false" width="400px">
    <div class="credit-card-dialog">
      <div class="tip">
        To subscribe to this extension, please add a debit or credit card to complete your subscription.
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="confirm" type="primary">Add a Card</el-button>
      <el-button @click="cancel">Cancel</el-button>
    </span>
  </el-dialog>`,
})
export default class CreditCardDialog extends Vue {
  @Prop({ default: false, type: Boolean }) readonly visible!: boolean
  @Prop({ type: Function }) readonly confirm!: () => any
  @Prop({ type: Function }) readonly cancel!: () => any
}
