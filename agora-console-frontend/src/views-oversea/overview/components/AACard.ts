import Vue from 'vue'
import qs from 'query-string'
import Component from 'vue-class-component'
import './Component.less'
import { Prop, Watch } from 'vue-property-decorator'
import ProjectSelect from '@/components/ProjectSelect'
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

enum MetricName {
  OnlineUserCount = 'onlineUserCount',
  LoginSuccessInFiveSecRatio = 'loginSuccessInFiveSecRatio',
  AudioFreezeRatio = 'audioFreezeRate',
  VideoFreezeRatio = 'videoFreezeRatio',
}

@Component({
  components: {
    'project-select': ProjectSelect,
  },
  template: `
    <div class="card-box overview-card-1 aa-card">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03 left-title card-title-row">{{ $t('overview_card_onlineUserCount') }}</span>
          <el-tooltip effect="light" :content="$t('overview_card_onlineUserCount_desc')" placement="top">
            <i class="iconfont iconicon-tishi icon-question"></i>
          </el-tooltip>
          <i class="iconfont iconicon-refresh vertical-bottom" @click="refreshData"></i>
        </div>
        <project-select :projectId="projectId" :projectList="projectList" @updateProjectId="updateProjectId"></project-select>
        <div class="header-right" @click='getLiveExperienceProjectId'>
          <span class="heading-dark-03">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 ml-3"></i>
        </div>
      </div>
      <div class="card-content">
        <section class="quality-overview-card" v-if="visible" v-loading="isLodaing">
          <iframe
            v-if="iframeSrc"
            ref="qualityOverview"
            class="quality-overview"
            :src="iframeSrc"
          />
        </section>
      </div>
    </div>
  `,
})
export default class AACard extends Vue {
  @Prop({ default: '', type: String }) readonly projectId!: string
  @Prop({ default: [] }) readonly projectList!: any
  visible = false
  isLodaing = true
  appToken: string | null = null
  iframeSrc: string | null = null
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false

  @Watch('projectId')
  onProjectIdChange() {
    this.refreshProjectId()
  }

  async mounted() {
    await this.initProject()
    await this.featchAppToken()

    this.isLodaing = false
    this.iframeSrc = this.getLiveExperienceUrl()

    window.addEventListener('message', this.onMessage)
  }

  unmounted() {
    window.removeEventListener('message', this.onMessage)
  }

  async initProject() {
    const res = await this.$http
      .get('/api/v2/projects', { params: { page: 1, limit: 3 } })
      .catch(() => ({ data: { total: 0 } }))
    if (res.data && res.data.total > 0) {
      this.visible = true
    }
  }

  async featchAppToken() {
    const { data } = await this.$http.get('/api/v2/aa/app-token')
    this.appToken = data
  }

  gotoLiveExperience(projectId: string) {
    this.trace(projectId)
    this.$router.push({ name: 'AA_RealtimeMonitoring', query: { projectId } })
  }

  getLiveExperienceProjectId() {
    ;(this.$refs.qualityOverview as any).contentWindow.postMessage(
      {
        type: 'getSelectProjectId',
      },
      '*'
    )
  }
  refreshData() {
    ;(this.$refs.qualityOverview as any).contentWindow.postMessage(
      {
        type: 'refreshData',
      },
      '*'
    )
  }
  refreshProjectId() {
    ;(this.$refs.qualityOverview as any).contentWindow.postMessage(
      {
        type: 'refreshProjectId',
        projectId: this.projectId,
      },
      '*'
    )
  }
  getLiveExperienceUrl() {
    const query = Object.assign({}, this.$route.query, {
      isEmbed: true,
      responsive: true,
      embedType: 'card',
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
      metricName: MetricName.OnlineUserCount,
      version: 'console-v3',
      appToken: this.appToken,
      projectId: this.projectId,
    })
    const pathStr = qs.stringify(query)
    return `${this.GlobalConfig.config.analyticsLabUrl}/overview/quality?${pathStr}`
  }
  onMessage(event: any) {
    const { data = {} } = event
    if (data.type === 'getSelectProjectId') {
      this.gotoLiveExperience(data.value)
    }
  }

  trace(projectId: string) {
    this.$store.dispatch('gtag', {
      event: 'realtime_quality_overview',
      event_category: 'goto_live_experience',
      event_label: '前往实时体验页面',
      value: projectId,
    })
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'aa-card')
  }

  confirmDelete() {
    this.deleteCard()
  }

  updateProjectId(value: any) {
    this.$emit('updateProjectId', value)
  }
}
