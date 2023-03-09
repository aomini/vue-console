import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { ProductDemo } from '@/models/ProductModels'
import './QuickStart.less'

@Component({
  components: {},
  template: `
    <div class="demo-card product-card">
      <span class="iconfont demo-logo" :class="getDemoIcon"></span>
      <div class="product-content">
        <div class="demo-title">{{ getDemoTitle }}</div>
        <el-tooltip v-if="showDescToolTip" :content="getDemoDesc" effect="light">
          <div ref="demo-desc" class="product-desc demo-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">
            {{ getDemoDesc }}
          </div>
        </el-tooltip>
        <div v-else ref="demo-desc" class="product-desc demo-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">
          {{ getDemoDesc }}
        </div>
        <a
          :href="this.$i18n.locale === 'en' ? this.demo.urlEn : this.demo.urlCn"
          :id="getDemoIdForTrack"
          class="demo-label"
          target="_blank"
        >
          {{ getDemoLabel }}
          <i class="iconfont iconicon-url"></i>
        </a>
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
    if (this.$i18n.locale === 'en') {
      this.showDescToolTip =
        (this.$refs['demo-desc'] as any).clientHeight < (this.$refs['demo-desc'] as any).scrollHeight
    } else {
      this.showDescToolTip = (this.$refs['demo-desc'] as any).clientWidth < (this.$refs['demo-desc'] as any).scrollWidth
    }
  }
}
