import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
import { ProjectStage } from '@/models'
import PasswordInput from '@/components/PasswordInput'
const tokenIcon = require('@/assets/icon/icon-token.png')
import './Project.less'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: `
    <div class="table-border-row">
      <el-table :data="tableData" header-cell-class-name="project-table-row">
        <el-table-column prop="name" label="Project Name" class-name="font-weight-bold">
          <template slot-scope="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Creation Date">
          <template slot-scope="scope">
            <span> {{ scope.row.createdAt | formatDate('YYYY-MM-DD') }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="stage" label="Stage">
          <template slot-scope="scope">
            <span>
              {{ stageMap[scope.row.stage] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Security">
          <template slot-scope="scope">
            <span>
              {{ 'Security: ' + (!!scope.row.signkey ? 'Enabled' : 'Disabled') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="key" :label='$t("APPID")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            <password-input :passwordValue="scope.row.key" :isDisabled="true" style="max-width: 250px">
            </password-input>
          </template>
        </el-table-column>
        <el-table-column label="Action">
          <template slot-scope="scope">
            <router-link
              v-if="writePermission && !accountBlocked"
              :to='{ name: "editProject", params: { id: scope.row.projectId }}'
            >
              {{ $t('Configure') }}
            </router-link>
            <div v-else class="disabled-icon">{{ $t('Configure') }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  `,
})
export default class ProjectTableRowView extends Vue {
  @Prop({ default: [], type: Array }) readonly tableData!: Array<any>
  @Prop({ default: false, type: Boolean }) readonly isCocos!: boolean
  @Prop({ default: null, type: Function }) readonly onSort!: (condition: any) => Promise<void>
  @Prop({ default: false, type: Boolean }) readonly accountBlocked!: boolean

  writePermission = user.info.permissions['ProjectManagement'] > 1
  ProjectStage = ProjectStage
  tokenIcon = tokenIcon
  stageMap = {
    1: 'Not specified',
    2: 'Live',
    3: 'Testing',
  }

  sortChange(condition: any) {
    this.onSort(condition)
  }
}
