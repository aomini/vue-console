import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import moment from 'moment'
import './Billing.less'
import MyPagiation from '@/components/MyPagination'
const downloadIcon = require('@/assets/icon/download-white.png')
const detailIcon = require('@/assets/icon/detail-white.png')

@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: `
    <div class="page-v3">
      <div class="module-title-tip d-flex flex-column mt-20">
        <span :key='"1-" + index' v-for="(msg, index) of $t('BillingMessage1')"> {{ msg }} </span>
        <span> {{ userInfo.company.area === 'CN' ? $t('BlockAccountMessageCN') : $t('BlockAccountMessageROW') }} </span>
        <span :key='"2-" + index' v-for="(msg, index) of $t('BillingMessage2')"> {{ msg }} </span>
        <span :key="0">
          {{ $t('PricingMsg') }} <a target="_blank" :href="$t('PricingLink')">{{ $t('PricingDoc') }}</a>
        </span>
      </div>
      <div class="mt-2">
        <div class="d-flex date-picker-line">
          <el-date-picker
            :picker-options="dateOpt"
            @change="changeDate"
            class="ag-date-picker mr-20"
            size="small"
            v-model="daterange"
            type="daterange"
            :range-separator="$t('To')"
            :start-placeholder="$t('StartDate')"
            :end-placeholder="$t('EndDate')"
          >
          </el-date-picker>
          <a
            :href="'/api/v2/finance/billings/export?startDate=' + (condition.startDate || '') + '&endDate=' + (condition.endDate || '')"
            size="mini"
            class="export-btn"
            >{{ $t('ExportCSV') }}</a
          >
        </div>
      </div>
      <div class="card mt-20">
        <el-table
          v-loading="loading"
          :data="billingList"
          stripe
          row-class-name="dark-table-row"
          :empty-text='$t("No Data")'
          cell-class-name="text-truncate"
          header-cell-class-name="text-truncate"
        >
          <el-table-column
            prop="invoiceDate"
            :label='$t("IssueDate")'
            label-class-name="table-title"
            class-name="table-content"
          ></el-table-column>
          <el-table-column
            prop="billPeriod"
            :label='$t("BillingPeriod")'
            label-class-name="table-title"
            class-name="table-content"
          ></el-table-column>
          <el-table-column
            prop="dueDate"
            :label='$t("DueDate")'
            label-class-name="table-title"
            class-name="table-content"
          ></el-table-column>
          <el-table-column :label='$t("Amount")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.totalAmount | formatMoney(scope.row.currency) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("BillingStatus")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.deducted ? $t('Deducted') : $t('Undeducted') }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="actionUrl"
            :label='$t("Action")'
            label-class-name="table-title"
            class-name="table-content"
            width="80px"
          >
            <template slot-scope="scope">
              <el-tooltip :content="$t('downloadBill')" effect="light" placement="top">
                <a :href="'/api/v2/finance/billings/' + scope.row.billId + '/download'" class="action-download mr-1">
                  <i><img width="22" :src="downloadIcon" /></i>
                </a>
              </el-tooltip>
              <el-tooltip
                :content="$t('downloadReconciliation')"
                effect="dark"
                placement="top"
                v-if="scope.row.hasReconciliation"
              >
                <a
                  :href="'/api/v2/finance/billings/' + scope.row.billId + '/download/reconciliation'"
                  class="action-download"
                >
                  <i><img width="22" :src="detailIcon" /></i>
                </a>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt-2 text-right" v-if="total > 10">
          <my-pagination v-model="condition" @change="changePage"></my-pagination>
        </div>
      </div>
    </div>
  `,
})
export default class MonthBillView extends Vue {
  loading = false
  billingList: any = []
  total: number | null = null
  userInfo: any = user.info
  user: any = user
  condition: any = {
    page: 1,
    limit: 10,
    total: 0,
  }
  daterange: any = []
  dateOpt: any = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    },
  }
  moment = moment
  account: any = {
    accountBalance: 0,
  }
  downloadIcon = downloadIcon
  detailIcon = detailIcon

  get getCurrency() {
    return this.account && this.account.accountCurrency === 'USD' ? `$` : `￥`
  }

  async mounted() {
    // 没有财务权限的人无法访问
    if (this.user.info.permissions && this.user.info.permissions['FinanceCenter'] === 0) {
      this.$message.warning(this.$t('No Permission') as string)
      return
    }
    // cocos客户无法访问
    if (this.user && this.user.info.company && this.user.info.company.source === 2) {
      this.$message.warning(this.$t('No Permission') as string)
      return
    }
    this.init()
    this.getBillingList()
    this.account = await getCashInfo()
  }

  tabClick(tab: any) {
    ;(this.$router as any).replace({
      name: this.$route.name,
      query: Object.assign({}, this.$route.query, {
        tab: tab.name,
      }),
    })
    this.init()
    this.getBillingList()
  }

  async getBillingList() {
    this.loading = true
    try {
      const ret = await this.$http.get(`/api/v2/finance/billings`, { params: this.condition })
      this.billingList = ret.data.items
      this.total = ret.data.total
      this.condition.total = ret.data.total
    } catch (e) {
      this.$message.error(this.$t('getInfoErr') as string)
    }
    this.loading = false
  }

  async changePage() {
    this.$router.push({ query: Object.assign({}, this.$route.query, this.condition) })
    await this.getBillingList()
  }

  changeDate() {
    if (this.daterange && this.daterange[0] && this.daterange[1]) {
      this.condition.startDate = moment(this.daterange[0]).format('YYYY-MM-DD')
      this.condition.endDate = moment(this.daterange[1]).format('YYYY-MM-DD')
    } else {
      this.condition.startDate = undefined
      this.condition.endDate = undefined
    }
    this.changePage()
  }

  init() {
    this.condition.page = Number(this.$route.query.page) | 0
    if (this.condition.page <= 0) this.condition.page = 1
    this.condition.limit = Number(this.$route.query.limit) | 0
    if (this.condition.limit <= 0) this.condition.limit = 10
    this.condition.startDate = this.$route.query.startDate || undefined
    this.condition.endDate = this.$route.query.endDate || undefined
    this.$set(this.daterange, '0', this.condition.startDate ? moment(this.condition.startDate) : undefined)
    this.$set(this.daterange, '1', this.condition.endDate ? moment(this.condition.endDate) : undefined)
    if (!this.daterange[0]) this.daterange[0] = moment().add(-6, 'month').set('date', 1)
    if (!this.daterange[1]) this.daterange[1] = moment()
    this.condition.startDate = this.daterange[0].format('YYYY-MM-DD')
    this.condition.endDate = this.daterange[1].format('YYYY-MM-DD')
  }
}
