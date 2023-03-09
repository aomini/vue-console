import Vue from 'vue'
import { Prop } from 'vue-property-decorator'
import Component from 'vue-class-component'

@Component({
  template: `
    <el-dialog :title='$t("Disable Cloud Proxy Title")' :visible="true" :before-close="cancelDisable">
      <div v-if="$i18n.locale === 'cn'">
        <div class="heading-grey-13 mb-10 lh-18" v-if="pcuLimit <= 220">
          通过禁用云代理Force UDP或Force TCP 443模式，Agora
          SDK将使用自动模式，即SDK首先尝试直接连接，如果在2秒内无法建立直接连接，则自动退回到使用TCP/TLS
          443。请注意，根据我们的<a
            href="https://docs.agora.io/en/Interactive%20Broadcast/cloudproxy_allowed_iplist?platform=Android"
            >文档页面</a
          >，您将为之前的Force UDP和Force TCP模式的使用情况付费。
        </div>
        <div class="heading-grey-13 mb-10 lh-18" v-else>
          鉴于你的PCU 限制，一旦你禁用服务，你需要联系声网支持，重新启用相同的PCU或任何更高
          PCU。根据所需的资源，准备时间可能在1天到14天之间。
        </div>
      </div>
      <div v-else>
        <div class="heading-grey-13 mb-10 lh-18" v-if="pcuLimit <= 220">
          By disabling the Cloud Proxy Force UDP or Force TCP 443 modes, the Agora SDK will use the automatic mode in
          which the SDK attempts a direct connection first, and then automatically falls back to using TCP/TLS 443 if a
          direct connection cannot be established within 2 seconds. Note that you will be billed for the previous usage
          of the Force UDP and Force TCP modes up until today, according to the pricing on our
          <a
            href="https://docs.agora.io/en/Interactive%20Broadcast/cloudproxy_allowed_iplist?platform=Android"
            target="_blank"
            >documentation page</a
          >.
        </div>
        <div class="heading-grey-13 mb-10 lh-18" v-else>
          Given your capacity tier, once you disable, you must contact Agora customer support to re-enable the same
          capacity tier or any higher capacity tier. Depending upon the capacity tier required, the lead time may be
          between 1 day and 14 days.
        </div>
      </div>
      <div class="text-right mt-20">
        <console-button class="console-btn-white" @click="cancelDisable">{{ $t('Cancel') }}</console-button>
        <console-button class="console-btn-primary" @click="disableCloud" :loading="loading">{{
          $t('Forbidden')
        }}</console-button>
      </div>
    </el-dialog>
  `,
})
export default class DisableCloudProxy extends Vue {
  @Prop({ default: null, type: Function }) readonly cancelDisable!: () => Promise<void>
  @Prop({ default: null, type: Function }) readonly disableCloud!: () => Promise<void>
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean
  @Prop({ default: 0, type: Number }) readonly pcuLimit!: number
}
