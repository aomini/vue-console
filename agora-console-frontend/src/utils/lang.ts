import Cookie from 'js-cookie'

export const getLanguage = () => {
  let locale = Cookie.get('currentLocale')
  if (!locale) {
    const userLang = navigator.language
    locale = userLang === 'zh-CN' ? 'cn' : 'en'
  }
  return locale
}
