import Vue from 'vue'
import App from './AppView'
import { prepareRouter } from './router'
import store from './store'
import axios from 'axios'
import { i18n } from './i18n-setup'
import './console-ui/assets/css/index.css'
import * as ElementUI from 'element-ui'
import ConsoleUI from './console-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './filters/index'
import VueClipboard from 'vue-clipboard2'
import 'swiper/dist/css/swiper.css'
import GlobalConfig from './config'
const VueTelInput = require('vue-tel-input')
const VueAwesomeSwiper = require('vue-awesome-swiper')

import VueHighlightJS from 'vue-highlight.js'
import 'vue-highlight.js/lib/allLanguages'
import 'highlight.js/styles/default.css'
import 'windi.css'

Vue.config.productionTip = false

import { Message } from 'element-ui'
import ConsoleButton from './console-ui/components/ConsoleButton'
import ConsoleDrawer from './console-ui/components/Drawer'
Vue.use(ElementUI)
Vue.use(ConsoleUI)
Vue.use(VueClipboard)
Vue.use(VueAwesomeSwiper)
Vue.use(VueTelInput)
Vue.use(VueHighlightJS)
Vue.component('console-button', ConsoleButton)
Vue.component('console-drawer', ConsoleDrawer)

Vue.prototype.$message = Message
Vue.prototype.GlobalConfig = GlobalConfig

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error(error)
    if (error.response.status === 401 && error.response.data.redirect_uri) {
      location.href = error.response.data.redirect_uri
    }
    const info = error.response.data
    const message = info && info.message ? info.message : error.message
    error.message = message
    return Promise.reject(error)
  }
)

Vue.prototype.$http = axios

const launch = async () => {
  const router = await prepareRouter()
  new Vue({
    router,
    store,
    i18n,
    render: (h) => h(App),
  }).$mount('#app')
}

launch()
