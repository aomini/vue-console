import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import './ExtensionBox.less'
const IotIcon = require('@/assets/icon/icon-linkIot.png')

@Component({
  components: {},
  template: `
    <div class="card extension-box" v-loading="boxLoading" :id="trackId">
      <div class="extension-box-header">
        <div class="d-flex align-center justify-between">
          <span class="d-flex align-center extension-box-title-box">
            <img
              height="30"
              class="iconfont f-20 extension-icon"
              :src="IotIcon"
              v-if="icon === 'iconicon-iot'"
              alt=""
            />
            <span class="iconfont f-20 extension-icon" :class="icon" v-else></span>
            <span class="heading-dark-16 extension-box-title">{{ $t(name) }}</span>
          </span>
        </div>
      </div>
      <el-tooltip v-if="showDescToolTip" :content="$t(description)" effect="light">
        <div ref="extension-desc" class="heading-grey-13 extension-box-description text-line-2">
          <span>{{ $t(description) }}</span>
        </div>
      </el-tooltip>
      <div v-else ref="extension-desc" class="heading-grey-13 extension-box-description text-line-2">
        <span>{{ $t(description) }}</span>
      </div>
      <div class="d-flex align-center extension-box-button">
        <template v-if="status">
          <slot v-if="$slots['config-btn']" name="config-btn"></slot>
          <el-button
            v-else-if="configFunc"
            type="text"
            class="f-13"
            :id="trackId"
            @click="configExtension"
            :disabled="accountBlocked"
            :loading="loading"
          >
            <span :id="trackId"> {{ $t(configBtnText) }} </span>
          </el-button>
          <el-button v-else slot="config-btn" type="text" class="f-13 disabled" disabled>
            {{ $t('Enabled') }}</el-button
          >
        </template>
        <template v-else>
          <slot v-if="$slots['enable-btn']" name="enable-btn"></slot>
          <el-button
            v-else
            type="text"
            size="small"
            class="f-13"
            :id="trackId"
            :loading="loading"
            :disabled="this.accountBlocked || this.showSignKeyTooltip"
            @click="enableExtension"
          >
            <el-tooltip
              v-if="showSignKeyTooltip"
              effect="light"
              placement="right"
              :content="$t('Please enable App Certificate first')"
            >
              <span> {{ $t(enableBtnText) }} </span>
            </el-tooltip>
            <span v-else :id="trackId"> {{ $t(enableBtnText) }} </span>
          </el-button>
        </template>
      </div>
    </div>
  `,
})
export default class ExtensionBox extends Vue {
  @Prop({ default: '', type: String }) readonly name!: string
  @Prop({ default: '', type: String }) readonly icon!: any
  @Prop({ default: '', type: String }) readonly description!: string
  @Prop({ default: false, type: Boolean }) readonly status!: boolean // 开启状态
  @Prop({ default: '', type: String }) readonly trackId!: string // For GA
  @Prop({ default: false, type: Boolean }) readonly showDocs!: boolean
  @Prop({ default: 'Enable', type: String }) readonly enableBtnText!: string
  @Prop({ default: 'Config', type: String }) readonly configBtnText!: string
  @Prop({ default: null, type: Function }) readonly configFunc!: any
  @Prop({ default: null, type: Function }) readonly enableFunc!: any
  @Prop({ default: false, type: Boolean }) readonly accountBlocked!: boolean
  @Prop({ default: false, type: Boolean }) readonly showSignKeyTooltip!: boolean // 是否展示启用证书提示
  @Prop({ default: false, type: Boolean }) readonly boxLoading!: boolean

  showDescToolTip = false
  loading = false
  IotIcon = IotIcon

  @Watch('showDocs')
  onShowDocsChange() {
    this.showToolTipChange()
  }

  mounted() {
    this.showToolTipChange()
  }

  showToolTipChange() {
    this.showDescToolTip =
      (this.$refs['extension-desc'] as any).clientHeight < (this.$refs['extension-desc'] as any).scrollHeight
  }

  async enableExtension() {
    this.loading = true
    await this.enableFunc()
    this.loading = false
  }

  async configExtension() {
    this.loading = true
    await this.configFunc()
    this.loading = false
  }
}
