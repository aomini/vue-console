import Vue from 'vue'
import VueRouter, { RawLocation, Route } from 'vue-router'
import { i18n } from '@/i18n-setup'
import { getUserInfo, user } from '@/services/user'
import { Message } from 'element-ui'
import { routesForCN } from './routesForCN'
import { routesForOversea } from './routesForOversea'

Vue.use(VueRouter)

export function modulePermission(moduleName: string) {
  return async (to: any, from: any, next: any) => {
    const ret = user
    if (!ret.isLogin) return
    const verified = ret.info.verified
    if (!verified) {
      return router.replace({ name: 'overview' })
    }
    const permissions = ret.info.permissions
    if (permissions[moduleName] > 0) {
      next()
      return
    }
    Message.warning(i18n.t('NoAuthApply') as string)
    return router.replace({ name: 'overview' })
  }
}

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes: [],
})

export const prepareRouter = async () => {
  await getUserInfo()
  if (user.info.company.area === 'CN') {
    router.addRoutes(routesForCN)
  } else {
    router.addRoutes(routesForOversea)
  }
  return router
}

router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title)
  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title
  }
  next()
})

router.beforeEach((to, from, next) => {
  // return routerForABTest(to, next)
  next()
})

const VueRouterPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location: RawLocation): Promise<Route> {
  return new Promise((resolve, reject) => {
    VueRouterPush.call(
      this,
      location,
      () => {
        resolve(this.currentRoute)
      },
      (error) => {
        // only ignore NavigationDuplicated error
        if (error.name === 'NavigationDuplicated') {
          resolve(this.currentRoute)
        } else {
          reject(error)
        }
      }
    )
  })
}

// const routerForABTest = function (to: Route, next: NavigationGuardNext<Vue>) {
//   const pageVersion = parseInt(user.info.companyId) % 2 === 1 && user.info.created > 1649349219000 ? 'v1' : 'v0'
//   if (pageVersion === 'v1') {
//     const routerRedirect = routerRedirectList.find((item) => item.v0 === to.name)
//     if (routerRedirect) {
//       return router.replace({ name: routerRedirect[pageVersion], params: to.params })
//     }
//   }
//   next()
// }

export default router
