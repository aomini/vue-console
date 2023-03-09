import axios from 'axios'
import { user } from '@/services/user'

let lifeCycleConfig: any
export let accountCashInfo: any

export const getCashInfo = async (force?: boolean) => {
  if (!force && accountCashInfo) return accountCashInfo
  try {
    const ret = await axios.get(`/api/v2/finance/cashInfo`)
    accountCashInfo = ret.data
    return accountCashInfo
  } catch (e) {
    accountCashInfo = {
      accountBalance: 0.0,
      accountCurrency: user.info.company.country === 'CN' ? 'CNY' : 'USD',
      financialStatus: 1,
    }
    return accountCashInfo
  }
}

/**
 * @TODO 建议将此方法与后端接口重构掉，它仅需要财务状态，直接从 company.status 获取即可
 * @returns {Promise<{financialStatus: number}|any>}
 */
export const getLifeCycle = async () => {
  try {
    const ret = await axios.get(`/api/v2/finance/life-cycle`)
    return ret.data
  } catch (e) {
    return { financialStatus: 1 }
  }
}

export const getLifeCycleConfig = async () => {
  try {
    const ret = await axios.get(`/api/v2/finance/life-cycle-config`)
    lifeCycleConfig = ret.data
    return lifeCycleConfig
  } catch (e) {
    return lifeCycleConfig
  }
}
