import Vue from 'vue'
import Component from 'vue-class-component'
import './AgoraChat.less'
import { ChatFullDescription, ChatSubscription } from '@/models'
import { user } from '@/services'
const IconChecked = require('@/assets/icon/icon-check.png')

@Component({
  template: `<div class="chat-subscribe">
    <div class="module-title">{{ $t('Agora Chat') }}</div>
    <div class="module-title-tip">
      <div>{{ $t('Check the table below for pricing and subscribe a plan to enable Agora Chat.') }}</div>
      <div>
        {{
          $t(
            'You can click the subscribe button of other plans to upgrade your current plan or contact sales@agora.io to degrade it.'
          )
        }}
      </div>
      <div>
        {{
          $t(
            'You will be charged by percentage of active days in billing month after subscribing a plan and you can unsubscribe any time at My Monthly Plan.'
          )
        }}
      </div>
      <div>
        {{ $t('Switching plan or unsubscribing one will be applied to all your projects with Agora Chat enabled.') }}
      </div>
    </div>
    <div class="plans" v-loading="loading">
      <div class="row">
        <el-row>
          <el-col class="row-item header d-flex align-center" :span="8">
            <div class="plan-item header">
              <!--              <div class="heading-dark-14" v-if="isCN">开通含1万DAU/月</div>-->
              <!--              <div class="heading-dark-14" v-else>5,000 MAU / month contained after subscribed</div>-->
            </div>
          </el-col>
          <el-col class="row-item header" :span="4">
            <div class="plan-item header">
              <div class="heading-dark-24 line-height-29">{{ $t('ChatFREE') }}</div>
              <div class="nowrap mt-20">
                <span class="heading-dark-20" v-if="isCN">0 CNY</span>
                <span class="heading-dark-20" v-else>$0</span>
                <span class="heading-grey-13">{{ $t('/month') }}</span>
              </div>
              <div class="mt-20">
                <console-button
                  class="console-btn-primary w-100"
                  @click="confirmSave('FREE')"
                  v-if="CurrentSubscription !== 'FREE'"
                  :disabled="!subscribePermisson"
                  >{{ $t('Subscribe') }}</console-button
                >
                <console-button class="console-btn-white w-100" v-if="CurrentSubscription === 'FREE'" disabled>{{
                  $t('Subscribed')
                }}</console-button>
              </div>
            </div>
          </el-col>
          <el-col class="row-item header" :span="4">
            <div class="plan-item header">
              <div class="heading-dark-24 line-height-29">{{ $t('STARTER') }}</div>
              <div class="nowrap mt-20">
                <span class="heading-dark-20" v-if="isCN">888 CNY</span>
                <span class="heading-dark-20" v-else>$349</span>
                <span class="heading-grey-13">{{ $t('/month') }}</span>
              </div>
              <div class="mt-20">
                <console-button
                  class="console-btn-primary w-100"
                  v-if="CurrentSubscription !== 'STARTER'"
                  :disabled="!subscribePermisson"
                  @click="confirmSave('STARTER')"
                  >{{ $t('Subscribe') }}</console-button
                >
                <console-button class="console-btn-white w-100" v-if="CurrentSubscription === 'STARTER'" disabled>{{
                  $t('Subscribed')
                }}</console-button>
              </div>
            </div>
          </el-col>
          <el-col class="row-item header" :span="4">
            <div class="plan-item header">
              <div class="heading-dark-24 line-height-29">{{ $t('PRO') }}</div>
              <div class="nowrap mt-20">
                <span class="heading-dark-20" v-if="isCN">2888 CNY</span>
                <span class="heading-dark-20" v-else>$699</span>
                <span class="heading-grey-13">{{ $t('/month') }}</span>
              </div>
              <div class="mt-20">
                <console-button
                  class="console-btn-primary w-100"
                  v-if="CurrentSubscription !== 'PRO'"
                  :disabled="!subscribePermisson"
                  @click="confirmSave('PRO')"
                  >{{ $t('Subscribe') }}</console-button
                >
                <console-button class="console-btn-white w-100" v-if="CurrentSubscription === 'PRO'" disabled>{{
                  $t('Subscribed')
                }}</console-button>
              </div>
            </div>
          </el-col>
          <el-col class="row-item header" :span="4">
            <div class="plan-item header">
              <div class="heading-dark-24 line-height-29">{{ $t('ENTERPRISE') }}</div>
              <div class="nowrap mt-20">
                <span class="heading-dark-20" v-if="isCN">4888 CNY</span>
                <span class="heading-dark-20" v-else>Customized</span>
                <span class="heading-grey-13">{{ $t('/month') }}</span>
              </div>
              <div class="mt-20">
                <console-button
                  class="console-btn-primary w-100"
                  @click="confirmSave('ENTERPRISE')"
                  v-if="CurrentSubscription !== 'ENTERPRISE'"
                  :disabled="!subscribePermisson"
                  >{{ $t('Subscribe') }}</console-button
                >
                <console-button class="console-btn-white w-100" v-if="CurrentSubscription === 'ENTERPRISE'" disabled>{{
                  $t('Subscribed')
                }}</console-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-collapse v-model="activeNames">
          <el-collapse-item :title="item.title" :name="item.index" v-for="item in ChatSubscriptions">
            <el-row v-for="children in item.childrens" :key="children.description">
              <el-col class="row-item" :span="8">
                <div class="plan-item description text-truncate">
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="children.description"
                    placement="top"
                    :disabled="children.description.length < 50"
                  >
                    <span>{{ children.description }}</span>
                  </el-tooltip>
                </div>
              </el-col>
              <el-col class="row-item" :span="4">
                <div class="plan-item">
                  <img :src="IconChecked" v-if="children.Free === 'true'" />
                  <i class="el-icon-circle-close-outline" v-else-if="children.Free === 'false'"></i>
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="children.Free"
                    placement="left"
                    v-else
                    :disabled="children.Free.length < 8"
                  >
                    <span>{{ children.Free }}</span>
                  </el-tooltip>
                </div>
              </el-col>
              <el-col class="row-item" :span="4">
                <div class="plan-item">
                  <img :src="IconChecked" v-if="children.Starter === 'true'" /><i
                    class="el-icon-circle-close-outline
"
                    v-else-if="children.Starter === 'false'"
                  ></i>
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="children.Starter"
                    placement="left"
                    v-else
                    :disabled="children.Starter.length < 8"
                  >
                    <span>{{ children.Starter }}</span>
                  </el-tooltip>
                </div>
              </el-col>
              <el-col class="row-item" :span="4">
                <div class="plan-item">
                  <img :src="IconChecked" v-if="children.Pro === 'true'" /><i
                    class="el-icon-circle-close-outline"
                    v-else-if="children.Pro === 'false'"
                  ></i>
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="children.Pro"
                    placement="left"
                    v-else
                    :disabled="children.Pro.length < 8"
                  >
                    <span>{{ children.Pro }}</span>
                  </el-tooltip>
                </div>
              </el-col>
              <el-col class="row-item" :span="4">
                <div class="plan-item">
                  <img :src="IconChecked" v-if="children.Enterprise === 'true'" /><i
                    class="el-icon-circle-close-outline"
                    v-else-if="children.Enterprise === 'false'"
                  ></i>
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="children.Enterprise"
                    placement="left"
                    v-else
                    :disabled="children.Enterprise.length < 8"
                  >
                    <span v-html="children.Enterprise"></span>
                  </el-tooltip>
                </div>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div v-if="isChatSubscription" class="mt-30 text-right">
        <console-button
          class="console-btn-primary"
          :disabled="!subscribePermisson"
          @click="() => showConfirmUnsubscribe = true "
          >Unsubscribe</console-button
        >
      </div>
    </div>
    <el-dialog
      :title='isChatSubscription ? $t("Switch Plan") : "Subscribe to a Chat Package"'
      :visible="showConfirmDialog"
      :before-close="() => showConfirmDialog = false"
    >
      <div class="heading-dark-14" v-if="isChatSubscription">
        <div v-if="getSwitchHigher(selectPlanName)">
          <div>Important considerations:</div>
          <ul class="line-height-24">
            <li>You are currently subscribed to {{ CurrentSubscription }}.</li>
            <li>
              Switching to the {{ selectPlanName }} package will take effect immediately.Are you sure you want to make
              this change?
            </li>
          </ul>
        </div>
        <div v-else>
          <div>Important considerations:</div>
          <ul class="line-height-24">
            <li>This switch will be effective immediately</li>
            <li>A prorated activation fee will be applied to the current month</li>
            <li>
              WE DO NOT RECOMMEND DOWNGRADING because of the impact on the capacity of your applications and certain
              features. If you downgrade, we strongly recommend that you review the project-level configurations of each
              implementation to see what features are no longer available.
            </li>
          </ul>
        </div>
      </div>
      <div v-else>{{ $t('Subscribe now', { planName: selectPlanName }) }}</div>
      <div class="mt-30 text-right">
        <console-button class="console-btn-white" @click="() => showConfirmDialog = false">
          {{ $t('Cancel') }}
        </console-button>
        <console-button
          class="console-btn-primary"
          :disabled="loading"
          :loading="loading"
          @click="setCompanyChatSubscription"
        >
          {{ isChatSubscription ? $t('Switch Package') : 'Subscribe' }}
        </console-button>
      </div>
    </el-dialog>
    <el-dialog
      :title='$t("Unsubscribe")'
      :visible="showConfirmUnsubscribe"
      :before-close="() => showConfirmUnsubscribe = false"
    >
      <div class="heading-dark-14 f-500">You are about to unsubscribe Chat</div>
      <div class="mt-20">
        <div>Projects using chat:</div>
        <ul>
          <li v-for="item in openedProjects">{{ item.name }}</li>
        </ul>
      </div>
      <div class="divider"></div>
      <div>We are always improving our products and your feedback matters.</div>
      <el-form :model="formData" ref="form" :rules="rules">
        <el-form-item
          label="1. Why do you want to unsubscribe Chat? (Select all that apply)"
          label-position="top"
          required
          prop="unsubscribeReason"
        >
          <el-checkbox-group v-model="formData.unsubscribeReason" class="clear-both">
            <div v-for="item in unsubscribeReasonOptions">
              <el-checkbox :label="item" :key="item"></el-checkbox>
            </div>
          </el-checkbox-group>
          <el-input v-model="formData.otherReason" size="small"></el-input>
        </el-form-item>
        <el-form-item
          label="2. Please specify the chat/messaging vendors you will switch to."
          label-position="top"
          prop="switchVendors"
          required
        >
          <el-input type="textarea" v-model="formData.switchVendors"></el-input>
        </el-form-item>
        <div class="divider"></div>
        <div class="mb-20">
          Please note that you can <a href="https://agora-ticket.agora.io/" target="_blank">submit a ticket</a> (with
          links in console) and our support team will offer help and guidance.
        </div>
        <el-form-item required prop="unsubscribingCheck">
          <el-checkbox
            label="I understand that unsubscribing Chat may result in these consequences: All the Chat-related data will be purged and you cannot undo this action."
            v-model="formData.unsubscribingCheck"
            class="unsubscribing-checkbox"
          ></el-checkbox>
        </el-form-item>
      </el-form>
      <div class="mt-30 text-right">
        <console-button class="console-btn-white" @click="() => showConfirmUnsubscribe = false">
          {{ $t('Cancel') }}
        </console-button>
        <console-button
          class="console-btn-primary"
          :disabled="loading || !formData.unsubscribingCheck"
          :loading="loading"
          @click="confirmUnsubscribe"
        >
          {{ $t('Unsubscribe') }}
        </console-button>
      </div>
    </el-dialog>
  </div>`,
})
export default class SubscribeView extends Vue {
  isChatSubscription = false
  loading = false
  showConfirmDialog = false
  subscriptionInfo: any = {}
  selectPlanName = ''
  ChatSubscriptions: ChatSubscription[] = []
  activeNames = ['User', 'Message', 'Group']
  IconChecked = IconChecked
  isCN = user.info.company.area === 'CN'
  user = user
  currentGoods = []
  subscribedGoods = []
  ChatGoodsInfo: any = {}
  roleId: number | null = null
  isMember = user.info.isMember
  planList = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE']
  showConfirmUnsubscribe = false
  unsubscribeReasonOptions = [
    'Chat is missing some features I need',
    'Chat is too expensive for me',
    'Too many bugs or unstable services',
    'Not enough/clear guidance from the documentation or Agora’s support team',
    'Other (please specify)',
  ]
  formData = {
    unsubscribeReason: [],
    otherReason: '',
    switchVendors: '',
    unsubscribingCheck: false,
  }
  openedProjects: any = []
  rules: any = {
    unsubscribeReason: [{ required: true, message: 'required', trigger: 'blur' }],
    switchVendors: [{ required: true, message: 'required', trigger: 'blur' }],
    unsubscribingCheck: [{ required: true, message: 'required', trigger: 'blur' }],
  }

  get CurrentSubscription() {
    if (!this.isChatSubscription) return undefined
    return this.subscriptionInfo.planName
  }

  get aaPackageConfig() {
    return this.GlobalConfig.config.aaPackage
  }

  get hasChatPackage() {
    return (
      this.currentGoods &&
      this.currentGoods.length &&
      this.currentGoods.find((item: any) => {
        return item.mutexTag.toUpperCase() === 'AA_AGORA_CHAT_DATA_INSIGHT' && item.orderStatus === 'Paid'
      })
    )
  }

  get hasChatPackageSubscription() {
    return (
      this.subscribedGoods &&
      this.subscribedGoods.length &&
      this.subscribedGoods.find((item: any) => {
        return item.customUid === this.aaPackageConfig.chatCustomUid && item.subscriptionStatus === 'Active'
      })
    )
  }

  get subscribePermisson() {
    if (this.isMember) {
      return this.roleId === 1
    }
    return true
  }

  mounted() {
    this.getCompanyChatSubscription()
    this.getChatGoods()
    this.getCurrentOrders()
    this.getSubscribedGoods()
    this.getChatFunction()
    if (this.isMember) {
      this.getRoleId()
    }
    this.getAllProjects()
  }

  async getCompanyChatSubscription() {
    this.isChatSubscription = false
    this.loading = true
    try {
      const res = await this.$http.get(`/api/v2/chat/subscription`)
      if (res.data && res.data.subscriptions.length > 0) {
        this.isChatSubscription = true
        this.subscriptionInfo = res.data.subscriptions[0]
      }
    } catch (e) {}
    this.loading = false
  }

  confirmSave(plan_name: string) {
    if (this.subscriptionInfo === 'ENTERPRISE' || plan_name === 'ENTERPRISE') {
      this.$alert(
        'To switch to or from the Enterprise package, <a href="https://www.agora.io/en/contact-sales" target="_blank">contact sales.</a>',
        'Please Contact Sales',
        { dangerouslyUseHTMLString: true }
      )
      return
    }
    this.showConfirmDialog = true
    this.selectPlanName = plan_name
  }

  async setCompanyChatSubscription() {
    this.loading = true
    try {
      await this.$http.put(`/api/v2/chat/subscription`, { plan_name: this.selectPlanName })
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.showConfirmDialog = false
      this.getCompanyChatSubscription()
      this.confirmOpenFPAPackege()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async getCurrentOrders() {
    const { data } = await this.$http.get('/api/v2/goods/company/order/all')
    this.currentGoods = data
  }

  async getSubscribedGoods() {
    const { data } = await this.$http.get('/api/v2/goods/company/subscription/all')
    this.subscribedGoods = data
  }

  async payAAFree(targetGoods: any) {
    this.loading = true
    try {
      const params: any = {
        goodsId: targetGoods.goodsId,
      }
      await this.$http.post('/api/v2/goods/order/free', params)
      await this.getCurrentOrders()
      await this.getSubscribedGoods()
      this.$message.success(this.$t('AA_Free_Subscription_FPA_success') as string)
    } catch (e) {
      this.$message.error(this.$t('Payment fail') as string)
    }
    this.loading = false
  }

  async getChatGoods() {
    try {
      const result = await this.$http.get('/api/v2/goods/chat')
      this.ChatGoodsInfo = result.data
    } catch (e) {}
  }

  confirmOpenFPAPackege() {
    if (this.hasChatPackage || this.hasChatPackageSubscription) {
      return
    }
    this.payAAFree(this.ChatGoodsInfo)
  }

  async getRoleId() {
    try {
      const users = await this.$http.get('/api/v2/members')
      const userList = users.data
      const currentUserMember = userList.find((user: any) => {
        user.userId = this.user.info.id
      })
      if (currentUserMember) {
        this.roleId = currentUserMember.roleId
      }
    } catch (e) {}
  }

  getSwitchHigher(plan_name: string) {
    const currentInex = this.planList.indexOf(this.CurrentSubscription)
    const selectIndex = this.planList.indexOf(plan_name)
    return selectIndex > currentInex
  }

  async getProjectChatStatus(projectId: string) {
    try {
      const res = await this.$http.get(`/api/v2/project/${projectId}/chat/info`)
      if (res.data.instances.length > 0) {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  async getAllProjects() {
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: { fetchAll: true } })
      const allProjects = ret.data.items
      for (const project of allProjects) {
        if (await this.getProjectChatStatus(project.projectId)) {
          this.openedProjects.push(project)
        }
      }
    } catch (e) {
      return []
    }
  }

  confirmUnsubscribe() {
    ;(this.$refs['form'] as any).validate(async (valid: any) => {
      if (valid) {
        this.$confirm(
          'Unsubscribing takes effect immediately. A prorated activation fee will be applied to the current month.',
          this.$t('Unsubscribe') as string,
          {
            confirmButtonText: this.$t('Continue') as string,
            cancelButtonText: this.$t('Cancel') as string,
            type: 'warning',
          }
        ).then(() => {
          this.unsubscribe()
        })
      } else {
        return false
      }
    })
  }

  async unsubscribe() {
    this.loading = true
    try {
      await this.$http.delete(`/api/v2/chat/subscription`, { data: this.formData })
      this.$message({
        message: this.$t('ApplySuccess') as string,
        type: 'success',
      })
      this.showConfirmUnsubscribe = false
      this.getCompanyChatSubscription()
    } catch (e) {
      this.$message.error(this.$t('SaveFailed') as string)
    }
    this.loading = false
  }

  async getChatFunction() {
    const functionList = (await this.$http.get('/api/v2/chat/function')).data as ChatFullDescription
    const ChatSubscriptions: ChatSubscription[] = []
    Object.keys(functionList).forEach((item) => {
      const childrens: any = []
      Object.values(functionList[item].childrens).forEach((value) => {
        childrens.push(value)
      })
      ChatSubscriptions.push({
        index: functionList[item].type,
        title: functionList[item].type,
        childrens: childrens,
      })
    })
    this.ChatSubscriptions = ChatSubscriptions
  }
}
