import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
const PaySuccessImg = require('@/assets/icon/pay-success.png')

@Component({
  template: `<div class="card">
    <div class="card-body mt-20 mb-20">
      <div class="text-center">
        <img class="mb-20" width="102" :src="PaySuccessImg" alt="" />
        <h2>{{ $t('paySuccess') }}</h2>
        <p class="mb-4">{{ $t('havePayedText') }} {{ amount | formatMoney(cashInfo.accountCurrency) }}</p>
        <router-link :to="{ name: 'finance.alipay' }" class="btn btn-ag-primary mr-3" v-if='type === "alipay"'>{{
          $t('returnPayPage')
        }}</router-link>
        <router-link
          :to="{ name: 'finance.creditCard' }"
          class="btn btn-ag-primary mr-3"
          v-if='type === "creditCard"'
          >{{ $t('returnPayPage') }}</router-link
        >
        <router-link
          :to="{ name: 'finance.transactions', query: { type: '4' } }"
          v-if='type === "alipay"'
          class="btn btn-outline-ag-primary"
          >{{ $t('returnTrans') }}</router-link
        >
        <router-link
          :to="{ name: 'finance.transactions', query: { type: '5' } }"
          v-if='type === "creditCard"'
          class="btn btn-outline-ag-primary"
          >{{ $t('returnTrans') }}</router-link
        >
      </div>
    </div>
  </div>`,
})
export default class PaySuccess extends Vue {
  @Prop({ default: '', type: String }) readonly type!: string
  @Prop({ default: '', type: String }) readonly amount!: string
  @Prop({ default: {} }) readonly cashInfo!: any

  PaySuccessImg = PaySuccessImg
}
