import { RouteConfig } from 'vue-router/types/router'
import AgoraChatView from '@/views/project/AgoraChat/AgoraChatView'
import { loadLanguageAsync } from '@/i18n-setup'
import { checkLogin, getUserInfo } from '@/services'

// 用于 AB test 各版本的路由
export const RoutersForPureMode: RouteConfig[] = [
  {
    path: '/chat/application',
    name: 'Chat',
    meta: {
      title: 'Agora Chat',
    },
    beforeEnter: async (to, from, next) => {
      await checkLogin()
      const ret: any = await getUserInfo()
      if (ret.isLogin) {
        if (ret.info.language === 'chinese') {
          loadLanguageAsync('cn')
        } else {
          loadLanguageAsync('en')
        }
      }
      next()
    },
    component: AgoraChatView,
  },
]
