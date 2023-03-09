import Vue from 'vue'
import Component from 'vue-class-component'
import ProductQuickstartBox from './ProductQuickstartBox'
import '../onboarding/Onboarding.less'

@Component({
  components: {
    'product-quickstart-box': ProductQuickstartBox,
  },
  template: `
    <div class="quickstart-container">
      <product-quickstart-box
        v-for="(info, index) of quickStartInfo"
        :key="index"
        :title="info.title"
        :description="info.description"
        :link="info.link"
        :track-id="info.trackId"
      >
      </product-quickstart-box>
    </div>
  `,
})
export default class ProductQuickstart extends Vue {
  quickStartInfo = [
    {
      trackId: 'SDK-VoiceCalling-ViewQuickstart',
      title: 'Voice Calling',
      description: 'Crystal-clear audio chat',
      link: 'https://docs.agora.io/en/voice-calling/get-started/get-started-sdk',
    },
    {
      trackId: 'SDK-Chat-ViewQuickstart',
      title: 'Chat',
      description: 'Private and group messaging',
      link: 'https://docs.agora.io/en/agora-chat/get-started/get-started-sdk',
    },
    {
      trackId: 'SDK-VideoCalling-ViewQuickstart',
      title: 'Video Calling',
      description: 'Customizable real-time video experiences',
      link: 'https://docs.agora.io/en/voice-calling/get-started/get-started-sdk',
    },
    {
      trackId: 'SDK-Signaling-ViewQuickstart',
      title: 'Signaling',
      description: 'High-concurrency signaling and synchronization capabilities',
      link: 'https://docs.agora.io/en/signaling/get-started/get-started-sdk',
    },
    {
      trackId: 'SDK-InteractiveLiveStreaming-ViewQuickstart',
      title: 'Interactive Live Streaming',
      description: 'Interactive video and voice live streaming ',
      link: 'https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk',
    },
    {
      trackId: 'SDK-InteractiveWhiteboard-ViewQuickstart',
      title: 'Interactive Whiteboard',
      description: 'Real-time visual collaboration with customized whiteboards',
      link: 'https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk',
    },
  ]
}
