import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import MyPagiation from '@/components/MyPagination'
import './PackageList.less'
import { RouteRecord } from 'vue-router/types/router'

@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: `
    <div class="page-v3">
      <div class="card">
        <el-table
          class="mt-20"
          v-loading="loading"
          :data="packages"
          stripe
          row-class-name="dark-table-row"
          :empty-text='$t("No Data")'
          cell-class-name="text-truncate"
          header-cell-class-name="text-truncate"
        >
          <el-table-column :label='$t("Package Name")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ getItemPackageName(scope.row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Package Type")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ $t(packageType) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("First purchase")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.createTime | UTC | formatDate('YYYY-MM-DD') }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Auto renew")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ getItemAutoRenew(scope.row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Status")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span>{{ getItemStatus(scope.row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label='$t("Action")' label-class-name="table-title" class-name="table-content">
            <template slot-scope="scope">
              <div>
                <span class="link mr-2" @click="showDetailDialog(scope.row)">{{ $t('Detail') }}</span>
                <span
                  class="link"
                  v-if="scope.row.subscriptionStatus === 'Active'"
                  @click="confirmSubscription(scope.row)"
                  >{{ $t('CancelSub') }}</span
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt-2 text-right" v-if="total > 10">
          <my-pagination v-model="condition" @change="changePage"></my-pagination>
        </div>
      </div>
      <el-dialog
        :title='$t("Detail")'
        :visible.sync="showDetail"
        @close="() => showDetail = false"
        class="detail-dialog"
      >
        <div>
          <label>{{ $t('Package Name') }}:</label>
          <span>{{ getItemPackageName(selectSubscription) }}</span>
        </div>
        <div>
          <label>{{ $t('Package Type') }}:</label>
          <span>{{ $t(packageType) }}</span>
        </div>
        <div>
          <label>{{ $t('First Purchase') }}:</label>
          <span>{{ selectSubscription.createTime | UTC | formatDate('YYYY-MM-DD') }}</span>
        </div>
        <div>
          <label>{{ $t('Effective since') }}:</label>
          <span>{{ getEffectiveSince(selectSubscription) | formatDate('YYYY-MM') }}</span>
        </div>
        <div>
          <label>{{ $t('Exp date') }}:</label>
          <span>{{ selectSubscription.expireTime | UTC | formatDate('YYYY-MM-DD') }}</span>
        </div>
        <div>
          <label>{{ $t('By') }}:</label>
          <span>{{ selectSubscription.agent }}</span>
        </div>
        <div>
          <label>{{ $t('Package Price') }}:</label>
          <span>{{ selectSubscription.payPrice + selectSubscription.currency }}</span>
        </div>
        <div>
          <label>{{ $t('Status') }}:</label>
          <span>{{ getItemStatus(selectSubscription) }}</span>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class PackageListView extends Vue {
  loading = false
  total: any = null
  packages: any[] = []
  selectSubscription: any = {}
  packageType = 'Agora Analytics Package'
  condition: any = {
    page: 1,
    limit: 10,
    type: undefined,
    total: 0,
  }
  showDetail = false

  mounted() {
    this.getPackages()
    this.changeBreadcrumb()
  }

  async getPackages() {
    try {
      this.loading = true
      const ret = await this.$http.get(`/api/v2/goods/company/order`, { params: this.condition })
      this.loading = false
      this.packages = ret.data.items
      this.total = ret.data.totalCount
      this.condition.total = ret.data.totalCount
    } catch (e) {
      this.$message.error(this.$t('getInfoErr') as string)
    }
  }

  async changePage() {
    this.$router.push({ query: Object.assign({}, this.$route.query, this.condition) })
    await this.getPackages()
  }
  getItemPackageName(item: any) {
    if (!item.goodsI18n) return ''
    return this.$i18n.locale === 'en' ? item.goodsI18n.en.name : item.goodsI18n['zh-Hans'].name
  }
  getItemStatus(item: any) {
    return item.subscriptionStatus === 'Active' ? this.$t('Active') : this.$t('Inactive')
  }
  getItemAutoRenew(item: any) {
    return item.subscriptionStatus === 'Active' ? this.$t('On') : this.$t('Off')
  }
  getEffectiveSince(item: any) {
    return moment(item.createTime).add(1, 'month')
  }
  confirmSubscription(item: any) {
    this.$confirm(
      `${this.$t('CancelTip')} <a href="${this.$t('AABillingDoc')}" target="_blank" class="link">${this.$t(
        'documentation'
      )}</a>`,
      this.$t('ConfirmApply') as string,
      {
        confirmButtonText: this.$t('Continue') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
      .then(async () => {
        await this.cancelSubscription(item)
      })
      .catch(() => {})
  }
  async cancelSubscription(item: any) {
    try {
      this.loading = true
      await this.$http.put(`/api/v2/goods/company/subscription/${item.uid}/cancel`)
      this.$message({
        message: this.$t('Cancel Success') as string,
        type: 'success',
      })
      this.getPackages()
    } catch (e) {
      this.$message.error(this.$t('Update Error') as string)
    }
    this.loading = false
  }
  showDetailDialog(item: any) {
    this.showDetail = true
    this.selectSubscription = item
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push({
      path: this.$route.fullPath,
      meta: {
        breadcrumb: 'My Package Subscription',
      },
    })
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
