import Vue from 'vue'
import Component from 'vue-class-component'
import { CertificateModel } from '@/models/CDNModels'
import { Prop } from 'vue-property-decorator'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: ` <div class="form-box">
    <div class="form-box_buttons" v-if="certificate.hasCreated">
      <el-button size="mini" type="text" @click="deleteCertificate(certificate)" style="color: #8A8A9A">
        <i class="iconfont iconicon-shanchu f-20 popover-btn"></i
      ></el-button>
      <el-button size="mini" type="text" @click="certificate.editable = true">
        <i class="iconfont iconicon-bianjineirong f-20 popover-btn" style="color: #409EFF"></i
      ></el-button>
    </div>
    <el-row>
      <el-col :span="7">
        <span :class="{ 'required form-box-label': !certificate.hasCreated }">{{ $t('Certification name') }}</span>
      </el-col>
      <el-col :span="17">
        <el-input v-if="!certificate.hasCreated" v-model="certificate.name" size="small"></el-input>
        <span v-else>{{ certificate.name }}</span>
      </el-col>
      <el-col :span="17" :offset="7" v-if="certificate.hasCreated">
        <div class="module-title-tip form-box-tip">
          {{ $t('CertificationTip') }}
        </div>
      </el-col>
    </el-row>
    <el-row type="flex" align="middle">
      <el-col :span="7">
        <span :class="{ 'required': certificate.editable }">{{ $t('Certification') }}</span>
        <el-tooltip
          :content='$t("Upload Certification Hint")'
          placement="top"
          effect="light"
          class="mr-10 prject-tooltip"
        >
          <img class="ml-3" width="15" :src="IconQuestion" alt=""
        /></el-tooltip>
      </el-col>
      <el-col :span="14">
        <span class="heading-light-05 mr-10" v-if="certificate.crt"> {{ $t('Uploaded') }} </span>
        <el-upload
          v-if="certificate.editable"
          class="d-inline-block"
          action=""
          accept=""
          :show-file-list="false"
          :on-change="beforeCertificationUpload"
          :auto-upload="false"
        >
          <el-button style="padding: 0" size="small" type="text">
            {{ certificate.crt ? $t('Reupload Certification') : $t('Upload Certification') }}
          </el-button>
        </el-upload>
      </el-col>
    </el-row>
    <el-row type="flex" align="middle">
      <el-col :span="7">
        <span :class="{ 'required': certificate.editable }"> {{ $t('Key') }} </span>
        <el-tooltip :content='$t("Upload Key Hint")' placement="top" effect="light" class="mr-10 prject-tooltip">
          <img class="ml-3" width="15" :src="IconQuestion" alt=""
        /></el-tooltip>
      </el-col>
      <el-col :span="14">
        <span class="heading-light-05 mr-10" v-if="certificate.key"> {{ $t('Uploaded') }} </span>
        <el-upload
          v-if="certificate.editable"
          class="d-inline-block"
          action=""
          accept=""
          :show-file-list="false"
          :on-change="beforeKeyUpload"
          :auto-upload="false"
        >
          <el-button style="padding: 0" size="small" type="text">
            {{ certificate.key ? $t('Reupload Key') : $t('Upload Key') }}
          </el-button>
        </el-upload>
      </el-col>
    </el-row>
    <el-row class="mb-0" type="flex" justify="end" v-if="certificate.editable">
      <el-button size="mini" @click="cancelCertificateSetting(certificate)">
        {{ $t('Cancel') }}
      </el-button>
      <el-button size="mini" type="primary" @click="saveCertificateSetting(certificate)">
        {{ $t('Save') }}
      </el-button>
    </el-row>
  </div>`,
})
export default class CertificateCard extends Vue {
  @Prop({ default: {}, type: Object }) readonly certificate!: CertificateModel
  @Prop({ default: '', type: String }) readonly projectId!: string
  loading = false
  vendorInfo: any = {}
  IconQuestion = IconQuestion

  async deleteCertificate(certificate: CertificateModel) {
    this.$confirm(this.$t('Delete Certification Hint') as string, this.$t('Delete Certification') as string, {
      confirmButtonText: this.$t('Confirm') as string,
      cancelButtonText: this.$t('Cancel') as string,
      customClass: 'message-box-warning',
      dangerouslyUseHTMLString: true,
    }).then(async () => {
      this.loading = true
      await this.$http.delete(`/api/v2/project/${this.projectId}/cdn/certificate/${certificate.name}`)
      this.$message.success(this.$t('DeleteCertSuccess') as string)
      this.$emit('updateCertificate')
      this.loading = false
    })
  }

  cancelCertificateSetting(certificate: CertificateModel) {
    if (certificate.hasCreated) {
      certificate.editable = false
    } else {
      this.$emit('deleteUncreatedCertificate')
    }
  }

  async saveCertificateSetting(certificate: CertificateModel) {
    if (
      !(certificate.key && certificate.crt && certificate.name) ||
      certificate.key === '*' ||
      certificate.crt === '*'
    ) {
      this.$message.warning(this.$t('Invalid parameter') as string)
      return
    }
    this.loading = true
    try {
      if (certificate.hasCreated) {
        await this.$http.put(`/api/v2/project/${this.projectId}/cdn/certificate/${certificate.name}`, {
          crt: certificate.crt === '*' ? undefined : certificate.crt,
          key: certificate.key === '*' ? undefined : certificate.key,
        })
        this.$message.success(this.$t('Updated successfully') as string)
      } else {
        await this.$http.post(`/api/v2/project/${this.projectId}/cdn/certificate`, {
          key: certificate.key,
          crt: certificate.crt,
          name: certificate.name,
        })
        this.$message.success(this.$t('SaveSucess') as string)
      }
      this.$emit('updateCertificate')
    } catch (e) {
      this.$message.error(this.$t(`CDN Wrong Message.${e.message}`) as string)
    }
    this.loading = false
  }

  async beforeCertificationUpload(file: any) {
    try {
      if (file.raw.type !== 'application/x-x509-ca-cert') {
        this.$message.error(this.$t('FileTypeError') as string)
        return Promise.reject()
      }

      if (file.raw.size > 20 * 1024 * 1024) {
        this.$message.warning(this.$t('FileSizeTooLarge20') as string)
        return Promise.reject()
      }

      const fileReader = new FileReader()
      fileReader.readAsText(file.raw, 'UTF-8')
      fileReader.onload = (evt) => {
        this.certificate.crt = (evt.currentTarget as any).result
        this.certificate.crtFile = file.name
        this.$message.success(this.$t('UploadSuccess') as string)
      }
    } catch (e) {
      this.$message.error(this.$t('FailedToUploadAttachment') as string)
    }
  }

  async beforeKeyUpload(file: any) {
    try {
      if (file.size > 20 * 1024 * 1024) {
        this.$message.warning(this.$t('FileSizeTooLarge20') as string)
        return Promise.reject()
      }

      const fileReader = new FileReader()
      fileReader.readAsText(file.raw, 'UTF-8')
      fileReader.onload = (evt) => {
        this.certificate.key = (evt.currentTarget as any).result
        this.certificate.keyFile = file.name
        this.$message.success(this.$t('UploadSuccess') as string)
      }
    } catch (e) {
      this.$message.error(this.$t('FailedToUploadAttachment') as string)
    }
  }
}
