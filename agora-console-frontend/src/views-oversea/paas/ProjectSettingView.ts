import Vue from 'vue'
import Component from 'vue-class-component'
import ProjectList from './component/project-list'

@Component({
  components: {
    'project-list': ProjectList,
  },
  template: `<project-list />`,
})
export default class ProjectSettingView extends Vue {}
