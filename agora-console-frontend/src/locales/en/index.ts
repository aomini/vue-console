import Message from './default'
import OverviewI18nEn from '@/locales/en/Overview'
import ProjectI18nEn from '@/locales/en/Project'
import ComponentsI18nEn from '@/locales/en/Components'
import FinanceI18nEn from '@/locales/en/Finance'
import PaasI18nEn from '@/locales/en/Paas'
import MessageI18nEn from '@/locales/en/Message'
import SettingI18nEn from '@/locales/en/Setting'
import AuthenticationI18nEn from '@/locales/en/Authentication'
import PackageI18nEn from '@/locales/en/Package'
import UsageI18nEn from '@/locales/en/Usage'
import AnalyticsI18nEn from '@/locales/en/Analytics'
import MemberI18nEn from '@/locales/en/Member'
import SupportI18nEn from '@/locales/en/Support'
import LicenseI18nEn from '@/locales/en/License'
const enElementLocale = require('element-ui/lib/locale/lang/en').default

export const ConsoleCommonI18NEN = {
  ...OverviewI18nEn,
  ...ProjectI18nEn,
  ...ComponentsI18nEn,
  ...FinanceI18nEn,
  ...MessageI18nEn,
  ...SettingI18nEn,
  ...AuthenticationI18nEn,
  ...Message,
  ...PaasI18nEn,
  ...PackageI18nEn,
  ...MessageI18nEn,
  ...UsageI18nEn,
  ...AnalyticsI18nEn,
  ...MemberI18nEn,
  ...SupportI18nEn,
  ...LicenseI18nEn,
  //放在最后
  ...enElementLocale,
}
