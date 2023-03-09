import Vue from 'vue'
import Component from 'vue-class-component'
import './Xla.less'

@Component({
  template: `
    <div style="position: relative">
      <div class="xla-layout-container">
        <router-view></router-view>
      </div>
    </div>
  `,
})
export default class Layout extends Vue {}
