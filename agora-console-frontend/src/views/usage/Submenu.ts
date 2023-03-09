import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
const IconDropdown = require('@/assets/icon/icon-dropdown.png')
import './Usage.less'

@Component({
  template: `
    <div class="submenus overflow-hidden" v-loading="loading">
      <div class="heading-dark-02 submenu-logo ">{{ $t('ConsoleTitle') }}</div>
      <el-dropdown trigger="click" @command="onClickProject" style="left: 6px">
        <el-button class="button h-34 w-158 ml-1 pr-3 pb-1">
          <span class="text-truncate heading-grey-13 mr-10">{{ selectedProjectItem.name }} </span>
          <img class="right-icon w-18" :src="IconDropdown" />
        </el-button>

        <el-dropdown-menu slot="dropdown" class="w-158 px-1">
          <el-input
            type="text"
            v-model="name"
            class="f-12 mb-10 project-input"
            size="mini"
            @input="searchProject"
            :clearable="true"
            :placeholder="$t('ProjectPlaceholder')"
          >
          </el-input>
          <el-dropdown-item
            class="b-bottom"
            :key="-1"
            v-if="showAggregate"
            :command='{ id: "0", projectId: "0", name: $t("AllProjects") }'
          >
            {{ $t('AllProjects') }}
          </el-dropdown-item>
          <el-dropdown-item class="text-truncate" v-for="(item, index) in showProjectList" :key="index" :command="item">
            {{ item.name }}
          </el-dropdown-item>
          <el-dropdown-item disabled v-if="showProjectList.length === 0" :key="-2" :command="{ id: -2 }">
            {{ $t('NoResult') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-menu :default-openeds="openids" active-text-color="#3AB7F8FF" :default-active="activeMenuName">
        <el-menu-item-group index="usagegroup" class="oy-auto">
          <div :key="index" v-for='(menu, index) in $t("UsageMenus")' v-if="hasPermission(menu)">
            <el-submenu v-if="menu && menu.children" :index="menu.title + '-' + menu.index" :key="index">
              <span slot="title">
                <el-tooltip :content="$t(menu.tooltip)" placement="top" v-if="menu.tooltip" offset="-20">
                  <div>{{ menu.title }}</div>
                </el-tooltip>
                <span v-else>{{ menu.title }}</span>
              </span>
              <template v-for="sub in menu.children">
                <router-link
                  :to="{ name: sub.to, query: { vids: selectedProjectItem.id, projectId: selectedProjectItem.projectId }}"
                  :key="sub.to"
                  v-if="menu.index !== marketIndex"
                >
                  <el-menu-item :key="sub.to" :index="sub.to" v-if="hasPermission(sub)">
                    <span slot="title">{{ sub.title }}</span>
                  </el-menu-item>
                </router-link>
                <router-link
                  :to="{ path: sub.to, query: { vids: selectedProjectItem.id, projectId: selectedProjectItem.projectId, title: sub.title }}"
                  :key="sub.to"
                  v-else-if="sub"
                >
                  <el-menu-item v-if="hasPermission(sub)" :key="sub.to" :index="sub.to">
                    <span slot="title">{{ sub.title }}</span>
                  </el-menu-item>
                </router-link>
              </template>
            </el-submenu>
          </div>
        </el-menu-item-group>
      </el-menu>
    </div>
  `,
})
export default class Submenu extends Vue {
  isCocos = user.info.isCocos
  usageMenus: any[] = []
  openids: any[] = []
  loading = false
  projectList: any[] = []
  showProjectList: any[] = []
  selectedProjectItem = { id: '0', projectId: '0', name: this.$t('AllProjects') }
  name = ''
  activeMenuName: null | string = null
  marketplaceProducts: any = []
  showMenuItem = false
  showAggregate = false
  marketIndex = 7

  IconDropdown = IconDropdown

  @Watch('selectedProjectItem.id')
  onProjectHandler(val: any) {
    const list = this.projectList.filter((item: any) => item.id === val)
    if (list.length === 0 && val !== '0') {
      this.onClickProject(this.projectList[0])
    }
  }

  @Watch('$route.name')
  onRoutehandler(newVal: string) {
    if (newVal === 'usage') {
      this.create()
    } else {
      this.initMenu()
    }
  }

  mounted() {
    this.create()
  }

  async create() {
    this.usageMenus = this.$t('UsageMenus') as any
    await this.checkProjectPermission()
    await this.getProjectInfo()
    try {
      await this.initMarketplaceMenu()
    } catch (e) {}
    this.initMenu()
  }

  async checkProjectPermission() {
    const ret = await this.$http.get('/api/v2/project/all-project-permission')
    this.showAggregate = ret.data.permission
  }

  async getProjectInfo() {
    this.showMenuItem = false
    this.loading = true
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: { fetchAll: true } })
      this.projectList = ret.data.items
      this.showProjectList = this.projectList.slice(0, 10)
      if (this.projectList.length > 0) {
        if (this.$route.query.projectId || this.$route.query.vids) {
          if (this.$route.query.projectId !== '0' || this.showAggregate) {
            const findProject = this.projectList.filter((x: any) => {
              return x.id === Number(this.$route.query.vids) || x.projectId === this.$route.query.projectId
            })
            if (findProject.length > 0) {
              this.selectedProjectItem = findProject[0]
            }
            this.$router.push({
              query: Object.assign({}, this.$route.query, {
                vids: this.selectedProjectItem.id,
                projectId: this.selectedProjectItem.projectId,
                redirect: true,
              }),
            })
          }
        } else {
          if (!this.showAggregate) {
            this.selectedProjectItem = this.projectList[0]
          }
          this.$router.push({
            name: 'usage.duration',
            query: Object.assign({}, this.$route.query, {
              vids: this.selectedProjectItem.id,
              projectId: this.selectedProjectItem.projectId,
            }),
          })
        }
      } else {
        this.$message.warning(this.$t('CreateProjectFirst') as string)
        this.$router.push({ name: 'projects' })
      }
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
    }
    this.loading = false
    this.showMenuItem = true
  }

  onClickProject(command: any) {
    this.selectedProjectItem = command
    this.$router.replace({
      query: Object.assign({}, { vids: this.selectedProjectItem.id, projectId: this.selectedProjectItem.projectId }),
    })
  }
  searchProject(queryString: string) {
    const results = queryString
      ? this.projectList.filter(this.createFilter(queryString)).slice(0, 10)
      : this.projectList.slice(0, 10)
    this.showProjectList = results
  }
  createFilter(queryString: string) {
    return (vendor: any) => {
      const condition =
        vendor.name.toLowerCase().indexOf(queryString.toLowerCase()) > -1 ||
        vendor.id.toString().toLowerCase().indexOf(queryString.toLowerCase()) > -1 ||
        vendor.projectId.toLowerCase().indexOf(queryString.toLowerCase()) > -1
      return condition
    }
  }

  hasPermission(sub: any) {
    // 以下 index 来自于 this.usageMenus，可在 locales/cn/Usage.ts 中编辑
    const miniAppIndex = 3
    const RtmIndex = 6
    const contentCenterIndex = 11
    const fusionCDNIndex = 13
    const cloudProxyIndex = 15
    const chatIndex = 14
    if (!sub) return false
    if (!this.showMenuItem) return false

    if (sub.index === chatIndex && user.info.company.area === 'CN') return false

    // CN 和 JP 不可见 cloud proxy 用量页面
    if (sub.index === cloudProxyIndex && ['CN', 'JP'].includes(user.info.company.country)) return false

    if (sub.index === miniAppIndex && user.info.company.country !== 'CN') return false

    if (this.selectedProjectItem.projectId === '0' && sub.index === RtmIndex) return false

    if (
      sub.index === fusionCDNIndex &&
      (this.selectedProjectItem.projectId === '0' || user.info.company.country !== 'CN')
    )
      return false

    if (sub.index === contentCenterIndex && user.info.company.country !== 'CN') return false

    if (!sub.setting) return true

    const projectSetting = user.info.settings[this.selectedProjectItem.projectId]

    if (projectSetting) {
      // SDK分钟数配置已被遗弃，等线上版本稳定清除数据库相关记录后移除该兼容
      if (sub.setting === 'Recording SDK') {
        return (
          Object.keys(projectSetting).includes(sub.setting) && projectSetting[sub.setting].includes('Max Bandwidth')
        )
      }
      return Object.keys(projectSetting).includes(sub.setting)
    }
    return false
  }

  initMenu() {
    this.openids = []
    for (const menuIndex in this.$t('UsageMenus') as any) {
      const menu = this.usageMenus[menuIndex as any]
      if (menu.children && Object.keys(menu.children).length > 0) {
        for (const index in menu.children) {
          if (menu.children[index].to === 'usage.chat.dau' && user.info.company.country !== 'CN') {
            menu.children.splice(index, 1)
          }
          if ((this.$route as any).name.includes(menu.children[index].to)) {
            this.activeMenuName = menu.children[index].to
          } else if (this.$route.path.includes(menu.children[index].to)) {
            this.activeMenuName = menu.children[index].to
          }
        }
        this.openids.push(menu.title + '-' + menu.index)
      }
    }
  }

  async initMarketplaceMenu() {
    const marketIndex = 7
    await this.getMarketplaceProducts()

    if (this.marketplaceProducts.length === 0) {
      delete this.usageMenus[marketIndex]
    }
    if (Object.keys(this.usageMenus[marketIndex].children).length === this.marketplaceProducts.length) {
      return
    }
    this.marketplaceProducts.forEach((product: any) => {
      this.usageMenus[marketIndex].children[Object.keys(this.usageMenus[marketIndex].children).length + 1] = {
        to: `/usage/marketplace/${product.serviceName}`,
        title: this.$i18n.locale === 'en' ? product.productEnName : product.productCnName,
      }
    })
  }

  async getMarketplaceProducts() {
    const res = await this.$http.get('/api/v2/marketplace/company/purchased')
    this.marketplaceProducts = res.data.rows
  }
}
