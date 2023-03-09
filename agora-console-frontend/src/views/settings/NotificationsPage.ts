import Vue from 'vue'
import Component from 'vue-class-component'
import './Setting.less'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import { user } from '@/services/user'
import { NotificationStatus, NotificationTypes } from '@/models/RoleModels'
const IconCheck = require('@/assets/icon/icon-check-blue.png')
const IconEditContent = require('@/assets/icon/icon-edit-content.png')

@Component({
  components: {
    TwoFactorConfirm: TwoFactorConfirm,
  },
  template: ` <div class="p-3 my-3">
    <div class="module-title">
      <el-button
        type="text"
        size="medium"
        icon="el-icon-arrow-left"
        @click="back"
        style="color: #333333; font-size: 16px; font-weight: 400"
      >
        {{ $t('Back') }}
      </el-button>
      <span style="color: #E3E3EC; padding: 0 10px"> | </span>
      {{ $t('Notification preference') }}
    </div>
    <el-alert
      type="error"
      v-if="userInfo.emailStatus!==1||(!userInfo.verifyPhone || userInfo.verifyPhone==='0')"
      :closable="false"
    >
      <div class="email-hint" v-if="userInfo.emailStatus!==1">
        <img :src='getImgUrl("warning")' class="warn-icon" />
        <span>{{ $t('EmailHint') }}</span>
      </div>
      <div class="email-hint" v-if="!userInfo.verifyPhone || userInfo.verifyPhone==='0'">
        <img :src='getImgUrl("alert")' class="warn-icon" />
        <span>{{ $t('PhoneHint') }}</span>
      </div>
    </el-alert>
    <div class="card mt-20">
      <el-table :data="notificationList" cell-class-name="text-truncate" v-loading="loading">
        <el-table-column
          prop="key"
          :label='this.$t("Type")'
          label-class-name="table-header"
          class-name="text-truncate table-content"
        >
        </el-table-column>
        <el-table-column
          align="center"
          :label='this.$t("DashboardMessage")'
          class-name="table-content"
          label-class-name="table-header"
        >
          <template slot-scope="scope">
            <img
              v-if="scope.row.originSetting.dashboardOpen===1&&!scope.row.editing"
              class="status-img"
              :src="IconCheck"
            />
            <el-checkbox
              v-model="scope.row.setting.dashboardOpen"
              v-if="scope.row.editing"
              :true-label="trueLabel"
              :false-label="falseLabel"
              :disabled="!scope.row.setting.enableDashboard"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label='this.$t("Email")'
          class-name="text-truncate table-content"
          label-class-name="table-header"
        >
          <template slot-scope="scope">
            <img v-if="scope.row.originSetting.emailOpen===1&&!scope.row.editing" class="status-img" :src="IconCheck" />
            <el-checkbox
              v-model="scope.row.setting.emailOpen"
              v-if="scope.row.editing"
              :true-label="trueLabel"
              :false-label="falseLabel"
              :disabled="!scope.row.setting.enableEmail"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label='this.$t("TextMessage")'
          class-name="text-truncate table-content"
          label-class-name="table-header"
        >
          <template slot-scope="scope">
            <img v-if="scope.row.originSetting.textOpen===1&&!scope.row.editing" class="status-img" :src="IconCheck" />
            <el-checkbox
              v-model="scope.row.setting.textOpen"
              v-if="scope.row.editing"
              :true-label="trueLabel"
              :false-label="falseLabel"
              :disabled="!enableText||!scope.row.setting.enableText"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          prop="action"
          :label='$t("Action")'
          width="200px"
          label-class-name="table-header"
          class-name="table-content"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <a>
                <i><img class="table-action-img" @click="editRow(scope.$index, scope.row)" :src="IconEditContent" /></i>
              </a>
            </div>
            <div v-else>
              <console-button class="console-btn-white" @click="onEditSave(scope.row)" :disabled="scope.row.saving">
                {{ $t('OK') }}
              </console-button>
              <console-button class="console-btn-white" @click="onEditCancel(scope.row)">
                {{ $t('Cancel') }}
              </console-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>`,
})
export default class NotificationsPage extends Vue {
  loading = false
  userInfo = user.info
  notificationList: any = []
  // financeDefaultId = [1, 2, 3, 4, 5, 6]
  enableText = user.info.verifyPhone && user.info.verifyPhone !== '0'
  enableFinance = user.info.permissions['FinanceCenter'] > 0
  trueLabel = 1
  falseLabel = 0
  notificationWithoutEditing = []
  IconCheck = IconCheck
  IconEditContent = IconEditContent

  async created() {
    this.loading = true
    try {
      this.notificationList = await this.getNotifications()
    } catch (e) {
      this.$message.error(this.$t('FailedLoadData') as string)
    }
    this.loading = false
  }

  async getNotifications() {
    try {
      const notificationTypes = await this.$http.get('/api/v2/notifications')
      const notificationList = notificationTypes.data
      const defaultNotification = this.$t('notificationTypes') as any
      for (let i = 0; i < notificationList.length; i++) {
        const useDefault = !notificationList[i].setting.accountId
        if (
          notificationList[i].id === NotificationTypes.Account ||
          notificationList[i].id === NotificationTypes.Billing
        ) {
          if (!user.info.isMember || this.enableFinance) {
            notificationList[i].setting.dashboardOpen = useDefault
              ? NotificationStatus.ENABLE
              : notificationList[i].setting.dashboardOpen
            notificationList[i].setting.enableDashboard = NotificationStatus.ENABLE
            notificationList[i].setting.emailOpen = useDefault
              ? NotificationStatus.ENABLE
              : notificationList[i].setting.emailOpen
            notificationList[i].setting.enableEmail = true
            notificationList[i].setting.textOpen = useDefault
              ? NotificationStatus.ENABLE
              : notificationList[i].setting.textOpen
            notificationList[i].setting.enableText = true
          } else {
            notificationList[i].setting.dashboardOpen = NotificationStatus.DISABLED
            notificationList[i].setting.enableDashboard = false
          }
        } else if (notificationList[i].id === NotificationTypes.Product) {
          notificationList[i].setting.enableDashboard = true
          notificationList[i].setting.dashboardOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.dashboardOpen
          notificationList[i].setting.emailOpen = useDefault
            ? NotificationStatus.DISABLED
            : notificationList[i].setting.emailOpen
          notificationList[i].setting.enableEmail = true
          notificationList[i].setting.textOpen = useDefault
            ? NotificationStatus.DISABLED
            : notificationList[i].setting.textOpen
          notificationList[i].setting.enableText = false
        } else if (notificationList[i].id === NotificationTypes.Promotion) {
          notificationList[i].setting.enableDashboard = true
          notificationList[i].setting.dashboardOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.dashboardOpen
          notificationList[i].setting.enableEmail = true
          notificationList[i].setting.emailOpen = useDefault
            ? NotificationStatus.DISABLED
            : notificationList[i].setting.emailOpen
          notificationList[i].setting.enableText = false
          notificationList[i].setting.textOpen = useDefault
            ? NotificationStatus.DISABLED
            : notificationList[i].setting.textOpen
        } else if (notificationList[i].id === NotificationTypes.Operation) {
          notificationList[i].setting.enableDashboard = true
          notificationList[i].setting.dashboardOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.dashboardOpen
          notificationList[i].setting.emailOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.emailOpen
          notificationList[i].setting.enableEmail = true
          notificationList[i].setting.textOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.textOpen
          notificationList[i].setting.enableText = true
        } else if (notificationList[i].id === NotificationTypes.Tickets) {
          notificationList[i].setting.enableDashboard = true
          notificationList[i].setting.dashboardOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.dashboardOpen
          notificationList[i].setting.enableEmail = true
          notificationList[i].setting.emailOpen = useDefault
            ? NotificationStatus.ENABLE
            : notificationList[i].setting.emailOpen
          notificationList[i].setting.enableText = false
          notificationList[i].setting.textOpen = useDefault
            ? NotificationStatus.DISABLED
            : notificationList[i].setting.textOpen
        }

        if (notificationList[i].id in defaultNotification) {
          notificationList[i].key = defaultNotification[notificationList[i].id]
        }
      }
      this.notificationWithoutEditing = notificationList
      const notificationEdit = this.notificationWithoutEditing.map((notification: any) =>
        Object.assign({}, notification, {
          editing: false,
          saving: false,
          originSetting: Object.assign({}, notification.setting),
        })
      )
      return notificationEdit
    } catch (e) {
      this.$message.error(this.$t('FailedGetNotifications') as string)
    }
  }
  async onEditSave(row: any) {
    await this.updateNotification(row)
    row.editing = false
  }
  async updateNotification(row: any) {
    const setting = row.setting
    this.loading = true
    row.saving = true
    try {
      await this.$http.post('/api/v2/notifications/setting', {
        messageId: row.id,
        dashboardOpen: setting.dashboardOpen,
        emailOpen: setting.emailOpen,
        textOpen: setting.textOpen,
      })
      row.originSetting = row.setting
      this.$message({
        message: this.$t('SavedSuccess') as string,
        type: 'success',
      })
    } catch (e) {
      this.$message.error(this.$t('SavedFail') as string)
    }
    this.loading = false
    row.saving = false
  }
  editRow(index: number) {
    this.notificationList[index].editing = true
  }

  onEditCancel(row: any) {
    row.editing = false
    row.setting = Object.assign({}, row.originSetting)
  }

  getImgUrl(icon: string) {
    const images = require.context('@/assets/icon/', false, /\.png$/)
    return images('./icon-' + icon + '.png')
  }

  back() {
    this.$router.push({ path: '/message' })
  }
  // async refreshUserInfo() {
  //   const user = await getUserInfo()
  //   this.userInfo = user.info
  // }
}
