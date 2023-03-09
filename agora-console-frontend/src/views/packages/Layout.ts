import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'

@Component({
  template: `<router-view />`,
})
export default class Layout extends Vue {
  isCN = user.info.company.area === 'CN'

  mounted() {
    if (!this.isCN && this.$route.name === 'packages') {
      this.$router.push({ name: 'package.chat' })
    } else if (this.isCN && this.$route.name === 'packages') {
      this.$router.push({ name: 'package.minPackage' })
    }
  }
}
