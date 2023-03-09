import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { i18n } from '@/i18n-setup'
import { productConfig } from '@/services/product'
import './IframeView.less'
import { ExtensionMenu, ExtensionModel } from '@/models'

@Component({
  components: {},
  template: `
    <div class="submenus submenus--iframe" v-loading="isLoading">
      <div>
        <el-menu
          :default-openeds="defaultOpendedSubmenus"
          :default-active="activeMenuName"
          active-text-color="#3AB7F8FF"
        >
          <div :key="index" v-for="(menu, index) in menuConfig">
            <el-submenu :index="menu.nameEn + '-' + index" :key="menu.nameEn + '-' + index" v-if="menu.children.length">
              <span slot="title">
                <el-tooltip v-if="showMenuToolTip" :content="getProductDesc" effect="light">
                  <div ref="product-desc" class="product-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">
                    <span>{{ isZh ? menu.nameCn : menu.nameEn }}</span>
                  </div>
                </el-tooltip>
                <span v-else>{{ isZh ? menu.nameCn : menu.nameEn }}</span>
              </span>
              <template v-for="sub in menu.children">
                <el-menu-item
                  :key="menu.nameEn + '-' + sub.nameEn"
                  :index="menu.nameEn + '-' + sub.nameEn"
                  @click="changeIframeSrc(sub)"
                >
                  <span slot="title">{{ isZh ? sub.nameCn : sub.nameEn }}</span>
                </el-menu-item>
              </template>
            </el-submenu>
            <el-menu-item
              v-else-if="menu.type === 'nav'"
              :key="menu.nameEn + '-' + index"
              :index="menu.nameEn + '-' + index"
              @click="changeIframeSrc(menu)"
            >
              <span slot="title">{{ isZh ? menu.nameCn : menu.nameEn }}</span>
            </el-menu-item>
          </div>
        </el-menu>
      </div>
    </div>
  `,
})
export default class submenu extends Vue {
  isLoading = true
  projects = []
  projectId = this.$route.params.projectId || ''
  extensionId = this.$route.query.id || ''
  defaultOpendedSubmenus: any = []
  activeMenuName = ''
  isZh = i18n.locale === 'cn'
  lang = this.isZh ? 'zh-CN' : 'en'
  title = ''
  menuConfig: any = []
  showMenuToolTip = false

  @Watch('$store.state.extensionIframeConfig')
  onIframeSrcChange(extensionIframeConfig: any) {
    this.activeMenuName = extensionIframeConfig.iframeMenu
  }

  async mounted() {
    await this.perpareExtensionConfig()
    this.isLoading = false
  }

  async perpareExtensionConfig() {
    this.defaultOpendedSubmenus = []
    const extensionData = (await productConfig.getExtension(this.extensionId as string)) as ExtensionModel
    if (!extensionData) {
      this.$message.error(this.$t('ParameterError') as string)
      this.$router.go(-1)
      return
    }
    this.title = this.isZh ? extensionData.nameCn : extensionData.nameEn
    this.menuConfig = extensionData.menuConfig as ExtensionMenu[]
    if (this.menuConfig.length) {
      if (this.menuConfig[0].type === 'subMenu') {
        this.activeMenuName = this.menuConfig[0].children[0]?.nameEn
        this.changeIframeSrc(this.menuConfig[0].children[0])
      } else {
        this.activeMenuName = this.menuConfig[0].nameEn
        this.changeIframeSrc(this.menuConfig[0])
      }
      this.defaultOpendedSubmenus.push(this.menuConfig[0].nameEn + '-' + 0)
    }
  }

  @Watch('this.$route.params.projectId')
  projectIdChange() {
    this.projectId = this.$route.params.projectId
  }

  changeIframeSrc(menu: ExtensionMenu) {
    const iframeSrc = this.isZh ? menu.navCn : menu.navEn
    const iframeMenu = this.isZh ? menu.nameCn : menu.nameEn
    const extensionTitle = this.title
    this.$store.dispatch('changeExtensionIframe', { extensionTitle, iframeSrc, iframeMenu })
  }
}
