import Vue from 'vue'
import Component from 'vue-class-component'
const onboardingNocode = require('@/assets/image/onboarding-nocode.png')
import '../onboarding/Onboarding.less'

@Component({
  components: {},
  template: `
    <div class="nocode-box">
      <div class="nocode-content-box">
        <div class="nocode-text-box">
          Create real-time video experiences by selecting from a range of pre-built templates and components using a
          visual designer. Once you’ve designed your experience, you can download the source code to fully customize the
          UI/UX, add additional features, change business logic, and more using the Customizations API.
        </div>
        <el-button type="primary" class="w-200" @click="openAppBuilder" id="try-app-builder">
          <span id="try-app-builder"> {{ $t('Try App Builder') }} </span>
        </el-button>
      </div>
      <div class="nocode-img-box">
        <img :src="onboardingNocode" width="600" />
      </div>
    </div>
  `,
})
export default class NoCodeDesigner extends Vue {
  onboardingNocode = onboardingNocode

  openAppBuilder() {
    window.open('https://appbuilder.agora.io/docs')
  }
}
