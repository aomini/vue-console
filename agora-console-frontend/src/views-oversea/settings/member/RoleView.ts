import Vue from 'vue'
import Component from 'vue-class-component'
import { ModulePermissions } from '@/models/RoleModels'
const IconDropdown = require('@/assets/icon/icon-dropdown.png')
const IconQuestion = require('@/assets/icon/icon-question.png')
const IconDelete = require('@/assets/icon/icon-delete.png')
const IconPen = require('@/assets/icon/icon-pen.png')
import './Member.less'
import MyPagiation from '@/components/MyPagination'

@Component({
  components: {
    'my-pagination': MyPagiation,
  },
  template: `
    <div class="page-v3 role-page">
      <div class="module-title">{{ $t('RoleTitle') }}</div>
      <div class="module-title-tip">{{ $t('RoleMessage') }}</div>
      <div class="mb-10 mt-20">
        <console-button class="console-btn-primary" :disabled="addingState" @click="addRole">
          {{ $t('AddRole') }}
        </console-button>
      </div>
      <div class="card">
        <el-table :data="roleList" stripe header-cell-class-name="text-truncate" v-loading="loading">
          <el-table-column prop="name" :label='$t("RoleName")' min-width="120">
            <template slot-scope="scope">
              <div v-if="!scope.row.editing">{{ scope.row.name }}</div>
              <el-input
                v-else
                name="role"
                ref="role"
                id="role-input text-truncate"
                size="mini"
                v-model="roleName"
                :maxlength="32"
              >
              </el-input>
            </template>
          </el-table-column>
          <el-table-column
            :label="modulePermission.name"
            v-for="(modulePermission, key) in $t('modules')"
            :key="key"
            align="left"
          >
            <template slot="header">
              <el-tooltip :content="modulePermission.name" placement="top" effect="light">
                <span>{{ modulePermission.name }}</span>
              </el-tooltip>
              <el-tooltip :content='$t("FinanceHint")' placement="top" v-if="modulePermission.id==='3'" effect="light">
                <img class="ml-3 vertical-middle" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
            </template>
            <template slot-scope="scope" class="w-100px">
              <div v-if="!scope.row.editing">
                {{ $t('permissions')[scope.row.permissions.module.filter(m => m.resId === modulePermission.id)[0].permission] }}
              </div>
              <el-dropdown
                v-else
                trigger="click"
                class="w-100px"
                @command="(command) => selectPermission(command, modulePermission.id)"
              >
                <el-button class="button permission-selected d-flex align-center" size="mini">
                  <span class="center-text"
                    >{{ $t('permissions')[modulePermissions[modulePermission.id].permission] }}
                  </span>
                  <img class="right-icon w-18" :src="IconDropdown" />
                </el-button>
                <el-dropdown-menu class="w-100px" slot="dropdown">
                  <el-dropdown-item :key="0" :command="0" v-if="modulePermission.permission.includes(0)">
                    {{ $t('permissions')[0] }}
                  </el-dropdown-item>
                  <el-dropdown-item :key="1" :command="1" v-if="modulePermission.permission.includes(1)">
                    {{ $t('permissions')[1] }}
                  </el-dropdown-item>
                  <el-dropdown-item :key="2" :command="2" v-if="modulePermission.permission.includes(2)">
                    {{ $t('permissions')[2] }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column prop="aa" :label='$t("Agora_Analytics")' width="200">
            <template slot-scope="scope">
              <div v-if="!scope.row.editing">{{ scope.row.permissions.permissionForAA }}</div>
              <div v-if="scope.row.editing">
                <el-select
                  v-model="modulesForAAList"
                  @change="selectChange"
                  multiple
                  filterable
                  :placeholder="$t('ProjectsPlaceholder')"
                >
                  <el-option v-for="module in modulesForAA" :key="module.id" :label="module.name" :value="module.id">
                  </el-option>
                </el-select>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="data" :label='$t("Data")' width="200">
            <template slot="header" slot-scope="scope">
              <span>{{ $t('Data') }}</span>
              <el-tooltip :content='$t("DataHint")' placement="top" effect="light">
                <img class="ml-3 vertical-middle" width="15" :src="IconQuestion" alt="" />
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <div
                v-if='!scope.row.editing && !!scope.row.permissions.project && scope.row.permissions.project.length === 1 && scope.row.permissions.project[0].resId === "0"'
              >
                {{ $t('SelectAllProjects') }}
              </div>
              <div
                v-else-if="!scope.row.editing && (!!scope.row.permissions.project && scope.row.permissions.project.length < 2 || !scope.row.permissions.project)"
              >
                {{
                  $t('ProjectAmount', {
                    amount: scope.row.permissions.project ? scope.row.permissions.project.length : 0
                  })
                }}
              </div>
              <div
                v-else-if="!scope.row.editing && !!scope.row.permissions.project && scope.row.permissions.project.length > 1"
              >
                {{ $t('ProjectsAmount', { amount: scope.row.permissions.project.length }) }}
              </div>
              <div v-if="scope.row.editing">
                <el-select
                  v-model="projectList"
                  @change="selectChange"
                  multiple
                  filterable
                  :placeholder="$t('ProjectsPlaceholder')"
                >
                  <el-option :key="0" :label="$t('SelectAllProjects')" :value="0"> </el-option>
                  <el-option
                    v-for="vendor in vendors"
                    :key="vendor.projectId"
                    :label="vendor.name"
                    :value="vendor.projectId"
                  >
                  </el-option>
                </el-select>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="action"
            :label='$t("Action")'
            width="200px"
            label-class-name="table-header"
            class-name="table-content"
            fixed="right"
          >
            <template slot-scope="scope">
              <div v-if='scope.row.companyId !== "0"'>
                <div v-if="!scope.row.editing">
                  <a>
                    <i><img class="table-action-img" @click="editRow(scope.$index, scope.row)" :src="IconPen" /></i>
                  </a>
                  <img class="table-action-img" @click="deleteRow(scope.$index, scope.row)" :src="IconDelete" />
                </div>
                <div v-else>
                  <console-button class="console-btn-primary" @click="onAddSave(scope.row)">
                    {{ $t('OK') }}
                  </console-button>
                  <console-button class="console-btn-white" @click="onAddCancel(scope.row)">
                    {{ $t('Cancel') }}
                  </console-button>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt-2 text-right" v-if="total > 10">
          <my-pagination v-model="condition" @change="changePage"></my-pagination>
        </div>

        <el-dialog :title='$t("RemoveRole")' :visible.sync="showDeleteConfirmation" width="360px" :show-close="false">
          <div class="d-flex flex-column">
            <div class="mb-20">{{ $t('RemoveRoleConfirm') }}</div>
            <div class="text-right">
              <console-button class="console-btn-primary" @click="confirmDelete"> {{ $t('Yes') }} </console-button>
              <console-button class="console-btn-white" @click="cancelDelete"> {{ $t('No') }} </console-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  `,
})
export default class RoleView extends Vue {
  roleList: any = []
  rolesWithoutEditing: any = []
  vendors: any = []
  projectList: any = []
  showDeleteConfirmation = false
  addingState = false
  roleName = ''
  loading = false
  currentRoleId: undefined | string = undefined
  total = 0
  modulePermissions: any = ModulePermissions
  modules = this.$t('modules')
  modulesForAA = this.$t('modulesForAA') as any
  modulesForAAList: any = []
  condition = {
    page: 1,
    limit: 10,
    total: 0,
  }
  IconDropdown = IconDropdown
  IconQuestion = IconQuestion
  IconDelete = IconDelete
  IconPen = IconPen

  async created() {
    this.loading = true
    try {
      const projectsInfo = await this.$http.get('/api/v2/projects', { params: { fetchAll: true, admin: true } })
      this.vendors = projectsInfo.data.items
      this.condition.limit = Number(this.$route.query.limit) | 0
      if (this.condition.limit <= 0) this.condition.limit = 10
      this.condition.page = Number(this.$route.query.page) | 0
      if (this.condition.page <= 0) this.condition.page = 1
      await this.getRoles()
    } catch (e) {
      this.$message.error(this.$t('FailedLoadData') as string)
    }
    this.loading = false
  }

  async getRoles() {
    try {
      const roles = await this.$http.get('/api/v2/permission/getRolePermissions', { params: this.condition })
      const rolesList = roles.data.items
      const defaultRoles: any = this.$t('defaultRoles')
      for (let i = 0; i < rolesList.length; i++) {
        if (rolesList[i].id in defaultRoles) {
          rolesList[i].name = defaultRoles[rolesList[i].id]
        }
        const permissionForAA: string[] = []
        this.modulesForAA.forEach((module: any) => {
          const permission = rolesList[i].permissions?.module.find((item: any) => item.resId === module.id)
          if (permission.permission === 1) {
            permissionForAA.push(module.name)
          }
        })
        rolesList[i].permissions.permissionForAA = permissionForAA.length
          ? permissionForAA.join(this.$t('comma') as any)
          : (this.$t('permissions') as any)[0]
      }
      this.rolesWithoutEditing = rolesList

      this.total = roles.data.total
      this.condition.total = roles.data.total
      this.roleList = this.rolesWithoutEditing.map((role: any) => Object.assign({}, role, { editing: false }))
      this.modulePermissions = ModulePermissions
    } catch (e) {
      console.info(e)
      this.$message.error(this.$t('FailedGetMembers') as string)
    }
  }

  async addRole() {
    this.roleList = this.rolesWithoutEditing.map((role: any) => Object.assign({}, role, { editing: false }))
    this.projectList = [0]
    this.roleList.unshift({ roleName: '', permissions: {}, editing: true })
    this.addingState = true
    this.roleName = ''
    this.modulePermissions = ModulePermissions

    Vue.nextTick(() => {
      ;(this.$refs.role as any).$el.children[0].focus()
    })
  }

  async createNewRole() {
    if (!this.roleName) {
      this.$message.warning(this.$t('RoleNameEmpty') as string)
      return
    }
    try {
      this.loading = true
      const projectListPermission = this.setUpProjectPermission()
      this.setAAPermission()
      await this.$http.post('/api/v2/permission/createRole', {
        name: this.roleName,
        permissions: Object.values(this.modulePermissions),
        projects: projectListPermission,
      })
      await this.getRoles()
      this.addingState = false
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 9001) {
        this.$message.warning(this.$t('RoleNameExist') as string)
      } else if (errorCode === 9003) {
        this.$message.warning(this.$t('RoleNameEmpty') as string)
      } else {
        this.$message.error(this.$t('FailedCreateRole') as string)
      }
    }
    this.loading = false
  }

  async onAddSave(row: any) {
    if (this.addingState) {
      this.createNewRole()
    } else {
      this.updateExistingRole(row.id)
    }
    this.roleName = ''
    this.projectList = []
  }

  onAddCancel(row: any) {
    this.roleName = ''
    if (this.addingState) {
      this.roleList.shift()
      this.addingState = false
      return
    }
    this.modulePermissions = ModulePermissions
    row.editing = false
  }

  selectChange(val: any) {
    if (Object.values(val).includes(0) && val[val.length - 1] === 0) {
      this.projectList = [0]
    } else if (Object.values(val).includes(0)) {
      this.projectList = this.projectList.filter((x: any) => x !== 0)
    }
  }
  selectPermission(command: any, index: any) {
    this.modulePermissions[index].permission = command
  }

  async updateExistingRole(roldId: any) {
    if (!this.roleName) {
      this.$message.warning(this.$t('RoleNameEmpty') as string)
      return
    }
    this.loading = true
    try {
      const projectListPermission = this.setUpProjectPermission()
      this.setAAPermission()
      await this.$http.put('/api/v2/permission/updateRole', {
        name: this.roleName,
        roleId: roldId,
        permissions: Object.values(this.modulePermissions),
        projects: projectListPermission,
      })
      await this.getRoles()
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 9001) {
        this.$message.warning(this.$t('RoleNameExist') as string)
      } else if (errorCode === 9003) {
        this.$message.warning(this.$t('RoleNameEmpty') as string)
      } else {
        this.$message.error(this.$t('FailedUpdateRole') as string)
      }
    }
    this.loading = false
  }

  editRow(index: number, row: any) {
    if (this.addingState) {
      this.roleList.shift()
      index = index - 1
      this.addingState = false
    }
    this.modulesForAAList = []
    this.roleList = this.rolesWithoutEditing.map((member: any) => Object.assign({}, member, { editing: false }))
    this.roleList[index].editing = true
    this.roleName = row.name
    for (const modulePermission of this.roleList[index].permissions.module) {
      if (this.modulePermissions[modulePermission.resId]) {
        this.modulePermissions[modulePermission.resId].permission = modulePermission.permission
      }
      if (
        this.modulesForAA.some(
          (module: any) => module.id === modulePermission.resId && modulePermission.permission === 1
        )
      ) {
        this.modulesForAAList.push(modulePermission.resId)
      }
    }
    if (
      this.roleList[index].permissions.project &&
      this.roleList[index].permissions.project.length === 1 &&
      this.roleList[index].permissions.project[0].resId === '0'
    ) {
      this.projectList = [0]
    } else {
      this.projectList = this.roleList[index].permissions.project
        ? this.roleList[index].permissions.project.map((p: any) => p.resId)
        : []
    }
  }
  deleteRow(index: number, row: any) {
    this.showDeleteConfirmation = true
    this.addingState = false
    this.currentRoleId = row.id
  }

  async confirmDelete() {
    this.loading = true
    this.showDeleteConfirmation = false
    try {
      await this.$http.delete('/api/v2/permission/deleteRole', { params: { roleId: this.currentRoleId } })
      this.$message({
        message: this.$t('SuccessDeleteRole') as string,
        type: 'success',
      })
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 7016) {
        this.$message.warning(this.$t('RoleLinkedMember') as string)
      } else {
        this.$message.error(this.$t('FailedDeleteRole') as string)
      }
    }
    await this.getRoles()
    this.loading = false
  }

  cancelDelete() {
    this.showDeleteConfirmation = false
  }

  setUpProjectPermission() {
    let projectListPermission = []
    if (this.projectList.includes(0)) {
      projectListPermission = [{ resId: '0' }]
    } else {
      projectListPermission = this.projectList.map((project: any) => {
        return { resId: project }
      })
    }
    return projectListPermission
  }

  setAAPermission() {
    this.modulesForAA.forEach((module: any) => {
      this.modulePermissions[module.id].permission = 0
    })
    this.modulesForAAList.forEach((resId: string) => {
      this.modulePermissions[resId].permission = 1
    })
  }

  async changePage() {
    this.loading = true
    this.addingState = false
    const condition = Object.assign({}, this.condition)
    this.$router.push({ query: condition as any })
    await this.getRoles()
    this.loading = false
  }
}
