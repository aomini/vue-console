import Vue from 'vue'
import Component from 'vue-class-component'
import { consoleEventReport, ConsoleEvents } from '@/services/consoleEventReport'
import { user } from '@/services/user'

@Component({
  template: `
    <div class="search-block">
      <el-autocomplete
        :placeholder="$t('Search Placeholder')"
        :fetch-suggestions="querySearch"
        v-model="keyword"
        :trigger-on-focus="false"
        :debounce="500"
        @select="handleSelect"
      >
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-autocomplete>
    </div>
  `,
})
export default class SearchBox extends Vue {
  keyword = ''
  user = user

  async querySearch(queryString: string, cb: any) {
    const restaurants = await this.getSearchResult()
    cb(restaurants)
  }

  async getSearchResult() {
    const params = {
      keyword: this.keyword,
      lang: this.$i18n.locale === 'en' ? 'en' : 'cn',
    }
    try {
      const res = await this.$http.post('/api/v2/article/search', params)
      consoleEventReport.report({
        vid: 0,
        companyId: Number(this.user.info.company.id),
        accountId: Number(this.user.info.accountId),
        eventName: ConsoleEvents.SEARCH,
        payload: JSON.stringify({ keyword: this.keyword }),
      })
      return this.formatData(res.data.body.items)
    } catch (e) {}
  }

  formatData(data: any) {
    const result = []
    for (const item of data) {
      result.push({
        value: item.content,
        url: item.url,
        hash: item.hash,
      })
    }
    return result
  }

  handleSelect(item: any) {
    const url = item.hash ? `${item.url}#${item.hash}` : item.url
    window.open(`https://docs.agora.io${url}`, '_blank')
    this.keyword = ''
  }
}
