import Vue from 'vue'
import Component from 'vue-class-component'
import qs from 'query-string'

@Component({
  template: ` <div></div> `,
})
export default class alabEntriesView extends Vue {
  getIframeSrc() {
    const route = this.$route
    const query = Object.assign({}, route.query, {
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
      timezone: this.$store.state.curTimeType === 'UTC' ? 'UTC' : 'Local',
      showProjectSelector: false,
    })
    const path = `${route.path}?${qs.stringify(query)}`
    return `${this.GlobalConfig.config.analyticsLabUrl}${path}`
  }

  created() {
    location.assign(this.getIframeSrc())
  }
}
