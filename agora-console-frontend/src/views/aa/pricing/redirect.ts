import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  template: `<div>Redirecting</div>`,
})
export default class pricing extends Vue {
  created() {
    window.location.replace(`${this.GlobalConfig.config.analyticsLabUrl}/pricing?source=console`)
  }
}
