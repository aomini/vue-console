import axios from 'axios'

export interface User {
  isLogin: boolean
  info: {
    [key: string]: any
  }
}
export const user: User = {
  isLogin: false,
  info: {},
}

export const getUserInfo = async () => {
  try {
    const ret = await axios.get(`/api/v2/userInfo`)
    user.isLogin = true
    user.info = ret.data
    if (user.info.firstName && user.info.lastName) {
      user.info.displayName = user.info.firstName + ' ' + user.info.lastName
    } else if (user.info.firstName) {
      user.info.displayName = user.info.firstName
    } else if (user.info.lastName) {
      user.info.displayName = user.info.lastName
    } else {
      const email = user.info.email
      user.info.displayName = email.substring(0, email.indexOf('@'))
    }

    if (user.info.language === 'chinese') {
      user.info.locale = 'cn'
    } else {
      user.info.locale = 'en'
    }

    user.info.isCocos = user.info.company.source && user.info.company.source === 2
  } catch (e) {
    user.isLogin = false
    user.info = {}
    location.href = e.response.data.redirect_uri
    return
  }
  return user
}

export const checkLogin = async () => {
  try {
    await axios.post(`/api/v2/check-login`)
  } catch (e) {}
}
