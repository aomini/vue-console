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

export enum ConsoleEvents {
  SEARCH = 'Search',
}

type ReportOptions = {
  vid: number
  companyId: number
  accountId: number
  eventName: ConsoleEvents
  payload?: string
}

class ConsoleEventReport {
  private onceMap: Record<string, boolean> = {}
  private sessionId = ''

  constructor() {
    this.sessionId = uuidv4()
    eventReport.init({
      biz: 'consoleWebapp',
      token: config.consoleEventReportSdkToken,
      debug: config.consoleEventDebug,
    })
  }

  // 按照 key, 每个 key 只上报一次
  once(uniqKey: string, reportKey: string, options: Partial<ReportOptions> = {}) {
    if (this.onceMap[uniqKey]) {
      return
    }
    this.onceMap[uniqKey] = true
    this.report(options)
  }

  report(options: Partial<ReportOptions> = {}) {
    console.info('report')
    const { vid, companyId, accountId, payload, eventName } = options
    eventReport.send(9959, {
      trackId: uuidv4(),
      vid,
      companyId,
      accountId,
      eventName,
      payload: payload ?? '',
      lts: new Date().getTime(),
    })
  }
}

export const consoleEventReport = new ConsoleEventReport()
