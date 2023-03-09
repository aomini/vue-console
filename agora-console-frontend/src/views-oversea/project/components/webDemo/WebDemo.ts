import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import moment from 'moment'

@Component({
  components: {},
  template: `
    <div class="project-module mb-20">
      <div class="module-item-title project-module-header">{{ $t('Try it out') }}</div>
      <div class="module-content">
        <el-row type="flex" align="middle">
          <el-col class="project-module-label">
            <span>{{ $t('Web demo') }}</span>
            <el-tooltip :content="$t('Web demo hover')" placement="right" popper-class="mw-250" effect="light">
              <i class="el-icon-info project-tooltip mr-20"></i>
            </el-tooltip>
            <span v-if="vendorInfo.signkey.length === 0 || vendorInfo.allowStaticWithDynamic" class="heading-grey-05">
              {{ $t('Please enable App Certificate first') }}
            </span>
            <el-button
              v-else-if="new Date().getTime() - new Date(vendorInfo.createdAt) > 2 * 60 * 1000"
              type="text"
              class="f-13"
              id="feature-generate-link"
              :disabled="accountBlocked"
              @click="goToInvitePage"
            >
              <span id="feature-generate-link">{{ $t('Generate link') }}</span>
            </el-button>
            <span class="row-content" v-else>{{ $t('WebDemoNotReady') }}</span>
          </el-col>
        </el-row>
      </div>
    </div>
  `,
})
export default class webDemo extends Vue {
  @Prop({ default: '', type: Object }) readonly vendorInfo!: any
  @Prop({ default: false, type: Boolean }) readonly accountBlocked!: Boolean

  async goToInvitePage() {
    const expiredTs = moment().unix() + 30 * 60
    const getUUID = await this.$http.post('/api/v2/project/token-record', {
      projectId: this.vendorInfo.projectId,
      channel: 'demo',
      expiredTs,
    })
    const router = this.$router.resolve({ name: 'invite', query: { sign: getUUID.data.uuid } })
    window.open(router.href, '_blank')
  }
}
