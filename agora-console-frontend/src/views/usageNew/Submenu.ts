import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { Watch } from 'vue-property-decorator'
const IconDropdown = require('@/assets/icon/icon-dropdown.png')
import './Usage.less'
import { ProductUsageModel, UsageMenuModel } from '../../models/usageModel'
import { usageConfig } from '@/services/usage'
import { UsageMode } from '../../models/usageModel'

@Component({
  template: `
    <div class="submenus overflow-hidden" v-loading="loading">
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
          <div :key="index" v-for="(menu, index) in usageMenus" v-if="hasMenuPermission(menu)">
            <el-submenu v-if="menu && menu.children" :index="menu.title + '-' + index" :key="index">
              <span slot="title">
                <el-tooltip :content="$t(menu.tooltip)" placement="top" v-if="menu.tooltip" offset="-20">
                  <div>{{ menu.title }}</div>
                </el-tooltip>
                <span v-else>{{ menu.title }}</span>
              </span>
              <template v-for="sub in menu.children">
                <router-link
                  :to="{ name: 'usage.common', query: { vids: selectedProjectItem.id, projectId: selectedProjectItem.projectId, modelId: sub.modelId }}"
                  :key="sub.modelId"
                  v-if="sub.mode === UsageMode.configuration"
                >
                  <el-menu-item :key="sub.modelId" :index="sub.modelId" v-if="hasModelPermission(sub)">
                    <span slot="title">{{ isCNLang ? sub.nameCn : sub.nameEn }}</span>
                  </el-menu-item>
                </router-link>
                <router-link
                  :to="
                    { name: sub.router, query: { vids: selectedProjectItem.id, projectId: selectedProjectItem.projectId, modelId: sub.modelId }}"
                  :key="sub.router"
                  v-else-if="sub.mode === UsageMode.customized && sub.extensionId !== 'marketplace' "
                >
                  <el-menu-item :key="sub.modelId" :index="sub.modelId" v-if="hasModelPermission(sub)">
                    <span slot="title">{{ isCNLang ? sub.nameCn : sub.nameEn }}</span>
                  </el-menu-item>
                </router-link>
                <router-link
                  :to="
                    { path: sub.router, query: { vids: selectedProjectItem.id, projectId: selectedProjectItem.projectId, title: isCNLang ? sub.nameCn : sub.nameEn, modelId: sub.modelId }}"
                  :key="sub.router"
                  v-else-if="sub.mode === UsageMode.customized && sub.extensionId === 'marketplace'"
                >
                  <el-menu-item :key="sub.nameEn" :index="sub.nameEn" v-if="hasModelPermission(sub)">
                    <span slot="title">{{ isCNLang ? sub.nameCn : sub.nameEn }}</span>
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
  usageMenus: UsageMenuModel[] | null = []
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
  UsageMode = UsageMode
  IconDropdown = IconDropdown
  isCNLang = user.info.language === 'chinese'

  @Watch('selectedProjectItem.id')
  onProjectHandler(val: any) {
    const list = this.projectList.filter((item: any) => item.id === val)
    if (list.length === 0 && val !== '0') {
      this.onClickProject(this.projectList[0])
    }
  }

  @Watch('$route.query.modelId')
  onRoutehandler(newVal: string) {
    if (!newVal && !this.$route.name?.includes('usage')) {
      this.prepareUsageData()
    } else {
      this.initMenu()
    }
  }

  async mounted() {
    await this.prepareUsageData()
  }

  async prepareUsageData() {
    this.usageMenus = await usageConfig.getFullUsageMenus()
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
                modelId: this.$route.query.modelId
                  ? this.$route.query.modelId
                  : this.usageMenus![0].children[0].modelId,
                redirect: true,
              }),
            })
          }
        } else {
          if (!this.showAggregate) {
            this.selectedProjectItem = this.projectList[0]
          }
          this.$router.push({
            name: 'usage.common',
            query: Object.assign({}, this.$route.query, {
              vids: this.selectedProjectItem.id,
              projectId: this.selectedProjectItem.projectId,
              modelId: this.usageMenus![0].children[0].modelId,
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
      query: Object.assign(
        {},
        {
          modelId: this.$route.query.modelId,
          vids: this.selectedProjectItem.id,
          projectId: this.selectedProjectItem.projectId,
        }
      ),
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

  hasMenuPermission(menu: UsageMenuModel) {
    const cloudProxyId = 'CloudProxy'
    if (!menu) return false
    if (!this.showMenuItem) return false

    if (
      this.selectedProjectItem.projectId === '0' &&
      menu.children &&
      !menu.children.find((item: ProductUsageModel) => item && item.showAggregate)
    )
      return false
    if (menu.extensionId === cloudProxyId && ['CN', 'JP'].includes(user.info.company.country))
      // CN 和 JP 不可见 cloud proxy 用量页面
      return false

    return true
  }

  hasModelPermission(model: ProductUsageModel) {
    if (!model) return false
    // model 设置不展示聚合用量的情况
    if (!model.showAggregate && this.selectedProjectItem.projectId === '0') return false

    if (!model.settingValue) return true

    if (model.settingValue === 'Duration') {
      return true
    }

    // 本地服务端录制-分钟数默认显示
    if (model.settingValue === 'Recording SDK' && model.fetchParams.model === 'duration') {
      return true
    }

    // model 存在显示配置的情况
    const projectSetting = user.info.settings[this.selectedProjectItem.projectId]
    if (projectSetting) {
      // SDK分钟数配置已被遗弃，等线上版本稳定清除数据库相关记录后移除该兼容
      if (model.settingValue === 'Recording SDK') {
        if (model.nameEn === 'Duration') {
          return true
        }
        return (
          Object.keys(projectSetting).includes(model.settingValue) &&
          projectSetting[model.settingValue].includes('Max Bandwidth')
        )
      }
      return Object.keys(projectSetting).includes(model.settingValue)
    }
    return false
  }

  initMenu() {
    this.openids = []
    const modelId = this.$route.query.modelId
    for (const menuIndex in this.usageMenus) {
      const menu = this.usageMenus![menuIndex as any]
      if (menu.children && menu.children.length > 0) {
        for (const index in menu.children) {
          if (modelId === menu.children[index].modelId) {
            this.activeMenuName = menu.children[index].modelId
          }
        }
        this.openids.push(menu.title + '-' + menuIndex)
      }
    }
  }

  async initMarketplaceMenu() {
    await this.getMarketplaceProducts()

    if (
      this.usageMenus!.find((item) => item.extensionId === 'marketplace')?.children.length ===
      this.marketplaceProducts.length
    ) {
      return
    }

    if (this.marketplaceProducts.length > 0) {
      this.usageMenus!.push({
        title: this.$t('marketplace-card') as string,
        extensionId: 'marketplace',
        children: [],
      })
    }
    const marketplaceMenu = this.usageMenus!.find((item) => item.extensionId === 'marketplace')!
    this.marketplaceProducts.forEach((product: any) => {
      marketplaceMenu.children.push({
        router: `/usage/marketplace/${product.serviceName}`,
        nameEn: product.productEnName,
        nameCn: product.productCnName,
        extensionId: 'marketplace',
        modelId: '0',
        mode: UsageMode.customized,
        weight: 0,
        fetchParams: { business: '', model: '' },
        renderParams: { groupList: [], resolutionList: [], renderType: 0 },
        packageType: 0,
        showAggregate: 1,
        status: true,
      })
    })
  }
  async getMarketplaceProducts() {
    const res = await this.$http.get('/api/v2/marketplace/company/purchased')
    this.marketplaceProducts = res.data.rows.filter((item: any) => item)
  }
}
