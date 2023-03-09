export const validateEmail = (email: string) => {
  const format =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return format.test(String(email).toLowerCase())
}

export const validatePhoneNumber = (number: number) => {
  const format = /^[1-9]\d*$/
  return format.test(String(number).toLowerCase())
}

export const validateNumber = (number: number) => {
  const format = /^[0-9]*$/
  return format.test(String(number).toLowerCase())
}

export const validateSpecialChar = (name: string) => {
  const format = /[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
  return !format.test(String(name))
}

export const validateCompanyName = (name: string) => {
  const format = /["\\<>]/
  return !format.test(String(name)) && name.length <= 100
}

const bannedExtension = [
  'ACTION',
  'APK',
  'APP',
  'BAT',
  'BIN',
  'CMD',
  'COM',
  'COMMAND',
  'CPL',
  'CSH',
  'EXE',
  'GADGET',
  'INF1',
  'INS',
  'INX',
  'IPA',
  'ISU',
  'JOB',
  'JSE',
  'KSH',
  'LNK',
  'MSC',
  'MSI',
  'MSP',
  'MST',
  'OSX',
  'OUT',
  'PAF',
  'PIF',
  'PRG',
  'PS1',
  'REG',
  'RGS',
  'RUN',
  'SCR',
  'SCT',
  'SHB',
  'SHS',
  'U3P',
  'VB',
  'VBE',
  'VBS',
  'VBSCRIPT',
  'WORKFLOW',
  'WS',
  'WSF',
  'WSH',
]

export const checkFileExtension = (fileName: string) => {
  const extension = (fileName.split('.').pop() as any).replace(/\s+/g, '').toUpperCase()
  return bannedExtension.includes(extension)
}

// 身份证校验
// prov
const checkProv = (val: any) => {
  const pattern = /^[1-9][0-9]/
  const provs: any = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
  }
  if (pattern.test(val)) {
    if (provs[val]) {
      return true
    }
  }
  return false
}
// date
const checkDate = (val: string) => {
  const pattern = /^(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)$/
  if (pattern.test(val)) {
    const year = val.substring(0, 4)
    const month = val.substring(4, 6)
    const date = val.substring(6, 8)
    const date2 = new Date(year + '-' + month + '-' + date)
    if (date2 && date2.getMonth() === parseInt(month) - 1) {
      return true
    }
  }
  return false
}

const getLastDigit = (val: string) => {
  let sum = 0
  const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  for (let i = 0; i < 17; i++) {
    sum += Number(val[i]) * factor[i]
  }
  return parity[sum % 11].toString()
}

// code
const checkCode = (val: string) => {
  const p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  const code = val.substring(17)
  if (p.test(val)) {
    if (getLastDigit(val) === code.toUpperCase()) {
      return true
    }
  }
  return false
}

export const checkPersonID = (val: string) => {
  if (val.length === 15) {
    const eighteenCard = val.slice(0, 6) + '19' + val.slice(6)
    val = eighteenCard + getLastDigit(eighteenCard)
  }
  if (checkCode(val)) {
    const date = val.substring(6, 14)
    if (checkDate(date)) {
      if (checkProv(val.substring(0, 2))) {
        return true
      }
    }
  }
  return false
}

// 验证港澳居民来往内地通行证
export const checkHMCard = (val: string) => {
  const pattern = /^([H|h|M|m]\d{6,10}(\(\w{1}\))?)$/
  if (pattern.test(val.trim())) {
    return true
  }
  return false
}

// 验证台湾居民来往内地通行证
export const checkTWCard = (val: string) => {
  const pattern = /^\d{8}|^[a-zA-Z0-9]{10}|^\d{18}$/
  if (pattern.test(val.trim())) {
    return true
  }
  return false
}

// 验证港澳居民居住证
export const checkHMIDCard = (val: string) => {
  const pattern = /^8[12]0000(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dX]$/
  if (pattern.test(val.trim())) {
    return true
  }
  return false
}

// 验证台湾居民居住证
export const checkTWIDCard = (val: string) => {
  const pattern = /^830000(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dX]$/
  if (pattern.test(val.trim())) {
    return true
  }
  return false
}

// 验证社会统一信用代码
export const checkSocialCreditCode = (Code: string) => {
  const patrn = /^[0-9A-Z]+$/
  if (Code.length !== 18 || patrn.test(Code) === false) {
    return false
  } else {
    let Ancode
    let Ancodevalue
    let total = 0
    const weightedfactors = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]
    const str = '0123456789ABCDEFGHJKLMNPQRTUWXY'
    for (let i = 0; i < Code.length - 1; i++) {
      Ancode = Code.substring(i, i + 1)
      Ancodevalue = str.indexOf(Ancode)
      total = total + Ancodevalue * weightedfactors[i]
    }
    let logiccheckcode: any = 31 - (total % 31)
    if (logiccheckcode === 31) {
      logiccheckcode = 0
    }
    const Str = '0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y'
    const ArrayStr = Str.split(',')
    logiccheckcode = ArrayStr[logiccheckcode]
    const checkcode = Code.substring(17, 18)
    if (logiccheckcode !== checkcode) {
      return false
    } else {
      return true
    }
  }
}

export const checkChineseName = (name: string) => {
  const cnReg = /^[\u4e00-\u9fa5]+(·[\u4e00-\u9fa5]+)*$/g
  return cnReg.test(name)
}

export const checkEnglishName = (name: string) => {
  const enReg = /^[A-Za-z]*(\s[A-Za-z]*)*$/g
  return enReg.test(name)
}

export const checkEnterpriseName = (name: string) => {
  const cnReg = /^([\u4e00-\u9fa5]|\(|\)|（|）)+$/g
  return cnReg.test(name)
}

export const checkMoney = (amount: any) => {
  const reg = /^\d+(\.\d{0,2})?$/
  return reg.test(amount)
}

// const signAlgorithm = 'aes-256-ctr'
// const SIGN_IV_LENGTH = 16

// export const encryptToken = (text: string, signKey: string) => {
//   const iv = crypto.randomBytes(SIGN_IV_LENGTH)
//   const cipher = crypto.createCipheriv(signAlgorithm, signKey, iv)
//   let encrypted = cipher.update(text)
//   encrypted = Buffer.concat([encrypted, cipher.final()])
//   return `${iv.toString('hex')}:${encrypted.toString('hex')}`
// }
//
// export const decryptToken = (text: string, signKey: string) => {
//   const textParts = text.split(':')
//   const iv = Buffer.from(textParts.shift() as any, 'hex')
//   const encryptedText = Buffer.from(textParts.join(':'), 'hex')
//   const decipher = crypto.createDecipheriv(signAlgorithm, signKey, iv)
//   let decrypted = decipher.update(encryptedText)
//   decrypted = Buffer.concat([decrypted, decipher.final()])
//   return decrypted.toString()
// }
