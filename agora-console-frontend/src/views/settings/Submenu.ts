import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import './Submenu.less'

@Component({
  template: `<div class="submenus" v-loading="loading">
    <el-menu :router="true" :default-openeds="openids" active-text-color="#3AB7F8FF">
      <el-menu-item-group index="financegroup">
        <template v-for="(item, index) in SettingMenus">
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
            v-if="item && !item.children"
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
  SettingMenus: any = []
  openids: any = []
  cashInfo: any = {}
  identity: any = {}
  userInfo: any = user.info
  isCocos = user.info.isCocos
  loading = false
  canAuth: boolean = false
  role = ''

  async mounted() {
    this.loading = true
    this.SettingMenus = this.$t('SettingMenus')
    await this.getAccountRole()
    this.cashInfo = this.cashInfo || {}
    await this.getIdentity()
    if (
      this.identity.authStatus !== -1 &&
      user.info.company.source &&
      user.info.company.source !== 2 &&
      user.info.company.country === 'CN' &&
      !user.info.isMember
    ) {
      this.canAuth = true
    }
    for (let sub = this.SettingMenus.length - 1; sub >= 0; sub--) {
      if (
        (this.SettingMenus[sub].to === 'setting.authentication' && !this.canAuth) ||
        (this.SettingMenus[sub].to === 'setting.company' && this.userInfo.isMember) ||
        (this.SettingMenus[sub].to === 'setting.member' &&
          this.userInfo.isMember &&
          this.userInfo.permissions['Member&RoleManagement'] === 0) ||
        (this.SettingMenus[sub].to === 'setting.role' &&
          this.userInfo.isMember &&
          this.userInfo.permissions['Member&RoleManagement'] === 0)
      ) {
        this.SettingMenus.splice(sub, 1)
      }
    }
    this.loading = false
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
}
