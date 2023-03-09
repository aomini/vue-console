import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  template: `<div></div>`,
})
export default class RedirectTicketView extends Vue {
  async mounted() {
    const res = await this.$http.get('/api/v2/support/url')
    window.location.href = res.data
  }
}
