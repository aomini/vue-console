import components from '@/console-ui/components'

const install = (Vue: any) => {
  components.map((component) => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
}
