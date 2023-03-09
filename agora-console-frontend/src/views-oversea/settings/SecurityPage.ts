import Vue from 'vue'
import Component from 'vue-class-component'
import './Setting.less'
import moment from 'moment'
import TwoFactorConfirm from '@/components/TwoFactorConfirm'
import { user } from '@/services/user'

@Component({
  components: {
    TwoFactorConfirm: TwoFactorConfirm,
  },
  template: `
    <div class="security-page">
      <div class="module-title">{{ $t('Security') }}</div>

      <div class="card">
        <div class="security-card-title">
          <span> {{ $t('Allow Agora Customer Support to operate Console') }} </span>
        </div>
        <div class="card">
          <div>
            <span> {{ $t('SuperLoginDesc1') }} </span>
            <a :href='$t("SuperLoginDesc4")' target="_blank"> {{ $t('SuperLoginDesc2') }} </a>
            <span> {{ $t('SuperLoginDesc3') }} </span>
          </div>
          <div class="security-form-text">
            <span> {{ $t('SuperLoginDesc5') }} </span>
          </div>
          <div class="security-form-text">
            <span> {{ $t('SuperLoginDesc6') }} </span>
          </div>
        </div>
        <div class="security-form">
          <div class="security-form-item">
            <div
              :class="{ 'security-form-row': true, 'w-300': user.info.locale === 'cn', 'w-400': user.info.locale !== 'cn' }"
            >
              <label class="bold"> {{ $t('Current Status') }} </label>
              <span v-if="allowStatus !== (this.isAllow ? '2' : '1')" class="text-warning">
                {{ $t('SuperLoginHint') }}
              </span>
              <span v-else-if="isAllow"> {{ $t('Allowed', { allowanceHour, allowanceMin, allowanceSecond }) }} </span>
              <span v-else> {{ $t('Not allowed') }} </span>
            </div>
          </div>
          <div class="security-form-item">
            <div
              :class="{ 'security-form-row': true, 'w-300': user.info.locale === 'cn', 'w-400': user.info.locale !== 'cn' }"
            >
              <el-radio v-model="allowStatus" label="1"> {{ $t('Dont allow') }} </el-radio>
            </div>
            <div
              :class="{ 'security-form-row': true, 'w-300': user.info.locale === 'cn', 'w-400': user.info.locale !== 'cn' }"
            >
              <el-radio v-model="allowStatus" label="2"> {{ $t('Allow for the next 24 hours') }}</el-radio>
            </div>
          </div>
        </div>

        <div class="security-button">
          <console-button class="console-btn-primary" @click="updateOperatePermission">
            {{ $t('Confirm') }}
          </console-button>
        </div>
      </div>

      <div class="card">
        <div class="security-card-title">
          <span> {{ $t('2 Factor Authentication') }} </span>
        </div>
        <div class="security-form">
          <div class="security-form-text card">
            <span> {{ $t('2 Factor Authentication Description') }} </span>
          </div>
          <div class="security-form-item">
            <div
              :class="{ 'security-form-row': true, 'w-300': user.info.locale === 'cn', 'w-400': user.info.locale !== 'cn' }"
            >
              <label class="bold"> {{ $t('Current Status') }} </label>
              <span v-if="isAuth !== oldAuth" class="text-warning"> {{ $t('SuperLoginHint2') }} </span>
              <span v-else-if="isAuth === 1"> {{ $t('Need') }} </span>
              <span v-else> {{ $t('NoNeed') }} </span>
            </div>
          </div>
          <div class="security-form-item">
            <div
              :class="{ 'security-form-row': true, 'w-300': user.info.locale === 'cn', 'w-400': user.info.locale !== 'cn' }"
            >
              <el-radio v-model="isAuth" :label="1"> {{ $t('Need') }} </el-radio>
            </div>
            <div
              :class="{ 'security-form-row': true, 'w-300': user.info.locale === 'cn', 'w-400': user.info.locale !== 'cn' }"
            >
              <el-radio v-model="isAuth" :label="2"> {{ $t('NoNeed') }}</el-radio>
            </div>
          </div>
        </div>

        <div class="security-button">
          <console-button class="console-btn-primary" @click="() => showTwoFactorSetUpVerification = true">
            {{ $t('Update') }}
          </console-button>
        </div>
      </div>

      <div class="card" v-if='!user.info.isMember && !user.info.isCocos && user.info.company.resellerId === "0"'>
        <div class="security-card-title">
          <span> {{ $t('Delete account') }} </span>
        </div>
        <div class="card">
          <div class="security-form-text">
            <span> {{ $t('To delete your account, please have the following requirement meet') }} </span>
          </div>
          <div class="security-form-text">
            <span>- {{ $t('Operator is the account creator.') }} </span>
          </div>
          <div class="security-form-text">
            <span>- {{ $t('This is not a reseller account.') }} </span>
          </div>
          <div class="security-form-text">
            <span>- {{ $t('There is no active project in the account. Please ') }} </span>
            <a href="https://console.agora.io/projects" target="_blank"> {{ $t('update all project') }} </a>
            <span>- {{ $t('status as inactive.') }} </span>
          </div>

          <div class="security-form-text">
            <span>- {{ $t('Keep your balance at 0. If you have a positive balance, please apply a withdraw ') }} </span>
            <a href="https://console.agora.io/finance/withdraw" target="_blank"> {{ $t('here') }} </a>
            <span>{{ $t('; else if you have a negative balance, please ') }} </span>
            <a href="https://console.agora.io/finance/" target="_blank"> {{ $t('make payment') }} </a>
            <span>{{ $t('first.') }}</span>
          </div>

          <div class="security-form-text">
            <span>- {{ $t('There is an unpublished bill last month.') }} </span>
          </div>

          <div class="security-form-text">
            <span>
              -
              {{ $t('There is no active package, including minutes package, support package, or extension package.') }}
            </span>
          </div>

          <div class="security-form-text">
            <span>- {{ $t('There is no member. Please') }} </span>
            <a href="https://console.agora.io/member" target="_blank"> {{ $t('delete all members') }} </a>
            <span> {{ $t('deleteMemberEnding') }} </span>
          </div>
        </div>

        <div class="security-button">
          <console-button class="console-btn-danger" @click="deleteConfirm">
            {{ $t('Delete Account') }}
          </console-button>
        </div>
      </div>

      <el-dialog :title='$t("Delete Account")' :visible.sync="deleteReasonDisplay" width="50%">
        <div>
          <div>{{ $t('Please let us know why you need to delete your account.') }}</div>
          <el-input v-model="deleteReason" type="textarea" :max="3000"> </el-input>
        </div>
        <div :style='{ marginTop: "20px" }'>
          <div>{{ $t('Please input your admin email address for this account to continue') }}</div>
          <el-input v-model="mainAccountEmail"></el-input>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deleteReasonDisplay = false">{{ $t('Cancel') }}</el-button>
          <el-button type="primary" @click="openDeleteTwoFactor">{{
            $t('I understand all the risks and want to continue')
          }}</el-button>
        </span>
      </el-dialog>

      <div v-if="showDeleteVerification">
        <two-factor-confirm
          :afterSuccess="() => submitDelete()"
          :afterFail="() => {}"
          :cancelVerification="() => showDeleteVerification = false"
        >
        </two-factor-confirm>
      </div>

      <div v-if="showTwoFactorSetUpVerification">
        <two-factor-confirm
          :afterSuccess="() => updateAuthStatus()"
          :afterFail="() => {}"
          :cancelVerification="() => showTwoFactorSetUpVerification = false"
        >
        </two-factor-confirm>
      </div>
    </div>
  `,
})
export default class SecurityPage extends Vue {
  isAllow = false
  allowanceHour = 0
  allowanceMin = 0
  allowanceSecond = 0
  allowStatus = '2'
  user = user
  expiredTs = 0
  isAuth: 1 | 2 = 2
  oldAuth = 2
  mainAccountEmail = ''
  deleteReason = ''
  deleteReasonDisplay = false
  showDeleteVerification = false
  showTwoFactorSetUpVerification = false

  async created() {
    await this.getOperatePermission()
    await this.getAccountAuth()
  }

  async openDeleteTwoFactor() {
    const checkRes = await this.$http.post(`/api/v2/account/check-creator-email`, {
      creatorEmail: this.mainAccountEmail,
    })
    if (checkRes.data) {
      this.deleteReasonDisplay = false
      this.showDeleteVerification = true
    } else {
      this.$message.warning(this.$t('Please input the correct admin email address') as string)
    }
  }

  submitDelete() {
    this.showDeleteVerification = false
    this.$confirm(
      this.$t(
        'The deletion of an account cannot be undone, and the account/project information cannot be recovered. Please be cautious.'
      ) as string,
      this.$t('Delete account') as string,
      {
        confirmButtonText: this.$t('Submit request') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
      }
    )
      .then(async () => {
        try {
          await this.$http.post('/api/v2/account/submit-delete', { reason: this.deleteReason })
          this.$message.success(this.$t('Submit the request successfully') as string)
        } catch (e) {
          const code = e.response.data.code
          if (code === 17001) {
            this.$message.warning(this.$t('There are currently applications for review.') as string)
          } else if (code === 17003) {
            this.$message.warning(this.$t('You are not the creator of this account.') as string)
          } else if (code === 17004) {
            this.$message.warning(this.$t('This is a reseller account.') as string)
          } else if (code === 17005) {
            this.$message.warning(this.$t('You have active projects.') as string)
          } else if (code === 17006) {
            this.$message.warning(this.$t('Your balance is not 0.') as string)
          } else if (code === 17007) {
            this.$message.warning(this.$t('You have active package(s).') as string)
          } else if (code === 17008) {
            this.$message.warning(this.$t('You have unpublished bill for last month.') as string)
          } else if (code === 17009) {
            this.$message.warning(this.$t('Your account has member(s).') as string)
          } else if (code === 17010) {
            this.$message.warning(this.$t('Your account has usage this month.') as string)
          } else {
            this.$message.warning(this.$t('GerneralError') as string)
          }
        }
      })
      .catch(() => {})
  }
  deleteConfirm() {
    this.$confirm(
      this.$t(
        'Delete account may need internal evaluation, which will take about a week. The deletion of an account cannot be undone, and the account/project information cannot be recovered. Please be cautious.'
      ) as string,
      this.$t('Delete account') as string,
      {
        confirmButtonText: this.$t('Delete') as string,
        cancelButtonText: this.$t('Cancel') as string,
        confirmButtonClass: 'el-button--danger',
        customClass: 'message-box-danger',
        iconClass: 'console-icon-danger',
        type: 'warning',
      }
    )
      .then(async () => {
        await this.$http.post('/api/v2/account/submit-delete-check')
        this.deleteReasonDisplay = true
      })
      .catch((e) => {
        const code = e.response.data.code
        if (code === 17003) {
          this.$message.warning(this.$t('You are not the creator of this account.') as string)
        } else if (code === 17004) {
          this.$message.warning(this.$t('This is a reseller account.') as string)
        } else if (code === 17005) {
          this.$message.warning(this.$t('You have active projects.') as string)
        } else if (code === 17006) {
          this.$message.warning(this.$t('Your balance is not 0.') as string)
        } else if (code === 17007) {
          this.$message.warning(this.$t('You have active package(s).') as string)
        } else if (code === 17008) {
          this.$message.warning(this.$t('You have unpublished bill for last month.') as string)
        } else if (code === 17009) {
          this.$message.warning(this.$t('Your account has member(s).') as string)
        } else {
          this.$message.warning(this.$t('GerneralError') as string)
        }
      })
  }

  async getOperatePermission() {
    try {
      const getOperationAllowance = await this.$http.get('/api/v2/account/console-operation-allowance')
      this.isAllow = !!getOperationAllowance.data
      this.allowStatus = this.isAllow ? '2' : '1'
      if (this.isAllow) {
        this.expiredTs = Number(getOperationAllowance.data.expiredAt) * 1000
        this.allowanceHour = moment(this.expiredTs).diff(moment(), 'hours')
        this.allowanceMin = moment(this.expiredTs - this.allowanceHour * 60 * 60 * 1000).diff(moment(), 'minutes')
        this.allowanceSecond = moment(
          this.expiredTs - this.allowanceHour * 60 * 60 * 1000 - this.allowanceMin * 60 * 1000
        ).diff(moment(), 'second')
        setInterval(async () => {
          const now = moment()
          this.allowanceHour = moment(this.expiredTs).diff(now, 'hours')
          this.allowanceMin = moment(this.expiredTs - this.allowanceHour * 60 * 60 * 1000).diff(now, 'minutes')
          this.allowanceSecond = moment(
            this.expiredTs - this.allowanceHour * 60 * 60 * 1000 - this.allowanceMin * 60 * 1000
          ).diff(now, 'second')
        }, 1000)
      }
    } catch (e) {}
  }
  async updateOperatePermission() {
    try {
      await this.$http.put('/api/v2/account/console-operation-allowance', { status: this.allowStatus })
      this.$message.success(this.$t('Update successfully') as string)
      await this.getOperatePermission()
    } catch (e) {
      this.$message.warning(this.$t('Failed to update') as string)
    }
  }
  async getAccountAuth() {
    const accountAuth = await this.$http.get('/api/v2/account/auth')
    this.isAuth = accountAuth.data.status || 2
    this.oldAuth = accountAuth.data.status || 2
  }
  async updateAuthStatus() {
    this.showTwoFactorSetUpVerification = false
    try {
      await this.$http.put('/api/v2/account/auth', { status: this.isAuth })
      await this.getAccountAuth()
      this.$message.success(this.$t('Update successfully') as string)
    } catch (e) {
      if (e.response.status === 401) return
      this.$message.warning(this.$t('Failed to update') as string)
    }
  }
}
