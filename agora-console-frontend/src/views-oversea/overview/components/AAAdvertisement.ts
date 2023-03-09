import Vue from 'vue'
import _ from 'lodash'
import Component from 'vue-class-component'
import { analysis } from '@/services'
import { i18n } from '@/i18n-setup'
import './Component.less'

const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div class="overview-card-1 aa-advertisement">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03 left-title card-title-row">{{ $t('overview_card_aa_advertisement') }}</span>
        </div>
        <div class="header-right"></div>
      </div>
      <div class="card-content">
        <section class="content-container">
          <div class="multi-lines">
            <div class="line-container"><div class="line1" /></div>
            <div class="line-container"><div class="line2" /></div>
            <div class="line-container"><div class="line3" /></div>
            <div class="line-container"><div class="line4" /></div>
            <div class="line-container"><div class="line5" /></div>
          </div>
          <div class="aa-content">
            <span>
              <span>{{ $t('overview_card_aa_advertisement_content1') }}</span>
              <span :style="{color: textColor}">{{ $t('overview_card_aa_advertisement_content2') }}</span>
              <span>{{ $t('overview_card_aa_advertisement_content3') }}</span>
            </span>
            <div class="bg-pie"></div>
          </div>
          <div class="bottom-wrap">
            <div class="info" v-if="layout===0"></div>
            <div class="info layout1" v-if="layout===1">
              <div style="margin-right: 16px;">
                <div>1. {{ $t('AA_Pricing_RealtimeMonitoring') }}</div>
                <div>3. {{ $t('AASideMenu_InvestigatingTools_Title') }}</div>
              </div>
              <div>
                <div>2. {{ $t('AA_Pricing_Notification') }}</div>
                <div>4. {{ $t('AASideMenu_DataInsight_Title') }}</div>
              </div>
            </div>
            <div class="info layout2" v-if="layout===2">
              <span>1. {{ $t('AA_Pricing_RealtimeMonitoring') }}</span>
              <span>2. {{ $t('AA_Pricing_Notification') }}</span>
              <span>3. {{ $t('AASideMenu_InvestigatingTools_Title') }}</span>
              <span>4. {{ $t('AASideMenu_DataInsight_Title') }}</span>
            </div>
            <div class="info layout3" v-if="layout===3">
              <span>1. {{ $t('AA_Pricing_RealtimeMonitoring') }}</span>
              <span class="split">——</span>
              <span>2. {{ $t('AA_Pricing_Notification') }}</span>
              <span class="split">——</span>
              <span>3. {{ $t('AASideMenu_InvestigatingTools_Title') }}</span>
              <span class="split">——</span>
              <span>4. {{ $t('AASideMenu_DataInsight_Title') }}</span>
            </div>
            <div class="link-wrap">
              <a class="live-demo-link" target="_blank" :href="aaLiveDemoHost" @click="handleLinkClick">
                {{ $t('overview_card_aa_advertisement_action') }}
                <i class="el-icon-d-arrow-right"></i>
              </a>
              <div class="dot-arrow-line" />
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export default class AAAdvertisement extends Vue {
  visible = false
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  config = this.GlobalConfig.config
  isZh = i18n.locale === 'cn'
  textColor = this.isZh ? '#099DFD' : '#000E4B'
  lang = this.isZh ? 'zh-CN' : 'en'
  aaLiveDemoHost = `${this.config.aaLiveDemoHost}?source=console-overview&lang=${this.lang}`
  layout = 1

  mounted() {
    this.setLayout()
    window.addEventListener('resize', this.windowResize)
    analysis.show({
      event: `console_AA_demo_card`,
      category: 'console_AA_demo_card',
    })
  }

  unmounted() {
    window.removeEventListener('resize', this.windowResize)
  }

  windowResize = _.debounce(this.setLayout, 100)

  setLayout() {
    const clientWidth = document.body.clientWidth
    if (clientWidth >= 1920) {
      this.layout = 3
    } else if (clientWidth >= 1440 && this.isZh) {
      this.layout = 2
    } else if (clientWidth <= 1220 && clientWidth >= 768 && !this.isZh) {
      this.layout = 0
    } else if (clientWidth <= 970 && clientWidth >= 768 && this.isZh) {
      this.layout = 0
    } else {
      this.layout = 1
    }
  }

  handleLinkClick() {
    analysis.click({
      event: `console_AA_demo_card`,
      category: 'console_AA_demo_card',
    })
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'aa-advertisement-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
