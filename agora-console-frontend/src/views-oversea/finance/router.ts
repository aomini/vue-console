import { user } from '@/services'
import { i18n } from '@/i18n-setup'
import { Message } from 'element-ui'
import Submenu from '@/views-oversea/finance/Submenu'
import Layout from '@/views-oversea/finance/Layout'
import AlipayView from '@/views-oversea/finance/deposit/alipay/AlipayView'
import AliCallback from '@/views-oversea/finance/deposit/callback/AliCallback'
import OfflineView from '@/views-oversea/finance/deposit/offline/OfflineView'
import PricingView from '@/views-oversea/finance/deposit/pricing/PricingView'
import CreditCardView from '@/views-oversea/finance/deposit/creditCard/CreditCardView'
import CreditCardCallback from '@/views-oversea/finance/deposit/callback/CreditCardCallback'
import AddCardView from '@/views-oversea/finance/deposit/creditCard/AddCardView'
import TransactionsView from '@/views-oversea/finance/transactions/TransactionsView'
import WithdrawView from '@/views-oversea/finance/transactions/WithdrawView'
import BillingView from '@/views-oversea/finance/billing/BillingView'
import ReceiptView from '@/views-oversea/finance/receipt/ReceiptView'
import AppiedDetailView from '@/views-oversea/finance/receipt/AppiedDetailView'
import SettingsView from '@/views-oversea/finance/receipt/SettingsView'
import PackageListView from '@/views-oversea/finance/package/PackageListView'

const financePermission = (to: any, from: any, next: any) => {
  if (user.info && user.info.permissions) {
    if (user.info.permissions['FinanceCenter'] > 0 && !user.info.isRoot) {
      next()
      return
    }
  }
  const route = { name: 'overview' }
  Message.warning(i18n.t('NoAuthApply') as string)
  next(route)
}

export const FinanceRouters = {
  path: 'finance',
  components: {
    default: Layout,
    submenu: Submenu,
  },
  name: 'finance',
  redirect: { name: 'finance.alipay' },
  children: [
    {
      path: 'deposit/alipay',
      name: 'finance.alipay',
      meta: {
        title: 'Alipay',
      },
      beforeEnter: financePermission,
      component: AlipayView,
    },
    {
      path: 'deposit/alipay/callback',
      name: 'finance.alipay.callback',
      meta: {
        title: 'Alipay',
      },
      beforeEnter: financePermission,
      component: AliCallback,
    },
    {
      path: 'deposit/offline',
      name: 'finance.offline',
      meta: {
        title: 'Bank Transfer',
      },
      beforeEnter: financePermission,
      component: OfflineView,
    },
    {
      path: 'deposit/pricing',
      name: 'finance.pricing',
      meta: {
        title: 'Pricing',
      },
      beforeEnter: financePermission,
      component: PricingView,
    },
    {
      path: 'deposit/creditcard',
      name: 'finance.creditCard',
      meta: {
        title: 'Credit card',
      },
      beforeEnter: financePermission,
      component: CreditCardView,
    },
    {
      path: 'deposit/creditCard/callback',
      name: 'finance.creditCard.callback',
      meta: {
        title: 'Credit card',
      },
      beforeEnter: financePermission,
      component: CreditCardCallback,
    },
    {
      path: 'deposit/addcard',
      name: 'finance.addCard',
      meta: {
        title: 'Add a card',
      },
      beforeEnter: financePermission,
      component: AddCardView,
    },
    {
      path: 'transactions',
      name: 'finance.transactions',
      meta: {
        title: 'Transactions',
      },
      beforeEnter: financePermission,
      component: TransactionsView,
    },
    {
      path: 'withdraw',
      name: 'finance.withdraw',
      meta: {
        title: 'Withdraw',
      },
      beforeEnter: financePermission,
      component: WithdrawView,
    },
    {
      path: 'billing',
      name: 'finance.billing',
      meta: {
        title: 'Bills',
      },
      beforeEnter: financePermission,
      component: BillingView,
    },
    {
      path: 'receipt',
      name: 'finance.receipt',
      meta: {
        title: 'Receipt',
      },
      beforeEnter: financePermission,
      component: ReceiptView,
    },
    {
      path: 'receipt/:id/detail',
      name: 'finance.receipt.detail',
      meta: {
        title: 'Receipt Detail',
      },
      beforeEnter: financePermission,
      component: AppiedDetailView,
    },
    {
      path: 'receipt/setting',
      name: 'finance.receipt.setting',
      meta: {
        title: 'Receipt Setting',
      },
      beforeEnter: financePermission,
      component: SettingsView,
    },
    {
      path: 'packages',
      name: 'finance.packages',
      meta: {
        title: 'My Package Subscription',
      },
      beforeEnter: financePermission,
      component: PackageListView,
    },
  ],
}
