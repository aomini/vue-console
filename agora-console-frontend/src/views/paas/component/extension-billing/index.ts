import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo } from '@/services'
import { Prop, Watch } from 'vue-property-decorator'
import MyPagiation from '@/components/MyPagination'
const IconCaution = require('@/assets/icon/icon-caution.png')
import './style.less'
@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: ` <div class="extension-billing">
    <div class="extension-billing-title">
      <span>{{ $t('Billing') }}</span>
      <div class="block">
        <el-date-picker
          v-model="monthDateValue"
          value-format="yyyy-MM"
          type="month"
          placeholder="Select Month"
        ></el-date-picker>
      </div>
    </div>
    <div>
      <el-alert class="alert-warn py-0 h-40" type="error" :closable="false" v-if="account.accountBalance < 0">
        <template>
          <img height="20px" class="alert-warn" :src="IconCaution" />
          <span class="align-middle heading-dark-14" v-html="$t('Balance insufficient')" @click="goToDeposite"></span>
        </template>
      </el-alert>
    </div>
    <el-table
      :data="billingList"
      :header-cell-style="{background:'#FAFAFD', padding: '12px 0px', color: '#333333'}"
      v-loading="loading"
    >
      <template slot="empty">
        <div style="margin-left: -30px; margin-right: -30px;">
          Your billing information will be available in the next billing cycle.
        </div>
      </template>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form
            v-for="(item, index) in props.row.chargedItemList"
            label-position="left"
            inline
            class="demo-table-expand"
            :key="index"
          >
            <el-form-item label="product:">
              <span>{{ item.productEnName }}</span>
            </el-form-item>
            <el-form-item label="amount:">
              <span>{{ item.amount }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        prop="period"
        :label='$t("date")'
        label-class-name="table-title"
        class-name="table-content"
      ></el-table-column>
      <el-table-column
        prop="customer"
        :label='$t("Customer")'
        label-class-name="table-title"
        class-name="table-content"
      >
        <template slot-scope="scope">
          <div>
            <span>{{ scope.row.customer.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="totalAmount"
        :label='$t("Total Amount")'
        label-class-name="table-title"
        class-name="table-content"
      ></el-table-column>
      <el-table-column
        prop="currency"
        :label='$t("currency")'
        label-class-name="table-title"
        class-name="table-content"
      ></el-table-column>
      <el-table-column :label='$t("BillingStatus")' label-class-name="table-title" class-name="table-content">
        <template slot-scope="scope">
          <div>
            <span>{{ scope.row.paymentStatus === 'PAID' ? $t('PAID') : $t('UNPAID') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="Description"
        label-class-name="table-title"
        class-name="table-content"
      ></el-table-column>
    </el-table>
    <div class="mt-2 text-right" v-if="total > 5">
      <my-pagination v-model="condition" @change="change"></my-pagination>
    </div>
  </div>`,
})
export default class ExtensionBilling extends Vue {
  @Prop({ type: String }) readonly serviceName!: string
  action = true
  condition = {
    page: 1,
    limit: 5,
    total: 0,
  }
  billingList = []
  account: any = {
    accountBalance: 0,
  }
  monthDateValue = ''
  total = 0
  loading = false
  IconCaution = IconCaution
  @Watch('monthDateValue')
  async onMonthDateValueChange(value: string) {
    this.loading = true
    await this.getBillingList(value)
    this.loading = false
  }
  async mounted() {
    this.account = await getCashInfo()
    await this.getBillingList()
  }
  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }
  change() {
    this.getBillingList()
  }
  goToDeposite() {
    if (this.getCurrency === '$') {
      this.$router.push({ name: 'finance.creditCard' })
    } else {
      this.$router.push({ name: 'finance.alipay' })
    }
  }
  async getBillingList(period = '') {
    this.loading = true
    const ret = await this.$http.get(`/api/v2/finance/extension/once-bills`, {
      params: { ...this.condition, period },
    })
    if (!period) {
      this.billingList = ret.data.items.content
      this.total = ret.data.items.totalElements
      this.condition.total = this.total
    } else {
      if (ret.data.items) {
        this.billingList = [ret.data.items] as any
      } else {
        this.billingList = []
      }
      this.total = 0
    }
    this.loading = false
  }
}
