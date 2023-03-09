import Vue from 'vue'
import Component from 'vue-class-component'
import '../onboarding/Onboarding.less'
import NoCodeDesigner from '../onboarding/NoCodeDesigner'
import LowCodeUIKit from '../onboarding/LowCodeUIKit'
import ProductQuickstart from '../onboarding/ProductQuickstart'
import { user } from '@/services/user'
import { Watch } from 'vue-property-decorator'
@Component({
  components: {
    'no-code-designer': NoCodeDesigner,
    'low-code-uikit': LowCodeUIKit,
    'product-quickstart': ProductQuickstart,
  },
  template: `
    <el-collapse class="onboarding-card--oversea mt-10" v-model="activeName" @change="changeCollapse">
      <el-collapse-item name="onboarding">
        <template slot="title">
          <div class="w-100">
            <div class="onboarding-card__title heading-dark-16 w-100">
              {{ $t('OverseaOnboardingTitle') }}
              <span class="float-right">
                {{ this.$store.state.overseaOnboardingOpen ? $t('Collapse') : $t('Expand') }}
              </span>
            </div>
          </div>
        </template>
        <div class="onboarding-get-started-text">{{ $t('OverseaOnboardingTip') }}</div>
        <div class="onboarding-tab">
          <el-tabs type="border-card" v-model="tabName" :stretch="true">
            <el-tab-pane label="SDK Quickstart Guides" id="SDK-Quickstart-Guides" name="SDK-Quickstart-Guides">
              <product-quickstart></product-quickstart>
            </el-tab-pane>
            <el-tab-pane label="Video UIKit" id="Video-UIKit" name="Video-UIKit">
              <low-code-uikit></low-code-uikit>
            </el-tab-pane>
            <el-tab-pane label="App Builder" id="No-Code-App-Builder" name="No-Code-App-Builder">
              <no-code-designer> </no-code-designer>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-collapse-item>
    </el-collapse>
  `,
})
export default class OnboardingCard extends Vue {
  loading = false
  activeName = this.$store.state.overseaOnboardingOpen ? ['onboarding'] : []
  tabName = 'SDK-Quickstart-Guides'
  user = user
  tabOptions = ['Video-UIKit', 'SDK-Quickstart-Guides', 'No-Code-App-Builder']
  orderedTabOption = ['No-Code-App-Builder', 'Video-UIKit', 'SDK-Quickstart-Guides']

  async mounted() {
    if (this.user.info.extrasInfo) {
      const extrasInfo = JSON.parse(user.info.extrasInfo)
      if (extrasInfo.categoryCheckedMap) {
        for (const tab of this.orderedTabOption) {
          if (extrasInfo.categoryCheckedMap[tab]) {
            this.tabName = tab
            return
          }
        }
      }
    }
  }

  @Watch('$store.state.overseaOnboardingOpen')
  stateOverseaOnboardingOpenChange() {
    this.activeName = this.$store.state.overseaOnboardingOpen ? ['onboarding'] : []
  }

  async changeCollapse(data: any) {
    const status = data.length ? true : false
    await this.$store.dispatch('updateOverseaOnboardingStatus', status)
  }
}
