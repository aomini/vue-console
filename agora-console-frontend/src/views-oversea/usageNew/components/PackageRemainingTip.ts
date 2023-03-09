import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services'
import { Prop } from 'vue-property-decorator'
import { UsagePackageTypeEnum } from '../../../models/usageModel'
const IconQuestion = require('@/assets/icon/icon-question.png')

@Component({
  template: `
    <div>
      <div class="remaining-usage-tip" v-if="remainingUsagePermission">
        <div class="remaining-usage">
          <div class="remaining-usage-btn">
            <el-tooltip :content='$t("packageRemainingTooltip")' placement="top">
              <img width="15" :style='{ marginRight: "5px" }' class="vertical-middle t-1" :src="IconQuestion" alt="" />
            </el-tooltip>
            <span>{{ $t('packageRemaining', { amount: totalRemainingUsage.toLocaleString() }) }} </span>
            <span
              class="heading-dark-13 float-right d-flex align-center hover-link vertical-middle"
              @click="goToPackageManagement"
            >
              <span class="">{{ $t('packageManagement') }}</span>
              <i class="iconfont iconicon-go f-18"></i>
            </span>
          </div>
          <div class="remaining-usage-box border">
            <div class="heading-grey-14 mb-10">{{ $t('remainingMins') }}</div>
            <div class="my-1">
              {{
                $t('audioRemaining', {
                  amount: remainingMinutes['Audio'] ? remainingMinutes['Audio'].toLocaleString() : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('videoHdRemaining', {
                  amount: remainingMinutes['Video(HD)'] ? remainingMinutes['Video(HD)'].toLocaleString() : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('fullHDRemaining', {
                  amount: remainingMinutes['Video Total Duration(Full HD)']
                    ? remainingMinutes['Video Total Duration(Full HD)'].toLocaleString()
                    : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('hd2kRemaining', {
                  amount: remainingMinutes['Video Total Duration(2K)']
                    ? remainingMinutes['Video Total Duration(2K)'].toLocaleString()
                    : 0
                })
              }}
            </div>
            <div class="my-1">
              {{
                $t('hd4kRemaining', {
                  amount: remainingMinutes['Video Total Duration(2K+)']
                    ? remainingMinutes['Video Total Duration(2K+)'].toLocaleString()
                    : 0
                })
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class PackageRemainingTip extends Vue {
  @Prop({ default: '', type: Number }) readonly type!: number
  user = user
  remainingMinutes: any = {}
  totalRemainingUsage: any = 0
  IconQuestion = IconQuestion

  get remainingUsagePermission() {
    return this.user.info.company.area === 'CN' && this.user.info.permissions['FinanceCenter'] > 0
  }

  created() {
    this.create()
  }

  goToPackageManagement() {
    this.$router.push({ name: 'package.myMinPackage' })
  }

  async create() {
    try {
      let getRemainingMinutes
      if (UsagePackageTypeEnum[this.type] === 'RTC') {
        getRemainingMinutes = await this.$http.get(`/api/v2/usage/rtc-remaining`)
      } else if (UsagePackageTypeEnum[this.type] === 'CloudRecording') {
        getRemainingMinutes = await this.$http.get(`/api/v2/usage/cloud-recording-remaining`)
      }
      this.remainingMinutes = getRemainingMinutes?.data
      this.totalRemainingUsage = (Object.values(this.remainingMinutes) as any).reduce(
        (x: number, y: number) => x + y,
        0
      )
    } catch (e) {}
  }
}
