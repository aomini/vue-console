import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { user } from '@/services'
const NoDataImg = require('@/assets/icon/pic-member.png')
const IconPen = require('@/assets/icon/icon-pen.png')
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div class="card-box overview-card-1" v-loading="loading">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03 card-title-row">{{ $t('Member Management') }}</span>
        </div>
        <div class="header-right" @click="goToMemberPage">
          <span class="heading-dark-03 card-title-row">{{ $t('More') }}</span>
          <i class="iconfont iconicon-go f-20 vertical-middle"></i>
        </div>
      </div>
      <div class="card-content">
        <div v-if="tableData.length === 0" class="h-100">
          <div class="overview-empty text-center">
            <img height="90px" class="mr-5 my-2" :src="NoDataImg" />
            <div class="permission-text mt-13 heading-light-05">{{ $t('NoMember') }}</div>
          </div>
        </div>
        <div v-else class="h-100">
          <el-table :data="tableData" row-class-name="dark-table-row" class="">
            <el-table-column prop="email" :label="$t('MemberEmail')" class-name="text-truncate"></el-table-column>
            <el-table-column
              prop="roleName"
              :label='$t("Role")'
              align="center"
              label-class-name="table-header"
              class-name="table-content"
            >
            </el-table-column>
            <el-table-column
              prop="created"
              :label='$t("CreatedTime")'
              label-class-name="table-header"
              class-name="table-content"
            >
              <template slot-scope="scope">
                {{ scope.row.createTime | UTC |formatDate('YYYY-MM-DD') }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('Action')" align="right">
              <template slot-scope="scope">
                <router-link :to='{ path: "/settings/member" }'>
                  <el-tooltip :content='$t("Edit")' placement="top">
                    <img class="table-action-img" :src="IconPen" />
                  </el-tooltip>
                </router-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="card-footer">
        <div v-html="$tc('TotalMembers', tableData.length, { total: tableData.length })" @click="goToMemberPage"></div>
        <console-button v-if="!disableAdd" @click="goToMemberPage" class="console-btn-white overview-btn">{{
          $t('InviteMemberBtn')
        }}</console-button>
      </div>
    </div>
  `,
})
export default class MemberCard extends Vue {
  isCocos = user.info.isCocos
  tableData = []
  total: number = 0
  loading = false
  disableAdd: boolean = false
  NoDataImg = NoDataImg
  IconPen = IconPen
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false

  goToMemberPage(query: any) {
    this.$router.push({ path: '/settings/member', query: query })
  }

  async mounted() {
    this.getMembers()
  }

  async getMembers() {
    this.loading = true
    try {
      const users = await this.$http.get('/api/v2/members')
      const userList = users.data
      const defaultRoles = this.$t('defaultRoles') as any
      for (let i = 0; i < userList.length; i++) {
        if (userList[i].roleId in defaultRoles) {
          userList[i].roleName = defaultRoles[userList[i].roleId]
        }
      }
      this.tableData = userList

      const checkMemberLimit = await this.$http.get('/api/v2/members/checkMemberLimit')
      this.disableAdd = !checkMemberLimit.data
    } catch (e) {
      this.$message.error(this.$t('FailedGetMembers') as string)
    }
    this.loading = false
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'member-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
