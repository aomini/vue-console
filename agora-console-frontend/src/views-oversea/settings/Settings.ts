import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import './Setting.less'

@Component({
  template: `
    <div>
      <el-tabs class="module-title" v-model="currentPage" @tab-click="switchPage">
        <el-tab-pane :label='$t("BasicInfo")' name="basic-info"> </el-tab-pane>
        <el-tab-pane v-if="!isThirdParty" :label='$t("Security")' name="security"> </el-tab-pane>
      </el-tabs>
      <router-view></router-view>
    </div>
  `,
})
export default class Settings extends Vue {
  isThirdParty = !!(user.info.company && user.info.company.source && user.info.company.source !== 1)
  currentPage = 'basic-info'

  created() {
    if (this.$route.name === 'security') this.currentPage = 'security'
    else this.currentPage = 'basic-info'
  }

  switchPage(tab: any) {
    this.$router.push({ name: tab.name })
  }
}
