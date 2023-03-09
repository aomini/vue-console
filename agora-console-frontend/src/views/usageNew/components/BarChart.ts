import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
const IconVoice = require('@/assets/icon/icon-Voice.png')
const IconAudioNoTrans = require('@/assets/icon/icon-AudioNoTrans.png')
const IconVideoSD = require('@/assets/icon/icon-VideoSD.png')
const IconVideoHD = require('@/assets/icon/icon-VideoHD.png')
const IconVideoHDP = require('@/assets/icon/icon-VideoHDP.png')
const IconVideo2K = require('@/assets/icon/icon-video2K.png')
const IconVideo4K = require('@/assets/icon/icon-video4K.png')
const IconKTV = require('@/assets/icon/icon-ktv.png')
const IconWhiteboard = require('@/assets/icon/icon-whiteboard.png')
const IconActiveUser = require('@/assets/icon/icon-active-user.png')
const IconFPASmall = require('@/assets/icon/icon-fpa-small.png')
const IconFPAMiddle = require('@/assets/icon/icon-fpa-middle.png')
const IconFPALarge = require('@/assets/icon/icon-fpa-large.png')
const IconBandwidth = require('@/assets/icon/bandwidth-blue.png')

@Component({
  template: `<div class="bar-chart">
    <div class="d-flex justify-between" v-if="type === 'cdnBandwidth'">
      <div v-for="(item, index) in data" :key="item.index" class="flex-1 lg-card pb-2">
        <div class="heading-light-03 type">{{ item.type }}</div>
        <div class="text-center" v-if="index !== data.length - 1">
          <div class="d-flex align-center justify-center">
            <img :src="Icons[item.dataType || voice]" class="icon" />
            <div class="heading-dark-01 mr-5">
              {{ item.value | kbpsToMbps }}
            </div>
            <div class="heading-light-03">{{ item.content }}</div>
          </div>
        </div>
        <div class="text-center" style="padding: 0 30px" v-else>
          <div class="d-flex justify-between mb-10" v-for="(cItem, cIndex) in item.value" :key="'cItem' + cIndex">
            <span class="heading-light-03"> {{ cItem.type }} </span>
            <span class="heading-dark-03">
              {{ cItem.value | kbpsToMbps }}
              <span class="heading-light-03 ml-10"> {{ item.content }} </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-between" v-else>
      <div v-for="item in data" :key="item.index" class="flex-1 lg-card">
        <div class="heading-light-03 type">{{ item.type }}</div>
        <div class="d-flex align-center justify-center">
          <img :src="Icons[item.dataType || voice]" class="icon" />
          <div class="heading-dark-01 mr-5" v-if="type === 'count' || type === 'COUNT' || type === 'fpa'">
            {{ item.value }}
          </div>
          <div
            class="heading-dark-01 mr-5"
            v-else-if="type === 'bandwidth' || type === 'counter' || business === 'concurrentChannel'"
          >
            {{ item.value | formatPeakNum }}
          </div>
          <div class="heading-dark-01 mr-5" v-else-if="type === 'cdnFlow'">
            {{ item.value | kbpsToMbps }}
          </div>
          <div class="heading-dark-01 mr-5" v-else>
            {{ item.value | usageBarValue }}
          </div>
          <div class="heading-light-03">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>`,
})
export default class BarChart extends Vue {
  @Prop({ default: {} }) data!: any
  @Prop({ default: '' }) type!: string
  @Prop({ default: '' }) business!: string
  @Prop({ default: '' }) renderType!: string

  Icons = {
    voice: IconVoice,
    audio: IconVoice,
    audioNoTrans: IconAudioNoTrans,
    videoSD: IconVideoSD,
    videoHD: IconVideoHD,
    videoHDP: IconVideoHDP,
    video2K: IconVideo2K,
    video4K: IconVideo4K,
    contentCenter: IconKTV,
    fusionCDNChina: IconVideoHD,
    fusionCDNExChina: IconVideoHDP,
    fusionCDNAll: IconVideoSD,
    whiteboard: IconWhiteboard,
    activeUser: IconActiveUser,
    fpaSmall: IconFPASmall,
    fpaMiddle: IconFPAMiddle,
    fpaLarge: IconFPALarge,
    bandwidth: IconBandwidth,
  }
}
