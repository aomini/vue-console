import Vue from 'vue'
import Component from 'vue-class-component'
import './Drawer.less'
import { Prop } from 'vue-property-decorator'

@Component({
  name: 'console-drawer',
  template: `
    <div class="console-drawer">
      <div class="modal" @click="handleClose()"></div>
      <div class="drawer-container">
        <div class="drawer-header">
          <span class="heading-dark-14">{{ title }}</span>
          <i class="iconfont iconicon-guanbi" @click="handleClose()" />
        </div>
        <div class="drawer-content">
          <slot></slot>
        </div>
      </div>
    </div>
  `,
})
export default class Drawer extends Vue {
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: null, type: Function }) readonly handleClose!: () => Promise<void>
}
