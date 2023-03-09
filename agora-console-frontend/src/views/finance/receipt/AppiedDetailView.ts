import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  template: `
    <div class="page receipt-detail">
      <h3 class="module-title">{{ $t('ReceiptDetail') }}</h3>
      <div class="card mb-2">
        <label class="title title-top"> 1.{{ $t('InvoiceType') }} </label>
        <div class="line">
          <span v-if="receipt.receiptType===0">{{ $t('PersonReceipt') }}</span>
          <span v-if="receipt.receiptType === 1">{{ $t('EnterpriseGeneral') }}</span>
          <span v-if="receipt.receiptType === 2">{{ $t('EnterpriseSpecial') }}</span>
        </div>
        <label class="title"> 2.{{ $t('InvoiceTitleInfo') }} </label>
        <div class="line">
          <span class="label" v-if="receipt.receiptType===0">{{ $t('Name') }}:</span>
          <span class="label" v-else>{{ $t('EnterpriseName') }}:</span>
          <span>{{ receipt.name }}</span>
        </div>
        <div class="line">
          <span class="label" v-if="receipt.receiptType===0">{{ $t('Number') }}:</span>
          <span class="label" v-else>{{ $t('CreditCode') }}:</span>
          <span v-if="receipt.receiptType===0">{{receipt.idNumber | showLast(4) }}</span>
          <span v-if="receipt.receiptType===1 || receipt.receiptType===2">{{receipt.creditCode | showLast(4)}}</span>
        </div>

        <label class="title"> 3.{{ $t('InvoiceInfo') }} </label>
        <div class="line">
          <span class="label">{{ $t('Amount') }}:</span>
          <span>￥{{ receipt.amount }}</span>
        </div>

        <div class="line">
          <span class="label">{{ $t('Extra') }}:</span>
          <span>{{receipt.extra | billExtra($t('currency'))}}</span>
        </div>

        <label class="title"> 4.{{ $t('ReceiveAddress') }} </label>
        <div class="line">
          <span class="label">{{ $t('Email') }}:</span>
          <span>{{ receipt.email }}</span>
        </div>

        <!--        <div v-if="receipt.receiptType===2">-->
        <!--          <label class="title"> 4.{{ $t('ContactAddress') }} </label>-->
        <!--          <div class="line">-->
        <!--            <span class="label">{{ $t('Recipient') }}:</span>-->
        <!--            <span>{{ receipt.consignee }}</span>-->
        <!--          </div>-->
        <!--          <div class="line">-->
        <!--            <span class="label">{{ $t('ContactNumber') }}:</span>-->
        <!--            <span>{{ receipt.consigneePhone }}</span>-->
        <!--          </div>-->
        <!--          <div class="line">-->
        <!--            <span class="label">{{ $t('ContactAddress') }}:</span>-->
        <!--            <span>{{ receipt.consigneeAddress }}</span>-->
        <!--          </div>-->
        <!--        </div>-->

        <label class="title"> 5.{{ $t('Status') }} </label>
        <div class="line">
          <span v-if="receipt.status === 0">{{ $t('Applied') }}</span>
          <span v-if="receipt.status === 1">{{ $t('Sent') }}</span>
          <span v-if="receipt.status === 2">{{ $t('Rejected') }}</span>
        </div>
        <div class="line" v-if="receipt.status===1&&receipt.trackingNumber&&receipt.receiptType===2">
          <span class="label">{{ $t('TrackingNumber') }}:</span>
          <span>{{ receipt.trackingNumber }}</span>
        </div>

        <div class="line" v-if="receipt.status === 2">
          <span class="label">{{ $t('RejectReason') }}:</span>
          <span v-if="receipt.rejectReason===0">{{ $t('Reason1') }}</span>
          <span v-if="receipt.rejectReason===1">{{ $t('Reason2') }}</span>
          <span v-if="receipt.rejectReason===2">{{ $t('Reason3') }}</span>
          <span v-if="receipt.rejectReason===3">{{ $t('Reason4') }}</span>
        </div>

        <hr />
        <div class="buttons">
          <console-button class="console-btn-primary" @click="back"> {{ $t('DetailOk') }} </console-button>
        </div>
      </div>
    </div>
  `,
})
export default class AppiedDetailView extends Vue {
  disableBtn = false
  receiptId = ''
  receipt: any = {}

  created() {
    this.receiptId = this.$route.params.id
    this.getReceipt()
  }

  back() {
    ;(this.$router as any).push({ name: 'finance.receipt', params: { invoiced: 1 } })
  }
  async getReceipt() {
    try {
      const receipt = await this.$http.get('/api/v2/receipt/info', { params: { receiptId: this.receiptId } })
      if (receipt.data) {
        this.receipt = receipt.data
      }
    } catch (e) {}
  }
}
