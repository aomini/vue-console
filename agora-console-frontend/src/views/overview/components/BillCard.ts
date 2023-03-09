import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { getCashInfo, user } from '@/services'
const NoPermissionImg = require('@/assets/image/not-allow.png')
const NoDataImg = require('@/assets/icon/pic-account.png')
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div class="card-box bill-card border-8 mb-24" v-loading="loading">
      <div class="card-header border-bottom p-24">
        <div class="header-title">
          <span class="f-16">{{ $t('Billing Center') }}</span>
        </div>
      </div>
      <div class="p-24">
        <div v-if="!permission" class="text-center overview-empty">
          <img height="90px" class="mr-5 my-2" :src="NoPermissionImg" />
          <div class="permission-text my-auto mx-4 heading-light-05">{{ $t('PermissionText') }}</div>
        </div>
        <div class="d-flex h-100 flex-column" v-else>
          <div class="d-flex flex-column h-100 mb-16 pb-24 border-bottom">
            <div class="neutral-color">{{ $t('accountBalance') }}</div>
            <div class="money flex-1 mb-16">
              <span> {{ cashAmount.accountBalance | formatMoney(cashAmount.accountCurrency) }} </span>
              <span class="iconfont iconzhanghuyue float-right"></span>
            </div>
            <el-row>
              <console-button class="console-btn-primary" size="sm" @click="makePayment">{{
                $t('Recharge')
              }}</console-button>
              <console-button class="console-btn-white" size="sm" @click="viewPaymentRecord">{{
                $t('PaymentRecord')
              }}</console-button>
            </el-row>
          </div>
          <div class="d-flex flex-column h-100">
            <div class="neutral-color">{{ $t('PackageRemaining') }}</div>
            <div class="money flex-1">
              <span> {{ totalRemainingUsage }} </span>
              <span class="f-14"> {{ $t('minutes') }} </span>
              <span class="iconfont iconshengyushijianfenzhong float-right"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class BillCard extends Vue {
  isCocos = user.info.isCocos
  transactionTable1 = []
  transactionTable2 = []
  cashAmount: any = {}
  loading = false
  permission = user.info.permissions['FinanceCenter'] > 0 && !user.info.isRoot
  areaIsCN = user.info.company.area === 'CN'
  NoPermissionImg = NoPermissionImg
  NoDataImg = NoDataImg
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  empty = true
  remainingMinutes: any = {}
  totalRemainingUsage: any = 0

  async mounted() {
    if (user.info.company.source && user.info.company.source === 2) {
      this.isCocos = true
    }
    this.loading = true
    if (this.permission) {
      try {
        const cashInfo = await getCashInfo()
        this.cashAmount = cashInfo
        await this.getRemainingMinutes()
        const ret = await this.$http.get(`/api/v2/finance/transactions`, { params: { page: 1, limit: 10 } })
        const transactions = ret.data.items
        if (transactions.length > 0) {
          this.empty = false
        }
        this.transactionTable1 = transactions.slice(0, 5)
        this.transactionTable1 = this.transactionTable1.concat(
          (new Array(5 - this.transactionTable1.length) as any).fill({})
        )
        this.transactionTable2 = transactions.slice(5, 10)
        this.transactionTable2 = this.transactionTable2.concat(
          (new Array(5 - this.transactionTable2.length) as any).fill({})
        )
      } catch (e) {
        this.$message.error(this.$t('getInfoErr') as string)
      }
    }
    this.loading = false
  }

  makePayment() {
    if (this.areaIsCN) {
      this.$router.push({ name: 'finance.alipay' })
    } else {
      this.$router.push({ name: 'finance.creditCard' })
    }
  }

  viewPaymentRecord() {
    this.$router.push({ name: 'finance.transactions' })
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'bill-card')
  }

  confirmDelete() {
    this.deleteCard()
  }

  async getRemainingMinutes() {
    const getRemainingMinutes = await this.$http.get(`/api/v2/usage/rtc-remaining`)
    this.remainingMinutes = getRemainingMinutes.data
    this.totalRemainingUsage = (Object.values(this.remainingMinutes) as any).reduce((x: number, y: number) => x + y, 0)
  }
}
