import Vue from 'vue'
import Component from 'vue-class-component'
import { CloudMedia, CloudMediaIds, ContentMedia, ContentMediaIds, MediaTypes, RtcMedia, RtcMediaIds } from '@/models'
import { concat } from 'lodash'
import moment from 'moment'
import MyPagiation from '@/components/MyPagination'

@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: `
    <div>
      <div class="module-title-tip">
        {{ $t('UsageTipe') }} <a target="_blank" :href="$t('PricingLink')">{{ $t('PricingDoc') }}</a>
      </div>
      <div class="card">
        <el-table
          :data="packages"
          v-loading="loading"
          @sort-change="sortChange"
          cell-class-name="min-table-cell"
          header-cell-class-name="table-header"
          stripe
          tooltip-effect="dark"
        >
          <el-table-column :label="$t('ProductType')" header-align="left" width="160">
            <template slot="header" slot-scope="scope">
              <el-dropdown @command="handleProductChange" placement="bottom-start">
                <span class="el-dropdown-link">
                  {{ productLabel }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="item in ProductTypeOption" :key="item.value" :command="item.value">
                    {{ $t(item.label) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template slot-scope="scope">
              <span v-if="scope.row.productType === 1">{{ $t('RTC') }}</span>
              <span v-else-if="scope.row.productType === 2">{{ $t('Cloud Recording') }}</span>
              <span v-else-if="scope.row.productType === 3">{{ $t('Content Center') }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Type')" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ $t(mediaTypes[scope.row.skuId]) || '' }}
            </template>
            <template slot="header" slot-scope="scope">
              <el-dropdown @command="handleMediaChange" placement="bottom-start" class="drop">
                <el-tooltip
                  class="item"
                  effect="light"
                  :content="mediaLabel"
                  placement="top-start"
                  :disabled="!condition.skuId"
                >
                  <span class="el-dropdown-link">
                    {{ mediaLabel }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="item in mediaTypeOption" :key="item.id" :command="item.id">
                    {{ $t(item.type) }}{{ $t(item.name) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Package Duration')" prop="usageQuote" sortable="custom"></el-table-column>
          <el-table-column :label="$t('Remaining Time')" prop="remainingUsage" sortable="custom"></el-table-column>
          <el-table-column :label="$t('Purchase Date')" sortable="custom" prop="buyTime">
            <template slot-scope="scope">
              <span>{{ scope.row.buyTime }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Expiration Date')" sortable="custom" prop="expireTime">
            <template slot-scope="scope">
              <span>{{ getItemExpired(scope.row.expireTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column width="100">
            <template slot="header" slot-scope="scope">
              <el-dropdown @command="handleStatusChange">
                <span class="el-dropdown-link">
                  {{ statusLabel }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>{{ $t('All') }}</el-dropdown-item>
                  <el-dropdown-item v-for="item in statusOption" :key="item" :command="item"
                    >{{ $t(item) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template slot-scope="scope">
              <span>{{ $t(getItemStatus(scope.row)) }}</span>
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
export default class MyMinPackageView extends Vue {
  ProductTypeOption = [
    { label: 'RTC', value: 1, text: 'RTC' },
    { label: 'Cloud Recording', value: 2, text: 'Cloud Recording' },
    { label: 'Content Center', value: 3, text: 'Content Center' },
  ]
  loading = false
  total = 0
  packages: any = []
  mediaTypes: any = MediaTypes
  statusOption = ['normal', 'expired', 'usedUp']
  productType = 1
  condition: any = {
    page: 1,
    limit: 10,
    productType: undefined,
    skuId: undefined,
    status: '',
    prop: undefined,
    order: undefined,
    total: 0,
  }
  mediaMap: Map<number, any> = new Map([
    [1, RtcMedia],
    [2, CloudMedia],
    [3, ContentMedia],
  ])
  mediaIdsMap: Map<number, any> = new Map([
    [1, RtcMediaIds],
    [2, CloudMediaIds],
    [3, ContentMediaIds],
  ])
  mediaLabelMap: Map<number, any> = new Map()

  created() {
    this.mediaLabelMap.set(1, this.$t('RTC'))
    this.mediaLabelMap.set(2, this.$t('Cloud Recording'))
    this.mediaLabelMap.set(3, this.$t('Content Center'))
    this.getMinPackages()
  }

  get mediaTypeOption() {
    return (
      this.mediaMap.get(Number(this.condition.productType)) ||
      concat(this.mediaMap.get(1), this.mediaMap.get(2), this.mediaMap.get(3))
    )
  }

  get mediaLabel() {
    if (!this.condition.skuId) {
      return this.$t('Type')
    }
    let str = '('
    str += this.mediaLabelMap.get(Number(this.condition.productType)) || '-'
    str += ')'
    str += `${this.$t(this.mediaTypes[this.condition.skuId])}`
    return str
  }

  get productLabel() {
    return this.mediaLabelMap.get(Number(this.condition.productType)) || this.$t('ProductType')
  }

  get statusLabel() {
    return this.condition.status ? this.$t(this.condition.status) : this.$t('Status')
  }

  async getMinPackages() {
    this.loading = true
    try {
      const ret = await this.$http.get('/api/v2/package/usagePackage', { params: this.condition })
      this.total = ret.data.total
      this.condition.total = ret.data.total
      this.packages = ret.data.items
    } catch (e) {}
    this.loading = false
  }

  getList() {
    this.condition.page = 1
    this.getMinPackages()
  }
  getItemStatus(item: any) {
    if (moment(item.expireTime).isBefore(moment())) {
      return 'expired'
    }
    if (item.remainingUsage <= 0) {
      return 'usedUp'
    }
    return 'normal'
  }
  getItemExpired(expireTime: any) {
    return moment.utc(expireTime).subtract(1, 'days').format('YYYY-MM-DD')
  }
  handleProductChange(value: any) {
    this.condition.productType = value
    this.condition.skuId = undefined
    this.getList()
  }
  handleMediaChange(value: any) {
    if (this.mediaIdsMap.get(1).includes(value)) {
      this.productType = 1
    } else if (this.mediaIdsMap.get(2).includes(value)) {
      this.productType = 2
    } else if (this.mediaIdsMap.get(3).includes(value)) {
      this.productType = 3
    }
    this.condition.skuId = value
    this.getList()
  }
  handleStatusChange(value: any) {
    this.condition.status = value
    this.getList()
  }
  changePage() {
    this.getMinPackages()
  }
  sortChange(condition: any) {
    this.condition.prop = condition.prop
    this.condition.order = condition.order
    this.condition.page = 1
    this.getMinPackages()
  }
  jumpToPurchase() {
    this.$router.push({
      path: '/packages/minPackage',
    })
  }
}
