import Vue from 'vue'
import Component from 'vue-class-component'
import MyPagiation from '@/components/MyPagination'
import { LicenseOrderHistory, OrderType, LicenseProductType, MediaType, LicenseProduct } from '@/models/licenseModels'
import LicenseTooltip from '@/views/license/LicenseTooltip'

@Component({
  components: {
    'my-pagination': MyPagiation,
    'license-tooltip': LicenseTooltip,
  },
  template: `
    <div class="page" v-loading="loading">
      <div class="card">
        <el-table
          :data="purchaseList"
          :empty-text='$t("EmptyDataMessage")'
          @expand-change="expandChange"
          row-key="id"
          class="license-table"
        >
          <el-table-column type="expand" width="50">
            <template slot-scope="scope">
              <el-table :data="scope.row.renewList" class="license-table--expand" v-loading="scope.row.loading">
                <el-table-column label-class-name="table-title" width="50"></el-table-column>
                <el-table-column prop="renewId" :label='$t("RenewPID")' label-class-name="table-title" width="280">
                </el-table-column>
                <el-table-column prop="createTime" :label='$t("RenewDate")' label-class-name="table-title">
                </el-table-column>
                <el-table-column prop="sales" :label='$t("Sales")' label-class-name="table-title"> </el-table-column>
                <el-table-column prop="count" :label='$t("RenewQuantity")' label-class-name="table-title">
                </el-table-column>
                <el-table-column prop="duration" :label='$t("RenewValidityPeriod")' label-class-name="table-title">
                  <template slot-scope="scope">
                    <span>{{ scope.row.duration }} {{ $t('Year') }}</span>
                  </template>
                </el-table-column>
                <el-table-column label-class-name="table-title"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            prop="pid"
            :label='$t("PID")'
            label-class-name="table-title"
            class-name="table-content"
            width="280"
          >
            <template slot-scope="scope">
              <license-tooltip :product-sku-data="scope.row.productSku" :quantity="scope.row.count"></license-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" :label='$t("Purchase Date")' label-class-name="table-title">
          </el-table-column>
          <el-table-column prop="sales" :label='$t("Sales")' label-class-name="table-title"> </el-table-column>
          <el-table-column prop="count" :label='$t("Quantity")' label-class-name="table-title"> </el-table-column>
          <el-table-column prop="duration" :label='$t("ValidityPeriod")' label-class-name="table-title">
            <template slot-scope="scope">
              <span>
                {{ scope.row.duration }} {{ scope.row.type === OrderType.Standard ? $t('Year') : $t('Month') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="type" :label='$t("LicenseType")' label-class-name="table-title">
            <template slot-scope="scope">
              <span v-if="scope.row.type === OrderType.Standard" class="stage-live">{{ $t('Standard') }}</span>
              <span v-else class="stage-test">{{ $t('LicenseTesting') }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="text-right">
          <my-pagination v-model="condition" @change="changePage"></my-pagination>
        </div>
      </div>
    </div>
  `,
})
export default class Purchase extends Vue {
  loading = false
  lincenseProductList = ['RTC', 'RTSA', 'FPA']
  condition: any = {
    page: 1,
    limit: 10,
    total: 0,
  }
  purchaseList: LicenseOrderHistory[] = []
  renewList: LicenseOrderHistory[] = []
  OrderType = OrderType
  LicenseProductType = LicenseProductType
  MediaType = MediaType
  LicenseProduct = LicenseProduct
  expandLoading = false

  async mounted() {
    await this.getLicensePurchaseHistory()
  }

  changePage() {
    const condition = Object.assign({}, this.condition)
    this.$router.push({ query: condition })
    this.getLicensePurchaseHistory()
  }

  async getLicensePurchaseHistory() {
    try {
      this.loading = true
      const ret = await this.$http.get('/api/v2/license/apply', { params: this.condition })
      this.condition.total = ret.data.total
      this.purchaseList = ret.data.list
      this.purchaseList.forEach((item) => {
        item.renewList = []
      })
    } catch (e) {
      this.$message.error(e.message)
    }
    this.loading = false
  }

  async expandChange(row: LicenseOrderHistory) {
    try {
      this.$set(row, 'loading', true)
      const ret = await this.$http.get('/api/v2/license/renew', { params: { ...this.condition, pid: row.pid } })
      row.renewList = ret.data.list
    } catch (e) {
      this.$message.error(e.message)
    }
    this.$set(row, 'loading', false)
  }
}
