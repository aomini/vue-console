import { RouteConfig } from 'vue-router/types/router'
import router, { modulePermission } from '@/router/index'
import LayoutView from '@/views/layout/LayoutView'
import { loadLanguageAsync } from '@/i18n-setup'
import OnboardingInviteView from '@/views/onboarding/invite/LayoutView'
import VerifyEmail from '@/views/verify/VerifyEmail'
import { analysis, checkLogin, getUserInfo, user } from '@/services'
import Overview from '@/views/overview/Overview'
import OnboardingView from '@/views/onboardingNew/OnboardingView'
import { ProjectRouter } from '@/views/project/router'
import { TicketRouters } from '@/views/support/router'
import { FinanceRouters } from '@/views/finance/router'
import { UsageRouters } from '@/views/usage/router'
import { AARouters, AgoraChatRouter, APaaSRouter } from '@/views/aa/router'
import { XLARouters } from '@/views/xla/router'
import { PackageRouter } from '@/views/packages/router'
import { PaasRouter } from '@/views/paas/router'

import { SettingRouters } from '@/views/settings/router'
import { LicenseRouters } from '@/views/license/router'
import { RoutersForPureMode } from '@/router/routesForPureMode'
;(FinanceRouters as RouteConfig).beforeEnter = modulePermission('FinanceCenter')

export const routesForCN: Array<RouteConfig> = [
  {
    path: '/invite',
    name: 'invite',
    meta: {
      title: 'Welcome to Agora',
    },
    beforeEnter: async (to, from, next) => {
      if (navigator.language.includes('zh')) {
        loadLanguageAsync('cn')
      } else {
        loadLanguageAsync('en')
      }
      next()
    },
    component: OnboardingInviteView,
  },
  {
    path: '/verify/email',
    component: VerifyEmail,
    meta: {
      title: 'Verify Email',
    },
    beforeEnter: async (to, from, next) => {
      if (navigator.language.includes('zh')) {
        loadLanguageAsync('cn')
      } else {
        loadLanguageAsync('en')
      }
      next()
    },
  },
  {
    path: '/',
    component: LayoutView,
    beforeEnter: async (to, from, next) => {
      await checkLogin()
      const ret: any = await getUserInfo()
      analysis.init(ret.info)

      if ((window as any).gtag) {
        ;(window as any).gtag('config', 'UA-57262777-1', {
          user_id: ret.info.accountId,
          custom_map: {
            dimension2: 'acc_id',
            dimension3: 'com_id',
          },
          com_id: ret.info.companyId,
          acc_id: ret.info.accountId,
        })
      }

      if ((window as any).satismeter) {
        ;(window as any).satismeter({
          writeKey: 'SYO4oPN207CdadUV',
          userId: ret.info.companyId,
          traits: {
            name: ret.info.firstName + ' ' + ret.info.lastName,
            email: ret.info.email,
          },
        })
      }

      if (ret.isLogin) {
        if (ret.info.language === 'chinese') {
          loadLanguageAsync('cn')
        } else {
          loadLanguageAsync('en')
        }
        if (to.name === 'overview' || to.name === 'basic-info' || ret.info.verified) {
          next()
        } else {
          next({ name: 'overview' })
        }
      }
    },
    children: [
      {
        path: '',
        name: 'overview',
        meta: {
          title: 'Overview',
        },
        component: Overview,
      },
      {
        path: 'onboarding',
        name: 'onboarding',
        meta: {
          title: 'Onboarding',
        },
        component: OnboardingView,
      },
      ...ProjectRouter,
      ...TicketRouters,
      FinanceRouters,
      UsageRouters,
      AARouters,
      APaaSRouter,
      AgoraChatRouter,
      XLARouters,
      PackageRouter,
      PaasRouter,
      SettingRouters,
      LicenseRouters,
      {
        path: 'restfulApi',
        name: 'restfulApi',
        meta: {
          title: 'RESTful API',
          breadcrumb: 'RESTful API',
        },
        beforeEnter: (to, from, next) => {
          const ret = user
          const verified = ret.info.verified
          const hasPermission = !ret.info.isMember || ret.info.permissions['ProjectManagement'] > 1
          if (!verified || !hasPermission) {
            return router.replace({ name: 'overview' })
          }
          next()
        },
        component: () => import(/* webpackChunkName: "restfulApi" */ '@/views/restfulAPI/RestfulAPI'),
      },
      {
        path: 'credentials',
        name: 'credentials',
        meta: {
          title: 'Credentials',
        },
        beforeEnter: (to, from, next) => {
          const ret = user
          const verified = ret.info.verified
          if (!verified) {
            return router.replace({ name: 'overview' })
          }
          next()
        },
        component: () => import(/* webpackChunkName: "credentials" */ '@/views/aa/credentials'),
      },
      {
        path: 'message',
        name: 'message',
        meta: {
          title: 'Message',
          breadcrumb: 'Message',
        },
        beforeEnter: (to, from, next) => {
          const ret = user
          const verified = ret.info.verified
          if (!verified) {
            return router.replace({ name: 'overview' })
          }
          next()
        },
        component: () => import(/* webpackChunkName: "message" */ '@/views/message/MessageCenter'),
      },
      {
        path: 'settings/notification',
        name: 'notification',
        meta: {
          title: 'Notification',
          breadcrumb: 'Notification preference',
        },
        component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/NotificationsPage'),
        beforeEnter: async (to, from, next) => {
          const ret: any = await getUserInfo()
          if (to.name === 'overview' || to.name === 'basic-info' || ret.info.verified) {
            next()
          } else {
            next({ name: 'overview' })
          }
        },
      },
      {
        path: 'packages/aa/pay',
        name: 'aaPackage.pay',
        meta: {
          title: 'Package Pay',
        },
        beforeEnter: modulePermission('FinanceCenter'),
        component: () => import(/* webpackChunkName: "marketplace" */ '@/views/aa/package/Pay'),
      },
      // ...RoutersV1,
    ],
  },
  {
    path: '*',
    redirect: '/',
  },
  ...RoutersForPureMode,
]
