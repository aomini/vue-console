import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { getCashInfo, user } from '@/services'
import './Receipt.less'
import MyPagiation from '@/components/MyPagination'
import ReceiptDetailView from '@/views-oversea/finance/receipt/ReceiptDetailView'

@Component({
  components: {
    'my-pagination': MyPagiation,
    ReceiptDetail: ReceiptDetailView,
  },
  template: `
    <div class="page-v3">
      <div v-show="!showDetail">
        <el-tabs :value="invoicedType" @tab-click="handleClick" class="tabs">
          <el-tab-pane :label="$t('ToApply')" name="apply"></el-tab-pane>
          <el-tab-pane :label="$t('Applied')" name="applied"></el-tab-pane>
        </el-tabs>
        <div class="module-title-tip d-flex flex-column mt-20">
          <label v-html='$t("ReceiptHint")' class="hint-end"> </label>
          <div>
            <label class="hint-end"
              >{{ $t('ReceiptDocMore') }}<a target="_blank" :href="$t('ReceiptLink')">{{ $t('ReceiptDoc') }}</a></label
            >
          </div>
        </div>
        <div class="card">
          <div class="card-hr heading-grey-13">
            {{ $t('ApplyHint') }}
          </div>
          <div class="card-hr d-flex justify-between sub-line">
            <div class="heading-dark-14">
              {{ $t('Authentication') }}
            </div>
            <div class="d-flex step-content">
              <div class="step-content">
                <div v-if="!identity || identity.status === 2" class="content-line d-flex align-center">
                  <img :src='getImgUrl("icon-alert")' class="step-icon w-18" />
                  <div class="step-status" v-if="identity.status===2">{{ $t('Rejected') }}</div>
                  <div class="step-status" v-else>{{ $t('Unauthorized') }}</div>
                  <div class="line-vertical"></div>
                  <div class="step-jump pointer link" @click="jumpAuth">{{ $t('goAuthentication') }}</div>
                </div>
                <div v-else class="content-line d-flex align-center">
                  <img :src='getImgUrl("icon-check")' class="step-icon w-18" />
                  <div class="step-status" v-if="identity.status===1">{{ $t('Approved') }}</div>
                  <div class="step-status" v-else>{{ $t('Authorized') }}</div>
                  <div class="line-vertical"></div>
                  <div class="step-jump pointer link" @click="jumpAuth">{{ $t('ViewDetail') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-hr d-flex justify-between sub-line">
            <div class="heading-dark-14">
              {{ $t('ReceiptAddress') }}
            </div>
            <div class="step-content">
              <div v-if="!settings" class="content-line d-flex align-center">
                <img :src='getImgUrl("icon-alert")' class="step-icon w-18" />
                <div class="step-status">{{ $t('Unrecorded') }}</div>
                <div class="line-vertical"></div>
                <div class="step-jump pointer link" @click="jumpSetting">{{ $t('GoSetting') }}</div>
              </div>
              <div v-else class="content-line d-flex align-center">
                <img :src='getImgUrl("icon-check")' class="step-icon w-18" />
                <div class="step-status">{{ $t('Recorded') }}</div>
                <div class="line-vertical"></div>
                <div class="step-jump pointer link" @click="jumpSetting">{{ $t('ViewDetail') }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-20">
          <el-table
            ref="multipleTable"
            v-loading="loading"
            :data="currentData"
            stripe
            :row-key="getRowKeys"
            row-class-name="dark-table-row"
            cell-class-name="text-truncate"
            header-cell-class-name="text-truncate"
            @select-all="handleSelectionChange"
            @select="handleSelectionChange"
            :empty-text="invoicedType==='apply'?emptyText:''"
            tooltip-effect="light"
          >
            <el-table-column
              type="selection"
              label-class-name="selection-heaer"
              class-name="selection-column"
              :reserve-selection="true"
              v-if="condition.invoiced===0"
              width="55"
            >
            </el-table-column>
            <el-table-column :key="Math.random()" :label="$t('IssueDate')" v-if="invoicedType==='applied'">
              <template slot-scope="scope">
                {{ moment.unix(Number(scope.row.appliedTime)) | formatTime('YYYY-MM-DD') }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('BillingPeriod')">
              <template slot-scope="scope">
                <span v-if="condition.invoiced===0">{{ scope.row.billPeriod }}</span>
                <span v-else>{{ scope.row.extra | billPeriod }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('Amount')">
              <template slot-scope="scope">
                <span v-if="condition.invoiced===0">{{ scope.row.totalAmount | formatMoney(scope.row.currency) }}</span>
                <span v-else>￥{{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="" :label="$t('Status')">
              <template slot-scope="scope">
                <span v-if="invoicedType==='apply'&&scope.row.invoiceStatus==0">{{ $t('NotApplied') }}</span>
                <span v-if="invoicedType==='apply'&&scope.row.invoiceStatus==2">{{ $t('Rejected') }}</span>
                <span v-if="scope.row.receiptStatus === 0 || scope.row.status === 0">{{ $t('Applied') }}</span>
                <span v-if="scope.row.receiptStatus === 1 || scope.row.status === 1">{{ $t('Sent') }}</span>
                <span v-if="scope.row.receiptStatus === 2 || scope.row.status === 2">{{ $t('Rejected') }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('Details')">
              <template slot-scope="scope">
                <span class="link" @click="detail(scope.row)" v-if="invoicedType==='apply'">{{ $t('Detail') }}</span>
                <span class="link" @click="appliedDetail(scope.row.id)" v-else>{{ $t('Detail') }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="d-flex justify-between mt-10 align-center">
            <console-button
              v-if="invoicedType!=='applied'"
              class="console-btn-size-md console-btn-primary mt-10"
              :disabled="disableBtn || (!hasSales && (cashInfo.accountBalance < 0 || amount < 100))"
              @click="showReceiptDetail(true)"
            >
              {{ $t('ApplyReceipt') }}
            </console-button>
            <div class="text-right" v-if="total > 10">
              <my-pagination v-model="condition" @change="changePage"></my-pagination>
            </div>
          </div>
        </div>
      </div>
      <div>
        <ReceiptDetail
          :identity="identity"
          :cashInfo="cashInfo"
          :setting="settings"
          :hasSales="hasSales"
          :bills="applyBills"
          :show="showDetail"
          @showReceiptDetail="showReceiptDetail"
          @submitApply="submitApply"
        ></ReceiptDetail>
      </div>
    </div>
  `,
})
export default class ReceiptView extends Vue {
  identity: any = false
  settings: any = false
  showDetail = false
  hasSales = false
  emptyText = this.$t('Nobill') as string
  disableBtn = false
  loading = false
  statusLoading = false
  total = null
  invoicedType = 'apply'
  cashInfo: any = {}
  condition: any = {
    page: 1,
    invoiced: 0,
    deductionStatus: "'SUCCESS'",
    startDate: moment('20190601').format('YYYY-MM'),
    limit: 10,
    total: 0,
  }
  receiptSelection: any[] = []
  applyBills: any[] = []
  currentData: any[] = []
  moment = moment

  getRowKeys(row: any) {
    return row.id
  }

  get amount() {
    let count = 0
    this.receiptSelection.forEach((bill) => {
      count += bill.totalAmount
    })
    return count
  }

  async mounted() {
    const ret = await getCashInfo()
    if (ret) {
      this.cashInfo = ret
    }
    if (user && user.info && user.info.company.salesId) {
      this.hasSales = true
    }
    this.statusLoading = true
    await this.getIdentity()
    await this.getSettings()
    this.statusLoading = false
    const invoiced = this.$route.params.invoiced
    if (Number(invoiced) === 1) {
      this.$set(this.condition, 'invoiced', 1)
      this.invoicedType = 'applied'
    }
    this.getBillingList()
    this.checkSteps()
  }

  handleClick(tab: any) {
    if (this.loading) {
      return
    }
    if (tab.name === 'apply') {
      this.$set(this.condition, 'invoiced', 0)
    } else {
      this.$set(this.condition, 'invoiced', 1)
    }
    this.condition.page = 1
    this.getBillingList(tab.name)
  }

  getImgUrl(icon: string) {
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./' + icon + '.png')
  }

  toggleSelection(rows: any) {
    if (rows) {
      rows.forEach((row: any) => {
        ;(this.$refs.multipleTable as any).toggleRowSelection(row, true)
      })
    } else {
      ;(this.$refs.multipleTable as any).clearSelection()
    }
  }

  async changePage() {
    await this.getBillingList()
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data && identity.data.identity && Object.keys(identity.data.identity).length > 0) {
        this.identity = identity.data.identity
      }
      if (identity.data && identity.data.authStatus === -1) {
        this.$router.push({ path: '/' })
      }
    } catch (e) {
      console.info(e)
    }
  }

  async getBillingList(tab?: any) {
    this.currentData = []
    this.loading = true
    try {
      if (this.condition.invoiced === 0) {
        const ret = await this.$http.get('/api/v2/finance/receipt/billings', { params: this.condition })
        this.loading = false
        this.currentData = ret.data.items
        this.total = ret.data.total
        this.condition.total = ret.data.total
      } else {
        const ret = await this.$http.get('/api/v2/receipts', {
          params: { page: this.condition.page, limit: this.condition.limit },
        })
        this.loading = false
        this.currentData = ret.data.items
        this.total = ret.data.total
        this.condition.total = ret.data.total
      }
      tab && (this.invoicedType = tab)
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('getInfoErr') as string)
    }
  }

  handleSelectionChange(val: any) {
    this.receiptSelection = val
    if (this.receiptSelection.length === 0) {
      this.disableBtn = true
    } else if (this.checkSteps()) {
      this.disableBtn = false
    }
  }

  checkSteps() {
    if (
      !this.identity ||
      !this.settings ||
      this.identity.status === 2 ||
      this.receiptSelection.length === 0 ||
      this.amount <= 0
    ) {
      this.disableBtn = true
      return false
    }
    return true
  }

  jumpAuth() {
    this.$router.push({ path: '/settings/authentication' })
  }

  jumpSetting() {
    if (!this.settings && (!this.identity || this.identity.status === 2)) {
      this.$message.error(this.$t('identityWarn') as string)
      return
    }
    this.$router.push({ path: '/finance/receipt/setting' })
  }

  showReceiptDetail(show: boolean) {
    if (show) {
      this.applyBills = this.receiptSelection
    } else {
      this.applyBills = []
    }
    this.showDetail = show
  }
  detail(row: any) {
    this.showDetail = true
    this.applyBills = [row]
  }
  appliedDetail(id: number) {
    if (id) {
      this.$router.push({ path: `/finance/receipt/${id}/detail` })
    }
  }

  clear() {
    this.receiptSelection = []
    this.applyBills = []
    this.condition.page = 1
    this.condition.invoiced = 0
    this.invoicedType = 'apply'
    this.showDetail = false
    this.getBillingList()
    this.checkSteps()
    ;(this.$refs.multipleTable as any).clearSelection()
  }

  async submitApply(applyBills: any, extra: string, amount: number) {
    const currentMsg = this.$message.info(this.$t('InSubmitting') as string)
    try {
      const bills: any = []
      const onceBills: any = []
      applyBills.forEach((bill: any) => {
        if (bill.billType === 1) {
          bills.push(bill.id)
        } else if (bill.billType === 2) {
          onceBills.push(bill.id)
        }
      })
      const sales_email = applyBills[applyBills.length - 1].salesEmail
        ? applyBills[applyBills.length - 1].salesEmail
        : ''
      await this.$http.post('/api/v2/receipt/apply', {
        bill_ids: bills,
        extra: extra,
        identity: this.identity,
        settings: this.settings,
        amount: amount,
        sales_email: sales_email,
        once_bill_ids: onceBills,
      })
      currentMsg.close()
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.clear()
    } catch (e) {
      console.info(e)
      currentMsg.close()
      this.$message.error(this.$t('ApplyFail') as string)
    }
  }

  async getSettings() {
    try {
      const settings = await this.$http.get('/api/v2/receipt/setting', { params: { companyId: user.info.companyId } })
      if (settings.data) {
        this.settings = settings.data
      }
    } catch (e) {
      console.info(e)
    }
  }
}
