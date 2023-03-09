import Vue from 'vue'
import Component from 'vue-class-component'
import { OrderType, LicenseProductType, MediaType, LicenseProduct, ProductSku } from '@/models/licenseModels'
import { Prop } from 'vue-property-decorator'

@Component({
  components: {},
  template: `
    <el-tooltip effect="light">
      <div class="license-tooltip" slot="content">
        <el-row :gutter="12">
          <el-col :span="10">PID:</el-col>
          <el-col :span="14">
            <span v-if="productSkuData.type === OrderType.Standard" class="stage-live">{{ $t('Standard') }}</span>
            <span v-else class="stage-test">{{ $t('LicenseTesting') }}</span>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="10">{{ $t('PIDType') }}:</el-col>
          <el-col :span="14">{{ $t(LicenseProductType[productSkuData.productType]) }}</el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="10">{{ $t('LicenseCapability') }}:</el-col>
          <el-col :span="14">{{ $t(MediaType[productSkuData.mediaType]) }}</el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="10">{{ $t('ProductType') }}:</el-col>
          <el-col :span="14">{{ $t(LicenseProduct[productSkuData.product]) }}</el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="10">{{ $t('Quantity') }}:</el-col>
          <el-col :span="14">{{ quantity }} {{ $t('QuantityUnit') }}</el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="10">{{ $t('ValidityPeriod') }}:</el-col>
          <el-col :span="14"
            >{{ productSkuData.duration }}
            {{ productSkuData.type === OrderType.Standard ? $t('Year') : $t('Month') }}</el-col
          >
        </el-row>
      </div>
      <span>{{ productSkuData.id }}</span>
    </el-tooltip>
  `,
})
export default class LicenseTooltip extends Vue {
  @Prop({ default: {}, type: Object }) readonly productSkuData!: ProductSku
  @Prop({ default: 0, type: Number }) readonly quantity!: number
  loading = false
  OrderType = OrderType
  LicenseProductType = LicenseProductType
  MediaType = MediaType
  LicenseProduct = LicenseProduct

  async mounted() {}
}
