import Vue from 'vue'
import Component from 'vue-class-component'
import './Component.less'
import { user } from '@/services/user'
import draggable from 'vuedraggable'
import _ from 'lodash'
const IconLayout = require('@/assets/icon/icon-layout.png')
const IconDelete = require('@/assets/icon/icon-delete.png')

@Component({
  components: {
    draggable,
  },
  template: `
    <div class="layout-edit">
      <el-tooltip :content="$t('Customize layout')" placement="bottom" effect="light">
        <img :src="IconLayout" class="icon-layout cursor-pointer" @click="openEdit" />
      </el-tooltip>

      <el-dialog :title="$t('Customize layout')" :visible.sync="showDialog" width="644px">
        <div class="d-flex">
          <div class="layout-col mr-20">
            <div class="h-60">
              <div class="heading-dark-13">{{ $t('Preset card') }}</div>
              <div class="heading-grey-13">{{ $t('Layout Tip') }}</div>
            </div>
            <div class="layout-box mt-10">
              <draggable
                v-model="remainCards"
                group="layoutCard"
                ghost-class="draging-ghost"
                animation="300"
                class="drag-box"
              >
                <transition-group tag="div" class="drag-box">
                  <div class="card-list-item" v-for="item in remainCards" :key="item.id">
                    <div class="d-flex align-center">
                      <i class="iconfont iconicon-yidong" />
                      <div class="heading-grey-13 ml-10">{{ $t(item.id) }}</div>
                    </div>
                  </div>
                </transition-group>
              </draggable>
            </div>
          </div>
          <div class="layout-col-2">
            <div class="h-60">
              <div class="heading-dark-13">{{ $t('Layout List') }}</div>
              <el-select size="mini" v-model="settingType" class="mt-10" @change="handleTypeChange">
                <el-option v-for="item in settingTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="layout-box mt-10">
              <el-row :gutter="5">
                <el-col :span="12">
                  <draggable v-model="leftCards" group="layoutCard" ghost-class="draging-ghost" animation="300">
                    <transition-group tag="div" class="drag-box">
                      <div class="card-list-item" v-for="item in leftCards" :key="item.id">
                        <div class="d-flex align-center">
                          <i class="iconfont iconicon-yidong" />
                          <div class="heading-grey-13 ml-10">{{ $t(item.id) }}</div>
                        </div>
                        <i class="iconfont iconicon-guanbi" @click="deleteLeftCard(item.id)" />
                      </div>
                    </transition-group>
                  </draggable>
                </el-col>
                <el-col :span="12">
                  <draggable
                    v-model="rightCards"
                    group="layoutCard"
                    ghost-class="draging-ghost"
                    animation="300"
                    class="drag-box"
                  >
                    <transition-group tag="div" class="drag-box">
                      <div class="card-list-item" v-for="item in rightCards" :key="item.id">
                        <div class="d-flex align-center">
                          <i class="iconfont iconicon-yidong" />
                          <div class="heading-grey-13 ml-10">{{ $t(item.id) }}</div>
                        </div>
                        <i class="iconfont iconicon-guanbi" @click="deleteRightCard(item.id)" />
                      </div>
                    </transition-group>
                  </draggable>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div class="text-right mt-20">
          <console-button class="console-btn-white" @click="closeEdit">{{ $t('Cancel') }}</console-button>
          <console-button class="console-btn-primary" @click="saveSetting" :loading="loading">{{
            $t('Save')
          }}</console-button>
        </div>
      </el-dialog>
    </div>
  `,
})
export default class LayoutEdit extends Vue {
  loading = false
  IconLayout = IconLayout
  IconDelete = IconDelete
  user: any = user.info
  isCocos = user.info.isCocos
  isCN = user.info.company.area === 'CN'

  allCards: { id: string }[] = []
  remainCards: { id: string }[] = []
  leftCards: { id: string }[] = []
  rightCards: { id: string }[] = []
  layoutSetting: any = null
  showDialog = false
  settingTypeOptions = [
    { value: 'default', label: this.$t('Preset layout') },
    { value: 'own', label: this.$t('Customize layout') },
  ]
  settingType = ''

  openEdit() {
    this.allCards = []
    this.remainCards = []
    this.leftCards = []
    this.rightCards = []
    this.layoutSetting = null
    this.initCards()
    this.initLayoutSetting()
    this.showDialog = true
  }

  closeEdit() {
    this.showDialog = false
  }

  initCards() {
    this.allCards.push({ id: 'project-card' })
    this.allCards.push({ id: 'resource-card' })
    this.allCards.push({ id: 'bill-card' })
    this.allCards.push({ id: 'message-card' })
    if (!this.isCocos && this.user.permissions['Member&RoleManagement'] > 0) {
      this.allCards.push({ id: 'member-card' })
    }
    if (this.isCN) {
      this.allCards.push({ id: 'package-card' })
    }
    this.allCards.push({ id: 'marketplace-card' })
  }

  initDefautSetting() {
    this.leftCards = []
    this.rightCards = []
    this.remainCards = []
    for (const index in this.allCards) {
      const a = Number(index) % 2
      if (!a) {
        this.leftCards.push(this.allCards[index])
      } else {
        this.rightCards.push(this.allCards[index])
      }
    }
  }

  async initLayoutSetting() {
    await this.getSetting()
    if (!this.layoutSetting) {
      for (const index in this.allCards) {
        const a = Number(index) % 2
        if (!a) {
          this.leftCards.push(this.allCards[index])
        } else {
          this.rightCards.push(this.allCards[index])
        }
      }
    } else {
      this.leftCards = []
      this.rightCards = []
      this.layoutSetting['left'].forEach((item: any) => {
        if (_.find(this.allCards, ['id', item.id])) {
          this.leftCards.push(item)
        }
      })
      this.layoutSetting['right'].forEach((item: any) => {
        if (_.find(this.allCards, ['id', item.id])) {
          this.rightCards.push(item)
        }
      })
      const allSettingCards = _.concat(this.leftCards, this.rightCards)
      this.remainCards = _.filter(this.allCards, (item) => {
        return !_.find(allSettingCards, { id: item.id })
      })
    }
  }

  async getSetting() {
    try {
      const res = await this.$http.get('/api/v2/account/layout/setting')
      if (res.data && res.data.setting) {
        this.layoutSetting = JSON.parse(res.data.setting)
      }
    } catch (e) {}
  }

  async saveSetting() {
    this.loading = true
    const params = JSON.stringify({ left: this.leftCards, right: this.rightCards })
    try {
      await this.$http.post('/api/v2/account/layout/setting', { setting: params })
      this.$emit('updateLayout')
      this.closeEdit()
    } catch (e) {}
    this.loading = false
  }

  deleteLeftCard(id: string) {
    const index = this.leftCards.findIndex((item) => item.id === id)
    if (index !== undefined && index !== -1) {
      this.leftCards.splice(index, 1)
    }
    this.remainCards.push({ id: id })
  }

  deleteRightCard(id: string) {
    const index = this.rightCards.findIndex((item) => item.id === id)
    if (index !== undefined && index !== -1) {
      this.rightCards.splice(index, 1)
    }
    this.remainCards.push({ id: id })
  }

  handleTypeChange(value: string) {
    if (value === 'default') {
      this.initDefautSetting()
    } else {
      this.openEdit()
    }
  }
}
