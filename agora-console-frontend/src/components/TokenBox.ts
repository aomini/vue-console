import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  components: {},
  template: `
    <div class="token-box">
      <div class="d-flex token-input" style="position: relative">
        <el-input
          @focus="select"
          type="text"
          :readonly="true"
          :disabled="true"
          v-clipboard:copy="accessToken"
          v-model="accessToken"
        >
        </el-input>
        <div v-clipboard:copy="accessToken">
          <span id="feature-token-copy" class="iconfont iconicon-copy password-img" @click="copyToken()"></span>
        </div>
      </div>
      <div class="mb-10 mt-10 f-13">{{ $t('expireTime', { date: expiredDate }) }}</div>
    </div>
  `,
})
export default class TokenBox extends Vue {
  @Prop({ default: '', type: String }) readonly accessToken!: string
  @Prop({ default: '', type: String }) readonly expiredDate!: string

  copyToken() {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
  }

  select(event: any) {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
    event.currentTarget.select()
  }
}
