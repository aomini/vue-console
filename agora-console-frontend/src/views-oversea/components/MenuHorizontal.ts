import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services/user'
import './Menu.less'
import SearchBox from '@/components/SearchBox'
import Cookie from 'js-cookie'
import SearchComponent from '@/components/SearchComponent'

@Component({
  components: {
    'search-box': SearchBox,
    'search-component': SearchComponent,
  },
  template: `
    <div class="menu-horizontal-v3">
      <el-menu
        class="horizontal-menu"
        mode="horizontal"
        :router="true"
        :default-active="activeMenuName"
        :default-openeds="[]"
      >
        <el-menu-item @click="redirect(supportUrl)" class="padding-left-30" index="1">
          <a class="horizontal-menu-text heading-grey-03"> {{ $t('support tickets') }} </a>
        </el-menu-item>

        <el-submenu class="horizontal-sub-menu menu-right" index="6">
          <template slot="title">
            <img class="horizontal-sub-menu-icon-v3 w-24" :src='getImgUrl("avatar")' />
            <el-badge :is-dot="unreadMessageCount > 0" class="unread-dot">
              <div class="horizontal-menu-text d-block text-truncate mw-120 d-inline-block">
                {{ user.info.displayName }}
              </div>
            </el-badge>
          </template>
          <div
            class="d-flex cursor-pointer horizontal-sub-menu-profile pt-10"
            @click="redirect(GlobalConfig.config.ssoUrl)"
          >
            <img width="30px" height="30px" :src='getImgUrl("avatar")' class="mr-10" />
            <el-badge :is-dot="!profileClicked" class="unClick-dot">
              <div class="horizontal-menu-text d-block text-truncate mw-120 d-flex flex-column">
                <span class="heading-grey-05">{{
                  user.info.displayName || (user.info.email && user.info.email.split('@')[0])
                }}</span>
                <span class="profile-sub-heading">{{ user.info.company.name || 'N/A' }}</span>
              </div>
            </el-badge>
          </div>
          <el-menu-item :key="1" :index='6 + "-" + 1' :route="{ name: 'message' }" class="sub-menu-item">
            <div class="horizontal-sub-menu-list">
              <img class="horizontal-sub-menu-icon-v3" :src='getImgUrl("message")' />
              <el-badge :value="unreadMessageCount" v-if="unreadMessageCount > 0" class="unread-number middle">
                <span class="heading-grey-05"> {{ $t('messages') }} </span>
              </el-badge>
              <span class="heading-grey-05" v-else> {{ $t('messages') }} </span>
            </div>
          </el-menu-item>
          <el-menu-item :key="2" :index='6 + "-" + 2' :route="{ name: 'settings' }" class="sub-menu-item">
            <img class="horizontal-sub-menu-icon-v3" :src='getImgUrl("settings")' />
            <span class="heading-grey-05"> {{ $t('settings') }} </span>
          </el-menu-item>
          <el-menu-item
            v-if="!isCocos && showRestfulApi"
            :key="4"
            :index='6 + "-" + 4'
            :route="{ name: 'restfulApi' }"
            class="sub-menu-item"
          >
            <img class="horizontal-sub-menu-icon-v3" :src='getImgUrl("restfulApi")' />
            <span class="heading-grey-05"> {{ $t('RESTful API') }} </span>
          </el-menu-item>
          <el-menu-item
            :key="5"
            :index='6 + "-" + 5'
            :route="{ name: 'license' }"
            class="sub-menu-item"
            v-if="licenseQuerySwitch === 1"
          >
            <img class="horizontal-sub-menu-icon-v3" :src='getImgUrl("license")' />
            <span class="heading-grey-05"> License </span>
          </el-menu-item>
          <el-menu-item
            :key="6"
            :index='6 + "-" + 6'
            :route="{ query: { to: 'signOut'} }"
            @click="exit"
            class="sub-menu-item"
          >
            <div class="horizontal-sub-menu-list">
              <img class="horizontal-sub-menu-icon-v3" :src='getImgUrl("signOut")' />
              <span class="heading-grey-05"> {{ $t('Log out') }} </span>
            </div>
          </el-menu-item>
        </el-submenu>
      </el-menu>

      <el-menu class="horizontal-menu-sm" mode="horizontal">
        <el-menu-item v-if="!showSubMenu && !showUserMenu" @click="openUserMenu" index="7">
          <i class="iconfont iconicon-shoujiduanwode f-28"></i>
        </el-menu-item>

        <el-menu-item
          v-if="!showSubMenu && !showUserMenu && user.info.company.area === 'CN'"
          @click="openSubMenu"
          index="8"
        >
          <i class="iconfont iconicon-shoujiduancaidan f-28"></i>
        </el-menu-item>

        <el-menu-item v-if="showSubMenu || showUserMenu" @click="closeBothMenus" index="9">
          <i class="iconfont iconicon-shoujiduanguanbi f-28"></i>
        </el-menu-item>
      </el-menu>
      <el-menu v-if="showSubMenu && user.info.company.area === 'CN'" class="menu-sm">
        <el-menu-item @click="redirect(supportUrl)" index="1" class="menu-item-sm">
          <i class="iconfont iconicon-restful f-30"></i>
          <a class="horizontal-menu-text-sm"> {{ $t('support') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('DocumentationUrl')))" index="2" class="menu-item-sm">
          <i class="iconfont iconicon-wendangxiao f-30"></i>
          <a class="horizontal-menu-text-sm"> {{ $t('Documentation') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('SDK and App Download Url')))" index="3" class="menu-item-sm">
          <i class="iconfont iconicon-xiazaixiao f-30"></i>
          <a class="horizontal-menu-text-sm"> {{ $t('SDK and App Download') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('Code Sample Url')))" index="4" class="menu-item-sm">
          <i class="iconfont iconicon-shequ f-30"></i>
          <a class="horizontal-menu-text-sm"> {{ $t('Code Sample') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('CommunityUrl')))" index="5" class="menu-item-sm">
          <i class="iconfont iconicon-APIxiao f-30"></i>
          <a class="horizontal-menu-text-sm"> {{ $t('Community') }} </a>
        </el-menu-item>
      </el-menu>
      <el-menu v-if="showUserMenu" class="menu-sm" :router="true">
        <el-menu-item :key="1" :index='6 + "-" + 1' :route="{ name: 'message' }" class="menu-item-sm">
          <i class="iconfont iconicon-tongzhi f-30"></i>
          <el-badge :value="unreadMessageCount" v-if="unreadMessageCount > 0" class="unread-number">
            <span class="horizontal-menu-text-sm"> {{ $t('messages') }} </span>
          </el-badge>
          <span v-else> {{ $t('messages') }} </span>
        </el-menu-item>

        <el-menu-item :key="2" :index='6 + "-" + 2' :route="{ name: 'settings' }" class="menu-item-sm">
          <i class="iconfont iconicon-shezhi f-30"></i>
          <span class="horizontal-menu-text-sm"> {{ $t('settings') }} </span>
        </el-menu-item>
        <el-menu-item
          v-if="!isCocos && showRestfulApi"
          :key="4"
          :index='6 + "-" + 4'
          :route="{ name: 'restfulApi' }"
          class="menu-item-sm"
        >
          <i class="iconfont iconicon-restful f-30"></i>
          <span class="horizontal-menu-text-sm"> {{ 'RESTful API' }} </span>
        </el-menu-item>

        <el-menu-item
          :key="5"
          :index='6 + "-" + 5'
          @click="exit"
          :route="{ query: { to: 'signOut' } }"
          class="menu-item-sm"
        >
          <i class="iconfont iconicon-exit f-30"></i>
          <span class="horizontal-menu-text-sm"> {{ $t('exit') }} </span>
        </el-menu-item>

        <el-menu-item class="d-none" index="-1"> </el-menu-item>
      </el-menu>
    </div>
  `,
})
export default class MenuHorizontal extends Vue {
  isCocos = user.info.isCocos
  user = user
  role = ''
  identity: any = {}
  unreadMessageCount = 0
  messageSetting: any = {}
  allTabs = ['account', 'finance', 'product', 'operation', 'promotion', 'tickets']
  allTabsWithoutFinance = ['product', 'operation', 'promotion']
  selectTabs: any[] = []
  activeMenuName = ''
  showSubMenu: boolean = false
  showUserMenu: boolean = false
  supportUrl = ''
  searchKeyword = ''
  Cookie = Cookie
  profileClicked: boolean = Cookie.get('profileClicked') ? true : false
  showRestfulApi = !user.info.isMember || user.info.permissions['ProjectManagement'] > 1
  licenseQuerySwitch = 0

  @Watch('$route')
  onRouteChanged(to: any, from: any) {
    if ((from.name === 'message' || to.name === 'message') && !(from.name === 'message' && to.name === 'message')) {
      this.checkUnreadMessage()
    }
    if (to.path.includes('support')) {
      this.activeMenuName = '1'
    } else {
      this.activeMenuName = '-1'
    }
    this.showUserMenu = false
    this.showSubMenu = false
  }

  async created() {
    this.checkUnreadMessage()
    await this.getIdentity()
    await this.getAccountRole()
    await this.getLicenseConfig()
    this.setSupportUrl()
  }

  openUserMenu() {
    this.showSubMenu = false
    this.showUserMenu = true
  }
  openSubMenu() {
    this.showUserMenu = false
    this.showSubMenu = true
  }
  closeBothMenus() {
    this.showUserMenu = false
    this.showSubMenu = false
  }
  async setSupportUrl() {
    const res = await this.$http.get('/api/v2/support/url')
    this.supportUrl = res.data
  }
  getImgUrl(icon: string) {
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./' + icon + '.png')
  }
  changeTimeType(type: string) {
    this.$store.dispatch('changeTimeType', type)
    window.location.reload()
  }
  exit() {
    ;(window as any).location = '/action/signout'
  }
  isAA() {
    if (this.$route.matched.some((m) => m.name === 'analytics')) {
      return true
    }
    return false
  }
  redirect(url: string) {
    this.closeBothMenus()
    if (url === this.GlobalConfig.config.ssoUrl) {
      const language = user.info.language === 'chinese' ? 'cn' : 'en'
      window.open(`${url}/${language}/profile`)
      Cookie.set('profileClicked', '1')
      this.profileClicked = true
    } else {
      window.open(url)
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
  async checkUnreadMessage() {
    const condition = {
      readStatus: false,
      category: '',
    }
    const allTabs = user.info.permissions['FinanceCenter'] > 0 ? this.allTabs : this.allTabsWithoutFinance
    await this.getMessageSetting()
    for (const item in allTabs) {
      if (this.messageSetting[allTabs[item]] === 1) {
        this.selectTabs.push(allTabs[item])
      }
    }
    condition.category = this.selectTabs.join(',')
    const ret = await this.$http.get('/api/v2/message/site-message-count', { params: condition })

    this.unreadMessageCount = ret.data ? ret.data.totalSize : 0
  }
  async getMessageSetting() {
    try {
      const messageSetting = await this.$http.get('/api/v2/notifications')
      const notificationList = messageSetting.data
      for (let i = 0; i < notificationList.length; i++) {
        this.messageSetting[notificationList[i].key] = notificationList[i].setting.dashboardOpen || 0
      }
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

  async getLicenseConfig() {
    try {
      const config = await this.$http.get('/api/v2/license/config')
      this.licenseQuerySwitch = config.data?.querySwitch
    } catch (e) {
      console.info(e)
    }
  }
}
