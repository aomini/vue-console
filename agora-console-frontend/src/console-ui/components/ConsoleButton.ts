import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  name: 'console-button',
  template: `
    <button class="console-btn" :disabled="disabled" :class="classes" type="button" @click="click">
      <i class="el-icon-loading" v-if="loading"></i>
      <slot></slot>
    </button>
  `,
})
export default class ConsoleButton extends Vue {
  @Prop({ default: 'default', type: String }) readonly type!: string
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean
  @Prop({
    default: 'md',
    type: String,
    validator: (v) => {
      if (['md', 'sm', 'lg'].indexOf(v) === -1) {
        console.info("agora-button size should be one of ['md', 'sm', 'lg']")
      }
      return v
    },
  })
  readonly size!: string
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean
  clicked: boolean = false
  timeout: any = undefined

  get classes() {
    return [
      {
        'is-disabled': this.disabled,
        'is-clicked': this.clicked,
      },
      `console-btn-${this.type}`,
      `console-btn-size-${this.size}`,
    ]
  }

  click() {
    this.$emit('click')
    this.clicked = true
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.clicked = false
    }, 500)
  }
}
