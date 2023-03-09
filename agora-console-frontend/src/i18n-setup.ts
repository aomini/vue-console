import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import { ConsoleCommonI18NCN } from '@/locales/cn'
import { ConsoleCommonI18NEN } from '@/locales/en'
const ElementLocale = require('element-ui/lib/locale')

Vue.use(VueI18n)

// TODO 请从cookie或者配置中拿默认配置！！!
export const i18n = new VueI18n({
  locale: 'en', // set locale
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  messages: { en: ConsoleCommonI18NEN, cn: ConsoleCommonI18NCN }, // set locale messages
})

// 为了实现element插件的多语言切换
ElementLocale.i18n((key: any, value: any) => i18n.t(key, value))

const loadedLanguages = ['en', 'cn'] // our default language that is preloaded

function setI18nLanguage(lang: string) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  ;(document.querySelector('html') as any).setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync(lang: string) {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      return import(/* webpackChunkName: "lang-[request]" */ `@/locales/${lang}/index`).then((msgs) => {
        i18n.setLocaleMessage(lang, msgs.default)
        loadedLanguages.push(lang)
        return setI18nLanguage(lang)
      })
    }
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}
