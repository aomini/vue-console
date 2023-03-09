import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import qs from 'qs'
import '../Xla.less'

@Component({
  template: ` <div class="iframe-layout xla-report-iframe">
    <iframe
      v-if="iframeSrc"
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
  iframeSrc = this.getIframeSrc()

  @Watch('$route.query')
  queryChange() {
    this.iframeSrc = this.getIframeSrc()
  }

  getIframeSrc() {
    const query = {
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
      timezone: 'UTC',
      showProjectSelector: false,
      showNestedHeader: true,
    }
    const path = `/xla/report?${qs.stringify(query)}`
    return `${this.GlobalConfig.config.analyticsLabUrl}${path}`
  }
}
