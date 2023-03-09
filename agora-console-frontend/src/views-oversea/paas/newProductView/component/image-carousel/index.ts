import Vue from 'vue'
import Component from 'vue-class-component'
import './style.less'
import { Prop } from 'vue-property-decorator'

@Component({
  components: {},
  template: `
    <el-dialog
      :visible.sync="showCarousel"
      custom-class="carousel-dialog"
      @close="updateShowCarousel(false)"
      width="80%"
    >
      <template slot="title"></template>
      <div class="carousel-title">{{ title }}</div>
      <el-carousel :interval="50000" type="card" arrow="always" style="margin-bottom: 50px">
        <el-carousel-item v-for="item in webImageUrls" :key="item">
          <div class="carousel-img" :style="{ backgroundImage: 'url(' + item + ')' }"></div>
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  `,
})
export default class ImageCarousel extends Vue {
  @Prop({ default: () => false, type: Boolean }) readonly showCarousel!: boolean
  @Prop({ default: () => [], type: Array }) readonly webImageUrls!: Record<string, unknown>
  @Prop({ default: null, type: Function }) readonly updateShowCarousel!: (show: boolean) => Promise<void>
  @Prop({ default: '', type: String }) readonly title!: string
}
