import { user } from '@/services/user'
import { i18n } from '@/i18n-setup'
import { Message } from 'element-ui'
import Layout from '@/views/usage/Layout'
// import DurationView from '@/views/usage/duration/DurationView'
import AllView from '@/views/usage/duration/AllView'
import HostView from '@/views/usage/duration/HostView'
import AudienceView from '@/views/usage/duration/AudienceView'
import StardardDurationView from '@/views/usage/liveStreaming/DurationView'
import TranscodingView from '@/views/usage/transcodingDuration/TranscodingView'
import H264DurationView from '@/views/usage/transcodingDuration/H264DurationView'
import H265DurationView from '@/views/usage/transcodingDuration/H265DurationView'
import TranscodingSettingView from '@/views/usage/transcodingDuration/TranscodingSettingView'
import MiniAppView from '@/views/usage/miniApp/MiniAppView'
import MiniAppSettingView from '@/views/usage/miniApp/MiniAppSettingView'
import SDKDurationView from '@/views/usage/SDKDuration/DurationView'
import SDKBandWidthView from '@/views/usage/SDKBandwidth/BandWidthView'
import BandWidthView from '@/views/usage/bandwidth/BandWidthView'
import BandWidthAllView from '@/views/usage/bandwidth/AllView'
import BandWidthHostView from '@/views/usage/bandwidth/HostView'
import BandWidthAudienceView from '@/views/usage/bandwidth/AudienceView'
import CloudRecordingView from '@/views/usage/cloudRecording/CloudRecordingView'
import CloundRecordingSettingView from '@/views/usage/cloudRecording/CloundRecordingSettingView'
import CloudPlayerView from '@/views/usage/cloudPlayer/CloudPlayerView'
import CloudPlayerSettingView from '@/views/usage/cloudPlayer/CloudPlayerSettingView'
import LayoutView from '@/views/usage/DAU/LayoutView'
import DAUView from '@/views/usage/DAU/DAUView'
import WhiteboardDurationView from '@/views/usage/whiteboard/DurationView'
import MarketplaceLayoutView from '@/views/usage/marketplace/LayoutView'
import MarketplaceView from '@/views/usage/marketplace/MarketplaceView'
import TranscodingChannelView from '@/views/usage/transcodingChannels/TranscodingView'
import H264MaxHostinChannelsView from '@/views/usage/transcodingChannels/H264MaxHostinChannelsView'
import H264MaxTotalChannelsView from '@/views/usage/transcodingChannels/H264MaxTotalChannelsView'
import H264MaxTotalHostinChannels from '@/views/usage/transcodingChannels/H264MaxTotalHostinChannels'
import H265MaxChannelsView from '@/views/usage/transcodingChannels/H265MaxChannelsView'
import FPAChainView from '@/views/usage/fpa/FPAChainView'
import FPAFlowView from '@/views/usage/fpa/FPAFlowView'
import ContentCenterDurationView from '@/views/usage/contentCenter/DurationView'
import PageRecordingDurationView from '@/views/usage/pageRecording/DurationView'
import CDNFlowView from '@/views/usage/fusionCDN/CDNFlowView'
import CDNBandwidthView from '@/views/usage/fusionCDN/CDNBandwidthView'
import ChatDAUView from '@/views/usage/agoraChat/DAUView'
import ChatLayoutView from '@/views/usage/agoraChat/LayoutView'
import ChatMAUView from '@/views/usage/agoraChat/MAUView'
import CloudProxyView from '@/views/usage/cloudProxyDuration/CloudProxyView'
import TCPDurationView from '@/views/usage/cloudProxyDuration/TCPDurationView'
import UDPDurationView from '@/views/usage/cloudProxyDuration/UDPDurationView'
import ImageModerationView from '@/views/usage/moderation/ImageModerationView'
import StandardBandWidthView from '@/views/usage/liveStreaming/BandWidthView'
import AudienceBandWidthView from '@/views/usage/liveStreaming/AudienceBandWidthView'
import TranscodingBandWidthView from '@/views/usage/transcodingBandwidth/BandWidthView'
import TranscodingAudienceBandWidthView from '@/views/usage/transcodingBandwidth/AudienceBandWidthView'
import CommonView from '@/views/usageNew/CommonView'
import Submenu from '@/views/usageNew/Submenu'
const usagePermission = (to: any, from: any, next: any) => {
  if (user.info && user.info.permissions) {
    if (user.info.permissions['Usage'] > 0) {
      next()
      return
    }
  }
  const route = { name: 'overview' }
  Message.warning(i18n.t('NoAuthApply') as string)
  next(route)
}

export const UsageRouters = {
  path: 'usage',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  name: 'usage',
  children: [
    {
      path: 'common',
      name: 'usage.common',
      meta: {
        title: 'Usage',
      },
      beforeEnter: usagePermission,
      component: CommonView,
    },
    {
      path: '/duration',
      name: 'usage.duration',
      meta: {
        title: 'Duration',
      },
      beforeEnter: usagePermission,
      component: CommonView,
      children: [
        {
          path: 'all',
          name: 'usage.duration.All',
          meta: {
            title: 'Duration All',
          },
          beforeEnter: usagePermission,
          component: AllView,
        },
        {
          path: 'host',
          name: 'usage.duration.Host',
          meta: {
            title: 'Duration Host',
          },
          beforeEnter: usagePermission,
          component: HostView,
        },
        {
          path: 'audience',
          name: 'usage.duration.Audience',
          meta: {
            title: 'Duration Audience',
          },
          beforeEnter: usagePermission,
          component: AudienceView,
        },
      ],
    },
    {
      path: '/standard/duration',
      name: 'usage.standard.duration',
      meta: {
        title: 'Interactive Live Streaming Standard',
      },
      beforeEnter: usagePermission,
      component: StardardDurationView,
    },
    {
      path: '/standard/bandwidth',
      name: 'usage.standard.bandwidth',
      meta: {
        title: 'BandWidth',
      },
      beforeEnter: usagePermission,
      component: StandardBandWidthView,
      children: [
        {
          path: 'audience',
          name: 'usage.standard.bandwidth.Standard Bandwidth Audience',
          meta: {
            title: 'Bandwidth Audience',
          },
          beforeEnter: usagePermission,
          component: AudienceBandWidthView,
        },
      ],
    },
    {
      path: '/transcoding/duration',
      name: 'usage.transcoding.duration',
      meta: {
        title: 'Transcoding',
      },
      beforeEnter: usagePermission,
      component: TranscodingView,
      children: [
        {
          path: 'h264Duration',
          name: 'usage.transcoding.duration.H264 Duration',
          meta: {
            title: 'H264 Duration',
          },
          beforeEnter: usagePermission,
          component: H264DurationView,
        },
        {
          path: 'h265Duration',
          name: 'usage.transcoding.duration.H265 Duration',
          meta: {
            title: 'H265 Duration',
          },
          beforeEnter: usagePermission,
          component: H265DurationView,
        },
      ],
    },
    {
      path: '/transcoding/bandwidth',
      name: 'usage.transcoding.bandwidth',
      meta: {
        title: 'BandWidth',
      },
      beforeEnter: usagePermission,
      component: TranscodingBandWidthView,
      children: [
        {
          path: 'audience',
          name: 'usage.transcoding.bandwidth.Transcoding Bandwidth Audience',
          meta: {
            title: 'Bandwidth Audience',
          },
          beforeEnter: usagePermission,
          component: TranscodingAudienceBandWidthView,
        },
      ],
    },
    {
      path: '/transcoding/duration/setting',
      name: 'usage.transcoding.duration.setting',
      meta: {
        title: 'RTMP Streaming - Duration - Settings',
      },
      beforeEnter: usagePermission,
      component: TranscodingSettingView,
    },
    {
      path: '/miniapp',
      name: 'usage.miniapp',
      meta: {
        title: 'Mini APP',
      },
      beforeEnter: usagePermission,
      component: MiniAppView,
    },
    {
      path: '/transcoding/channels',
      name: 'usage.transcoding.channels',
      meta: {
        title: 'Transcoding',
      },
      beforeEnter: usagePermission,
      component: TranscodingChannelView,
      children: [
        {
          path: 'h264MaxTotal',
          name: 'usage.transcoding.channels.H264 Max Total Concurrent channels',
          meta: {
            title: 'H264 Max Total Concurrent channels',
          },
          beforeEnter: usagePermission,
          component: H264MaxTotalChannelsView,
        },
        {
          path: 'h264MaxTotalHostIn',
          name: 'usage.transcoding.channels.H264 Max Total Host-in Concurrent channels',
          meta: {
            title: 'H264 Max Total Host-in Concurrent channels',
          },
          beforeEnter: usagePermission,
          component: H264MaxTotalHostinChannels,
        },
        {
          path: 'h264MaxHostIn',
          name: 'usage.transcoding.channels.H264 Max Host-in Concurrent channels',
          meta: {
            title: 'H264 Max Host-in Concurrent channels',
          },
          beforeEnter: usagePermission,
          component: H264MaxHostinChannelsView,
        },
        {
          path: 'h265MaxChannels',
          name: 'usage.transcoding.channels.H265 Max Concurrent channels',
          meta: {
            title: 'H265 Max Concurrent channels',
          },
          beforeEnter: usagePermission,
          component: H265MaxChannelsView,
        },
      ],
    },
    {
      path: '/miniapp/setting',
      name: 'usage.miniapp.setting',
      meta: {
        title: 'Mini app - Duration - Settings',
      },
      beforeEnter: usagePermission,
      component: MiniAppSettingView,
    },
    {
      path: '/sdk-duration',
      name: 'usage.recordingsdk-duration',
      meta: {
        title: 'Duration',
      },
      beforeEnter: usagePermission,
      component: SDKDurationView,
    },
    {
      path: '/sdk-bandwidth',
      name: 'usage.recordingsdk-bandwidth',
      meta: {
        title: 'Bandwidth',
      },
      beforeEnter: usagePermission,
      component: SDKBandWidthView,
    },
    {
      path: '/bandwidth',
      name: 'usage.bandwidth',
      meta: {
        title: 'BandWidth',
      },
      beforeEnter: usagePermission,
      component: BandWidthView,
      children: [
        {
          path: 'all',
          name: 'usage.bandwidth.All',
          meta: {
            title: 'Bandwidth All',
          },
          beforeEnter: usagePermission,
          component: BandWidthAllView,
        },
        {
          path: 'host',
          name: 'usage.bandwidth.Host',
          meta: {
            title: 'Bandwidth Host',
          },
          beforeEnter: usagePermission,
          component: BandWidthHostView,
        },
        {
          path: 'audience',
          name: 'usage.bandwidth.Audience',
          meta: {
            title: 'Bandwidth Audience',
          },
          beforeEnter: usagePermission,
          component: BandWidthAudienceView,
        },
      ],
    },
    {
      path: '/cloud-recording',
      name: 'usage.cloud-recording',
      meta: {
        title: 'Cloud Recording',
      },
      beforeEnter: usagePermission,
      component: CloudRecordingView,
    },
    {
      path: '/cloud-recording/setting',
      name: 'usage.cloudRecording.Duration.setting',
      meta: {
        title: 'Cloud Recording - Duration - Settings',
      },
      beforeEnter: usagePermission,
      component: CloundRecordingSettingView,
    },
    {
      path: '/media-inject',
      name: 'usage.media-inject',
      meta: {
        title: 'Media Inject',
      },
      beforeEnter: usagePermission,
      component: CloudPlayerView,
    },
    {
      path: '/media-inject/setting',
      name: 'usage.mediaInject.Duration.setting',
      meta: {
        title: 'Media Inject - Duration - Settings',
      },
      beforeEnter: usagePermission,
      component: CloudPlayerSettingView,
    },
    {
      path: '/dau',
      name: 'usage.dau',
      meta: {
        title: 'Daily Active User',
      },
      beforeEnter: usagePermission,
      component: LayoutView,
      children: [
        {
          path: 'dau',
          name: 'usage.dau.dau',
          meta: {
            title: 'Daily Active User',
          },
          beforeEnter: usagePermission,
          component: DAUView,
        },
      ],
    },
    {
      path: '/whiteboard',
      name: 'usage.whiteboard',
      meta: {
        title: 'whiteboard',
      },
      beforeEnter: usagePermission,
      component: WhiteboardDurationView,
    },
    {
      path: '/fpa-chain',
      name: 'usage.fpa-chain',
      meta: {
        title: 'FPA Chain',
      },
      beforeEnter: usagePermission,
      component: FPAChainView,
    },
    {
      path: '/fpa-flow',
      name: 'usage.fpa-flow',
      meta: {
        title: 'FPA Flow',
      },
      beforeEnter: usagePermission,
      component: FPAFlowView,
    },
    {
      path: '/cdn-flow',
      name: 'usage.cdn-flow',
      meta: {
        title: 'Fusion CDN Flow',
      },
      beforeEnter: usagePermission,
      component: CDNFlowView,
    },
    {
      path: '/cdn-bandwidth',
      name: 'usage.cdn-bandwidth',
      meta: {
        title: 'Fusion CDN Bandwidth Peak',
      },
      beforeEnter: usagePermission,
      component: CDNBandwidthView,
    },
    {
      path: 'marketplace',
      name: 'usage.marketplace',
      meta: {
        title: 'Marketplace Usage',
      },
      beforeEnter: usagePermission,
      component: MarketplaceLayoutView,
      children: [
        {
          path: ':serviceName',
          name: 'usage.marketplace.marketplace',
          meta: {
            title: 'Marketplace Usage',
          },
          beforeEnter: usagePermission,
          component: MarketplaceView,
        },
      ],
    },
    {
      path: 'content-center',
      name: 'usage.content-center',
      meta: {
        title: 'Content Center',
      },
      beforeEnter: usagePermission,
      component: ContentCenterDurationView,
    },
    {
      path: 'page-recording',
      name: 'usage.page-recording',
      meta: {
        title: 'Page Recording',
      },
      beforeEnter: usagePermission,
      component: PageRecordingDurationView,
    },
    {
      path: '/chat',
      name: 'usage.chat',
      meta: {
        title: 'Agora Chat',
      },
      beforeEnter: usagePermission,
      component: ChatLayoutView,
      children: [
        {
          path: 'dau',
          name: 'usage.chat.dau',
          meta: {
            title: 'Daily Active User',
          },
          beforeEnter: usagePermission,
          component: ChatDAUView,
        },
        {
          path: 'mau',
          name: 'usage.chat.mau',
          meta: {
            title: 'Monthly Acitve User',
          },
          beforeEnter: usagePermission,
          component: ChatMAUView,
        },
      ],
    },
    {
      path: '/cloud-proxy/duration',
      name: 'usage.cloudProxy.duration',
      meta: {
        title: 'Cloud Proxy - Duration',
      },
      beforeEnter: usagePermission,
      component: CloudProxyView,
      children: [
        {
          path: 'TCP',
          name: 'usage.cloudProxy.duration.TCP',
          meta: {
            title: 'Cloud Proxy - TCP Duration',
          },
          beforeEnter: usagePermission,
          component: TCPDurationView,
        },
        {
          path: 'UDP',
          name: 'usage.cloudProxy.duration.UDP',
          meta: {
            title: 'Cloud Proxy - UDP Duration',
          },
          beforeEnter: usagePermission,
          component: UDPDurationView,
        },
      ],
    },
    {
      path: 'content-moderation',
      name: 'usage.content-moderation',
      meta: {
        title: 'Content Moderation',
      },
      beforeEnter: usagePermission,
      component: ImageModerationView,
    },
    {
      path: 'common',
      name: 'usage.common',
      meta: {
        title: 'Common',
      },
      beforeEnter: usagePermission,
      component: CommonView,
    },
  ],
}
