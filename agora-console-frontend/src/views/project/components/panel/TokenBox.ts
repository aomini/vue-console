import Vue from 'vue'
import Component from 'vue-class-component'
import moment from 'moment'
import { Prop } from 'vue-property-decorator'
import { ProductTokenMetadata, APaaSRole, APaaSRoleOptions } from '@/models/TokenModels'

@Component({
  components: {},
  template: `
    <div class="project-module token-box">
      <div class="project-module__title">
        {{ $t('Temp token generator') }}
        <el-tooltip placement="top" effect="light" class="mr-10 project-tooltip">
          <div slot="content">
            <div>
              {{ $t('TempTokenHint1') }}
              <a :href="$t('TokenServerLink')" target="_blank">{{ $t('TempToken') }}</a>
            </div>
            {{ $t('TempTokenHint2') }}
          </div>
          <i class="el-icon-info project-tooltip"></i>
        </el-tooltip>
      </div>
      <div w:display="flex" v-if="showTokenBtn">
        <div w:m="r-40px" style="width: 50%">
          <el-row type="flex" align="middle">
            <el-col :span="8">
              <span>{{ $t('Select Product') }}</span>
            </el-col>
            <el-col :span="16">
              <el-select v-model="selectedproduct" :placeholder="$t('Product')" size="mini" w:w="full">
                <el-option
                  v-for="item in productOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="!!productTokenList.find(product => item.value == product.product)"
                >
                </el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-if="selectedproduct === 'APaaS'" class="wd-mt-[-10px]">
            <el-col :offset="8" :span="16">
              <div w:bg="yellow-100" w:p="x-12px y-8px" w:text="gray-500">
                {{ $t('APaaSTokenHint') }}
              </div>
            </el-col>
          </el-row>
          <template v-if="selectedproduct === 'RTC'">
            <el-row type="flex" align="middle">
              <el-col :span="8">
                <span class="required">{{ $t('ChannelName') }}</span>
              </el-col>
              <el-col :span="16">
                <el-input
                  :placeholder='$t("channelInputPlaceholder")'
                  size="medium"
                  v-model="tokenFormData.RTC.channelName"
                  :disabled="!!productTokenList.find(product => product.product === 'RTC')"
                >
                </el-input>
              </el-col>
            </el-row>
          </template>
          <template v-if="selectedproduct === 'RTM'">
            <el-row type="flex" align="middle">
              <el-col :span="8">
                <span class="required">{{ $t('UserId') }}</span>
              </el-col>
              <el-col :span="16">
                <el-input
                  :placeholder='$t("userIdPlaceholder")'
                  size="medium"
                  v-model="tokenFormData.RTM.userId"
                  :disabled="!!productTokenList.find(product => product.product === 'RTM')"
                >
                </el-input>
              </el-col>
            </el-row>
          </template>
          <template v-if="selectedproduct === 'APaaS'">
            <el-row type="flex" align="middle">
              <el-col :span="8">
                <span class="required">{{ $t('UserId') }}</span>
              </el-col>
              <el-col :span="16">
                <el-input
                  :placeholder='$t("userIdPlaceholder")'
                  size="medium"
                  v-model="tokenFormData.APaaS.userId"
                  :disabled="!!productTokenList.find(product => product.product === 'APaaS')"
                >
                </el-input>
              </el-col>
            </el-row>
            <el-row type="flex" align="middle">
              <el-col :span="8">
                <span class="required">{{ $t('RoomId') }}</span>
              </el-col>
              <el-col :span="16">
                <el-input
                  :placeholder='$t("roomIdPlaceholder")'
                  size="medium"
                  v-model="tokenFormData.APaaS.roomId"
                  :disabled="!!productTokenList.find(product => product.product === 'APaaS')"
                >
                </el-input>
              </el-col>
            </el-row>
            <el-row type="flex" align="middle">
              <el-col :span="8">
                <span class="required">{{ $t('Role') }}</span>
              </el-col>
              <el-col :span="16">
                <el-select
                  :placeholder='$t("rolePlaceholder")'
                  w:w="full"
                  size="medium"
                  v-model="tokenFormData.APaaS.role"
                  :disabled="!!productTokenList.find(product => product.product === 'APaaS')"
                >
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.label"
                    :label="$t('APaaSRole.' + item.label)"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-col>
            </el-row>
          </template>
          <el-row type="flex" align="middle">
            <el-col :offset="8" :span="2">
              <el-button
                class="generate-btn"
                id="feature-generate-token-click"
                size="medium"
                type="primary"
                @click="onClickGenerate"
                :loading="tokenLoading"
                :disabled="tokenLoading || tokenBtnDisable"
              >
                <span id="feature-generate-token-click">{{ $t('GenerateTempToken') }}</span>
              </el-button>
            </el-col>
          </el-row>
        </div>
        <div v-if="accessToken" v-loading="tokenLoading" w:bg="gray-50" w:border="~ rounded-8px gray-100" w:p="24px">
          <div w:font="bold" w:m="b-16px">Token</div>
          <div class="d-flex token-input" style="position: relative">
            <el-input
              @focus="select"
              type="text"
              w:p="r-35px"
              :readonly="true"
              :disabled="true"
              v-clipboard:copy="accessToken"
              v-model="accessToken"
            >
            </el-input>
            <div v-clipboard:copy="accessToken">
              <span id="feature-token-copy" class="iconfont iconicon-copy password-img" @click="copyToken()"></span>
            </div>
          </div>
          <div w:m="b-24px t-10px" w:text="gray-500" v-if="accessToken">
            {{ $t('expireTime', { date: expiredDate }) }}
          </div>
          <div w:font="bold" w:m="b-16px">{{ $t('ContainTheFollowingProduct') }}</div>
          <div v-for="(item, index) in productTokenList">
            <div w:display="flex" w:justify="between">
              <span
                ><span class="token-box__field-name">{{ $t('ProductName') }}: </span> {{ item.product }}</span
              >
              <span
                class="el-icon-minus"
                w:border="1"
                w:cursor="pointer"
                w:h="full"
                w:font="13px"
                w:text="hover:blue-500"
                @click="removeProduct(index)"
              ></span>
            </div>
            <template v-if="item.product === 'RTC'">
              <p>
                <span class="token-box__field-name">{{ $t('ChannelName') }}: </span>{{ item.fields.channelName }}
              </p>
            </template>
            <template v-if="item.product === 'RTM'">
              <p>
                <span class="token-box__field-name">{{ $t('UserId') }}: </span> {{ item.fields.userId }}
              </p>
            </template>
            <template v-if="item.product === 'APaaS'">
              <p>
                <span class="token-box__field-name">{{ $t('UserId') }}: </span> {{ item.fields.userId }}
              </p>
              <p>
                <span class="token-box__field-name">{{ $t('RoomId') }}: </span> {{ item.fields.roomId }}
              </p>
              <p>
                <span class="token-box__field-name">{{ $t('Role') }}: </span>
                {{ $t('APaaSRole.' + roleEnum[item.fields.role]) }}
              </p>
            </template>
            <p w:border="b-1 solid gray-300" v-if="index < productTokenList.length - 1"></p>
          </div>
        </div>
      </div>
      <div v-else>
        {{ $t('Please enable App Certificate first') }}
      </div>
    </div>
  `,
})
export default class TokenBox extends Vue {
  @Prop({ default: false, type: Boolean }) readonly showTokenBtn?: boolean
  channelName = ''
  channelNameChanged = false
  accessToken: string = ''
  expiredDate: string = ''
  tokenLoading = false
  roleOptions = APaaSRoleOptions
  roleEnum = APaaSRole
  productOptions = [
    { label: 'RTC', value: 'RTC' },
    { label: 'RTM', value: 'RTM' },
    { label: this.$t('FlexibleClassroomAPaaS'), value: 'APaaS' },
  ]
  selectedproduct: 'RTC' | 'RTM' | 'APaaS' = 'RTC'
  productTokenList: ProductTokenMetadata[] = []
  tokenFormData = {
    RTC: {
      channelName: '',
    },
    RTM: {
      userId: '',
    },
    APaaS: {
      userId: '',
      roomId: '',
      role: '',
    },
  }

  get tokenBtnDisable() {
    const tokenData = this.tokenFormData[this.selectedproduct]
    let flag = false
    if (this.productTokenList.find((item) => item.product === this.selectedproduct)) {
      flag = true
    }
    Object.values(tokenData).forEach((item) => {
      if (item === '') {
        flag = true
      }
    })
    return flag
  }

  validateTokenData() {
    const tokenData = this.tokenFormData[this.selectedproduct]
    const pattern = new RegExp('^[A-Za-z0-9!#$%&()+-:;<=.>?@\\[\\]^_{}|~, ]+$')
    let flag = true
    Object.values(tokenData).forEach((item) => {
      if (item === '' || !pattern.test(item)) {
        flag = false
      }
    })
    return flag
  }

  handleConflictProduct() {
    let index = -1
    if (this.selectedproduct === 'RTM') {
      index = this.productTokenList.findIndex((item) => item.product === 'APaaS')
    }
    if (this.selectedproduct === 'APaaS') {
      index = this.productTokenList.findIndex((item) => item.product === 'RTM')
    }
    if (index > -1) {
      this.productTokenList.splice(index, 1)
    }
  }

  async onClickGenerate() {
    if (!this.validateTokenData()) {
      this.$message.warning(this.$t('Invalid parameter') as string)
      return
    }
    this.handleConflictProduct()
    this.productTokenList.push({
      product: this.selectedproduct,
      fields: this.tokenFormData[this.selectedproduct],
    })

    try {
      this.tokenLoading = true
      const token = await this.$http.post('/api/v2/temp-token', {
        id: this.$route.params.id,
        productTokenList: this.productTokenList,
      })
      this.accessToken = token.data?.token
      this.expiredDate = moment.utc(moment.unix(token.data.expiredTs)).format('LLL')
      this.$message.success(this.$t('TokenGenerated') as string)
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
    this.tokenLoading = false
  }

  copyToken() {
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

  removeProduct(index: number) {
    this.productTokenList.splice(index, 1)
  }
}
