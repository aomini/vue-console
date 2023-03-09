// Private module
// import DA from '@agora/data-analysis'
const DA = {
  init: (p) =>{return p},
  event: (p) =>{return p}
}
import Config from '@/config'

type Options = {
  event: string
  category?: string
  event_label?: string
  event_value?: string
  action?: string
  target?: string
  app_id?: string
  payload?: any
}

type User = {
  accountId: number
  companyId: number
  email: string
  firstName: string
  lastName: string
}

const { config } = Config

const DATA_ANALYTICS_CONFIG = {
  client_token: '9450-9451-9452',
  biz_name: 'consoleWebapp',
  disabledRequestEvent: true,
  debug: config.FEATURES.enableDaDebug,
}

export class DataAnalysis {
  private user: User | null = null

  init(user: User) {
    DA.init({
      ...DATA_ANALYTICS_CONFIG,
      user_id: `${user.accountId}`,
    })
    this.user = user
  }

  event(options: Options = {} as Options) {
    const { payload = {} } = options
    DA.event({
      ...options,
      payload: {
        ...payload,
        companyId: this.user?.companyId,
        email: this.user?.email,
        firstName: this.user?.firstName,
        lastName: this.user?.lastName,
      },
    })
  }

  show(options: Options = {} as Options) {
    const { event } = options
    this.event({
      ...options,
      event: `show_${event}`,
      action: 'show',
    })
  }

  click(options: Options = {} as Options) {
    const { event } = options
    this.event({
      ...options,
      event: `click_${event}`,
      action: 'click',
    })
  }
}

export const analysis = new DataAnalysis()
