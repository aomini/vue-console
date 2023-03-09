import Vue from 'vue'
import Component from 'vue-class-component'
import './VendorApply.less'
import { VendorApplyStatus } from '@/models/paasModels'
import PhotoUploadItem from '@/views/paas/vendorApply/PhotoUploadItem'
import FilleUploadItem from '@/views/paas/vendorApply/FilleUploadItem'
import { i18n } from '@/i18n-setup'
import { RouteRecord } from 'vue-router/types/router'

@Component({
  components: {
    'photo-upload-item': PhotoUploadItem,
    'file-upload-item': FilleUploadItem,
  },
  template: `
    <div class="vendor-apply">
      <div class="d-flex">
        <span class="mr-10" @click="backToApplyList"><i class="el-icon-arrow-left"></i></span>
        <el-breadcrumb separator="|" class="mb-20">
          <el-breadcrumb-item :to="{ path: '/marketplace/apply/list' }">{{ $t('Back') }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ $t('New Apply') }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div v-loading="loading">
        <el-form :model="data" size="small" label-width="300px" label-position="left" :rules="rules" ref="submit-form">
          <div class="apply-module-title">{{ $t('vendorApply.Service Information') }}</div>
          <div w:p="x-20px">
            <el-form-item prop="serviceArea">
              <span slot="label">
                {{ $t('vendorApply.Service Area') }}
              </span>
              <el-select v-model="data.serviceArea" style="width:100%">
                <el-option
                  v-for="option in serviceAreaOption"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="extensionType">
              <span slot="label">
                {{ $t('vendorApply.Extension Type') }}
              </span>
              <el-cascader
                style="width:100%"
                v-if="data.serviceArea === '1'"
                v-model="data.extensionType"
                :options="normalCategoryOption"
                :props="{ checkStrictly: true }"
              ></el-cascader>
              <el-cascader
                v-else
                style="width:100%"
                v-model="data.extensionType"
                :options="overseaCategoryOption"
                :props="{ checkStrictly: true }"
              ></el-cascader>
            </el-form-item>
          </div>

          <div class="apply-module-title">{{ $t('vendorApply.Vendor Information') }}</div>
          <div w:p="x-20px">
            <el-form-item prop="vendorName">
              <span slot="label">
                {{ $t('vendorApply.Vendor Name') }}
              </span>
              <el-input v-model="data.vendorName" :placeholder="$t('vendorApply.Vendor Name placeholder')"></el-input>
            </el-form-item>
            <el-form-item prop="vendorLogoSquareKey">
              <span slot="label">
                {{ $t('vendorApply.Vendor Logo（Square）') }}
              </span>
              <photo-upload-item
                ref="logoSquareFile"
                prop-key="vendorLogoSquareKey"
                @on-upload="onLogoSquareUpload"
              ></photo-upload-item>
              <div class="apply-form-content-addition">.png/.jpg/.jpeg, 500*500px</div>
            </el-form-item>
            <el-form-item prop="vendorLogoRectangleKey">
              <span slot="label">
                {{ $t('vendorApply.Vendor Logo（Rectangle）') }}
              </span>
              <photo-upload-item
                ref="logoRectangleFile"
                prop-key="vendorLogoRectangleKey"
                @on-upload="onLogoRectangleUpload"
              ></photo-upload-item>
              <div class="apply-form-content-addition">.png/.jpg/.jpeg, 1000*500px</div>
            </el-form-item>
            <el-form-item prop="vendorWebsite">
              <span slot="label">
                {{ $t('vendorApply.Vendor Website') }}
              </span>
              <el-input v-model="data.vendorWebsite" placeholder="https://xxxx"></el-input>
            </el-form-item>
            <el-form-item prop="vendorTermsOfService">
              <span slot="label">
                {{ $t('vendorApply.Vendor Terms of Service') }}
              </span>
              <el-input v-model="data.vendorTermsOfService" placeholder="https://xxxx"></el-input>
            </el-form-item>
            <el-form-item prop="vendorPrivacyPolicy">
              <span slot="label">
                {{ $t('vendorApply.Vendor Privacy Policy') }}
              </span>
              <el-input v-model="data.vendorPrivacyPolicy" placeholder="https://xxxx"></el-input>
            </el-form-item>
          </div>

          <div class="apply-module-title">{{ $t('vendorApply.Extension Information') }}</div>
          <div w:p="x-20px">
            <el-form-item prop="extensionName">
              <span slot="label">
                {{ $t('vendorApply.Extension Name') }}
                <el-tooltip effect="dark" :content="$t('vendorApply.Extension Name title addition')" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input
                v-model="data.extensionName"
                :placeholder="$t('vendorApply.Extension Name placeholder')"
              ></el-input>
            </el-form-item>
            <el-form-item prop="extensionTagline">
              <span slot="label">
                {{ $t('vendorApply.Extension Tagline') }}
                <el-tooltip effect="dark" :content="$t('vendorApply.Extension Tagline title addition')" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input
                v-model="data.extensionTagline"
                :placeholder="$t('vendorApply.Extension Tagline placeholder')"
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 10}"
              ></el-input>
            </el-form-item>
            <el-form-item prop="extensionDescription">
              <span slot="label">
                {{ $t('vendorApply.Extension Description') }}
              </span>
              <el-input
                v-model="data.extensionDescription"
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 10}"
              ></el-input>
            </el-form-item>
            <el-form-item prop="extensionCoreFeature">
              <span slot="label">
                {{ $t('vendorApply.Extension Core Feature') }}
                <el-tooltip
                  effect="dark"
                  :content="$t('vendorApply.Extension Core Feature title addition')"
                  placement="top"
                >
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input
                v-model="data.extensionCoreFeature"
                :placeholder="$t('vendorApply.Extension Core Feature placeholder')"
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 10}"
              ></el-input>
            </el-form-item>
            <el-form-item prop="extensionPreviewImagesKey">
              <span slot="label">
                {{ $t('vendorApply.Extension Preview Images') }}
                <el-tooltip
                  effect="dark"
                  :content="$t('vendorApply.Extension Preview Images title addition')"
                  placement="top"
                >
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <file-upload-item
                ref="extensionPreviewImage"
                prop-key="extensionPreviewImagesKey"
                :title="$t('File')"
                @on-upload="onExtensionPreviewImagesUpload"
              ></file-upload-item>
              <div
                class="apply-form-content-addition"
                v-html="$t('vendorApply.Extension Preview Images addition')"
              ></div>
            </el-form-item>
          </div>

          <div class="apply-module-title">{{ $t('vendorApply.Developer Guide') }}</div>
          <div w:p="x-20px">
            <el-form-item prop="supportedPlatform">
              <span slot="label">
                {{ $t('vendorApply.Supported Platform') }}
              </span>
              <el-select v-model="data.supportedPlatform" multiple w:w="full">
                <el-option v-for="option in platformOptions" :key="option" :label="option" :value="option"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="extensionVersion">
              <span slot="label">
                {{ $t('vendorApply.Extension Version') }}
              </span>
              <el-input
                v-model="data.extensionVersion"
                :placeholder="$t('vendorApply.Extension Version placeholder')"
              ></el-input>
            </el-form-item>
            <el-form-item prop="extensionUserGuide">
              <span slot="label">
                {{ $t('vendorApply.Extension User Guide') }}
              </span>
              <el-input v-model="data.extensionUserGuide" placeholder="https://xxx"></el-input>
              <div class="apply-form-content-addition" v-html="$t('vendorApply.Extension User Guide addition')"></div>
            </el-form-item>
            <el-form-item prop="techSupportLink">
              <span slot="label">
                {{ $t('vendorApply.Tech Support Link') }}
              </span>
              <el-input v-model="data.techSupportLink" placeholder="https://xxx"></el-input>
            </el-form-item>
            <el-form-item prop="extensionDownload">
              <span slot="label">
                {{ $t('vendorApply.Extension Download') }}
              </span>
              <el-input v-model="data.extensionDownload" placeholder="https://xxx"></el-input>
              <div class="apply-form-content-addition" v-html="$t('vendorApply.Extension Download addition')"></div>
            </el-form-item>
            <el-form-item prop="sampleCode">
              <span slot="label">
                {{ $t('vendorApply.Sample Code') }}
                <el-tooltip effect="dark" :content="$t('vendorApply.Sample Code title addition')" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="data.sampleCode" placeholder="https://xxx"></el-input>
              <div class="apply-form-content-addition" v-html="$t('vendorApply.Sample Code addition')"></div>
            </el-form-item>
          </div>

          <div class="apply-module-title">{{ $t('vendorApply.Notes') }}</div>
          <div w:p="x-20px">
            <el-form-item prop="notes">
              <el-input v-model="data.notes" type="textarea" :autosize="{ minRows: 5, maxRows: 10}"></el-input>
            </el-form-item>
          </div>

          <div w:p="x-20px">
            <el-form-item class="mt-30">
              <console-button
                class="console-btn-primary"
                @click="() => { applyId ? saveEditApply() : saveApply() }"
                v-if="!applyId || data.status === VendorApplyStatus.NotSubmitted"
                >{{ $t('Save') }}</console-button
              >
              <console-button class="console-btn-primary" @click="checkSubmmitApply">{{
                $t('Submit Apply')
              }}</console-button>
              <console-button class="console-btn-white" @click="backToApplyList">{{ $t('Cancel') }}</console-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  `,
})
export default class VendorApply extends Vue {
  loading = false
  applyId = ''
  data = {
    serviceArea: '',
    extensionType: '',
    vendorName: '',
    vendorLogoSquareLink: '',
    vendorLogoSquareKey: '',
    vendorLogoRectangleLink: '',
    vendorLogoRectangleKey: '',
    vendorWebsite: '',
    vendorTermsOfService: '',
    vendorPrivacyPolicy: '',
    extensionName: '',
    extensionTagline: '',
    extensionDescription: JSON.stringify(
      i18n.locale === 'en'
        ? {
            Overview: 'Introduction',
            'Use Cases': 'Introduction',
            Advantages: 'Introduction',
          }
        : {
            概览: '内容',
            使用场景: '内容',
            产品优势: '内容',
          },
      null,
      2
    ),
    extensionCoreFeature: '',
    extensionPreviewImagesKey: '',
    extensionPreviewImagesLink: '',
    supportedPlatform: [],
    extensionVersion: '',
    extensionUserGuide: '',
    techSupportLink: '',
    extensionDownload: '',
    sampleCode: '',
    notes: '',
  }
  VendorApplyStatus = VendorApplyStatus
  platformOptions = [
    'Server',
    'Web',
    'iOS',
    'Android',
    'macOS',
    'Windows',
    'Flutter',
    'React Native',
    'Electron',
    'Unity',
    'Unreal',
    'IoT',
  ]
  serviceAreaOption = [
    {
      value: '1',
      label: this.$t('vendorApply.Chinese Mainland'),
    },
    {
      value: '3',
      label: this.$t('vendorApply.Europe and America'),
    },
  ]
  normalCategoryOption = [
    { label: this.$t('vendorApply.Interactive applications'), value: '1001' },
    { label: this.$t('vendorApply.Intelligent hardware'), value: '1002' },
    {
      label: this.$t('vendorApply.Extension'),
      value: '1003',
      children: [
        { value: '10031', label: this.$t('vendorApply.Video Post') },
        { value: '10032', label: this.$t('vendorApply.Voice to text') },
        { value: '10034', label: this.$t('vendorApply.Content review') },
        { value: '10033', label: this.$t('vendorApply.Others') },
      ],
    },
  ]
  overseaCategoryOption = [
    { label: 'Video Modifiers', value: '2003' },
    { label: 'Audio Modifiers', value: '2004' },
    { label: 'Transcriptions', value: '2005' },
    { label: 'Content Moderation', value: '2006' },
  ]
  rules: any = {
    serviceArea: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionType: [{ required: true, message: this.$t('RequiredMissing') }],
    vendorName: [{ required: true, message: this.$t('RequiredMissing') }],
    vendorLogoSquareLink: [],
    vendorLogoSquareKey: [{ required: true, message: this.$t('RequiredMissing') }],
    vendorLogoRectangleLink: [],
    vendorLogoRectangleKey: [{ required: true, message: this.$t('RequiredMissing') }],
    vendorWebsite: [{ required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') }],
    vendorTermsOfService: [
      { required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') },
    ],
    vendorPrivacyPolicy: [
      { required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') },
    ],
    extensionName: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionTagline: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionDescription: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionCoreFeature: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionPreviewImagesKey: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionPreviewImagesLink: [],
    supportedPlatform: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionVersion: [{ required: true, message: this.$t('RequiredMissing') }],
    extensionUserGuide: [
      { required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') },
    ],
    techSupportLink: [{ required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') }],
    extensionDownload: [
      { required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') },
    ],
    sampleCode: [{ required: true, pattern: /(https):\/\/([\w.]+\/?)\S*/, message: this.$t('Invalid parameter') }],
    notes: [],
  }

  async mounted() {
    await this.changeBreadcrumb()
    if (this.$route.query.applyId) {
      this.applyId = this.$route.query.applyId as string
      this.getApplyInfo()
    }
  }

  async getApplyInfo() {
    this.loading = true
    try {
      const ret = await this.$http.get(`/api/v2/marketplace/company/apply/${this.applyId}`)
      const info = ret.data
      if (info) {
        info.supportedPlatform = info.supportedPlatform.split(',')
        info.extensionType = JSON.parse(info.extensionType)
        // info.extensionDescription = JSON.parse(info.extensionDescription)
        if (info['vendorLogoSquareLink']) {
          ;(this.$refs['logoSquareFile'] as any).showUrl(info['vendorLogoSquareLink'])
        }
        if (info['vendorLogoRectangleLink']) {
          ;(this.$refs['logoRectangleFile'] as any).showUrl(info['vendorLogoRectangleLink'])
        }
        if (info['extensionPreviewImagesLink']) {
          ;(this.$refs['extensionPreviewImage'] as any).showUrl(info['extensionPreviewImagesLink'])
        }
      }
      this.data = Object.assign(this.data, info)
    } catch (e) {}
    this.loading = false
  }

  checkSave() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.saveApply()
      } else {
        return false
      }
    })
  }

  checkSubmmitApply() {
    ;(this.$refs['submit-form'] as any).validate(async (valid: any) => {
      if (valid) {
        if (this.applyId) {
          this.saveEditApply(this.VendorApplyStatus.ApplySubmitted)
        } else {
          this.saveApply(this.VendorApplyStatus.ApplySubmitted)
        }
      } else {
        return false
      }
    })
  }

  async saveApply(status = 0) {
    try {
      this.loading = true
      const params: any = Object.assign({}, this.data)
      params.extensionType = JSON.stringify(params.extensionType)
      params.supportedPlatform = params.supportedPlatform.join(',')
      params.status = status
      // params.extensionDescription = JSON.stringify(params.extensionDescription)
      delete params.vendorLogoSquareLink
      delete params.vendorLogoRectangleLink
      delete params.extensionPreviewImagesLink
      await this.$http.post(`/api/v2/marketplace/company/apply`, params)
      this.$message({
        message: this.$t('SavedSuccess') as string,
        type: 'success',
      })
      this.backToApplyList()
    } catch (e) {
      console.info(e)
    }
    this.loading = false
  }

  async saveEditApply(status = 0) {
    try {
      this.loading = true
      const params: any = Object.assign({}, this.data)
      params.supportedPlatform = params.supportedPlatform.join(',')
      params.extensionType = JSON.stringify(params.extensionType)
      // params.extensionDescription = JSON.stringify(params.extensionDescription)
      params.status = status
      delete params.vendorLogoSquareLink
      delete params.vendorLogoRectangleLink
      delete params.extensionPreviewImagesLink
      await this.$http.put(`/api/v2/marketplace/company/apply/${this.applyId}`, params)
      this.$message({
        message: this.$t('SavedSuccess') as string,
        type: 'success',
      })
      this.backToApplyList()
    } catch (e) {
      console.info(e)
    }
    this.loading = false
  }

  onLogoSquareUpload(url: string, id: any, ossKey: string) {
    this.data.vendorLogoSquareLink = url
    this.data.vendorLogoSquareKey = ossKey
  }

  onLogoRectangleUpload(url: string, id: any, ossKey: string) {
    this.data.vendorLogoRectangleLink = url
    this.data.vendorLogoRectangleKey = ossKey
  }

  onExtensionPreviewImagesUpload(url: string, id: any, ossKey: string) {
    this.data.extensionPreviewImagesLink = url
    this.data.extensionPreviewImagesKey = ossKey
  }

  backToApplyList() {
    this.$router.push({ path: '/marketplace/apply/list' })
  }

  async changeBreadcrumb() {
    const routeList: Partial<RouteRecord>[] = []
    routeList.push(
      {
        path: this.$route.path,
        meta: {
          breadcrumb: 'MarketplaceTitle',
        },
      },
      {
        path: this.$route.path,
        meta: {
          breadcrumb: '入驻申请表单',
        },
      }
    )
    await this.$store.dispatch('changeBreadcrumb', routeList)
  }
}
