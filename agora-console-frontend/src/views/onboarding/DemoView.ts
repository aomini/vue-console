import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './Onboarding.less'
import moment from 'moment'
import { getProjectInfo } from '@/services'
import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'
import { TokenType } from '@/models/TokenModels'
const PicVideo = require('@/assets/icon/pic-video.png')

@Component({
  template: ` <div v-loading="loading" class="demo">
    <div class="create-project-header">
      <div class="header-sm-only">{{ $t('Try the demo') }}</div>
      <div class="skip-lg-only">
        <el-tooltip placement="right" :content="$t('skipTooltip')" popper-class="skip-tooltip">
          <i class="el-icon-close f-20 close-icon cursor-pointer" @click="handleClose"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="demo-box">
      <div class="heading-dark-01 mb-6">{{ $t('Try the demo') }}</div>
      <div class="heading-grey-13 mb-30">{{ $t('Try the demo tip') }}</div>
      <div class="users">
        <div id="video" class="d-flex video-box" ref="video">
          <div id="agora_local" class="video-block"></div>
          <div v-if="totalCount === 0" class="video-block">
            <img class="h-100 mx-auto" :src="PicVideo" />
          </div>
        </div>
      </div>
      <div class="heading-dark-16 link-title">{{ $t('Link Title') }}</div>
      <div class="d-flex mt-10">
        <div class="share-link text-truncate">{{ inviteLink }}</div>
        <console-button
          class="console-btn-white ml-10 next-button"
          size="lg"
          @click="saved"
          v-clipboard:copy="inviteLink"
        >
          {{ $t('CopyText') }}
        </console-button>
      </div>
      <div class="text-center">
        <console-button class="console-btn-primary w-350 mt-35 next-button" size="lg" @click="nextStep()">{{
          $t('Next')
        }}</console-button>
      </div>
    </div>
  </div>`,
})
export default class DemoView extends Vue {
  @Prop({ default: () => () => {}, type: Function }) readonly gotoDashboard!: Function
  @Prop({ default: () => () => {}, type: Function }) readonly next!: Function
  @Prop({ default: '', type: String }) readonly currentProjectId!: string
  loading = false
  rtc: any = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
  }
  inviteLink = ''
  remoteCount = 0
  totalCount = 0
  currentClient: any = undefined
  currentStream: any = undefined
  projectInfo: any = {}
  appId = ''
  accessToken = ''
  PicVideo = PicVideo

  created() {
    this.initData()
  }

  async initSDK() {
    this.rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    this.rtc.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await this.rtc.client.subscribe(user, mediaType)
      console.info('subscribe success')

      if (mediaType === 'video') {
        this.totalCount += 1
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
    await this.rtc.client.join(this.appId, 'OnboardingDemo', this.accessToken ? this.accessToken : null, null)
    this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
    this.rtc.localVideoTrack.play('agora_local')
    await this.rtc.client.publish([this.rtc.localAudioTrack, this.rtc.localVideoTrack])
    console.info('publish success!')
  }

  async generateToken() {
    try {
      const token = await this.$http.get('/api/v2/token', {
        params: { id: this.currentProjectId, channel: 'OnboardingDemo', type: TokenType.Onboarding },
      })
      this.accessToken = token.data.token
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 6014) {
        this.$message.warning(this.$t('EmptyChannel') as string)
      } else if (errorCode === 6015) {
        this.$message.warning(this.$t('InvalidChannel') as string)
        this.$message.warning(this.$t('InvalidChannel') as string)
      } else {
        this.$message.error(this.$t('FailedGetToken') as string)
      }
    }
  }

  async initData() {
    try {
      const projectInfo = await getProjectInfo(this.currentProjectId)
      this.projectInfo = projectInfo.info
      this.appId = projectInfo.info.key
    } catch (e) {
      this.$message.error(this.$t('FailedGetProjectInfo') as string)
      return
    }
    const expiredTs = moment().unix() + 30 * 60
    const getUUID = await this.$http.post('/api/v2/project/token-record', {
      projectId: this.currentProjectId,
      channel: 'OnboardingDemo',
      expiredTs,
    })

    this.inviteLink = `${window.location.origin}/invite?sign=${getUUID.data.uuid}`
    if (this.projectInfo.signkey.length > 0) {
      await this.generateToken()
    }
    this.initSDK()
  }

  async handleClose() {
    await this.leaveCall()
    this.gotoDashboard()
  }

  async leaveCall() {
    this.rtc.localAudioTrack?.close()
    this.rtc.localVideoTrack?.close()

    this.rtc.client?.remoteUsers.forEach((user: IAgoraRTCRemoteUser) => {
      // 销毁动态创建的 DIV 节点。
      const playerContainer = document.getElementById(user.uid.toString())
      playerContainer && playerContainer.remove()
    })
    await this.rtc.client?.leave()
  }

  saved() {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
  }

  async setOnboardingStatus() {
    try {
      await this.$http.post('/api/v2/company/field', { fieldType: 'onboarding' })
    } catch (e) {}
  }

  nextStep() {
    this.leaveCall()
    this.setOnboardingStatus()
    this.next()
  }
}
