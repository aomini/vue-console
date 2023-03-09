import Vue from 'vue'
import Component from 'vue-class-component'
import './Xla.less'

@Component({
  template: ` <div class="xla-layout-container">
    <router-view></router-view>
  </div>`,
})
export default class Layout extends Vue {}
