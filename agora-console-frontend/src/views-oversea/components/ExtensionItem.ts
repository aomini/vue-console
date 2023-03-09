import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  components: {},
  template: `
    <el-form-item :label="name">
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
        <el-button v-else type="text" class="f-13 disabled" disabled> {{ $t('Enabled') }}</el-button>
      </template>
      <template v-else>
        <div class="heading-grey-05" v-if="showSignKeyTooltip && extensionId === 'Chat'">
          <div>{{ $t('Chat Enable App Certificate Tip') }}</div>
          <div class="white-nowrap">{{ $t('Chat Enable App Certificate Tip1') }}</div>
          <div class="white-nowrap">{{ $t('Chat Enable App Certificate Tip2') }}</div>
        </div>
        <div class="heading-grey-05" v-else-if="showSignKeyTooltip">
          {{ $t('Please enable App Certificate first') }}
        </div>
        <slot v-else-if="$slots['enable-btn']" name="enable-btn"></slot>
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
          <span :id="trackId"> {{ $t(enableBtnText) }} </span>
        </el-button>
      </template>
    </el-form-item>
  `,
})
export default class ExtensionItem extends Vue {
  @Prop({ default: '', type: String }) readonly name!: string
  @Prop({ default: '', type: String }) readonly extensionId!: string
  @Prop({ default: false, type: Boolean }) readonly status!: boolean // 开启状态
  @Prop({ default: '', type: String }) readonly trackId!: string // For GA
  @Prop({ default: 'Enable', type: String }) readonly enableBtnText!: string
  @Prop({ default: 'Config', type: String }) readonly configBtnText!: string
  @Prop({ default: null, type: Function }) readonly configFunc!: any
  @Prop({ default: null, type: Function }) readonly enableFunc!: any
  @Prop({ default: false, type: Boolean }) readonly accountBlocked!: boolean
  @Prop({ default: false, type: Boolean }) readonly showSignKeyTooltip!: boolean // 是否展示启用证书提示

  loading = false

  mounted() {}

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
