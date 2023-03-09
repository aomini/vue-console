import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo } from '@/services'
import PaySuccess from '@/views-oversea/finance/deposit/callback/PaySuccess'
import PayError from '@/views-oversea/finance/deposit/callback/PayError'

@Component({
  components: {
    'pay-success': PaySuccess,
    'pay-error': PayError,
  },
  template: `
    <div>
      <h3 class="module-title">{{ $t('alipay') }}</h3>
      <pay-success :cash-info="cashInfo" :amount="money" v-if="!isErr" type="alipay"></pay-success>
      <pay-error :cash-info="cashInfo" :amount="money" v-if="isErr" type="alipay"></pay-error>
    </div>
  `,
})
export default class AliCallback extends Vue {
  money: any = 0
  isErr = false
  cashInfo: any = {}

  async mounted() {
    this.money = this.$route.query.total_amount
    this.isErr = !!this.$route.query.error
    this.cashInfo = await getCashInfo(true)
    try {
      if (this.$route.query.token) {
        await this.$http.put('/api/v2/finance/billings/package/ali-notify', {
          token: this.$route.query.token,
          isErr: this.isErr,
        })
      }
    } catch (e) {}
  }
}
