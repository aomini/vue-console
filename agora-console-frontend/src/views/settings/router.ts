import { getUserInfo } from '@/services'
// import { i18n } from '@/i18n-setup'
// import { Message } from 'element-ui'
import Submenu from '@/views/settings/Submenu'
import Layout from '@/views/settings/Layout'
import { modulePermission } from '@/router'

export const SettingRouters = {
  path: 'settings',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  name: 'settings',
  meta: {
    breadcrumb: 'settings',
  },
  redirect: { name: 'setting.company' },
  component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/Settings'),
  children: [
    {
      path: 'company',
      name: 'setting.company',
      meta: {
        title: 'Company Info',
        breadcrumb: 'CompanyInformation',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/InfoPage'),
    },
    {
      path: 'authentication',
      name: 'setting.authentication',
      meta: {
        title: 'ID authentication',
        breadcrumb: 'AuthPageTitle',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/authentication/Authentication'),
    },
    {
      path: 'security',
      name: 'setting.security',
      meta: {
        title: 'Security',
        breadcrumb: 'Security',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/SecurityPage'),
    },
    {
      path: 'member',
      name: 'setting.member',
      meta: {
        title: 'Member Management',
        breadcrumb: 'Member Management',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/member/MemberView'),
      beforeEnter: modulePermission('Member&RoleManagement'),
    },
    {
      path: 'role',
      name: 'setting.role',
      meta: {
        title: 'Role Management',
        breadcrumb: 'Role Management',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/member/RoleView'),
      beforeEnter: modulePermission('Member&RoleManagement'),
    },
    {
      path: 'm_sso',
      name: 'setting.m_sso',
      meta: {
        title: 'SSO Manager',
        breadcrumb: 'SSO Manager',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/settings/SsoManagement'),
      beforeEnter: modulePermission('Member&RoleManagement'),
    },
    {
      path: 'authentication',
      name: 'authentication',
      meta: {
        title: 'Authentication',
      },
      component: () => import(/* webpackChunkName: "message" */ '@/views/settings/authentication/Authentication'),
      beforeEnter: modulePermission('FinanceCenter'),
    },
    {
      path: 'authentication/person',
      name: 'authenticationPerson',
      meta: {
        title: 'AuthenticationPerson',
        breadcrumb: 'PersonalAuth',
      },
      component: () => import(/* webpackChunkName: "message" */ '@/views/settings/authentication/PersonalAuth'),
      beforeEnter: modulePermission('FinanceCenter'),
    },
    {
      path: 'authentication/enterprise',
      name: 'authenticationEnterprise',
      meta: {
        title: 'AuthenticationEnterprise',
        breadcrumb: 'EnterpriseAuth',
      },
      component: () => import(/* webpackChunkName: "message" */ '@/views/settings/authentication/EnterpriseAuth'),
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
