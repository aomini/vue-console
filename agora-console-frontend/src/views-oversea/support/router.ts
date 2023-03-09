import RedirectTicketView from '@/views-oversea/support/RedirectTicketView'
import PlanView from '@/views-oversea/support/PlanView'
import PayView from '@/views-oversea/support/PayView'

export const TicketRouters = [
  {
    name: 'support',
    path: '/support',
    component: RedirectTicketView,
  },
  {
    name: 'ticket',
    path: '/support/ticket/:id',
    component: RedirectTicketView,
  },
  {
    name: 'tickets',
    path: '/support/tickets',
    component: RedirectTicketView,
  },
  {
    name: 'newTicket',
    path: '/support/newTicket/:id',
    component: RedirectTicketView,
  },
  {
    name: 'plan',
    path: '/support/plan',
    component: PlanView,
  },
  {
    name: 'pay',
    path: '/support/pay',
    component: PayView,
  },
]
