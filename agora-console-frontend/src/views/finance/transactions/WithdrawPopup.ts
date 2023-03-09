import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { checkMoney } from '@/utils/utility'
import './Withdraw.less'

@Component({
  template: ` <el-dialog
    :title="$t('Withdraw')"
    :visible.sync="dialogFormVisible"
    :show-close="false"
    class="withdraw-pop"
    :width="step===0?'500px':'800px'"
  >
    <div v-if="step === 0">
      <div class="hint-sm">{{ $t('WithdrawHint4') }}</div>
      <div class="amount">
        <label>{{ $t('RequestAmount') }}:</label>
        <el-input class="input" v-model="amount" @blur="checkAmount">
          <i slot="prefix" class="currency">{{ cashInfo.accountCurrency === 'CNY' ? '￥' : '$' }}</i>
        </el-input>
        <div class="error-sm">{{ errorMsg }}</div>
        <div class="error-sm">
          {{ $t('Balance') }}: {{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}
        </div>
      </div>
    </div>
    <div v-else>
      <div class="hint-sm" v-show="withdrawType!=='detail'">{{ $t('WithdrawHint4') }}</div>
      <div class="amount">
        <label>{{ $t('RequestAmount') }}: &ensp;{{ amount | formatMoney(cashInfo.accountCurrency) }}</label>
        <label class="link" @click="editAmount" v-if="withdrawType!=='detail'">{{ $t('Edit') }}</label>
        <div class="error-sm">
          {{ $t('Balance') }}: {{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}
        </div>
      </div>
      <div>
        <label class="bold affect-tran">{{ $t('AffectedTransaction') }}</label>
      </div>
      <div class="table-box mt-10">
        <el-table v-loading="loading" stripe :data="detailList" style="width: 100%" :empty-text="ApplyerrorMsg">
          <el-table-column width="130" :label="$t('Date')">
            <template slot-scope="scope">
              <span>{{ scope.row.paymentTime | UTC | formatDate('YYYY-MM-DD HH:mm') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Type')">
            <template slot-scope="scope">
              <span>{{ $t('TrancactionType')[scope.row.channel] || '' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('RequestAmount')">
            <template slot-scope="scope">
              <span>{{ scope.row.amount | formatMoney(detail.currency) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="withdrawTo" :show-overflow-tooltip="showOverflowTooltip" :label="$t('WithdrawTo')">
          </el-table-column>
          <el-table-column v-if="withdrawType==='detail'" :label="$t('Status')">
            <template slot-scope="scope">
              <span>{{ $t('ApprovalStatus')[scope.row.refundStatus] || '' }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="withdrawType==='detail'" :label="$t('Notes')">
            <template slot-scope="scope">
              <span>{{ $t('NotesCode')[scope.row.notes] || '' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="hint2 mb-10" v-show="withdrawType==='detail'">
        <label class="bold"
          >{{ $t('WithdrewAmount') }}: {{withdrawAmount | formatMoney(cashInfo.accountCurrency)}}</label
        >
      </div>
      <div class="hint">{{ $t('WithdrawHint2') }}</div>
      <div class="hint">{{ $t('Hint3') }}</div>
    </div>

    <div slot="footer" class="dialog-footer" v-if="step === 0">
      <console-button class="console-btn-primary" :disabled="loading" v-loading="loading" @click="submitAmount">{{
        $t('OK')
      }}</console-button>
      <console-button class="console-btn-white" @click="clear">{{ $t('Cancel') }}</console-button>
    </div>
    <div slot="footer" class="dialog-footer" v-else>
      <console-button
        class="console-btn-primary"
        :disabled="applying"
        v-loading="applying"
        v-if="withdrawType!=='detail'"
        @click="submitWithdraw"
        >{{ applying ? $t('Loading') : $t('RequestWithdraw') }}</console-button
      >
      <console-button class="console-btn-white" @click="clear">{{ $t('Close') }}</console-button>
    </div>
  </el-dialog>`,
})
export default class WithdrawPopup extends Vue {
  @Prop({ default: {} }) readonly cashInfo!: any
  @Prop({ default: '', type: String }) readonly withdrawType!: string

  dialogFormVisible = false
  loading = false
  detailList: any = []
  detail: any = {}
  errorMsg = ''
  ApplyerrorMsg = ''
  applying = false
  amount = ''
  showOverflowTooltip = true
  step = 0

  get afterBalance() {
    let count = 0
    this.detailList.forEach((detail: any) => {
      count += detail.amount
    })
    return (this.cashInfo.accountBalance - count).toFixed(2)
  }

  get withdrawAmount() {
    let count = 0
    this.detailList.forEach((detail: any) => {
      if (detail.refundStatus === 1) {
        count += detail.amount
      }
    })
    return count.toFixed(2)
  }

  open(detail: any) {
    this.clear()
    this.dialogFormVisible = true
    if (detail) {
      this.step = 1
      this.detail = detail
      this.amount = detail.requestedAmount
      this.detailList = detail.refundDetailsList
    } else {
      this.amount = this.cashInfo.accountBalance
    }
  }

  clear() {
    this.step = 0
    this.amount = ''
    this.errorMsg = ''
    this.dialogFormVisible = false
    this.detailList = []
    this.detail = {}
  }

  checkAmount() {
    if (!this.amount || !checkMoney(this.amount) || this.amount === '0') {
      this.errorMsg = this.$t('TypeError') as string
      return false
    } else if (this.amount > this.cashInfo.accountBalance) {
      this.errorMsg = this.$t('RangeError') as string
      return false
    } else {
      this.errorMsg = ''
    }
    return true
  }

  async getPreview() {
    try {
      this.loading = true
      const ret = await this.$http.post('/api/v2/finance/refunds/preview', { amount: this.amount })
      if (ret.data) {
        this.detailList = ret.data.refundDetailsList
        this.detail = ret.data
      }
      this.loading = false
    } catch (e) {
      this.loading = false
      if (e.response.data.code === '2050303') {
        this.ApplyerrorMsg = this.$t('UnfindError') as string
      } else if (e.response.data.code === '2050304') {
        this.ApplyerrorMsg = this.$t('ExpensesError') as string
      } else if (e.response.data.code === '2050305') {
        this.ApplyerrorMsg = this.$t('BalanceError') as string
      } else if (e.response.data.code === '2050306') {
        this.ApplyerrorMsg = this.$t('PendingError') as string
      } else if (e.response.data.code === '2050301') {
        this.ApplyerrorMsg = this.$t('Notransaction') as string
      } else {
        this.$message.error(this.$t('getInfoErr') as string)
      }
    }
  }

  submitAmount() {
    if (!this.checkAmount()) return
    this.step = 1
    this.getPreview()
  }

  editAmount() {
    this.errorMsg = ''
    this.step = 0
  }

  async submitWithdraw() {
    try {
      this.applying = true
      await this.$http.post('/api/v2/finance/refunds', { amount: this.amount })
      this.applying = false
      this.clear()
      this.$emit('updateList')
    } catch (e) {
      this.applying = false
      if (e.response.data.code === '2050303') {
        this.errorMsg = this.$t('UnfindError') as string
        this.$message.error(this.errorMsg)
      } else if (e.response.data.code === '2050304') {
        this.errorMsg = this.$t('ExpensesError') as string
        this.$message.error(this.errorMsg)
      } else if (e.response.data.code === '2050305') {
        this.errorMsg = this.$t('BalanceError') as string
        this.$message.error(this.errorMsg)
      } else if (e.response.data.code === '2050306') {
        this.errorMsg = this.$t('PendingError') as string
        this.$message.error(this.errorMsg)
      } else if (e.response.data.code === '2050301') {
        this.errorMsg = this.$t('Notransaction') as string
        this.$message.error(this.errorMsg)
      } else {
        this.$message.error(this.$t('NetworkError') as string)
      }
    }
  }
}
