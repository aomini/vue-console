import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import '../onboarding/Onboarding.less'

@Component({
  template: `
    <div class="quickstart-box">
      <div class="quickstart-title">{{ title }}</div>
      <div>{{ description }}</div>
      <el-button type="text" slot="reference" :id="trackId" @click="jumpToLink">
        <span :id="trackId" class="onboarding_create_project_row"> View Quickstart </span>
      </el-button>
    </div>
  `,
})
export default class ProductQuickstart extends Vue {
  @Prop({ type: String }) readonly title!: string
  @Prop({ type: String }) readonly description!: string
  @Prop({ type: String }) readonly link!: string
  @Prop({ default: '', type: String }) readonly trackId!: string // For GA

  jumpToLink() {
    window.open(this.link, '_blank')
  }
}
