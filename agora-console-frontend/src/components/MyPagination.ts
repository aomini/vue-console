import Vue from 'vue'
import Component from 'vue-class-component'
import { Model, Prop } from 'vue-property-decorator'

export interface PageInfo {
  pageNumber: number
  pageSize: number
  total: number | null
}

@Component({
  template: ` <el-pagination
    class="my-pagination"
    :current-page.sync="value.page"
    :page-sizes="[5, 10, 15, 20]"
    :page-size.sync="value.limit"
    :pager-count="value.pagerCount"
    :layout="layout"
    :total="value.total"
    background
    @size-change="onPageSizeChanged"
    @current-change="onCurrentIndexChanged"
  >
    <!--    <span class="heading-grey-08">{{ $t('pagesize') }}</span>-->
  </el-pagination>`,
})
export default class MyPagiation extends Vue {
  @Model('update:value', {
    type: Object,
    default: () => {
      return {
        page: 1,
        limit: 10,
        total: null,
        pagerCount: 5,
      }
    },
  })
  readonly value!: PageInfo

  @Prop({ default: 'sizes, slot, prev, pager, next', type: String }) readonly layout?: string
  @Prop({ default: () => [5, 10, 15, 20], type: Array }) readonly pageSizes?: number[] | null

  onPageSizeChanged() {
    this.$emit('change', this.value)
  }

  onCurrentIndexChanged() {
    this.$emit('change', this.value)
  }
}
