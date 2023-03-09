import Message from './default'
import OverviewI18nCn from '@/locales/cn/Overview'
import ProjectI18nCn from '@/locales/cn/Project'
import ComponentsI18nCn from '@/locales/cn/Components'
import FinanceI18nCn from '@/locales/cn/Finance'
import PaasI18nCn from '@/locales/cn/Paas'
import MessageI18nCn from '@/locales/cn/Message'
import SettingI18nCn from '@/locales/cn/Setting'
import AuthenticationI18nCn from '@/locales/cn/Authentication'
import PackageI18nCn from '@/locales/cn/Package'
import MemberI18nCn from '@/locales/cn/Member'
import UsageI18nCn from '@/locales/cn/Usage'
import AnalyticsI18nCn from '@/locales/cn/Analytics'
import SupportI18nCn from '@/locales/cn/Support'
import LicenseI18nCn from '@/locales/cn/License'
const cnElementLocale = require('element-ui/lib/locale/lang/zh-CN').default

export const ConsoleCommonI18NCN = {
  ...OverviewI18nCn,
  ...ProjectI18nCn,
  ...ComponentsI18nCn,
  ...FinanceI18nCn,
  ...MessageI18nCn,
  ...SettingI18nCn,
  ...Message,
  ...PaasI18nCn,
  ...AuthenticationI18nCn,
  ...PackageI18nCn,
  ...MemberI18nCn,
  ...UsageI18nCn,
  ...AnalyticsI18nCn,
  ...SupportI18nCn,
  ...LicenseI18nCn,
  //放在最后
  ...cnElementLocale,
}
