import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import G2 from '@antv/g2'
const PicDau = require('@/assets/icon/bandwidth-blue.png')

@Component({
  template: `
    <div>
      <div class="d-flex mb-20" v-if="type === 'channels'">
        <div class="flex-1 sm-card">
          <div class="text-center">
            <div class="d-flex justify-center align-center mb-10">
              <img :src="PicDau" width="30px" class="icon" />
              <div class="heading-light-03">{{ peakText }}</div>
            </div>
            <div class="heading-dark-01 mb-5">{{ formatPeakNum(peakValue) }}</div>
            <div class="heading-light-03" v-if="valueType">{{ valueType }}</div>
          </div>
        </div>
      </div>
      <div ref="chart"></div>
    </div>
  `,
})
export default class LineChart extends Vue {
  @Prop({ type: Number }) width!: number
  @Prop({ default: 300, type: Number }) height!: number
  @Prop({ type: Number }) peakValue!: number
  @Prop({ default: '', type: String }) type!: string
  @Prop({ default: '', type: String }) valueType!: string
  @Prop({ default: '', type: String }) peakText!: string
  @Prop({ default: {} }) data!: any
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  plotCfg!: Record<string, never>
  @Prop({ default: true, type: Boolean }) forceFit!: boolean

  chart: any = null
  chartId: string | null = ''
  PicDau = PicDau

  @Watch('computedData')
  onDataChange(newData: any, oldData: any) {
    if (newData !== oldData) {
      this.chart.changeData(newData)
    }
  }

  @Watch('width')
  onWidthChange(newData: any, oldData: any) {
    if (newData !== oldData) {
      this.chart.changeSize(newData, this.height)
    }
  }

  @Watch('height')
  onHeightChange(newData: any, oldData: any) {
    if (newData !== oldData) {
      this.chart.changeSize(this.width, newData)
    }
  }

  @Watch('$store.state.menuVerticalCollapse')
  onMenuVerticalCollapseChange() {
    this.handleResize()
  }

  get computedData() {
    const computeData = this.data.map((x: any) => {
      if (x.format && x.format === 'channel') {
        return x
      }
      x.usage = Math.floor(Number(x.usage) / 60)
      return x
    })
    return computeData
  }

  mounted() {
    this.initChart()
  }

  beforeDestory() {
    console.info('beforeDestory')
    this.chart.destroy()
    this.chart = null
    this.chartId = null
  }

  formatNum = (value: string) => {
    if (!value) return '0'
    const minute = Number(value)
    return minute.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
  }

  operation(chart: any) {
    chart
      .line()
      .position('date*usage')
      .color('type', ['#FF6384', '#38C2FF', '#007AFF', '#064988', '#50E5CE'])
      .tooltip('type*usage', (type: any, usage: any) => {
        return {
          name: type,
          value: this.formatNum(usage),
        }
      })
    chart
      .point()
      .position('date*usage')
      .color('type', ['#FF6384', '#38C2FF', '#007AFF', '#064988', '#50E5CE'])
      .shape('circle')
      .style({
        stroke: '#fff',
        lineWidth: 1,
      })

    chart.axis('usage', {
      label: {
        formatter: function formatter(text: string) {
          if (Number(text) < 1000) {
            return text
          }
          return (Number(text) / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        },
      },
    })
    chart.legend(false)
    chart.render()
  }

  initChart() {
    const chart = new G2.Chart({
      container: this.$refs.chart as HTMLDivElement,
      width: this.width,
      height: this.height,
      forceFit: this.forceFit,
      padding: 'auto',
    })
    chart.source(this.computedData)
    this.operation(chart)
    chart.legend(false)
    chart.render()
    this.chart = chart
  }

  formatPeakNum(value: any) {
    if (!value) return '0'
    const minute = Math.floor(Number(value))
    return minute.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
  }

  handleResize() {
    setTimeout(() => {
      if (document.createEvent) {
        const event = document.createEvent('HTMLEvents')
        event.initEvent('resize', true, true)
        window.dispatchEvent(event)
      }
    }, 100)
  }
}
