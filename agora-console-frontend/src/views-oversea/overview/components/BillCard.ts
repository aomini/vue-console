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
    <div class="card-box overview-card-1" v-loading="loading">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03 card-title-row">{{ $t('Billing Center') }}</span>
        </div>
        <div class="header-right" @click="getMore">
          <span class="heading-dark-03 card-title-row">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div class="card-content">
        <div v-if="!permission" class="text-center overview-empty">
          <img height="90px" class="mr-5 my-2" :src="NoPermissionImg" />
          <div class="permission-text my-auto mx-4 heading-light-05">{{ $t('PermissionText') }}</div>
        </div>
        <div class="d-flex h-100" v-else>
          <div class="flex-1" v-if="!empty">
            <el-row :gutter="10">
              <el-col :span="12">
                <div class="overview-table-item" v-for="item in transactionTable1" :key="item.externalTransId">
                  <div class="heading-grey-13">{{ item.amount | formatMoney(item.accountCurrency) }}</div>
                  <div class="heading-grey-13">{{ item.createdTime | formatDate('YYYY-MM-DD') }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="overview-table-item" v-for="item in transactionTable2" :key="item.externalTransId">
                  <div class="heading-grey-13">{{ item.amount | formatMoney(item.accountCurrency) }}</div>
                  <div class="heading-grey-13">{{ item.createdTime | formatDate('YYYY-MM-DD') }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="flex-1" v-else>
            <div class="overview-empty text-center pb-44">
              <img height="90px" class="img mr-5 my-2" :src="NoDataImg" />
              <div class="permission-text mt-13 heading-light-05">{{ $t('NoTransaction') }}</div>
            </div>
          </div>
          <div class="w-150 text-center d-flex flex-column h-100 ml-20">
            <div class="balance-number text-truncate money flex-1">
              {{ cashAmount.accountBalance | formatMoney(cashAmount.accountCurrency) }}
            </div>
            <console-button class="console-btn-white overview-btn" @click="makePayment">{{
              $t('Recharge')
            }}</console-button>
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

  async mounted() {
    if (user.info.company.source && user.info.company.source === 2) {
      this.isCocos = true
    }
    this.loading = true
    if (this.permission) {
      try {
        const cashInfo = await getCashInfo()
        this.cashAmount = cashInfo
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
  getMore() {
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
}
