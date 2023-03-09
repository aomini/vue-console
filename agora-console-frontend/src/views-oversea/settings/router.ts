import { getUserInfo } from '@/services'
// import { i18n } from '@/i18n-setup'
// import { Message } from 'element-ui'
import Submenu from '@/views-oversea/settings/Submenu'
import Layout from '@/views-oversea/settings/Layout'
import { modulePermission } from '@/router'

export const SettingRouters = {
  path: 'settings',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  name: 'settings',
  redirect: { name: 'setting.company' },
  component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/Settings'),
  children: [
    {
      path: 'company',
      name: 'setting.company',
      meta: {
        title: 'Company Info',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/InfoPage'),
    },
    {
      path: 'authentication',
      name: 'setting.authentication',
      meta: {
        title: 'ID authentication',
      },
      component: () =>
        import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/authentication/Authentication'),
    },
    {
      path: 'security',
      name: 'setting.security',
      meta: {
        title: 'Security',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/SecurityPage'),
    },
    {
      path: 'member',
      name: 'setting.member',
      meta: {
        title: 'Member management',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/member/MemberView'),
      beforeEnter: modulePermission('Member&RoleManagement'),
    },
    {
      path: 'role',
      name: 'setting.role',
      meta: {
        title: 'Role management',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/member/RoleView'),
      beforeEnter: modulePermission('Member&RoleManagement'),
    },
    {
      path: 'm_sso',
      name: 'setting.m_sso',
      meta: {
        title: 'SSO Manager',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/settings/SsoManagement'),
      beforeEnter: modulePermission('Member&RoleManagement'),
    },
    {
      path: 'authentication',
      name: 'authentication',
      meta: {
        title: 'Authentication',
      },
      component: () =>
        import(/* webpackChunkName: "message" */ '@/views-oversea/settings/authentication/Authentication'),
      beforeEnter: modulePermission('FinanceCenter'),
    },
    {
      path: 'authentication/person',
      name: 'authenticationPerson',
      meta: {
        title: 'AuthenticationPerson',
      },
      component: () => import(/* webpackChunkName: "message" */ '@/views-oversea/settings/authentication/PersonalAuth'),
      beforeEnter: modulePermission('FinanceCenter'),
    },
    {
      path: 'authentication/enterprise',
      name: 'authenticationEnterprise',
      meta: {
        title: 'AuthenticationEnterprise',
      },
      component: () =>
        import(/* webpackChunkName: "message" */ '@/views-oversea/settings/authentication/EnterpriseAuth'),
      beforeEnter: modulePermission('FinanceCenter'),
    },
  ],
  beforeEnter: async (to: any, from: any, next: any) => {
    const ret: any = await getUserInfo()
    if (
      (to.name === 'setting.authentication' ||
        to.name === 'authenticationPerson' ||
        to.name === 'authenticationEnterprise') &&
      ret.info.isMember
    ) {
      next({ name: 'overview' })
    }
    if (to.name === 'overview' || ret.info.verified) {
      next()
    } else {
      next({ name: 'overview' })
    }
  },
}
