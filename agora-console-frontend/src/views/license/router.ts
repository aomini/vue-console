import { getUserInfo } from '@/services'
import Submenu from '@/views/license/Submenu'
import Layout from '@/views/license/Layout'

export const LicenseRouters = {
  path: 'license',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  name: 'license',
  meta: {
    breadcrumb: 'LicenseTitle',
  },
  redirect: { name: 'license.usage' },
  children: [
    {
      path: 'usage',
      name: 'license.usage',
      meta: {
        title: 'License Usage',
        breadcrumb: 'LicenseUsage',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/license/usage/usage'),
    },
    {
      path: 'purchase',
      name: 'license.purchase',
      meta: {
        title: 'Purchase History',
        breadcrumb: 'LicensePurchase',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/license/purchase/purchase'),
    },
    {
      path: 'quota',
      name: 'license.quota',
      meta: {
        title: 'License Quota',
        breadcrumb: 'LicenseQuotaManage',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views/license/quota/quota'),
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
