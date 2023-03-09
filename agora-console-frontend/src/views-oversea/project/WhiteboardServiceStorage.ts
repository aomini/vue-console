import Vue from 'vue'
import Component from 'vue-class-component'
import './Project.less'
import { listStorage, saveStorage } from '@/services/whiteboard'
import { Prop } from 'vue-property-decorator'

@Component({
  components: {},
  template: `<div>
    <el-form ref="form" :model="form" :rules="formRules" size="mini" label-width="120px">
      <el-form-item class="pb-2" :label="$t('Name')" required prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('Vendor')" required prop="provider">
        <el-select v-model="form.provider" @change="updateSelectableRegions" style="min-width: 360px;">
          <el-option
            v-for="provider in selectableProviders"
            :value="provider.value"
            :key="provider.value"
            :label="provider.nameEN || provider.nameCN"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('Region')" required prop="region">
        <el-select v-model="form.region" style="min-width: 360px;">
          <el-option
            v-for="region in selectableRegions"
            :value="region.value"
            :key="region.value"
            :label="(region.nameEN || region.nameCN) + ' / ' + region.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('accessKey:')" required prop="ak">
        <el-input v-model="form.ak"></el-input>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('secretKey:')" required prop="sk">
        <el-input v-model="form.sk"></el-input>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('bucket:')" required prop="bucket">
        <el-input v-model="form.bucket"></el-input>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('storage path')" prop="path">
        <el-input v-model="form.path"></el-input>
      </el-form-item>
      <el-form-item class="pb-2" :label="$t('domain')" :required="form.provider==='qiniu'" prop="domain">
        <el-input v-model="form.domain" :placeholder="$t('recommendToUseHttps')"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">{{ createNew ? $t('Create') : $t('Save') }}</el-button>
        <el-button @click="onClose">{{ $t('Cancel') }}</el-button>
      </el-form-item>
    </el-form>
  </div>`,
})
export default class WhiteboardServiceStorage extends Vue {
  @Prop({ default: 0, required: true, type: Number }) readonly vendorId!: number
  @Prop({ default: '', required: true, type: String }) readonly dataRegion!: string
  @Prop({ default: 0, required: false, type: Number }) readonly storageId?: number
  @Prop({ default: 0, required: false, type: Number }) readonly storageInfo!: any
  @Prop({ default: '', required: true, type: Boolean }) readonly createNew!: string
  @Prop({ default: '', required: false, type: Function }) readonly onSuccess?: (result: any) => Promise<void>
  @Prop({ default: '', required: false, type: Function }) readonly onFailed?: (result: any) => Promise<void>
  @Prop({ default: '', required: false, type: Function }) readonly onClose?: () => Promise<void>

  storages: any[] = []
  regionMap: any = {}
  form: any = this.emptyFormData()
  selectableProviders: any[] = []
  selectableRegions: any[] = []

  formRules = {
    name: [
      { required: true, message: this.$t('RequiredParam'), trigger: 'blur' },
      { min: 1, max: 100, message: 'length >= 1 and <= 100', trigger: 'blur' },
    ],
    provider: [{ required: true, message: this.$t('RequiredParam'), trigger: 'blur' }],
    region: [{ required: true, message: this.$t('RequiredParam'), trigger: 'blur' }],
    ak: [{ required: true, message: this.$t('RequiredParam'), trigger: 'blur' }],
    sk: [{ required: true, message: this.$t('RequiredParam'), trigger: 'blur' }],
    bucket: [{ required: true, message: this.$t('RequiredParam'), trigger: 'blur' }],
    domain: [
      {
        message: this.$t('RequiredParam'),
        validator: (rule: any, value: string, callback: any) => {
          if (this.form.provider === 'qiniu' && !value) {
            return callback(new Error(this.$t('RequiredParam') as string))
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  }

  emptyFormData() {
    return {
      name: '',
      dataRegion: '',
      provider: '',
      region: '',
      ak: '',
      sk: '',
      bucket: '',
      path: '',
      domain: '',
    }
  }

  async mounted() {
    const res: any = await listStorage(this.vendorId)
    this.storages = res.storages || []
    this.regionMap = res.regionMap || {}
    this.selectableProviders = this.regionMap[this.dataRegion || '']?.provider
    this.form.dataRegion = this.dataRegion
    this.tryToFillBlanks()
  }

  updateSelectableRegions() {
    this.form.region = ''
    this.selectableRegions = this.regionMap[this.dataRegion || '']?.provider.filter(
      (provider: any) => provider.value === this.form.provider
    )[0].region
  }

  tryToFillBlanks() {
    if (!this.storageId) return
    this.form = this.storages.filter((storage: any) => parseInt(storage.id) === this.storageId)[0]
    this.form.dataRegion = this.dataRegion
    const selectedRegion = this.form.region
    this.updateSelectableRegions()
    this.form.region = selectedRegion
    if (this.createNew || !this.form.name) {
      this.form.name = [this.form.provider, this.form.region, this.form.bucket, this.form.path].join('/')
    }
  }

  getFormData() {
    if (this.storageId) {
      this.form.id = this.storageId
    }
    if (this.createNew) {
      this.form.id = undefined
    }
    return this.form
  }

  onSubmit(formName: string) {
    const that = this
    function confirm(onConfirm: Function) {
      that
        .$confirm(that.$t('ConfirmTip') as string, that.$t('Warning') as string, {
          confirmButtonText: that.$t('Confirm') as string,
          cancelButtonText: that.$t('Cancel') as string,
          type: 'warning',
        })
        .then(async () => {
          await onConfirm()
        })
    }
    async function save() {
      const res = await saveStorage(that.vendorId, that.getFormData(), (e: any) => {
        if (e.response?.status === 400 && e.response?.data?.msg) {
          that.$message.error(that.$t(e.response?.data?.msg) as string)
        } else {
          that.$message.error(that.$t('SavedFail') as string)
        }
        throw 0
      })
      if (res) {
        that.$message.success(that.$t('SavedSuccess') as string)
        that.onSuccess ? that.onSuccess(res) : null
        that.onClose ? that.onClose() : null
      } else {
        that.$message.error(that.$t('SavedFail') as string)
        that.onFailed ? that.onFailed(res) : null
      }
    }
    ;(this.$refs[formName] as any).validate((valid: any) => {
      if (valid) {
        if (this.createNew) {
          save()
        } else {
          confirm(save)
        }
      }
    })
  }
}
