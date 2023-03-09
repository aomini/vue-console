import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './ExtensionBox.less'

@Component({
  components: {},
  template: `
    <div class="card extension-box">
      <div class="extension-box-header">
        <div class="d-flex align-center justify-between mb-10">
          <span class="d-flex align-center extension-box-title-box">
            <span class="iconfont f-20 extension-icon" :class="icon"></span>
            <span class="heading-dark-16 extension-box-title">{{ name }}</span>
          </span>
          <span v-if="showStatus" class="heading-light-05 extension-box-status" :class="status ? 'enabled' : 'disabled'"
            >{{ $t('Status') }}: {{ status ? $t('ExtensionEnabled') : $t('ExtensionDisabled') }}</span
          >
        </div>
        <div class="heading-grey-13 extension-box-description" v-if="!showDocs">
          {{ description }}
        </div>
      </div>
      <div class="d-flex align-center extension-box-button">
        <slot></slot>
      </div>
    </div>
  `,
})
export default class ExtensionBox extends Vue {
  @Prop({ default: '', type: String }) readonly name!: string
  @Prop({ default: '', type: String }) readonly icon!: any
  @Prop({ default: '', type: String }) readonly description!: string
  @Prop({ default: false, type: Boolean }) readonly status!: boolean
  @Prop({ default: false, type: Boolean }) readonly showStatus!: boolean
  @Prop({ default: false, type: Boolean }) readonly showDocs!: boolean
}
