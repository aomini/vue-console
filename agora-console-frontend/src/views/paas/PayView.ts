import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { getCashInfo } from '@/services'
import { omitBy } from 'lodash'
import numeral from 'numeral'
import './style/pay.less'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import { Watch } from 'vue-property-decorator'
const SuccessImg = require('@/assets/icon/pic-success.png')
const FailImg = require('@/assets/icon/pic-fail.png')

@Component({
  components: {
    'two-factor-confirm': TwoFactorConfirm,
  },
  template: `
    <div class="min-pay" v-loading="loading">
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
            <el-table-column :label="$t('Product description')">
              <template slot-scope="scope">
                <span v-html="scope.row.productInfo"></span>
              </template>
            </el-table-column>
            <el-table-column prop="number" :label="$t('Number')"> </el-table-column>
            <el-table-column :label="$t('Cost')">
              <template slot-scope="scope">
                <span>{{ numeral(scope.row.cost).format('0,0.00') }} * {{ packageCount }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <template v-if="step === 2">
          <p class="title">{{ $t('Pending order') }}</p>
          <div class="table">
            <div class="header">
              <div class="amount">
                <span>
                  {{ $t('Amount Due') }}
                  <span class="money">{{ getCurrency }}{{ numeral(getTotalAmout).format('0,0.00') }}</span>
                </span>
              </div>
            </div>
            <div class="wrapper" v-for="item in tableData" :key="item.id">
              <span
                >{{ item.productName }} <span v-html="item.productInfo"></span> {{ $t('Number') }}
                {{ item.number }}</span
              >
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
                <span>{{ $t('Available Balance') }} {{ getCurrency }} {{ account.accountBalance }}</span>
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
                    <el-option v-for="item in cardList" :key="item.id" :label="getCardInfo(item)" :value="item.id">
                    </el-option>
                  </el-select>
                  <router-link :to="toAddCard">{{ $t('Add a card') }}</router-link>
                </div>
                <span v-if="!isAliPay && !isCreditCardPay" style="color: #FF3B30">{{ $t('PayType Tooltip') }}</span>
                <span v-if="isAliPay || isCreditCardPay"
                  >{{ $t('Pay') }}{{ getCurrency }}
                  {{
                    isUsedBalance ? numeral(getAmount).format('0,0.00') : numeral(getTotalAmout).format('0,0.00')
                  }}</span
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
            <div v-if="tableData.length > 0" class="order-container">
              <div class="order-info">
                <div v-for="(item, index) in tableData" :key="item.id">
                  <div class="inline w-80">{{ index === 0 ? $t('Order Info') : '' }}</div>
                  <span>{{ item.productName }} <span v-html="getDescription"></span> {{ item.number }}</span>
                </div>
              </div>
            </div>
            <console-button
              class="console-btn-primary"
              size="lg"
              @click="toManagement"
              style="margin-top: 20px; width: 100px;"
              >{{ $t('Ok') }}</console-button
            >
          </div>
          <div class="result" v-if="!isPaySuccess">
            <img width="102" :src="FailImg" />
            <p style="color: #191919; font-size: 18px; margin: 30px 0 5px 0; font-weight: 500">
              {{ $t('Payment fail') }}!
            </p>
            <p v-if="country === 'CN'">{{ $t('Payment fail Tooltip CN', { phone: '400-632-6626' }) }}</p>
            <p v-else>{{ $t('Payment fail Tooltip ROW', { email: 'support@agora.io' }) }}</p>
            <console-button
              class="console-btn-primary"
              size="lg"
              @click="toManagement"
              style="margin-top: 20px; width: 100px;"
              >{{ $t('Back') }}</console-button
            >
          </div>
        </template>
      </div>

      <div class="card" v-if="step === 1">
        <div class="text-right voucher">
          <el-checkbox v-model="hasVoucher" class="voucher-check" @change="hasVoucherChange">
            {{ $t('hasVoucher') }}
          </el-checkbox>
          <div v-if="hasVoucher" class="mt-10">
            <el-input
              v-model="voucherCode"
              class="voucher-input"
              :placeholder="$t('Please Input Voucher Code')"
            ></el-input>
            <console-button class="console-btn-primary" size="lg" @click="checkVoucher" :loading="voucherLoading">{{
              $t('Apply')
            }}</console-button>
          </div>
          <div v-show="voucherErrMsg" class="voucher-errMsg">{{ voucherErrMsg }}</div>
        </div>
        <hr />
        <div class="tool">
          <div class="amount">
            <div v-if="showVoucherAmount">
              <template>
                <div class="flex-box">
                  <div class="money-label">
                    <span>{{ $t('Bill amount') }}</span>
                  </div>
                  <span class="ml-47">{{ getCurrency }} {{ numeral(getOrderAmount).format('0,0.00') }}</span>
                </div>
              </template>
            </div>
            <div>
              <template v-if="showVoucherAmount">
                <div class="flex-box mb-4">
                  <div class="money-label">
                    <el-tooltip placement="left" effect="light">
                      <div slot="content">
                        <div class="voucher-title" style="font-weight:500;color: #333333;font-size:14px;">
                          {{ voucherInfo.name }}
                        </div>
                        <br />
                        <div style="font-size:12px;margin-bottom:10px;">{{ voucherInfo.description }}</div>
                        <div style="font-size:12px;light-height:17px">
                          {{ $t('15006', { companyQuota: voucherInfo.companyQuota }) }}<br />
                          {{ $t('NeedAuth') }}<br />
                          {{
                            $t('voucherTip', {
                              voucherMoethod: voucherMethodMap[voucherInfo.discountType],
                              currency: getCurrency,
                              voucherAmount: voucherInfo.voucherAmount
                            })
                          }}
                        </div>
                      </div>
                      <i class="fa fa-question-circle" style="margin-right: 5px;font-size:14px"></i>
                    </el-tooltip>
                    <span>{{ $t('Discount amount') }}</span>
                  </div>
                  <span class="ml-47">- {{ getCurrency }} {{ getVoucherAmount }}</span>
                </div>
              </template>
            </div>
            <div>
              <template>
                <div class="flex-box">
                  <div class="money-label">
                    <span>{{ $t('Amount to pay') }}</span>
                  </div>
                  <span class="money ml-47"
                    >{{ getCurrency
                    }}{{ isNaN(getTotalAmout) ? '0.00' : numeral(getTotalAmout).format('0,0.00') }}</span
                  >
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="text-right">
          <console-button class="console-btn-primary" size="lg" @click="next" :disabled="packageInfoError">{{
            $t('Pay now')
          }}</console-button>
        </div>
      </div>

      <div class="card" v-if="step === 2">
        <div class="tool">
          <div class="amount">
            <span v-if="isUsedBalance">
              {{ $t('Amount Due') }} {{ getCurrency }} {{ getTotalAmout }} - {{ $t('Balance') }} {{ getCurrency }}
              {{ balancePrice }} =
              {{ this.balancePrice >= this.getTotalAmout ? '' : isCreditCardPay ? $t('Credit card') : '' }}
              <span class="money">{{ getCurrency }} {{ numeral(getAmount).format('0,0.00') }}</span>
            </span>
            <span v-if="!isUsedBalance">
              {{ $t('Amount Due') }}
              <span class="money"> {{ getCurrency }} {{ numeral(getTotalAmout).format('0,0.00') }}</span>
            </span>
          </div>
        </div>

        <div class="text-right">
          <console-button class="console-btn-primary" size="lg" @click="pay">{{ $t('Pay now') }}</console-button>
        </div>

        <div v-if="showTwoFactorVerification">
          <two-factor-confirm
            :afterSuccess="() => pay()"
            :afterFail="() => {}"
            :cancelVerification="() => showTwoFactorVerification = false"
          >
          </two-factor-confirm>
        </div>

        <el-dialog :title='this.$t("rechargeConfirmTitle")' :visible.sync="showOverlay" width="30%" :show-close="false">
          <div>{{ $t('rechargeConfirmContent') }}</div>
          <span slot="footer">
            <console-button class="console-btn-primary" @click="payCompleted">{{
              $t('rechargeSuccess')
            }}</console-button>
            <console-button class="console-btn-white" @click="overlayClose">{{ $t('rechargeCancel') }}</console-button>
          </span>
        </el-dialog>
      </div>
    </div>
  `,
})
export default class PayView extends Vue {
  numeral = numeral
  loading = false
  user = user
  step = 1
  packageId: any = ''
  packageCount: any = 1
  packageInfo: any = {}
  voucherInfo: any = {}
  tableData: any[] = []
  account: any = {}
  isUsedBalance = false
  balancePrice: number | (() => number | string) = 0
  cardList = []
  creditCard = ''
  error: any = false
  showOverlay = false
  transactionId = ''
  total: any = 0
  hasVoucher = false
  voucherCode = ''
  showVoucherAmount = false
  voucherErrMsg: any = ''
  showVoucehrTip = false
  voucherMethodMap = {
    1: this.$t('FixedAmount'),
  }
  VoucherPackageType = {
    Support: 1,
    MarketPlace: 2,
    Usage: 3,
  }
  paymentStatus = {
    InActive: 2,
    Active: 1,
    NotCost: 3,
  }
  showTwoFactorVerification = false
  voucherLoading = false
  packageInfoError = false
  SuccessImg = SuccessImg
  FailImg = FailImg

  @Watch('$route')
  onRouteChange() {
    this.packageId = this.$route.query && this.$route.query.packageId
    this.packageCount = this.$route.query && this.$route.query.packageCount
    this.error = this.$route.query && this.$route.query.error
    const step = (this.$route.query && this.$route.query.step) || 1
    this.step = Number(step)
  }

  mounted() {
    if (!this.checkPermission()) {
      this.$router.push({
        path: '/',
      })
    }
    this.packageId = this.$route.query && (this.$route.query.packageId as string)
    this.packageCount = this.$route.query && this.$route.query.packageCount
    this.error = this.$route.query && this.$route.query.error
    const step = (this.$route.query && this.$route.query.step) || 1
    this.step = Number(step)
    this.changeRoute({
      step: this.step,
    })
    this.init()
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
    return this.user?.info?.company?.area === 'CN' ? 'CN' : 'ROW'
  }
  get isAliPay() {
    return this.account && this.account.accountCurrency === 'CNY' && (this.country as any) === 'CN'
  }
  get isCreditCardPay() {
    return this.account && this.account.accountCurrency === 'USD' && (this.country as any) === 'ROW'
  }
  get isPaySuccess() {
    return /false/.test(String(this.error))
  }
  get toAddCard() {
    return {
      path: '/finance/deposit/addcard',
      query: {
        name: this.$route.name,
        step: this.step,
        packageId: this.packageId,
        isRenew: undefined,
      },
    }
  }
  get getTotalAmout(): any {
    return this.showVoucherAmount && this.getVoucherAmount
      ? Number(this.total) - Number(this.getVoucherAmount)
      : this.total
  }
  get getOrderAmount() {
    return this.total
  }
  // 需要充值的钱
  get getAmount() {
    return ((this.getTotalAmout as any) - (this.balancePrice as any)).toFixed(2) || 0
  }
  get isDisabled() {
    return this.account.accountBalance <= 0
  }
  get getVoucherAmount() {
    if (!this.showVoucherAmount) return 0
    if (Number(this.voucherInfo.voucherAmount) >= Number(this.getOrderAmount)) {
      return this.getOrderAmount
    } else {
      return this.voucherInfo.voucherAmount
    }
  }
  get getDescription() {
    return (
      (this.packageInfo.description && this.packageInfo.description.replace(/<br>/g, ';').replace(/<hr>/g, '')) || ''
    )
  }
  getCardInfo(item: { cardBrand: any; cardLast4: any }) {
    return this.$t('cardInfo', { brand: item.cardBrand, digit: item.cardLast4 })
  }
  async init() {
    this.loading = true
    await this.getAccount()
    await this.getPackageInfo()
    this.total = this.getTotal()
    this.checkBalance()
    if (this.packageCount && !this.packageInfoError) {
      this.tableData.push({
        productName: this.packageInfo.name,
        productInfo: this.getDescription,
        number: this.packageCount,
        cost: `${this.getCurrency}${this.getItemPrice()}`,
      })
    }
    const token = this.$route.query.token || ''
    if (token && this.step === 2) {
      await this.purchasePackage(token)
    }
    this.loading = false
  }
  refreshRoute(isError = false) {
    this.$router.replace({
      name: this.$route.name as string,
      query: {
        step: 3,
        error: isError,
      } as any,
    })
  }
  async purchasePackage(token: string | (string | null)[]) {
    this.loading = true
    let count = 0
    while (count < 3) {
      try {
        const res = await this.$http.post('/api/v2/finance/billings/marketplace-package/purchase', { token })
        this.refreshRoute()
        if (res && res.data) {
          this.packageInfo = res.data
          this.tableData.push(this.packageInfo)
        }
        break
      } catch (e) {
        count++
        if (count < 3) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }
    if (count >= 3) {
      this.refreshRoute(true)
    }
  }
  async getAccount() {
    this.account = await getCashInfo(true)
    this.isCreditCardPay && this.getCardsList()
  }
  checkPermission() {
    const permissions = this.user.info.permissions
    return this.country === 'CN' && permissions['FinanceCenter'] > 0
  }
  onChangePayType() {
    if (this.isUsedBalance) {
      this.balancePrice = this.getBalancePrice()
    } else {
      this.balancePrice = 0
    }
  }
  hasVoucherChange() {
    this.voucherInfo = {}
    this.showVoucherAmount = false
    this.voucherErrMsg = ''
    this.checkBalance()
  }
  changeRoute(obj: { step: number }) {
    this.$router.replace({
      name: this.$route.name as string,
      query: omitBy(Object.assign({}, this.$route.query, obj), (v) => v === ''),
    })
  }
  next() {
    if (this.step++ > 2) this.step = 0
    this.changeRoute({
      step: this.step,
    })
  }
  checkBalance() {
    this.isUsedBalance = this.account.accountBalance >= this.getTotalAmout && this.getTotalAmout !== 0
    this.onChangePayType()
  }
  getCardsList() {
    this.$http.get('/api/v2/finance/creditCard/cards').then((res: { data: never[] }) => {
      this.cardList = res.data
    })
  }
  getTotal() {
    return this.getCurrency === '$'
      ? (Number(this.packageInfo.priceUSD) * this.packageCount).toFixed(2)
      : (Number(this.packageInfo.priceCNY) * this.packageCount).toFixed(2)
  }
  getItemPrice() {
    return this.getCurrency === '$' ? Number(this.packageInfo.priceUSD) : Number(this.packageInfo.priceCNY)
  }
  async getPackageInfo() {
    this.tableData = []
    if (!this.packageId) return
    await this.$http
      .get(`/api/v2/package/marketplacePackage/${this.packageId}/info`)
      .then((res: { data: any }) => {
        this.packageInfo = res.data
        this.packageInfo.packageName = this.packageInfo.name
        this.packageInfo.packageId = this.packageInfo.id
      })
      .catch((e: { code: number }) => {
        if (e.code === 15008) {
          this.$message.error(this.$t('PackageInfoError') as string)
        } else {
          this.packageInfoError = true
          this.$message.error(this.$t('NetWork Error') as string)
        }
      })
  }
  getBalancePrice() {
    const balance = this.account.accountBalance
    if (balance > 0) {
      if (Number(this.getTotalAmout) > Number(balance)) {
        return balance
      } else {
        return this.getTotalAmout
      }
    } else {
      return 0
    }
  }
  async pay() {
    if (this.isUsedBalance && this.balancePrice >= this.getTotalAmout) {
      await this.payByBalance()
    } else {
      if (this.isAliPay) {
        await this.payByAliPay()
      } else if (this.isCreditCardPay) {
        if (this.creditCard === '') {
          this.$message.warning(this.$t('CreditCard Not Null') as string)
        } else {
          // await this.payByCreditCard()
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
      const packages = []
      this.packageInfo.num = this.packageCount
      packages.push(this.packageInfo)
      const params: any = {
        amount: this.getTotalAmout,
        cardId: this.creditCard,
        packages: packages,
      }

      if (this.showVoucherAmount) {
        params.voucherCode = this.voucherCode
      }
      await this.$http.post('/api/v2/finance/billings/marketplace-package/once-bill', params).then(() => {
        ;(this.$router as any).replace({
          name: this.$route.name,
          query: {
            step: 3,
            error: false,
          },
        })
        this.loading = false
      })
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('Payment fail') as string)
      this.error = true
    }
  }
  async payByAliPay() {
    const packages = []
    this.packageInfo.num = this.packageCount
    packages.push(this.packageInfo)
    const params: any = {
      packages: packages,
    }

    if (this.showVoucherAmount) {
      params.voucherCode = this.voucherCode
    }
    const transactionId = await this.$http.post('/api/v2/package-management/marketplace', params)
    this.transactionId = transactionId.data
    window.open(`/action/marketplace/recharge?money=${this.getAmount}&token=${transactionId.data}`, '_blank')
    this.showOverlay = true
  }
  toManagement() {
    this.$router.push({
      path: '/marketplace/actived',
    })
  }
  async checkVoucher() {
    if (!this.voucherCode) return
    this.showVoucherAmount = false
    this.voucherInfo = {}
    this.voucherErrMsg = ''
    const packages: any[] = []
    const purchaseItems = [this.packageInfo]
    purchaseItems.forEach((item) => {
      packages.push(item.id)
    })
    this.voucherLoading = true
    try {
      const check = await this.$http.get('/api/v2/package/minPackage/voucher/check', {
        params: {
          voucherCode: this.voucherCode,
          packageIds: packages.join(','),
          packageType: this.VoucherPackageType.MarketPlace,
        },
      })
      if (check.data.allow) {
        this.showVoucherAmount = true
        this.voucherInfo = check.data.voucherInfo
        this.checkBalance()
      } else {
        if (check.data.code === 15006) {
          this.voucherErrMsg = this.$t('15006', { companyQuota: check.data.limit })
        } else {
          this.voucherErrMsg = this.$t(check.data.code)
        }
      }
    } catch (e) {
      this.voucherErrMsg = this.$t('VoucherError')
    }
    this.voucherLoading = false
  }
  async payCompleted() {
    const check = await this.checkPayment()
    if (check) {
      this.refreshRoute()
    } else {
      this.refreshRoute(true)
    }
    this.showOverlay = false
  }
  async overlayClose() {
    const check = await this.checkPayment()
    if (check) {
      this.refreshRoute()
    }
    this.showOverlay = false
  }
  async checkPayment() {
    try {
      const payment = await this.$http.get('/api/v2/package-management/marketplace/payment/status', {
        params: { transactionId: this.transactionId },
      })
      return payment.data && payment.data.status === this.paymentStatus.Active
    } catch (e) {
      return false
    }
  }
}
