import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
import './Onboarding.less'

@Component({
  template: `
    <div class="product-card" :class="[selected ? 'selected' : '', size === 'mini' ? 'product-card--mini' : '']">
      <template v-if="size === 'mini'">
        <span class="iconfont product-logo" :class="getProductIcon"></span>
        <span class="product-content">
          <span class="product-name"> {{ getProductTitle }} </span>
        </span>
      </template>
      <template v-else>
        <span class="iconfont product-logo" :class="getProductIcon"></span>
        <div class="product-content w-100 d-flex justify-between">
          <div class="product-title">
            <span class="product-name"> {{ getProductTitle }} </span>
            <span class="product-tag hot-tag product-tag--ribbon" v-if="product.hotTag">
              {{ $t('HOT') }}
            </span>
            <span class="product-tag new-tag product-tag--ribbon" v-if="product.newTag">
              {{ $t('NEW') }}
            </span>
          </div>
          <div class="d-inline-block product-link">
            <span class="iconfont iconbangzhuwendang_tiaochu"></span>
          </div>
          <!--          <el-tooltip v-if="showDescToolTip" :content="getProductDesc" effect="light">-->
          <!--            <div ref="product-desc" class="product-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">-->
          <!--              <span>{{ getProductDesc }}</span>-->
          <!--            </div>-->
          <!--          </el-tooltip>-->
          <!--          <div v-else ref="product-desc" class="product-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">-->
          <!--            <span>{{ getProductDesc }}</span>-->
          <!--          </div>-->
        </div>
      </template>
    </div>
  `,
})
export default class ProductCard extends Vue {
  @Prop({ default: () => () => {}, type: Object }) readonly product!: any
  @Prop({ default: false, type: Boolean }) readonly selected!: boolean
  @Prop({ default: 'mini', type: String }) readonly size!: string
  @Prop({ default: '', type: String }) readonly type!: string
  companyInfo = user.info.company
  showDescToolTip = false

  get getProductTitle() {
    return this.$i18n.locale === 'en' ? this.product.nameEn : this.product.nameCn
  }
  get getProductDesc() {
    return this.$i18n.locale === 'en' ? this.product.descriptionEn : this.product.descriptionCn
  }

  get getProductIcon() {
    return 'icon' + this.product.icon
  }

  mounted() {}
}
