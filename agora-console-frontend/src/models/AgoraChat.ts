export const DataCenterOptions = ['CN1', 'SGP1', 'US1', 'DE1']

export enum PlanType {
  'FREE' = 'FREE',
  'STARTER' = 'STARTER',
  'PRO' = 'PRO',
  'ENTERPRISE' = 'ENTERPRISE',
}

export type PushProvider = 'HUAWEI' | 'XIAOMI' | 'OPPO' | 'VIVO' | 'MEIZU' | 'APPLE' | 'GOOGLE'

export interface PushProviderModel {
  provider: PushProvider
  name?: string
  package_name?: string
  environment?: 'PRODUCTION' | 'DEVELOPMENT'
  push_app_key?: string
  push_app_id?: string
  push_app_secret?: string
  push_app_certificate?: string
}
export const PushProvidersCN: PushProviderModel[] = [
  { provider: 'GOOGLE', name: '', push_app_id: '', push_app_key: '' },
  {
    provider: 'APPLE',
    name: '',
    push_app_id: '',
    push_app_secret: '',
    push_app_certificate: '',
    push_app_key: '',
    environment: 'DEVELOPMENT',
  },
  { provider: 'HUAWEI', name: '', push_app_id: '', push_app_secret: '', package_name: '' },
  { provider: 'XIAOMI', name: '', push_app_id: '', push_app_secret: '', package_name: '' },
  { provider: 'OPPO', name: '', push_app_key: '', push_app_secret: '', package_name: '' },
  { provider: 'VIVO', name: '', push_app_id: '', push_app_key: '', push_app_secret: '', package_name: '' },
  { provider: 'MEIZU', name: '', push_app_id: '', push_app_secret: '', package_name: '' },
]

export const PushProvidersEN: PushProviderModel[] = [
  { provider: 'GOOGLE', name: '', push_app_id: '', push_app_key: '' },
  {
    provider: 'APPLE',
    name: '',
    push_app_id: '',
    push_app_secret: '',
    push_app_certificate: '',
    push_app_key: '',
    environment: 'DEVELOPMENT',
  },
]

export const APIUrl = {
  CN1: {
    'REST API': ['a11.chat.agora.io '],
    WebSocket: ['msync-api-11.chat.agora.io'],
    'Mini APP': ['api-wechat-11.chat.agora.io'],
    'Alipay APP': ['api-alipay-11.chat.agora.io'],
  },
  HK: {
    'REST API': ['a11.chat.agora.io '],
    WebSocket: ['msync-api-11.chat.agora.io'],
    'Mini APP': ['api-wechat-11.chat.agora.io'],
    'Alipay APP': ['api-alipay-11.chat.agora.io'],
  },
  SG1: {
    'REST API': ['a61.chat.agora.io'],
    WebSocket: ['msync-api-61.chat.agora.io'],
  },
  SGP1: {
    'REST API': ['a61.chat.agora.io'],
    WebSocket: ['msync-api-61.chat.agora.io'],
  },
  US1: {
    'REST API': ['a41.chat.agora.io'],
    WebSocket: ['msync-api-41.chat.agora.io'],
  },
  DE1: {
    'REST API': ['a71.chat.agora.io'],
    WebSocket: ['msync-api-71.chat.agora.io'],
  },
}

export const MessageTypeOptions = ['TEXT', 'IMAGE', 'VIDEO', 'VOICE', 'LOCATION', 'FILE']

export interface ChatSubscription {
  index: string
  title: string
  childrens: Record<string, any>[]
}

export interface ChatDescriptionModel {
  description: string
  [p: string]: string
}

export interface ChatFullDescription {
  [p: string]: {
    type: string
    title: string
    childrens: Record<string, ChatDescriptionModel>
  }
}

export const ChatSubscriptionsCN: ChatSubscription[] = [
  {
    index: 'User',
    title: '用户',
    childrens: [
      { description: '用户好友人数', FREE: 100, STARTER: 3000, PRO: 'unlimited', ENTERPRISE: 'unlimited' },
      {
        description: '注册用户总数',
        FREE: 100,
        STARTER: 'unlimited',
        PRO: 'unlimited',
        ENTERPRISE: 'unlimited',
      },
      {
        description: '同时在线用户数',
        FREE: 100,
        STARTER: 'unlimited',
        PRO: 'unlimited',
        ENTERPRISE: 'unlimited',
      },
      {
        description: '用户属性（提供用户头像、昵称、邮箱等数据存储服务）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Message',
    title: '消息',
    childrens: [
      {
        description: '消息云存储（提供消息的存储服务，支持历史消息、漫游消息、离线消息）',
        FREE: '3 days',
        STARTER: '7 days',
        PRO: '90 days',
        ENTERPRISE: '180 days',
      },
      {
        description: '全消息类型（包括：文本、表情、语音、视频、图片、位置、透传、自定义等消息）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '视频消息（不额外收费）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '自定义消息（根据业务需求灵活定制消息内容和功能）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '透传消息（作为控制指令）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '离线消息（支持单聊/群聊离线消息，上线后可拉取离线消息）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Group',
    title: '群组',
    childrens: [
      {
        description: '群组总数',
        FREE: '100',
        STARTER: '10万',
        PRO: 'unlimited',
        ENTERPRISE: 'unlimited',
      },
      {
        description: '群成员数',
        FREE: '100',
        STARTER: '300',
        PRO: '3000',
        ENTERPRISE: '8000',
      },
      {
        description: '用户可加入群组数',
        FREE: '100',
        STARTER: '600',
        PRO: 'unlimited',
        ENTERPRISE: 'unlimited',
      },
    ],
  },
  {
    index: 'Chat',
    title: '聊天室（hot）',
    childrens: [
      {
        description: '实时互动聊天室数量（支持大型直播场景）',
        FREE: 'unchecked',
        STARTER: '100',
        PRO: 'unlimited',
        ENTERPRISE: 'unlimited',
      },
      {
        description: '实时互动聊天室广播消息',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '实时互动聊天室全局禁言',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '实时互动聊天室消息优先级',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '实时互动聊天室用户白名单',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '实时互动聊天室历史消息存储',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Feature',
    title: '功能特性',
    childrens: [
      {
        description: 'VIP集群（高SLA保障，50%集群冗余度，为业务安全保驾护航）',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'unchecked',
        ENTERPRISE: 'checked',
      },
      {
        description: '消息&事件回调（提供全量消息路由转发，支持消息和多种事件类型）',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '用户状态回调（通过回调方式同步用户离在线状态）',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '发送前回调（用于对接第三方消息审核服务）',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '多端多设备在线（支持不同设备同时在线，消息同步接收）',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '消息已读回执（单聊回执均支持，群聊回执专业版以上支持）',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '消息撤回（支持客户端/Rest消息撤回）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '消息免打扰（在设置免打扰时间内不收推送消息）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '服务端会话列表（WEB端拉取历史会话）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'IM&Call UIkit(提供IM和RTC UI组件）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '全平台离线推送（支持苹果、谷歌、华为、小米、OPPO、VIVO、魅族，自定义铃声和扩展）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Network',
    title: '网络（hot）',
    childrens: [
      {
        description: '全球加速网络（SD-GMN，全球5大数据中心、200+边缘加速节点）',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'shenhe',
    title: '内容审核（hot）',
    childrens: [
      {
        description: '基础敏感词服务',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '高级版文本审核',
        FREE: '',
        STARTER: '',
        PRO: '',
        ENTERPRISE: '',
      },
      {
        description: '高级版图片审核 (鉴黄·、涉政、暴恐、广告等场景支持）',
        FREE: '',
        STARTER: '',
        PRO: '',
        ENTERPRISE: '',
      },
      {
        description: '高级版语音消息审核',
        FREE: '',
        STARTER: '',
        PRO: '',
        ENTERPRISE: '',
      },
      {
        description: '高级版视频消息审核',
        FREE: '',
        STARTER: '',
        PRO: '',
        ENTERPRISE: '',
      },
    ],
  },
  {
    index: 'restful',
    title: 'REST运营服务',
    childrens: [
      {
        description: 'Rest API调用频率',
        FREE: '10/秒',
        STARTER: '30/秒',
        PRO: '50/秒',
        ENTERPRISE: '200/秒',
      },
      {
        description: '发送系统消息',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '发送单聊消息',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '发送群组消息',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '发送聊天室消息',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '发送全量用户通知',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '封禁用户',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '将用户加入黑名单',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'REST消息撤回',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '查询用户在线状态',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'sdk',
    title: 'SDK支持',
    childrens: [
      {
        description: 'Flutter 端（hot）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: '微信、支付宝、百度、字节、QQ小程序（hot）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Uniapp（支持编译到Android、iOS、各平台小程序）（hot）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Android端',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'iOS端',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Web 端',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'ApiCloud插件',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Linux',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'MacOS（通过Electron实现）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Windows（通过Electron实现）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Server SDK（Java版本）',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'support',
    title: '技术支持',
    childrens: [
      {
        description: '技术支持与保障服务',
        FREE: 'QQ/微信大群技术支持',
        STARTER: '5*8工单\n' + 'QQ/微信大群技术支持',
        PRO: '7*12工单\n' + 'QQ/微信大群技术支持',
        ENTERPRISE: '7*12工单\n' + 'QQ/微信大群技术支持\n' + '7*24紧急技术响应',
      },
    ],
  },
]
export const ChatSubscriptionsEN: ChatSubscription[] = [
  {
    index: 'User',
    title: 'User',
    childrens: [
      { description: 'Number of user friends', FREE: '100', STARTER: '250', PRO: '1000', ENTERPRISE: '10000' },
      {
        description: 'Peak concurrent connection',
        FREE: 10,
        STARTER: '10% of MAU',
        PRO: '10% of MAU',
        ENTERPRISE: 'Custom/Default: 10% of MAU',
      },
    ],
  },
  {
    index: 'Message',
    title: 'Message',
    childrens: [
      {
        description:
          'Message cloud storage (provides message storage services, supports historical messages and offline messages)',
        FREE: '3 days',
        STARTER: '7 days',
        PRO: '90 days',
        ENTERPRISE: 'Default:180days',
      },
      {
        description:
          'All message types (including: text, emoticons, voice, video, pictures, location, transparent transmission, customized messages, etc.)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Custom message (flexibly customize message content and functions according to business needs)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Command message (as a control command)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description:
          'Offline messages (support single chat/group chat offline messages, offline messages can be pulled after going online)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Group',
    title: 'Group',
    childrens: [
      {
        description: 'Total number of groups',
        FREE: '100',
        STARTER: '10000',
        PRO: '50000',
        ENTERPRISE: '100000',
      },
      {
        description: 'Number of group members',
        FREE: '100',
        STARTER: '250',
        PRO: '1000',
        ENTERPRISE: '5000',
      },
      {
        description: 'Number of groups that users can join',
        FREE: '100',
        STARTER: '1000',
        PRO: '2000',
        ENTERPRISE: '10000',
      },
    ],
  },
  {
    index: 'Chatroom',
    title: 'Chatroom',
    childrens: [
      {
        description: 'Number of Chatrrom members',
        FREE: '100',
        STARTER: '2000',
        PRO: '10000',
        ENTERPRISE: 'Custom/Default:20000',
      },
      {
        description: 'Number of Chatrooms that users can join',
        FREE: '100',
        STARTER: '1000',
        PRO: '2000',
        ENTERPRISE: '10000',
      },
      {
        description: 'Real-time interactive chat rooms (support large-scale live broadcast scenarios)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Real-time interactive chat room broadcast messages',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Global muting in real-time interactive chat rooms',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Real-time interactive chat room message priority',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Real-time interactive chat room user whitelist',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Real-time interactive chat room history message storage',
        FREE: 'unchecked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Features',
    title: 'Features',
    childrens: [
      {
        description:
          'Message & event callback (provide full message routing and forwarding, support messages and multiple event types)',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: "User status callback (synchronize the user's offline status through callback)",
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Callback before sending (used to connect to third-party message review services)',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description:
          'Multi-terminal and multi-device online (supporting different devices online at the same time, simultaneous message reception)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description:
          'Message read receipts (single chat receipts are supported, group chat receipts are supported above professional version)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Message recall (support client/REST message recall)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Message Do Not Disturb (no push messages will be received during the set Do Not Disturb time)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Server session list (WEB side pulls historical sessions)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'IM UIkit (provides IM UI components)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Full platform offline push (support Apple(APNS), Google(FCM), custom ringtones and extensions)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Share files and multimedia',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Auto-thumbnail generator',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Offline messaging',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Announcements',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Reactions',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Message thread',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Presence',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Translation',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Moderation',
    title: 'Moderation',
    childrens: [
      {
        description: 'Message report',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'User blocking',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Mute user',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Moderation dashboard',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Freeze group & chatroom',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'WordList filter',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Text moderation',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Image moderation',
        FREE: 'unchecked',
        STARTER: 'unchecked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Data Analytics',
    title: 'Data Analytics',
    childrens: [
      {
        description: 'Analytics dashboard（beta)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Security',
    title: 'Security',
    childrens: [
      {
        description: 'TLS/SSL encryption',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'File encryption',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'GDPR API',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'IP whitelisting',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Compliance',
    title: 'Compliance',
    childrens: [
      {
        description: 'ISO27001',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'GDPR',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Network',
    title: 'Network',
    childrens: [
      {
        description: 'Global Acceleration Network (Five data centers, 200+ edge acceleration nodes)',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'Rest API',
    title: 'Rest API',
    childrens: [
      {
        description: 'Rest API call frequency',
        FREE: '500 times/second (api limitaion for all apis request in total)',
        STARTER: '500 times/second (api limitaion for all apis request in total)',
        PRO: '500 times/second (api limitaion for all apis request in total)',
        ENTERPRISE: '500 times/second (api limitaion for all apis request in total)',
      },
    ],
  },
  {
    index: 'sdk',
    title: 'SDK Support',
    childrens: [
      {
        description: 'Android',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'iOS',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Web',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'React Native',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Flutter',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Unity',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
      {
        description: 'Windows ',
        FREE: 'checked',
        STARTER: 'checked',
        PRO: 'checked',
        ENTERPRISE: 'checked',
      },
    ],
  },
  {
    index: 'support',
    title: 'Technical Support',
    childrens: [
      {
        description: 'Technical support and guarantee service',
        FREE: 'View Support Plan',
        STARTER: 'View Support Plan',
        PRO: 'View Support Plan',
        ENTERPRISE: 'View Support Plan',
      },
    ],
  },
]
