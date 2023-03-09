import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './Receipt.less'

@Component({
  template: `
    <div class="page-v3 receipt-detail" v-show="show">
      <div class="module-title">{{ $t('ReceiptDetail') }}</div>
      <div class="card">
        <label class="title title-top"> 1.{{ $t('InvoiceType') }} </label>
        <div class="line">
          <span v-if="setting.receiptType===0">{{ $t('PersonReceipt') }}</span>
          <span v-if="setting.receiptType === 1">{{ $t('EnterpriseGeneral') }}</span>
          <span v-if="setting.receiptType === 2">{{ $t('EnterpriseSpecial') }}</span>
        </div>
        <label class="title"> 2.{{ $t('InvoiceTitleInfo') }} </label>
        <div class="line">
          <span class="label" v-if="setting.receiptType===0">{{ $t('Name') }}:</span>
          <span class="label" v-else>{{ $t('InvoiceTitle') }}:</span>
          <span>{{ setting.name }}</span>
        </div>
        <div class="line">
          <span class="label" v-if="setting.receiptType===0">{{ $t('Number') }}:</span>
          <span class="label" v-else>{{ $t('CreditCode') }}:</span>
          <span v-if="setting.receiptType===0">{{setting.idNumber | showLast(4) }}</span>
          <span v-if="setting.receiptType===1 || setting.receiptType === 2">{{setting.creditCode | showLast(4)}}</span>
        </div>

        <label class="title"> 3.{{ $t('InvoiceInfo') }} </label>
        <div class="line">
          <span class="label">{{ $t('Amount') }}:</span>
          <span>￥{{ amount }}</span>
        </div>

        <div class="line">
          <span class="label">{{ $t('Extra') }}:</span>
          <span>{{extra | billExtra($t('currency'))}}</span>
        </div>

        <label class="title"> 4.{{ $t('ReceiveAddress') }} </label>
        <div class="line">
          <span class="label">{{ $t('ReceiptEmail') }}:</span>
          <span>{{ setting.email }}</span>
        </div>

        <label class="title" v-if="setting.receiptType!==2"> {{ $t('HintContent') }} </label>

        <div class="divider mt-20"></div>
        <div class="buttons mt-20" v-if="!receiptId">
          <console-button
            class="console-btn-primary"
            :disabled="disableApply || (!hasSales && (amount < 100 || cashInfo.accountBalance < 0))"
            @click="submitApply"
          >
            {{ $t('ApplyReceipt') }}
          </console-button>
          <console-button class="console-btn-white" @click="back"> {{ $t('Cancel') }} </console-button>
        </div>
        <div class="buttons mt-20" v-else>
          <el-button class="button button-outline-mid-secondary"> {{ $t('DetailOk') }} </el-button>
        </div>
      </div>
    </div>
  `,
})
export default class ReceiptDetailView extends Vue {
  @Prop({ default: {} }) readonly cashInfo!: any
  @Prop({ default: {} }) readonly identity!: any
  @Prop({ default: {} }) readonly setting!: any
  @Prop({ default: [], type: Array }) readonly bills!: any[]
  @Prop({ default: false, type: Boolean }) readonly show!: boolean
  @Prop({ default: '', type: String }) readonly receiptId!: string
  @Prop({ default: false, type: Boolean }) readonly hasSales!: boolean
  disableBtn = false

  get amount() {
    let count = 0
    this.bills.forEach((bill) => {
      count += bill.totalAmount
    })
    return count
  }

  get extra() {
    const tmp: any[] = []
    this.bills.forEach((bill) => {
      tmp.push(bill.billPeriod.replace('-', '/'))
    })
    return tmp.join('，')
  }

  get disableApply() {
    if (!this.identity || !this.setting || this.identity.status === 2 || this.amount <= 0) {
      return true
    }
    return false
  }

  back() {
    this.$emit('showReceiptDetail', false)
  }
  submitApply() {
    this.$confirm(this.$t('FinanceConfirmApply') as string, this.$t('Warning') as string, {
      confirmButtonText: this.$t('Confirm') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    })
      .then(() => {
        this.$emit('submitApply', this.bills, this.extra, this.amount)
      })
      .catch(() => {})
  }
}
