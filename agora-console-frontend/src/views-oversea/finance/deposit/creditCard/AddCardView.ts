import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import { checkEnglishName } from '@/utils/utility'
import './CreditCard.less'
const VueCountryCode = require('vue-country-code').default
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'vue-country-code': VueCountryCode,
  },
  template: `<div class="page add-card" v-loading="loading">
    <div v-if="oldHkCompany" class="m-auto text-center w-500">
      <img :src="PicCreate" width="400px" />
      <div class="heading-dark-14 mt-40">{{ $t('StripeTipStripeTip') }}</div>
      <console-button class="console-btn-primary mt-20" @click="goToTransfer">{{ $t('Bank Transfer') }}</console-button>
    </div>
    <div v-else>
      <h3 class="module-title">{{ $t('addCard') }}</h3>
      <div class="module-title-tip card-tip">{{ $t('addCardTip') }}</div>
      <div class="card">
        <div class="shipping-info">
          <el-form :model="stripeData" :rules="rules" ref="submit-form">
            <el-form-item label="Name" prop="name" class="input-item">
              <el-input v-model="stripeData.name" maxlength="255"></el-input>
            </el-form-item>
            <el-form-item label="Email" prop="email" class="input-item">
              <el-input v-model="stripeData.email" maxlength="255"></el-input>
            </el-form-item>
            <el-form-item label="Address" prop="address_line1" class="input-item">
              <el-input v-model="stripeData.address_line1" maxlength="255"></el-input>
            </el-form-item>
            <el-form-item label="City" prop="address_city" class="input-item">
              <el-input v-model="stripeData.address_city" maxlength="255"></el-input>
            </el-form-item>
            <el-form-item label="State" prop="address_state" class="input-item">
              <el-input v-model="stripeData.address_state" maxlength="255"></el-input>
            </el-form-item>
            <el-form-item prop="address_zip" class="input-item" label="ZIP">
              <el-input v-model="stripeData.address_zip" maxlength="255"></el-input>
            </el-form-item>
            <el-form-item label="Country" class="input-item" required>
              <vue-country-code
                @onSelect="onSelectCountry"
                :dropdownOptions="dropdownOptions"
                :ignoredCountries="['hk', 'mo']"
                :preferredCountries="['us']"
              >
              </vue-country-code>
              <span class="country-name">{{ countryName }}</span>
            </el-form-item>
          </el-form>
        </div>
        <div class="card-info" ref="card"></div>
        <el-checkbox v-model="isDefault" class="default-check"> {{ $t('setDefault') }} </el-checkbox>
        <div class="card-btn-group">
          <console-button class="console-btn-primary console-btn-size-md" :disabled="disableSave" @click="verifySave">
            {{ $t('Save') }}
          </console-button>
          <console-button class="console-btn-white" @click="onClickCancel">
            {{ $t('Cancel') }}
          </console-button>
        </div>
      </div>
    </div>
  </div>`,
})
export default class AddCardView extends Vue {
  // 测试环境stripe key
  // const stripe = Stripe('pk_test_ZCBKz3J8FUu0hKkA4QryvUn2')
  stripe: any = undefined
  element: any = undefined
  card: any = undefined
  validateName = (rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error(this.$t('InvalidParam') as string))
    }
    if (!checkEnglishName(value)) {
      return callback(new Error(this.$t('InvalidParam') as string))
    }
    callback()
  }
  loading = false
  isDefault = true
  disableSave = false
  cashInfo: any = {}
  userInfo: any = user.info
  packageId: any = ''
  step: any = ''
  name: any = ''
  isRenew: any = ''
  dropdownOptions: any = {
    disabledDialCode: true,
  }
  countryName = ''
  isSGCompany = false
  oldHkCompany = false
  PicCreate = PicCreate
  stripeData: any = {
    email: '',
    name: '',
    address_line1: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    address_country: '',
  }
  rules: any = {
    name: [{ required: true, validator: this.validateName, trigger: 'blur' }],
    email: [
      { required: true, message: this.$t('InvalidParam'), trigger: 'blur' },
      { type: 'email', message: 'invalid email', trigger: 'blur' },
    ],
    address_line1: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    address_city: [{ required: true, validator: this.validateName, trigger: 'blur' }],
    address_state: [{ required: true, validator: this.validateName, trigger: 'blur' }],
    address_zip: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
  }

  async mounted() {
    this.loading = true
    await this.checkSGCompany()
    if (!this.isSGCompany && this.userInfo.company.country === 'HK') {
      this.oldHkCompany = true
    }
    this.initCard()
    this.card.mount(this.$refs.card)
    this.loading = false
  }

  async created() {
    this.cashInfo = await getCashInfo()
    if (this.cashInfo.accountCurrency !== 'USD' || this.userInfo.company.country === 'CN') {
      this.$router.push({ name: 'finance.offline' })
    }
    this.step = this.$route.query.step
    this.packageId = this.$route.query.packageId
    this.name = this.$route.query.name
    this.isRenew = this.$route.query.isRenew
  }

  initCard() {
    const stripeKey = this.isSGCompany ? this.GlobalConfig.config.stripeKeySG : this.GlobalConfig.config.stripeKey
    this.stripe = (window as any).Stripe(stripeKey)
    this.element = this.stripe.elements({
      locale: 'en',
    })
    this.card = this.element.create('card', {
      style: {
        base: {
          color: '#666666',
          fontFamily: 'HelveticaNeue, Arial',
        },
      },
    })
  }

  onClickCancel() {
    if (this.packageId && this.step && this.name) {
      this.$router.push({
        name: this.name,
        query: {
          packageId: this.packageId,
          step: this.step,
          isRenew: this.isRenew,
        },
      })
    } else {
      this.$router.push({ name: 'finance.creditCard' })
    }
  }

  verifySave() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        await this.onClickSave()
      } else {
        return false
      }
    })
  }

  async onClickSave() {
    this.disableSave = true
    let getToken
    this.loading = true
    try {
      getToken = await this.stripe.createToken(this.card, {
        name: this.stripeData.name,
        address_line1: this.stripeData.address_line1,
        address_city: this.stripeData.address_city,
        address_state: this.stripeData.address_state,
        address_zip: this.stripeData.address_zip,
        address_country: this.stripeData.address_country,
      })
    } catch (e) {
      console.info(e)
      this.loading = false
      this.$message.error(this.$t('stripeError') as string)
      this.$router.push({ name: 'finance.creditCard' })
      return
    }
    try {
      await this.$http.post(`/api/v2/finance/creditCard/cards`, {
        cardToken: getToken.token.id,
        defaultCard: this.isDefault,
      })

      this.loading = false
      this.$message({
        message: this.$t('addCardSuccess') as string,
        type: 'success',
      })
      const hasGoBackUrl = window.location.href.indexOf('goBack')
      if (hasGoBackUrl >= 0) {
        this.$router.go(-1)
      }
      if (this.packageId && this.step && this.name) {
        this.$router.push({
          name: this.name,
          query: {
            packageId: this.packageId,
            step: this.step,
            isRenew: this.isRenew,
          },
        })
        return
      }
      this.$router.push({ name: 'finance.creditCard' })
    } catch (e) {
      this.loading = false
      this.$message.error(this.$t('failedAdd') as string)
    }
    this.disableSave = false
  }
  onSelectCountry(obj: any) {
    this.stripeData.address_country = obj.iso2
    this.countryName = obj.name
  }
  async checkSGCompany() {
    try {
      const res = await this.$http.get(`/api/v2/finance/sg-company`)
      if (res.data) {
        this.isSGCompany = true
      }
    } catch (e) {}
  }
  goToTransfer() {
    this.$router.push({ name: 'finance.offline' })
  }
}
