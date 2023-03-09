import Vue from 'vue'
import Component from 'vue-class-component'
import { user } from '@/services/user'
import { consoleEventReport, ConsoleEvents } from '@/services/consoleEventReport'
import _ from 'lodash'
import { Watch } from 'vue-property-decorator'
import ClickOutside from 'vue-click-outside'

@Component({
  directives: { ClickOutside },
  template: ` <div class="search-component" v-click-outside="closeInput" @click.stop>
    <el-input
      :placeholder="$t('Search Placeholder')"
      prefix-icon="el-icon-search"
      v-model="keyword"
      @focus="handleFocus"
      ref="searchInput"
    >
    </el-input>
    <div class="search-result-box" ref="searchResultBox">
      <div class="hot-search" v-if="!hasSearched">
        <div class="hot-search-title">{{ $t('Hot Keywords') }}</div>
        <div class="hot-search-tags">
          <span class="hot-tag" v-for="item in hotKeywords" @click="clickHotKeywords(item.keywords)">{{
            item.keywords
          }}</span>
        </div>
      </div>
      <div class="search-result-content" v-if="hasSearched">
        <div class="search-main" @scroll="onScroll">
          <div class="console-result">
            <div class="result-module-title">
              <i class="iconfont iconkongzhitai"></i>
              <span>{{ $t('Console') }}（{{ consoleResult.length }}）</span>
            </div>
            <div class="console-result-item" v-for="item in consoleResult" @click="handleSelectConsole(item)">
              <div class="console-result-content">{{ item.desc }}</div>
            </div>
            <div v-if="consoleResult.length === 0" class="empty-text">
              <i class="iconfont iconwujieguo_nanguo"></i>没有搜索到相关结果...
            </div>
          </div>
          <div class="docs-result">
            <div class="result-module-title">
              <i class="iconfont iconwendangzhan"></i>
              <span>{{ $t('Documentation') }}（{{ docsResult.length }}）</span>
            </div>
            <div v-if="docsResult.length === 0" class="empty-text">
              <i class="iconfont iconwujieguo_nanguo"></i>没有搜索到相关结果...
            </div>
            <div class="docs-result-item" v-for="item in docsResult" @click="handleSelectDocs(item)">
              <div class="head">
                <span class="docs-tag">{{ $t(docsTagMapping[item.type]) || $t('Documentation') }}</span>
                <span v-html="item.title" class="docs-title"></span>
              </div>
              <div class="docs-result-content" v-html="item.content"></div>
            </div>
          </div>
        </div>
        <div class="footer" :class="scrolled ? 'scrolled' : ''">
          <div class="f-14">
            <a
              :href="'https://docs.agora.io/cn/search?product=All&platform=All%20Platforms&p=1&q='+keyword"
              target="_blank"
              >查看【文档站】全部搜索结果</a
            >
          </div>
          <div class="ticket-text">
            没有您想搜的结果？您还可以 <a href="https://www.agora.io/cn/community" target="_blank">社区提问</a> /
            <a href="https://agora-ticket.agora.io/" target="_blank">提交工单</a>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
export default class SearchComponent extends Vue {
  keyword = ''
  user = user
  hotKeywords = [{ keywords: 'Token' }, { keywords: '实名认证' }, { keywords: '套餐包' }]
  hasSearched = false
  consoleResult: any = []
  docsResult = []
  docsTagMapping = {
    doc: 'Documentation',
    downloads: 'Downloads',
    api: 'APIReference',
  }
  projectCondition: any = {
    page: 1,
    limit: 5,
    key: undefined,
    sortProp: 'stage',
    sortOrder: 'DESC',
    status: 1,
    stage: 0,
    total: 0,
  }
  projects: any = []
  language = user.info.language === 'chinese' ? 'cn' : 'en'
  scrolled = false

  debounceSearch = _.debounce(this.doSearch, 500)

  @Watch('keyword')
  onSearch() {
    if (!this.keyword) {
      this.resetData()
    } else {
      this.debounceSearch()
    }
  }

  mounted() {
    this.getProjects()
  }

  resetData() {
    this.hasSearched = false
    this.consoleResult = []
    this.docsResult = []
    this.keyword = ''
  }

  doSearch() {
    if (!this.keyword) return
    this.hasSearched = true
    this.getDocsSearchResult()
    this.getConsoleSearchResult()
    consoleEventReport.report({
      vid: 0,
      companyId: Number(this.user.info.company.id),
      accountId: Number(this.user.info.accountId),
      eventName: ConsoleEvents.SEARCH,
      payload: JSON.stringify({ keyword: this.keyword }),
    })
  }

  async getDocsSearchResult() {
    const params = {
      keyword: this.keyword,
      lang: this.$i18n.locale === 'en' ? 'en' : 'cn',
    }
    try {
      const res = await this.$http.post('/api/v2/article/search', params)
      this.docsResult = res.data.body.items.slice(0, 4) || []
    } catch (e) {}
  }

  async getConsoleSearchResult() {
    const params = {
      keywords: this.keyword,
      language: this.$i18n.locale === 'en' ? 'Non-CN' : 'CN',
    }
    try {
      const res = await this.$http.post('/api/v2/test/search', params)
      this.consoleResult = res.data || []
      this.consoleResult = this.consoleResult.slice(0, 6)
      this.formatConsoleResult()
    } catch (e) {}
  }

  formatConsoleResult() {
    const newResult = []
    for (const result of this.consoleResult) {
      if (
        result.desc.includes('{projectName}') ||
        result.desc.includes('{projectId}') ||
        result.url.includes('{projectName}') ||
        result.desc.includes('{projectId}')
      ) {
        for (const project of this.projects) {
          if (newResult.length > 5) {
            return
          }
          newResult.push({
            desc: result.desc.replace('{projectName}', project.name).replace('{projectId}', project.projectId),
            url: result.url.replace('{projectId}', project.projectId).replace('{projectName}', project.name),
          })
        }
      } else {
        newResult.push(result)
      }
    }
    this.consoleResult = newResult
  }

  async getProjects() {
    try {
      const ret = await this.$http.get('/api/v2/projects', { params: this.projectCondition })
      this.projects = ret.data.items
    } catch (e) {}
  }

  handleSelectConsole(item: any) {
    const url = `${window.location.protocol}//${window.location.host}${item.url}`
    window.open(url, '_blank')
    consoleEventReport.report({
      vid: 0,
      companyId: Number(this.user.info.company.id),
      accountId: Number(this.user.info.accountId),
      eventName: ConsoleEvents.SEARCH,
      payload: JSON.stringify({ keyword: this.keyword, openUrl: url, openDesc: item.desc }),
    })
  }

  handleSelectDocs(item: any) {
    let url = ''
    if (item.type !== 'downloads') {
      url = `https://docs.agora.io${item.hash ? `${item.url}#${item.hash}` : item.url}`
    } else {
      url = item.url
    }
    window.open(url, '_blank')
    consoleEventReport.report({
      vid: 0,
      companyId: Number(this.user.info.company.id),
      accountId: Number(this.user.info.accountId),
      eventName: ConsoleEvents.SEARCH,
      payload: JSON.stringify({ keyword: this.keyword, openUrl: `${url}`, openDesc: item.title }),
    })
  }

  clickHotKeywords(keywords: string) {
    this.keyword = keywords
    this.doSearch()
    // ;(this.$refs as any).searchInput.focus()
  }

  handleFocus() {
    ;(this.$refs as any).searchResultBox.style.display = 'block'
  }

  closeInput() {
    this.resetData()
    ;(this.$refs as any).searchResultBox.style.display = 'none'
  }

  onScroll() {
    this.scrolled = true
  }
}
