import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import './Submenu.less'

@Component({
  template: `<div class="submenus paas-submenus" v-loading="loading">
    <div class="heading-dark-02 submenu-logo">{{ $t('ConsoleTitle') }}</div>
    <el-menu :router="true" :default-openeds="openids" active-text-color="#3AB7F8FF">
      <el-menu-item-group index="financegroup">
        <span slot="title" class="title"> {{ $t('MarketplaceTitle') }} </span>
        <template v-for="(item) in paasMenus">
          <el-submenu v-if="item && item.children" :index="item.to" :key="item.to">
            <span slot="title"> {{ item.title }} </span>
            <el-menu-item
              v-for="sub in item.children"
              v-if="sub"
              :key="sub.to"
              :index="sub.to"
              :class="{ 'is-active': $route.path === sub.to }"
              :route="{ path: sub.to }"
            >
              <span slot="title">{{ sub.title }}</span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item
            v-if="item && !item.children"
            :index="item.to"
            :key="item.to"
            :route="{ path: item.to }"
            class="vertical-submenus first-submenu"
            :class="{ 'is-active': $route.path === item.to }"
          >
            <span slot="title"> {{ item.title }} </span>
          </el-menu-item>
        </template>
      </el-menu-item-group>
    </el-menu>
  </div>`,
})
export default class Submenu extends Vue {
  paasMenus: any = []
  openids: any = []
  identity: any = {}
  userInfo: any = user.info
  isOversea = user?.info?.company?.area !== 'CN'
  isCocos = user.info.isCocos
  loading = false

  async mounted() {
    this.paasMenus = !this.isOversea ? this.$t('paasCNMenus') : this.$t('paasOverseaMenus')
    for (const key in this.paasMenus) {
      const item = this.paasMenus[key]
      if (item.children && Object.keys(item.children).length > 0) {
        this.openids.push(item.to)
      }
    }
  }
}
