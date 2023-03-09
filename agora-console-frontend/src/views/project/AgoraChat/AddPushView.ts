import Vue from 'vue'
import Component from 'vue-class-component'
import { PushProvidersCN, PushProvidersEN } from '@/models'
import { Prop } from 'vue-property-decorator'
import FileUpload from '@/views/packages/AgoraChat/FileUpload'
import { user } from '@/services'

@Component({
  components: {
    FileUpload,
  },
  template: ` <el-dialog
    :title='$t("Add Push Certificate")'
    :visible="showDialog"
    class="push-certificate"
    :before-close="closeDialog"
  >
    <el-radio-group v-model="data.provider" type="card" @change="handleProviderChange">
      <el-radio-button :label="item.provider" v-for="item in PushProviders" :key="item.provider">{{
        $t(item.provider)
      }}</el-radio-button>
    </el-radio-group>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'GOOGLE'"
      :rules="GOOGLERules"
    >
      <el-form-item :label="$t('Certificate Name')" prop="push_app_id">
        <el-input v-model="data.push_app_id" :placeholder="$t('Please enter FCM SenderID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Push Secret')" prop="push_app_key">
        <el-input v-model="data.push_app_key" :placeholder="$t('Please enter FCM Server Key')"></el-input>
      </el-form-item>
    </el-form>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'APPLE'"
      :rules="data.appleType==='p12'? AppleP12Rules : AppleP8Rules"
    >
      <div class="module-hint mb-20">
        <div class="heading-dark-13">
          {{
            $t('Certificate needs to be uploaded seperately in the development environment and production environment.')
          }}
        </div>
      </div>
      <el-form-item :label="$t('App Package Name')" prop="package_name">
        <el-input v-model="data.package_name" :placeholder="$t('Please enter Apple App Package Name')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Bind ID')" prop="push_name">
        <el-input v-model="data.push_name" :placeholder="$t('Please enter Bind ID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Type')">
        <el-radio-group v-model="data.appleType" type="card" @change="handleAppleTypeChange">
          <el-radio label="p12"></el-radio>
          <el-radio label="p8"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('Certificate Name')" prop="name">
        <el-input v-model="data.name" :placeholder="$t('Please enter Certificate Name')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Secret')" prop="push_app_secret" v-if="data.appleType === 'p12'">
        <el-input v-model="data.push_app_secret" :placeholder="$t('Please enter Certificate Secret')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Upload')" prop="push_app_certificate">
        <FileUpload @updateFileData="updateFileData" :acceptType="'.' + data.appleType"></FileUpload>
      </el-form-item>
      <el-form-item :label="$t('Key ID')" prop="push_app_key" v-if="data.appleType === 'p8'">
        <el-input v-model="data.push_app_key" :placeholder="$t('Please enter Certificate key id')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Team ID')" prop="push_app_id" v-if="data.appleType === 'p8'">
        <el-input v-model="data.push_app_id" :placeholder="$t('Please enter Certificate team id')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Environment')">
        <el-radio v-model="data.environment" label="DEVELOPMENT">{{ $t('Development Environment') }}</el-radio>
        <el-radio v-model="data.environment" label="PRODUCTION">{{ $t('Production Environment') }}</el-radio>
      </el-form-item>
    </el-form>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'HUAWEI'"
      :rules="HUAWEIRules"
    >
      <el-form-item :label="$t('Certificate Name')" prop="push_app_id">
        <el-input v-model="data.push_app_id" :placeholder="$t('Please enter Huawei App ID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Secret')" prop="push_app_secret">
        <el-input v-model="data.push_app_secret" :placeholder="$t('Please enter Huawei App Secret')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('App Package Name')" prop="package_name">
        <el-input v-model="data.package_name" :placeholder="$t('Please enter Huawei App Package Name')"></el-input>
      </el-form-item>
    </el-form>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'XIAOMI'"
      :rules="XIAOMIRules"
    >
      <el-form-item :label="$t('Certificate Name')" prop="push_app_id">
        <el-input v-model="data.push_app_id" :placeholder="$t('Please enter Xiaomi App ID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Secret')" prop="push_app_secret">
        <el-input v-model="data.push_app_secret" :placeholder="$t('Please enter Xiaomi App Secret')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('App Package Name')" prop="package_name">
        <el-input v-model="data.package_name" :placeholder="$t('Please enter Xiaomi App Package Name')"></el-input>
      </el-form-item>
    </el-form>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'OPPO'"
      :rules="OPPORules"
    >
      <el-form-item :label="$t('Certificate Name')" prop="push_app_key">
        <el-input v-model="data.push_app_key" :placeholder="$t('Please enter OPPO App ID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Secret')" prop="push_app_secret">
        <el-input v-model="data.push_app_secret" :placeholder="$t('Please enter OPPO Master Secret')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('App Package Name')" prop="package_name">
        <el-input v-model="data.package_name" :placeholder="$t('Please enter OPPO App Package Name')"></el-input>
      </el-form-item>
    </el-form>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'VIVO'"
      :rules="VIVORules"
    >
      <el-form-item :label="$t('Certificate Name')" prop="push_app_id">
        <el-input v-model="data.push_app_id" :placeholder="$t('Please enter VIVO App ID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Key')" prop="push_app_key">
        <el-input v-model="data.push_app_key" :placeholder="$t('Please enter VIVO App Key')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Secret')" prop="push_app_secret">
        <el-input v-model="data.push_app_secret" :placeholder="$t('Please enter VIVO App Secret')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('App Package Name')" prop="package_name">
        <el-input v-model="data.package_name" :placeholder="$t('Please enter VIVO App Package Name')"></el-input>
      </el-form-item>
    </el-form>
    <el-form
      :model="data"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="data.provider === 'MEIZU'"
      :rules="MEIZURules"
    >
      <el-form-item :label="$t('Certificate Name')" prop="push_app_id">
        <el-input v-model="data.push_app_id" :placeholder="$t('Please enter Meizu App ID')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Certificate Secret')" prop="push_app_secret">
        <el-input v-model="data.push_app_secret" :placeholder="$t('Please enter Meizu App Secret')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('App Package Name')" prop="package_name">
        <el-input v-model="data.package_name" :placeholder="$t('Please enter Meizu App Package Name')"></el-input>
      </el-form-item>
    </el-form>
    <div class="mt-20 text-right">
      <console-button class="console-btn-white" @click="closeDialog">
        {{ $t('Cancel') }}
      </console-button>
      <console-button
        class="console-btn-primary"
        :disabled="loading"
        :loading="loading"
        @click="validatePushCertificate"
      >
        {{ $t('Save') }}
      </console-button>
    </div>
  </el-dialog>`,
})
export default class AddPushView extends Vue {
  @Prop({ default: null, type: Function }) readonly updatePushInfo!: () => Promise<void>
  showDialog = false
  loading = false
  data = {
    provider: 'GOOGLE',
    name: '',
    package_name: '',
    push_app_key: '',
    push_app_id: '',
    push_app_secret: '',
    push_app_certificate: '',
    environment: 'PRODUCTION',
    appleType: 'p12',
  }
  PushProviders = user.info.company.area === 'CN' ? PushProvidersCN : PushProvidersEN
  AppleP12Rules: any = {
    push_name: [{ required: true, message: this.$t('Please enter Bind ID') }],
    package_name: [{ required: true, message: this.$t('Please enter Apple App Package Name') }],
    name: [{ required: true, message: this.$t('Please enter Certificate Name') }],
    push_app_secret: [{ required: true, message: this.$t('Please enter Certificate Secret') }],
    push_app_certificate: [{ required: true, message: this.$t('Upload File') }],
  }
  AppleP8Rules: any = {
    push_name: [{ required: true, message: this.$t('Please enter Bind ID') }],
    package_name: [{ required: true, message: this.$t('Please enter Apple App Package Name') }],
    name: [{ required: true, message: this.$t('Please enter Certificate Name') }],
    push_app_key: [{ required: true, message: this.$t('Please enter Certificate key id') }],
    push_app_id: [{ required: true, message: this.$t('Please enter Certificate team id') }],
    push_app_certificate: [{ required: true, message: this.$t('Upload File') }],
  }
  GOOGLERules: any = {
    push_app_id: [{ required: true, message: this.$t('Please enter FCM SenderID') }],
    push_app_key: [{ required: true, message: this.$t('Please enter FCM Server Key') }],
  }
  HUAWEIRules: any = {
    push_app_id: [{ required: true, message: this.$t('Please enter Huawei App ID') }],
    push_app_secret: [{ required: true, message: this.$t('Please enter Huawei App Secret') }],
    package_name: [{ required: true, message: this.$t('Please enter Huawei App Package Name') }],
  }
  XIAOMIRules: any = {
    push_app_id: [{ required: true, message: this.$t('Please enter Xiaomi App ID') }],
    push_app_secret: [{ required: true, message: this.$t('Please enter Xiaomi App Secret') }],
    package_name: [{ required: true, message: this.$t('Please enter Xiaomi App Package Name') }],
  }
  VIVORules: any = {
    push_app_id: [{ required: true, message: this.$t('Please enter VIVO App ID') }],
    push_app_key: [{ required: true, message: this.$t('Please enter VIVO App Key') }],
    push_app_secret: [{ required: true, message: this.$t('Please enter VIVO App Secret') }],
    package_name: [{ required: true, message: this.$t('Please enter VIVO App Package Name') }],
  }
  MEIZURules: any = {
    push_app_id: [{ required: true, message: this.$t('Please enter Meizu App ID') }],
    push_app_secret: [{ required: true, message: this.$t('Please enter Meizu App Secret') }],
    package_name: [{ required: true, message: this.$t('Please enter Meizu App Package Name') }],
  }
  OPPORules: any = {
    package_name: [{ required: true, message: this.$t('Please enter OPPO App Package Name') }],
    push_app_key: [{ required: true, message: this.$t('Please enter OPPO App ID') }],
    push_app_secret: [{ required: true, message: this.$t('Please enter OPPO Master Secret') }],
  }

  openDialog() {
    this.showDialog = true
  }

  closeDialog() {
    this.showDialog = false
    this.data = {
      provider: 'GOOGLE',
      name: '',
      package_name: '',
      push_app_key: '',
      push_app_id: '',
      push_app_secret: '',
      push_app_certificate: '',
      environment: 'PRODUCTION',
      appleType: 'p12',
    }
  }

  validatePushCertificate() {
    let params = {}
    if (this.data.provider === 'GOOGLE') {
      params = _.pick(this.data, ['provider', 'push_app_key', 'push_app_id', 'environment'])
    }
    if (this.data.provider === 'APPLE' && this.data.appleType === 'p12') {
      params = _.pick(this.data, [
        'push_name',
        'package_name',
        'name',
        'provider',
        'push_app_certificate',
        'push_app_secret',
        'environment',
      ])
    }
    if (this.data.provider === 'APPLE' && this.data.appleType === 'p8') {
      params = _.pick(this.data, [
        'push_name',
        'package_name',
        'name',
        'provider',
        'push_app_certificate',
        'push_app_id',
        'push_app_key',
        'environment',
      ])
    }
    if (this.data.provider === 'HUAWEI' || this.data.provider === 'XIAOMI' || this.data.provider === 'MEIZU') {
      params = _.pick(this.data, ['provider', 'push_app_secret', 'push_app_id', 'environment', 'package_name'])
    }
    if (this.data.provider === 'OPPO') {
      params = _.pick(this.data, ['provider', 'push_app_secret', 'push_app_key', 'package_name', 'environment'])
    }
    if (this.data.provider === 'VIVO') {
      params = _.pick(this.data, [
        'provider',
        'push_app_secret',
        'push_app_id',
        'push_app_key',
        'environment',
        'package_name',
      ])
    }

    ;(this.$refs['info'] as any).validate(async (valid: any) => {
      if (valid) {
        this.createPushCertificate(params)
      } else {
        return false
      }
    })
  }

  async createPushCertificate(params: any) {
    this.loading = true
    try {
      await this.$http.post(`/api/v2/project/${this.$route.params.id}/chat/push`, params)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.closeDialog()
      this.updatePushInfo()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  updateFileData(data: string) {
    this.data.push_app_certificate = data
  }

  handleProviderChange(provider: string) {
    this.data = {
      provider: provider,
      name: '',
      package_name: '',
      push_app_key: '',
      push_app_id: '',
      push_app_secret: '',
      push_app_certificate: '',
      environment: 'PRODUCTION',
      appleType: 'p12',
    }
    ;(this.$refs['info'] as any).clearValidate()
  }

  handleAppleTypeChange(type: string) {
    this.data = {
      provider: 'APPLE',
      name: '',
      package_name: '',
      push_app_key: '',
      push_app_id: '',
      push_app_secret: '',
      push_app_certificate: '',
      environment: 'PRODUCTION',
      appleType: type,
    }
    ;(this.$refs['info'] as any).clearValidate()
  }
}
