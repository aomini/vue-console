import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import './License.less'

@Component({
  template: `<div>
  <div class="d-flex">
    <span class="mr-10" @click=""><i class="el-icon-arrow-left"></i></span>
    <el-breadcrumb separator="|" class="mb-20">
      <el-breadcrumb-item :to="{ path: '/' }">{{ $t('Back') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ selectedMenu }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
  <div class="card auth-container module-title-tip">
    <div class="d-flex flex-column align-items-baseline">
      <span v-html="$t('LicenseTips')"></span>
    </div>
  </div>
  <router-view />
  </div>`,
})
export default class Layout extends Vue {
  selectedMenu = ''
  licenseMenus: { title: string; to: string }[] = this.$t('LicenseMenus') as any

  @Watch('$route.name')
  onRouteChange(routeName: string) {
    this.selectedMenu = this.licenseMenus.find((item) => item.to === routeName)!.title
  }

  mounted() {
    this.selectedMenu = this.licenseMenus.find((item) => item.to === this.$route.name)!.title
  }
}
