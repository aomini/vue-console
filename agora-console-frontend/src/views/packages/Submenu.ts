import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import './Package.less'
import { user } from '@/services'

@Component({
  template: `
    <div class="submenus packages">
      <div class="heading-dark-02 submenu-logo">{{ $t('ConsoleTitle') }}</div>
      <el-menu :router="true" active-text-color="#3AB7F8FF" :default-openeds="openids">
        <el-menu-item-group index="menugroup">
          <span slot="title" class="title"> {{ $t('Package') }} </span>
          <el-submenu
            :index="item.title + '-' + index"
            v-for="(item, index) in packageMenus"
            :key="index"
            v-if="checkPermission(item.title)"
          >
            <span slot="title"> {{ $t(item.title) }} </span>
            <template v-for="sub in item.children">
              <el-menu-item
                :key="sub.to"
                :index="sub.to"
                :route="{ name: sub.to }"
                :class="{ 'is-active': $route.name === sub.to }"
              >
                <span slot="title">{{ sub.title }}</span>
              </el-menu-item>
            </template>
          </el-submenu>
        </el-menu-item-group>
      </el-menu>
    </div>
  `,
})
export default class Submenu extends Vue {
  packageMenus = [
    {
      title: 'Package',
      children: [
        { to: 'package.minPackage', title: this.$t('Purchase Package') },
        { to: 'package.myMinPackage', title: this.$t('My Package') },
      ],
    },
    {
      title: 'Chat',
      children: [
        { to: 'package.chat', title: this.$t('Subscribe') },
        { to: 'package.myChatPackage', title: this.$t('Manage') },
      ],
    },
  ]
  activeMenuName: any = ''
  openids: any = []
  isCN = user.info.company.area === 'CN'

  @Watch('$route')
  onRouteChange(to: any) {
    this.activeMenuName = to.name
  }

  async mounted() {
    this.initMenu()
  }

  initMenu() {
    let index = -1
    for (const key in this.packageMenus) {
      const item = this.packageMenus[key]
      index++
      if (item.children && Object.keys(item.children).length > 0) {
        this.openids.push(item.title + '-' + index)
      }
    }
  }

  checkPermission(name: string) {
    if (name === 'Chat') {
      return !this.isCN
    }

    if (name === 'Package') {
      return this.isCN
    }
    return true
  }
}
