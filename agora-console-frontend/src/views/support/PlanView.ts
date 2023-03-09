import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { user } from '@/services/user'
import { getCashInfo } from '@/services'
import './Support.less'

@Component({
  template: ` <div class="support-plan" v-loading="loading">
    <h5>{{ $t('My Support Plan') }}</h5>
    <div class="card selected">
      <div class="selected-item">
        <div class="title">
          <span class="name">{{
            oldPackage.supportPackage && oldPackage.supportPackage.isPublic === NoPublic
              ? $t('Customized Package')
              : oldPackage.supportPackage.name
          }}</span>
          <span class="tag-selected">{{ $t('The Selected Package') }}</span>
        </div>
        <div class="description">{{ getDescription }}</div>
      </div>
      <div
        class="selected-item effective"
        v-if="oldPackage.supportPackage.duration !== -1 && oldPackage.supportPackage.isEnterprise !== 1"
      >
        <p>{{ $t('Effective From') }}</p>
        <p>
          {{ moment(oldPackage.effectiveDate).format('YYYY/MM/DD') }} -
          {{ moment(oldPackage.expireDate).format('YYYY/MM/DD') }}
        </p>
      </div>
      <div
        class="selected-item renewal"
        v-if="oldPackage.supportPackage.isEnterprise !== 1 && oldPackage.supportPackage.isPublic === Public && Number(oldPackage.supportPackage.priceCNY) !== 0 && Number(oldPackage.supportPackage.priceUSD) !== 0"
      >
        <el-button type="primary" @click="onClickRenew(oldPackage.supportPackage.id)">{{
          $t('Renew current package')
        }}</el-button>
      </div>
    </div>
    <div class="list mt-20">
      <div class="title">
        <span>{{ $t('Optional Package') }}</span>
      </div>
      <div class="content">
        <p v-if="packageList.length === 0 || packageList.length === 1 && packageList[0].duration === NoLimit">
          {{ $t('No Package') }}
        </p>
        <div
          v-else
          class="package"
          v-for="(item, index) in packageList"
          :key="index"
          :class="{'disabled': disabled(item)}"
          @click="!disabled(item) && onClickToPay(item.id)"
        >
          <div class="name">{{ item.name }}</div>
          <div class="price">
            {{ getPrice(item) }}
            <template
              v-if="!(currency === 'CNY' && Number(item.priceCNY) === 0 || currency === 'USD' && Number(item.priceUSD) === 0)"
            >
              /<span style="font-size: 14px">{{ $t('month') }}</span>
            </template>
          </div>
          <div class="description" v-html="item.description || $t('Nothing')"></div>
          <el-button type="primary">{{ $t('Select This Plan') }}</el-button>
        </div>
      </div>
    </div>
    <div class="card package-intro footer-text">
      <div v-if="$i18n.locale === 'en'" class="black">
        <span class="blue">{{ $t('Enterprise') }}</span>
        {{ $t('intro0') }}
        <a href="https://www.agora.io/en/contact-sales" target="_blank">{{ $t('contact sales') }}</a>
        {{ $t('for details') }}
      </div>
      <br v-if="$i18n.locale === 'en'" />
      <div>{{ $t('intro1') }}</div>
      <div>{{ $t('intro2') }}</div>
      <div>{{ $t('intro3') }}</div>
      <div v-if="$i18n.locale === 'en'">{{ $t('intro4') }}</div>
      <ul v-if="$i18n.locale === 'en'">
        <li>{{ $t('intro5') }}</li>
        <li>{{ $t('intro6') }}</li>
        <li>{{ $t('intro7') }}</li>
      </ul>
      <br v-if="$i18n.locale === 'cn'" />
      <div>
        <span class="package-title">{{ $t('Named SA Engineer') }}</span>
        {{ $t('Named SA Engineer Intro') }}
      </div>
      <div>
        <span class="package-title">{{ $t('Named CS Engineer') }}</span>
        {{ $t('Named CS Engineer Intro') }}
      </div>
      <div>
        <span class="package-title">{{ $t('Code Review') }}</span>
        {{ $t('Code Review Intro') }}
      </div>
      <div>
        <span class="package-title">{{ $t('Live developer consultation and training') }}</span>
        {{ $t('Live developer consultation and training Intro') }}
      </div>
      <div>
        <span class="package-title">{{ $t('Business Days') }}</span>
        {{ $t('Business Days Intro') }}
      </div>
      <div>
        <span class="package-title">{{ $t('Business Hours') }}</span>
        {{ $t('Business Days Intro') }}
      </div>
    </div>
  </div>`,
})
export default class PlanView extends Vue {
  user = user
  moment = moment
  loading = false
  account: any = ''
  oldPackage: any = {
    effectiveDate: moment(),
    supportPackage: {
      id: '',
      name: '',
      description: '',
      priceCNY: 0,
      priceUSD: 0,
      duration: -1,
      isPublic: 1,
    },
  }
  packageList: any = []
  visible = false
  isRenew = false
  NoPublic = 1
  Public = 2
  NoLimit = -1

  get country() {
    return this.user.info && this.user.info.company && this.user.info.company.area === 'CN' ? 'CN' : 'ROW' || 'ROW'
  }
  get currency() {
    return this.account && this.account.accountCurrency
  }
  get getDescription() {
    return (
      (this.oldPackage.supportPackage.description &&
        this.oldPackage.supportPackage.description.replace(/<br>/g, ';').replace(/<hr>/g, '')) ||
      this.$t('Nothing')
    )
  }

  async mounted() {
    this.loading = true
    this.account = await getCashInfo()
    await this.getSupportPackageByCompany()
    await this.getSupportPackageList()
    this.loading = false
  }

  getSupportPackageByCompany() {
    this.$http
      .get(`/api/v2/support/package/company`)
      .then((res: any) => {
        this.oldPackage = res.data
      })
      .catch(() => {
        this.$message.error(this.$t('NetWork Error') as string)
        this.loading = false
      })
  }

  getSupportPackageList() {
    this.$http
      .get(`/api/v2/support/package/list`)
      .then((res: any) => {
        this.packageList = res.data || []
      })
      .catch(() => {
        this.$message.error(this.$t('NetWork Error') as string)
        this.loading = false
      })
  }

  getPrice(item: any) {
    if (this.currency === 'CNY') {
      return Number(item.priceCNY) === 0 ? this.$t('Free') : `￥${(item.priceCNY / item.duration).toFixed(2)}`
    }
    return Number(item.priceUSD) === 0 ? this.$t('Free') : `$${(item.priceUSD / item.duration).toFixed(2)}`
  }
  disabled(item: any) {
    const price = Number(item.priceCNY)
    const currentPrice = Number(this.oldPackage.supportPackage.priceCNY)
    if (Number(item.id) === Number(this.oldPackage.supportPackage.id)) {
      return true
    }
    // 比较不需要根据当前套餐用人民币还是美元结算，只用人民币进行比较即可
    if (price < currentPrice) {
      return true
    }
    return false
  }

  onClickRenew(packageId: any) {
    // 购买的套餐未过期，最多只能续费一次，想要续费第二次，必须等前一个续费周期过了才可以续费下一次。=> 产品：yangjun@agora.io
    if (moment().add(this.oldPackage.supportPackage.duration, 'months').isBefore(moment(this.oldPackage.expireDate))) {
      this.$message.warning(this.$t('Can not renew many times') as string)
      return
    }
    this.isRenew = true
    this.onClickToPay(packageId)
  }

  onClickToPay(packageId: any) {
    if (this.user.info.permissions && this.user.info.permissions['FinanceCenter'] === 0) {
      this.$message.warning(this.$t('No Permission') as string)
      return
    }
    if (this.account && this.account.accountBalance < 0) {
      this.$alert(this.$t('Balance negative') as string, this.$t('hint') as string)
      return
    }
    // cocos客户无法支付
    if (this.user && this.user.info.company && this.user.info.company.source === 2) {
      this.$message.warning(this.$t('You have no permission') as string)
      return
    }
    ;(this.$router as any).push({
      path: '/support/pay',
      query: {
        packageId: packageId,
        isRenew: this.isRenew,
      },
    })
  }

  onClickInstructions() {
    this.visible = true
  }
  onClose() {
    this.visible = false
  }
}
