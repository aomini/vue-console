import Vue from 'vue'
import Component from 'vue-class-component'
import Message from '@/views/message/Message'
import { user } from '@/services/user'
import './MessageCenter.less'
import MyPagination from '@/components/MyPagination'
const NoDataImg = require('@/assets/image/pic-nodata.png')
const settingsIcon = require('@/assets/icon/icon-setting.png')

@Component({
  components: {
    Message: Message,
    'my-pagination': MyPagination,
  },
  template: `
    <div class="d-flex flex-column mh-600">
      <div class="module-title">
        <el-button :class='{ "active-btn": condition.readStatus === ""}' class="message-btn" @click='setReadStatus("")'>
          {{ $t('All') }}
        </el-button>
        <el-button
          :class='{ "active-btn": condition.readStatus === false}'
          class="message-btn"
          @click="setReadStatus(false)"
        >
          {{ $t('Unread') }}
        </el-button>
        <el-button
          :class='{ "active-btn": condition.readStatus === true }'
          class="message-btn"
          @click="setReadStatus(true)"
        >
          {{ $t('Read') }}
        </el-button>
        <el-button class="message-btn" style="float: right; vertical-align: middle" @click="openNotification">
          <img height="20" :src="settingsIcon" style="vertical-align: sub" />
          {{ $t('Notification') }}
        </el-button>
        <el-tab-pane :label='$t("Notification")' name="notification"> </el-tab-pane>
      </div>
      <el-tabs v-model="condition.type" type="card" @tab-click="switchTab" v-if="enableFinance" class="message-tab">
        <el-tab-pane v-for="(message, key) of allTabs" :key="key" :name="message.type" :label="message.name">
        </el-tab-pane>
      </el-tabs>

      <el-tabs v-model="condition.type" type="card" @tab-click="switchTab" v-else class="message-tab">
        <el-tab-pane v-for="(message, key) of allTabs" :key="key" :name="message.type" :label="message.name">
        </el-tab-pane>
      </el-tabs>

      <div class="d-flex flex-row message-center" v-if="messages.length > 0" v-loading="loading">
        <div class="message-list">
          <Message
            v-for="(message, key) of messages"
            :message="message"
            :key="key"
            :onClick="readMessage"
            :index="key"
            :selectedIndex="condition.selectedIndex"
          >
          </Message>
          <div class="d-flex justify-between message-page">
            <div class="my-auto">{{ $t('Total') }}: {{ condition.total }}</div>
            <div class="page-box" v-if="true">
              <my-pagination
                v-model="condition"
                layout="prev, pager, next"
                @change="changePage"
                style="margin-top: 0px"
              ></my-pagination>
            </div>
          </div>
        </div>

        <div class="message-card">
          <div class="message-title title-color">{{ currentMessage.title }}</div>
          <div class="d-flex flex-row message-subtitle">
            <div>{{ $t('Published') }}:</div>
            <div class="ml-1">{{ currentMessage.createTime | formatDate() }}</div>
          </div>
          <div class="message-content-block" v-html="currentMessage.content"></div>
        </div>
      </div>

      <div class="card message-center" v-else v-loading="loading">
        <div class="m-auto">
          <img width="240px" :src="NoDataImg" />
          <div class="empty-text mt-2 text-center">{{ $t('NoMessage') }}</div>
        </div>
      </div>
    </div>
  `,
})
export default class MessageCenter extends Vue {
  currentMessage: any = {}
  loading: boolean = false
  enableFinance: boolean = user.info.permissions['FinanceCenter'] > 0
  textDefaultId: any = [1, 2, 4]
  condition = {
    page: 1,
    limit: 10,
    total: 0,
    type: 'all',
    offset: 0,
    readStatus: '',
    selectedIndex: 0,
    pagerCount: 4,
  }
  filterType: string = ''
  messageSetting: any = {}
  messages: any = []
  allTabs: any = []
  allTabsKeys: any = []
  NoDataImg = NoDataImg
  settingsIcon = settingsIcon

  switchTab(tab: any) {
    this.condition.type = tab.name
    this.condition.offset = 0
    this.$router.replace({ query: Object.assign({}, this.condition) as any })
    this.getMessages()
  }
  async readMessage(index: number) {
    this.currentMessage = this.messages[index]
    this.condition.selectedIndex = index
    this.$router.replace({ query: Object.assign({}, this.condition) as any })
    if (this.currentMessage) {
      this.messages[index].readStatus = true
      await this.$http.put('/api/v2/message/read', { id: this.currentMessage.msgId })
    }
  }
  changePage() {
    this.condition.offset = this.condition.limit * (this.condition.page - 1)
    this.condition.selectedIndex = 0
    this.$router.replace({ query: Object.assign({}, this.condition) as any })
    this.getMessages()
  }
  setReadStatus(status: string) {
    this.condition.readStatus = status
    this.condition.offset = 0
    this.$router.replace({ query: Object.assign({}, this.condition) as any })
    this.getMessages()
  }
  async getMessages() {
    this.loading = true
    try {
      if (this.condition.type === 'all') {
        this.filterType = this.allTabsKeys.join(',')
      }
      const ret = await this.$http.get('/api/v2/message/site-messages', {
        params: Object.assign({}, this.condition, { filterType: this.filterType }),
      })
      this.messages = ret.data.elements
      this.condition.total = ret.data.totalSize
      if (this.condition.selectedIndex > this.messages.length - 1) {
        this.currentMessage = {}
        this.condition.selectedIndex = 0
      } else {
        this.currentMessage = this.messages[this.condition.selectedIndex]
      }
    } catch (e) {
      this.$message.error(this.$t('FailedGetMessage') as string)
    }
    this.readMessage(this.condition.selectedIndex)
    this.loading = false
  }
  async getMessageSetting() {
    try {
      const messageSetting = await this.$http.get('/api/v2/notifications')
      const notificationList = messageSetting.data
      for (let i = 0; i < notificationList.length; i++) {
        this.messageSetting[notificationList[i].key] = notificationList[i].setting.dashboardOpen || 0
      }
    } catch (e) {
      // console.log(e)
    }
  }
  async created() {
    this.condition.selectedIndex = Number(this.$route.query.selectedIndex) || 0
    const messagesType = this.$t('messagesType') as any
    this.condition.type = this.$route.query.type || messagesType[0].type
    this.condition.offset = (this.$route.query.offset || 0) as number
    this.condition.page = Number(this.condition.offset / this.condition.limit) + 1
    const allTabs = this.enableFinance
      ? (this.$t('messagesType') as any)
      : (this.$t('messagesTypeWithoutFinance') as any)
    await this.getMessageSetting()
    for (const item in allTabs) {
      if (this.messageSetting[allTabs[item].type] === 1 || allTabs[item].type === 'all') {
        if (allTabs[item].type !== 'all') {
          this.allTabsKeys.push(allTabs[item].type)
        }
        this.allTabs.push(allTabs[item])
      }
    }
    this.getMessages()
  }

  openNotification() {
    this.$router.push({
      path: '/settings/notification',
    })
  }
}
