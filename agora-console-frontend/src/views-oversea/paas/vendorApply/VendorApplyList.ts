import Vue from 'vue'
import Component from 'vue-class-component'
import MyPagiation from '@/components/MyPagination'
import { VendorApplyStatus } from '@/models/paasModels'

@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: `
    <div>
      <div class="home-header d-flex align-center mb-30">
        <div class="heading-dark-16">{{ $t('All Apply') }}</div>
        <console-button class="console-btn-primary ml-30" size="md" @click="addNewApply">{{
          $t('New Apply')
        }}</console-button>
      </div>
      <el-table
        :data="data"
        :header-cell-style="{background:'#FAFAFD', padding: '12px 0px', color: '#333333'}"
        v-loading="loading"
      >
        <el-table-column
          :label="$t('Vendor Name')"
          prop="vendorName"
          header-align="left"
          class-name="table-content"
        ></el-table-column>
        <el-table-column
          :label="$t('Product Name')"
          prop="extensionName"
          header-align="left"
          class-name="table-content"
        ></el-table-column>
        <el-table-column :label="$t('Recent updates')">
          <template slot-scope="scope">
            {{ scope.row.updatedAt | formatTime('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Status')" header-align="left" class-name="table-content">
          <template slot-scope="scope">
            {{ $t(VendorApplyStatus[scope.row.status]) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="actionUrl"
          :label='$t("Action")'
          label-class-name="table-title"
          class-name="table-content"
          width="100px"
        >
          <template slot-scope="scope">
            <router-link :to='{ name: "ApplyDetail", query: { applyId: scope.row.id }}'>
              {{ $t('Edit') }}
            </router-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-2 text-right" v-show="condition.total > 10">
        <my-pagination v-model="condition" @change="changePage"></my-pagination>
      </div>
    </div>
  `,
})
export default class VendorApplyList extends Vue {
  loading = false
  data: any = []
  condition = {
    page: 1,
    limit: 10,
    total: 0,
  }
  VendorApplyStatus = VendorApplyStatus

  async mounted() {
    await this.getApplyList()
  }

  async getApplyList() {
    try {
      this.loading = true
      const ret = await this.$http.get(`/api/v2/marketplace/company/apply/list`, { params: this.condition })
      this.data = ret.data.data
      this.condition.total = ret.data.total
    } catch (e) {}
    this.loading = false
  }

  changePage() {
    const condition = Object.assign({}, this.condition)
    ;(this.$router as any).push({ query: condition })
    this.getApplyList()
  }

  addNewApply() {
    this.$router.push({ path: '/marketplace/apply' })
  }
}
