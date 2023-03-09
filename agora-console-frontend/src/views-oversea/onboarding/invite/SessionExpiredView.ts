import Vue from 'vue'
import Component from 'vue-class-component'
const PicCaution = require('@/assets/image/pic-caution.png')

@Component({
  template: `
    <div class="invite-box text-center">
      <div class="invite-title">{{ $t('ExpiredTitle') }}</div>
      <div class="invite-hint">{{ $t('SubTitle') }}</div>
      <div class="text-center mb-50">
        <img height="260px" :src="PicCaution" />
      </div>
      <div class="invite-hint text-center">
        <span>
          {{ $t('SignupHint1') }}
          <a :href="$t('SiteURL')" target="_blank" class="link">agora.io</a>
          {{ $t('SignupHint2') }}
        </span>
      </div>
    </div>
  `,
})
export default class SessionExpiredView extends Vue {
  PicCaution = PicCaution
}
