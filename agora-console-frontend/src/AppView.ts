import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  template: `
    <div id="app">
      <router-view class="h-100" />
    </div>
  `,
})
export default class AppView extends Vue {}
