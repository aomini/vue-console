import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import moment from 'moment'
import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'
const PicVideo = require('@/assets/icon/pic-video.png')

@Component({
  template: `
    <div class="invite-box channel-box">
      <div class="invite-title">{{ $t('Title') }}</div>
      <div class="invite-hint">{{ name + $t('WelcomeHint') }}</div>
      <div class="invite-sm">
        <div class="heading-dark-16 link-title">{{ $t('Link Title') }}</div>
        <div class="d-flex mt-10">
          <div class="share-link text-truncate">{{ url }}</div>
          <console-button
            class="console-btn-white ml-10 clipboard-btn"
            size="lg"
            @click="saveInviteLink"
            v-clipboard:copy="url"
          >
            {{ $t('CopyText') }}
          </console-button>
        </div>
      </div>
      <div class="users">
        <div id="video" class="d-flex" ref="video" style="flex-wrap: wrap">
          <div id="agora_local" class="video-block"></div>
          <div v-if="totalCount === 0" class="video-block">
            <img class="h-100 mx-auto" :src="PicVideo" />
          </div>
        </div>
      </div>
      <div class="invite-lg mb-50">
        <div class="heading-dark-16 link-title">{{ $t('Link Title') }}</div>
        <div class="d-flex mt-10">
          <div class="share-link text-truncate">{{ url }}</div>
          <console-button class="console-btn-white ml-10 clipboard-btn" @click="saveInviteLink" v-clipboard:copy="url">
            {{ $t('CopyText') }}
          </console-button>
        </div>
      </div>

      <div class="text-center mt-4 invite-lg">
        <console-button @click="leaveChannel" class="console-btn-white w-350 pt-0 mb-10" size="lg">
          {{ $t('LeaveChannel') }}
        </console-button>
        <div class="mt-3">
          <span>
            {{ $t('SignupHint3') }}
            <a :href="$t('SignURL')" target="_blank" class="link">{{ $t('SignupHint4') }}</a>
          </span>
        </div>
      </div>

      <div class="invite-sm mt-10 mb-80">
        <span>
          {{ $t('SignupHint3') }}
          <a :href="$t('SignURL')" target="_blank" class="link">{{ $t('SignupHint4') }}</a>
        </span>
      </div>

      <div class="invite-sm onboarding-btn-group px-0">
        <console-button @click="leaveChannel" class="console-btn-primary w-100">
          {{ $t('LeaveChannel') }}
        </console-button>
      </div>
    </div>
  `,
})
export default class LeaveChannelView extends Vue {
  @Prop({ default: '', type: String }) readonly url!: string
  @Prop({ default: () => () => {}, type: Function }) readonly goBack!: Function
  @Prop({ default: '', type: String }) readonly resId!: string
  @Prop({ default: '', type: String }) readonly resContent!: string
  @Prop({ default: '', type: String }) readonly channel!: string
  @Prop({ default: '', type: String }) readonly name!: string

  currentStream: any = undefined
  currentClient: any = undefined
  rtc: any = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
  }
  accessToken: any = ''
  remoteCount = 0
  totalCount = 0
  timestamp: any = ''
  channelName: any = ''
  PicVideo = PicVideo

  created() {
    this.timestamp = moment().utc().unix()
    this.channelName = this.channel || 'OnboardingDemo'
    this.accessToken = this.resContent || null
    this.initSDK()
  }

  async initSDK() {
    this.rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    this.rtc.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await this.rtc.client.subscribe(user, mediaType)
      console.info('subscribe success')
      if (mediaType === 'video') {
        this.totalCount = this.totalCount + 1
        const remoteVideoTrack = user.videoTrack
        const playerContainer = document.createElement('div')
        playerContainer.setAttribute('class', 'video-block')
        playerContainer.id = user.uid.toString()
        ;(this.$refs.video as any).appendChild(playerContainer)
        remoteVideoTrack?.play(playerContainer)
      }
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack
        remoteAudioTrack?.play()
      }
    })
    this.rtc.client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      if (mediaType === 'video') {
        const playerContainer = document.getElementById(user.uid.toString())
        playerContainer?.remove()
      }
    })

    this.rtc.client.on('user-joined', async (user: IAgoraRTCRemoteUser) => {
      this.totalCount = this.totalCount + 1
      if (Number(user.uid) < this.timestamp) {
        this.remoteCount = this.remoteCount + 1
      }
      if (this.remoteCount > 3) {
        await this.leaveChannel(true)
      }
    })
    await this.rtc.client.join(this.resId, this.channelName, this.accessToken ? this.accessToken : null, this.timestamp)
    this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
    this.rtc.localVideoTrack.play('agora_local')
    await this.rtc.client.publish([this.rtc.localAudioTrack, this.rtc.localVideoTrack])
    console.info('publish success!')
  }

  saveInviteLink() {
    this.$message({
      message: this.$t('Copied') as any,
      type: 'success',
    })
  }
  async leaveChannel(isMaxCapacity: boolean | undefined) {
    this.rtc.localAudioTrack?.close()
    this.rtc.localVideoTrack?.close()

    this.rtc.client?.remoteUsers.forEach((user: IAgoraRTCRemoteUser) => {
      // 销毁动态创建的 DIV 节点。
      const playerContainer = document.getElementById(user.uid.toString())
      playerContainer && playerContainer.remove()
    })
    await this.rtc.client?.leave()
    this.goBack(isMaxCapacity)
  }
}
