import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import moment from 'moment'
import { user, getCashInfo } from '@/services'
import { omitBy } from 'lodash'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
const SuccessImg = require('@/assets/icon/pic-success.png')
const FailImg = require('@/assets/icon/pic-fail.png')

@Component({
  components: {
    'two-factor-confirm': TwoFactorConfirm,
  },
  template: ` <div class="support-pay" v-loading="loading">
    <div class="module-title">{{ getTitle }}</div>
    <div class="card">
      <el-steps :active="step" finish-status="success" simple>
        <el-step :title="$t('Confirm your order')"></el-step>
        <el-step :title="$t('Payment method')"></el-step>
        <el-step :title="$t('Payment complete')"></el-step>
      </el-steps>
      <template v-if="step === 1">
        <p class="title">{{ $t('Pending order') }}</p>
        <el-table :data="tableData" border stripe>
          <el-table-column prop="productName" :label="$t('Product Name')"> </el-table-column>
          <el-table-column prop="productInfo" :label="$t('Product description')">
            <template slot-scope="scope">
              <div v-html="scope.row.productInfo">{{ scope.row.productInfo }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="number" :label="$t('Number')"> </el-table-column>
          <el-table-column prop="cost" :label="$t('Cost')"> </el-table-column>
        </el-table>
      </template>
      <template v-if="step === 2">
        <p class="title">{{ $t('Pending order') }}</p>
        <div class="table" style="height: auto;">
          <div class="header">
            <div class="amount">
              <span>
                {{ $t('Amount Due') }}
                <span class="money">{{ getCurrency }}{{ getShould }}</span>
              </span>
            </div>
          </div>
          <div class="wrapper" style="height: auto;">
            <p>{{ packageInfo.name }}</p>
            <p v-html="getDescription">{{ getDescription }}</p>
            <p>{{ $t('Number') }} 1</p>
          </div>
        </div>
        <p class="title">{{ $t('Payment method') }}</p>
        <div class="pay-tooltip">{{ $t('Pay Tooltip') }}</div>
        <div class="pay-type">
          <div class="table">
            <div class="header">
              <el-checkbox v-model="isUsedBalance" @change="onChangePayType" :disabled="isDisabled">
                {{ $t('Pay via balance') }}
              </el-checkbox>
              <el-tooltip placement="top" :content="$t('Balance Pay Tooltip')">
                <i class="fa fa-question-circle" style="margin-left: 5px"></i>
              </el-tooltip>
            </div>
            <div class="wrapper">
              <span>{{ $t('Available Balance') }} {{ getCurrency }}{{ account.accountBalance }}</span>
              <span>{{ $t('Pay') }} {{ getCurrency }}{{ balancePrice }}</span>
            </div>
          </div>
          <div class="table">
            <div class="header">
              {{ $t('Other Payment method') }}
            </div>
            <div class="wrapper">
              <el-radio v-if="isAliPay">{{ $t('AliPay') }}</el-radio>
              <div v-if="isCreditCardPay">
                <el-radio>{{ $t('Credit card') }}</el-radio>
                <el-select v-model="creditCard" size="mini">
                  <el-option
                    v-for="item in cardList"
                    :key="item.id"
                    :label="$t('cardInfo', { brand: item.cardBrand, digit: item.cardLast4 })"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
                <router-link :to="toAddCard">{{ $t('Add a card') }}</router-link>
              </div>
              <span v-if="!isAliPay && !isCreditCardPay" style="color: #FF3B30">{{ $t('PayType Tooltip') }}</span>
              <span v-if="isAliPay || isCreditCardPay"
                >{{ $t('Pay') }} {{ getCurrency }}{{ isUsedBalance ? getAmount : getShould }}</span
              >
            </div>
          </div>
        </div>
      </template>
      <template v-if="step === 3">
        <div class="result" v-if="isPaySuccess">
          <img width="102" :src="SuccessImg" />
          <p style="color: #191919; font-size: 18px; margin: 30px 0 5px 0; font-weight: 500">
            {{ $t('Payment complete') }}!
          </p>
          <!-- <p>{{ $t('Invoice Tooltip1') }}
            <a href="/finance/receipt">{{ $t('Invoice Management') }}</a>
            {{ $t('Invoice Tooltip2') }}
            <a href="/finance/receipt">{{ $t('Apply Invoice') }}</a>
          </p> -->
          <el-table :data="tableData" border stripe>
            <el-table-column prop="productName" :label="$t('Product Name')"> </el-table-column>
            <el-table-column prop="productInfo" :label="$t('Product description')">
              <template slot-scope="scope">
                <div v-html="scope.row.productInfo">{{ scope.row.productInfo }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="number" :label="$t('Number')"> </el-table-column>
          </el-table>
          <el-button type="primary" @click="toSupportPlan" style="margin-top: 20px; width: 100px;"
            >{{ $t('Ok') }}
          </el-button>
        </div>
        <div class="result" v-if="!isPaySuccess">
          <img width="102" :src="FailImg" />
          <p style="color: #191919; font-size: 18px; margin: 30px 0 5px 0; font-weight: 500">
            {{ $t('Payment fail') }} !
          </p>
          <p>{{ $t('Payment fail Tooltip1') }}</p>
          <p>{{ $t('Payment fail Tooltip2', { phone: country === 'CN' ? '400-632-6626' : 'support@agora.io' }) }}</p>
        </div>
      </template>
    </div>
    <div class="card" v-if="step === 1">
      <div class="pay-tooltip" v-if="!isRenew">
        {{
          $t('OldPackage Tooltip', {
            package:
              oldPackageInfo.supportPackage.isPublic === NoPublic
                ? $t('Customized Package')
                : oldPackageInfo.supportPackage.name
          })
        }}
        <span class="money">{{ getCurrency }}{{ oldPackageReducedPrice }}</span>
      </div>
      <div class="tool">
        <div class="amount">
          <span>
            <template v-if="!isRenew">
              {{ $t('Order Amount') }}
              <span class="money">{{ getCurrency }}{{ total }}</span> - {{ $t('Discount') }} {{ getCurrency
              }}{{ oldPackageReducedPrice }} = {{ $t('Amount Due') }} {{ getCurrency }} {{ getShould }}
            </template>
            <template v-if="isRenew">
              {{ $t('Amount Due') }} <span class="money">{{ getCurrency }} {{ getShould }}</span>
            </template>
          </span>
        </div>
        <el-button type="primary" @click="next">{{ $t('Pay now') }}</el-button>
      </div>
    </div>
    <div class="card" v-if="step === 2">
      <div class="tool">
        <div class="amount">
          <span v-if="isUsedBalance">
            {{ $t('Amount Due') }} {{ getCurrency }} {{ getShould }} - {{ $t('Balance') }} {{ getCurrency
            }}{{ balancePrice }} =
            {{ this.balancePrice >= this.getShould ? '' : isCreditCardPay ? $t('Credit card') + $t('Pay') : '' }}
            <span class="money">{{ getCurrency }}{{ getAmount }}</span>
          </span>
          <span v-if="!isUsedBalance">
            {{ $t('Amount Due') }} <span class="money">{{ getCurrency }}{{ getShould }}</span>
          </span>
        </div>
        <el-button type="primary" @click="() => showTwoFactorVerification = true">{{ $t('Pay now') }}</el-button>
      </div>
    </div>
    <el-dialog :title='this.$t("rechargeConfirmTitle")' :visible.sync="showOverlay" width="30%" :show-close="false">
      <div>{{ $t('rechargeConfirmContent') }}</div>
      <span slot="footer" class="dialog-footer">
        <button class="btn btn-ag-primary mr-1" @click="rechargeCompleted">{{ $t('rechargeSuccess') }}</button>
        <button class="btn btn-outline-ag-primary" @click="showOverlay = false">{{ $t('rechargeCancel') }}</button>
      </span>
    </el-dialog>

    <div v-if="showTwoFactorVerification">
      <two-factor-confirm
        :afterSuccess="() => pay()"
        :afterFail="() => {}"
        :cancelVerification="() => showTwoFactorVerification = false"
      ></two-factor-confirm>
    </div>
  </div>`,
})
export default class PayView extends Vue {
  loading = false
  user = user
  step = 1
  packageId: any = ''
  packageInfo: any = {}
  oldPackageInfo: any = {
    supportPackage: {
      name: '',
    },
  }
  tableData: any = []
  account: any = {
    accountBalance: 0,
  }
  isUsedBalance = false
  balancePrice = 0
  cardList = []
  creditCard = ''
  error: any = false
  oldPackageReducedPrice = 0
  showOverlay = false
  total = 0
  isRenew: any = false
  NoPublic = 1
  showTwoFactorVerification = false
  SuccessImg = SuccessImg
  FailImg = FailImg

  @Watch('$route')
  onRouteChange() {
    this.packageId = this.$route.query && this.$route.query.packageId
    this.error = this.$route.query && this.$route.query.error
    const step = (this.$route.query && this.$route.query.step) || 1
    this.step = Number(step)
  }

  get getTitle() {
    const step = Number(this.step)
    if (step === 1) {
      return this.$t('Confirm your order')
    } else if (step === 2) {
      return this.$t('Payment method')
    } else {
      return this.$t('Payment complete')
    }
  }
  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }
  get country() {
    return this.user.info && this.user.info.company && this.user.info.company.area === 'CN' ? 'CN' : 'ROW' || 'ROW'
  }
  get isAliPay() {
    return false
    // return this.account && this.account.accountCurrency === 'CNY' && this.country === 'CN'
  }
  get isCreditCardPay() {
    return this.account && this.account.accountCurrency === 'USD' && this.country === 'ROW'
  }
  get isPaySuccess() {
    return /false/.test(this.error)
  }
  get toAddCard() {
    return {
      path: '/finance/deposit/addcard',
      query: {
        name: this.$route.name,
        step: this.step,
        packageId: this.packageId,
        isRenew: this.isRenew,
      },
    }
  }
  // 旧套餐折算后的钱，即需要付费的钱，不管是组合扣费还是单项扣费，需要充值getAmount，然后再从余额扣费getShould
  // 续费不用折算
  get getShould() {
    if (this.isRenew) {
      return this.total
    }
    const price = (this.total - this.oldPackageReducedPrice).toFixed(2) || 0
    if (price < 0) {
      return 0
    }
    return price
  }
  // 需要充值的钱
  get getAmount() {
    return ((this.getShould as any) - this.balancePrice).toFixed(2) || 0
  }
  get isDisabled() {
    return this.account.accountBalance <= 0
  }
  get getDescription() {
    return (
      (this.packageInfo.description && this.packageInfo.description.replace(/<br>/g, ';').replace(/<hr>/g, '')) ||
      this.$t('Nothing')
    )
  }

  mounted() {
    this.packageId = this.$route.query && this.$route.query.packageId
    this.error = this.$route.query && this.$route.query.error
    this.isRenew = (this.$route.query && this.$route.query.isRenew) || false
    this.isRenew = /true/.test(this.isRenew)
    const step = (this.$route.query && this.$route.query.step) || 1
    this.step = Number(step)
    this.changeRoute({
      step,
    })
    this.init()
  }

  async init() {
    this.loading = true
    await this.getAccount()
    await this.getPackageInfo()
    await this.getOldPackageInfo()
    this.total = this.getTotal()
    this.oldPackageReducedPrice = this.getOldPackageReducedPrice()
    this.balancePrice = this.getBalancePrice()
    this.isUsedBalance = this.account.accountBalance >= this.getShould && this.getShould !== 0
    this.tableData.push({
      productName: this.packageInfo.name,
      productInfo: this.getDescription,
      number: 1,
      cost: `${this.getCurrency}${this.total}`,
    })
    this.loading = false
  }

  async getAccount() {
    this.account = await getCashInfo()
    this.isCreditCardPay && this.getCardsList()
  }
  async getPackageInfo() {
    this.tableData = []
    await this.$http
      .get(`/api/v2/support/package/${this.packageId}/info`)
      .then((res: any) => {
        this.packageInfo = res.data
      })
      .catch(() => {
        this.$message.error(this.$t('NetWork Error') as string)
      })
  }
  async getOldPackageInfo() {
    await this.$http
      .get(`/api/v2/support/package/company`)
      .then((res: any) => {
        this.oldPackageInfo = res.data
      })
      .catch(() => {
        this.$message.error(this.$t('NetWork Error') as string)
      })
  }
  getCardsList() {
    this.$http.get('/api/v2/finance/creditCard/cards').then((res: any) => {
      this.cardList = res.data
    })
  }
  getTotal() {
    return this.getCurrency === '$' ? Number(this.packageInfo.priceUSD) : Number(this.packageInfo.priceCNY)
  }

  getBalancePrice() {
    const balance = this.account.accountBalance
    if (balance > 0) {
      if (Number(this.getShould) > Number(balance)) {
        return balance
      } else {
        return this.getShould
      }
    } else {
      return 0
    }
  }
  getOldPackageReducedPrice() {
    if (this.oldPackageInfo.supportPackage && this.oldPackageInfo.supportPackage.duration !== -1) {
      const oldPrice = this.oldPackageInfo.amount
      const newPrice = this.total
      return this.computePrice(oldPrice, newPrice, this.oldPackageInfo.effectiveDate, this.oldPackageInfo.expireDate)
    } else {
      return 0
    }
  }

  onChangePayType() {
    if (this.isUsedBalance) {
      this.balancePrice = this.getBalancePrice()
    } else {
      this.balancePrice = 0
    }
  }
  changeRoute(obj: any) {
    ;(this.$router as any).replace({
      name: this.$route.name,
      query: omitBy(Object.assign({}, this.$route.query, obj), (v: any) => v === ''),
    })
  }

  next() {
    if (this.step++ > 2) this.step = 0
    this.changeRoute({
      step: this.step,
    })
  }

  /**
   * oldPrice         旧套餐实际支付金额
   * newPrice         新套餐实际支付金额
   * effectiveDate    旧套餐开始日期
   * expireDate       旧套餐过期日期
   */

  computePrice(oldPrice: any, newPrice: any, effectiveDate: any, expireDate: any) {
    let addPrice = 0
    const duration = moment(expireDate).diff(moment(effectiveDate), 'days') + 1
    const unitPrice = oldPrice / duration

    if (moment(expireDate).isAfter(moment())) {
      const unUsedDays = moment(expireDate).diff(moment(), 'days') + 1
      addPrice = Number((unUsedDays * unitPrice).toFixed(2))
    }

    // 不可超过当前套餐的实际支付金额
    if (addPrice > oldPrice) {
      addPrice = oldPrice
    }

    // 最高折算新套餐包的价格
    if (addPrice > newPrice) {
      return newPrice
    }

    return addPrice
  }

  async pay() {
    if (this.isUsedBalance && this.balancePrice >= this.getShould) {
      await this.payByBalance()
    } else {
      if (this.isAliPay) {
        await this.payByAliPay()
      } else if (this.isCreditCardPay) {
        if (this.creditCard === '') {
          this.$message.warning(this.$t('CreditCard Not Null') as string)
        } else {
          await this.payByCreditCard()
        }
      } else {
        this.$message.warning(this.$t('Please recharge at the expense center') as string)
      }
    }
    this.showTwoFactorVerification = false
  }

  async payByBalance() {
    try {
      this.loading = true
      await this.$http
        .post('/api/v2/finance/billings/once-bill', {
          cardId: this.creditCard,
          packageId: this.packageId,
          isRenew: this.isRenew,
        })
        .then(() => {
          ;(this.$router as any).replace({
            name: this.$route.name,
            query: {
              packageId: this.packageId,
              step: 3,
              error: false,
              isRenew: this.isRenew,
            },
          })
          this.loading = false
        })
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('Payment fail') as string)
      ;(this.$router as any).replace({
        name: this.$route.name,
        query: {
          packageId: this.packageId,
          step: 3,
          error: true,
          isRenew: this.isRenew,
        },
      })
    }
  }

  async payByAliPay() {
    const money = this.isUsedBalance ? this.getAmount : this.getShould
    window.open(
      `/action/recharge/createOnceBill?money=${money}&amount=${this.getShould}&packageId=${this.packageId}&isRenew=${this.isRenew}`,
      '_blank'
    )
    this.showOverlay = true
  }

  async payByCreditCard() {
    try {
      this.loading = true
      await this.$http.post('/api/v2/finance/creditCard/charge/createOnceBill', {
        cardId: this.creditCard,
        packageId: this.packageId,
        isRenew: this.isRenew,
        isUsedBalance: this.isUsedBalance,
      })
      this.loading = false
      ;(this.$router as any).replace({
        name: this.$route.name,
        query: {
          packageId: this.packageId,
          step: 3,
          error: false,
        },
      })
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('Payment fail') as string)
      ;(this.$router as any).replace({
        name: this.$route.name,
        query: {
          packageId: this.packageId,
          step: 3,
          error: true,
          isRenew: this.isRenew,
        },
      })
    }
  }

  async rechargeCompleted() {
    this.showOverlay = false
    ;(this.$router as any).replace({
      name: this.$route.name,
      query: {
        packageId: this.packageId,
        step: 3,
        error: false,
        isRenew: this.isRenew,
      },
    })
  }
  toSupportPlan() {
    this.$router.push({
      path: '/support/plan',
    })
  }
}
