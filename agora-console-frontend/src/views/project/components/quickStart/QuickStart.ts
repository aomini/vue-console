import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import DemoCard from './DemoCard'
import '../../Project.less'
import './QuickStart.less'

@Component({
  components: {
    'demo-box': DemoCard,
  },
  template: `
    <div class="h-100 quick-start" v-loading="loading">
      <div
        class="module-item-title project-module-header d-flex align-center"
        :data-intro="$t('ProjectDetailIntro-3')"
        data-step="3"
        data-position="bottom"
      >
        <i class="cursor-pointer iconfont iconicon-close" @click="closeDocs" id="feature-quick-start"></i>
        <span class="cursor-pointer project-module-title ml-10" @click="closeDocs" id="feature-quick-start">{{
          $t('QuickStart')
        }}</span>
        <a :href="docsUrl" class="pl-10" target="_blank"><i class="iconfont iconicon-url"></i></a>
      </div>
      <div class="module-content h-100">
        <el-row :gutter="24">
          <el-col :span="12" v-for="(item, demoIndex) of allDemos">
            <demo-box :key="demoIndex + 1" :demo="item"></demo-box>
          </el-col>
        </el-row>
        <div class="divider mt-20" v-if="allDemos.length"></div>
        <div class="h-100 quick-start-docs">
          <iframe
            ref="docs"
            :src="docsLink"
            width="100%"
            height="100%"
            frameborder="0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-downloads"
          ></iframe>
        </div>
      </div>
    </div>
  `,
})
export default class QuickStart extends Vue {
  @Prop({ default: '', type: String }) readonly docsLink!: string
  @Prop({ default: '', type: Array }) readonly demoList!: string
  loading = false
  allDemos: any = []

  get docsUrl() {
    const index = this.docsLink.indexOf('mode')
    return index > -1 ? this.docsLink.slice(0, index) : this.docsLink
  }

  @Watch('demoList')
  onDemoListChanged() {
    this.allDemos = this.demoList
  }

  @Watch('docsLink')
  onDocsLinkChanged() {
    this.loading = true
    const docs: any = this.$refs['docs']
    docs.onload = () => {
      this.loading = false
    }
  }

  closeDocs() {
    this.$emit('closeDocs')
  }

  async mounted() {
    console.info(this.demoList)
  }
}
