import Vue from 'vue'
import Component from 'vue-class-component'
import './Components.less'
import { Prop, Watch } from 'vue-property-decorator'

@Component({
  template: `
    <div class="d-inline-block project-select">
      <el-select v-model="value" filterable @change="handleSelect">
        <el-option v-for="item in projectList" :key="item.projectId" :label="item.name" :value="item.projectId">
        </el-option>
      </el-select>
    </div>
  `,
})
export default class ProjectSelect extends Vue {
  @Prop({ default: '', type: String }) readonly projectId!: string
  @Prop({ default: [] }) readonly projectList!: any
  value: string = ''

  @Watch('projectId')
  onProjectChange(projectId: string) {
    this.value = projectId
  }

  created() {
    this.value = this.projectId
  }

  handleSelect(value: any) {
    this.$emit('updateProjectId', value)
  }
}
