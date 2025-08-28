<template>
  <div class="add-or-edit-page out-doc-add-or-edit-page" :class="pageRenderSize">
    <div class="drawer-container">
      <div v-if="detailData" class="content-box">
        <div class="form-box">
          <el-form
            ref="formRef"
            class="form-main"
            :model="detailData"
            label-suffix=":"
            :disabled="allDisabled"
            :label-width="'100px'"
            size="small"
            v-loading="loading"
          >
            <div
              v-for="(group, i) in groups"
              class="group-box"
              :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
              :key="i"
            >
              <div :key="i" class="group-header">
                {{ group.name }}
                <el-icon
                  v-if="group.showToggleExpand"
                  @click="toggleExpand(group.prop, !expand[group.prop])"
                  class="toggle-expand-icon"
                  ><CaretRight v-if="!expand[group.prop]" /> <CaretBottom v-else
                /></el-icon>
              </div>
              <template v-if="group.renderType === 'form'">
                <template v-for="col in group.items">
                  <el-form-item
                    v-if="
                      !col.showFunc ||
                      (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                    "
                    class="form-item-operation-detail"
                    :class="`form-item-${col.prop}`"
                    :label="col.label"
                    :prop="col.prop"
                    :rules="getColumnRules(col)"
                    :key="col.prop"
                  >
                    <dc-widget
                      v-model="detailData[col.prop]"
                      :data="col"
                      :dictMaps="dictMaps"
                      @change="
                        val => {
                          handleFormItemChange(val, {}, col);
                        }
                      "
                    >
                    </dc-widget>
                  </el-form-item>
                </template>
              </template>
            </div>
          </el-form>
        </div>
        <div class="groups-box" v-loading="transOrderLoading">
          <div
            v-for="(group, i) in forwardOrderOptions"
            class="group-box"
            :class="group.classList"
            :key="i"
          >
            <div class="group-header">
              {{ group.name }}
            </div>
            <template v-if="group.renderType === 'table'">
              <!-- 工艺表格（示意：使用你现有的 ProcessTable 组件） -->
              <ProcessTable
                ref="processTableRef"
                :disabled="allDisabled || !detailData.id"
                :detailData="detailData"
                :withTransfer="true"
                @update="updatePage"
              />
            </template>
            <template v-if="group.renderType === 'customize'">
              <div
                class="cards"
                v-if="Array.isArray(transferOrderRecords) && transferOrderRecords.length"
              >
                <el-card v-for="(record, i) in transferOrderRecords" :key="i" shadow="never">
                  <template #header>
                    <div class="header-content">
                      <div class="batch-no">批号：{{ record.batchNo || '-' }}</div>
                      <div class="status">
                        <dc-dict-key
                          :options="dicts?.DC_FORWARD_STATUS"
                          :value="record?.orderStatus"
                        />
                      </div>
                    </div>
                  </template>
                  <div class="field-item" v-for="(field, j) in transferRecordFields" :key="j">
                    <div class="field-item-label">{{ field.label }}:</div>
                    <div class="field-item-value">
                      <dc-dict-key
                        v-if="field.component === 'dict'"
                        :options="dicts?.[field.dictKey]"
                        :value="record[field.prop]"
                      />
                      <span v-else>{{
                        [undefined, null, ''].includes(record[field.prop])
                          ? '-'
                          : record[field.prop]
                      }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
              <span v-else class="no-data">暂无数据</span>
            </template>
          </div>
        </div>

        <div class="footer">
          <el-button @click="close">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import detailPage from '@/mixins/detail-page';
import utils from './utils';
import Api from '@/api';
import ProcessTable from './ProcessTable.vue';

const { basicInfoOptions, forwardOrderOptions } = utils;

export default {
  components: { ProcessTable },
  mixins: [detailPage],
  name: 'process-out-add-or-edit',
  dicts: ['DC_FORWARD_TYPE', 'DC_FORWARD_STATUS'],
  data() {
    return {
      pageId: null,
      detailKey: 'process',
      detailData: {},
      groups: [],
      transferOrderRecords: [],
      transferRecordFields: [
        { prop: 'createTime', label: '转单时间' },
        { prop: 'transferType', label: '类型', dictKey: 'DC_FORWARD_TYPE', component: 'dict' },
        { prop: 'deliveryTime', label: '交期' },
        { prop: 'processNo', label: '单据编号' },
        { prop: 'transferQty', label: '转单数量' },
        { prop: 'returnQty', label: '回单入库数量' },
        { prop: 'processes', label: '工艺' },
      ],
    };
  },
  computed: {
    allDisabled() {
      if (this.pageMode === 'add' || this.pageMode === 'edit') {
        return false;
      }
      return true;
    },
    forwardOrderOptions() {
      return forwardOrderOptions();
    },
  },
  beforeMount() {
    const { id, type } = this.$route.query;
    this.pageId = id;
    this.pageMode = type;
    this.show(id);
    this.getTransOrderDetail(this.pageId);
    this.groups = basicInfoOptions(this.pageMode).columns;
  },
  mounted() {},
  methods: {
    /** 页面操作 **/
    doAction(action, scope) {},
    /** 加载详情 **/
    show(id) {
      if (!id) {
        this.detailData = {
          [this.detailKey]: [],
        };
        return;
      }
      if (id) {
        this.loading = true;
        /** 生产主计划生成工序 **/
        Api.mes.forward
          .getForwardDetail({
            id: this.detailId,
          })
          .then(res => {
            let { code, data } = res.data;
            if (code === 200) {
              this.detailData = data;
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    /** 处理表单项变化 */
    handleFormItemChange(val, scoped, col) {
      if (col.prop === 'materialNumber') {
        this.loading = true;
        Api.mes.forward
          .submitForward(val)
          .then(res => {
            const { code, data } = res.data;
            if (code === 200) {
              this.detailData = data;
              this.$refs.processTableRef[0].updatePage(data);
              this.getTransOrderDetail(data.id);
              const timer = setTimeout(() => {
                this.$router.push({
                  query: {
                    id: data.id,
                    type: 'edit',
                    parentMenuId: '1957702102835257345',
                  },
                });
                clearTimeout(timer);
              }, 100);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    getTransOrderDetail(id) {
      if (!id) return;
      this.transOrderLoading = true;
      Api.mes.transfer
        .getOrderTransList({ resoureOrderId: id, current: 1, size: 9999 })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.transferOrderRecords = data.records || [];
          }
          this.transOrderLoading = false;
        })
        .catch(err => {
          this.transOrderLoading = false;
        });
    },
    updatePage() {
      this.getTransOrderDetail(this.pageId);
    },
  },
};
</script>
<style lang="scss" scoped>
.no-data,
.cards {
  flex: 1;
  overflow: auto;
}
.no-data {
  color: #999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.out-doc-add-or-edit-page {
  .drawer-container {
    overflow: hidden;
    .content-box {
      overflow: hidden;
      .form-box {
        flex: unset;
        .form-main {
          .form-basic-group {
            flex: unset;
            min-height: unset;
          }
        }
      }
      .groups-box {
        display: flex;
        flex: 1;
        overflow: hidden;
        gap: 15px;
        .forward-order,
        .transfer-order-record {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .transfer-order-record {
          :deep(.el-card) {
            margin-bottom: 5px;
            .el-card__body {
              display: flex;
              flex-wrap: wrap;
            }
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            .batch-no {
              font-weight: 600;
            }
          }
          .field-item {
            display: flex;
            font-size: 14px;
            &-label {
              padding: 0 10px 0 5px;
              color: #222;
            }
            &-value {
              color: #333;
            }
          }
        }
      }
    }
  }

  &.render-small {
    .form-basic-group {
      .form-item-remark {
        width: 100% !important;
      }
      .form-item-operation-detail {
        width: 100%;
        margin-right: 0 !important;
      }
    }
    .field-item {
      width: calc(100% - 5px);
    }
  }
  &.render-middle {
    .field-item {
      width: calc(50% - 5px);
    }

    .form-basic-group {
      .form-item-remark {
        width: 100% !important;
      }
      .form-item-operation-detail {
        width: 32%;
        &:nth-child(3n) {
          margin-right: 1%;
        }
        &:nth-child(3n + 1) {
          margin-right: 1%;
        }
        &:nth-child(3n + 2) {
          margin-right: 1%;
        }
      }
    }
  }
  &.render-large {
    .form-basic-group {
      .form-item-remark {
        width: 100% !important;
      }
      .form-item-operation-detail {
        width: 19%;
        &:nth-child(5n) {
          margin-right: 1%;
        }
        &:nth-child(5n + 1) {
          margin-right: 1%;
        }
        &:nth-child(5n + 2) {
          margin-right: 1%;
        }
      }
    }
    .field-item {
      width: calc(33% - 5px);
    }
  }
}
</style>
