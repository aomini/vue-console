import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services/user'
import './Menu.less'
import Cookie from 'js-cookie'
import SearchComponent from '@/components/SearchComponent'

@Component({
  components: {
    'search-component': SearchComponent,
  },
  template: `
    <div class="menu-horizontal-v3">
      <div class="d-inline-block logo-line cursor-pointer" @click="backToMain">
        <i class="iconfont iconlogo-agora menu-horizontal__icon--logo" />
        <span class="heading-dark-02">{{ $t('ConsoleTitle') }}</span>
      </div>
      <span class="menu-horizontal__divider">|</span>
      <search-component></search-component>
      <el-menu
        class="horizontal-menu"
        mode="horizontal"
        :default-active="activeMenuName"
        :default-openeds="[]"
      >
        <el-menu-item @click="redirect(supportUrl)" class="padding-left-30" index="1">
          <a class="menu-horizontal__text heading-grey-03"> {{ $t('support') }} </a>
        </el-menu-item>
        <el-submenu class="menu-horizontal__sub-menu" index="2">
          <template slot="title">
            <span class="menu-horizontal__text">{{ $t('Dev Center') }}</span>
          </template>
          <el-menu-item
            :index='2 + "-" + 1'
            class="menu-horizontal__menu-item"
            @click="redirect(String($t('DocumentationUrl')))"
          >
            <i class="iconfont menu-horizontal__icon--menu iconwendangzhan" />
            <span class="heading-grey-05"> {{ $t('Documentation') }} </span>
          </el-menu-item>
          <el-menu-item
            :index='2 + "-" + 2'
            class="menu-horizontal__menu-item"
            @click="redirect(String($t('SDK and App Download Url')))"
          >
            <i class="iconfont menu-horizontal__icon--menu icondaima" />
            <span class="heading-grey-05"> {{ $t('SDK and App Download') }} </span>
          </el-menu-item>
          <el-menu-item
            :index='2 + "-" + 3'
            class="menu-horizontal__menu-item"
            @click="redirect(String($t('Code Sample Url')))"
          >
            <i class="iconfont menu-horizontal__icon--menu iconxiaoxitixing" />
            <span class="heading-grey-05"> {{ $t('Code Sample') }} </span>
          </el-menu-item>
          <el-menu-item
            :index='2 + "-" + 4'
            class="menu-horizontal__menu-item"
            @click="redirect(String($t('CommunityUrl')))"
          >
            <i class="iconfont menu-horizontal__icon--menu iconicon-shequ" />
            <span class="heading-grey-05"> {{ $t('Community') }} </span>
          </el-menu-item>
        </el-submenu>
        <span class="menu-horizontal__divider mt-20">|</span>
        <el-submenu class="menu-horizontal__sub-menu" index="3">
          <template slot="title">
            <span class="menu-horizontal__text">
              <span class="iconfont" :class="user.info.language === 'chinese' ? 'iconcn' : 'iconyuyanqiehuan'" w:m="r-5px"></span>
              Language - {{ user.info.language === 'chinese' ? '简体中文' : 'English' }}
            </span>
          </template>
          <el-menu-item
              :index='3 + "-" + 1'
              class="menu-horizontal__menu-item"
              @click="changeLanguage('chinese')"
          >
            <i class="iconfont menu-horizontal__icon--menu iconcn" />
            <span class="heading-grey-05"> Language - 简体中文 </span>
          </el-menu-item>
          <el-menu-item
              :index='3 + "-" + 2'
              class="menu-horizontal__menu-item"
              @click="changeLanguage('english')"
          >
            <i class="iconfont menu-horizontal__icon--menu iconyuyanqiehuan" />
            <span class="heading-grey-05"> Language - English </span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item :route="{ name: 'message' }" class="menu-horizontal__menu-item" index="4" @click="selectMenu('message')">
          <el-badge :value="unreadMessageCount" :hidden="unreadMessageCount === 0" class="menu-horizontal__badge">
            <i class="iconfont menu-horizontal__icon--menu iconxiaoxitixing f-18" />
          </el-badge>
        </el-menu-item>
        <el-submenu class="menu-horizontal__sub-menu menu-right" index="5">
          <template slot="title">
            <img class="menu-horizontal__icon--menu w-24" :src='getImgUrl("avatar-cn")' />
            <el-badge :is-dot="unreadMessageCount > 0" class="unread-dot">
              <div class="menu-horizontal__text d-block text-truncate mw-120 d-inline-block">
                {{ user.info.displayName }}
              </div>
            </el-badge>
          </template>
          <div class="d-flex cursor-pointer menu-horizontal__sub-menu-profile">
            <el-badge :is-dot="!profileClicked" class="unClick-dot">
              <div class="menu-horizontal__text d-block text-truncate mw-120 d-flex flex-column">
                <span class="heading-white-03">
                  Hi, {{ user.info.displayName || (user.info.email && user.info.email.split('@')[0]) }}</span
                >
              </div>
            </el-badge>
          </div>
          <el-menu-item
            :index='5 + "-" + 1'
            @click="redirect(GlobalConfig.config.ssoUrl)"
            class="menu-horizontal__menu-item"
          >
            <i class="menu-horizontal__icon--menu iconfont icongerenzhongxin"></i>
            <span class="heading-grey-05"> {{ $t('Profile') }} </span>
          </el-menu-item>
          <el-menu-item :index='5 + "-" + 2' :route="{ name: 'setting.authentication' }" @click="selectMenu('setting.authentication')" class="menu-horizontal__menu-item">
            <i class="menu-horizontal__icon--menu iconfont iconshimingrenzheng"></i>
            <span class="heading-grey-05"> {{ $t('AuthPageTitle') }} </span>
            <span class="menu-horizontal__tag" v-if="identity.authStatus < 2">{{ identity.authStatus === 0 ? $t('EnterpriseAuth') : $t('PersonalAuth') }}</span>
          </el-menu-item>
          <el-menu-item
            v-if="!isCocos && showRestfulApi"
            :index='5 + "-" + 3'
            :route="{ name: 'restfulApi' }"
            @click="selectMenu('restfulApi')"
            class="menu-horizontal__menu-item"
          >
              <i class="menu-horizontal__icon--menu iconfont icondaima"></i>
              <span class="heading-grey-05"> {{ $t('RESTful API') }} </span>
          </el-menu-item>
          <el-menu-item
            :index='5 + "-" + 4'
            :route="{ name: 'license' }"
            @click="selectMenu('license')"
            class="menu-horizontal__menu-item"
            v-if="licenseQuerySwitch === 1"
          >
            <i class="menu-horizontal__icon--menu iconfont iconlicense"></i>
            <span class="heading-grey-05"> License </span>
          </el-menu-item>
          <el-menu-item :index='5 + "-" + 5' :route="{ name: 'settings' }" @click="selectMenu('settings')" class="menu-horizontal__menu-item">
            <i class="menu-horizontal__icon--menu iconfont iconshezhi"></i>
            <span class="heading-grey-05"> {{ $t('settings') }} </span>
          </el-menu-item>
          <el-menu-item
            :index='5 + "-" + 6'
            :route="{ query: { to: 'signOut'} }"
            @click="exit"
            class="menu-horizontal__menu-item"
          >
              <i class="menu-horizontal__icon--menu iconfont icontuichu"></i>
              <span class="heading-grey-05"> {{ $t('Log out') }} </span>
          </el-menu-item>
        </el-submenu>
      </el-menu>

      <el-menu class="horizontal-menu-sm" mode="horizontal">
        <el-menu-item v-if="!showSubMenu && !showUserMenu" @click="openUserMenu" index="7">
          <i class="iconfont iconicon-shoujiduanwode f-28"></i>
        </el-menu-item>

        <el-menu-item v-if="!showSubMenu && !showUserMenu" @click="openSubMenu" index="8">
          <i class="iconfont iconicon-shoujiduancaidan f-28"></i>
        </el-menu-item>

        <el-menu-item v-if="showSubMenu || showUserMenu" @click="closeBothMenus" index="9">
          <i class="iconfont iconicon-shoujiduanguanbi f-28"></i>
        </el-menu-item>
      </el-menu>
      <el-menu v-if="showSubMenu" class="menu-sm">
        <el-menu-item @click="redirect(supportUrl)" index="1" class="menu-item-sm">
          <i class="iconfont iconicon-restful f-30"></i>
          <a class="menu-horizontal__text-sm"> {{ $t('support') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('DocumentationUrl')))" index="2" class="menu-item-sm">
          <i class="iconfont iconicon-wendangxiao f-30"></i>
          <a class="menu-horizontal__text-sm"> {{ $t('Documentation') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('SDK and App Download Url')))" index="3" class="menu-item-sm">
          <i class="iconfont iconicon-xiazaixiao f-30"></i>
          <a class="menu-horizontal__text-sm"> {{ $t('SDK and App Download') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('Code Sample Url')))" index="4" class="menu-item-sm">
          <i class="iconfont iconicon-shequ f-30"></i>
          <a class="menu-horizontal__text-sm"> {{ $t('Code Sample') }} </a>
        </el-menu-item>
        <el-menu-item @click="redirect(String($t('CommunityUrl')))" index="5" class="menu-item-sm">
          <i class="iconfont iconicon-APIxiao f-30"></i>
          <a class="menu-horizontal__text-sm"> {{ $t('Community') }} </a>
        </el-menu-item>
      </el-menu>
      <el-menu v-if="showUserMenu" class="menu-sm" :router="true">
        <el-menu-item :key="1" :index='6 + "-" + 1' :route="{ name: 'message' }" class="menu-item-sm">
          <i class="iconfont iconicon-tongzhi f-30"></i>
          <el-badge :value="unreadMessageCount" v-if="unreadMessageCount > 0" class="unread-number">
            <span class="menu-horizontal__text-sm"> {{ $t('messages') }} </span>
          </el-badge>
          <span v-else> {{ $t('messages') }} </span>
        </el-menu-item>

        <el-menu-item :key="2" :index='6 + "-" + 2' :route="{ name: 'settings' }" class="menu-item-sm">
          <i class="iconfont iconicon-shezhi f-30"></i>
          <span class="menu-horizontal__text-sm"> {{ $t('settings') }} </span>
        </el-menu-item>
        <el-menu-item
          v-if="!isCocos && showRestfulApi"
          :key="4"
          :index='6 + "-" + 4'
          :route="{ name: 'restfulApi' }"
          class="menu-item-sm"
        >
          <i class="iconfont iconicon-restful f-30"></i>
          <span class="menu-horizontal__text-sm"> {{ 'RESTful API' }} </span>
        </el-menu-item>

        <el-menu-item
          :key="5"
          :index='6 + "-" + 5'
          @click="exit"
          :route="{ query: { to: 'signOut' } }"
          class="menu-item-sm"
        >
          <i class="iconfont iconicon-exit f-30"></i>
          <span class="menu-horizontal__text-sm"> {{ $t('exit') }} </span>
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
  activeMenuName = '6'
  showSubMenu: boolean = false
  showUserMenu: boolean = false
  supportUrl = ''
  searchKeyword = ''
  Cookie = Cookie
  profileClicked: boolean = Cookie.get('profileClicked') ? true : false
  showRestfulApi = !user.info.isMember || user.info.permissions['ProjectManagement'] > 1
  licenseQuerySwitch = 0
  isCN = user.info.company.area === 'CN'

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
  exit() {
    ;(window as any).location = '/action/signout'
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

  backToMain() {
    this.$router.push({ name: 'overview' })
  }

  selectMenu(route: string) {
    this.$router.push({ name: route })
  }

  async changeLanguage(language: string) {
    await this.$http.put('/api/v2/account/language', { language })
    // await loadLanguageAsync(language === 'chinese' ? 'cn' : 'en')
    location.reload()
  }
}
