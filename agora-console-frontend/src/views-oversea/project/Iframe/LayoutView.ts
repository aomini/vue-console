import Vue from 'vue'
import Component from 'vue-class-component'
import './IframeView.less'
import { Watch } from 'vue-property-decorator'
import { getProjectInfo } from '@/services'
import { ExtensionMenu, ExtensionModel } from '@/models'
import { productConfig } from '@/services/product'
@Component({
  components: {},
  template: `<div class="iframe-view d-flex h-100">
    <div class="h-100 w-100 extension-embed-container" v-loading="loading">
      <div class="d-flex">
        <el-breadcrumb separator="/" class="mb-20">
          <el-breadcrumb-item :to="{ path: '/projects' }">{{ $t('ProjectList') }}</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('ProjectDetail') }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ menuTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="extension-iframe-layout">
        <div class="iframe-layout">
          <iframe
            ref="extension"
            :src="iframeSrc"
            width="100%"
            height="100%"
            frameborder="0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-downloads"
          ></iframe>
        </div>
      </div>
    </div>
  </div>`,
})
export default class LayoutView extends Vue {
  iframeSrc: string = ''
  menuTitle = ''
  projectId = this.$route.params.projectId
  vendorId = ''
  loading: boolean = false
  extensionId = this.$route.query.id
  goodsInfo = null
  currentGoods = []
  subscribedGoods = []

  @Watch('$store.state.extensionIframeConfig')
  oniframeSrcChange(extensionIframeConfig: any) {
    this.onloadLink(`${extensionIframeConfig.iframeSrc}?projectId=${this.projectId}&appName=${this.vendorId}`)
    this.menuTitle = `${this.$store.state.extensionIframeConfig.extensionTitle} - ${this.$store.state.extensionIframeConfig.iframeMenu}`
  }

  @Watch('$route.params.projectId')
  projectIdChange() {
    this.projectId = this.$route.params.projectId
  }

  async mounted() {
    const project = await getProjectInfo(this.projectId)
    this.vendorId = project.info.id
    this.onloadLink(
      `${this.$store.state.extensionIframeConfig.iframeSrc}?projectId=${this.projectId}&appName=${this.vendorId}`
    )

    if (this.extensionId === 'Chat') {
      this.addIframeEventListener()
    }

    if (this.extensionId === 'FusionCDN') {
      await this.getCDNGoods()
      await this.getCurrentOrders()
      await this.getSubscribedGoods()
      await this.subscribeCDNService()
    }
  }

  unmounted() {
    this.removeIframeEventListener()
  }

  onloadLink(link: string) {
    if (link === this.iframeSrc) {
      return
    }
    this.loading = true
    this.iframeSrc = link
    const extension: any = this.$refs['extension']
    extension.onload = () => {
      this.loading = false
    }
  }

  addIframeEventListener() {
    if (this.extensionId === 'Chat') {
      window.addEventListener('message', this.onMessage)
    }
  }

  removeIframeEventListener() {
    if (this.extensionId === 'Chat') {
      window.removeEventListener('message', this.onMessage)
    }
  }

  async changeExtensionIframe() {
    const extensionData = (await productConfig.getExtension(this.extensionId as string)) as ExtensionModel
    if (!extensionData) {
      return
    }
    const menuConfig = extensionData.menuConfig as ExtensionMenu[]
    const navMenuList: ExtensionMenu[] = []
    menuConfig.forEach((item) => {
      if (item.type === 'nav') {
        navMenuList.push(item)
      }
      item.children?.forEach((sItem) => {
        navMenuList.push(sItem)
      })
    })
    const menu = navMenuList.find((item) => item.nameEn === 'Overview')
    this.$store.dispatch('changeExtensionIframe', {
      extensionTitle: 'Chat',
      iframeSrc: menu!.navEn,
      iframeMenu: menu!.subMenu + '-' + menu!.nameEn,
    })
  }

  async onMessage(event: any) {
    const { data = {} } = event
    if (data.type === 'upgradeChatPackage') {
      this.$router.push({ name: 'package.chat' })
    } else if (data.type === 'manageChatService') {
      await this.changeExtensionIframe()
    }
  }

  // CDN
  get aaPackageConfig() {
    return this.GlobalConfig.config.aaPackage
  }

  get hasCDNPackage() {
    return (
      this.currentGoods &&
      this.currentGoods.length &&
      this.currentGoods.find((item: any) => {
        return item.mutexTag.toUpperCase() === 'CDN' && item.orderStatus === 'Paid'
      })
    )
  }

  get hasCDNPackageSubscription() {
    return (
      this.subscribedGoods &&
      this.subscribedGoods.length &&
      this.subscribedGoods.find((item: any) => {
        return item.customUid === this.aaPackageConfig.cdnCustomUid && item.subscriptionStatus === 'Active'
      })
    )
  }

  async getCDNGoods() {
    try {
      const result = await this.$http.get('/api/v2/goods/tag/cdn')
      this.goodsInfo = result.data
    } catch (e) {}
  }

  async getCurrentOrders() {
    const { data } = await this.$http.get('/api/v2/goods/company/order/all')
    this.currentGoods = data
  }

  async getSubscribedGoods() {
    const { data } = await this.$http.get('/api/v2/goods/company/subscription/all')
    this.subscribedGoods = data
  }

  async subscribeCDNService() {
    if (this.hasCDNPackage || this.hasCDNPackageSubscription) {
      return
    }
    await this.payAAFree(this.goodsInfo)
  }

  async payAAFree(targetGoods: any) {
    this.loading = true
    try {
      const params: any = {
        goodsId: targetGoods.goodsId,
      }
      await this.$http.post('/api/v2/goods/order/free', params)
      await this.getCurrentOrders()
      await this.getSubscribedGoods()
    } catch (e) {}
    this.loading = false
  }
}
