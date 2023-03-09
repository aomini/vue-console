import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services/user'
import API from '@/views/aa/config/api'
import './Menu.less'
import { getCashInfo } from '@/services'
import qs from 'query-string'

@Component({
  template: `
    <div class="menu-vertical-v3">
      <el-menu
        class="show main-menu"
        active-text-color="#fff"
        :default-active="$route.name"
        :default-openeds="defaultOpenedSubmenus"
        :unique-opened="true"
        :router="true"
        :collapse="isCollapse"
        v-loading="loading"
      >
        <template v-for="(item, index) in menuContents">
          <el-submenu v-if="item && item.children" :index="item.to" :key="index" class="menu-vertical__menu-item">
            <template slot="title">
              <i class="iconfont menu-vertical__icon" :class="item.icon"></i>
              <span class="menu-vertical__title"> {{ item.title }} </span>
            </template>
            <template v-for="(group, index) in item.children">
              <el-submenu :index="group.title + '-' + index" :key="group.title" v-if="group.children">
                <span slot="title"> {{ group.title }} </span>
                <el-menu-item
                  v-for="sub in group.children"
                  v-if="sub"
                  :key="sub.to"
                  :index="sub.to"
                  :class="{ 'is-active': $route.name === sub.to || $route.path === sub.to }"
                  :route="item.to === 'marketplace' ? { path: sub.to } : { name: sub.to }"
                >
                  <span slot="title">{{ sub.title }}</span>
                </el-menu-item>
              </el-submenu>
              <el-menu-item
                v-else-if="group.to !== 'package.aaPricing'"
                :key="group.to"
                :index="group.to"
                :class="{ 'is-active': $route.name === group.to || $route.path === group.to }"
                :route="item.to === 'marketplace' ? { path: group.to } : { name: group.to }"
              >
                <span slot="title">{{ group.title }}</span>
              </el-menu-item>
              <li v-else class="pricing-list-item" :key="group.to" @click="handleChildClick(item, group)">
                <span>{{ group.title }}</span>
                <i class="iconfont menu-vertical__icon iconshuijingqiu_waibulianjie float-right"></i>
              </li>
            </template>
          </el-submenu>
          <template v-if="checkPermission(item.permission) && !item.children">
            <div
              v-if="item.to === 'analytics'"
              class="el-menu-item menu-vertical__menu-item external-link"
              @click="openAgoraAnalyticsPange"
            >
              <i class="iconfont menu-vertical__icon" :class="item.icon"></i>
              <span class="menu-vertical__title"> {{ item.title }} </span>
              <i class="iconfont menu-vertical__icon iconshuijingqiu_waibulianjie float-right"></i>
            </div>
            <el-menu-item v-else class="menu-vertical__menu-item" :index="item.to" @click="selectMenu(item)">
              <i class="iconfont menu-vertical__icon" :class="item.icon"></i>
              <span class="menu-vertical__title"> {{ item.title }} </span>
            </el-menu-item>
          </template>
        </template>
        <el-menu-item
          v-if="checkPermission('XLA') && showXLAMenu"
          index="xla"
          class="menu-vertical__menu-item"
          :route="{ name: 'XLAReport' }"
          :disabled="$route.name === 'XLAReport'"
        >
          <i class="iconfont menu-vertical__icon iconicon-XLA"></i>
          <span class="menu-vertical__title"> {{ $t('AASideMenu_XLA_Title') }} </span>
        </el-menu-item>
        <el-menu-item class="d-none" index="-1"> </el-menu-item>
      </el-menu>
      <div class="menu-vertical__btn" @click="changeMenuCollapse">
        <i class="iconfont iconcaidanzhankai" :class="[ isCollapse ? 'iconcaidanzhankai' : 'iconcaidanshouqi' ]"></i>
      </div>
    </div>
  `,
})
export default class MenuVertical extends Vue {
  user: any = user.info
  isCocos = user.info.isCocos
  isReseller = !(user.info.company.resellerId === '0')
  currentMenu = null
  activeMenuName: undefined | string = ''
  menuContents = this.$t('verticalMenu') as any
  showXLAMenu: boolean = false
  isCN = user.info.company.area === 'CN'
  cashInfo: any = {}
  identity: any = {}
  openids: string[] = []
  isCollapse = false
  loading = false
  defaultOpenedSubmenus: any[] = []

  async mounted() {
    this.loading = true
    try {
      await Promise.all([this.prepareFinanceSubmenu(), this.preparePackageSubmenu(), this.prepareApaasSubmenu()])
    } catch (e) {}
    this.loading = false
    this.initMenu()
    this.fetchXLAContracts()
  }

  @Watch('$route.name')
  onRouteChanged(name: string) {
    if (name.includes('usage')) {
      this.isCollapse = true
    } else {
      this.isCollapse = false
    }
    this.$store.dispatch('changeMenuVerticalCollapse', this.isCollapse)
  }

  checkPermission(name: string) {
    const permissions = user.info.permissions

    // 一级导航中「水晶球」功能默认展示
    if (name === 'AgoraAnalytics') {
      return true
    }

    if (name === 'PackageManagement') {
      return !this.isCocos && !this.isReseller && permissions['FinanceCenter'] > 0
    }
    // 云市场权限
    if (name === 'PaasManagement') {
      return !this.isCocos && !this.isReseller && permissions['FinanceCenter'] > 0
    }
    // 模拟登录不可见财务中心
    if (user.info.isRoot && name === 'FinanceCenter') {
      return false
    }
    if (name) {
      return permissions[name] > 0
    }
    return true
  }

  onClick(menu: any) {
    this.currentMenu = menu
  }
  openAgoraAnalyticsPange() {
    const queryStr = `?${qs.stringify({
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
    })}`
    window.open(`${this.GlobalConfig.config.analyticsLabUrl}${queryStr}`)
  }
  selectMenu(menu: any) {
    this.$router.push({ name: menu.to })
  }

  handleChildClick(item: any, group: any) {
    if (group.to === 'package.aaPricing') {
      window.open(`${this.GlobalConfig.config.analyticsLabUrl}/pricing?source=console`)
      return
    }
    this.$router.push(item.to === 'marketplace' ? { path: group.to } : { name: group.to })
  }

  async initMenu() {
    this.defaultOpenedSubmenus = []
    for (const item of this.menuContents) {
      if (this.$route.matched.some((m) => m.name === item.to)) {
        this.activeMenuName = item.to
        if (item.children) {
          this.defaultOpenedSubmenus.push(item.to)
        }
        return
      }
    }
    this.activeMenuName = '-1'
  }

  async fetchXLAContracts() {
    if (!this.checkPermission('XLA')) {
      return
    }
    const results = await this.$http.get(API.XLAContract, {
      params: {
        companyId: user.info.companyId,
      },
    })
    if (!results || !results.data || !results.data.data || !results.data.data.length) {
      return
    }
    const list = results.data.data
    this.$store.dispatch('updateXLAContracts', list)
    this.showXLAMenu = !!list.length
  }

  async prepareFinanceSubmenu() {
    const financeMenus = this.$t('FinanceMenus') as any
    this.cashInfo = await getCashInfo()
    this.cashInfo = this.cashInfo || {}
    await this.getIdentity()
    let showAli = false
    let showCreditCard = false
    let showReceipt = false
    let showPackages = false
    if (this.cashInfo.accountCurrency === 'CNY' && this.user.company.country === 'CN') {
      showAli = true
    }
    if (this.cashInfo.accountCurrency === 'USD' && this.user.company.country !== 'CN') {
      showCreditCard = true
    }
    if (
      this.user.company.source &&
      this.user.company.source !== 2 &&
      this.user.company.country === 'CN' &&
      this.user.permissions['FinanceCenter'] > 0
    ) {
      showReceipt = true
    }
    if (this.user.company.country === 'CN' && !this.isCocos && !this.isReseller) {
      showPackages = true
    }
    for (const key in financeMenus) {
      const item = financeMenus[key]
      if (item.to === 'finance.packages' && !showPackages) {
        delete financeMenus[key]
        continue
      }
      if (item.children) {
        for (const sub in item.children) {
          if (item.children[sub].to === 'finance.receipt' && (!showReceipt || this.identity.authStatus === -1)) {
            delete item.children[sub]
            break
          }
          if (item.children[sub].to === 'finance.alipay' && !showAli) {
            delete item.children[sub]
            continue
          }
          if (item.children[sub].to === 'finance.creditCard' && !showCreditCard) {
            delete item.children[sub]
            continue
          }
        }
      }
    }
    this.menuContents.find((menu: any) => menu.to === 'finance').children = financeMenus
  }

  prepareApaasSubmenu() {
    const paasMenus = this.user.company.area === 'CN' ? this.$t('paasCNMenus') : this.$t('paasOverseaMenus')
    this.menuContents.find((menu: any) => menu.to === 'marketplace').children = paasMenus
  }

  preparePackageSubmenu() {
    const packageCNMenus = [
      { to: 'package.minPackage', title: this.$t('Purchase Package') },
      { to: 'package.myMinPackage', title: this.$t('My Package') },
      { to: 'package.aaPricing', title: this.$t('AA_Pricing_title') },
    ]
    const packageOverseaMenus = [
      {
        title: this.$t('Chat'),
        children: [
          { to: 'package.chat', title: this.$t('Subscribe') },
          { to: 'package.myChatPackage', title: this.$t('Manage') },
        ],
      },
    ]
    const packageMenus = this.user.company.area === 'CN' ? packageCNMenus : packageOverseaMenus
    this.menuContents.find((menu: any) => menu.to === 'packages').children = packageMenus
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

  async changeMenuCollapse() {
    this.isCollapse = !this.isCollapse
    await this.$store.dispatch('changeMenuVerticalCollapse', this.isCollapse)
  }
}
