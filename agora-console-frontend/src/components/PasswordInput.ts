import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './PasswordInput.less'

@Component({
  template: ` <div class="password-box d-flex" :class="type === 'text' ? 'password-input--text' : ''">
    <el-input
      v-if="!showPassword"
      type="password"
      :size="size"
      v-model="passwordValue"
      class="password-input"
      :disabled="isDisabled"
    ></el-input>
    <div v-clipboard:copy="passwordValue">
      <el-tooltip :content="$t('Copy')" placement="top">
        <span class="iconfont iconicon-copy password-img" v-if="!showPassword" @click="changePassword()"></span>
      </el-tooltip>
    </div>
    <el-input
      v-if="showPassword"
      type="text"
      :size="size"
      v-model="passwordValue"
      class="password-input"
      :disabled="isDisabled"
    >
    </el-input>
    <el-tooltip :content="$t('Copy')" placement="top">
      <span class="iconfont iconicon-copy password-img" v-if="showPassword" @click="changePassword()"></span>
    </el-tooltip>
  </div>`,
})
export default class PasswordInput extends Vue {
  @Prop({ default: false, type: Boolean }) readonly isDisabled!: boolean
  @Prop({ default: '', type: String }) readonly passwordValue!: string
  @Prop({ default: 'mini', type: String }) readonly size!: string
  @Prop({ default: 'input', type: String }) readonly type!: string

  showPassword: boolean = false
  value: string = this.passwordValue

  changePassword() {
    if (!this.showPassword) {
      this.$message({
        message: this.$t('CertificateCopied') as string,
        type: 'success',
        onClose: () => {
          this.showPassword = false
        },
      })
    }
    this.showPassword = !this.showPassword
  }
}
