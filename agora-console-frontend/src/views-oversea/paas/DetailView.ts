import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import moment from 'moment'
import './style/detail.less'

@Component({
  template: `
    <div class="extension-detail">
      <div class="module-title">{{ getI18NValue(productInfo.productEnName, productInfo.productCnName) }}</div>
      <div class="content-main">
        <div class="content-left">
          <div class="card content-part" v-loading="basicInfoLoading">
            <p class="card-title">{{ $t('BasicInfo') }}</p>
            <el-row>
              <el-col :span="18">
                <div class="info-item">
                  <span class="info-label">{{ $t('Product Name') }}</span>
                  <span class="info-value">{{
                    getI18NValue(productInfo.productEnName, productInfo.productCnName)
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t('Opening date') }}</span>
                  <span class="info-value">{{ getOpenedDate | formatDate('YYYY-MM-DD') }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t('Payment model') }}</span>
                  <span class="info-value">{{ $t('Prepayment') }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="card content-part" v-loading="projectsLoading">
            <p class="card-title">{{ $t('LauchedProject') }}</p>
            <div v-if="!projectWritePermission">{{ $t('PermissionText') }}</div>
            <el-table
              v-else
              :data="projects"
              v-loading="loading"
              cell-class-name="min-table-cell"
              header-cell-class-name="table-header"
              border
              stripe
              tooltip-effect="dark"
            >
              <el-table-column
                :label="$t('ProjectName')"
                prop="name"
                header-align="left"
                class-name="table-content"
              ></el-table-column>
              <el-table-column
                prop="stage"
                :label='$t("Stage")'
                label-class-name="table-title"
                class-name="table-content"
                width="180px"
              >
                <template slot-scope="scope">
                  <span :class="{ green: scope.row.stage === 2, yellow: scope.row.stage === 3 }">
                    {{ $t(formatStage(scope.row.stage)) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('CreateDate')"
                prop="createdAt"
                header-align="left"
                class-name="table-content"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row?.createdAt | formatDate('YYYY-MM-DD') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Status')" header-align="left" class-name="table-content">
                <template slot="header" slot-scope="scope">
                  <el-dropdown
                    @command="statusChange"
                    placement="bottom-start"
                    style="padding:0;color:#333333;position: relative;top:2px"
                  >
                    <span class="el-dropdown-link">
                      {{ $t(statusMap[condition.marketplaceStatus]) }}<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item v-for="item in statusOptions" :key="item.value" :command="item.value">{{
                        $t(item.label)
                      }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
                <template slot-scope="scope">
                  <span v-if="scope.row.AppInfo && scope.row.AppInfo.disabled === 0">{{ $t('PaasEnabled') }}</span>
                  <span v-else>{{ $t('Inactive') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Action')" header-align="left" class-name="table-content">
                <template slot-scope="scope">
                  <span
                    class="action"
                    v-if="scope.row.AppInfo && scope.row.AppInfo.disabled === 0"
                    @click="actionSetting(scope.row, 1)"
                    >{{ $t('DoDisabled') }}</span
                  >
                  <span class="action" v-else @click="actionSetting(scope.row, 0)">{{ $t('DoEnabled') }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="float-right mt-2" v-if="total > 5">
              <el-pagination
                background
                layout="prev, pager, next"
                @current-change="changePage"
                :current-page="condition.page"
                :page-size="condition.limit"
                :total="total"
              >
              </el-pagination>
            </div>
          </div>
          <div class="card content-part">
            <p class="card-title">{{ $t('PurchasedPackage') }}</p>
            <el-table
              :data="packages"
              v-loading="projectsLoading"
              cell-class-name="min-table-cell"
              header-cell-class-name="table-header"
              border
              stripe
              tooltip-effect="dark"
            >
              <el-table-column
                :label="$t('PackageName')"
                prop="packageName"
                header-align="left"
                class-name="table-content"
              ></el-table-column>
              <el-table-column
                :label="$t('Package Duration')"
                prop="usageQuota"
                class-name="table-content"
              ></el-table-column>
              <el-table-column :label="$t('Remaining Time')" class-name="table-content">
                <template slot-scope="scope">
                  <span>{{ scope.row.usageQuota - scope.row.quotaUsed }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Purchase Date')" prop="buyTime" class-name="table-content">
                <template slot-scope="scope">
                  <span>{{ scope.row.effectiveDate | formatDate('YYYY-MM-DD') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Expiration Date')" prop="expireTime" class-name="table-content">
                <template slot-scope="scope">
                  <span>{{ scope.row.expireDate | formatUTCDate('YYYY-MM-DD') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Status')" class-name="table-content">
                <template slot-scope="scope">
                  <span>{{ $t(getItemStatus(scope.row)) }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="float-right mt-2" v-if="packageTotal > 5">
              <el-pagination
                background
                layout="prev, pager, next"
                @current-change="changePackagePage"
                :current-page="packageCondition.page"
                :page-size="packageCondition.limit"
                :total="packageTotal"
              >
              </el-pagination>
            </div>
          </div>
        </div>
        <div class="content-side">
          <div class="card content-part">
            <p class="card-title">{{ $t('Actions') }}</p>
            <div class="action-item" @click="jumpToSetting">{{ $t('Configuration Project') }}</div>
            <div class="action-item" @click="jumpToUsage">{{ $t('CheckUsage') }}</div>
            <div class="action-item" @click="checkBill">{{ $t('CheckBills') }}</div>
            <div class="action-item" @click="jumpToPackage">{{ $t('Purchase Package') }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class DetailView extends Vue {
  loading = false
  serviceName = ''
  packages = []
  productInfo = {
    productEnName: '',
    productCnName: '',
  }
  projects = []
  openedProjects: any[] = []
  total = null
  packageTotal = null
  basicInfoLoading = false
  projectsLoading = false
  packagesLoading = false
  projectWritePermission = user.info.permissions['ProjectManagement'] > 1
  isCocos = user.info.isCocos
  condition = {
    page: 1,
    limit: 5,
    key: undefined,
    marketplaceStatus: 0,
    serviceName: '',
    sortProp: 'stage',
    sortOrder: 'DESC',
  }
  packageCondition = {
    page: 1,
    limit: 5,
  }
  packageStatus = {
    1: 'Normal',
    2: 'Expired',
    3: 'UsedUp',
    4: 'Refunded',
  }
  packageStatusMap = {
    refunded: 4,
  }
  stageMap: any = {
    0: 'All',
    1: 'Not specified',
    2: 'Live',
    3: 'Testing',
  }
  statusMap = {
    0: 'PaasActive',
    1: 'PaasInactive',
    2: 'All',
    3: 'Review',
  }
  statusOptions = [
    { label: 'All', value: 2 },
    { label: 'PaasActive', value: 0 },
    { label: 'PaasInactive', value: 1 },
    { label: 'Review', value: 3 },
  ]
  getI18NValue(en: string, cn: string) {
    return this.$i18n.locale === 'en' ? en : cn
  }
  get getOpenedDate() {
    return this.openedProjects.length > 0 ? this.openedProjects[0].createdAt : null
  }
  init() {
    this.getProductPackageList()
    this.getVendorInfo()
    this.getProjects()
    this.getOpenedProjects()
  }
  async getVendorInfo() {
    this.basicInfoLoading = true
    try {
      const res = await this.$http.get(`/api/v2/marketplace/vendor/${this.serviceName}`)
      this.productInfo = res.data
    } catch (e) {}
    this.basicInfoLoading = false
  }
  async getProductPackageList() {
    this.packagesLoading = true
    try {
      const res = await this.$http.get(`/api/v2/package/marketplacePackage/${this.serviceName}/purchased`, {
        params: this.packageCondition,
      })
      this.packageTotal = res.data.total
      this.packages = res.data.items
    } catch (e) {}
    this.packagesLoading = false
  }
  async getProjects() {
    this.projectsLoading = true
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: this.condition })
      this.projects = ret.data.items
      this.total = ret.data.total
      this.projects.forEach((item: any) => {
        const tmp = item.AppInfo.filter((app: { serviceName: string }) => app.serviceName === this.serviceName)
        item.AppInfo = tmp.length === 0 ? null : tmp[0]
      })
    } catch (e) {
      this.$message.error(e.message)
    }
    this.projectsLoading = false
  }
  async getOpenedProjects() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/marketplace/company/${this.serviceName}/projects`)
      this.openedProjects = res.data.rows
    } catch (e) {}
    this.loading = false
  }
  getItemStatus(item: { status: number; expireDate: moment.MomentInput; usageQuota: number; quotaUsed: number }) {
    if (item.status === this.packageStatusMap.refunded) {
      return 'Refunded'
    }
    if (moment(item.expireDate).isBefore(moment())) {
      return 'expired'
    }
    if (item.usageQuota - item.quotaUsed <= 0) {
      return 'usedUp'
    }
    return 'normal'
  }
  checkBill() {
    this.$router.push({
      path: `/finance/billing?tab=once-bills`,
    })
  }
  jumpToPackage() {
    this.$router.push({
      path: '/marketplace/introduce',
      query: { serviceName: this.serviceName },
    })
  }
  jumpToSetting() {
    if (!this.projectWritePermission) {
      this.$message.warning(this.$t('PermissionText') as string)
      return
    }
    this.$router.push({
      path: `/marketplace/own/${this.serviceName}/setting`,
    })
  }
  jumpToUsage() {
    this.$router.push({
      path: `/usage/marketplace/${this.serviceName}`,
      query: {
        projectId: '0',
        title: this.getI18NValue(this.productInfo.productEnName, this.productInfo.productCnName),
      },
    })
  }
  actionSetting(project: { projectId: any }, action: any) {
    this.$router.push({
      path: `/marketplace/own/${this.serviceName}/setting`,
      query: {
        projectId: project.projectId,
        action: action,
      },
    })
  }
  formatStage(stageIndex: string | number) {
    return this.stageMap[stageIndex]
  }
  statusChange(value: number) {
    this.condition.marketplaceStatus = value
    this.changePage(1)
  }
  changePage(page: number) {
    this.condition.page = page
    this.getProjects()
  }
  changePackagePage(page: number) {
    this.packageCondition.page = page
    this.getProductPackageList()
  }
  created() {
    this.serviceName = this.$route.query.serviceName as string
    this.condition.serviceName = this.serviceName
  }
  mounted() {
    this.init()
  }
}
