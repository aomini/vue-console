import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, getLifeCycleConfig, user } from '@/services'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import MyPagiation from '@/components/MyPagination'
import WithdrawPopup from '@/views/finance/transactions/WithdrawPopup'

@Component({
  components: {
    'two-factor-confirm': TwoFactorConfirm,
    'my-pagination': MyPagiation,
    WithdrawPopUp: WithdrawPopup,
  },
  template: `
    <div class="page-v3">
      <div class="module-title-tip d-flex flex-column">
        {{ $t('WithdrawHint1') }}
        <br />
        {{ $t('WithdrawHint3') }}
      </div>
      <div class="card">
        <div class="card-hr d-flex justify-between">
          <h3 class="module-header m-0">
            <span class="mr-3">{{ $t('accountBalance') }}</span>
            <span class="money-blue">{{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}</span>
          </h3>
          <console-button class="console-btn-white" size="small" @click="withdraw('new')">{{
            $t('RequestWithdraw')
          }}</console-button>
        </div>
        <el-table
          class="mt-20"
          v-loading="loading"
          :data="withdraws"
          stripe
          row-class-name="dark-table-row"
          :empty-text='$t("No Data")'
          cell-class-name="text-truncate"
          header-cell-class-name="text-truncate"
        >
          <el-table-column
            prop="requestUserEmail"
            :label='$t("RequestBy")'
            label-class-name="table-title"
            class-name="table-content"
          ></el-table-column>
          <el-table-column :label='$t("RequestDate")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.requestTime | UTC | formatDate('YYYY-MM-DD HH:mm') }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Request Amount")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.requestedAmount | formatMoney(scope.row.currency) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label='$t("Number of transactions")'
            label-class-name="table-title"
            class-name="table-content"
          >
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.refundDetailsList.length || 0 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Status")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ $t('ApprovalStatus')[scope.row.approvalStatus] || '' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Action")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div @click="withdraw('detail', scope.row)">
                <span class="link">{{ $t('Details') }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt-2 text-right" v-if="total > 10">
          <my-pagination v-model="condition" @change="changePage"></my-pagination>
        </div>
      </div>

      <WithdrawPopUp
        :withdrawType="withdrawType"
        :cashInfo="cashInfo"
        @updateList="updateList"
        ref="withdraw"
      ></WithdrawPopUp>
      <div v-if="showTwoFactorVerification">
        <two-factor-confirm
          :afterSuccess="() => openWithdraw()"
          :afterFail="() => {}"
          :cancelVerification="() => showTwoFactorVerification = false"
        >
        </two-factor-confirm>
      </div>
    </div>
  `,
})
export default class WithdrawView extends Vue {
  loading = false
  cashInfo: any = {}
  withdraws: any = []
  total: number | null = null
  withdrawType = 'new'
  authStatus = false
  balanceSafeThreshold = 0
  showTwoFactorVerification = false
  condition: any = {
    page: 1,
    limit: 20,
    total: 0,
  }

  async created() {
    await this.getIdentity()
    const lifeCycleConfig = await getLifeCycleConfig()
    this.balanceSafeThreshold = lifeCycleConfig.balanceSafeThreshold
    this.getWithdraws()
    const ret = await getCashInfo(true)
    if (!ret) {
      this.$message.error(this.$t('getInfoErr') as string)
    } else {
      this.cashInfo = ret
    }
  }

  async getWithdraws() {
    try {
      this.loading = true
      const ret = await this.$http.get(`/api/v2/finance/refunds`, { params: this.condition })
      if (ret.data) {
        this.withdraws = ret.data.items
        this.total = ret.data.total
        this.condition.total = ret.data.total
      } else {
        this.withdraws = []
      }
      this.loading = false
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('getInfoErr') as string)
    }
  }

  async changePage() {
    this.$router.push({ query: Object.assign({}, this.condition) })
    await this.getWithdraws()
  }

  withdraw(type: string, item: any) {
    this.withdrawType = type
    if (!user.info.email) {
      this.$message.warning(this.$t('EmailNotExist') as string)
      return
    }
    if (type === 'new') {
      if (this.cashInfo.accountBalance <= 0) {
        return
      }
      this.$confirm(
        this.$t('Attention', {
          currency: this.cashInfo.accountCurrency === 'CNY' ? '￥' : '$',
          balanceSafeThreshold: this.balanceSafeThreshold,
        }) as string,
        this.$t('AttentionTitle') as string,
        {
          confirmButtonText: this.$t('ContinueButton') as string,
          cancelButtonText: this.$t('Cancel') as string,
          confirmButtonClass: 'confirm-button-error',
          type: 'warning',
        }
      )
        .then(() => {
          this.showTwoFactorVerification = true
        })
        .catch(() => {})
    } else {
      console.info(this.$refs)
      ;(this.$refs.withdraw as any).open(item)
    }
  }

  openWithdraw() {
    this.showTwoFactorVerification = false
    ;(this.$refs.withdraw as any).open()
  }

  updateList() {
    this.condition.page = 1
    this.getWithdraws()
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info')
      if (identity.data && identity.data.identityType === 0) {
        this.authStatus = true
      }
    } catch (e) {
      console.info(e)
    }
  }
}
