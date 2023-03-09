import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import './Alipay.less'

@Component({
  template: `<div class="page-v3">
    <div class="card">
      <div class="card-hr">
        <h3 class="module-header m-0">
          <span class="mr-3">{{ $t('accountBalance') }}</span>
          <span class="money-blue">{{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}</span>
        </h3>
      </div>
      <div class="card-hr">
        <el-form ref="form" size="mini" class="money-input-container" label-position="top">
          <el-form-item :error="error">
            <span class="module-header" slot="label">{{ $t('rechargemoney') }}</span>
            <el-input
              ref="money"
              size="small"
              name="money"
              id="money-input"
              class="w-260"
              v-model="money"
              @blur="changeMoney"
            >
              <span slot="prefix" class="heading-dark-14 money-prefix">￥</span>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="card-hr alipay-hint heading-grey-05">
        <h3 class="module-header mt-10">{{ $t('rechargeHint') }}</h3>
        <div class="mt-20">{{ $t('rechargeRangeHint') }}</div>
        <div>{{ $t('rechargeCurrencyHint') }}</div>
        <div>{{ $t('rechargeRefundHint') }}</div>
        <div v-if="userInfo.locale === 'cn'">
          {{ $t('rechageDocHint') }} <a :href="$t('rechageDocLink')" target="_blank">{{ $t('rechageDoc') }}</a>
        </div>
      </div>
      <div class="mt-20">
        <console-button class="console-btn-primary console-btn-size-md" @click="gotoalipay">{{
          $t('gotoalipay')
        }}</console-button>
      </div>
    </div>
    <el-dialog :title='this.$t("rechargeConfirmTitle")' :visible.sync="showOverlay" width="30%" :show-close="false">
      <div>{{ $t('rechargeConfirmContent') }}</div>
      <span slot="footer" class="dialog-footer">
        <console-button class="console-btn-primary console-btn-size-md" @click="rechargeCompleted">{{
          $t('rechargeSuccess')
        }}</console-button>
        <console-button class="console-btn-white console-btn-size-md" @click="showOverlay = false">{{
          $t('rechargeCancel')
        }}</console-button>
      </span>
    </el-dialog>
  </div>`,
})
export default class AlipayView extends Vue {
  cashInfo: any = {}
  money: any = ''
  showOverlay = false
  userInfo: any = user.info
  labelwith = '80px'
  error = ''

  async mounted() {
    const ret = await getCashInfo(true)
    if (!ret) {
      this.$alert(this.$t('cashInfoErrmMg') as string, this.$t('cashInfoErrTitle') as string)
      return
    }
    this.cashInfo = ret
    if (this.cashInfo.accountCurrency !== 'CNY' || this.userInfo.company.country !== 'CN') {
      this.$router.push({ name: 'finance.creditCard' })
      return
    }
    if (this.cashInfo.accountBalance < 0) {
      this.money = -this.cashInfo.accountBalance
    }
    if (this.userInfo.locale === 'en') {
      this.labelwith = '130px'
    }
    ;((this.$refs.money as any).$el as any).children[0].focus()
  }

  changeMoney() {
    if (this.money) {
      this.money = parseFloat(this.money).toFixed(2)
    } else {
      this.error = this.$t('moneyInputHint') as string
      return
    }
    if (isNaN(this.money) || this.money < 1) {
      this.error = this.$t('moneyInputHint') as string
    } else {
      this.error = ''
    }
  }

  gotoalipay() {
    if (!this.money) {
      this.$message.warning(this.$t('moneyInputHint') as string)
      return
    }
    const money = parseFloat(this.money)
    if (!money || money < 1) {
      this.$message.warning(this.$t('moneyInputHint') as string)
      return
    }
    window.open(`/action/recharge?money=${money}`, '_blank')
    this.showOverlay = true
  }

  async rechargeCompleted() {
    const ret = await getCashInfo(true)
    this.cashInfo = ret
    this.showOverlay = false
  }
}
