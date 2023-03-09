import Vue from 'vue'
import Component from 'vue-class-component'
import { MessageTypeOptions } from '@/models'
import { Prop } from 'vue-property-decorator'

@Component({
  template: ` <el-dialog
    :title='$t("Add Target Url")'
    :visible="showDialog"
    class="push-certificate"
    :before-close="closeDialog"
  >
    <el-radio-group v-model="ruleType" type="card" :disabled="!!rule_id" @change="handleTypeChange">
      <el-radio-button label="pre-send">{{ $t('pre-send') }}</el-radio-button>
      <el-radio-button label="post-send">{{ $t('post-send') }}</el-radio-button>
    </el-radio-group>
    <el-form
      :model="preData"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="ruleType === 'pre-send'"
      :rules="presendRules"
    >
      <el-form-item :label="$t('Rule Name') + ':'" prop="name">
        <el-input v-model="preData.name" :placeholder="$t('Please enter rule name')" :disabled="!!rule_id"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Chat Type') + ':'" prop="chat_types">
        <el-checkbox-group v-model="preData.chat_types">
          <el-checkbox label="PRIVATE">{{ $t('Chat') }}</el-checkbox>
          <el-checkbox label="GROUP">{{ $t('Groupchat') }}</el-checkbox>
          <el-checkbox label="ROOM">{{ $t('Chatroom') }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('Message Type') + ':'" prop="content_types">
        <el-checkbox-group v-model="preData.content_types">
          <el-checkbox :label="item" v-for="item in MessageTypeOptions" :key="item">{{ $t(item) }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('Timeout') + ':'" prop="timeout_ms">
        <el-input v-model="preData.timeout_ms" :placeholder="$t('Please enter timeout')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Fallback Action') + ':'" prop="fallback_action">
        <el-radio label="PASS" v-model="preData.fallback_action">{{ $t('PASS') }}</el-radio>
        <el-radio label="REJECT" v-model="preData.fallback_action">{{ $t('REJECT') }}</el-radio>
      </el-form-item>
      <el-form-item :label="$t('Target Url') + ':'" prop="target_url">
        <el-input v-model="preData.target_url" :placeholder="$t('Please enter target url')" maxlength="512"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Rejection Behaviour') + ':'" prop="rejection_behaviour">
        <el-radio label="NOOP" v-model="preData.rejection_behaviour">{{ $t('NOOP') }}</el-radio>
        <el-radio label="ERROR" v-model="preData.rejection_behaviour">{{ $t('ERROR') }}</el-radio>
      </el-form-item>
      <div class="mt-20 text-right">
        <console-button class="console-btn-white" @click="closeDialog">
          {{ $t('Cancel') }}
        </console-button>
        <console-button class="console-btn-primary" :disabled="loading" :loading="loading" @click="validatePreCallback">
          {{ $t('Save') }}
        </console-button>
      </div>
    </el-form>
    <el-form
      :model="postData"
      size="small"
      ref="info"
      label-width="150px"
      class="mt-20"
      v-if="ruleType === 'post-send'"
      :rules="postsendRules"
    >
      <el-form-item :label="$t('Rule Name') + ':'" prop="name">
        <el-input v-model="postData.name" :placeholder="$t('Please enter rule name')" :disabled="!!rule_id"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Callback Service') + ':'" prop="chat_types">
        <el-checkbox-group v-model="postData.chat_types">
          <el-checkbox label="PRIVATE">{{ $t('Chat') }}</el-checkbox>
          <el-checkbox label="GROUP">{{ $t('Groupchat') }}</el-checkbox>
          <el-checkbox label="ROOM">{{ $t('Chatroom') }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('Message Type') + ':'" prop="content_types">
        <el-checkbox-group v-model="postData.content_types">
          <el-checkbox :label="item" v-for="item in MessageTypeOptions" :key="item">{{ $t(item) }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('Message Status') + ':'" prop="msg_status">
        <el-checkbox-group v-model="postData.msg_status">
          <el-checkbox label="SERVER_RECEIVED">{{ $t('SERVER_RECEIVED') }}</el-checkbox>
          <el-checkbox label="RECEIVER_OFFLINE">{{ $t('RECEIVER_OFFLINE') }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('Target Url') + ':'" prop="target_url">
        <el-input v-model="postData.target_url" :placeholder="$t('Please enter target url')" maxlength="512"></el-input>
      </el-form-item>
      <div class="mt-20 text-right">
        <console-button class="console-btn-white" @click="closeDialog">
          {{ $t('Cancel') }}
        </console-button>
        <console-button
          class="console-btn-primary"
          :disabled="loading"
          :loading="loading"
          @click="validatePostCallback"
        >
          {{ $t('Save') }}
        </console-button>
      </div>
    </el-form>
  </el-dialog>`,
})
export default class AddCallbackDialog extends Vue {
  @Prop({ default: null, type: Function }) readonly updateCallbackInfo!: () => Promise<void>
  showDialog = false
  loading = false
  ruleType = 'pre-send'
  preData: any = {
    name: '',
    chat_types: [],
    content_types: [],
    target_url: '',
    fallback_action: 'PASS',
    timeout_ms: '200',
    rejection_behaviour: 'NOOP',
  }
  postData: any = {
    name: '',
    msg_status: [],
    chat_types: [],
    content_types: [],
    target_url: '',
  }
  presendRules: any = {
    name: [{ required: true, message: this.$t('This field is required') }],
    chat_types: [{ required: true, message: this.$t('This field is required') }],
    content_types: [{ required: true, message: this.$t('This field is required') }],
    timeout_ms: [{ required: true, message: this.$t('This field is required') }],
    target_url: [{ required: true, message: this.$t('This field is required') }],
  }
  postsendRules: any = {
    name: [{ required: true, message: this.$t('This field is required') }],
    chat_types: [{ required: true, message: this.$t('This field is required') }],
    content_types: [{ required: true, message: this.$t('This field is required') }],
    msg_status: [{ required: true, message: this.$t('This field is required') }],
    target_url: [{ required: true, message: this.$t('This field is required') }],
  }
  MessageTypeOptions = MessageTypeOptions
  rule_id: boolean | string = false

  openDialog(rule_id?: string, ruleInfo?: any) {
    this.showDialog = true
    this.handleTypeChange()
    if (rule_id) {
      this.rule_id = rule_id
    }
    if (ruleInfo) {
      this.ruleType = ruleInfo.rule_type
      if (ruleInfo.rule_type === 'pre-send') {
        this.preData = Object.assign(this.preData, ruleInfo)
      } else if (ruleInfo.rule_type === 'post-send') {
        this.postData = Object.assign(this.postData, ruleInfo)
      }
    }
  }

  closeDialog() {
    this.resetData()
    this.showDialog = false
  }

  resetData() {
    this.rule_id = false
    this.ruleType = 'pre-send'
    this.preData = {
      name: '',
      chat_types: [],
      content_types: [],
      target_url: '',
      fallback_action: 'PASS',
      timeout_ms: '200',
      rejection_behaviour: 'NOOP',
    }
    this.postData = {
      name: '',
      msg_status: [],
      chat_types: [],
      content_types: [],
      target_url: '',
    }
  }

  validatePreCallback() {
    if (this.rule_id) {
      this.updatePrePushRule()
    } else {
      ;(this.$refs['info'] as any).validate(async (valid: any) => {
        if (valid) {
          this.createPrePushRule()
        } else {
          return false
        }
      })
    }
  }

  validatePostCallback() {
    if (this.rule_id) {
      this.updatePostPushRule()
    } else {
      ;(this.$refs['info'] as any).validate(async (valid: any) => {
        if (valid) {
          this.createPostPushRule()
        } else {
          return false
        }
      })
    }
  }

  async createPrePushRule() {
    this.loading = true
    try {
      await this.$http.post(`/api/v2/project/${this.$route.params.id}/chat/pre-callback`, this.preData)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.closeDialog()
      this.updateCallbackInfo()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async createPostPushRule() {
    this.loading = true
    try {
      await this.$http.post(`/api/v2/project/${this.$route.params.id}/chat/post-callback`, this.postData)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.closeDialog()
      this.updateCallbackInfo()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async updatePrePushRule() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.$route.params.id}/chat/pre-callback/${this.rule_id}`, this.preData)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.closeDialog()
      this.updateCallbackInfo()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async updatePostPushRule() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/project/${this.$route.params.id}/chat/post-callback/${this.rule_id}`, this.postData)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.closeDialog()
      this.updateCallbackInfo()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  handleTypeChange() {
    if (this.$refs['info']) {
      ;(this.$refs['info'] as any).clearValidate()
    }
  }
}
