import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import './Submenu.less'

@Component({
  template: `<div class="submenus" v-loading="loading">
    <div class="heading-dark-02 submenu-logo">{{ $t('ConsoleTitle') }}</div>
    <el-menu :router="true" :default-openeds="openids" active-text-color="#3AB7F8FF">
      <el-menu-item-group index="financegroup">
        <span slot="title" class="title"> {{ $t('FinanceModuleName') }} </span>
        <template v-for="(item, index) in financeMenus">
          <el-submenu v-if="item && item.children" :index="item.title + '-' + index" :key="index">
            <span slot="title" class="vertical-submenus"> {{ item.title }} </span>
            <el-menu-item
              v-for="sub in item.children"
              v-if="sub"
              :key="sub.to"
              :index="sub.to"
              :class="{ 'is-active': $route.name === sub.to }"
              :route="{ name: sub.to }"
            >
              <span slot="title">{{ sub.title }}</span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item
            v-if="item && !item.children"
            :index="item.to"
            :key="item.to"
            :route="{ name: item.to }"
            class="vertical-submenus first-submenu"
          >
            <span slot="title"> {{ item.title }} </span>
          </el-menu-item>
        </template>
      </el-menu-item-group>
    </el-menu>
  </div>`,
})
export default class Submenu extends Vue {
  financeMenus: any = []
  openids: any = []
  cashInfo: any = {}
  identity: any = {}
  userInfo: any = user.info
  isCocos = user.info.isCocos
  isReseller = !(user.info.company.resellerId === '0')
  loading = false

  async mounted() {
    this.loading = true
    this.financeMenus = this.$t('FinanceMenus')
    let index = -1
    this.cashInfo = await getCashInfo()
    this.cashInfo = this.cashInfo || {}
    await this.getIdentity()
    let showAli = false
    let showCreditCard = false
    let showReceipt = false
    let showPackages = false
    if (this.cashInfo.accountCurrency === 'CNY' && this.userInfo.company.country === 'CN') {
      showAli = true
    }
    if (this.cashInfo.accountCurrency === 'USD' && this.userInfo.company.country !== 'CN') {
      showCreditCard = true
    }
    if (
      this.userInfo.company.source &&
      this.userInfo.company.source !== 2 &&
      this.userInfo.company.country === 'CN' &&
      this.userInfo.permissions['FinanceCenter'] > 0
    ) {
      showReceipt = true
    }
    if (this.userInfo.company.country === 'CN' && !this.isCocos && !this.isReseller) {
      showPackages = true
    }
    for (const key in this.financeMenus) {
      const item = this.financeMenus[key]
      index++
      if (item.to === 'finance.packages' && !showPackages) {
        delete this.financeMenus[key]
        continue
      }
      if (item.children) {
        for (const sub in item.children) {
          if (item.children[sub].to === 'finance.receipt' && (!showReceipt || this.identity.authStatus === -1)) {
            delete item.children[sub]
            break
          }
          if (item.children[sub].to === 'finance.alipay' && !showAli) {
            delete item.children[sub]
            continue
          }
          if (item.children[sub].to === 'finance.creditCard' && !showCreditCard) {
            delete item.children[sub]
            continue
          }
        }
      }
      if (item.children && Object.keys(item.children).length > 0) {
        this.openids.push(item.title + '-' + index)
      }
      this.loading = false
    }
  }

  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data) {
        this.identity = identity.data
      }
    } catch (e) {
      console.info(e)
    }
  }
}
