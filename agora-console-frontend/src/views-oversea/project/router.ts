import ProjectView from '@/views-oversea/project/ProjectView'
import { modulePermission } from '@/router'
import TokenView from '@/views-oversea/project/TokenView'
import EditProjectView from '@/views-oversea/project/EditProjectView'
import EditWhiteBoardView from '@/views-oversea/project/EditWhiteBoardView'
import FPAView from '@/views-oversea/project/FPA/FPAView'
import EditApaasView from '@/views-oversea/project/EditApaasView'
import ConfigurationView from '@/views-oversea/project/RTMP/ConfigurationView'
import FusionCDNView from '@/views-oversea/project/FusionCDN/FusionCDNView'
import CloudProxyView from '@/views-oversea/project/CloudProxy/CloudProxyView'
import NCSView from '@/views-oversea/project/NCS/NCSView'
import ServiceCreateNew from '@/views-oversea/project/FPA/ServiceCreateNew'
import EditModerationView from '@/views-oversea/project/EditModerationView'
import { extensionIframeRouters } from '@/views-oversea/project/Iframe/router'

export const ProjectRouter = [
  {
    path: 'projects',
    name: 'projects',
    meta: {
      title: 'Project',
    },
    component: ProjectView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'token/:id',
    name: 'token',
    meta: {
      title: 'Token',
    },
    component: TokenView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id',
    name: 'editProject',
    meta: {
      title: 'Edit Project',
    },
    component: EditProjectView,
    props: true,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/whiteboard',
    name: 'whiteboard-config',
    meta: {
      title: 'Whiteboard Configuration',
    },
    component: EditWhiteBoardView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/fpa',
    name: 'FPA',
    meta: {
      title: 'Full-Path Accelerator',
    },
    component: FPAView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/fpa/create',
    name: 'FPACreate',
    meta: {
      title: 'Full-Path Accelerator',
    },
    component: ServiceCreateNew,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/apaas',
    name: 'editApaas',
    meta: {
      title: 'Flexible Classroom Configuration',
    },
    component: EditApaasView,
    props: true,
  },
  {
    path: 'project/:id/rtmp',
    name: 'RTMPConfiguration',
    meta: {
      title: 'Media push configuration',
    },
    component: ConfigurationView,
  },
  {
    path: 'project/:id/moderation',
    name: 'moderation',
    meta: {
      title: 'Content Moderation Configuration',
    },
    component: EditModerationView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/fls',
    name: 'FusionCDN',
    meta: {
      title: 'Fusion CDN',
    },
    component: FusionCDNView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/cdn/create',
    name: 'FusionCDN',
    meta: {
      title: 'Fusion CDN',
    },
    component: FusionCDNView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'project/:id/cloud',
    name: 'CloudProxyConfiguration',
    meta: {
      title: 'Cloud Proxy Configuration',
    },
    component: CloudProxyView,
  },
  {
    path: 'project/:id/ncs',
    name: 'NCS',
    meta: {
      title: 'Notification Center Service',
    },
    component: NCSView,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  ...extensionIframeRouters,
]
