import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import qs from 'query-string'
import { user } from '@/services'
const IconCheck = require('@/assets/icon/icon-checkblue.png')
import './Onboarding.less'

@Component({
  template: `
    <div>
      <div class="create-project-header">
        <div class="header-sm-only">{{ $t('NextSteps') }}</div>
        <div class="skip-lg-only">
          <el-tooltip placement="right" :content="$t('skipTooltip')" popper-class="skip-tooltip">
            <i class="el-icon-close f-20 close-icon cursor-pointer" @click="next()"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="text-center end-content-box">
        <div class="heading-dark-01 mb-6 d-flex align-center justify-center">
          <img :src="IconCheck" class="w-18 mr-6" />{{ $t('Next Step') }}
        </div>
        <div class="end-content d-flex justify-between">
          <div class="content-item" @click="openLink($t('Doc Center Link'))">
            <div class="heading-dark-16 mt-30 mb-23">{{ $t('Documentation') }}</div>
            <div class="icon-70 icon-doc m-auto item-icon"></div>
            <div class="head-grey-14 item-desc">{{ $t('Integrate in your app step by step') }}</div>
          </div>
          <div class="content-item" @click="openLink($t('AppBuilderUrl'))">
            <div class="heading-dark-16 mt-30 mb-23">{{ $t('AppBuilder') }}</div>
            <div class="icon-70 icon-appbuilder m-auto item-icon"></div>
            <div class="head-grey-14 item-desc">{{ $t('AppBuilderDescription') }}</div>
          </div>
          <div class="content-item" @click="goToAA">
            <div class="heading-dark-16 mt-30 mb-23">{{ $t('Check Call Quality') }}</div>
            <div class="icon-70 icon-aa m-auto item-icon"></div>
            <div class="head-grey-14 item-desc">{{ $t('Visualize and analyze call quality data') }}</div>
          </div>
        </div>
        <div class="onboarding-btn-group mt-40">
          <console-button @click="next()" class="console-btn-primary w-350" v-if="companyInfo.country === 'CN'">
            {{ $t('GotoDashboard') }}
          </console-button>
          <console-button @click="addCard()" class="console-btn-primary w-350" v-else>
            {{ $t('Add a Card') }}
          </console-button>
        </div>
      </div>
    </div>
  `,
})
export default class EndView extends Vue {
  @Prop({ default: () => () => {}, type: Function }) readonly next!: Function
  companyInfo = user.info.company
  IconCheck = IconCheck

  openLink(url: string) {
    window.open(url, '_blank')
  }

  goToAA() {
    const queryStr = `?${qs.stringify({
      locale: this.$i18n.locale === 'en' ? 'en' : 'zh',
    })}`
    window.open(`${this.GlobalConfig.config.analyticsLabUrl}${queryStr}`)
  }

  addCard() {
    this.$router.push({ name: 'finance.creditCard' })
  }
}
