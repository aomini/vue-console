import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `
    <el-dialog :title='$t("Enable Cloud Proxy Title")' :visible="true" :before-close="cancelEnable">
      <div v-if="$i18n.locale === 'cn'">
        <div class="heading-grey-13 mb-10 lh-18">
          1. 为了云代理强制UDP和强制TCP模式生效，您的最终用户必须首先配置他们的企业防火墙，以信任
          <a :href="$t('Agora Allowed IP List URL')" target="_blank">声网IP白名单</a
          >。中的IP地址和端口范围。请注意，这些云代理模式需要额外收费，<strong class="error"
            >其中500美金作为开通费</strong
          >。有关价格和信息，请访问我们的
          <a href="https://docs.agora.io/en/Interactive%20Broadcast/cloudproxy_native?platform=Android" target="_blank"
            >云代理文档。</a
          >
        </div>
        <div class="heading-grey-13 lh-18 mb-10">
          2.
          在大多数情况下，来自你的最终用户的大约5%-10%的音频和视频流量将需要云代理。只要你估计的云代理峰值并发用户数(PCU)为200
          或更少，你可以通过这个过程启用云代理强制UDP和TCP模式。
        </div>
        <div class="heading-grey-13 lh-18">
          如果您需要更大的云代理PCU，请联系
          <a href="https://agora-ticket.agora.io" target="_blank">声网客户支持</a>，
          讨论您的容量要求并了解我们的定价方案。
        </div>
      </div>
      <div v-else>
        <div class="heading-grey-13 mb-10 lh-18">
          1. For the Cloud Proxy Force UDP and Force TCP modes to work properly, your end users must first configure
          their enterprise firewalls to trust the IP address and port ranges in the
          <a :href="$t('Agora Allowed IP List URL')" target="_blank">Agora Allowed IP List</a>. Note that there is an
          additional charge for these Cloud Proxy modes, <strong class="error">starting from $500 per month</strong>.
          For pricing and information, please access our
          <a href="https://docs.agora.io/en/Interactive%20Broadcast/cloudproxy_native?platform=Android" target="_blank"
            >Cloud Proxy Documentation.</a
          >
        </div>
        <div class="heading-grey-13 lh-18 mb-10">
          2. In most cases, about 5%-10% of the audio and video traffic from your end users will require Cloud Proxy.
          Provided that your estimated Cloud Proxy Peak Concurrent Users(PCU) is 200 or less, you can enable the Cloud
          Proxy Force UDP and TCP modes with this process, which takes effect within 24 hours.
        </div>
        <div class="heading-grey-13 lh-18">
          If you require a greater Cloud Proxy PCU, please contact
          <a href="https://agora-ticket.agora.io" target="_blank">Agora Customer Support</a> to discuss your capacity
          requirements and understand our pricing options.
        </div>
      </div>
      <div class="mt-30">
        <el-checkbox v-model="agree">{{ $t('Cloud Proxy Checkbox') }}</el-checkbox>
      </div>
      <div class="text-right mt-20">
        <console-button class="console-btn-white" @click="cancelEnable">{{ $t('Cancel') }}</console-button>
        <console-button class="console-btn-primary" @click="enableCloud" :loading="loading" :disabled="!agree">{{
          $t('Enable')
        }}</console-button>
      </div>
    </el-dialog>
  `,
})
export default class EnableCloudProxy extends Vue {
  @Prop({ default: null, type: Function }) readonly cancelEnable!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly enableCloud!: () => Promise<void>
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean

  agree = false
}
