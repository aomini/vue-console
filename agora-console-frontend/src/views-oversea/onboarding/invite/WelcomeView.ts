import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import '../Onboarding.less'
const PicInvite = require('@/assets/image/pic-invite.png')

@Component({
  template: `
    <div class="invite-box">
      <div class="invite-title">{{ $t('Title') }}</div>
      <div class="invite-hint">{{ name + $t('WelcomeHint') }}</div>
      <div class="text-center mb-50">
        <img height="260px" :src="PicInvite" />
      </div>
      <console-button @click="next" class="console-btn-primary w-100" size="lg">
        {{ $t('JoinChannel') }}
      </console-button>
    </div>
  `,
})
export default class WelcomeView extends Vue {
  @Prop({ default: () => () => {}, type: Function }) readonly next!: Function
  @Prop({ default: '', type: String }) readonly name!: string

  PicInvite = PicInvite
}
