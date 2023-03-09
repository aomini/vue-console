import VueRouter from 'vue-router'
import { AxiosStatic } from 'axios'
import { Message } from 'element-ui'
import GlobalConfig from './config'

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter
    $http: AxiosStatic
    $message: Message
    GlobalConfig: GlobalConfig
  }
}

declare module 'intro.js'
declare module 'vue-click-outside'

declare namespace _ {}
