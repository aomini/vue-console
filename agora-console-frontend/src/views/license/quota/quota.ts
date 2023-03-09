import Vue from 'vue'
import Component from 'vue-class-component'
import { LicensePidUsage, LicenseProductList, LicenseProductTotalUsage, OrderType } from '@/models/licenseModels'
import QuotaDialog from './quotaDialog'
import './quota.less'

@Component({
  components: {
    QuotaDialog,
  },
  template: `
    <div w:grid="~ cols-1 gap-24px xl:cols-2 3xl:cols-3" class="license-quota-page" v-loading="loading">
      <QuotaDialog :dialogVisible="dialogVisible" :activeProductId="activeProductId" @setVisible="setDialogVisible" @quotaCallback="quotaCallback" />
      <div
        w:border="1 gray-300 rounded-md"
        w:p="x-24px b-24px"
        v-for="item in pidUsageList"
        :key="item.pid"
      >
        <div w:border="b gray-100" w:p="y-16px" w:flex="~">
          <div w:w="64px" w:flex="grow-0 shrink-0" w:text="lg gray-500" w:font="pingfangM">PID</div>
          <div w:text="lg gray-900 truncate" w:font="pingfangM">{{ item.pid }}</div>
        </div>
        <div class="project-form-item">
          <div class="form-label">{{$t('LicenseStatus')}}</div>
          <div v-if="isStandardType(item)" class="project-status" w:bg="green-100" w:text="green-500">{{ $t('Standard') }}</div>
          <div v-else class="project-status" w:bg="orange-100" w:text="orange-500">{{ $t('LicenseTesting') }}</div>
        </div>
        <div class="project-form-item">
          <div class="form-label">{{$t('ValidityPeriod')}}</div>
          <div w:text="base gray-900">{{ item.productSku.duration }} {{ isStandardType(item) ? $t('Year') : $t('Month') }}</div>
        </div>
        <div class="project-form-item">
          <div class="form-label">{{$t('LicenseProduct')}}</div>
          <div w:text="base gray-900">{{ item.product }}</div>
        </div>
        <div class="project-form-item">
          <div class="form-label">{{$t('LicenseQuota')}}</div>
          <div w:flex="~ grow" w:align="items-center">
            <el-progress w:flex="grow" w:p="t-8px" :percentage="getUnAllocateCount(item) / item.count * 100" :show-text="false"></el-progress>
            <div w:m="l-16px" w:text="base gray-900">{{$t('LicenseQuotaAvailable')}}<span w:m="l-4px" w:text="blue-500">{{ getUnAllocateCount(item) }}</span></div>
          </div>
        </div>
        <div w:m="t-16px" w:border="t gray-100" w:p="t-16px" w:flex="~" w:justify="between">
          <div w:text="base gray-900" w:font="pingfangM medium">{{$t('AllLicenseQuota')}} {{ item.count }}</div>
          <div w:text="base blue-500 hover:blue-300" w:cursor="pointer" @click="handleQuotaClick(item)">
            <span w:text="underline">{{$t('GoQuotaManage')}}</span>
            <span class="iconfont iconbangzhuwendang_tiaochu"></span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class Quota extends Vue {
  loading = false
  pidUsageList: LicensePidUsage[] = []
  dialogVisible = false
  activeProductId = ''

  mounted() {
    this.prepareLicenseUsageData()
  }

  async prepareLicenseUsageData() {
    try {
      this.loading = true
      const ret = await this.$http.get('/api/v2/license/usage')
      const pidList = []
      for (const product of LicenseProductList) {
        const item: LicenseProductTotalUsage = ret.data[product]
        pidList.push(...item.pidList.map((x) => ({ ...x, product: item.product })))
      }
      this.pidUsageList = pidList
    } catch (e) {
      this.$message.error(this.$t('GetUsageInfoFailed') as string)
    } finally {
      this.loading = false
    }
  }

  // 实际可用配额 = product的未配额 license - 未配额中已激活的 license
  getUnAllocateCount(pidUsage: LicensePidUsage) {
    return (
      pidUsage.unAllocate -
      pidUsage.vidStocks.filter((x) => !Reflect.has(x, 'projectName')).reduce((sum, item) => sum + item.actives, 0)
    )
  }

  isStandardType(pidUsage: LicensePidUsage) {
    return pidUsage.productSku.type === OrderType.Standard
  }

  handleQuotaClick(pidUsage: LicensePidUsage) {
    this.dialogVisible = true
    this.activeProductId = pidUsage.pid
  }

  setDialogVisible(visible: boolean) {
    this.dialogVisible = visible
  }

  // 配额后更新对应产品卡片的可用配额
  quotaCallback(count: number) {
    const index = this.pidUsageList.findIndex((item) => item.pid === this.activeProductId)
    if (index < 0) return

    this.pidUsageList.splice(index, 1, {
      ...this.pidUsageList[index],
      unAllocate: this.pidUsageList[index].unAllocate - count,
    })
  }
}
