import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './Package.less'
import { getCashInfo, user } from '@/services'
const cartImg = require('@/assets/icon/icon-cart.png')
const cartEmptyImg = require('@/assets/icon/pic-cart.png')
const IconCheck = require('@/assets/icon/icon-check-blue.png')

@Component({
  template: `
    <div class="cart-container">
      <el-tooltip class="item" effect="light" placement="left" :manual="true" :value="openToolTip">
        <div class="cart-icon cursor-pointer" @click="onShowCartContent">
          <el-badge :value="selectPackageTotalNum" :max="99" class="item" type="warning">
            <img :src="cartImg" />
          </el-badge>
        </div>
        <div slot="content" class="tooltip-content s-200 text-center">
          <div>
            <img :src="IconCheck" class="w-16 vertical-middle" />
            <span class="heading-dark-14 ml-5">{{ $t('Add to the cart successfully') }}</span>
          </div>
          <console-button class="console-btn-primary mt-20 w-120" @click="purchase">{{ $t('Pay Now') }}</console-button>
        </div>
      </el-tooltip>
      <div class="cart-content" v-show="showCartContent">
        <div class="cart-header d-flex justify-between align-center">
          <span class="heading-grey-14">{{ $t('Cart') }}</span>
          <span @click="onShowCartContent"><i class="el-icon-close heading-grey-20 cursor-pointer"></i></span>
        </div>
        <div v-if="packages.length === 0" class="w-100 d-flex justify-center align-center empty-box">
          <img class="empty-img" :src="cartEmptyImg" />
        </div>
        <div class="cart-items" v-else>
          <el-checkbox v-model="checkAll" :checked="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div class="cart-item" v-for="item in packages">
            <div class="d-flex justify-between align-base">
              <el-checkbox
                :label="item.packageName"
                v-model="item.checked"
                :checked="item.checked"
                @change="checked => handleCheckBoxSelect(checked, item)"
              ></el-checkbox>
              <span @click="handlePackageRemove(item)"><i class="el-icon-close cursor-pointer f-18"></i></span>
            </div>
            <div class="d-flex align-center justify-between mt-10">
              <div class="heading-grey-13">
                {{ $t('Price') }} {{ currency === 'CNY' ? '￥' : '$' }}{{ getOneTypePackgePrice(item) }}
              </div>
              <el-input-number
                v-model="item.num"
                :min="0"
                :step="1"
                :step-strictly="true"
                size="small"
                class="text-center"
              ></el-input-number>
            </div>
          </div>
        </div>
        <div class="cart-footer text-center">
          <div class="price-line mt-20">
            <span class="heading-orange-01">{{ selectPackageTotalNum }}</span>
            <span class=""> {{ $t('Package') }}，{{ $t('Total') }}：</span>
            <span class="heading-orange-01">{{ totalAmount | formatMoney(currency) }}</span>
          </div>
          <console-button class="console-btn-primary" @click="purchase" :disabled="selectPackages.length === 0">{{
            $t('Purchase')
          }}</console-button>
        </div>
      </div>
    </div>
  `,
})
export default class CartComponent extends Vue {
  @Prop({ default: [], type: Array }) readonly packages!: any[]
  @Prop({ default: [], type: Array }) selectPackages!: any[]

  user: any = user
  cashInfo: any = {}
  showCartContent = false
  // SelectPackage: any = []
  cartImg = cartImg
  cartEmptyImg = cartEmptyImg
  IconCheck = IconCheck
  checkAll = false
  openToolTip = false

  handleTooltip() {
    this.openToolTip = true
    setTimeout(() => {
      this.openToolTip = false
    }, 1500)
  }
  onShowCartContent() {
    this.showCartContent = !this.showCartContent
  }

  get currency() {
    return this.cashInfo && this.cashInfo.accountCurrency
  }

  get selectPackageTotalNum() {
    let total = 0
    for (const item of this.selectPackages) {
      total += item['num']
    }
    return total
  }

  get totalAmount() {
    let total = 0
    for (const item of this.selectPackages) {
      total += Number(this.getOneTypePackgePrice(item))
    }
    return total
  }

  async mounted() {
    this.cashInfo = await getCashInfo()
  }

  getUnitPackgePrice(item: any) {
    return this.currency === 'CNY' ? Number(item.priceCNY).toFixed(2) : Number(item.priceUSD).toFixed(2)
  }

  getOneTypePackgePrice(item: any) {
    return this.currency === 'CNY'
      ? (Number(item.priceCNY) * item.num).toFixed(2)
      : (Number(item.priceUSD) * item.num).toFixed(2)
  }

  handlePackageRemove(item: any) {
    console.info('handlePackageRemove')
    const index = this.packages.findIndex((selectPackage: any) => {
      return selectPackage.id === item.id
    })
    console.info(index)
    this.packages.splice(index, 1)

    const selectiIndex = this.selectPackages.findIndex((selectPackage: any) => {
      return selectPackage.id === item.id
    })
    this.selectPackages.splice(selectiIndex, 1)
    this.handleParentPackage(item)
  }

  handleCheckBoxSelect(checked: boolean, item: any) {
    console.info(checked)
    console.info(item)
    if (checked) {
      const index = this.selectPackages.findIndex((selectPackage: any) => {
        return selectPackage.id === item.id
      })
      console.info(index)
      if (index === -1) {
        this.selectPackages.push(item)
      }
    } else {
      const index = this.selectPackages.findIndex((selectPackage: any) => {
        return selectPackage.id === item.id
      })
      console.info(index)
      this.selectPackages.splice(index, 1)
    }
  }

  handleParentPackage(item: any) {
    this.$emit('removeSelectPackage', item)
  }

  handleCheckAllChange(val: boolean) {
    if (val) {
      this.selectPackages = this.packages
      for (const item of this.packages) {
        item.checked = true
      }
    } else {
      this.selectPackages = []
      for (const item of this.packages) {
        item.checked = false
      }
    }
  }

  async setMinPackageItems() {
    console.info('setMinPackageItems')
    await this.$store.dispatch('updateMinPackagePurchase', this.selectPackages)
  }

  async purchase() {
    await this.setMinPackageItems()
    this.$router.push({
      path: '/packages/minPackage/pay',
    })
  }
}
