import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  template: `
    <div class="submenus">
      <div class="heading-dark-02 submenu-logo">{{ $t('ConsoleTitle') }}</div>
      <el-menu :default-active="activeMenuName" :router="true">
        <el-menu-item-group index="menugroup">
          <span slot="title" class="title"> {{ $t('MemberModuleName') }} </span>
          <template v-for="(item, key) in memberMenus">
            <el-menu-item
              v-if="item && !item.children"
              :index="item.to"
              :key="item.title"
              :route="{ name: item.to }"
              class="vertical-submenus first-submenu"
            >
              <span slot="title"> {{ item.title }} </span>
            </el-menu-item>
          </template>
        </el-menu-item-group>
      </el-menu>
    </div>
  `,
})
export default class Submenu extends Vue {
  memberMenus = [
    { to: 'member.Member', title: this.$t('Member Management') },
    { to: 'member.Role', title: this.$t('Role Management') },
  ]
  activeMenuName: any = ''

  async mounted() {
    for (const key in this.memberMenus) {
      const item = this.memberMenus[key]
      if (this.$route.matched.some((m) => m.name === item.to)) {
        this.activeMenuName = item.to
        return
      }
    }
  }
}
