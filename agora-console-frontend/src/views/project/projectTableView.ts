import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
import { ProjectStage, ProjectCreatorStatus } from '@/models'
import PasswordInput from '@/components/PasswordInput'
const tokenIcon = require('@/assets/icon/icon-token.png')
import './Project.less'
import { companyExtraSetting, CompanyFieldType } from '@/services/companyField'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: `
    <div>
      <el-table
        :data="tableData"
        row-class-name="dark-table-row"
        :empty-text='$t("EmptyProjectMessage")'
        tooltip-effect="light"
        cell-class-name="text-truncate"
        header-cell-class-name="text-truncate"
        @sort-change="sortChange"
      >
        <el-table-column
          prop="name"
          :label='$t("ProjectName")'
          label-class-name="table-title"
          class-name="table-content"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column prop="key" :label='$t("APPID")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            <password-input :passwordValue="scope.row.key" :isDisabled="true" type="text" style="max-width: 250px">
            </password-input>
          </template>
        </el-table-column>
        <el-table-column :label='$t("ProjectAuthentication")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            <span
              v-if="scope.row.signkey"
              w:display="inline-block"
              w:border="~ rounded-2px green-200"
              w:bg="green-200"
              w:text="green-400"
              w:p="y-4px x-8px"
            >
              {{ $t('SecuredMode') }}
            </span>
            <span v-else w:display="inline-block" w:bg="yellow-200" w:text="yellow-900" w:p="y-4px x-8px">{{
              $t('TestingMode')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stage" :label='$t("Stage")' label-class-name="table-title" class-name="table-content">
          <template slot-scope="scope">
            <span class="py-2">{{ scope.row.stage === ProjectStage.Live ? $t('LiveEnv') : $t('TestingEnv') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label='$t("Creator")'
          label-class-name="table-title"
          class-name="table-content"
          v-if="showVendorCreator"
        >
          <template slot-scope="scope">
            <span class="py-2" v-if="scope.row.creator === ProjectCreatorStatus.MainAccount">
              {{ $t('MainAccount') }}
            </span>
            <span class="py-2" v-else-if="scope.row.creator === ProjectCreatorStatus.NoRecord">
              {{ $t('NoRecord') }}
            </span>
            <span class="py-2" v-else-if="scope.row.creator === ProjectCreatorStatus.AccountDeleted">
              {{ $t('AccountDeleted') }}
            </span>
            <span class="py-2" v-else>
              {{ scope.row.creator }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          :label='$t("CreateDate")'
          label-class-name="table-title"
          class-name="table-content"
          sortable="custom"
        >
          <template slot-scope="scope">
            <div>
              <span>{{ scope.row.createdAt | formatDate('YYYY-MM-DD') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="actionUrl"
          :label='$t("Action")'
          label-class-name="table-title"
          class-name="table-content"
          width="100px"
        >
          <template slot-scope="scope">
            <router-link
              v-if="writePermission && !accountBlocked"
              :to='{ name: "editProject", params: { id: scope.row.projectId }}'
            >
              {{ $t('Config') }}
            </router-link>
            <div v-else class="disabled-icon">{{ $t('Config') }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  `,
})
export default class ProjectTableView extends Vue {
  @Prop({ default: [], type: Array }) readonly tableData!: Array<any>
  @Prop({ default: false, type: Boolean }) readonly isCocos!: boolean
  @Prop({ default: null, type: Function }) readonly onSort!: (condition: any) => Promise<void>
  @Prop({ default: false, type: Boolean }) readonly accountBlocked!: boolean

  writePermission = user.info.permissions['ProjectManagement'] > 1
  ProjectStage = ProjectStage
  tokenIcon = tokenIcon
  showVendorCreator = false
  ProjectCreatorStatus = ProjectCreatorStatus

  async created() {
    this.showVendorCreator = await companyExtraSetting.getCompanyField(CompanyFieldType.showVendorCreator)
  }

  sortChange(condition: any) {
    if (this.onSort) {
      this.onSort(condition)
    }
  }
}
