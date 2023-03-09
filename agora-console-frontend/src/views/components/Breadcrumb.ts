import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import './Breadcrumb.less'
import { RouteRecord } from 'vue-router/types/router'

@Component({
  components: {},
  template: `
    <el-row class="main-breadcrumb" v-if="showBreadcrumb">
      <el-breadcrumb separator="/">
        <div class="d-inline-block heading-dark-20 main-breadcrumb__title">{{ $t(title) }}</div>
        <el-breadcrumb-item :to="{ path: '/' }"><i class="iconfont iconshouye"></i></el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in routeList" :to="{ path: item.path }">
          {{ $t(item.meta.breadcrumb) }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </el-row>
  `,
})
export default class Breadcrumb extends Vue {
  routeList: Partial<RouteRecord>[] = this.$store.state.routeList
  title = ''
  showBreadcrumb = true

  @Watch('$route')
  async onRouteChange(newRoute: any, oldRoute: any) {
    if (newRoute.name === oldRoute.name) {
      return
    }
    this.getRouteList()
  }

  @Watch('$store.state.routeList')
  async onRouteListChange() {
    this.routeList = Object.assign([], this.$store.state.routeList)
    this.title = this.routeList[this.routeList.length - 1].meta?.breadcrumb
  }

  mounted() {
    this.getRouteList()
  }

  getRouteList() {
    this.routeList = this.$route.matched.filter((item) => item.name)
    this.title = this.routeList[this.routeList.length - 1].meta?.breadcrumb
    this.showBreadcrumb = true
    if (
      this.routeList.length === 1 &&
      (this.routeList[0].name === 'overview' || this.routeList[0].name === 'onboarding')
    ) {
      this.showBreadcrumb = false
    }
  }
}
