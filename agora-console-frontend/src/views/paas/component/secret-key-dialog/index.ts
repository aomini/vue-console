import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import './style.less'

@Component({
  template: ` <el-dialog :visible.sync="visible" title="Credentials" :show-close="false" width="800px">
    <div class="dialog-info-withbgd" v-if="!isTempToken">
      <div class="d-flex align-center mb-20">
        <div class="label">App Key:</div>
        <div class="value">{{ appForm.appKey }}</div>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          v-clipboard:copy="appForm.appKey"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError"
          >Copy</el-button
        >
      </div>
      <div class="d-flex align-center">
        <div class="label">App Secret:</div>
        <div class="value">{{ appForm.appSecret }}</div>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          v-clipboard:copy="appForm.appSecret"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError"
          >Copy</el-button
        >
      </div>
    </div>
    <div class="dialog-info-withbgd" v-else>
      <div class="d-flex align-center">
        <div class="label">Token:</div>
        <div class="value">{{ tempForm.token }}</div>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          v-clipboard:copy="tempForm.token"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError"
          >Copy</el-button
        >
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="confirm" type="primary">Finish</el-button>
    </span>
  </el-dialog>`,
})
export default class SecretKeyDialog extends Vue {
  @Prop({ default: false, type: Boolean }) readonly visible!: boolean
  @Prop({ type: Function }) readonly confirm!: () => any
  @Prop({ type: Object }) readonly appForm!: object
  @Prop({ type: String }) readonly appKey!: string
  @Prop({ type: String }) readonly appSecret!: string
  @Prop({ type: Boolean }) readonly isTempToken!: boolean
  tempForm = {
    token:
      'uX+SvdJjnY6laHATGJ3TtzRKfEC8pkAjGbiOTzWJ+0SFtF7s81Q3PGPBBrujDPJprOgMOVboK/5CAin6ShP6VqImkMyPWaS3G9A2ZauAwn1e2oQdOkL7zzn0xVKZlLuhHFHmatxXuZgQ0mHbWXVEEEG7yQsHEetIls69j9mS+hN7OzU0Rm3/c13KLVzgELIgDKYuIfoi/YaAIo63kBWLOkQ+JxylRajgLyab3S6ar13/C/gqmNXBeeBT98scs2n9wmoMpPVNjrWYp9lGr5Cknrln7B9VjVRP99zxs8duvVNeNl70/qpsea5a/Tqd8YhlSlD5V7Xm2HIf1KHYFW3XIPVZjMSJhHdJcm97h2Pz2XF6elcc9GmkjXRhzv1xI10lB+wSvhe+inj6odeiVS9XafEBz4nwR46NNypGipJ8Q/8VrXJx9jum6vOdPW9SK+K7QCu83ZdsMe3QA65mxxVIhp72vlpw7+in1WAFbb5+gRbnoWNCFCuWUyImm5xR9xNBFi5CGptd4US4LZKJhn2lZeTLfUlBfwpBOJd7Hj65JljrGsLzpAHhpDHXrw+130VPDqJ9kmab4Rjjat3vKj9YlyUFHsFndtilegNbUbcxvanrUHBylMQ1DNBa5i6mFl0XLDzG7PdTDG+FlfURzXwz/4Wh1NE/xHxOcbYqmOULuMIsLEw2LhNhWwVEa0v/LXLTUPPGCJe+7tNOG7ggF6wyfrlkPKOKGtY0tAxgbe5POEUN1fe8HpPZeyVzhVdu0hYmHJd2R4MyuUveR1XJn+yeZjsLsZEM8D6Rs4+kC70bxJxAz7+vs2fR/tKQFSSQnNQZHs+2JsYEJaecAQmjD7cW7DGY',
  }
  onCopy() {
    this.$message.success('copy succeed')
  }
  onError() {
    this.$message.success('copy failed')
  }
}
