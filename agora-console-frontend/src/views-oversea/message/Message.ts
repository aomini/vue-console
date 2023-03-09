import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { Prop } from 'vue-property-decorator'

@Component({
  template: `
    <div class="message-box">
      <div
        class="message-content"
        :class="{ 'active-message': index === selectedIndex, 'read-message': index !== selectedIndex && message.readStatus }"
        @click="onClick(index)"
      >
        <div class="d-flex text-truncate">
          <div
            :class="{ 'message-box-title mr-2': true, 'title-color': !message.readStatus || index === selectedIndex, 'read-message': index !== selectedIndex && message.readStatus }"
          >
            {{ message.title }}:
          </div>
          <div class="text-truncate">{{ message.content | formatHtml() }}</div>
        </div>
        <div class="message-time">{{ $t('Published') }}: {{ message.createTime | formatDate() }}</div>
      </div>
    </div>
  `,
})
export default class Message extends Vue {
  @Prop({ default: null, type: Object }) readonly message!: any
  @Prop({ default: () => () => {}, type: Function }) readonly onClick!: any
  @Prop({ default: 0, type: Number }) readonly index!: number
  @Prop({ default: 0, type: Number }) readonly selectedIndex!: number

  get messageContent() {
    if (this.message.content) {
      const regex = /(<([^>]+)>)|&nbsp;/gi
      return this.message.content.replace(regex, '')
    }
  }
}
