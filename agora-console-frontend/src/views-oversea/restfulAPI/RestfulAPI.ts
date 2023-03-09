import Vue from 'vue'
import Component from 'vue-class-component'
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div v-loading="loading">
      <div class="page">
        <div class="module-title">{{ $t('RestfulAPITitle') }}</div>
        <div class="module-title-tip">
          <div class="d-flex flex-column">
            <label> {{ $t('RestfulApiDesc1') }} </label>
            <label>
              {{ $t('RestfulApiDesc2') }} <a :href='$t("RestfulApi")' target=":blank"> {{ $t('RestfulApiDoc') }} </a>
              {{ $t('FullStop') }}
            </label>
            <label> {{ $t('RestfulApiDesc3') }} </label>
          </div>
        </div>
        <div class="mb-10">
          <console-button style="font-size: 14px" type="primary" :disabled="addingState || disableAdd" @click="addKey">
            {{ $t('AddSecret') }}
          </console-button>
        </div>
        <div class="card">
          <el-table
            :data="restfulKeys"
            stripe
            cell-class-name="text-truncate"
            :empty-text='$t("RestfulApiEmptyText")'
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
                  <a :href="ticketUrl" target="_blank">{{ $t('KeyIsDownloadedDesc2') }}</a>
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
                <div>
                  <img class="table-action-img" @click="deleteRow(scope.$index, scope.row)" :src="IconDelete" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog
          :title='$t("RemoveRestfulKey")'
          :visible.sync="showDeleteConfirmation"
          width="360px"
          :show-close="false"
        >
          <div class="d-flex flex-column">
            <div class="mb-20">{{ $t('RemoveRestfulKeyConfirm') }}</div>
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
          :title='$t("DownloadKeyAndSecret")'
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
export default class RestfulAPI extends Vue {
  restfulKeys = []
  loading = false
  addingState = false
  disableAdd = false
  showDeleteConfirmation = false
  showAddConfirmation = false
  showDownloadConfirmation = false
  deleteKey = ''
  downloadKey = ''
  downloadSecretHref = ''
  keyLimit = 10
  IconDelete = IconDelete
  ticketUrl = this.GlobalConfig.config.ticketUrl

  async created() {
    this.loading = true
    await this.getkeyLimit()
    await this.getkeys()
    this.loading = false
  }

  async addKey() {
    this.loading = true
    if (this.restfulKeys.length >= this.keyLimit) {
      this.$message.error(this.$t('RestfulKeyOutOfLimit') as string)
      return
    }
    await this.createNewKey()
    this.loading = false
  }

  onDownloadSecret(key: string) {
    this.showDownloadConfirmation = true
    this.downloadKey = key
  }

  async deleteRow(index: number, row: any) {
    if (!this.addingState) {
      this.showDeleteConfirmation = true
      this.deleteKey = row.key
    } else {
      this.$message.warning(this.$t('AddRestfulApiKeyIsNotDone') as string)
    }
  }

  async confirmDelete() {
    this.loading = true
    this.showDeleteConfirmation = false
    try {
      await this.$http.delete(`/api/v2/restful-api/keys/${this.deleteKey}`)
      this.$message({
        message: this.$t('SuccessDeleteRestfulKey') as string,
        type: 'success',
      })
    } catch (e) {
      if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ParameterError') as string)
      }
      if (e.response.data.code === 15008) {
        this.$message.error(this.$t('KeepAtLeastOneKey') as string)
      } else {
        this.$message.error(this.$t('FailedDeleteRestfulKey') as string)
      }
    }
    this.restfulKeys = await this.getkeys()
    this.loading = false
  }
  cancelDelete() {
    this.showDeleteConfirmation = false
  }
  async confirmDownload() {
    try {
      const secret = await this.$http.get(`/api/v2/restful-api/keys/download/${this.downloadKey}`)

      this.showDownloadConfirmation = false

      // 更新下载内容
      this.downloadSecretHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
        this.$t('ConfirmDownloadApiKey') + '\r\nkey：' + secret.data.key + '\r\nsecret：' + secret.data.secret
      )}`

      // 更新按钮状态
      this.restfulKeys.map((item: any) => {
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
        this.$message.error(this.$t('FailedDownloadRestfulKey') as string)
      }
    }
  }

  cancelDownload() {
    this.showDownloadConfirmation = false
  }

  async getkeys() {
    try {
      const apiKeys = await this.$http.get(`/api/v2/restful-api/keys/own`)
      const apiKeyList = apiKeys.data
      const apiKeysWithEdit = apiKeyList.map((keys: any) => Object.assign({}, keys, { editing: false }))
      this.restfulKeys = apiKeysWithEdit
      this.disableAdd = this.restfulKeys.length >= this.keyLimit
      return apiKeysWithEdit
    } catch (e) {
      this.$message.error(this.$t('FailedGetRestfulKey') as string)
    }
  }

  async getkeyLimit() {
    try {
      const apiKeyLimit = await this.$http.get(`/api/v2/restful-api/keys-limit`)
      this.keyLimit = apiKeyLimit.data.limit
    } catch (e) {
      this.$message.error(this.$t('FailedGetRestfulKeyLimit') as string)
    }
  }

  async createNewKey() {
    try {
      const createdKeys = await this.$http.post('/api/v2/restful-api/keys')
      if (createdKeys.data) {
        this.$message({
          message: this.$t('SuccessCreateRestfulKey') as string,
          type: 'success',
        })
        await this.getkeys()
        this.addingState = false
      }
    } catch (e) {
      if (e.response.data.code === 6008) {
        this.$message.error(this.$t('ParameterError') as string)
      } else if (e.response.data.code === 15005) {
        this.$message.error(this.$t('RestfulKeyOutOfLimit') as string)
      } else {
        this.$message.error(this.$t('GerneralError') as string)
      }
    }
  }
}
