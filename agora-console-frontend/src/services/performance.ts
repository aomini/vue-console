// Private module
// import { EventReport } from '@agora/event-report'
import Config from '@/config'

class EventReport {
  init(p) {
    return p
  }
  send(p, p2) {
    return p
  }
}

const { config } = Config
const eventReport = new EventReport()

import { v4 as uuidv4 } from 'uuid'

export enum PerformanceMarkers {}

export enum PerformanceMeasures {}

export enum PerformanceEvents {}

type ReportOptions = {
  vid: number
  companyId: number
  duration?: number
  queryDuration?: number
  scale?: number
  payload?: string
}

class ClientPerformance {
  private onceMap: Record<string, boolean> = {}
  private sessionId = ''

  constructor() {
    this.sessionId = uuidv4()
    eventReport.init({
      biz: 'alabWebapp',
      token: config.eventReportSdkToken,
      debug: config.FEATURES.enableDaDebug,
    })
  }

  // 按照 key, 每个 key 只上报一次
  once(uniqKey: string, reportKey: string, milliseconds: number, options: Partial<ReportOptions> = {}) {
    if (this.onceMap[uniqKey]) {
      return
    }
    this.onceMap[uniqKey] = true
    this.report(reportKey, milliseconds, options)
  }

  report(key: string, milliseconds: number, options: Partial<ReportOptions> = {}) {
    const { vid, companyId, payload, scale, duration, queryDuration } = options
    eventReport.send(9854, {
      sessionId: this.sessionId,
      category: key,
      loadTime: milliseconds,
      id: uuidv4(),
      userAgent: navigator.userAgent,
      url: location.href,
      vid,
      companyId,
      scale,
      duration,
      queryDuration,
      payload: payload ?? '',
      lts: new Date().getTime(),
    })
  }
}

export const clientPerformance = new ClientPerformance()

export const getEntries = (name: string) => {
  const entries = performance.getEntriesByName(name)
  const length = entries.length
  return entries[length - 1]
}
