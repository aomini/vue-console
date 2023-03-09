import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import moment from 'moment'
import MyPagiation from '@/components/MyPagination'

@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: `
    <div class="page-v3">
      <div class="card">
        <div class="card-hr">
          <h3 class="module-header m-0">
            <span class="mr-3">{{ $t('accountBalance') }}</span>
            <span class="money-blue">{{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}</span>
          </h3>
        </div>
        <div class="d-flex justify-between mb-20 mt-20">
          <el-select clearable size="mini" v-model="condition.type" @change="changePage()">
            <el-option-group>
              <el-option :value="undefined" :label="$t('AllType')"></el-option>
            </el-option-group>
            <el-option-group v-for="group in $t('TransGroups')" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.transTypes"
                :key="item"
                :label="$t('TransactionTypes')[item].value"
                :value="item"
              >
              </el-option>
            </el-option-group>
            <el-option-group>
              <el-option value="0" :label="$t('balanceInitiate')"></el-option>
            </el-option-group>
          </el-select>
          <div class="d-flex date-picker-line">
            <el-date-picker
              @change="changeDate"
              :picker-options="dateOpt"
              class="ag-date-picker mr-2"
              size="small"
              v-model="daterange"
              type="daterange"
              :range-separator="$t('To')"
              :start-placeholder="$t('StartDate')"
              :end-placeholder="$t('EndDate')"
            >
            </el-date-picker>
            <a href="/api/v2/finance/transactions/export" size="mini" class="export-btn">{{ $t('ExportCSV') }}</a>
          </div>
        </div>
        <el-table
          v-loading="loading"
          :data="transactions"
          stripe
          row-class-name="dark-table-row"
          :empty-text='$t("No Data")'
          cell-class-name="text-truncate"
          header-cell-class-name="text-truncate"
        >
          <el-table-column :label='$t("Date")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.createdTime | UTC | formatDate('YYYY-MM-DD HH:mm') }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="externalTransId"
            :label='$t("TransactionID")'
            label-class-name="table-title"
            class-name="table-content"
          ></el-table-column>
          <el-table-column :label='$t("TransactionType")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{
                  $t('TransactionTypes')[scope.row.transType] ? $t('TransactionTypes')[scope.row.transType].value : ''
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Amount")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.amount | formatMoney(scope.row.accountCurrency) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Balance")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.accountBalance | formatMoney(scope.row.accountCurrency) }}</span>
              </div>
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
export default class TransactionsView extends Vue {
  loading = false
  cashInfo: any = {}
  transactions: any = []
  total: number | null = null
  userInfo: any = user.info
  condition: any = {
    page: 1,
    limit: 10,
    total: 0,
    type: undefined,
  }
  daterange: any = []
  dateOpt: any = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    },
  }

  async created() {
    this.init()
    this.getTransactions()
    const ret = await getCashInfo(true)
    if (!ret) {
      this.$message.error(this.$t('getInfoErr') as string)
    } else {
      this.cashInfo = ret
    }
  }

  init() {
    this.condition.page = Number(this.$route.query.page) | 0
    if (this.condition.page <= 0) this.condition.page = 1
    this.condition.limit = Number(this.$route.query.limit) | 0
    if (this.condition.limit <= 0) this.condition.limit = 10
    this.condition.type = this.$route.query.type || undefined
    this.condition.startDate = this.$route.query.startDate || undefined
    this.condition.endDate = this.$route.query.endDate || undefined
    this.daterange[0] = this.condition.startDate ? moment(this.condition.startDate) : undefined
    this.daterange[1] = this.condition.endDate ? moment(this.condition.endDate) : undefined
    if (!this.daterange[0]) this.daterange[0] = moment().subtract(1, 'months')
    if (!this.daterange[1]) this.condition.endDate = this.daterange[1] = moment()
    this.condition.startDate = this.daterange[0].format('YYYY-MM-DD')
    this.condition.endDate = this.daterange[1].format('YYYY-MM-DD')
  }

  async getTransactions() {
    try {
      this.loading = true
      const ret = await this.$http.get(`/api/v2/finance/transactions`, { params: this.condition })
      this.loading = false
      this.transactions = ret.data.items
      this.total = ret.data.total
      this.condition.total = ret.data.total
    } catch (e) {
      this.$message.error(this.$t('getInfoErr') as string)
    }
  }

  async changePage() {
    this.$router.push({ query: Object.assign({}, this.condition) })
    this.loading = true
    await this.getTransactions()
    this.loading = false
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
}
