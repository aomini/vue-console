import Vue from 'vue'
import Component from 'vue-class-component'
const PicLocked = require('@/assets/icon/pic-locked.png')
import '../Project.less'
import { DataCenterOptions, APIUrl } from '@/models'
import AddPushView from '@/views/project/AgoraChat/AddPushView'
import AddCallbackDialog from '@/views/project/AgoraChat/AddCallbackDialog'
import moment from 'moment'
import TokenBox from '@/components/TokenBox'
const IconDelete = require('@/assets/icon/icon-delete.png')
const IconPen = require('@/assets/icon/icon-pen.png')

@Component({
  components: {
    AddPushView,
    AddCallbackDialog,
    TokenBox,
  },
  template: `<div class="agora-chat" v-loading="loading">
    <div class="card">
      <el-form :model="chatInfo" size="small" label-width="180px" ref="submit-form" :rules="rules">
        <div class="text-center" v-if="!isChatSubscription">
          <div class="module-item-title">{{ $t('Agora Chat Plan') }}</div>
          <img :src="PicLocked" class="w-180" />
          <div class="heading-grey-13">{{ $t('You are not subscribed to any Agora Chat Plan.') }}</div>
          <div class="heading-grey-13">
            {{ $t('Please go to Subscribe Agora Chat Plan and subscribe a plan before enabling Agora Chat service.') }}
          </div>
        </div>

        <div v-else-if="!AgoraChatEnabled">
          <div class="module-item-title">{{ $t('Agora Chat') }}</div>
          <div class="text-center">
            <div class="heading-grey-13">{{ $t('Agora Chat is not enabled') }}</div>
          </div>
        </div>

        <div v-else>
          <div class="module-item-title">{{ $t('Data Center') }}</div>
          <div class="w-500 m-auto">
            <el-form-item :label="$t('Data center') + ':'">
              <span>{{ instanceInfo.datacenter }}</span>
            </el-form-item>
            <el-form-item :label="$t('Chat App Temp Token') + ':'">
              <el-button type="text" @click="generateChatToken('app')" :loading="tokenData.appTokenLoading">{{
                $t('Generate')
              }}</el-button>
              <token-box
                v-if="tokenData.appToken"
                :access-token="tokenData.appToken"
                :expired-date="tokenData.appTokenExpiredDate"
              ></token-box>
            </el-form-item>
            <el-form-item :label="$t('Chat User Temp Token') + ':'" style="position: relative">
              <el-input
                :placeholder='$t("UserIdInputPlaceholder")'
                size="mini"
                v-model="tokenData.userId"
                class="mb-10"
              >
              </el-input>
              <el-button
                type="text"
                class="token-btn token-btn--generate"
                id="feature-generate-token-click"
                @click="generateChatToken('user')"
                :loading="tokenData.userTokenLoading"
              >
                <span id="feature-generate-token-click">{{ $t('Generate') }}</span>
              </el-button>
              <token-box
                v-if="tokenData.userToken"
                :access-token="tokenData.userToken"
                :expired-date="tokenData.userTokenExpiredDate"
              ></token-box>
            </el-form-item>
          </div>
          <div class="module-item-title">{{ $t('Agora Chat Service Status') }}</div>
          <div class="w-500 m-auto">
            <el-form-item :label="$t('Agora Chat') + ':'">
              <el-switch v-model="chatInfo.status" @change="handleStatusChange"> </el-switch>
            </el-form-item>
            <el-form-item :label="$t('AppKey') + ':'">
              <span>{{ instanceInfo.appkey }}</span>
            </el-form-item>
            <el-form-item :label="$t('OrgName') + ':'">
              <span>{{ OrgName }}</span>
            </el-form-item>
            <el-form-item :label="$t('AppName') + ':'">
              <span>{{ AppName }}</span>
            </el-form-item>
          </div>
          <div class="module-item-title">{{ $t('API request url') }}</div>
          <div class="w-500 m-auto">
            <div v-if="APIUrl[instanceInfo.datacenter]">
              <el-form-item :label="$t('WebSocket Address') + ':'">
                <span class="heading-grey-13 nowrap">{{
                  APIUrl[instanceInfo.datacenter]['WebSocket'].join($t('Or'))
                }}</span>
              </el-form-item>
              <el-form-item :label="$t('REST API') + ':'">
                <span class="heading-grey-13 nowrap">{{
                  APIUrl[instanceInfo.datacenter]['REST API'].join($t('Or'))
                }}</span>
              </el-form-item>
              <el-form-item :label="$t('Mini APP') + ':'" v-if="APIUrl[instanceInfo.datacenter]['Mini APP']">
                <span class="heading-grey-13 nowrap">{{
                  APIUrl[instanceInfo.datacenter]['Mini APP'].join($t('Or'))
                }}</span>
              </el-form-item>
              <el-form-item :label="$t('Alipay APP') + ':'" v-if="APIUrl[instanceInfo.datacenter]['Alipay APP']">
                <span class="heading-grey-13 nowrap">{{
                  APIUrl[instanceInfo.datacenter]['Alipay APP'].join($t('Or'))
                }}</span>
              </el-form-item>
            </div>
          </div>
          <div class="text-right mb-20">
            <!--            <a-->
            <!--              href="https://docs-im.easemob.com/im/extensions/value/vpn#%E9%9B%86%E6%88%90%E8%AF%B4%E6%98%8E"-->
            <!--              target="_blank"-->
            <!--              >{{ $t('View Documents') }}</a-->
            <!--            >-->
          </div>
          <div class="text-right mb-20 mt-20">
            <!--            <a href="https://docs-im.easemob.com/im/extensions/value/rtmsgcallback" target="_blank">{{-->
            <!--              $t('View Documents')-->
            <!--            }}</a>-->
          </div>
        </div>
      </el-form>
    </div>

    <AddPushView ref="pushDialog" :updatePushInfo="getProjectChatPushInfo"></AddPushView>
    <AddCallbackDialog ref="callbackDialog" :updateCallbackInfo="getProjectChatCallbackInfo"></AddCallbackDialog>
  </div>`,
})
export default class AgoraChatView extends Vue {
  projectId: any = ''
  PicLocked = PicLocked
  loading = false
  rules: any = {}
  chatInfo: any = {
    status: false,
    datacenter: '',
    rest_base_url: '',
    push: [],
    callbacks: [],
  }
  pushs: any = []
  callbacks: any = []
  instanceInfo: any = {}
  DataCenterOptions = DataCenterOptions
  AgoraChatEnabled = false
  isChatSubscription = false
  subscriptionInfo: any = {}
  APIUrl = APIUrl
  IconDelete = IconDelete
  pushLoading = false
  callbackLoading = false
  IconPen = IconPen
  tokenData = {
    appToken: '',
    appTokenExpiredDate: '',
    appTokenLoading: false,
    userToken: '',
    userTokenExpiredDate: '',
    userId: '',
    userTokenLoading: false,
  }
  async mounted() {
    this.projectId = this.$route.query.projectId
    this.loading = true
    await Promise.all([
      this.getCompanyChatSubscription(),
      this.getProjectChatStatus(),
      this.getProjectChatPushInfo(),
      this.getProjectChatCallbackInfo(),
    ])
    this.loading = false
  }

  get OrgName() {
    return this.instanceInfo.appkey.split('#')[0]
  }

  get AppName() {
    return this.instanceInfo.appkey.split('#')[1]
  }

  async getProjectChatStatus() {
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/chat/info`)
      if (res.data.instances.length === 0) {
        return
      }
      const instance = res.data.instances[0]
      if (instance) {
        this.AgoraChatEnabled = true
        // this.AgoraChatEnabled = instance.status === 'ACTIVE' || instance.status === 'PROVISION'
        this.chatInfo.status = instance.status === 'ACTIVE' || instance.status === 'PROVISION'
        this.instanceInfo = instance
      }
    } catch (e) {}
  }

  async getCompanyChatSubscription() {
    try {
      const res = await this.$http.get(`/api/v2/chat/subscription`)
      if (res.data && res.data.subscriptions.length > 0) {
        this.isChatSubscription = true
        this.subscriptionInfo = res.data.subscriptions[0]
      }
    } catch (e) {}
  }

  async getProjectChatPushInfo() {
    this.pushLoading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/chat/push/info`)
      this.pushs = res.data.certificates
    } catch (e) {}
    this.pushLoading = false
  }

  async deletePush(push: any) {
    this.$confirm(this.$t('Confirm to delete push certificate') as string, this.$t('Warning') as string, {
      confirmButtonText: this.$t('Continue') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    })
      .then(async () => {
        try {
          this.pushLoading = true
          await this.$http.delete(`/api/v2/project/${this.projectId}/chat/push/${push.id}`)
          this.$message({
            message: this.$t('ApplySuccess') as string,
            type: 'success',
          })
          this.pushLoading = false
          await this.getProjectChatPushInfo()
        } catch (e) {
          this.$message.error(this.$t('SaveFailed') as string)
        }
      })
      .catch(() => {})
  }

  addPush() {
    ;(this.$refs.pushDialog as any).openDialog()
  }

  addCallback() {
    ;(this.$refs.callbackDialog as any).openDialog()
  }

  editCallback(item: any) {
    ;(this.$refs.callbackDialog as any).openDialog(item.id, item)
  }

  async getProjectChatCallbackInfo() {
    this.callbackLoading = true
    try {
      const res = await this.$http.get(`/api/v2/project/${this.projectId}/chat/callback/info`)
      const pre_send = res.data.pre_send.map((item: any) => {
        return Object.assign(item, { rule_type: 'pre-send' })
      })
      const post_send = res.data.post_send.map((item: any) => {
        return Object.assign(item, { rule_type: 'post-send' })
      })
      this.callbacks = pre_send.concat(post_send)
    } catch (e) {}
    this.callbackLoading = false
  }

  deleteCallback(callback: any) {
    this.$confirm(this.$t('Confirm to delete callback') as string, this.$t('Warning') as string, {
      confirmButtonText: this.$t('Continue') as string,
      cancelButtonText: this.$t('Cancel') as string,
      type: 'warning',
    })
      .then(async () => {
        try {
          this.callbackLoading = true
          await this.$http.delete(`/api/v2/project/${this.projectId}/chat/callback/${callback.id}`, {
            params: { rule_type: callback.rule_type },
          })
          this.$message({
            message: this.$t('ApplySuccess') as string,
            type: 'success',
          })
          this.callbackLoading = false
          await this.getProjectChatCallbackInfo()
        } catch (e) {
          this.callbackLoading = false
          this.$message.error(this.$t('SaveFailed') as string)
        }
      })
      .catch(() => {})
  }

  async activeProjectChat() {
    this.loading = true
    try {
      await this.$http.post(`/api/v2/project/${this.projectId}/chat/active`)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.getProjectChatStatus()
    } catch (e) {}
    this.loading = false
  }

  async disactiveProjectChat() {
    this.loading = true
    try {
      await this.$http.post(`/api/v2/project/${this.projectId}/chat/disactive`)
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.getProjectChatStatus()
    } catch (e) {}
    this.loading = false
  }

  handleStatusChange(value: boolean) {
    if (value) {
      this.$confirm(this.$t('Confirm to active agora chat') as string, this.$t('Warning') as string, {
        confirmButtonText: this.$t('Continue') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
      })
        .then(() => {
          this.activeProjectChat()
        })
        .catch(() => {
          this.chatInfo.status = false
        })
    } else {
      this.$confirm(this.$t('Confirm to disable agora chat') as string, this.$t('Warning') as string, {
        confirmButtonText: this.$t('Disable Chat for this Project') as string,
        cancelButtonText: this.$t('Cancel') as string,
        dangerouslyUseHTMLString: true,
      })
        .then(() => {
          this.disactiveProjectChat()
        })
        .catch(() => {
          this.chatInfo.status = true
        })
    }
  }

  goToSwitchPlan() {
    this.$router.push({ name: 'package.chat' })
  }

  viewUsage() {
    this.$router.push({ name: 'usage.chat.mau', query: { projectId: this.projectId } })
  }

  async generateChatToken(type: 'user' | 'app') {
    try {
      if (type === 'app') {
        this.tokenData.appTokenLoading = true
        const token = await this.$http.get('/api/v2/chat/token', {
          params: { projectId: this.$route.query.projectId, type },
        })
        this.tokenData.appTokenExpiredDate = moment.utc(moment.unix(token.data.expiredTs)).format('LLL')
        this.tokenData.appToken = token.data.token
      } else {
        const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$')
        if (!pattern.test(this.tokenData.userId)) {
          this.$message.warning(this.$t('InvalidUserId') as string)
          return
        }
        this.tokenData.userTokenLoading = true
        const token = await this.$http.get('/api/v2/chat/token', {
          params: { projectId: this.$route.query.projectId, type, userId: this.tokenData.userId },
        })
        this.tokenData.userTokenExpiredDate = moment.utc(moment.unix(token.data.expiredTs)).format('LLL')
        this.tokenData.userToken = token.data.token
      }
      this.$message.success(this.$t('ChatTokenGenerated') as string)
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 6008) {
        this.$message.warning(this.$t('ParameterError') as string)
      } else if (errorCode === 22003) {
        this.$message.error(this.$t('ChatUserIdError') as string)
      } else {
        this.$message.error(this.$t('FailedGetToken') as string)
      }
    }
    this.tokenData.appTokenLoading = false
    this.tokenData.userTokenLoading = false
  }
}
