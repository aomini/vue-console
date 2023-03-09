import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import './OfflineView.less'

@Component({
  template: `
    <div class="page-v3">
      <div class="card">
        <div class="card-hr">
          <h3 class="module-header m-0">
            <span class="mr-3">{{ $t('accountBalance') }}</span>
            <span class="money-blue">{{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}</span>
          </h3>
        </div>
        <div class="card-hr mt-10">
          <b>{{ $t('important') }}</b
          ><span class="mb-1 d-inline-block">{{ $t('transferHint') }}</span>
          <div class="highlight-block">
            <span>CID: </span><span>{{ userInfo.companyId }}</span>
          </div>
          <div class="heading-grey-05">
            <div>{{ $t('otherinfo1') }}</div>
            <div>{{ $t('otherinfo5') }}</div>
            <div>{{ $t('otherinfo2') }}</div>
            <div>
              {{ $t('otherinfo3') }}
              <router-link :to="{ name: 'finance.transactions' }">{{ $t('transactionDetail') }}</router-link>
              {{ $t('otherinfo4') }}
            </div>
          </div>
        </div>
        <div class="mt-20" v-loading="loading">
          <div class="mb-10 heading-grey-05">{{ $t('transferMore') }}</div>
          <div class="heading-dark-03 f-w-500" v-for="(item, index) of billingInfo[country]" :key="index">
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class OfflineView extends Vue {
  cashInfo: any = {}
  userInfo: any = user.info
  country = ''
  loading = false
  isSGCompany = false
  billingInfo = {
    cn: this.$t('billingInfoCN') as string,
    'none-cn': [
      'Bank Name: Silicon Valley Bank',
      'Bank Address: 3003 Tasman Drive, Santa Clara, CA 95054',
      'Routing # :121140399',
      'Account #:3301075593',
      'Account Name: Agora Lab, Inc.',
      'Swift Code: SVBKUS6S',
      'Registered Office: 2804 Mission College Blvd, Suite 201, Santa Clara, CA, 95054, United States',
    ],
    hk: [
      'Beneficiary’s Name:  AGORA IO HONGKONG LIMITED',
      'Beneficiary’s Account Number: 521-017277-201',
      'Beneficiary’s Bank:  HK and Shanghai Banking Corp Ltd',
      'Bank Address:  Head Office 1 Queen’s Road Central Hong Kong',
      'Swift Code:  HSBCHKHH',
    ],
    sg: [
      'Beneficiary’s Name:  AGORA IO SINGAPORE PTE. LTD.',
      'Beneficiary’s Account Number:  260-350905-178',
      'Beneficiary’s Bank: HSBC Offshore',
      'Bank Address: 9 Battery Road #12-01 MYP Centre Singapore 049910',
      'Swift Code: HSBCSGSG',
    ],
  }

  async mounted() {
    await this.checkSGCompany()
    await this.getFinanceSetting()
    this.cashInfo = await getCashInfo(true)
  }

  async getFinanceSetting() {
    this.loading = true
    try {
      const ret = await this.$http.get('/api/v2/finance/setting')
      this.loading = false
      const wireDestination = ret.data.wireDestination
      if (wireDestination) {
        if (wireDestination === 1) {
          this.country = 'cn'
        } else if (wireDestination === 2) {
          this.country = 'hk'
        } else if (wireDestination === 3) {
          this.country = 'none-cn'
        } else if (wireDestination === 4) {
          this.country = 'sg'
        }
      } else {
        const companyInfo = this.userInfo.company
        if (!companyInfo) {
          this.country = 'cn'
        } else if (this.isSGCompany) {
          this.country = 'sg'
        } else if (companyInfo.country === 'HK') {
          this.country = 'hk'
        } else if (companyInfo.country === 'SG') {
          this.country = 'sg'
        } else if (companyInfo.area === 'CN') {
          this.country = 'cn'
        } else {
          this.country = 'none-cn'
        }
      }
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('NetworkError') as string)
    }
  }

  async checkSGCompany() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/finance/sg-company`)
      if (res.data) {
        this.isSGCompany = true
      }
    } catch (e) {}
    this.loading = false
  }
}
