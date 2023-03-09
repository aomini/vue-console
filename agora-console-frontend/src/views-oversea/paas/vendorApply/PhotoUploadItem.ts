import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import '../../settings/authentication/Authentication.less'
import { Prop } from 'vue-property-decorator'
const SparkMD5 = require('spark-md5')

@Component({
  components: {},
  template: `
    <div class="upload avatar-component">
      <el-upload
        class="avatar-uploader"
        action="action"
        :http-request="startUpload"
        accept="image/jpeg,image/jpg,image/png,image/bmp,image/gif"
        :before-upload="beforeAvatarUpload"
        :on-exceed="handleExceed"
        :show-file-list="false"
      >
        <span class="heading-dark-13" v-show="!url">{{ $t('Image') }}</span>
        <span v-show="!url">|</span>
        <span class="link heading-grey-13" v-show="!url">{{ $t('Upload Image') }}</span>
        <img v-if="url" :src="url" class="avatar" style="max-width: 200px" />
      </el-upload>
    </div>
  `,
})
export default class PhotoUploadItem extends Vue {
  @Prop({ default: true, type: Boolean }) readonly showIcon!: boolean
  OSSUrl = ''
  limit = 1
  currentAttachmentId = ''
  url = ''
  resourceId = ''
  ossKey = ''
  OSSParam: any = undefined

  async startUpload(param: any) {
    try {
      const formData = new FormData()
      for (const pKey of Object.keys(this.OSSParam)) {
        formData.append(pKey, this.OSSParam[pKey])
      }
      formData.append('file', param.file)
      await this.$http.post(this.OSSUrl, formData)
      this.OSSUrl = ''
      this.OSSParam = undefined
      const publishAttachment = await this.$http.post('/api/v2/identity/publishAttachment', {
        attachmentId: this.currentAttachmentId,
      })
      console.info(publishAttachment)
      this.url = publishAttachment.data.url
      this.resourceId = publishAttachment.data.data.resourceId
      this.ossKey = publishAttachment.data.data.ossKey
      this.updateUrl(this.url, this.resourceId, this.ossKey)
      this.$message({
        message: this.$t('UploadSuccess') as string,
        type: 'success',
      })
    } catch (e) {
      this.$message.error(this.$t('FailedToUploadAttachment') as string)
    }
  }
  handleExceed() {
    this.$message.error(this.$t('MaxAmountAttachment') as string)
  }
  async computeFileHash(file: File) {
    return new Promise((resolve) => {
      const blobSlice =
        File.prototype.slice || (File.prototype as any)['mozSlice'] || (File.prototype as any)['webkitSlice']
      const chunkSize = 2097152
      const chunks = Math.ceil(file.size / chunkSize)
      let currentChunk = 0
      let fileHash = ''
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()

      const loadNext = async () => {
        const start = currentChunk * chunkSize
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }

      fileReader.onload = (e) => {
        spark.append(e.target!.result)
        currentChunk++

        if (currentChunk < chunks) {
          loadNext()
        } else {
          fileHash = spark.end()
          resolve(fileHash)
        }
      }
      loadNext()
    })
  }
  async handleRemove() {
    try {
      const attachmentId = this.resourceId
      await this.$http.delete('/api/v2/identity/deleteAttachment', { params: { attachmentId: attachmentId } })
      this.$message({
        message: this.$t('DeleteSuccess') as string,
        type: 'success',
      })
      this.url = ''
      this.currentAttachmentId = ''
      this.resourceId = ''
      this.$emit('updateURL', '', '')
      return
    } catch (e) {
      this.$message.error(this.$t('DeleteError') as string)
    }
    return Promise.reject()
  }
  async beforeAvatarUpload(file: File) {
    try {
      const isJPG =
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/bmp' ||
        file.type === 'image/gif'
      if (!isJPG) {
        this.$message.error(this.$t('ImgTypeError') as string)
        return Promise.reject()
      }

      if (file.size > 20 * 1024 * 1024) {
        this.$message.warning(this.$t('FileSizeTooLarge20') as string)
        return Promise.reject()
      }

      if (this.resourceId) {
        await this.handleRemove()
      }
      const fileHash = await this.computeFileHash(file)
      const fileObject = {
        file_hash: fileHash,
        mime_type: file.type || 'application/octet-stream',
        file_ext: file.name.includes('.') ? file.name.split('.').pop()!.replace(/\s+/g, '') : '',
        file_size: file.size,
      }
      const prepareAttachment = await this.$http.post('/api/v2/identity/prepareAttachment', {
        fileObject,
        companyId: user.info.companyId,
      })
      this.OSSUrl = prepareAttachment.data.oss_metadata.url
      this.OSSParam = prepareAttachment.data.oss_metadata.params
      this.currentAttachmentId = prepareAttachment.data.attachment_id
    } catch (e) {
      this.$message.error(this.$t('FailedToUploadAttachment') as string)
    }
  }
  updateUrl(url: string, id: any, ossKey: string) {
    this.$emit('on-upload', url, id, ossKey)
  }
  showUrl(url: string) {
    this.url = url
  }
}
