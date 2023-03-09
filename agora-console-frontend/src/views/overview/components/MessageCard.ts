import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { user } from '@/services/user'
const NoDataImg = require('@/assets/icon/pic-notice.png')
const IconPen = require('@/assets/icon/icon-pen.png')
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div class="card-box overview-card-1 message-card" v-loading="loading">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03">{{ $t('Message') }}</span>
        </div>
        <div class="header-right" @click="goToMessage">
          <span class="heading-dark-03">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div class="card-content">
        <div v-if="messages.length === 0" class="h-100">
          <div class="overview-empty text-center">
            <img height="90px" class="mr-5 my-2" :src="NoDataImg" />
            <div class="permission-text mt-13 heading-light-05">{{ $t('NoMessage') }}</div>
          </div>
        </div>
        <div v-else class="h-100">
          <el-table :data="messages" :show-header="false" row-class-name="dark-table-row" class="cursor-pointer" @row-click='goToMessage'>
            <el-table-column prop="title" class-name="text-truncate font-weight-bold" min-width="33%">
              <template slot-scope="scope">
                <span class="heading-dark-13" :class="scope.row.readStatus ? 'read-message' : ''">{{ scope.row.title + ':' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="title" class-name="text-truncate" min-width="67%">
              <template slot-scope="scope">
                <span class="heading-grey-13" :class="scope.row.readStatus ? 'read-message' : ''">{{ scope.row.content | formatHtml() }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="card-footer">
        <div v-html="$tc('TotalMessages', total, { total: total })" @click="goToMessage"></div>
      </div>
    </div>
  `,
})
export default class MessageCard extends Vue {
  messages: any = []
  messageSetting: any = {}
  allTabs = ['account', 'finance', 'product', 'operation', 'promotion', 'tickets']
  allTabsWithoutFinance = ['product', 'operation', 'promotion']
  selectTabs: any = []
  loading: boolean = false
  NoDataImg = NoDataImg
  IconPen = IconPen
  total: number = 0
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false

  async mounted() {
    this.loading = true
    const condition = {
      type: 'all',
      limit: 4,
      offset: 0,
      readStatus: '',
      withTotal: false,
      filterType: '',
      enableFinance: user.info.permissions['FinanceCenter'] > 0,
    }
    const allTabs = condition.enableFinance ? this.allTabs : this.allTabsWithoutFinance
    await this.getMessageSetting()
    for (const item in allTabs) {
      if (this.messageSetting[allTabs[item]] === 1) {
        this.selectTabs.push(allTabs[item])
      }
    }
    condition.filterType = this.selectTabs.join(',')
    try {
      const ret = await this.$http.get('/api/v2/message/site-messages', { params: condition })
      const messageWithoutIndex = ret.data.elements
      const messageWithIndex = []
      for (let i = 0; i < messageWithoutIndex.length; i++) {
        messageWithIndex.push(Object.assign({}, messageWithoutIndex[i], { index: i }))
      }
      this.messages = messageWithIndex
      this.total = ret.data.totalSize
    } catch (e) {
      this.$message.error(this.$t('getInfoErr') as string)
    }
    this.loading = false
  }

  getMessages() {
    this.$router.push({ name: 'message' })
  }
  goToMessage(row: any) {
    this.$router.push({ name: 'message', query: { selectedIndex: row.index } })
  }
  async getMessageSetting() {
    try {
      const messageSetting = await this.$http.get('/api/v2/notifications')
      const notificationList = messageSetting.data
      for (let i = 0; i < notificationList.length; i++) {
        this.messageSetting[notificationList[i].key] = notificationList[i].setting.dashboardOpen || 0
      }
    } catch (e) {
      console.info(e)
    }
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'message-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
