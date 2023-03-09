import { user } from '@/services/user'
import { i18n } from '@/i18n-setup'
import { Message } from 'element-ui'
import Layout from '@/views/packages/Layout'
import PackageSelectView from '@/views/packages/PackageSelectView'
import PayView from '@/views/packages/PayView'
import MyMinPackageView from '@/views/packages/MyMinPackageView'
import SubscribeView from '@/views/packages/AgoraChat/SubscribeView'
import ManageView from '@/views/packages/AgoraChat/ManageView'

const financePermission = (to: any, from: any, next: any) => {
  if (user.info && user.info.permissions) {
    if (user.info.permissions['FinanceCenter'] > 0 && !user.info.isRoot) {
      next()
      return
    }
  }
  const route = { name: 'overview' }
  Message.warning(i18n.t('NoAuthApply') as string)
  next(route)
}

export const PackageRouter = {
  path: 'packages',
  name: 'packages',
  meta: {
    title: 'Package Management',
    breadcrumb: 'Package',
  },
  redirect: { name: 'package.myMinPackage' },
  components: {
    default: Layout,
  },
  children: [
    {
      path: '/packages/minPackage',
      name: 'package.minPackage',
      meta: {
        title: 'Package Purchase',
        breadcrumb: 'Package Purchase',
      },
      component: PackageSelectView,
    },
    {
      path: '/packages/myMinPackage',
      name: 'package.myMinPackage',
      meta: {
        title: 'Package Management',
        breadcrumb: 'My Package',
      },
      component: MyMinPackageView,
    },
    {
      path: '/packages/minPackage/pay',
      name: 'minPackage.pay',
      meta: {
        title: 'Package Pay',
        breadcrumb: 'Package Pay',
      },
      beforeEnter: financePermission,
      component: PayView,
    },
    {
      path: '/packages/chat',
      name: 'package.chat',
      meta: {
        title: 'Chat',
      },
      beforeEnter: financePermission,
      component: SubscribeView,
    },
    {
      path: '/packages/chat/manage',
      name: 'package.myChatPackage',
      meta: {
        title: 'Chat',
      },
      beforeEnter: financePermission,
      component: ManageView,
    },
    {
      path: '/aa/pricing',
      name: 'package.aaPricing',
      component: () => import('@/views/aa/pricing/redirect'),
      meta: {
        title: 'AA Pricing',
        breadcrumb: 'AA_Pricing_title',
      },
    },
  ],
}
