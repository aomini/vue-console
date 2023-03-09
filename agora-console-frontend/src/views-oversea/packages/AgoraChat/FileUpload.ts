import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  components: {},
  template: ` <el-upload
    class="upload-demo"
    action="action"
    :http-request="startUpload"
    :limit="1"
    :on-remove="handleRemove"
    :accept="acceptType"
    :on-exceed="handleExceed"
  >
    <console-button class="console-btn-white" :loading="loading">{{ $t('Upload Certificate') }}</console-button>
  </el-upload>`,
})
export default class FileUpload extends Vue {
  @Prop({ default: '', type: String }) readonly acceptType!: string
  loading = false
  handleExceed() {
    this.$message.error(this.$t('Max File Limit') as string)
  }

  async startUpload(data: any) {
    this.loading = true
    const rd = new FileReader()
    const file = data.file
    rd.readAsDataURL(file)
    rd.onloadend = () => {
      this.loading = false
      let encoded = ''
      if (rd.result) {
        encoded = rd.result.toString().replace(/^data:(.*,)?/, '')
      }
      if (encoded.length % 4 > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4))
      }
      this.$emit('updateFileData', encoded)
    }
  }

  handleRemove() {
    this.$emit('updateFileData', '')
  }
}
