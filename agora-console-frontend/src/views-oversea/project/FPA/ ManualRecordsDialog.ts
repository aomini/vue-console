import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `
    <div>
      <el-dialog
        :visible="true"
        :title="$t('Manual chain application records')"
        :before-close="() => showManualRecords(false)"
      >
        <el-table
          class="mt-20"
          :data="data"
          :empty-text='$t("EmptyDataMessage")'
          cell-class-name="text-truncate"
          header-cell-class-name="text-truncate"
        >
          <el-table-column prop="created_data.concurrency_limit" :label='$t("Connection Limit")'></el-table-column>
          <el-table-column :label='$t("Bandwith Limit")'>
            <template slot-scope="scope">
              <span>{{ scope.row.created_data.bandwidth_hardlimit | bpsToMbps }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="created_data.port" :label='$t("Port")'></el-table-column>
          <el-table-column :label='$t("Status")'>
            <template slot-scope="scope">
              <span>{{ $t(scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" :label='$t("Description")'></el-table-column>
        </el-table>
      </el-dialog>
    </div>
  `,
})
export default class ManualRecordsDialog extends Vue {
  @Prop({ default: null, type: Function }) readonly showManualRecords!: (show: boolean) => Promise<void>
  @Prop({ default: [], type: Array }) readonly data!: any[]
}
