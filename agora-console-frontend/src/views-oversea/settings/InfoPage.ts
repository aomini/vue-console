import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import { Prop } from 'vue-property-decorator'
import './Setting.less'
import { validateCompanyName } from '@/utils/utility'
const iconCheck = require('@/assets/icon/icon-check.png')

@Component({
  template: `
    <div class="page company-info" v-loading="loading">
      <div class="module-title">{{ $t('CompanyInformation') }}</div>
      <div class="card mb-3" style="padding: 10px 20px">
        <el-row type="flex" justify="space-between" align="middle" style="min-height: 40px">
          <div>
            <span class="heading-grey-03 info-label">{{ $t('CompanyID') }}</span>
            {{ userInfo.companyId }}
          </div>
          <div v-if="companyAuth && userInfo.company.area === 'CN'">
            <img :src="iconCheck" width="17" height="17" class="icon-check" />
            <span class="authenticated-text"> {{ $t('Authenticated') }}</span>
          </div>
          <div v-else-if="!companyAuth && userInfo.company.area === 'CN'">
            <span class="heading-light-03">{{ $t('Unauthenticated') }}</span>
            <span class="mx-20" style="color: #E3E3EC"> | </span>
            <el-button type="text" @click="goToAuthenticate">{{ $t('Authenticate') }}</el-button>
          </div>
        </el-row>
        <el-row type="flex" justify="space-between" align="middle" style="border-top: 1px solid #E3E3EC">
          <div class="flex-row">
            <span class="heading-grey-03 info-label">{{ $t('CompanyNameLabel') }}</span>
            <el-input size="mini" v-model="companyName" class="my-10 w-200" v-if="editMode"></el-input>
            <span v-else>{{ userInfo.company.name }}</span>
          </div>
          <el-button type="text" @click="editCompanyName" v-if="!editMode && editable">{{ $t('Edit') }}</el-button>
          <el-tooltip :content="$t('CompanyNameEditHint')" placement="top" effect="light" v-if="!editable && !editMode">
            <el-button type="text" style="color: #8a8a9a">{{ $t('Edit') }}</el-button>
          </el-tooltip>
        </el-row>
        <el-row>
          <console-button
            type="primary"
            @click="saveCompanyName"
            v-if="editMode"
            :disabled="disableSaveBtn"
            style="margin-left: 104px"
            >{{ $t('Save') }}</console-button
          >
        </el-row>
      </div>
    </div>
  `,
})
export default class InfoPage extends Vue {
  @Prop({ default: '', type: String }) readonly userVerify!: string
  userInfo: any = { company: {} }
  source = null
  loading = false
  email = ''
  companyName = ''
  disableSaveBtn = false
  identity: any = false
  personAuth = false
  companyAuth = false
  editMode = false
  editable = true
  iconCheck = iconCheck
  async created() {
    this.loading = true
    await this.initUserInfo()
    await this.getIdentity()
    this.loading = false
  }

  goToAuthenticate() {
    this.$router.push({ name: 'setting.authentication' })
  }

  async initUserInfo() {
    this.userInfo = user.info
    if (this.userInfo.isMember) {
      this.$router.push({ name: 'setting.security' })
    }
    this.companyName = this.userInfo.company.name
    this.email = this.userInfo.email
    this.source = this.userInfo.company.source
  }
  async getIdentity() {
    try {
      const identity = await this.$http.get('/api/v2/identity/info', { params: { companyId: user.info.companyId } })
      if (identity.data) {
        this.identity = identity.data
      }
      if (this.identity && this.identity.identity.identityType === 0 && this.identity.identity.status !== 2) {
        if (this.identity.identity.name) {
          this.companyAuth = true
          this.editable = !(this.userInfo.company.area === 'CN' && this.companyAuth)
        }
      }
      if (this.identity && this.identity.identity.identityType === 1 && this.identity.identity.status !== 2) {
        if (this.identity.identity.name) {
          this.personAuth = true
        }
      }
    } catch (e) {
      console.info(e)
    }
  }

  editCompanyName() {
    this.editMode = true
  }
  async saveCompanyName() {
    this.editMode = false
    this.companyName = this.companyName.trim()
    if (!this.companyName) {
      this.$message.error(this.$t('InfoIncomplete') as string)
      return
    }
    if (!validateCompanyName(this.companyName)) {
      this.$message.error(this.$t('EnterpriseNameWarn') as string)
      return
    }
    this.disableSaveBtn = true
    const params: any = {
      companyName: this.companyName,
    }
    if (this.userInfo.email !== this.email) {
      params.email = this.email
    }
    try {
      await this.$http.put('/api/v2/account/info', params)
      this.$message({
        message: this.$t('SavedSuccess') as string,
        type: 'success',
      })

      // refresh to update the name shown up in the rest of the page
      // setTimeout(() => {
      //   this.$router.go(0)
      // }, 1000)
      this.userInfo.company.name = params.companyName
      this.disableSaveBtn = false
    } catch (e) {
      this.$message.error(this.$t('SavedFail') as string)
    }
  }
}
