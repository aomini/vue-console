const actions = {
  /**
   * load counter meta from db and then merge into counterTypes
   */
  changeTimeType(context: any, type: any) {
    context.commit('changeTimeType', type)
  },

  updateProjects(context: any, projects: any) {
    context.commit('updateProjects', projects)
  },

  // TODO(sun): gtag ts
  // gtag(context: any, { event: any, event_category: any, event_label: any, value: any }) {
  //   try {
  //     gtag('event', event, {
  //       event_category: event_category,
  //       event_label: event_label,
  //       value: value,
  //     })
  //   } catch (e) {
  //     // console.log( "gtag tracker Error", e )
  //   }
  // },

  updateMinPackagePurchase(context: any, items: any) {
    context.commit('updateMinPackagePurchase', items)
  },

  updateXLAContracts(context: any, contracts: any) {
    context.commit('updateXLAContracts', contracts)
  },

  changeExtensionIframe(context: any, iframeConfig: any) {
    context.commit('changeExtensionIframe', iframeConfig)
  },

  changeBreadcrumb(context: any, routeList: any) {
    context.commit('changeBreadcrumb', routeList)
  },

  changeMenuVerticalCollapse(context: any, isCollapse: boolean) {
    context.commit('changeMenuVerticalCollapse', isCollapse)
  },

  updateOverseaOnboardingStatus(context: any, status: boolean) {
    context.commit('updateOverseaOnboardingStatus', status)
  },
}
export default actions
