<template>
  <basic-container v-loading="loading">
    <div class="content-warp page-processing-outsourcing list-edit-page">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <div>
          <el-button
            aria-disabled="true"
            :disabled="!updataSelectRows.length"
            type="primary"
            @click="doAction('3')"
            >转外协
          </el-button>
          <el-button :disabled="!updataSelectRows.length" type="primary" @click="doAction('2')"
            >转委外</el-button
          >
          <el-button
            :disabled="!updataSelectRows.length"
            aria-disabled="true"
            type="primary"
            @click="doAction('1')"
            >转自制
          </el-button>
          <el-button
            :disabled="!updataSelectRows.length"
            aria-disabled="true"
            type="primary"
            @click="doAction('4')"
            >转返工
          </el-button>

          <!-- <el-button
            icon="Upload"
            type="warning"
            :disabled="!updataTable.length"
            @click="doAction('submitErp')"
            >提交共{{ updataTable.length }}条</el-button
          > -->
          <el-button
            icon="Upload"
            type="warning"
            :disabled="!updataSelectRows.length"
            @click="doAction('submitErp')"
            >提交共{{ updataSelectRows.length }}条</el-button
          >
          <el-button
            icon="Printer"
            type="warning"
            :disabled="!batchSelectRows.length"
            @click="doAction('batchesPrint')"
            >批量打印</el-button
          >
          <el-button
            icon="Folder"
            type="warning"
            :disabled="!batchSelectRows.length"
            @click="doAction('batchesBuild')"
            >批量打包</el-button
          >
          <el-button icon="Folder" type="warning" @click="doAction('exportPage')"
            >导出当前页</el-button
          >
        </div>
        <div>
          <el-tag type="success">已选中{{ updataSelectRows.length }}条</el-tag>
          <!-- <el-tag type="warning">已修改{{ updataTable.length }}条</el-tag> -->
        </div>
      </div>
      <div class="table-container">
        <el-form ref="formRef" class="form-main" :model="tableData">
          <!-- :rules="getTableRule(group.items)" -->
          <el-form-item class="form-item-table" :label-width="0">
            <el-table
              ref="tableRef"
              :data="tableData"
              :row-key="rowKey || 'id'"
              @cell-click="handleCellClickIndex"
              @select="handleSelect"
              @select-all="handleSelectAll"
              @selection-change="handleSelectionChange"
              :row-style="setRowStyle"
              :row-class-name="tableRowClassName"
              border
            >
              <template v-for="(col, i) in columns">
                <!-- 多选 -->
                <el-table-column
                  v-if="col.type === 'selection'"
                  :key="i"
                  type="selection"
                  :align="col.align"
                  :width="col.width"
                  :fixed="col?.fixed || ''"
                  :reserve-selection="true"
                >
                  <!-- <template #default="scoped">
                   
                </template> -->
                </el-table-column>

                <!-- 序号类型 -->
                <el-table-column
                  v-else-if="col.type === 'index'"
                  :key="'index' + i"
                  label="序号"
                  :align="col.align"
                  :width="col.width"
                >
                  <template #default="{ $index }">
                    {{ $index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column
                  v-else-if="col.type === 'actions'"
                  :key="'option' + i"
                  :fixed="col.fixed"
                  :label="col.label"
                  :width="col.width ? col.width : 180"
                  :min-width="col.minWidth"
                  :align="col.align ? col.align : 'center'"
                >
                  <template #default="scoped">
                    <el-button
                      v-for="(btn, j) in col.children"
                      :key="j"
                      link
                      v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped, queryParams))"
                      type="primary"
                      @click="doAction(btn.action, scoped)"
                      >{{ btn.label }}</el-button
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  v-else-if="col.type === 'hiddenType'"
                  :key="'hiddenType' + i"
                  width="1"
                >
                </el-table-column>
                <el-table-column
                  v-else
                  :key="`${col.prop || col.type || 'column'}-${i}`"
                  :label="col.label"
                  :width="col.width"
                  :min-width="col.minWidth"
                  :prop="col.prop"
                  :align="col.align ? col.align : 'center'"
                  show-overflow-tooltip
                >
                  <template #header><span v-html="getLabelCode(col)"> </span></template>
                  <template #default="scoped">
                    <div
                      class="cell-box"
                      :class="getCellBoxClass(scoped, col)"
                      @click.stop="handleCellClick(scoped, col)"
                    >
                      <template
                        v-if="
                          coordinate?.rowIndex === scoped.$index &&
                          scoped.cellIndex === coordinate?.cellIndex
                        "
                      >
                        <el-form-item
                          :prop="`${scoped.$index}.${col.prop}`"
                          :label-width="0"
                          :rules="getColumnRules(col, scoped)"
                        >
                          <dc-widget
                            v-model="scoped.row[col.prop]"
                            :data="col"
                            :dictMaps="dictMaps"
                            @change="
                              val => {
                                handleTableItemChange(val, scoped, col);
                              }
                            "
                          >
                          </dc-widget>
                        </el-form-item>
                      </template>
                      <template v-else>
                        <dc-view
                          v-if="['dc-select-user'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          objectName="user"
                        />
                        <dc-view
                          v-if="['wf-select-dialog', 'dc-select-dialog'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          :objectName="col.props.objectName"
                        />
                        <dc-dict-key
                          v-if="['dict'].includes(col.type)"
                          :value="scoped.row[col.prop]"
                          :options="dictMaps?.[col.dictKey]"
                        />
                        <span v-else>
                          {{
                            [undefined, null, '', ' '].includes(scoped.row[col.prop])
                              ? '-'
                              : scoped.row[col.prop]
                          }}
                        </span>
                      </template>
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
    <ConfirmWithCheckbox title="提示" ref="ConfirmWithCheckboxRef">
      <el-checkbox v-model="isPushErp" class="mt-2">
        <span class="tip">确认是否提交到erp</span>
      </el-checkbox>
    </ConfirmWithCheckbox>
  </basic-container>
</template>
<script>
import listEditPage from '@/mixins/list-edit-page';
import options from './list';
import ConfirmWithCheckbox from './ConfirmWithCheckbox.vue';
import { downloadFileBlobPromise } from '@/utils/util';
import Api from '@/api/index';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  components: { ConfirmWithCheckbox },
  mixins: [listEditPage],
  name: 'outsource-quotation-list',
  data() {
    return {
      // mode: 'model',
      // modelParams: {
      //   modelId: '1937686904528375810',
      //   datasourceId: '1879454467050659841',
      // },
      selectedRowIds: new Set(), // 存储所有选中行ID
      cachedRows: new Map(), // 缓存所有已加载行数据（key: fid,
      rowKey: 'fid',
      editRow: {},
      mockData: [
        {
          name: '转外协',
          releaseType: '采购申请类',
          releaseTypeId: 3,
          orderSplittingStatus: '3',
          releaseBillType: '外协采购申请',
          releaseBillTypeId: '610de64a07d75a',
        },
        {
          name: '转委外',
          releaseType: '委外订单类',
          releaseTypeId: 2,
          releaseBillType: '普通委外订单',
          orderSplittingStatus: '3',
          releaseBillTypeId: '93904bf745d84ae0ad08da30949754e0',
        },
        {
          name: '转自制',
          releaseType: '生产订单类',
          releaseTypeId: 1,
          orderSplittingStatus: '3',
          releaseBillType: '工序汇报入库-普通生产',
          releaseBillTypeId: '00232405fc58a68311e33257e9e17076',
        },
        {
          name: '转返工',
          releaseType: '生产返工类',
          releaseTypeId: 4,
          orderSplittingStatus: '3',
          releaseBillType: '工序汇报入库-返工生产',
          releaseBillTypeId: '61512b4487890c',
        },
      ],
      updataTable: [], //修改表格行的数据
      updataSelectRows: [],
      isPushErp: false,
    };
  },
  created() {
    this.columns = options().columns;
    this.initSearchConfig();
    this.queryParams.size = 9999;

    this.getDicts().then(res => {
      this.queryParams.orgList = '100006';
      this.addSearchConfig();
      this.getData();
    });
    // this.getDictsTYPE();
  },
  mounted() {},
  methods: {
    handleCellClickIndex(row, col) {
      if (col.type === 'selection') {
        this.$refs.tableRef.toggleRowSelection(row); // 切换行的选中状态
      }
    },
    handleSearch(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      };
      this.clearHandleTable();
      this.getData();
    },

    // 修改选择事件处理
    handleSelectionChange(selection) {
      console.log(selection);
      // this.updataSelectRows = selection;
      // 1. 更新选中ID集合
      this.selectedRowIds.clear();
      selection.forEach(row => {
        this.selectedRowIds.add(row.fid);
        // 2. 缓存当前页选中行数据
        this.cachedRows.set(row.fid, { ...row });
      });
      this.updataSelectRows = selection;
    },
    /** 获取列表数据 **/ getData() {
      this.loading = true;
      this.api.pdp.planOrder
        .getMrpSplitOrder(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            // 合并新数据与缓存数据
            this.tableData = data.records.map(row => {
              const cachedRow = this.cachedRows.get(row.fid);
              return cachedRow ? { ...row, ...cachedRow } : row;
            });
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },

    async doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'batchesPrint') {
        this.handleBatchesPrint();
      } else if (action === 'batchesBuild') {
        this.handleBatchesDow();
      } else if (action === 'submitErp') {
        this.handleSubmitErp();
      } else if (action === 'exportPage') {
        this.handleExportPage();
      } else if (action === 'viewBatches') {
        window.open(`https://www.eastwinbip.com/drawing/${row.materialCode}`, 'target');
      } else {
        // 根据 action 查找对应的配置项
        const matchedItem = this.mockData.find(
          item => item.releaseTypeId.toString() === action.toString()
        );
        if (matchedItem) {
          this.loading = true;
          // 1. 处理所有缓存的选中行
          Array.from(this.cachedRows.values())
            .filter(row => this.selectedRowIds.has(row.fid))
            .forEach(selectedRow => {
              // 更新行状态
              const fields = [
                'releaseType',
                'releaseTypeId',
                'releaseBillType',
                'orderSplittingStatus',
                'releaseBillTypeId',
              ];

              fields.forEach(field => {
                selectedRow[field] = matchedItem[field];
                // selectedRow[`$${field}`] = true;
              });
              // selectedRow.$edit = true;
              // 更新缓存
              this.cachedRows.set(selectedRow.fid, selectedRow);
            });

          // 2. 更新当前页显示
          this.tableData = this.tableData.map(row => {
            const cachedRow = this.cachedRows.get(row.fid);

            return cachedRow ? { ...row, ...cachedRow } : row;
          });

          // 3. 更新待提交数据
          this.updataTable = Array.from(this.cachedRows.values()).filter(item => item.$edit);
          this.loading = false;
        }
        // this.getDicts();
        // console.log(this.batchSelectRows);
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids,
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.system.OutsourceQuotation.remove
      );
    },
    // 处理批量打印
    handleBatchesPrint() {
      this.loading = true;
      const formData = Array.from(this.cachedRows.values()).filter(item =>
        this.updataSelectRows.some(row => row.fid === item.fid)
      );
      const items = formData.map(item => {
        return {
          pdfName: `${item.materialCode}${item.version || ''}`,
          pdfExplain: `计划跟踪号：${item.mtoNo}     确认订单量：${item.confirmedOrderQty}`,
        };
      });
      this.$axios
        .post('/pdf-printing/join', items)
        .then(res => {
          const { status, data } = res;
          if (data.lhs == null || data.lhs == '') {
            if (status === 200 && !!data.mergeName) {
              window.open(
                `https://www.eastwinbip.com/pdf-printing/print/${data.mergeName}`,
                'target'
              );
            }
          } else {
            ElMessageBox.alert(`未查询到${data.lhs}等打印信息`, {
              showClose: false,
              confirmButtonText: '确定',
              callback: () => {
                if (status === 200 && !!data.mergeName) {
                  window.open(
                    `https://www.eastwinbip.com/pdf-printing/print/${data.mergeName}`,
                    'target'
                  );
                }
              },
            });
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;

          console.log(err);
        });
    },
    // 处理批量打包
    handleBatchesDow() {
      this.loading = true;
      const formData = Array.from(this.cachedRows.values()).filter(item =>
        this.updataSelectRows.some(row => row.fid === item.fid)
      );
      const items = formData.map(item => `${item.materialCode}${item.version || ''}`);
      this.$axios
        .post('/pdf-printing/zip', items)
        .then(res => {
          const { status, data } = res;
          if (status === 200 && !!data.mergeName) {
            downloadFileBlobPromise(
              `https://www.eastwinbip.com/pdf-printing/zip-download/${data.mergeName}`,
              '-----'
            )
              .then(res => {
                this.loading = false;
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            this.loading = false;
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    handleTableItemChange(val, scoped, col) {
      const { row } = scoped;
      row[`$${col.prop}`] = true;
      row.$edit = true;
      // this.selectedRowIds.add(row.fid);
      // this.cachedRows.set(row.fid, { ...row });
      this.updataTable = Array.from(this.cachedRows.values()).filter(item => item.$edit);
    },
    // 导出当前页
    handleExportPage() {
      this.api.pdp.mmrPlanPhaseInfo.exportPage(this.queryParams);
    },
    handleSubmitErp() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          // this.loading = true;
          const formData = Array.from(this.cachedRows.values()).filter(item =>
            this.updataSelectRows.some(row => row.fid === item.fid)
          );
          console.log(formData);
          // console.log(this.cachedRows);

          // console.log(this.batchSelectRows);
          // console.log(this.updataSelectRows);
          // return;

          if (!formData.length) return;
          // this.getInvalidRows(this.updataSelectRows, this.columns).then(() => {
          this.$refs.ConfirmWithCheckboxRef.open()
            .then(() => {
              this.loading = true;
              this.api.pdp.planOrder
                .updateList(formData, { isPushErp: this.isPushErp })
                .then(res => {
                  const { code, data } = res.data;
                  if (code === 200) {
                    this.api.pdp.planOrder
                      .pusherpList(formData, { isPushErp: this.isPushErp })
                      .then(ress => {
                        // const { code, data } = ress.data;
                        this.$message.success('操作成功');
                        this.clearHandleTable();
                        this.isPushErp = false;
                        this.handleReset();
                      });
                  }
                  this.loading = false;
                })
                .catch(err => {
                  this.loading = false;
                  console.log(err);
                });
            })
            .catch(err => {
              this.isPushErp = false;
            });
          // });
        }
      });
    },

    //提交后清除状态
    clearHandleTable() {
      this.selectedRowIds.clear();
      this.cachedRows.clear();
      this.updataSelectRows = [];
      this.updataTable = [];
      this.batchSelectRows = [];
      this.$refs.tableRef?.clearSelection();
      // this.getData();
    },
    tableRowClassName({ row }) {
      if (row?.$edit) {
        return 'highlight-row';
      }
      return '';
    },
    setRowStyle({ row }) {
      if (row.rowColor) {
        return {
          backgroundColor: row.rowColor,
        };
      }
      return {}; // 没有颜色值时使用默认样式
    },
    // async getDictsTYPE() {
    //   try {
    //     const { data } = await this.useAsyncCache([{ key: 'DC_MRP_RELEASE_DOC_TYPE' }]);
    //     // this.dictMaps = res;
    //     console.log(data);
    //     this.dictMaps.DC_MRP_RELEASE_DOC_TYPE = data;
    //   } catch (error) {
    //     console.error('获取枚举失败', error);
    //   }
    // },

    getDicts() {
      return new Promise((resolve, reject) => {
        this.dictMaps.DC_MCC_STATUS = [
          {
            label: '已确认',
            dictKey: true,
          },
          {
            label: '未确认',
            dictKey: false,
          },
        ];

        this.dictMaps.DC_ORDER_SPLITE_STATUS = [
          {
            label: '未判定',
            dictKey: '1',
          },
          {
            label: '待判定',
            dictKey: '2',
          },
          {
            label: '已判定',
            dictKey: '3',
          },
        ];
        // this.useAsyncCache([{ key: 'DC_MRP_RELEASE_DOC_TYPE' }])
        //   .then(res => {
        //     this.dictMaps = {
        //       ...res.value,
        //       ...this.dictMaps,
        //     };
        //     console.log(res.value);
        //   })
        //   .catch(err => {});
        this.api.pdp.planOrder
          .getMrpOrderType()
          .then(res => {
            const { data, code } = res.data;
            if (code === 200) {
              this.dictMaps.DC_MRP_ORDER_TYPE = data;
              resolve();
            } else {
              reject();
            }
          })
          .catch(err => {
            reject();
          });
      });
    },
    addSearchConfig() {
      this.searchConfig.searchItemConfig.paramType = {
        orgList: {
          label: '采/生组织',
          type: 'wf-select-dialog',
          paramKey: 'orgList',
          searchIndex: 1,
          search: true,
          searchProps: {
            is: 'wf-select-dialog',
          },
          props: {
            objectName: 'org',
            multiple: true,
          },
        },
        mtoNo: {
          label: '计划跟踪号',
          type: 'input',
          paramKey: 'mtoNo',
          placeholder: `请输入计划跟踪号`,
        },
        mtoNos: {
          label: '多个计划跟踪号',
          type: 'input',
          width: 240,

          paramKey: 'mtoNos',
          placeholder: `请输入多个计划跟踪号`,
        },

        materialCode: {
          label: '物料编码',
          type: 'input',
          paramKey: 'materialCode',
          placeholder: `请输入物料编码`,
        },
        operationNo: {
          label: '运算编码',
          type: 'input',
          paramKey: 'operationNo',
          placeholder: `请输入运算编码`,
        },
        typeIds: {
          label: '单据投放类型',
          type: 'select',
          paramKey: 'typeIds',
          valueKey: 'dictKey',
          labelKey: 'dictValue',
          options: this.dictMaps?.DC_MRP_ORDER_TYPE || [],
          props: {
            placeholder: `请输入单据投放类型`,
            clearable: true,
          },
        },
        startCreateTime: {
          label: '开始创建时间',
          type: 'el-date-picker',
          paramKey: 'startCreateTime',
          props: {
            placeholder: `请选择开始创建时间`,
            format: 'YYYY-MM-DD',
            'value-format': 'YYYY-MM-DD',
            clearable: true,
          },
        },
        endCreateTime: {
          label: '结束创建时间',
          type: 'el-date-picker',
          paramKey: 'endCreateTime',
          props: {
            placeholder: `请选择结束创建时间`,
            format: 'YYYY-MM-DD',
            'value-format': 'YYYY-MM-DD',
            clearable: true,
          },
        },
        mccQuery: {
          label: '物控确认',
          type: 'select',
          paramKey: 'mccQuery',
          valueKey: 'dictKey',
          labelKey: 'label',
          options: this.dictMaps?.DC_MCC_STATUS || [],
        },
        orderSplittingStatus: {
          label: '判定状态',
          type: 'select',
          paramKey: 'orderSplittingStatus',
          labelKey: 'label',
          valueKey: 'dictKey',

          options: this.dictMaps?.DC_ORDER_SPLITE_STATUS || [],
          // search: true,
          // searchProps: {
          //   is: 'el-input',
          // },
        },
        // orgList: {
        //   label: '采/生组织',
        //   type: 'wf-select-dialog',
        //   paramKey: 'orgList',
        //   props: {
        //     objectName: 'org',
        //     multiple: true,
        //   },
        // },
      };
    },
  },
};
</script>
<style>
/* 定义不同状态的行样式 */
/* .el-table .warning-row {
  background-color: #fff2f0;
} */
</style>
<style lang="scss" scoped>
.page-processing-outsourcing {
  .action-banner {
    padding: 8px 0;
    display: flex;
    justify-content: space-between;
    flex-flow: row wrap;
    width: 100%;
  }
  :deep(.form-main) {
    width: 100%;
    height: 100%;
  }
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 6px;
      padding-bottom: 0;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
:deep(.label-suffix) {
  color: #f56c6c;
}
:deep(.el-table) {
  .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }
}
:deep(.highlight-row) {
  background-color: var(--el-table-row-active-bg-color); /* 浅绿色背景 */
}

.tip {
  color: red;
  font-size: 16px;
}
</style>
