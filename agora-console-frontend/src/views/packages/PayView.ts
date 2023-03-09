import Vue from 'vue'
import { getCashInfo } from '@/services'
import { omitBy, map, assign } from 'lodash'
import { user } from '@/services/user'
import { packageType } from '@/models'
import { Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import numeral from 'numeral'
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
            <el-table-column prop="packageName" :label="$t('Product Name')"> </el-table-column>
            <el-table-column prop="description" :label="$t('Product description')"> </el-table-column>
            <el-table-column prop="num" :label="$t('Number')"> </el-table-column>
            <el-table-column :label="$t('Cost')">
              <template slot-scope="scope">
                <span>{{ getCurrency }}{{ getPrice(scope.row) }} * {{ scope.row.num }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <template v-if="step === 2">
          <p class="title">{{ $t('Pending order') }}</p>
          <div class="table">
            <div class="header">
              <div>
                <span>
                  {{ $t('Amount Due') }}
                  <span class="money">{{ getCurrency }}{{ numeral(getTotalAmout).format('0,0.00') }}</span>
                </span>
              </div>
            </div>
            <div class="wrapper" v-for="item in tableData" :key="item.id">
              <span>{{ item.packageName }} {{ item.description }} {{ $t('Number') }} {{ item.num }}</span>
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
                  <span>{{ item.packageName }} {{ getDescription(item) }} {{ $t('Number') }} {{ item.num }}</span>
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
            <console-button class="console-btn-primary" @click="toManagement" style="margin-top: 20px; width: 100px;">{{
              $t('Back')
            }}</console-button>
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
            <console-button
              class="console-btn-primary"
              size="lg"
              plain
              @click="checkVoucher"
              :loading="voucherLoading"
              >{{ $t('Apply') }}</console-button
            >
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
          <console-button class="console-btn-primary" size="lg" @click="next">{{ $t('Pay now') }}</console-button>
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
      </div>
    </div>
  `,
})
export default class PayView extends Vue {
  numeral = numeral
  loading = false
  voucherLoading = false
  user = user
  account: any = {
    accountBalance: 0,
  }
  isUsedBalance = false
  balancePrice = 0
  cardList: any = []
  creditCard = ''
  step = 1
  tableData = []
  packages: any = []
  error: any = false
  total = 0
  tryCount = 0
  showTwoFactorVerification = false
  hasVoucher = false
  voucherCode = ''
  showVoucherAmount = false
  voucherInfo: any = {}
  showVoucehrTip = false
  voucherErrMsg = ''
  packageId: any = ''
  voucherMethodMap = {
    1: this.$t('FixedAmount') as string,
  }
  SuccessImg = SuccessImg
  FailImg = FailImg

  @Watch('$route')
  onRouteChange() {
    this.packageId = this.$route.query && this.$route.query.packageId
    this.error = this.$route.query && this.$route.query.error
    const step = (this.$route.query && this.$route.query.step) || 1
    this.step = Number(step)
    if (this.step !== 3 && this.purchaseItems.length <= 0 && !this.$route.query.token) {
      this.$router.push({
        path: '/packages/minPackage',
      })
    }
  }

  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }
  get country() {
    return this.user.info && this.user.info.company && this.user.info.company.area === 'CN' ? 'CN' : 'ROW' || 'ROW'
  }
  get isAliPay() {
    return this.account && this.account.accountCurrency === 'CNY' && this.country === 'CN'
  }
  get isCreditCardPay() {
    return this.account && this.account.accountCurrency === 'USD' && this.country === 'ROW'
  }
  get isPaySuccess() {
    return /false/.test(this.error)
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
  get purchaseItems() {
    return this.$store.state.minPackageItems
  }
  get getTotalAmout() {
    return this.showVoucherAmount && this.getVoucherAmount
      ? Number(this.total) - Number(this.getVoucherAmount)
      : this.total
  }
  get getOrderAmount() {
    return this.total
  }
  get getAmount() {
    return (this.getTotalAmout - this.balancePrice).toFixed(2) || 0
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

  mounted() {
    if (!this.checkPermission()) {
      this.$router.push({
        path: '/',
      })
    }
    const step = (this.$route.query && this.$route.query.step) || 1
    this.error = this.$route.query && this.$route.query.error

    this.step = Number(step)
    this.changeRoute({
      step,
    })
    if (this.step !== 3 && this.purchaseItems.length <= 0 && !this.$route.query.token) {
      this.$router.push({
        path: '/packages/minPackage',
      })
    }
    this.init()
  }

  async init() {
    this.loading = true
    await this.getAccount()
    await this.getPackageInfo()
    this.total = this.getTotal()
    this.checkBalance()
    const token = this.$route.query.token || ''
    if (token && this.step === 2) {
      await this.purchasePackage(token as string)
    }
    this.loading = false
  }

  async purchasePackage(token: string) {
    this.loading = true
    let count = 0
    while (count < 3) {
      try {
        await this.$http.post('/api/v2/finance/billings/package/purchase', { token })
        ;(this.$router as any).replace({
          name: this.$route.name,
          query: {
            step: 3,
            error: false,
          },
        })
        break
      } catch (e) {
        count++
        if (count < 3) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }
    if (count >= 3) {
      ;(this.$router as any).replace({
        name: this.$route.name,
        query: {
          step: 3,
          error: true,
        },
      })
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
  getPrice(item: any) {
    return this.getCurrency === '￥' ? Number(item.priceCNY).toFixed(2) : Number(item.priceUSD).toFixed(2)
  }
  getDescription(item: any) {
    return (item.description && item.description.replace(/<br>/g, ';').replace(/<hr>/g, '')) || ''
  }
  getCardsList() {
    this.$http.get('/api/v2/finance/creditCard/cards').then((res: any) => {
      this.cardList = res.data
    })
  }

  getTotal() {
    return this.purchaseItems
      .reduce((count: number, item: any) => count + Number(this.getPrice(item)) * item.num, 0)
      .toFixed(2)
  }
  async getPackageInfo() {
    const packageIds = map(this.purchaseItems, 'packageId')
    try {
      const ret = await this.$http.get('/api/v2/package/minPackage/list', {
        params: { packageIds: packageIds.join(',') },
      })
      this.packages = ret.data
      this.purchaseItems.forEach((item: any) => {
        this.packages.forEach((packageInfo: any) => {
          if (item.packageId === packageInfo.id) {
            item = assign(item, packageInfo)
          }
        })
      })
      this.tableData = this.purchaseItems
    } catch (e) {
      this.$message.error(this.$t('NetWork Error') as string)
    }
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

  onChangePayType() {
    if (this.isUsedBalance) {
      this.balancePrice = this.getBalancePrice()
    } else {
      this.balancePrice = 0
    }
  }
  toAddCard() {
    return {
      path: '/finance/deposit/addcard',
      query: {
        name: this.$route.name,
        step: this.step,
        fromUrl: '/support/pay',
      },
    }
  }

  changeRoute(obj: any) {
    ;(this.$router as any).replace({
      name: this.$route.name,
      query: omitBy(Object.assign({}, this.$route.query, obj), (v) => v === ''),
    })
  }
  next() {
    if (this.step++ > 2) this.step = 0
    this.changeRoute({
      step: this.step,
    })
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
          await this.payByCreditCard()
        }
      } else {
        this.$message.warning(this.$t('Please recharge at the expense center') as string)
      }
    }
    this.showTwoFactorVerification = false
  }

  async payByCreditCard() {
    try {
      this.loading = true
      const params: any = {
        money: this.isUsedBalance ? this.getAmount : this.getTotalAmout,
        amount: this.getTotalAmout,
        cardId: this.creditCard,
        packages: this.purchaseItems,
      }

      if (this.showVoucherAmount) {
        params.voucherCode = this.voucherCode
      }
      await this.$http.post('/api/v2/finance/creditCard/package/charge/createOnceBill', params).then(() => {
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

  async payByBalance() {
    try {
      this.loading = true
      const params: any = {
        amount: this.getTotalAmout,
        cardId: this.creditCard,
        packages: this.purchaseItems,
      }

      if (this.showVoucherAmount) {
        params.voucherCode = this.voucherCode
      }
      await this.$http.post('/api/v2/finance/billings/package/once-bill', params).then(() => {
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
      if (e.response && e.response.data.code) {
        this.$message.warning(this.$t(e.response.data.code) as string)
      } else {
        this.$message.error(e.message)
      }
      this.error = true
    }
  }

  toManagement() {
    this.$router.push({
      path: '/packages',
    })
  }
  hasVoucherChange() {
    this.voucherInfo = {}
    this.showVoucherAmount = false
    this.voucherErrMsg = ''
    this.checkBalance()
  }
  checkBalance() {
    this.isUsedBalance = this.account.accountBalance >= this.getTotalAmout && this.getTotalAmout !== 0
    this.onChangePayType()
  }

  async payByAliPay() {
    try {
      const params: any = {
        packages: this.purchaseItems,
      }

      if (this.showVoucherAmount) {
        params.voucherCode = this.voucherCode
      }
      const res = await this.$http.post('/api/v2/package-management/min', params)
      ;(window as any).location = `/action/package/recharge?money=${this.getAmount}&token=${res.data}`
    } catch (e) {
      if (e.response && e.response.data.code) {
        this.$message.warning(this.$t(e.response.data.code) as string)
      } else {
        this.$message.error(e.message)
      }
    }
  }

  async checkVoucher() {
    if (!this.voucherCode) return
    this.showVoucherAmount = false
    this.voucherInfo = {}
    this.voucherErrMsg = ''
    const packages: any = []
    this.purchaseItems.forEach((item: any) => {
      packages.push(item.id)
    })
    this.voucherLoading = true
    try {
      const check = await this.$http.get('/api/v2/package/minPackage/voucher/check', {
        params: {
          voucherCode: this.voucherCode,
          packageIds: packages.join(','),
          packageType: packageType.MinPackage,
        },
      })
      if (check.data.allow) {
        this.showVoucherAmount = true
        this.voucherInfo = check.data.voucherInfo
        this.checkBalance()
      } else {
        if (check.data.code === 15006) {
          this.voucherErrMsg = this.$t('15006', { companyQuota: check.data.limit }) as string
        } else {
          this.voucherErrMsg = this.$t(check.data.code) as string
        }
      }
    } catch (e) {
      this.voucherErrMsg = this.$t('VoucherError') as string
    }
    this.voucherLoading = false
  }
}
