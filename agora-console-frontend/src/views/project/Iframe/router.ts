import LayoutView from './LayoutView'
import Submenu from './submenu'
import { modulePermission } from '@/router'

export const extensionIframeRouters = [
  {
    path: 'project/:projectId/extension',
    name: 'IframeView',
    components: {
      default: LayoutView,
      submenu: Submenu,
    },
    props: true,
    beforeEnter: modulePermission('ProjectManagement'),
  },
]
