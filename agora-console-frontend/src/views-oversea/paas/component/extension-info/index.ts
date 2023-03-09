import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `<div class="extension-info">
    <div class="logo">
      <img width="150px" height="150px" :src="extensionPhotoUrl" />
    </div>
    <div class="extension-text-box">
      <div class="extension-text-title">{{ extensionName }}</div>
      <div class="extension-text-vendor">{{ extensionTitle }}</div>
      <div class="extension-text-desc" v-html="extensionDescription"></div>
    </div>
  </div>`,
})
export default class ExtensionInfo extends Vue {
  @Prop({ default: '', type: String }) readonly extensionName!: string
  @Prop({ default: '', type: String }) readonly extensionTitle!: string
  @Prop({ default: '', type: String }) readonly extensionDescription!: string
  @Prop({ default: '', type: String }) readonly extensionPhotoUrl!: string
}
