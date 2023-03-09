import { RouteConfig } from 'vue-router/types/router'
import EditProjectView from '@/views/projectV1/EditProjectView'
import AgoraChatView from '@/views/project/AgoraChat/AgoraChatView'
import { modulePermission } from '@/router/index'

// 用于 AB test 各版本的路由
export const RoutersV1: RouteConfig[] = [
  {
    path: 'v1/project/:id',
    name: 'editProjectV1',
    meta: {
      title: 'Edit Project',
    },
    component: EditProjectView,
    props: true,
    beforeEnter: modulePermission('ProjectManagement'),
  },
  {
    path: 'v1/project/:id/chat',
    name: 'Chat',
    meta: {
      title: 'Agora Chat',
    },
    component: AgoraChatView,
  },
]

interface routerRedirectConfig {
  v0: string
  [version: string]: string
}

export const routerRedirectList: routerRedirectConfig[] = [
  {
    v0: 'editProject',
    v1: 'editProjectV1',
  },
]
