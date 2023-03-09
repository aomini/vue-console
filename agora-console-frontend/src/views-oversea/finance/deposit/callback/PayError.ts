import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
const PayFailImg = require('@/assets/icon/pay-fail.png')

@Component({
  template: `<div class="card">
    <div class="card-body mt-20 mb-20">
      <div class="text-center">
        <img class="mb-20" width="102" :src="PayFailImg" alt="" />
        <h2>{{ $t('payFail') }}</h2>
        <p class="mb-4">{{ $t('payFailSub', { amount: money }) }}</p>
        <router-link :to="{ name: 'finance.alipay' }" class="btn btn-ag-primary mr-3" v-if='type === "alipay"'>{{
          $t('tryAgain')
        }}</router-link>
        <router-link
          :to="{ name: 'finance.creditCard', query: { amount } }"
          class="btn btn-ag-primary mr-3"
          v-if='type === "creditCard"'
          >{{ $t('tryAgain') }}</router-link
        >
      </div>
    </div>
  </div>`,
})
export default class PayError extends Vue {
  @Prop({ default: '', type: String }) readonly type!: string
  @Prop({ default: '', type: String }) readonly amount!: string
  @Prop({ default: {} }) readonly cashInfo!: any

  PayFailImg = PayFailImg

  get money() {
    return (this.$options.filters as any).formatMoney(this.amount, this.cashInfo.accountCurrency)
  }
}
