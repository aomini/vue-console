import { getUserInfo } from '@/services'
import Submenu from '@/views-oversea/license/Submenu'
import Layout from '@/views-oversea/license/Layout'

export const LicenseRouters = {
  path: 'license',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  name: 'license',
  redirect: { name: 'license.usage' },
  children: [
    {
      path: 'usage',
      name: 'license.usage',
      meta: {
        title: 'License Usage',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/license/usage/usage'),
    },
    {
      path: 'purchase',
      name: 'license.purchase',
      meta: {
        title: 'Purchase History',
      },
      component: () => import(/* webpackChunkName: "settings" */ '@/views-oversea/license/purchase/purchase'),
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
