import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { user } from '@/services/user'
import qs from 'query-string'
import API from '@/views-oversea/aa/config/api'
import './Menu.less'
const logoUrl = require('@/assets/icon/logo-agora.png')

@Component({
  template: `
    <div class="menu-vertical-v3">
      <el-menu
        class="show main-menu collapse"
        :collapse="true"
        text-color="#fff"
        active-text-color="#fff"
        :default-active="activeMenuName"
        :router="true"
      >
        <div class="logo-line cursor-pointer" @click="backToMain">
          <img class="vertical-menu-icon" :src="logoUrl" />
          <span class="heading-dark-02">{{ $t('ConsoleTitle') }}</span>
        </div>
        <div v-for="item in menuContents" :key="item.to">
          <template v-if="checkPermission(item.permission)">
            <div
              v-if="item.to === 'analytics'"
              class="el-menu-item left-menu-item external-link"
              style="padding-left: 0px"
              @click="openAgoraAnalyticsPange"
            >
              <i class="iconfont vertical-menu-icon" :class="item.icon"></i>
              <span class="heading-grey-06 ml-10">{{ item.title }}</span>
              <i class="iconfont vertical-menu-icon iconshuijingqiu_waibulianjie float-right"></i>
            </div>
            <el-menu-item v-else class="left-menu-item" :index="item.to" @click="selectMenu(item)">
              <i class="iconfont vertical-menu-icon" :class="item.icon"></i>
              <span class="heading-grey-06 ml-10"> {{ item.title }} </span>
            </el-menu-item>
          </template>
        </div>
        <div v-if="checkPermission('XLA')">
          <el-menu-item
            v-if="showXLAMenu"
            index="xla"
            class="left-menu-item"
            :route="{ name: 'XLAReport' }"
            :disabled="$route.name === 'XLAReport'"
          >
            <span class="iconfont vertical-menu-icon iconicon-XLA"></span>
            <span class="heading-grey-06 ml-10"> {{ $t('AASideMenu_XLA_Title') }} </span>
          </el-menu-item>
        </div>
        <el-menu-item class="d-none" index="-1"> </el-menu-item>
      </el-menu>
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
  logoUrl = logoUrl
  isCN = user.info.company.area === 'CN'

  mounted() {
    this.initMenu()
    this.fetchXLAContracts()
  }

  @Watch('$route.name')
  onRouteChanged() {
    this.initMenu()
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

  getImgUrl(icon: any) {
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./' + icon + '.png')
  }
  onClick(menu: any) {
    this.currentMenu = menu
  }
  selectMenu(menu: any) {
    this.$router.push({ name: menu.to })
  }
  initMenu() {
    for (const item of this.menuContents) {
      if (this.$route.matched.some((m) => m.name === item.to)) {
        this.activeMenuName = item.to
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

  backToMain() {
    this.$router.push({ name: 'overview' })
  }

  openAgoraAnalyticsPange() {
    const queryStr = `?${qs.stringify({
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
    })}`
    window.open(`${this.GlobalConfig.config.analyticsLabUrl}${queryStr}`)
  }
}
