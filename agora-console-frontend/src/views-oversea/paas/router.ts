import HomeView from './HomeView'
import PayView from './PayView'
import ProjectSettingView from './ProjectSettingView'
import DetailView from './DetailView'
import Layout from '@/views-oversea/paas/LayoutView'
import { user } from '@/services/user'
import { i18n } from '@/i18n-setup'
import { Message } from 'element-ui'
import Submenu from '@/views-oversea/paas/Submenu'
import VendorApplyList from '@/views-oversea/paas/vendorApply/VendorApplyList'
import VendorApply from '@/views-oversea/paas/vendorApply/VendorApply'
// import CNIntroduceView from '@/views-oversea/paas/newProductView/CNIntroduceView'
import LicenseView from '@/views-oversea/paas/newProductView/LicenseView'
import ENIntroduceView from '@/views-oversea/paas/newProductView/ENIntroduceView'

const marketplacePermission = (to: any, from: any, next: any) => {
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

export const PaasRouter = {
  path: 'marketplace',
  name: 'marketplace',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  redirect: { path: '/marketplace/list/all' },
  children: [
    {
      path: '/marketplace/list/:type',
      name: '/marketplace',
      meta: {
        title: 'Extensions Marketplace',
      },
      beforeEnter: marketplacePermission,
      component: HomeView,
    },
    {
      path: '/marketplace/actived/detail',
      meta: {
        title: 'Actived Extensions',
      },
      beforeEnter: marketplacePermission,
      component: DetailView,
    },
    // {
    //   path: '/marketplace/introduce',
    //   meta: {
    //     title: 'Extension Introduce',
    //   },
    //   beforeEnter: marketplacePermission,
    //   component: CNIntroduceView,
    // },
    // {
    //   path: '/marketplace/introduce-new',
    //   meta: {
    //     title: 'Extension Introduce',
    //   },
    //   beforeEnter: marketplacePermission,
    //   component: CNIntroduceView,
    // },
    {
      path: '/marketplace/license/introduce',
      meta: {
        title: 'Extension Introduce',
      },
      beforeEnter: marketplacePermission,
      component: LicenseView,
    },
    {
      path: '/marketplace/license/introduce-new',
      meta: {
        title: 'Extension Introduce',
      },
      beforeEnter: marketplacePermission,
      component: LicenseView,
    },
    {
      path: '/marketplace/extension/introduce',
      meta: {
        title: 'Extension Introduce',
      },
      beforeEnter: marketplacePermission,
      component: ENIntroduceView,
    },
    {
      path: '/marketplace/extension/introduce-new',
      meta: {
        title: 'Extension Introduce',
      },
      beforeEnter: marketplacePermission,
      component: ENIntroduceView,
    },
    {
      path: '/marketplace/extension/detail',
      meta: {
        title: 'Extension detail',
      },
      beforeEnter: marketplacePermission,
      component: DetailView,
    },
    {
      path: '/marketplace/pay',
      meta: {
        title: 'Extension Pay',
      },
      beforeEnter: marketplacePermission,
      component: PayView,
    },
    {
      path: '/marketplace/own/:serviceName/setting',
      meta: {
        title: 'Extension Project List',
      },
      beforeEnter: marketplacePermission,
      component: ProjectSettingView,
    },
    {
      path: '/marketplace/apply/list',
      meta: {
        title: 'My Apply',
      },
      beforeEnter: marketplacePermission,
      component: VendorApplyList,
    },
    {
      path: '/marketplace/apply',
      meta: {
        title: 'New Apply',
      },
      name: 'ApplyDetail',
      beforeEnter: marketplacePermission,
      component: VendorApply,
    },
  ],
}
