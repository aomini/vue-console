import Vue from 'vue'
import Component from 'vue-class-component'
import { uuid } from 'uuidv4'
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div v-loading="loading">
      <div class="page">
        <div class="module-title">{{ $t('credentials_title') }}</div>
        <div class="module-title-tip">
          <div class="d-flex flex-column">
            <label> {{ $t('credentials_desc1') }} </label>
            <label>
              {{ $t('credentials_desc2') }}
              <a :href='$t("credentials_help_url")' target=":blank"> {{ $t('credentials_doc') }} </a>
              {{ $t('FullStop') }}
            </label>
            <label> {{ $t('credentials_desc3') }} </label>
          </div>
        </div>
        <div class="mb-10">
          <console-button style="font-size: 14px" type="primary" :disabled="addingState || disableAdd" @click="addKey">
            {{ $t('AddSecret') }}
          </console-button>
        </div>
        <div class="card">
          <el-table
            :data="credentials"
            stripe
            cell-class-name="text-truncate"
            :empty-text='$t("credentials_empty")'
            :row-style='{ height: "50px" }'
          >
            <el-table-column
              prop="key"
              :label='$t("CustomerID")'
              label-class-name="table-header"
              class-name="table-content"
            >
              <template slot-scope="scope">
                {{ scope.row.key }}
              </template>
            </el-table-column>
            <el-table-column
              prop="secretPassword"
              :label='$t("CustomerCertificate")'
              label-class-name="table-header"
              class-name="table-content"
              align="center"
            >
              <template slot-scope="scope">
                <div v-if="scope.row.editing">****************</div>
                <div v-else-if="scope.row.downloaded">
                  {{ $t('KeyIsDownloadedDesc1') }}
                  <a :href='$t("credentials_help_url")' target="_blank">{{ $t('KeyIsDownloadedDesc2') }}</a>
                  {{ $t('KeyIsDownloadedDesc3') }}
                </div>
                <div v-else>
                  <el-button type="text" class="button button-mid" @click="onDownloadSecret(scope.row.key)">
                    {{ $t('Download') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="action"
              :label='$t("Action")'
              width="300px"
              label-class-name="table-header"
              class-name="table-content"
              align="right"
            >
              <template slot-scope="scope">
                <div v-if="scope.row.editing">
                  <console-button type="primary" @click="onAddSave(scope.row)"> {{ $t('OK') }}</console-button>
                  <console-button type="default" @click="onAddCancel(scope.row)">
                    {{ $t('Cancel') }}
                  </console-button>
                </div>
                <div v-else>
                  <img class="table-action-img" @click="deleteRow(scope.$index, scope.row)" :src="deleteIcon" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog
          :title='$t("credentials_remove_title")'
          :visible.sync="showDeleteConfirmation"
          width="360px"
          :show-close="false"
        >
          <div class="d-flex flex-column">
            <div class="mb-20">{{ $t('credentials_remove_confirm') }}</div>
            <div class="ml-auto text-right">
              <console-button @click="cancelDelete">
                {{ $t('Cancel') }}
              </console-button>
              <console-button type="danger" @click="confirmDelete">
                {{ $t('Delete') }}
              </console-button>
            </div>
          </div>
        </el-dialog>

        <el-dialog
          :title='$t("credentials_download")'
          :visible.sync="showDownloadConfirmation"
          width="360px"
          :show-close="false"
        >
          <div class="d-flex flex-column">
            <div class="mb-20">{{ $t('ConfirmDownloadApiKey') }}</div>
            <div class="ml-auto text-right">
              <console-button @click="cancelDownload">
                {{ $t('Cancel') }}
              </console-button>
              <console-button type="primary" @click="confirmDownload">
                {{ $t('Download') }}
              </console-button>
            </div>
          </div>
        </el-dialog>

        <a id="downloadSecret" :href="downloadSecretHref" download="key_and_secret.txt"></a>
      </div>
    </div>
  `,
})
export default class Credentials extends Vue {
  loading = false
  credentials: any = []

  addingState = false
  disableAdd = false
  showDeleteConfirmation = false
  showAddConfirmation = false
  showDownloadConfirmation = false
  deleteKey = ''
  downloadKey = ''
  downloadSecretHref = ''
  keyLimit = 10
  deleteIcon = IconDelete

  async addKey() {
    const key = uuid().replace(/-/g, '')
    const secret = uuid().replace(/-/g, '')
    this.addingState = true
    this.credentials.unshift({ key, secret, editing: true })
  }
  async onAddSave(row: any) {
    this.loading = true
    if (this.addingState) {
      await this.createNewKey(row)
    }
    this.loading = false
  }
  onDownloadSecret(key: any) {
    this.showDownloadConfirmation = true
    this.downloadKey = key
  }
  async onAddCancel(row: any) {
    if (this.addingState) {
      this.credentials.shift()
      this.addingState = false
      return
    }
    row.editing = false
  }
  async deleteRow(index: number, row: any) {
    if (!this.addingState) {
      this.showDeleteConfirmation = true
      this.deleteKey = row.key
    } else {
      this.$message.warning(this.$t('credentials_key_not_exist') as string)
    }
  }
  async confirmDelete() {
    this.loading = true
    this.showDeleteConfirmation = false
    try {
      await this.$http.delete(`/api/v2/credential/${this.deleteKey}`)
      this.$message({
        message: this.$t('delete_success') as string,
        type: 'success',
      })
    } catch (e) {
      if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ParameterError') as string)
      }
      if (e.response.data.code === 15008) {
        this.$message.error(this.$t('KeepAtLeastOneKey') as string)
      } else {
        this.$message.error(this.$t('delete_failed') as string)
      }
    }
    this.credentials = await this.getCredentials()
    this.loading = false
  }
  cancelDelete() {
    this.showDeleteConfirmation = false
  }
  async confirmDownload() {
    try {
      const secret = await this.$http.get(`/api/v2/credential/${this.downloadKey}/download`)

      this.showDownloadConfirmation = false

      // 更新下载内容
      this.downloadSecretHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
        this.$t('credentials_key_download_and_save') +
          '\r\nkey：' +
          secret.data.key +
          '\r\nsecret：' +
          secret.data.secret
      )}`

      // 更新按钮状态
      this.credentials.map((item: any) => {
        if (item.key === secret.data.key) {
          item.downloaded = 1
        }
        return item
      })

      this.$nextTick(() => {
        // 下载密钥
        ;(document.getElementById('downloadSecret') as any).click()
        // 清空下载内容
        this.downloadSecretHref = ''
      })
    } catch (e) {
      if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ParameterError') as string)
      } else if (e.response.data.code === 15007) {
        this.$message.error(this.$t('AlreadyDownloaded') as string)
      } else {
        this.$message.error(this.$t('download_failed') as string)
      }
    }
  }
  cancelDownload() {
    this.showDownloadConfirmation = false
  }
  async getCredentials() {
    try {
      const response = await this.$http.get(`/api/v2/credentials`)
      const credentials = response.data
      const credentialsWithEdit = credentials.map((item: any) => {
        return {
          ...item,
          editing: false,
          key: item.name,
        }
      })
      this.credentials = credentialsWithEdit
      this.disableAdd = this.credentials.length >= this.keyLimit
      return credentialsWithEdit
    } catch (e) {
      this.$message.error(this.$t('credentials_failed_get_key') as string)
    }
  }
  async getCredentialsLimit() {
    try {
      /**
       * 此处的最大限度与 restfulApi 用的是同一个配置
       */
      const apiKeyLimit = await this.$http.get(`/api/v2/restful-api/keys-limit`)
      this.keyLimit = apiKeyLimit.data.limit
    } catch (e) {
      this.$message.error(this.$t('credentials_failed_get_key_limit') as string)
    }
  }
  async createNewKey(row: any) {
    try {
      const createdKeys = await this.$http.post('/api/v2/credential', { key: row.key })
      if (createdKeys.data) {
        this.$message({
          message: this.$t('create_success') as string,
          type: 'success',
        })
        await this.getCredentials()
        this.addingState = false
      }
    } catch (e) {
      if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ParameterError') as string)
      } else if (e.response.data.code === 15005) {
        this.$message.error(this.$t('credentials_out_of_limit') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
    }
  }

  async created() {
    this.loading = true
    await this.getCredentialsLimit()
    await this.getCredentials()
    this.loading = false
  }
}
