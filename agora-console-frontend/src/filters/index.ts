import Vue from 'vue'
import moment from 'moment'

Vue.filter('formatMoney', function (value: undefined | number | string, currency: string) {
  if (value === undefined) return ''
  if (!currency) currency = '$'
  if (currency === 'USD') currency = '$'
  if (currency === 'CNY') currency = '¥'
  if (!value) value = 0
  return (
    currency +
    ' ' +
    Number(value)
      .toFixed(2)
      .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
  )
})

Vue.filter('UTC', function (value: any) {
  if (!value) return ''
  return moment.utc(value).local()
})

Vue.filter('formatUsage', function (value: any, type: string) {
  if (!value) return '0'
  let minute: number
  if (type === 'bandwidth' || type === 'channels' || type === 'fpa') {
    minute = Math.floor(Number(value))
  } else if (type === 'cdn') {
    minute = Math.round(Number(value) / 1000)
  } else {
    minute = Math.floor(Number(value) / 60)
  }
  return minute.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
})

Vue.filter('formatMin', function (value: any) {
  if (!value) return '0 Min'
  return `${Number(value).toLocaleString()} Min`
})

Vue.filter('formatDate', function (value: any, format: string) {
  if (!value) return ''
  if (!format) format = 'YYYY-MM-DD HH:mm'
  return moment(value).format(format)
})

Vue.filter('formatUTCDate', function (value: any, format: string) {
  if (!value) return ''
  if (!format) format = 'YYYY-MM-DD HH:mm'
  return moment.utc(value).format(format)
})

Vue.filter('formatHtml', function (value: string) {
  const regex = /(<([^>]+)>)|&nbsp;/gi
  return value.replace(regex, '')
})

Vue.filter('formatTimeStamp', (value: number, isTime: any, isDay: any) => {
  let format = 'YYYY/MM/DD HH:mm:ss'
  if (isTime) {
    format = 'HH:mm:ss'
  }
  if (isDay) {
    format = 'YYYY/MM/DD'
  }
  return moment(value * 1000)
    .utc()
    .format(format)
})

Vue.filter('formatTime', (value: moment.MomentInput, format: string | undefined) => {
  if (!value) return ''
  if (!format) {
    format = 'YYYY/MM/DD HH:mm:ss'
  }
  return moment(value).format(format)
})

Vue.filter('formatUTCTime', function (value: moment.MomentInput, format: string | undefined) {
  if (!value) return ''
  if (!format) {
    format = 'YYYY/MM/DD HH:mm:ss'
  }
  return moment.utc(value).format(format)
})

Vue.filter('showLast', (number: string, length: number) => {
  if (!number) return ''
  const format = '*'.repeat(number.length - length)
  if (number) {
    return format + number.slice(-length)
  }
})

Vue.filter('billPeriod', (value: string) => {
  if (!value) return ''
  const tmp = value.split('，')
  const newValue = tmp.map((item) => {
    return item.split('账单')[0].replace('/', '-')
  })
  return newValue.join(',')
})

Vue.filter('billExtra', (value: string, currency: any) => {
  if (!value) return ''
  const tmp = value.split('，')
  const newValue = tmp.map((item) => {
    return item.split('账单')[0] + currency
  })
  return newValue.join(',')
})

Vue.filter('usageBarValue', (value: any) => {
  if (!value) return '0'
  const minute = Math.floor(Number(value) / 60)
  return minute.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
})

Vue.filter('bpsToMbps', (value: any) => {
  if (!value) return '0'
  if (Number(value) % 125000 === 0) {
    return Number(value) / 125000
  } else {
    return Math.round(Number(value) / 125000)
  }
})

Vue.filter('kbpsToMbps', (value: any) => {
  if (!value) return '0'
  if (Number(value) % 1000 === 0) {
    return Number(value) / 1000
  } else {
    return Math.round(Number(value) / 1000)
  }
})

Vue.filter('formatPeakNum', (value: any) => {
  if (!value) return '0'
  const minute = Math.floor(Number(value))
  return minute.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
})
