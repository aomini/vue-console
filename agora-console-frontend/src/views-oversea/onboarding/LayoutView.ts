import Vue from 'vue'
import { Prop } from 'vue-property-decorator'
import Component from 'vue-class-component'
import './Onboarding.less'
import CreateProject from '@/views/onboarding/CreateProject'
import DemoView from '@/views/onboarding/DemoView'
import EndView from '@/views/onboarding/EndView'

@Component({
  components: {
    'create-project': CreateProject,
    demo: DemoView,
    'onboarding-end': EndView,
  },
  template: `
    <div class="onboarding-card">
      <el-steps class="onboarding-step" :active="currentStep" finish-status="success" simple>
        <el-step :title="$t('CreateProject')"></el-step>
        <el-step :title="$t('Try the demo')"></el-step>
        <el-step :title="$t('NextSteps')"></el-step>
      </el-steps>
      <create-project
        v-if="currentStep === 0"
        :next="nextStep"
        :gotoDashboard="goBack"
        :storeProject="(projectId) => storeProject(projectId)"
      >
      </create-project>
      <demo
        v-if="currentStep === 1"
        :gotoDashboard="goBack"
        :currentProjectId="currentProjectId"
        :next="nextStep"
      ></demo>
      <onboarding-end v-if="currentStep === 2" :next="goBack"></onboarding-end>
    </div>
  `,
})
export default class LayoutView extends Vue {
  @Prop({ default: () => () => {}, type: Function }) readonly gotoDashboard!: Function

  currentStep = 0
  currentProjectId = ''

  nextStep() {
    this.currentStep += 1
  }
  storeProject(id: string) {
    this.currentProjectId = id
  }
  goBack() {
    this.gotoDashboard(this.currentStep !== 0)
  }
}
