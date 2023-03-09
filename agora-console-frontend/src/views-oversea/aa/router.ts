export const AARouters = {
  path: '/analytics',
  components: {
    default: () => import(/* webpackChunkName: "aa" */ '@/views/aa/layout'),
  },
  name: 'analytics',
  redirect: { name: 'call-list' },
  children: [
    {
      path: 'call/search',
      name: 'call-list',
      meta: {
        title: 'Call Research',
      },
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'call/qoe',
      name: 'aa-qoe',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'call/e2e',
      name: 'aa-e2e',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'call/sender',
      name: 'aa-sender',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    // 新通话调查3.0路由
    {
      path: 'call/:callId',
      name: 'aa-detail',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'calls/:callId',
      name: 'aa-detail-2',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'calls/:callId/qoe',
      name: 'aa-detail-qoe',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'calls/:callId/overall',
      name: 'aa-detail-overall',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'calls/:callId/diagnosis',
      name: 'aa-detail-diagnosis',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: '/insights/usage',
      name: 'insights.usage',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: '/insights/quality',
      name: 'insights.quality',
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: '/notification',
      name: 'AA_Notification',
      component(resolve: any) {
        require(['@/views/aa/alab-entries'], resolve)
      },
    },
    {
      path: '/realtime/monitoring',
      name: 'AA_RealtimeMonitoring',
      component(resolve: any) {
        require(['@/views/aa/alab-entries'], resolve)
      },
    },
    {
      path: '/fpa/overview',
      name: 'fpa.overview',
      component(resolve: any) {
        require(['@/views/aa/alab-entries'], resolve)
      },
    },
    {
      path: '/cdn/player/overview',
      name: 'cdn.viewExperience',
      component(resolve: any) {
        require(['@/views/aa/alab-entries'], resolve)
      },
    },
    {
      path: '/cdn/stream-pushing/quality',
      name: 'cdn.streamPushing',
      component(resolve: any) {
        require(['@/views/aa/alab-entries'], resolve)
      },
    },
  ],
}

export const APaaSRouter = {
  path: '/courses',
  components: {
    default: () => import(/* webpackChunkName: "aa" */ '@/views/aa/layout'),
  },
  name: 'course',
  redirect: { name: 'course-list' },
  children: [
    {
      path: 'search',
      name: 'course-list',
      meta: {
        title: 'Course Research',
      },
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'detail',
      name: 'course-detail',
      meta: {
        title: 'Course Detail',
      },
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
  ],
}

export const AgoraChatRouter = {
  path: '/agora-chat/data-insight',
  components: {
    default: () => import(/* webpackChunkName: "aa-agorachat" */ '@/views/aa/layout'),
  },
  name: 'agora-chat',
  redirect: { name: 'agora-chat-data-insight-usage' },
  children: [
    {
      path: 'usage',
      name: 'agora-chat-data-insight-usage',
      meta: {
        title: 'Data Insight Usage',
      },
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
    {
      path: 'quality',
      name: 'agora-chat-data-insight-quality',
      meta: {
        title: 'Data Insight Quality',
      },
      component(resolve: any) {
        require(['@/views/aa/alab-entries/index'], resolve)
      },
    },
  ],
}
