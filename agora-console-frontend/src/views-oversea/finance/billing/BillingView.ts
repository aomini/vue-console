import Vue from 'vue'
import Component from 'vue-class-component'
import MonthBillView from '@/views-oversea/finance/billing/MonthBillView'
import OnceBillView from '@/views-oversea/finance/billing/OnceBillView'

@Component({
  components: {
    'month-bill': MonthBillView,
    'once-bill': OnceBillView,
  },
  template: `
    <el-tabs v-model="activeName" @tab-click="tabClick">
      <el-tab-pane :label="$t('Monthly Bills')" name="monthly-bills">
        <month-bill v-if="activeName === 'monthly-bills'"></month-bill>
      </el-tab-pane>
      <el-tab-pane :label="$t('Once Bills')" name="once-bills">
        <once-bill v-if="activeName === 'once-bills'"></once-bill>
      </el-tab-pane>
    </el-tabs>
  `,
})
export default class BillingView extends Vue {
  activeName = 'monthly-bills'

  mounted() {
    if (this.$route.query && this.$route.query.tab) {
      this.activeName = this.$route.query.tab as string
    }
  }

  tabClick(tab: any) {
    ;(this.$router as any).replace({
      name: this.$route.name,
      query: Object.assign({}, this.$route.query, {
        tab: tab.name,
      }),
    })
  }
}
