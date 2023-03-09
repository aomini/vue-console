import Cookie from 'js-cookie'

const state = {
  curTimeType: Cookie.get('curTimeType') || 'Local',

  projects: null,

  minPackageItems: [],

  xlaContracts: [], // xla 协议列表

  extensionIframeConfig: {
    extensionTitle: '',
    iframeSrc: '',
    iframeMenu: '',
  },

  routeList: [],

  menuVerticalCollapse: false,
  overseaOnboardingOpen: true,
}

export default state
