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
          <div v-if="isImage(item)" class="carousel-img" :style="{ backgroundImage: 'url(' + item + ')' }"></div>
          <video w:w="full" w:h="full" w:bg="white" w:object="cover" v-if="isVideo(item)" :src="item" controls></video>
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

  isImage(fileUrl: string) {
    const exts = [
      'xbm',
      'tif',
      'pjp',
      'svgz',
      'jpg',
      'jpeg',
      'ico',
      'tiff',
      'gif',
      'svg',
      'jfif',
      'webp',
      'png',
      'bmp',
      'pjpeg',
      'avif',
    ]
    return exts.includes(fileUrl.split('.').pop()!)
  }

  isVideo(fileUrl: string) {
    const exts = ['avi', 'mp4', 'wmv', 'mpeg', 'mpg', 'mov', 'rm', 'ram', 'swf', 'flv']
    return exts.includes(fileUrl.split('.').pop()!)
  }

  // myWebImageUrls = [
  //   'https://web-cdn.agora.io/website-files/images/yitu_3.gif',
  //   'https://web-cdn.agora.io/website-files/images/yitu_2.png',
  //   'https://web-cdn.agora.io/website-files/images/yitu_1.png',
  //   'https://web-cdn.agora.io/website-files/images/new-home-2-banner-realtime-2.mp4',
  // ]
}
