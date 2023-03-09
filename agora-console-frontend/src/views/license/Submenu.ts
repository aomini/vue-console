import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import './Submenu.less'

@Component({
  template: `<div class="submenus" v-loading="loading">
    <el-menu :router="true" :default-openeds="openids" active-text-color="#3AB7F8FF">
      <el-menu-item-group index="financegroup">
        <template v-for="(item, index) in $t('LicenseMenus')">
          <el-submenu v-if="item && item.children" :index="item.title + '-' + index" :key="index">
            <span slot="title" class="vertical-submenus"> {{ item.title }} </span>
            <el-menu-item
              v-for="sub in item.children"
              v-if="sub"
              :key="sub.to"
              :index="sub.to"
              :class="{ 'is-active': $route.name === sub.to }"
              :route="{ name: sub.to }"
            >
              <span slot="title">{{ sub.title }}</span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item
            v-if="isShowMenu(item)"
            :index="item.to"
            :key="item.to"
            :route="{ name: item.to }"
            :class="{ 'is-active': $route.name === item.to }"
            class="vertical-submenus first-submenu"
          >
            <span slot="title"> {{ item.title }} </span>
          </el-menu-item>
        </template>
      </el-menu-item-group>
    </el-menu>
  </div>`,
})
export default class Submenu extends Vue {
  openids: any = []
  cashInfo: any = {}
  identity: any = {}
  userInfo: any = user.info
  isCocos = user.info.isCocos
  loading = false
  role = ''
  allowAllocate = false

  async mounted() {
    this.loading = true
    await this.getLicenseConfig()
    await this.getAccountRole()
    this.cashInfo = this.cashInfo || {}
    await this.getIdentity()
    this.loading = false
  }

  async getLicenseConfig() {
    try {
      const config = await this.$http.get('/api/v2/license/config')
      this.allowAllocate = config.data?.allowAllocate === 1
    } catch (e) {
      console.info(e)
    }
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data) {
        this.identity = identity.data
      }
    } catch (e) {
      console.info(e)
    }
  }

  async getAccountRole() {
    if (user.info.isMember) {
      const role = await this.$http.get('/api/v2/identity/member-role')
      if (role.data) {
        if (role.data.roleId === 1) {
          this.role = 'admin'
        }
      }
    }
  }

  isShowMenu(item: any) {
    let isShow = item && !item.children
    if (item.auth) {
      isShow = isShow && Reflect.has(this, item.auth) && (this[item.auth as keyof this] as unknown) === true
    }
    return isShow
  }
}
