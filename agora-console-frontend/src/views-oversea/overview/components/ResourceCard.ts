import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
const IconMove = require('@/assets/icon/icon-move.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  template: `
    <div class="card-box overview-card-1 resource-content">
      <div class="card-header">
        <div class="header-title">
          <i v-if="!editing" class="iconfont iconicon-bianjikapian" @click="editCard"></i>
          <i v-if="editing" class="iconfont iconicon-yidong" />
          <i v-if="editing" class="iconfont iconicon-shanchu" @click="confirmDelete" />
          <span class="heading-dark-03 card-title-row">{{ $t('Resource Center') }}</span>
        </div>
        <div class="header-right"></div>
      </div>
      <div class="card-content">
        <div class="resource-content">
          <el-row :gutter="40">
            <el-col :span="12">
              <div class="d-flex cursor-pointer resource-item" @click="openLink($t('DocumetsDocLink'))">
                <div class="icon-58 icon-doc"></div>
                <div class="flex-1 resource-desc">
                  <div class="heading-dark-03 hover-link mt-5">{{ $t('Documents') }}</div>
                  <div class="heading-grey-13 mt-10">{{ $t('View integration documents') }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="d-flex cursor-pointer resource-item" @click="openLink($t('APIDocLink'))">
                <div class="icon-58 icon-api"></div>
                <div class="flex-1 resource-desc">
                  <div class="heading-dark-03 hover-link mt-5">{{ $t('API Reference') }}</div>
                  <div class="heading-grey-13 mt-10">
                    {{ $t('See the API details and parameters') }}
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="40" class="mt-18">
            <el-col :span="12">
              <div class="d-flex cursor-pointer resource-item" @click="openLink($t('DownloadsLink'))">
                <div class="icon-58 icon-downloads"></div>
                <div class="flex-1 resource-desc">
                  <div class="heading-dark-03 hover-link mt-5">{{ $t('Downloads') }}</div>
                  <div class="heading-grey-13 mt-10">
                    {{ $t('Download Agora SDKs and demo apps') }}
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="d-flex cursor-pointer resource-item" @click="openLink($t('CodeDocLink'))">
                <div class="icon-58 icon-code"></div>
                <div class="flex-1 resource-desc">
                  <div class="heading-dark-03 hover-link mt-5">{{ $t('Code Samples') }}</div>
                  <div class="heading-grey-13 mt-10">
                    {{ $t('Learn from sample projects on GitHub') }}
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  `,
})
export default class ResourceCard extends Vue {
  IconMove = IconMove
  IconDelete = IconDelete
  editing = false
  openLink(link: string) {
    window.open(link)
  }

  editCard() {
    this.editing = true
  }

  endDragging() {
    this.editing = false
  }

  deleteCard() {
    this.$emit('handleDeleteCard', 'resource-card')
  }

  confirmDelete() {
    this.deleteCard()
  }
}
