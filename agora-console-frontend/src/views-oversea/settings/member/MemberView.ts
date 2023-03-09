import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { validateEmail } from '@/utils/utility'
const IconPen = require('@/assets/icon/icon-pen.png')
const IconPermission = require('@/assets/icon/icon-permission.png')
const IconDropdown = require('@/assets/icon/icon-dropdown.png')
const IconDelete = require('@/assets/icon/icon-delete.png')
import './Member.less'

@Component({
  template: `
    <div class="page-v3 member-page" v-loading="loading">
      <div class="module-title">{{ $t('MemberTitle') }}</div>
      <div class="module-title-tip">{{ $t('MemberMessage') }}</div>
      <el-tooltip :content='$t("MemberLimit")' placement="top" :disabled="!disableAdd">
        <div style="width: 120px;" class="mb-10 mt-20">
          <console-button class="console-btn-primary" :disabled="addingState || disableAdd" @click="addMember">
            {{ $t('Add') }}
          </console-button>
        </div>
      </el-tooltip>
      <div class="card">
        <el-table
          :data="memberList"
          stripe
          :empty-text='$t("MemberEmptyText")'
          cell-class-name="text-truncate"
          header-cell-class-name="text-truncate"
        >
          <el-table-column
            prop="email"
            :label='$t("MemberEmail")'
            label-class-name="table-header"
            class-name="table-content"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.email">{{ scope.row.email }}</div>
              <el-input
                v-else
                name="member"
                ref="member"
                id="member-input"
                class="member-input"
                v-model="memberEmail"
                size="mini"
              >
              </el-input>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" :label='$t("CreatedTime")'>
            <template slot-scope="scope">
              {{ scope.row.createTime | UTC |formatDate('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column prop="roleName" :label='$t("Role")' align="center">
            <template slot-scope="scope">
              <div v-if="!scope.row.editing">{{ scope.row.roleName }}</div>
              <el-dropdown v-else size="mini" trigger="click" @command="(command) => handleCommand(command)">
                <el-button class="button role-selected" size="mini">
                  <div class="d-flex justify-around align-center">
                    <img class="left-icon" :src="IconPermission" />
                    <div class="center-text text-truncate">{{ selectedRole }}</div>
                    <img class="right-icon" :src="IconDropdown" />
                  </div>
                </el-button>
                <el-dropdown-menu class="w-180 overflow-200" slot="dropdown">
                  <el-dropdown-item
                    v-for="(role, key) in roles"
                    :command="role"
                    :key="key"
                    class="text-truncate"
                    style="padding: 5px 10px;"
                  >
                    {{ role.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column
            prop="action"
            :label='$t("Action")'
            width="200px"
            label-class-name="table-header"
            class-name="table-content"
          >
            <template slot-scope="scope">
              <div v-if="!scope.row.editing">
                <a>
                  <i><img class="table-action-img" @click="editRow(scope.$index, scope.row)" :src="IconPen" /></i>
                </a>
                <img class="table-action-img" @click="deleteRow(scope.$index, scope.row)" :src="IconDelete" />
              </div>
              <div v-else>
                <console-button class="console-btn-primary" size="sm" @click="onAddSave(scope.row)">
                  {{ $t('OK') }}
                </console-button>
                <console-button class="console-btn-white" size="sm" @click="onAddCancel(scope.row)">
                  {{ $t('Cancel') }}
                </console-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog :title='$t("RemoveMember")' :visible.sync="showDeleteConfirmation" width="360px" :show-close="false">
        <div class="d-flex flex-column">
          <div class="mb-20">{{ $t('RemoveMemberConfirm') }}</div>
          <div class="mt-20 text-right">
            <console-button class="console-btn-primary" @click="confirmDelete"> {{ $t('Yes') }} </console-button>
            <console-button class="console-btn-white" @click="cancelDelete"> {{ $t('No') }} </console-button>
          </div>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class MemberView extends Vue {
  memberList: any = []
  membersWithoutEditing: any = []
  showDeleteConfirmation = false
  addingState = false
  disableAdd = false
  currentUserId = ''
  memberEmail = ''
  selectedRole = ''
  selectedRoleId = undefined
  roles: any = []
  loading = false
  user = user
  IconPen = IconPen
  IconPermission = IconPermission
  IconDropdown = IconDropdown
  IconDelete = IconDelete

  async created() {
    this.loading = true
    try {
      const getRoles = await this.$http.get('/api/v2/permission/getRoles', { params: { fetchAll: true } })
      const rolesList = getRoles.data.items
      const defaultRoles: any = this.$t('defaultRoles')
      for (let i = 0; i < rolesList.length; i++) {
        if (rolesList[i].id in defaultRoles) {
          rolesList[i].name = defaultRoles[rolesList[i].id]
        }
      }
      this.roles = rolesList
      this.memberList = await this.getMembers()
    } catch (e) {
      this.$message.error(this.$t('FailedGetMembers') as string)
    }
    this.loading = false
  }

  async addMember() {
    this.memberList = this.membersWithoutEditing.map((member: any) => Object.assign({}, member, { editing: false }))
    this.memberList.unshift({ email: '', created: new Date(), role: '', actionUrl: '', editing: true })
    this.addingState = true
    this.selectedRole = this.roles[0].name
    this.selectedRoleId = this.roles[0].id

    Vue.nextTick(() => {
      ;((this.$refs.member as any).$el as any).children[0].focus()
    })
  }

  async createNewMember() {
    const email = this.memberEmail.trim()
    if (!email) {
      this.$message.error(this.$t('EmailRequired') as string)
      return
    }

    if (!validateEmail(email)) {
      this.$message.error(this.$t('InvalidEmail') as string)
      return
    }

    try {
      const createdUser = await this.$http.post('/api/v2/member', { email: email, roleId: this.selectedRoleId })
      if (createdUser.data) {
        this.memberEmail = ''
        this.$message({
          message: this.$t('InvitationSuccess') as string,
          type: 'success',
        })
        this.memberList = await this.getMembers()
        this.addingState = false
      }
    } catch (e) {
      if (e.response && e.response.data.code === 8012) {
        this.$message.error(this.$t('EmailAlreadyRegistered') as string)
      } else if (e.response && e.response.data.code === 7008) {
        this.$message.error(this.$t('MemberLimit') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
    }
  }

  async updateExistingMember(userId: number) {
    try {
      await this.$http.put('/api/v2/member', { userId: userId, roleId: this.selectedRoleId })
      this.$message({
        message: this.$t('SavedSuccess') as string,
        type: 'success',
      })
      this.memberList = await this.getMembers()
    } catch (e) {
      this.$message.error(this.$t('FailedUpdateMember') as string)
    }
  }

  async onAddSave(row: any) {
    this.loading = true
    if (this.addingState) {
      await this.createNewMember()
    } else {
      await this.updateExistingMember(row.userId)
    }
    this.loading = false
  }

  onAddCancel(row: any) {
    this.currentUserId = ''
    this.memberEmail = ''
    if (this.addingState) {
      this.memberList.shift()
      this.addingState = false
      return
    }
    row.editing = false
  }

  handleCommand(command: any) {
    this.selectedRole = command.name
    this.selectedRoleId = command.id
  }
  editRow(index: number, row: any) {
    if (this.addingState) {
      this.memberList.shift()
      this.addingState = false
      index = index - 1
    }
    this.memberList = this.membersWithoutEditing.map((member: any) => Object.assign({}, member, { editing: false }))
    this.memberList[index].editing = true
    this.selectedRole = this.memberList[index].roleName
    this.selectedRoleId = this.memberList[index].roleId
    this.currentUserId = row.userId
  }
  deleteRow(index: number, row: any) {
    this.showDeleteConfirmation = true
    this.currentUserId = row.userId
    this.addingState = false
  }

  async confirmDelete() {
    this.loading = true
    this.showDeleteConfirmation = false
    try {
      await this.$http.delete('/api/v2/member', { params: { userId: this.currentUserId } })
      this.$message({
        message: this.$t('SuccessDeleteMember') as string,
        type: 'success',
      })
    } catch (e) {
      this.$message.error(this.$t('FailedDeleteMember') as string)
    }
    this.memberList = await this.getMembers()
    this.loading = false
  }
  cancelDelete() {
    this.showDeleteConfirmation = false
    this.currentUserId = ''
  }

  async getMembers() {
    try {
      const users = await this.$http.get('/api/v2/members')
      const userList = users.data
      const defaultRoles: any = this.$t('defaultRoles')
      for (let i = 0; i < userList.length; i++) {
        if (userList[i].roleId in defaultRoles) {
          userList[i].roleName = defaultRoles[userList[i].roleId]
        }
      }
      this.membersWithoutEditing = userList
      const usersWithEdit = userList.map((user: any) => Object.assign({}, user, { editing: false }))

      const checkMemberLimit = await this.$http.get('/api/v2/members/checkMemberLimit')
      this.disableAdd = !checkMemberLimit.data
      return usersWithEdit
    } catch (e) {
      this.$message.error(this.$t('FailedGetMembers') as string)
    }
  }
}
