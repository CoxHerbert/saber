<template>
  <basic-container class="page-container">
    <div class="content-warp page-prod-plan-edit" :class="pageRenderSize">
      <div v-loading="loading" class="drawer-container">
        <div v-if="detailData" class="content-box">
          <!-- <el-scrollbar ref="scrollbarRef" style="height: calc(100vh - 210px)"> -->
          <div class="form-box">
            <el-form
              ref="formRef"
              class="form-main"
              :model="detailData"
              label-suffix=":"
              :disabled="allDisabled"
              :label-width="'80px'"
              size="small"
            >
              <div
                v-for="(group, i) in columns"
                class="group-box"
                :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
                :key="i"
              >
                <div :key="i" class="group-header">
                  {{ group.name }}
                  <img
                    v-if="group.renderType === 'form' && billTypeMap[detailData?.billType]"
                    class="bill-type"
                    :src="billTypeMap[detailData.billType]"
                    alt="bill-type"
                  />
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
                        :data="{
                          ...col,
                          props: {
                            ...col.props,
                          },
                        }"
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
                <template v-if="group.renderType === 'table'">
                  <div class="group-toolbar">
                    <el-button
                      icon="plus"
                      type="primary"
                      size="small"
                      @click="
                        doAction('add-process', { processGroupKey: 'DC_PROCESS_THCH_GROUP_SC' })
                      "
                      >新增行</el-button
                    >
                    <el-button
                      :disabled="!detailData?.isHistoryBom"
                      type="primary"
                      size="small"
                      @click="doAction('his-process', {})"
                      >历史工艺</el-button
                    >
                    <div class="tag-wrap">
                      <el-tag
                        v-for="(process, index) in detailData.processDetail"
                        type="primary"
                        :key="index"
                        @click="doAction('add-process', process)"
                      >
                        <el-icon><Plus /></el-icon>
                        {{ process.technologyName }}
                      </el-tag>
                    </div>
                    <!-- <el-button @click="addRow">新增行</el-button>
                      <el-button @click="copyRow">复制行</el-button> -->
                  </div>
                  <el-form-item
                    class="form-item-table"
                    :prop="group.prop"
                    :label-width="0"
                    :rules="getTableRule(group.items)"
                  >
                    <div ref="dragableTableRef">
                      <el-table
                        :data="detailData[group.prop] || []"
                        @row-click="handleRowClick"
                        @selection-change="handleSelectionChange"
                        row-key="uuid"
                        size="small"
                        border
                      >
                        <template v-for="(col, i) in group.items">
                          <el-table-column
                            v-if="
                              col.type === 'selection' &&
                              (!col.showFunc ||
                                (col.showFunc && col.showFunc?.call && col.showFunc(detailData)))
                            "
                            type="selection"
                            :fixed="col.fixed"
                            :width="col.width"
                            :min-width="col.minWidth"
                            :key="i"
                            :selectable="col.selectable"
                          >
                          </el-table-column>
                          <el-table-column
                            v-else-if="col.type === 'index'"
                            :key="'index' + i"
                            :prop="col.prop"
                            label="序号"
                            fixed="left"
                            align="center"
                            :min-width="col?.minWidth || '80px'"
                            :width="col?.width"
                          >
                            <template #default="scoped">{{ scoped.$index + 1 }}</template>
                          </el-table-column>
                          <el-table-column
                            v-else-if="col.type === 'actions'"
                            :key="'option' + i"
                            :fixed="col.fixed"
                            :label="col.label"
                            :width="col.width ? col.width : 180"
                            :align="col.align ? col.align : 'center'"
                          >
                            <template #default="scoped">
                              <el-button
                                v-for="(btn, j) in col.children"
                                :key="j"
                                link
                                v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                                type="primary"
                                @click="doAction(btn.action, scoped)"
                                >{{ btn.label }}</el-button
                              >
                            </template>
                          </el-table-column>
                          <el-table-column
                            v-else-if="
                              !col.showFunc ||
                              (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                            "
                            :key="`other-${i}`"
                            :fixed="col.fixed"
                            :width="col.width"
                            align="left"
                            :min-width="col.minWidth"
                            :prop="col.prop"
                            show-overflow-tooltip
                          >
                            <template #header><span v-html="getLabelCode(col)"> </span></template>
                            <template #default="scoped">
                              <template v-if="editIndex === scoped.$index">
                                <dc-widget
                                  v-model="scoped.row[col.prop]"
                                  :data="{
                                    ...col,
                                    props: {
                                      ...col.props,
                                      disabled: handleTableItemDisabled(col, scoped),
                                    },
                                  }"
                                  :dictMaps="dictMaps"
                                  @change="
                                    val => {
                                      handleTableItemChange(val, scoped, col);
                                    }
                                  "
                                >
                                </dc-widget>
                              </template>
                              <span
                                v-else
                                @click="handleClickCeil(scoped.$index, col.prop)"
                                class="ceil-value"
                              >
                                <dc-field-view
                                  :value="
                                    col?.transVal ? col?.transVal(scoped) : scoped.row[col.prop]
                                  "
                                  :data="col"
                                  :dictMaps="dictMaps"
                                />
                              </span>
                            </template>
                          </el-table-column>
                        </template>
                      </el-table>
                    </div>
                  </el-form-item>
                </template>
              </div>
              <bomData :data="detailData" />
            </el-form>
          </div>
        </div>
        <div class="footer">
          <el-button @click="doAction('cancel')">取消</el-button>
          <el-button type="primary" @click="doAction('submit')" :disabled="allDisabled"
            >保存</el-button
          >
          <el-button
            v-if="!detailData?.isUploadBom"
            type="primary"
            @click="doAction('submitERP')"
            :disabled="!detailData.id"
            >提交ERP</el-button
          >
        </div>
      </div>
    </div>
    <iframe
      class="drawing-wrap"
      :src="`https://www.eastwinbip.com/drawing/${detailData.materialNumber}`"
      title="物料图纸"
      frameBorder="no"
      border="0"
      marginWidth="0"
      marginHeight="0"
      scrolling="no"
      allowTransparency="yes"
    ></iframe>
    <hisProcessDrawer ref="hisProcessDrawerRef" @confirm="handleHisProcessConFirm" />
  </basic-container>
</template>
<script>
import detailPage from '@/mixins/detail-page';
import detailConfig from './utils';
import BigNumber from 'bignumber.js';
import hisProcessDrawer from './../../cnps/hisProcessDrawer.vue';
import bomData from './../../cnps/bomData.vue';
import Sortable from 'sortablejs';
import func from '@/utils/func';

export default {
  components: { bomData, hisProcessDrawer },
  mixins: [detailPage],
  name: 'prod-plan-add-or-edit',
  data() {
    return {
      detailKey: 'createdProcessDetail',
      columns: [],
      apiFns: {
        getDetail: 'getGenerateDetail',
        postPlan: 'postGenerate',
      },
      billTypeMap: {
        '工序汇报入库-普通生产': '/img/mes/普通.svg',
        '工序汇报入库-返修生产': '/img/mes/返修.svg',
        '工序汇报入库-返工生产': '/img/mes/返工.svg',
      },
    };
  },
  computed: {
    allDisabled() {
      if (this.pageMode === 'add' || this.pageMode === 'edit') {
        return false;
      }
      return true;
    },
  },
  beforeMount() {
    const { id, type } = this.$route.query;
    this.show(id);
    this.columns = detailConfig(type).columns;
  },
  mounted() {
    this.$nextTick(() => {
      if (this.allDisabled) return true;
      // 1. 从 $refs 数组里拿到真正的 DOM 容器
      const wrapper = Array.isArray(this.$refs.dragableTableRef)
        ? this.$refs.dragableTableRef[0]
        : this.$refs.dragableTableRef;

      if (!wrapper) {
        console.warn('没拿到 wrapper');
        return;
      }

      // 2. 用正确的 class 找到 <tbody>
      const tbody = wrapper.querySelector('.el-table__body-wrapper tbody');
      if (!tbody) {
        console.warn('没找到 el-table__body-wrapper tbody');
        return;
      }

      // 3. 初始化 Sortable
      Sortable.create(tbody, {
        draggable: 'tr',
        animation: 150,
        onEnd: evt => {
          const list = this.detailData[this.detailKey];
          list.splice(evt.newIndex, 0, list.splice(evt.oldIndex, 1)[0]);
          list.forEach((item, idx) => (item.technologyOrder = idx + 1));
        },
      });
    });
  },
  methods: {
    /** 页面操作 **/
    doAction(action, scope) {
      if (action === 'row-click') {
        this.rowClick(scope);
      } else if (action === 'row-delete') {
        this.detailData[this.detailKey].splice(scope.$index, 1);
        this.detailData[this.detailKey].forEach((item, index) => {
          item.technologyOrder = index + 1;
        });
      } else if (action === 'submit') {
        this.handleSubmit().then(res => {
          this.$message.success('保存成功');
          const { id } = this.$route.query;
          this.show(id);
        });
      } else if (action === 'cancel') {
        this.$router.go(-1);
      } else if (action === 'add-process') {
        const technologyOrder = this.detailData[this.detailKey].length + 1;
        this.detailData[this.detailKey].push({
          ...scope,
          technologyOrder,
          uuid: func.generateUUID(),
        });
      } else if (action === 'his-process') {
        this.$refs.hisProcessDrawerRef.openDialog(this.detailData.materialNumber);
      } else if (action === 'submitERP') {
        this.handleSubmitErp();
      }
    },
    handleHisProcessConFirm(data) {
      this.detailData[this.detailKey] = [...this.detailData[this.detailKey], ...data];
      this.detailData[this.detailKey].forEach((item, index) => {
        item.uuid = func.generateUUID();
        item.technologyOrder = index + 1;
      });
    },
    /** 行点击 **/
    rowClick({ row }) {},
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
        this.api.mes.mops[this.apiFns.getDetail]({
          entryId: this.detailId,
        })
          .then(res => {
            let { code, data } = res.data;
            if (code === 200) {
              if (Array.isArray(data.processDetail)) {
                data.processDetail.forEach(item => {
                  item.uuid = func.generateUUID();
                  item.singleWorkingHour = this.convertTime({
                    value: item.singleWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.prepareWorkingHour = this.convertTime({
                    value: item.prepareWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.allWorkingHour = this.convertTime({
                    value: item.allWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                });
              }
              if (Array.isArray(data?.[this.detailKey])) {
                data[this.detailKey].forEach(item => {
                  item.uuid = func.generateUUID();
                  item.singleWorkingHour = this.convertTime({
                    value: item.singleWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.prepareWorkingHour = this.convertTime({
                    value: item.prepareWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.allWorkingHour = this.convertTime({
                    value: item.allWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                });
              } else {
                data[this.detailKey] = [];
              }
              if (Array.isArray(data.rawMaterialBom)) {
                data.rawMaterialBom.forEach(item => {
                  item.uuid = func.generateUUID();
                });
              } else {
                data.rawMaterialBom = [];
              }
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
    handleFormItemChange(val, scoped, col) {},
    /** 处理表格项变化 */
    handleTableItemChange(val, scoped, col) {
      if (col.prop === 'singleWorkingHour' || col.prop === 'prepareWorkingHour') {
        scoped.row.allWorkingHour = new BigNumber(scoped.row.singleWorkingHour || 0)
          .multipliedBy(this.detailData.number || 0)
          .plus(scoped.row.prepareWorkingHour || 0)
          .toNumber(); // 如果需要保持 number 类型
      }
    },
    /** 处理行点击 **/
    handleRowClick(row) {
      if (this.pageMode !== 'look') {
        const index = this.detailData[this.detailKey].findIndex(item => item === row);
        this.editIndex = index;
      } else {
        this.doAction('row-click', { row });
      }
      return;
    },
    /** 获取table的规则 **/
    getTableRule(columns) {
      let that = this;
      return [
        {
          required: true,
          validator(_, value, callback) {
            if (value.length === 0) {
              callback(new Error('明细信息不能为空'));
            } else {
              let findCol = null;
              const findIndex = that.detailData[that.detailKey]
                .filter(item => item.isSelected)
                .findIndex(row => {
                  findCol = columns.find(col => {
                    return col.required && [null, undefined, ''].includes(row[col.prop]);
                  });
                  return !!findCol;
                });
              if (findIndex > -1) {
                callback(new Error(`第${findIndex + 1}行${findCol.label}不能为空`));
              } else {
                callback();
              }
            }
          },
          trigger: 'change',
        },
      ];
    },
    /** 处理table某一项的是否可编辑 **/
    handleTableItemDisabled(col, scope) {
      if (col.prop === 'technologyOrder') {
        return true;
      } else if (col.prop === 'technologyName') {
        return !!scope.row?.id;
      }
    },
    handleSubmit() {
      return new Promise((reslove, reject) => {
        this.$refs.formRef
          .validate(valid => {
            if (valid) {
              this.loading = true;
              const formData = {
                ...this.detailData,
                processDetail: this.detailData.processDetail.map(item => {
                  return {
                    ...item,
                    singleWorkingHour: this.convertTime({
                      value: item.singleWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    prepareWorkingHour: this.convertTime({
                      value: item.prepareWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    allWorkingHour: this.convertTime({
                      value: item.allWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                  };
                }),
                [this.detailKey]: this.detailData[this.detailKey].map(item => {
                  return {
                    ...item,
                    singleWorkingHour: this.convertTime({
                      value: item.singleWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    prepareWorkingHour: this.convertTime({
                      value: item.prepareWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    allWorkingHour: this.convertTime({
                      value: item.allWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                  };
                }),
              };
              this.api.mes.mops[this.apiFns.postPlan](formData)
                .then(res => {
                  const { code, data } = res.data;
                  if (code === 200) {
                    reslove();
                  } else {
                    reject();
                  }
                  this.loading = false;
                })
                .catch(err => {
                  this.loading = false;
                  reject();
                });
            }
          })
          .catch(err => {
            this.loading = false;
            reject();
          });
      });
    },
    // 处理提交至ERP
    handleSubmitErp() {
      this.$confirm('是否将当前BOM提交至云星空?(注意:提交后物料BOM不可进行任何操作!)')
        .then(() => {
          this.handleSubmit().then(() => {
            this.loading = true;
            this.api.mes.mops
              .pushErpBom({ id: this.detailData.id })
              .then(res => {
                const { code, data } = res.data;
                if (code === 200) {
                  const { id } = this.$route.query;
                  this.show(id);
                }
                this.loading = false;
              })
              .catch(err => {
                this.loading = false;
              });
          });
        })
        .catch(err => {});
    },
  },
};
</script>
<style lang="scss">
.page-container {
  .basic-container__card {
    .el-card__body {
      display: flex;
      align-items: center;
      flex-direction: row;
      .page-process-outsourcing-right {
        .param-group {
          display: none;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
@use './../../cnps/add-or-edit-page.scss';
.group-header {
  position: relative;
  .bill-type {
    top: -10px;
    position: absolute;
    left: 70px;
    width: 50px;
    z-index: 10;
  }
}
</style>
