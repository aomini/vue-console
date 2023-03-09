import Vue from 'vue'
import Component from 'vue-class-component'
const logoUrl = require('@/assets/icon/dev-center-logo.svg')

@Component({
  template: `<div class="row-global-header-container">
    <div class="d-flex">
      <div class="row-global-header-brand" @click="redirect('https://docs.agora.io/en/')">
        <img class="vertical-menu-icon" height="30" :src="logoUrl" />
      </div>
      <el-menu
        class="row-global-header-menu"
        mode="horizontal"
        text-color="#ffffff"
        active-text-color="#ffffff"
        background-color="#000e4b"
      >
        <template>
          <el-menu-item
            v-for="(item, index) of this.menu"
            :key="index"
            :index="item.id"
            @click="redirect(item.link)"
            class="row-global-header-item"
            :class="item.id === 'console' ? 'active' : ''"
          >
            <a class=""> {{ item.label }} </a>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <el-menu
      class="row-global-header-menu"
      mode="horizontal"
      text-color="#ffffff"
      active-text-color="#ffffff"
      background-color="#000e4b"
      default-active="console"
    >
      <template>
        <el-menu-item
          v-for="(item, index) of this.menuLeft"
          :key="index"
          :index="item.id"
          @click="redirect(item.link)"
          class="row-global-header-item"
          :class="item.id === 'console' ? 'active' : ''"
        >
          <a> {{ item.label }} </a>
        </el-menu-item>
      </template>
    </el-menu>
  </div> `,
})
export default class RowGlobalHeader extends Vue {
  logoUrl = logoUrl
  supportUrl = ''
  menu = [
    {
      id: 'docs',
      label: 'Docs',
      link: 'https://docs.agora.io/en',
    },
    {
      id: 'api-reference',
      label: 'API Reference',
      link: 'https://docs.agora.io/en/api-reference/',
    },
    {
      id: 'sdks',
      label: 'SDKs',
      link: 'https://docs.agora.io/en/sdks?platform=android',
    },
    {
      id: 'help',
      label: 'Help',
      link: 'https://docs.agora.io/en/help/',
    },
  ]

  menuLeft = [
    {
      id: 'console',
      label: 'Console',
      link: 'https://console.agora.io/',
    },
  ]

  mounted() {
    this.setSupportUrl()
  }

  redirect = (link: string) => {
    window.open(link, '_blank')
  }

  async setSupportUrl() {
    const res = await this.$http.get('/api/v2/support/url')
    this.supportUrl = res.data
  }
}
