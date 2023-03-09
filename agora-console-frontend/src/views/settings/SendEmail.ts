import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { validateEmail } from '@/utils/utility'
// import { user } from '@/services/user'

@Component({
  template: `
    <el-dialog :title="title" :visible.sync="dialogFormVisible" class="msg-box" width="400px">
      <el-input :placeholder="$t('Placeholder')" v-model="email" @blur="checkEmail"></el-input>
      <div class="tips-err">{{ phoneTipsMsg }}</div>
      <div class="hint">{{ $t('Hint') }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sendEmail" :disabled="loading">{{ $t('SendButton') }}</el-button>
        <el-button @click.stop="close">{{ $t('Cancel') }}</el-button>
      </div>
    </el-dialog>
  `,
})
export default class SendEmail extends Vue {
  @Prop({ default: '', type: String }) readonly title!: string

  dialogFormVisible = false
  phoneTipsMsg = ''
  loading = false
  email = ''

  checkEmail() {
    if (!validateEmail(this.email)) {
      this.phoneTipsMsg = this.$t('InvalidEmail') as string
      return false
    } else {
      this.phoneTipsMsg = ''
      return true
    }
  }

  async sendEmail() {
    if (!this.checkEmail()) return
    this.loading = true
    try {
      await this.$http.post(`/api/v2/verifyEmail/sendEmail`, { toEmail: this.email, source: 'dashboard' })
      this.loading = false
      this.$message({
        message: this.$t('SendSuccess') as string,
        type: 'success',
      })
      this.close()
    } catch (e) {
      this.loading = false
      if (e.response && e.response.data.code === 8012) {
        this.phoneTipsMsg = this.$t('EmailExist') as string
      } else {
        this.$message.error(this.$t('SendFailed') as string)
      }
    }
  }

  open() {
    this.phoneTipsMsg = ''
    this.dialogFormVisible = true
  }

  close() {
    this.email = ''
    this.phoneTipsMsg = ''
    this.dialogFormVisible = false
  }
}
