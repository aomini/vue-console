import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import qs from 'qs'
import '../Xla.less'

@Component({
  template: ` <div class="iframe-layout xla-report-iframe" v-loading="isLoading">
    <iframe
      v-if="!isLoading && iframeSrc"
      :src="iframeSrc"
      id="xla-report-iframe"
      frameborder="0"
      width="100%"
      height="100%"
      importance="high"
      sandbox="allow-same-origin allow-scripts allow-popups"
    ></iframe>
  </div>`,
})
export default class xlaReport extends Vue {
  projectId = this.$route.query.projectId
  productType = this.$route.query.productType
  isLoading = !(this.projectId && this.productType)
  iframeSrc = this.getIframeSrc()

  @Watch('$route.query')
  queryChange() {
    this.isLoading = true
    const iframeSrc = this.getIframeSrc()
    if (!iframeSrc) {
      return
    }
    this.iframeSrc = null
    // hack: 触发 XLA iframe 页面的 reload
    Vue.nextTick(() => {
      this.iframeSrc = iframeSrc
      this.isLoading = false
    })
  }

  getIframeSrc() {
    const { projectId, productType } = this.$route.query
    if (!projectId || !productType) {
      return null
    }
    const query = {
      projectId,
      productType,
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
      timezone: 'UTC',
      showProjectSelector: false,
    }
    const path = `/xla/report?${qs.stringify(query)}`
    return `${this.GlobalConfig.config.analyticsLabUrl}${path}`
  }
}
