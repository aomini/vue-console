import Vue from 'vue'
import Component from 'vue-class-component'
import './Project.less'
import { user } from '@/services'
import { AwsOssRegion, CNVendors, ENVendors, ServiceType, UploadPolicyOptions } from '@/models/ModerationModels'

@Component({
  template: ` <div class="page-v3 moderation-page">
    <div class="d-flex">
      <span class="mr-10" @click="backToEditProject"><i class="el-icon-arrow-left"></i></span>
      <el-breadcrumb separator="|" class="mb-20">
        <el-breadcrumb-item :to="{ path: '/project/' + projectId }">{{ $t('EditProjectTitle') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $t('Content Moderation Configuration') }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="card" v-loading="loading">
      <el-form :model="data" size="small" label-width="180px" ref="submit-form" :rules="rules">
        <div class="module-item-title">{{ $t('Content Moderation Configuration') }}</div>
        <div class="w-500 m-auto">
          <el-form-item :label="$t('Service type') + ':'" prop="service_type">
            <el-checkbox v-model="data.service_type" :label="ServiceType.Supervision">
              {{ $t('Supervision') }}
              <el-tooltip
                :content="$t('Only capture screen then upload images.')"
                placement="top"
                popper-class="mw-250"
                effect="light"
              >
                <i class="el-icon-info project-tooltip"></i>
              </el-tooltip>
            </el-checkbox>
            <el-checkbox v-model="data.service_type" :label="ServiceType['Content Moderation']">
              {{ $t('Project Content moderation') }}
              <el-tooltip
                :content="$t('Capture screen and do content moderation, then upload images.')"
                placement="top"
                popper-class="mw-250"
                effect="light"
                class="mr-5"
              >
                <i class="el-icon-info project-tooltip"></i>
              </el-tooltip>
            </el-checkbox>
          </el-form-item>
          <el-form-item
            :label="$t('Supervision callback url') + ':'"
            v-if="data.service_type.includes(ServiceType['Supervision'])"
            prop="callback_url_supervisor"
          >
            <el-input v-model="data.callback_url_supervisor"></el-input>
          </el-form-item>
          <el-form-item
            :label="$t('Content moderation callback url') + ':'"
            v-if="data.service_type.includes(ServiceType['Content Moderation'])"
            prop="callback_url"
          >
            <el-input v-model="data.callback_url"></el-input>
          </el-form-item>
        </div>
        <div class="w-500 m-auto" v-if="data.service_type.includes(ServiceType['Content Moderation'])">
          <el-form-item :label="$t('Cloud server threshold') + ':'">
            <el-radio-group v-model="scoreThresholdType" @change="scoreThresholdTypeChange">
              <el-radio label="default">{{ $t('Default') }}</el-radio>
              <el-radio label="customization">{{ $t('Customization') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="scoreThresholdType === 'customization'">
            <div v-for="(item, index) in data.score_threshold" :key="item.scene + index">
              <el-form-item :prop="'score_threshold.' + index + '.scene'" :rules="rules.scene" class="d-inline-block">
                <el-select v-model="item.scene" size="mini" class="w-100px" :placeholder="$t('scene')">
                  <el-option v-for="item in sceneOptions" :key="item" :label="$t(item)" :value="item"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                :prop="'score_threshold.' + index + '.threshold'"
                :rules="rules.threshold"
                class="d-inline-block"
              >
                <el-input v-model.number="item.threshold" :placeholder="$t('threshold')" class="w-100px"></el-input>
              </el-form-item>
              <span class="link" @click="deleteThreshold(index)">{{ $t('Delete') }}</span>
            </div>
            <span class="link" v-if="data.score_threshold.length < 2" @click="addThreshold">{{
              $t('Add threshold')
            }}</span>
          </el-form-item>
          <el-form-item :label="$t('Upload policy') + ':'" prop="moderation_upload_policy">
            <el-checkbox-group v-model="data.moderation_upload_policy">
              <el-checkbox v-for="item in uploadPolicyOptions" :label="item.value" :key="item.value">{{
                $t(item.label)
              }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        <div class="w-500 m-auto">
          <el-form-item :label="$t('Storage')" prop="oss_vendor">
            <el-select v-model="data.oss_vendor" size="mini" class="w-220">
              <el-option v-for="item in vendorOptions" :key="item.value" :label="$t(item.label)" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <div v-if="data.oss_vendor === 'aws'" key="aws">
            <el-form-item :label="$t('Region')" prop="aws_oss_region">
              <el-input v-model="data.aws_oss_region"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Access key:')" prop="aws_oss_access_key_id">
              <el-input v-model="data.aws_oss_access_key_id"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Secret key:')" prop="aws_oss_access_key_secret">
              <el-input v-model="data.aws_oss_access_key_secret"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Bucket name:')" prop="aws_oss_bucket_name">
              <el-input v-model="data.aws_oss_bucket_name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('End point:')" prop="aws_oss_endpoint">
              <el-input v-model="data.aws_oss_endpoint"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Filename prefix:')">
              <el-input v-model="data.aws_oss_fileName_prefix"></el-input>
            </el-form-item>
          </div>
          <div v-if="data.oss_vendor === 'aliyun'" key="aliyun">
            <el-form-item :label="$t('Access key:')" prop="aliyun_oss_access_key_id">
              <el-input v-model="data.aliyun_oss_access_key_id"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Secret key:')" prop="aliyun_oss_access_key_secret">
              <el-input v-model="data.aliyun_oss_access_key_secret"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Bucket name:')" prop="aliyun_oss_bucket_name">
              <el-input v-model="data.aliyun_oss_bucket_name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('End point:')" prop="aliyun_oss_endpoint">
              <el-input v-model="data.aliyun_oss_endpoint"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Filename prefix:')" prop="aliyun_oss_fileName_prefix">
              <el-input v-model="data.aliyun_oss_fileName_prefix"></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="link text-right">
          <a :href="$t('Content Moderation Doc Url')" target="_blank">{{ $t('How to config') }}</a>
        </div>
        <div class="text-center pager-button-line">
          <div class="divider"></div>
          <console-button class="console-btn-size-md console-btn-primary" @click="comfirmCommit()">
            {{ $t('Save') }}
          </console-button>
          <console-button class="console-btn-size-md" @click="onClickCancel">
            {{ $t('Cancel') }}
          </console-button>
        </div>
      </el-form>
    </div>
    <el-dialog :title='$t("Confirm")' :visible.sync="showConfirmDialog" width="380px">
      <div class="p-2">
        <div>
          <span>{{ $t('Confirm to update content moderation configuration') }} </span>
        </div>
        <div class="mt-20 text-right">
          <console-button class="console-btn-primary" @click="updateConfig()" :disabled="loading" v-loading="loading">
            {{ $t('Confirm') }}
          </console-button>
          <console-button class="console-btn-white" @click="() => showConfirmDialog = false">
            {{ $t('Cancel') }}
          </console-button>
        </div>
      </div>
    </el-dialog>
  </div>`,
})
export default class EditModerationView extends Vue {
  loading = false
  showConfirmDialog = false
  projectId = ''
  ServiceType = ServiceType
  scoreThresholdType = 'default'
  sceneOptions = ['porn', 'sexy', 'neutral']
  data: any = {
    service_type: [ServiceType.Supervision, ServiceType['Content Moderation']],
    callback_url_supervisor: '',
    score_threshold: [],
    oss_vendor: 'aliyun',
    aliyun_oss_access_key_id: '',
    aliyun_oss_access_key_secret: '',
    aliyun_oss_bucket_name: '',
    aliyun_oss_endpoint: '',
    aliyun_oss_fileName_prefix: '',
    aws_oss_access_key_id: '',
    aws_oss_access_key_secret: '',
    aws_oss_bucket_name: '',
    aws_oss_endpoint: '',
    aws_oss_region: '',
    aws_oss_fileName_prefix: '',
    moderation_upload_policy: ['porn', 'sexy'],
    callback_url: '',
  }
  vendorOptions = user.info.company.area === 'CN' ? CNVendors : ENVendors
  awsRegionOptions = AwsOssRegion
  uploadPolicyOptions = UploadPolicyOptions
  rules: any = {
    service_type: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    callback_url_supervisor: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    callback_url: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    oss_vendor: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aws_oss_access_key_id: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aws_oss_access_key_secret: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aws_oss_bucket_name: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aws_oss_endpoint: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aws_oss_region: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aliyun_oss_access_key_id: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aliyun_oss_access_key_secret: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aliyun_oss_bucket_name: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aliyun_oss_endpoint: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    aliyun_oss_fileName_prefix: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    scene: [{ required: true, message: this.$t('InvalidParam'), trigger: 'blur' }],
    threshold: [{ required: true, pattern: /0.\d+/, message: this.$t('InvalidParam'), trigger: 'blur' }],
  }

  async mounted() {
    this.projectId = this.$route.params.id
    this.getProjectConfig()
  }

  async getProjectConfig() {
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.$route.params.id}/moderation`)
      const content = JSON.parse(res.data.data.content)
      this.data = Object.assign({}, this.data, content)
      if (this.data.score_threshold && this.data.score_threshold.length > 0) {
        this.scoreThresholdType = 'customization'
      }
    } catch (e) {}
    this.loading = false
  }

  backToEditProject() {
    this.$router.push({ path: '/project/' + this.projectId })
  }

  comfirmCommit() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.showConfirmDialog = true
      } else {
        return false
      }
    })
  }

  async updateConfig() {
    try {
      const submitParams = Object.assign({}, this.data)
      if (submitParams.score_threshold.length === 0) {
        delete submitParams['score_threshold']
      }
      const params = {
        content: JSON.stringify(submitParams),
      }
      await this.$http.post(`/api/v2/project/${this.$route.params.id}/moderation`, params)
      this.$message({
        message: this.$t('Updated successfully') as string,
        type: 'success',
      })
      this.showConfirmDialog = false
    } catch (e) {
      this.$message.error(this.$t('Failed to update') as string)
    }
  }

  onClickCancel() {
    this.$router.go(-1)
  }

  scoreThresholdTypeChange(value: string) {
    if (value === 'default') {
      this.data.score_threshold = []
    } else {
      this.data.score_threshold = [{ scene: '', threshold: '' }]
    }
  }

  addThreshold() {
    this.data.score_threshold.push({ scene: '', threshold: '' })
  }

  deleteThreshold(index: number) {
    this.data.score_threshold.splice(index, 1)
  }
}
