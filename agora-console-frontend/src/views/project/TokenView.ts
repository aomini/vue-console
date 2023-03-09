import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { getProjectInfo } from '@/services'
import './Project.less'
import PasswordInput from '@/components/PasswordInput'
import { TokenType } from '@/models/TokenModels'

@Component({
  components: {
    'password-input': PasswordInput,
  },
  template: `
    <div class="page-v3">
      <div class="module-title">{{ $t('Token') }}</div>
      <div class="card">
        <div class="module-item-title">
          {{ $t('TempTokenHint') }}<a :href="$t('TempTokenHintLink')" target="_blank">{{ $t('HintText') }}</a>
        </div>
        <div v-loading="loading" class="mt-20">
          <div class="w-400 m-auto">
            <div class="detail-row">
              <div class="token-row-title">{{ $t('App ID') }}:</div>
              <div class="token-row-content">
                {{ key }}
              </div>
            </div>

            <div class="detail-row">
              <div class="token-row-title">{{ $t('APPCertificate') }}:</div>
              <div>
                <password-input
                  class="w-280"
                  :passwordValue="this.signkey"
                  size="medium"
                  :isDisabled="true"
                ></password-input>
              </div>
            </div>

            <div class="detail-row">
              <div class="token-row-title">{{ $t('ChannelName') }}:</div>
              <el-input
                class="w-280"
                :maxlength="64"
                :placeholder='$t("channelInputPlaceholder")'
                size="medium"
                v-model="channelName"
              >
              </el-input>
            </div>

            <div class="detail-row">
              <div class="token-row-title">{{ $t('TempToken') }}:</div>
              <div v-if="!accessToken">
                <console-button class="console-btn-primary" @click="onClickGenerate">
                  {{ $t('Generate') }}
                </console-button>
                <console-button class="console-btn-white" @click="onClickBack">
                  {{ $t('Back') }}
                </console-button>
              </div>
              <div class="d-flex flex-column" v-else>
                <el-input
                  class="w-280"
                  @focus="select"
                  type="textarea"
                  :readonly="true"
                  v-clipboard:copy="accessToken"
                  v-model="accessToken"
                >
                </el-input>
                <div class="mb-10 mt-10">{{ $t('expireTime', { date: expiredDate }) }}</div>
                <div>
                  <console-button class="console-btn-primary" @click="onClickCopy" v-clipboard:copy="accessToken">
                    {{ $t('Copy') }}
                  </console-button>
                  <console-button class="console-btn-white" @click="onClickBack">
                    {{ $t('Back') }}
                  </console-button>
                </div>
              </div>
            </div>

            <div class="detail-row justify-center">
              <a :href='$t("tokenDocLink")' target="_blank" class="ml-300"> {{ $t('tokenDocLinkDesc') }} </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class TokenView extends Vue {
  key: string = ''
  signkey: string = ''
  loading: boolean = false
  channelName: string = ''
  accessToken: string = ''
  expiredDate: string = ''

  async mounted() {
    const projectId = this.$route.params.id
    const project = await getProjectInfo(projectId)
    this.key = project.info.key
    this.signkey = project.info.signkey
  }

  async onClickGenerate() {
    if (!this.channelName) {
      this.$message.warning(this.$t('EmptyChannel') as string)
      return
    }
    const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$')
    if (!pattern.test(this.channelName)) {
      this.$message.warning(this.$t('InvalidChannel') as string)
      return
    }
    try {
      const token = await this.$http.get('/api/v2/token', {
        params: { id: this.$route.params.id, channel: this.channelName, type: TokenType.TempToken },
      })
      this.accessToken = token.data?.token
      this.expiredDate = moment.utc(moment.unix(token.data.expiredTs)).format('LLL')
    } catch (e) {
      const errorCode = e.response.data.code
      if (errorCode === 6014) {
        this.$message.warning(this.$t('EmptyChannel') as string)
      } else if (errorCode === 6015) {
        this.$message.warning(this.$t('InvalidChannel') as string)
      } else {
        this.$message.error(this.$t('FailedGetToken') as string)
      }
    }
  }

  onClickCopy() {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
  }

  select(event: any) {
    this.$message({
      message: this.$t('Copied') as string,
      type: 'success',
    })
    event.currentTarget.select()
  }

  onClickBack() {
    this.$router.go(-1)
  }
}
