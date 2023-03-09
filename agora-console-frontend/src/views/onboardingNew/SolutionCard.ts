import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { user } from '@/services'
import './Onboarding.less'

@Component({
  template: `
    <div class="solution-card" :class="[selected ? 'selected' : '']">
      <div class="solution-logo" :style="{ backgroundImage: 'url(' + product.productPhotoUrl + ')'}"></div>
      <div class="solution-content">
        <div class="solution-title">
          <span> {{ getProductTitle }} </span>
          <span class="product-tag hot-tag" v-if="product.hotTag">
            {{ $t('Hot') }}
          </span>
          <span class="product-tag new-tag" v-if="product.newTag">
            {{ $t('New') }}
          </span>
        </div>
        <el-tooltip v-if="showDescToolTip" :content="getProductDesc" effect="light">
          <div ref="solution-desc" class="solution-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">
            {{ getProductDesc }}
          </div>
        </el-tooltip>
        <div v-else ref="solution-desc" class="solution-desc" :class="[$i18n.locale === 'en' ? 'en' : 'cn']">
          {{ getProductDesc }}
        </div>
      </div>
    </div>
  `,
})
export default class SolutionCard extends Vue {
  @Prop({ default: () => () => {}, type: Object }) readonly product!: any
  @Prop({ default: false, type: Boolean }) readonly selected!: boolean
  companyInfo = user.info.company
  showDescToolTip = false

  get getProductTitle() {
    return this.$i18n.locale === 'en' ? this.product.nameEn : this.product.nameCn
  }
  get getProductDesc() {
    return this.$i18n.locale === 'en' ? this.product.descriptionEn : this.product.descriptionCn
  }

  mounted() {
    console.info((this.$refs['solution-desc'] as any).clientHeight, (this.$refs['solution-desc'] as any).scrollHeight)
    if (this.$i18n.locale === 'en') {
      this.showDescToolTip =
        (this.$refs['solution-desc'] as any).clientHeight < (this.$refs['solution-desc'] as any).scrollHeight
    } else {
      this.showDescToolTip =
        (this.$refs['solution-desc'] as any).clientWidth < (this.$refs['solution-desc'] as any).scrollWidth
    }
  }
}
