import { user } from '@/services/user'
import { i18n } from '@/i18n-setup'
import { Message } from 'element-ui'

const xlaPermission = (to: any, from: any, next: any) => {
  if (user.info && user.info.permissions) {
    if (user.info.permissions['XLA'] > 0) {
      next()
      return
    }
  }
  const route = { name: 'overview' }
  Message.warning(i18n.t('NoAuthApply') as string)
  next(route)
}

export const XLARouters = {
  path: '/xla',
  name: 'xla',
  meta: {
    title: 'XLA Report',
    breadcrumb: 'XLA',
  },
  redirect: { name: 'XLAReport' },
  components: {
    default: () => import(/* webpackChunkName: "xla" */ '@/views/xla/Layout'),
  },
  children: [
    {
      path: '/xla/report',
      name: 'XLAReport',
      meta: {
        title: 'XLA Report',
        breadcrumb: 'XLA Report',
      },
      beforeEnter: xlaPermission,
      component: () => import(/* webpackChunkName: "xla" */ '@/views/xla/report/index'),
    },
  ],
}
