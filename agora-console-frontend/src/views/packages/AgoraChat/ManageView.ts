import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'

@Component({
  template: `
    <div>
      <div class="module-title">{{ $t('My Agora Chat Plan') }}</div>
      <div class="card">
        <el-table
          :data="subscriptions"
          v-loading="loading"
          cell-class-name="min-table-cell"
          header-cell-class-name="table-header"
          stripe
        >
          <el-table-column :label="$t('Plan Name')">
            <template slot-scope="scope">
              <span>{{ $t(scope.row.planName) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('First Purchase')">
            <template slot-scope="scope">
              <span>{{ scope.row.startTs | formatTimeStamp(false, true) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('IMDuration')">
            <template>
              <span>N/A</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Exp date')">
            <template>
              <span>N/A</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('IMPrice')">
            <template slot-scope="scope">
              <span>{{ getPlanPrice(scope.row.planName) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Action')">
            <template>
              <span @click="goToSwitchPlan" class="link">{{ $t('Show More') }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  `,
})
export default class ManageView extends Vue {
  loading = false
  subscriptions = []
  isCN = user.info.company.area === 'CN'

  mounted() {
    this.getCompanyChatSubscription()
  }

  async getCompanyChatSubscription() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/chat/subscription`)
      this.subscriptions = res.data.subscriptions
    } catch (e) {}
    this.loading = false
  }

  goToSwitchPlan() {
    this.$router.push({ name: 'package.chat' })
  }

  getPlanPrice(planName: string) {
    if (planName === 'FREE') {
      return this.isCN ? `0 CNY ${this.$t('/month')}` : `$0 ${this.$t('/month')}`
    }
    if (planName === 'STARTER') {
      return this.isCN ? `888 CNY ${this.$t('/month')}` : `$299 ${this.$t('/month')}`
    }
    if (planName === 'PRO') {
      return this.isCN ? `2888 CNY ${this.$t('/month')}` : `$699 ${this.$t('/month')}`
    }
    if (planName === 'ENTERPRISE') {
      return this.isCN ? `4888 CNY ${this.$t('/month')}` : `Customized`
    }
  }
}
