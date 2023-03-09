import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { ProductDemo } from '@/models/ProductModels'
import './QuickStart.less'

@Component({
  components: {},
  template: `
    <div class="demo-card d-flex">
      <span class="iconfont demo-logo" :class="getDemoIcon"></span>
      <div class="product-content">
        <a
          :href="this.$i18n.locale === 'en' ? this.demo.urlEn : this.demo.urlCn"
          :id="getDemoIdForTrack"
          class="demo-title d-flex justify-between"
          target="_blank"
        >
          <span> {{ getDemoTitle }} </span>
          <i class="iconfont iconchakangengduo"></i>
        </a>
        <el-tooltip v-if="showDescToolTip" :content="getDemoDesc" effect="light">
          <div ref="demo-desc" class="demo-desc text-line-2">
            {{ getDemoDesc }}
          </div>
        </el-tooltip>
        <div v-else ref="demo-desc" class="demo-desc text-line-2">
          {{ getDemoDesc }}
        </div>
      </div>
    </div>
  `,
})
export default class DemoCard extends Vue {
  @Prop({ default: '', type: Object }) readonly demo!: ProductDemo
  showDescToolTip = false

  get getDemoTitle() {
    return this.$i18n.locale === 'en' ? this.demo.nameEn : this.demo.nameCn
  }
  get getDemoDesc() {
    return this.$i18n.locale === 'en' ? this.demo.descriptionEn : this.demo.descriptionCn
  }
  get getDemoLabel() {
    return this.$i18n.locale === 'en' ? this.demo.labelEn : this.demo.labelCn
  }
  get getDemoIcon() {
    return 'icon' + this.demo.icon
  }
  get getDemoIdForTrack() {
    return 'demo-' + this.demo.nameEn
  }

  mounted() {
    this.showDescToolTip = (this.$refs['demo-desc'] as any).clientHeight < (this.$refs['demo-desc'] as any).scrollHeight
  }
}
