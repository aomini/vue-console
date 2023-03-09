import Vue from 'vue'
import Component from 'vue-class-component'
import { getCashInfo, user } from '@/services'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
const PicCreate = require('@/assets/icon/pic-create.png')

@Component({
  components: {
    'two-factor-confirm': TwoFactorConfirm,
  },
  template: `<div class="page credit-card" v-loading="loading">
    <div v-if="isOldHkCompany" class="m-auto text-center w-500">
      <img :src="PicCreate" width="400px" />
      <div class="heading-dark-14 mt-40">{{ $t('StripeTipStripeTip') }}</div>
      <console-button class="console-btn-primary mt-20" @click="goToTransfer">{{ $t('Bank Transfer') }}</console-button>
    </div>
    <div v-else>
      <h3 class="module-title">{{ $t('creditCard') }}</h3>
      <div class="card">
        <div class="card-header">
          <h3 class="module-header m-0">
            <span class="mr-3">{{ $t('accountBalance') }}</span>
            <span class="finance-amount">{{ cashInfo.accountBalance | formatMoney(cashInfo.accountCurrency) }}</span>
          </h3>
        </div>
        <div class="card-header">
          <!-- <div class="card-header bg-white pt-18" :style="{ display: showMoneyInput ? 'block' : 'none'}"> -->
          <el-form ref="form" :model="{}" :label-width="$t('labelWidth')" size="mini" class="money-input-container">
            <el-form-item :error="$t('moneyInputHint')">
              <span class="module-header" slot="label"> {{ $t('paymentAmount') }} </span>
              <el-input
                type="number"
                ref="money"
                size="mini"
                name="money"
                id="money-input"
                v-model="money"
                @change="changeMoney"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="card-header alipay-hint">
          <div>{{ $t('creditCard rechargeRangeHint') }}</div>
          <div>{{ $t('creditCard rechargeCurrencyHint') }}</div>
          <div>{{ $t('WithdrawHint') }}</div>
          <div>
            {{ $t('cardHint') }}<a :href="$t('cardHintLink')" target="_blank">{{ $t('here') }}</a
            >{{ $t('cardHint2') }}
          </div>
        </div>

        <div v-if="cardsInfo.length !== 0">
          <div class="card-list">
            <h3 class="module-header">{{ $t('payWith') }}</h3>
            <div
              class="d-flex align-center card-item"
              v-for="(cardInfo, index) of cardsInfo"
              :key="index"
              @click="() => selectCard(cardInfo.id)"
            >
              <el-radio v-model="selectedCard" :label="cardInfo.id" class="mb-0"> {{ '' }} </el-radio>
              <div class="mr-2">{{ $t('cardInfo', { brand: cardInfo.cardBrand, digit: cardInfo.cardLast4 }) }}</div>
              <div v-if="cardInfo.defaultCard" class="blue_tag px-2">{{ $t('default') }}</div>
              <div class="ml-auto card-item-btn-group mr-2">
                <console-button
                  type="text"
                  v-if="!cardInfo.defaultCard"
                  class="console-btn-primary card-text-btn"
                  @click="setDefault(cardInfo.id)"
                >
                  {{ $t('defaultBtn') }}
                </console-button>
                <el-button type="text" class="card-text-btn" @click="deleteCard(cardInfo.id)">
                  {{ $t('deleteBtn') }}
                </el-button>
              </div>
            </div>
          </div>

          <div class="mt-20">
            <console-button class="console-btn-primary console-btn-size-md" @click="prePayCheck">{{
              $t('pay')
            }}</console-button>
            <console-button class="console-btn" @click="goToAddCard" v-if="showAdd">{{ $t('addCard') }}</console-button>
          </div>
        </div>

        <div v-else>
          <div class="mt-20">
            <console-button class="console-btn-primary console-btn-size-md" @click="goToAddCard">{{
              $t('addCard')
            }}</console-button>
          </div>
        </div>

        <div v-if="showTwoFactorVerification">
          <two-factor-confirm
            :afterSuccess="() => goToPay()"
            :afterFail="() => {}"
            :cancelVerification="() => showTwoFactorVerification = false"
          >
          </two-factor-confirm>
        </div>
      </div>
    </div>
  </div>`,
})
export default class CreditCardView extends Vue {
  cashInfo: any = {}
  loading = false
  money: any = 0
  cardsInfo: any[] = []
  selectedCard = ''
  userInfo: any = user.info
  showAdd = true
  // showMoneyInput: true,
  showTwoFactorVerification = false
  isSGCompany = false
  isOldHkCompany = false
  PicCreate = PicCreate

  async mounted() {
    this.cashInfo = await getCashInfo(true)
    if (this.cashInfo.accountCurrency !== 'USD' || this.userInfo.company.country === 'CN') {
      this.$router.push({ name: 'finance.offline' })
      return
    }
    await this.checkSGCompany()
    // 老的香港客户暂时不支持使用信用卡
    if (!this.isSGCompany && this.userInfo.company.country === 'HK') {
      this.isOldHkCompany = true
    }
    await this.getCards()
    if (this.cashInfo.accountBalance < 0) {
      this.money = -this.cashInfo.accountBalance
    }
    if (this.$route.query.amount) {
      this.money = this.$route.query.amount
    }
  }

  async getCards() {
    try {
      this.loading = true
      const getCards = await this.$http.get('/api/v2/finance/creditCard/cards')
      this.cardsInfo = getCards.data
      // this.showMoneyInput = this.cardsInfo.length > 0
      if (this.cardsInfo.length > 4) {
        this.showAdd = false
      } else {
        this.showAdd = true
      }
      for (const card of this.cardsInfo) {
        if (card.defaultCard) {
          this.selectedCard = card.id
        }
      }
      this.loading = false
    } catch (e) {
      this.$message.error(this.$t('failedToGetCards') as string)
    }
  }

  moneyInputCheck() {
    if (!this.money) {
      this.$message.warning(this.$t('moneyInputHint') as string)
      return false
    }
    const money = parseFloat(this.money)
    if (!money || money < 1) {
      this.$message.warning(this.$t('moneyInputHint') as string)
      return false
    }
    return true
  }

  async prePayCheck() {
    if (this.moneyInputCheck()) {
      this.showTwoFactorVerification = true
    }
  }
  async goToPay() {
    this.showTwoFactorVerification = false
    try {
      if (this.moneyInputCheck()) {
        this.loading = true
        await this.$http.post('/api/v2/finance/creditCard/charge', { amount: this.money, cardId: this.selectedCard })
        this.loading = false
        this.$router.push({ name: 'finance.creditCard.callback', query: { total_amount: this.money } })
      }
    } catch (e) {
      this.$message.error(this.$t('failedToPay') as string)
      this.$router.push({ name: 'finance.creditCard.callback', query: { total_amount: this.money, error: 'true' } })
    }
  }

  goToAddCard() {
    this.$router.push({ name: 'finance.addCard' })
  }
  changeMoney() {
    if (this.money) {
      this.money = parseFloat(this.money).toFixed(2)
    }
  }
  selectCard(cardId: any) {
    this.selectedCard = cardId
  }
  async setDefault(id: any) {
    try {
      this.loading = true
      await this.$http.put(`/api/v2/finance/creditCard/cards/${id}/default`)
      await this.getCards()
      this.loading = false
    } catch (e) {
      this.$message.error(this.$t('FailedUpdate') as string)
    }
  }

  deleteCard(id: any) {
    this.$confirm(this.$t('ConfirmDelete') as string, this.$t('ConfirmTitle') as string, {
      confirmButtonText: this.$t('Back') as string,
      cancelButtonText: this.$t('Confirm') as string,
      cancelButtonClass: 'button button-mid w-80',
      confirmButtonClass: 'button button-outline-mid-secondary w-80',
      showClose: false,
    })
      .then(() => {})
      .catch(async () => {
        try {
          this.loading = true
          await this.$http.delete(`/api/v2/finance/creditCard/cards/${id}`)
          await this.getCards()
          this.loading = false
        } catch (e) {
          this.$message.error(this.$t('FailedDelete') as string)
        }
      })
  }

  async checkSGCompany() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/finance/sg-company`)
      if (res.data) {
        this.isSGCompany = true
      }
    } catch (e) {}
    this.loading = false
  }
  goToTransfer() {
    this.$router.push({ name: 'finance.offline' })
  }
}
