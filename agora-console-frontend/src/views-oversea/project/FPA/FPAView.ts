import Vue from 'vue'
import Component from 'vue-class-component'
import MyPagiation from '@/components/MyPagination'
import FPADetail from '@/views-oversea/project/FPA/FPADetail'
import ManualRecordsDialog from '@/views-oversea/project/FPA/ ManualRecordsDialog'
import qs from 'query-string'

@Component({
  components: {
    'my-pagination': MyPagiation,
    'fpa-detail': FPADetail,
    'manual-records': ManualRecordsDialog,
  },
  template: `<div class="fpa-page">
    <div class="d-flex">
      <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
      <el-breadcrumb separator="|" class="mb-20">
        <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('Back') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $t('Full-Path Accelerator') }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="mb-20">
      <console-button class="console-btn-primary" @click="gotoCreateFPAService">
        {{ $t('Create FPA service') }}
      </console-button>
      <div class="float-right link" @click="jumpToAA" v-if="hasFPAPackage || hasFPAPackageSubscription">
        >> {{ $t('Go Agora Analytics') }}
      </div>
      <div class="float-right link" @click="confirmOpenFPAPackege" v-else>>> {{ $t('Subscribe FPA AA Package') }}</div>
    </div>
    <el-tabs v-model="type" @tab-click="switchTab" type="card" class="message-tab">
      <el-tab-pane :label="$t('Origin Site Management')" name="upstreams">
        <div class="tab-container" v-if="type === 'upstreams'">
          <div class="d-flex align-center justify-between">
            <div>
              <el-input
                v-model="condition.upstream_name"
                class="w-200"
                size="medium"
                :placeholder="$t('Name Text')"
                @keyup.enter.native="getUpstreamsData()"
                clearable
              ></el-input>
              <console-button class="console-btn-primary ml-20" @click="getUpstreamsData()">{{
                $t('Search Button')
              }}</console-button>
            </div>
          </div>
          <el-table
            v-loading="loading"
            class="mt-20"
            :data="data"
            :empty-text='$t("EmptyDataMessage")'
            cell-class-name="text-truncate"
            header-cell-class-name="text-truncate"
          >
            <el-table-column prop="id" :label='$t("ID")' width="80"></el-table-column>
            <el-table-column prop="name" :label='$t("Name Text")'></el-table-column>
            <el-table-column :label='$t("Protocol/Port")'>
              <template slot-scope="scope" v-if="scope.row.protocol && scope.row.sources">
                <div v-for="item in scope.row.sources">
                  {{ scope.row.protocol + '/' + item.port }}
                </div>
              </template>
            </el-table-column>
            <el-table-column :label='$t("Origin site")'>
              <template slot-scope="scope" v-if="scope.row.sources">
                <div v-for="item in scope.row.sources">
                  {{ item.address }}
                </div>
              </template>
            </el-table-column>
            <el-table-column :label='$t("Action")' width="150">
              <template slot-scope="scope">
                <span class="link" @click="handleShowDetail('upstreams', scope.row)">{{ $t('Detail') }}</span>
                <span class="danger" @click="comfirmDeleteUpstreams(scope.row.id, scope.row)">
                  {{ $t('Delete') }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt-2 text-right" v-if="condition.total > 10">
            <my-pagination v-model="condition" @change="changePage"></my-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('Channel Management')" name="chains">
        <div class="tab-container" v-if="type === 'chains'">
          <div class="d-flex align-center">
            <el-input
              v-model="condition.chain_name"
              class="w-200"
              size="medium"
              :placeholder="$t('Name Text')"
              @keyup.enter.native="getChainsData()"
              clearable
            ></el-input>
            <el-input
              v-model="condition.ip"
              class="w-200 ml-20"
              size="medium"
              :placeholder="$t('Edge IP')"
              @keyup.enter.native="getChainsData()"
              clearable
            ></el-input>
            <console-button class="console-btn-primary ml-20" @click="getChainsData()">{{
              $t('Search Button')
            }}</console-button>
          </div>
          <el-table
            v-loading="loading"
            class="mt-20"
            :data="data"
            :empty-text='$t("EmptyDataMessage")'
            cell-class-name="text-truncate"
            header-cell-class-name="text-truncate"
          >
            <el-table-column prop="id" :label='$t("ID")'></el-table-column>
            <el-table-column prop="hint" :label='$t("Name Text")'></el-table-column>
            <el-table-column :label='$t("Edge IP")' width="200">
              <template slot-scope="scope" v-if="scope.row.client_infos">
                <div v-for="item in scope.row.client_infos">
                  {{ item.ip + '(' + item.city + ')' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column :label='$t("Gateway IP")'>
              <template slot-scope="scope" v-if="scope.row.server_infos">
                <div v-for="item in scope.row.server_infos">
                  {{ item.ip + '(' + item.city + ')' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column :label='$t("Protocol/Port")'>
              <template slot-scope="scope" v-if="scope.row.inbound">
                {{ scope.row.inbound.protocol + '/' + scope.row.port }}
              </template>
            </el-table-column>
            <el-table-column :label='$t("Bandwith Limit")'>
              <template slot-scope="scope">
                <span>{{ scope.row.bandwidth_hardlimit | bpsToMbps }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="concurrency_limit" :label='$t("Connection Limit")'></el-table-column>
            <el-table-column prop="upstream_id" :label='$t("Origin site id")'></el-table-column>
            <el-table-column :label='$t("Action")' width="150">
              <template slot-scope="scope">
                <span class="link" @click="handleShowDetail('chains', scope.row)">{{ $t('Detail') }}</span>
                <span class="danger" @click="comfirmDeleteChains(scope.row.id, 'chains')"> {{ $t('Delete') }} </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt-2 text-right" v-if="condition.total > 10">
            <my-pagination v-model="condition" @change="changePage"></my-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('SDK Management')" name="sdk">
        <div class="tab-container" v-if="type === 'sdk'">
          <div class="d-flex align-center">
            <el-input
              v-model="condition.chain_name"
              class="w-200"
              size="medium"
              :placeholder="$t('Name Text')"
              @keyup.enter.native="getSDKChainsData()"
              clearable
            ></el-input>
            <el-input
              v-model="condition.ip"
              class="w-200 ml-20"
              size="medium"
              :placeholder="$t('Gateway IP')"
              @keyup.enter.native="getSDKChainsData()"
              clearable
            ></el-input>
            <console-button class="console-btn-primary ml-20" @click="getSDKChainsData()">{{
              $t('Search Button')
            }}</console-button>
          </div>
          <el-table
            v-loading="loading"
            class="mt-20"
            :data="data"
            :empty-text='$t("EmptyDataMessage")'
            cell-class-name="text-truncate"
            header-cell-class-name="text-truncate"
          >
            <el-table-column prop="id" :label='$t("ID")'></el-table-column>
            <el-table-column prop="name" :label='$t("Name Text")'></el-table-column>
            <el-table-column :label='$t("Gateway IP")'>
              <template slot-scope="scope" v-if="scope.row.server_infos">
                <div v-for="item in scope.row.server_infos">
                  {{ item.ip + '(' + item.city + ')' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column :label='$t("Bandwith Limit")'>
              <template slot-scope="scope">
                <span>{{ scope.row.bandwidth | bpsToMbps }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="concurrency_limit" :label='$t("Connection Limit")'></el-table-column>
            <el-table-column prop="upstream" :label='$t("Origin site id")'></el-table-column>
            <el-table-column :label='$t("Action")' width="150">
              <template slot-scope="scope">
                <span class="link" @click="handleShowDetail('sdk-chains', scope.row)">{{ $t('Detail') }}</span>
                <span class="danger" @click="comfirmDeleteChains(scope.row.id, 'sdk-chains')">
                  {{ $t('Delete') }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt-2 text-right" v-if="condition.total > 10">
            <my-pagination v-model="condition" @change="changePage"></my-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <console-drawer
      :title="type === 'upstreams' ? $t('Origin Site details') : type === 'chains' ? $t('Chain details') : $t('SDK details')"
      :handleClose="handleClose"
      :class="showDetail ? '' : 'console-drawer-hide'"
    >
      <fpa-detail
        :type="type"
        :data="detailData"
        :editing="detailEdit"
        :handleEdit="handleDetailEdit"
        @updateUpstreams="updateUpstreams"
        @updateChains="updateChains"
        @updateSDKChains="updateSDKChains"
      ></fpa-detail>
    </console-drawer>

    <manual-records
      v-if="showManualDialog"
      :data="manualRecords"
      :showManualRecords="showManualRecords"
    ></manual-records>
  </div>`,
})
export default class FPAView extends Vue {
  loading = false
  type = 'upstreams'
  data: any = []
  detailData: any = {}
  manualRecords: any = []
  currentGoods = []
  subscribedGoods = []
  FPAGoodsInfo: any = {}
  projectId = ''
  condition: any = {
    page: 1,
    limit: 10,
    total: 0,
    upstream_name: '',
    chain_name: '',
    ip: '',
    upstream_id: '',
  }
  showDetail = false
  showManualDialog = false
  detailEdit = false

  switchTab(tab: any) {
    this.condition.page = 1
    this.type = tab.name
    if (tab.name === 'upstreams') {
      this.getUpstreamsData()
    }
    if (tab.name === 'chains') {
      this.getChainsData()
    }
    if (tab.name === 'sdk') {
      this.getSDKChainsData()
    }
  }

  get aaPackageConfig() {
    return this.GlobalConfig.config.aaPackage
  }

  get hasFPAPackage() {
    return (
      this.currentGoods &&
      this.currentGoods.length &&
      this.currentGoods.find((item: any) => {
        return item.mutexTag.toUpperCase() === 'FPA' && item.orderStatus === 'Paid'
      })
    )
  }

  get hasFPAPackageSubscription() {
    return (
      this.subscribedGoods &&
      this.subscribedGoods.length &&
      this.subscribedGoods.find((item: any) => {
        return item.customUid === this.aaPackageConfig.fpaCustomUid && item.subscriptionStatus === 'Active'
      })
    )
  }

  async mounted() {
    this.projectId = this.$route.params.id
    this.getUpstreamsData()
    this.getManualRecords()
    this.getFPAGoods()
    this.getCurrentOrders()
    this.getSubscribedGoods()
  }

  async getUpstreamsData() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/upstreams`, {
        params: this.condition,
      })
      this.condition.total = res.data.total
      this.data = res.data.upstreams
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.backToEditProject()
    }
    this.loading = false
  }

  async getChainsData() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/chains`, {
        params: this.condition,
      })
      this.condition.total = res.data.total
      this.data = res.data.chains
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.backToEditProject()
    }
    this.loading = false
  }

  async getSDKChainsData() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/sdk-chains`, {
        params: this.condition,
      })
      this.condition.total = res.data.total
      this.data = res.data.sdk_chains
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.backToEditProject()
    }
    this.loading = false
  }

  async getManualRecords() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/manual-records`, {
        params: this.condition,
      })
      this.manualRecords = res.data.data
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      this.backToEditProject()
    }
  }

  changePage() {
    if (this.type === 'upstreams') {
      this.getUpstreamsData()
    } else if (this.type === 'chains') {
      this.getChainsData()
    } else if (this.type === 'sdk') {
      this.getSDKChainsData()
    }
  }

  handleShowDetail(type: string, item: any) {
    this.showDetail = true
    this.detailData = Object.assign({}, item)
    this.handleDetailEdit(false)
  }

  handleClose() {
    this.showDetail = false
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }

  gotoCreateFPAService() {
    this.$router.push({ name: 'FPACreate', params: { id: this.projectId } })
  }

  comfirmDeleteChains(id: number, type: string) {
    this.$confirm(this.$t('Delete the chain tip') as string, this.$t('Confirm') as string, {
      confirmButtonText: this.$t('Continue') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    })
      .then(async () => {
        if (type === 'chains') {
          this.deleteChains(id)
        } else if (type === 'sdk-chains') {
          this.deleteSDKChains(id)
        }
      })
      .catch(() => {})
  }

  comfirmDeleteUpstreams(id: number, item: any) {
    if (item.chains.length > 0) {
      this.$message.error(
        this.$t('Your source site has been bound to the chain, please delete the chain first', {
          ID: item.chains[0],
        }) as string
      )
      return
    }
    if (item.sdk_chains > 0) {
      this.$message.error(
        this.$t('Your source site has been bound to the SDK, please delete the chain first', {
          ID: item.sdk_chains[0],
        }) as string
      )
      return
    }
    this.$confirm(this.$t('Delete the origin site tip') as string, this.$t('Confirm') as string, {
      confirmButtonText: this.$t('Continue') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    })
      .then(async () => {
        this.deleteUpstreams(id)
      })
      .catch(() => {})
  }

  async deleteSDKChains(id: number) {
    this.loading = true
    try {
      await this.$http.delete(`/api/v2/project/${this.projectId}/sdk-chains/${id}`)
      this.$message({
        message: this.$t('DeleteSuccess') as string,
        type: 'success',
      })
      this.getSDKChainsData()
    } catch (e) {
      this.$message.error(this.$t('delete_failed') as string)
    }
    this.loading = false
  }

  async deleteChains(id: number) {
    this.loading = true
    try {
      await this.$http.delete(`/api/v2/project/${this.projectId}/chains/${id}`)
      this.$message({
        message: this.$t('DeleteSuccess') as string,
        type: 'success',
      })
      this.getChainsData()
    } catch (e) {
      this.$message.error(this.$t('delete_failed') as string)
    }
    this.loading = false
  }

  async deleteUpstreams(id: number) {
    this.loading = true
    try {
      await this.$http.delete(`/api/v2/project/${this.projectId}/upstreams/${id}`)
      this.$message({
        message: this.$t('DeleteSuccess') as string,
        type: 'success',
      })
      this.getUpstreamsData()
    } catch (e) {
      this.$message.error(this.$t('delete_failed') as string)
    }
    this.loading = false
  }

  showManualRecords(show: boolean) {
    this.showManualDialog = show
  }

  handleDetailEdit(edit: boolean) {
    this.detailEdit = edit
  }

  async updateUpstreams(id: number, data: any) {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.projectId}/upstreams/${id}`, data)
      this.$message({
        message: this.$t('SaveSucess') as string,
        type: 'success',
      })
      this.handleClose()
      this.handleDetailEdit(false)
      this.getUpstreamsData()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async updateChains(id: number, data: any) {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.projectId}/chains/${id}`, data)
      this.$message({
        message: this.$t('SaveSucess') as string,
        type: 'success',
      })
      this.handleClose()
      this.handleDetailEdit(false)
      this.getChainsData()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async updateSDKChains(id: number, data: any) {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.projectId}/sdk-chains/${id}`, data)
      this.$message({
        message: this.$t('SaveSucess') as string,
        type: 'success',
      })
      this.handleClose()
      this.handleDetailEdit(false)
      this.getSDKChainsData()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  jumpToAA() {
    const queryStr = `?${qs.stringify({
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
    })}`
    window.open(`${this.GlobalConfig.config.analyticsLabUrl}/fpa/overview${queryStr}`)
  }

  async getCurrentOrders() {
    const { data } = await this.$http.get('/api/v2/goods/company/order/all')
    this.currentGoods = data
  }

  async getSubscribedGoods() {
    const { data } = await this.$http.get('/api/v2/goods/company/subscription/all')
    this.subscribedGoods = data
  }

  confirmOpenFPAPackege() {
    if (this.hasFPAPackage || this.hasFPAPackageSubscription) {
      return
    }
    this.payAAFree(this.FPAGoodsInfo)
  }

  async payAAFree(targetGoods: any) {
    this.loading = true
    try {
      const params: any = {
        goodsId: targetGoods.goodsId,
      }
      await this.$http.post('/api/v2/goods/order/free', params)
      await this.getCurrentOrders()
      await this.getSubscribedGoods()
      this.$message.success(this.$t('AA_Free_Subscription_FPA_success') as string)
    } catch (e) {
      this.$message.error(this.$t('Payment fail') as string)
    }
    this.loading = false
  }

  async getFPAGoods() {
    try {
      const result = await this.$http.get('/api/v2/goods/fpa')
      this.FPAGoodsInfo = result.data
    } catch (e) {}
  }
}
