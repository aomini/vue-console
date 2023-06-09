const UsageI18nCn = {
  UsageMenus: [
    {
      index: 0,
      title: '通话和互动直播',
      children: [
        { to: 'usage.duration', title: '分钟数' },
        { to: 'usage.bandwidth', title: '带宽峰值', setting: 'Bandwidth' },
      ],
    },
    {
      index: 1,
      title: '极速直播',
      children: [
        { to: 'usage.standard.duration', title: '分钟数' },
        { to: 'usage.standard.bandwidth', title: '带宽峰值', setting: 'Standard Bandwidth' },
      ],
    },
    {
      index: 2,
      title: '旁路推流',
      children: [
        { to: 'usage.transcoding.duration', title: '分钟数' },
        { to: 'usage.transcoding.channels', title: '最大并发频道数', setting: 'Transcoding' },
        { to: 'usage.transcoding.bandwidth', title: '带宽峰值', setting: 'Transcoding Bandwidth' },
      ],
    },
    {
      index: 3,
      title: '小程序',
      children: [{ to: 'usage.miniapp', title: '分钟数' }],
    },
    {
      index: 4,
      title: '本地服务端录制',
      children: [
        { to: 'usage.recordingsdk-duration', title: '分钟数' },
        { to: 'usage.recordingsdk-bandwidth', title: '带宽峰值', setting: 'Recording SDK' },
      ],
    },
    {
      index: 5,
      title: '云端录制',
      children: [{ to: 'usage.cloud-recording', title: '分钟数' }],
    },
    {
      index: 6,
      title: '云信令',
      children: [{ to: 'usage.dau', title: '每日活跃用户' }],
    },
    {
      index: 7,
      title: '云市场',
      children: [],
    },
    {
      index: 8,
      title: '白板',
      children: [{ to: 'usage.whiteboard', title: '分钟数' }],
    },
    {
      index: 9,
      title: '输入在线媒体流',
      children: [{ to: 'usage.media-inject', title: '分钟数' }],
    },
    {
      index: 10,
      title: '全链路加速',
      children: [
        { to: 'usage.fpa-chain', title: '实例' },
        { to: 'usage.fpa-flow', title: '流量' },
      ],
    },
    {
      index: 11,
      title: '内容中心',
      children: [{ to: 'usage.content-center', title: '调用次数' }],
    },
    {
      index: 12,
      title: '页面录制',
      children: [{ to: 'usage.page-recording', title: '分钟数' }],
    },
    {
      index: 13,
      title: '融合CDN',
      children: [
        { to: 'usage.cdn-flow', title: '流量' },
        { to: 'usage.cdn-bandwidth', title: '峰值带宽' },
      ],
    },
    {
      index: 14,
      title: '即时通讯IM',
      children: [{ to: 'usage.chat.mau', title: '每月活跃用户' }],
    },
    {
      index: 15,
      title: '云代理',
      children: [{ to: 'usage.cloudProxy.duration', title: '分钟数' }],
    },
    {
      index: 16,
      title: '视频鉴黄',
      children: [{ to: 'usage.content-moderation', title: '图片数' }],
    },
  ],
  AllProject: '全部项目...',
  ProjectPlaceholder: '请输入项目信息',
  all: '全部',
  host: '主播',
  audience: '观众',
  duration: '分钟数 ',
  last7: '过去7天',
  last30: '过去30天',
  currentMonth: '当前月',
  hdp: '超高清视频',
  'Video Full HD': '视频Full HD',
  audio: '语音',
  sd: '视频SD',
  hd: '视频HD',
  minutes: '分钟',
  date: '日期',
  total: '合计',
  UsageEmptyText: '无用量',
  Video2K: '视频2K',
  'Video2K+': '视频2K+',
  remainingMins: '剩余时长',
  packageRemaining: '套餐包预计可用：{amount}分钟（套餐包用量计算约有1-2天延迟）',
  audioRemaining: '音频预计可用: {amount}分钟',
  videoHdRemaining: '视频HD预计可用: {amount}分钟',
  hdPlusRemaining: '视频HD+预计可用: {amount}分钟',
  hd2kRemaining: '视频2K预计可用: {amount}分钟',
  fullHDRemaining: '视频Full HD预计可用: {amount}分钟',
  hd4kRemaining: '视频2K+预计可用: {amount}分钟',
  packageManagement: '套餐包管理',
  packageRemainingTooltip: '可用时长每日更新仅作参考，详情请参见月账单',
  All: '全部',
  Host: '主播',
  Audience: '观众',
  title: '带宽峰值',
  peakText: '带宽峰值',
  totalPeak: '带宽峰值',
  audiencePeak: '观众带宽峰值',
  botPeak: '机器人带宽峰值',
  hostPeak: '主播带宽峰值',
  max: '最大值',
  VideoSD: '视频SD',
  VideoHD: '视频HD',
  VideoHDP: '超清视频',
  AudioNoTrans: '语音 (不转码)',
  Audio: '语音',
  'Interactive Live Streaming Standard': '极速直播',
  avcTotal: '总数',
  avcTotalHostIn: '总连麦数',
  audioHostin: '音频连麦数',
  'H264 Duration': 'H264 总时长',
  'H265 Duration': 'H265 总时长',
  usageTitle: '旁路推流',
  videoSingleHost: '单主播',
  Unenabled: '未开启',
  OpenHint:
    '您需要给当前项目开启 旁路推流服务吗？声网每月10000分钟免费不包括 旁路推流服务，使用可能会触发冻结。更多详情请参考',
  Here: '这里',
  BillingLink: 'https://docs.agora.io/en/faq/billing_free',
  ApplyButton: '开启 旁路推流服务',
  ApplySuccess: '应用成功',
  ConfirmApply: '确认开启',
  UsageTitle: '旁路推流 - 分钟数 - 设置',
  ServerLocation: '发送请求的服务器地址位于',
  Mainland: '中国大陆',
  OtherThanMainland: '非中国大陆',
  Hint1: '当前值为',
  Hint2: '新值为',
  Hint3: '如果需要更多，请联系sales@agora.io',
  MaxChannel: '最大并发频道数',
  Apply: '应用',
  Applying: '正在应用',
  RTMPWarning: '新的最大频道数小于您当前的值。请确认新数值是足够的，否则超出部分 旁路推流请求可能会被拒绝。',
  Continue: '继续',
  DefaultAllocation: '默认分配',
  ApplicableVersions: '版本说明',
  VersionsContent: '推流仅适用于Native SDK 2.4.1、Web SDK 2.9.0及以上版本，若您使用的版本较低，建议升级至新版本。',
  OpenMiniAppHint: '您需要给当前项目开启小程序服务吗？',
  ApplyMiniAppButton: '开启小程序服务',
  MiniAppHint: '* 对小程序计费有疑问？查看计费FAQ。',
  MiniAppTitle: '小程序',
  videoAll: '视频',
  audioAll: '音频',
  MiniAppUsageTitle: '小程序 - 分钟数 - 设置',
  MiniAppWarning: '新的最大频道数小于您当前的值。请确认新数值是足够的，否则超出部分小程序请求可能会被拒绝。',
  MiniAppApplySuccess: '应用成功, 更新后至多需要5分钟生效。',
  DurationTitle: '本地服务端录制',
  maxBandwidth: '带宽峰值',
  Bandwidth: '带宽峰值',
  CloudTitle: '云端录制',
  CloudHint: '* 对云端录制计费有疑问？查看计费FAQ。',
  CloudOpenHint: '您需要为当前项目开启云端录制服务吗？',
  CloudApplyButton: '开启云端录制服务',
  CloudApplySuccess: '云端录制服务成功开启。',
  CloudUsageTitle: '云端录制 - 分钟数',
  CloudPlayerTitle: '输入在线媒体流',
  CloudPlayerHint: '* 对输入在线媒体流计费有疑问？查看',
  CloudPlayerOpenHint: '您需要给当前项目开启输入在线媒体流服务吗？',
  CloudPlayerApplyButton: '开启输入在线媒体流',
  CloudPlayerApplySuccess: '输入在线媒体流成功开启。',
  CloudPlayerUsageTitle: '输入在线媒体流 - 分钟数',
  CloudWarning: '新的最大频道数小于您当前的值。请确认新数值是足够的，否则超出部分请求可能会被拒绝',
  CloudPlayerBillingUrl:
    'https://docs.agora.io/cn/Interactive%20Broadcast/billing_inject_stream_restful?platform=RESTful',
  CloudPlayerSettingHint: '您当前的最大并发频道数是 {maxSubscribeLoad}。如果您需要升级，请联系 sales@agora.io。',
  DAUTitle: '每日活跃用户',
  dau: '每日活跃用户',
  mau: '每月活跃用户',
  MAUTitle: '每月活跃用户',
  WhiteboardUsageTitle: '白板 - 分钟数',
  WhiteboardApplyButton: '开启白板',
  WhiteboardOpenHint: '您需要给当前项目开启白板吗？',
  EnableWhiteboardTitle: '启用白板',
  ContentCenterUsageTitle: '内容中心 - 调用次数',
  'Content Center Duraion': '调用次数',
  EnableWhiteboardDesc: '白板开启后不可关闭，确认开启吗？',
  EnableWhiteboardSuccess: '白板已经启用成功',
  EnableWhiteboardError: '白板启用失败，请稍后再试',
  TableExplain1: '* 最终实际用量需要查看准确帐单列表的账单详情。',
  TableExplain3: '* 对计费有疑问？查看计费FAQ。',
  TableExplain3_Front: '* 对计费有疑问？查看',
  TableExplain3_Doc: '计费FAQ',
  TableExplain3_Tail: '。',
  'Whiteboard duration': '白板分钟数',
  Monthly: '按月',
  'Migrate Netless Projects to Agora.io Console': '迁移Netless项目到声网控制台',
  'Netless Tip 1': '声网和Netless的控制台已经合并了。',
  'Netless Tip 2':
    '我们发现您验证的邮箱地址 “%{email}” 在Netless也注册了帐号。请您确定您是该邮箱的所有者，并同意将所有的Netless项目迁移到声网控制台。点击“迁移”完成操作。',
  'Netless Tip 3': '如果您认为这是一个错误，请点击“取消”并联系 support@agora.io',
  'I confirm that I own this Netless account and agree to the migration': '我确认我是该Netless帐号所有者并同意迁移',
  Migrate: '迁移',
  'Migrate successfully': '迁移成功',
  'Migrate Failed': '迁移失败',
  FailedGetNetlessInfo: '获取白板信息失败',
  'H264 Max Total Concurrent channels': 'H264总并发频道数',
  'H264 Max Total Host-in Concurrent channels': 'H264总连麦',
  'H264 Max Host-in Concurrent channels': 'H264连麦',
  'H265 Max Concurrent channels': 'H265总并发频道数',
  TranscodingUsageTitle: '转码',
  'You can check the usage data collected within 3 months.': '* 您可以查看3个月内所收集的用量数据。',
  'You can check the usage data collected within one year.': '* 您可以查看一年内所收集的用量数据。',
  smallChain: '实例类型-小',
  middleChain: '实例类型-中',
  largeChain: '实例类型-大',
  upstreamTraffic: '上行流量',
  downstreamTraffic: '下行流量',
  sdkUpstreamTraffic: 'SDK上行流量',
  sdkDownstreamTraffic: 'SDK下行流量',
  KTVBillingExplain: '* 对内容中心计费有疑问？查看 ',
  PageRecordingBillingExplain: '* 对页面录制计费有疑问？查看 ',
  ContentModerationBillingExplain: '* 对鉴黄服务计费有疑问？查看 ',
  'billing FAQ': '计费FAQ。',
  KTVBllingUrl: 'https://docs.agora.io/cn/online-ktv/ktv_overview?platform=All%20Platforms#',
  PageRecordingTitle: '页面录制 - 分钟数',
  'Page recording duration': '页面录制分钟数',
  'Page recording billing url': 'https://docs.agora.io/cn/cloud-recording/billing_cloud_recording_web?platform=RESTful',
  FusionCDNFlowTitle: '融合 CDN - 流量',
  FusionCDNBandwidthTitle: '融合 CDN - 峰值带宽',
  FusionCDNHint: '* 对融合CDN计费有疑问？查看',
  FusionCDNBillingUrl: 'https://docs.agora.io/cn/fusion-cdn-streaming/billing_fusion-cdn?platform=RESTful',
  'All Traffic': '全部流量',
  'China Traffic': '中国区流量',
  'Ex-China Traffic': '非中国区流量',
  'All Bandwidth Peak': '全部峰值带宽',
  'China Bandwidth Peak': '中国区峰值带宽',
  'Ex-China Bandwidth Peak': '非中国区峰值带宽',
  '95 Bandwidth Peak': '95 峰值带宽',
  China: '中国区域',
  'Ex-China': '非中国区域',
  sku_udpAudio: '语音',
  sku_udpHd: '视频 HD',
  sku_udp1080p: '视频 Full HD',
  sku_udp2k: '视频 2k',
  sku_udp4k: '视频 2k+',
  sku_tcpAudio: '语音',
  sku_tcpHd: '视频 HD',
  sku_tcp1080p: '视频 Full HD',
  sku_tcp2k: '视频 2k',
  sku_tcp4k: '视频 2k+',
  'Cloud Image Moderation neutral and porn count': '云端图片鉴黄正常和色情张数',
  'Cloud Image Moderation sexy count': '云端图片鉴黄性感张数',
  'Client Image Moderation neutral and porn count': '客户端图片鉴黄正常和色情张数',
  'Image free upload count (moderation)': '图片免费上传张数 （鉴黄模式）',
  'Image upload count (supervision)': '图片上传张数 （监课模式）',
  'Image Moderation peak QPS count': '图片鉴黄峰值QPS张数',
  'Content moderation billing url': '',
  count: '张数',
}

export default UsageI18nCn
