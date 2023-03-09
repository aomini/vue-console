import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
const OverseaWelcomeIcon = require('@/assets/icon/icon-oversea-welcome1.png')

@Component({
  components: {},
  template: `
    <div class="welcome-word--oversea">
      <div class="onboarding-title mb-20">
        <img class="h-100 mr-10 vertical-middle" :src="OverseaWelcomeIcon" />
        {{ $t('OverseaWelcome', { userName: userName }) }}
      </div>
    </div>
  `,
})
export default class WelcomeOversea extends Vue {
  @Prop({ type: String }) readonly userName!: string
  OverseaWelcomeIcon = OverseaWelcomeIcon

  async mounted() {}
}
