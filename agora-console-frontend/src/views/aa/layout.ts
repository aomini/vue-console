import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  template: `
    <div>
      <router-view></router-view>
    </div>
  `,
})
export default class layout extends Vue {}
