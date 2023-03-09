import Cookie from 'js-cookie'

const mutations = {
  changeTimeType(state: any, data: any) {
    Cookie.set('curTimeType', data)
    state.curTimeType = data
  },

  updateProjects(state: any, projects: any) {
    state.projects = projects
  },

  updateMinPackagePurchase(state: any, items: any) {
    state.minPackageItems = items
  },

  updateXLAContracts(state: any, contracts: any) {
    state.xlaContracts = contracts
  },

  changeExtensionIframe(state: any, iframeConfig: any) {
    state.extensionIframeConfig = Object.assign({}, iframeConfig)
  },

  changeBreadcrumb(state: any, routeList: any) {
    state.routeList = routeList
  },

  changeMenuVerticalCollapse(state: any, isCollapse: boolean) {
    state.menuVerticalCollapse = isCollapse
  },

  updateOverseaOnboardingStatus(state: any, status: boolean) {
    state.overseaOnboardingOpen = status
  },
}

export default mutations
