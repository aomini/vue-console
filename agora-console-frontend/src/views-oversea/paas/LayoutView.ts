import Vue from 'vue'
import Component from 'vue-class-component'
import './layout.less'

@Component({
  template: `
    <div class="paas-global-notice">
      <div v-if="showMsg" w:pos="relative" w:mb="10px" w:border="rounded" w:p="y-10px x-32px" w:text="lg center gray-500" w:bg="blue-50" class="notice-wrapper">
        <div class="notice-content" v-html="noticeMsg"></div>
        <div w:pos="absolute right-20px top-1/2" w:text="lg gray-500 hover:gray-900" w:transform="~ -translate-y-1/2" w:cursor="pointer" @click="showMsg=false"><i class="el-icon-close"></i></div>
      </div>
      <router-view />
    </div>
  `,
})
export default class LayoutView extends Vue {
  noticeMsg = ''
  showMsg = false

  async mounted() {
    const res: any = await this.$http.get('/api/v2/marketplace/notice', {
      params: {
        area: 2,
      },
    })
    this.noticeMsg = res.data.contentHtml
    this.showMsg = !!res.data.contentHtml
  }
}
