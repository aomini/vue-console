import Component from 'vue-class-component'
import Vue from 'vue'
import {
  getSAMLData,
  getSCIMBasicAuthData,
  removeSAMLData,
  renewSCIMBasicAuthData,
  updateSAMLData,
} from '@/services/ssoOkta'
import PasswordInput from '@/components/PasswordInput'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: ` <div class="page" v-loading="loading">
    <div class="module-title">{{ $t('SSOManagement') }}</div>

    <div class="card mb-3" style="padding: 10px 20px">
      <div class="security-card-title" style="margin: 20px 10px;">
        <span style="font-size: 14px; margin-right: 20px;">{{ $t('SCIM API BasicAuth') }}</span>
        <a href="" target="_blank">{{ $t('How to config') }}</a>
      </div>
      <el-form size="small" label-width="180px" :model="scimForm" ref="scimForm" :rules="scimFormRules">
        <el-form-item :label="$t('Enable')" prop="enable">
          <el-switch @change="() => updateScimData(false)" v-model="scimForm.enable"></el-switch>
        </el-form-item>
        <el-form-item v-if="showScimForm" label="Username" prop="username">
          <el-input v-model="scimForm.username" style="max-width: 400px;" class="password-input" disabled>
            <div v-clipboard:copy="scimForm.username" slot="suffix">
              <span @click="copied" class="iconfont iconicon-copy password-img"></span>
            </div>
          </el-input>
        </el-form-item>
        <el-form-item v-if="showScimForm" label="Password" prop="password">
          <password-input
            :passwordValue="scimForm.password"
            :isDisabled="true"
            style="max-width: 400px;"
          ></password-input>
        </el-form-item>
        <el-form-item v-if="showScimForm">
          <el-button @click="() => updateScimData(true)" type="primary">{{ $t('reset password') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card mb-3" style="padding: 10px 20px">
      <div class="security-card-title" style="margin: 20px 10px;">
        <span style="font-size: 14px; margin-right: 20px;">{{ $t('SAML Configuration') }}</span>
        <a
          href="https://docs-preprod.agora.io/en/Agora%20Platform/sign_in_okta?platform=All%20Platforms"
          target="_blank"
          >{{ $t('How to config') }}</a
        >
      </div>

      <el-form size="small" label-width="180px" :model="samlForm" ref="samlForm" :rules="samlFormRules">
        <el-form-item :label="$t('Enable')" prop="enable">
          <el-switch @change="removeSAMLData" v-model="samlForm.enable"></el-switch>
        </el-form-item>
        <div v-if="showSamlForm">
          <!--
          <el-form-item :label="$t('Identity Provider Name')" prop="name">
            <el-input v-model="samlForm.name" style="max-width: 400px;" disabled>
              <div v-clipboard:copy="samlForm.name" slot="suffix">
                <span @click="copied" class="iconfont iconicon-copy password-img"></span>
              </div>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('Identity Provider ID')" prop="idpId">
            <el-input v-model="samlForm.idpId" style="max-width: 400px;" disabled>
              <div v-clipboard:copy="samlForm.idpId" slot="suffix">
                <span @click="copied" class="iconfont iconicon-copy password-img"></span>
              </div>
            </el-input>
          </el-form-item>
          -->
          <el-form-item :label="$t('SSO URL')" prop="audienceUri">
            <el-input v-model="samlForm.ssoUrl" style="max-width: 400px;" disabled>
              <div v-clipboard:copy="samlForm.ssoUrl" slot="suffix">
                <span @click="copied" class="iconfont iconicon-copy password-img"></span>
              </div>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('Audience URI')" prop="audienceUri">
            <el-input v-model="samlForm.audienceUri" style="max-width: 400px;" disabled>
              <div v-clipboard:copy="samlForm.audienceUri" slot="suffix">
                <span @click="copied" class="iconfont iconicon-copy password-img"></span>
              </div>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('Identity Provider SSO URL')" prop="idpLoginUrl">
            <el-input v-model="samlForm.idpLoginUrl" style="max-width: 400px;"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Identity Provider Issuer')" prop="idpEntityId">
            <el-input v-model="samlForm.idpEntityId" style="max-width: 400px;"></el-input>
          </el-form-item>
          <el-form-item :label="$t('X.509 Certificate')" prop="certificateStr">
            <el-input v-model="samlForm.certificateStr" style="max-width: 400px;" type="textarea" :rows="10"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="saveSamlData" type="primary">{{ $t('Save') }}</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>`,
})
export default class SsoManagement extends Vue {
  loading = false
  showScimForm = false
  showSamlForm = false
  scimForm = {
    enable: false,
    username: '',
    password: '',
  }
  samlForm = {
    enable: false,
    idpId: '',
    name: '',
    ssoUrl: '',
    audienceUri: '',
    idpLoginUrl: '',
    idpEntityId: '',
    certificateStr: '',
  }

  requiredRule = { required: true, message: this.$t('This field is required'), trigger: 'change' }
  scimFormRules = {}
  samlFormRules = {
    idpLoginUrl: [this.requiredRule],
    idpEntityId: [this.requiredRule],
    certificateStr: [this.requiredRule],
  }

  async mounted() {
    this.loading = true
    await Promise.all([this.fetchScimData(), this.fetchSamlData()])
    this.loading = false
  }

  async fetchScimData() {
    try {
      const { code, data, msg } = await getSCIMBasicAuthData()
      if (code) {
        return this.$message.error(msg)
      }
      this.fillScimForm(data)
    } catch (e) {
      this.$message.error('Fetch data failed, please refresh again')
    }
  }

  async fetchSamlData() {
    try {
      const { code, data, msg } = await getSAMLData()
      if (code) {
        return this.$message.error(msg)
      }
      this.fillSamlForm(data)
    } catch (e) {
      this.$message.error('Fetch data failed, please refresh again')
    }
  }

  async updateScimData(refresh: Boolean = false) {
    const action = async () => {
      try {
        const { code, data, msg } = await renewSCIMBasicAuthData({
          ...this.getScimFormValue(),
          refresh: refresh,
        })
        if (code) {
          return this.$message.error(msg)
        }
        this.fillScimForm(data)
        this.$message.success(this.$t('Update successfully') as string)
      } catch (e) {
        this.$message.error('Failed to update')
      }
    }
    const actionConfirm = () => {
      this.$confirm(
        this.$t(refresh ? 'ScimResetPasswordConfirm' : 'ScimResetStatus') as string,
        this.$t('prompt') as string,
        {
          confirmButtonText: this.$t('Confirm') as string,
          cancelButtonText: this.$t('Cancel') as string,
          type: 'warning',
        }
      )
        .then(() => {
          action()
        })
        .catch(() => {
          this.scimForm.enable = !this.scimForm.enable
        })
    }
    ;(this.$refs['scimForm'] as any).validate((valid: any) => {
      if (valid) {
        actionConfirm()
      } else {
        return false
      }
    })
  }

  async saveSamlData() {
    const action = async () => {
      try {
        const { code, data, msg } = await updateSAMLData(this.getSamlFormValue())
        if (code) {
          return this.$message.error(msg)
        }
        this.fillSamlForm(data)
        this.$message.success(this.$t('SavedSuccess') as string)
      } catch (e) {
        this.$message.error('Failed to update')
      }
    }
    ;(this.$refs['samlForm'] as any).validate((valid: any) => {
      if (valid) {
        this.$confirm(this.$t('ConfirmSave') as string, this.$t('prompt') as string, {
          confirmButtonText: this.$t('Confirm') as string,
          cancelButtonText: this.$t('Cancel') as string,
          type: 'warning',
        }).then(() => {
          action()
        })
      } else {
        return false
      }
    })
  }

  async removeSAMLData(enable: Boolean = true) {
    if (enable) {
      this.samlForm.enable = true
      this.showSamlForm = this.samlForm.enable
    } else {
      const action = async () => {
        try {
          const { code, data, msg } = await removeSAMLData(this.getSamlFormValue())
          if (code) {
            return this.$message.error(msg)
          }
          this.fillSamlForm(data)
          this.$message.success(this.$t('Update successfully') as string)
        } catch (e) {
          this.$message.error('Failed to update')
        }
      }
      this.$confirm(this.$t('ConfirmSave') as string, this.$t('prompt') as string, {
        confirmButtonText: this.$t('Confirm') as string,
        cancelButtonText: this.$t('Cancel') as string,
        type: 'warning',
      })
        .then(() => {
          action()
        })
        .catch(() => {
          this.samlForm.enable = !this.samlForm.enable
        })
    }
  }

  copied() {
    this.$message.success(this.$t('Copied') as string)
  }

  getScimFormValue() {
    return {
      enable: this.scimForm.enable || false,
      username: this.scimForm.username || '',
      password: this.scimForm.password || '',
    }
  }

  getSamlFormValue() {
    return {
      idpId: this.samlForm.idpId || '',
      name: this.samlForm.name || '',
      ssoUrl: this.samlForm.ssoUrl || '',
      audienceUri: this.samlForm.audienceUri || '',
      idpLoginUrl: this.samlForm.idpLoginUrl || '',
      idpEntityId: this.samlForm.idpEntityId || '',
      certificateStr: this.samlForm.certificateStr || '',
    }
  }

  fillScimForm(data: any) {
    if (data) {
      this.scimForm.enable = data.enable || false
      this.scimForm.username = data.username || ''
      this.scimForm.password = data.password || ''
      this.showScimForm = this.scimForm.enable
    }
  }

  fillSamlForm(data: any) {
    if (data) {
      this.samlForm.enable = data.enable || false
      this.samlForm.idpId = data.idpId || ''
      this.samlForm.name = data.name || ''
      this.samlForm.ssoUrl = data.ssoUrl || ''
      this.samlForm.audienceUri = data.audienceUri || ''
      this.samlForm.idpLoginUrl = data.idpLoginUrl || ''
      this.samlForm.idpEntityId = data.idpEntityId || ''
      this.samlForm.certificateStr = data.certificateStr || ''
      this.showSamlForm = this.samlForm.enable
    }
  }
}
