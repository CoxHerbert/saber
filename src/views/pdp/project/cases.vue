<template>
  <div class="list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <!-- <el-button
          icon="Upload"
          type="warning"
          :disabled="!updataTable.length > 0"
          @click="doAction('submitErp')"
          >提交共{{ updataTable.length }}条</el-button
        > -->
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :row-key="rowKey || 'id'"
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
          />
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
            v-else-if="col.type === 'moreHead'"
            :fixed="col.fixed"
            :label="col.label"
            :width="col.width ? col.width : 180"
            :min-width="col.minWidth"
            :align="col.align ? col.align : 'center'"
          >
            <template #default="scoped">
              <el-table-column
                v-for="(child, childIdx) in col.children"
                :key="childIdx"
                :type="child.type"
                :width="child.width"
                :label="child.label"
                :prop="child.prop"
                :align="child.align || 'center'"
                :fixed="child.fixed"
                :selectable="child.selectable"
              >
                <template #default="scoped">
                  <span>
                    {{
                      [undefined, null, '', ' '].includes(scoped.row[col.prop])
                        ? '-'
                        : scoped.row[col.prop]
                    }}
                  </span>
                </template>
              </el-table-column>
              <!-- <el-button
                      v-for="(btn, j) in col.children"
                      :key="j"
                      link
                      v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped, queryParams))"
                      type="primary"
                      @click="doAction(btn.action, scoped)"
                      >{{ btn.label }}</el-button
                    > -->
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
          <template v-else-if="col.prop === 'dcPdpFuncFieldList'">
            <template v-for="(c, j) in cols" :key="j">
              <template v-if="c.remark">
                <el-table-column
                  :label="`${c.label}组`"
                  show-overflow-tooltip
                  min-width="120px"
                  align="center"
                >
                  <template #default="scoped">
                    <dc-view
                      :modelValue="
                        scoped.row.dcPdpFuncFieldList.find(f => f.filedKey === c.prop)?.remark
                      "
                      objectName="workGroup"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  :label="c.label || c.prop"
                  show-overflow-tooltip
                  min-width="120px"
                  align="center"
                >
                  <template #default="scoped">
                    <dc-view
                      :modelValue="
                        scoped.row.dcPdpFuncFieldList.find(f => f.filedKey === c.prop)?.bindUserIds
                      "
                      objectName="user"
                      showKey="realName"
                    />
                  </template>
                </el-table-column>
              </template>
              <template v-else>
                <el-table-column :label="c.label || c.prop" show-overflow-tooltip min-width="120px">
                  <template #default="scoped">
                    <dc-view
                      :modelValue="
                        scoped.row.dcPdpFuncFieldList.find(f => f.filedKey === c.prop)?.bindUserIds
                      "
                      objectName="user"
                      showKey="realName"
                    />
                  </template>
                </el-table-column>
              </template>
            </template>
          </template>
          <el-table-column
            v-else
            :key="col.type + i"
            :label="col.label"
            :fixed="col.fixed"
            :width="col.width"
            :min-width="col.minWidth"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-field-view
                :value="col?.transVal ? col?.transVal(scoped, treeData) : scoped.row[col.prop]"
                :data="col"
                :dictMaps="dictMaps"
              />
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>
</template>
<script>
import lisPage from '@/mixins/list-page';
import options from './cases';
// import ConfirmWithCheckbox from './ConfirmWithCheckbox.vue';
import Api from '@/api/index';
export default {
  // components: { ConfirmWithCheckbox },
  mixins: [lisPage],
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
      // mockData: [
      //   {
      //     name: '转外协',
      //     releaseType: '采购申请类',
      //     releaseTypeId: 3,
      //     orderSplittingStatus: '3',
      //     releaseBillType: '外协采购申请',
      //     releaseBillTypeId: '610de64a07d75a',
      //   },
      //   {
      //     name: '转委外',
      //     releaseType: '委外订单类',
      //     releaseTypeId: 2,
      //     releaseBillType: '普通委外订单',
      //     orderSplittingStatus: '3',
      //     releaseBillTypeId: '93904bf745d84ae0ad08da30949754e0',
      //   },
      //   {
      //     name: '转自制',
      //     releaseType: '生产订单类',
      //     releaseTypeId: 1,
      //     orderSplittingStatus: '3',
      //     releaseBillType: '工序汇报入库-普通生产',
      //     releaseBillTypeId: '00232405fc58a68311e33257e9e17076',
      //   },
      // ],
      updataTable: [], //修改表格行的数据
      isPushErp: false,
      cols: [
        { label: '机构DRI', prop: 'DC_PMS_PROJECT_ROLE_JGDRI', remark: '' },
        { label: '电气DRI', prop: 'DC_PMS_PROJECT_ROLE_DQDRI', remark: '' },
        { label: '软件DRI', prop: 'DC_PMS_PROJECT_ROLE_RJDRI', remark: '' },
        { label: 'BDDRI', prop: 'DC_PMS_PROJECT_ROLE_BDDRI', remark: '' },
        { label: 'TPMDRI', prop: 'DC_PMS_PROJECT_ROLE_TPMDRI', remark: '' },
        { label: '视觉DRI', prop: 'DC_PMS_PROJECT_ROLE_SJDRI', remark: '' },
        { label: 'PQEDRI', prop: 'DC_PMS_PROJECT_ROLE_PQEDRI', remark: '' },
        { label: 'IPQCDRI', prop: 'DC_PMS_PROJECT_ROLE_IPQCDRI', remark: '' },
        { label: 'FAEDRI', prop: 'DC_PMS_PROJECT_ROLE_FAEDRI', remark: '' },
        { label: 'OPMDRI', prop: 'DC_PMS_PROJECT_ROLE_OPMDRI', remark: '' },
        { label: 'PC', prop: 'DC_PMS_PROJECT_ROLE_PC', remark: '' },
        {
          label: '机构组装',
          prop: 'DC_PMS_PROJECT_ROLE_JGZZ',
          remark: { type: 'dept', value: 'mechanicalAssembleGroupId' },
        },
        {
          label: '电气组装',
          prop: 'DC_PMS_PROJECT_ROLE_DQZZ',
          remark: { type: 'dept', value: 'electricalAssembleGroupId' },
        },
        {
          label: '线材',
          prop: 'DC_PMS_PROJECT_ROLE_XC',
          remark: { type: 'dept', value: 'wireGroupId' },
        },
        { label: 'PQA', prop: 'DC_PMS_PROJECT_ROLE_PQA', remark: '' },
        { label: 'PMC', prop: 'DC_PMS_PROJECT_ROLE_PMC', remark: '' },
        { label: '运营跟单', prop: 'DC_PMS_PROJECT_ROLE_GD', remark: '' },
      ],
    };
  },
  created() {
    this.columns = options().columns;
    this.initSearchConfig();

    this.getDicts().then(res => {
      // this.addSearchConfig();
    });
    this.dictKeys = [{ key: 'DC_PMS_PROJECT_ROLE' }];
    this.getDictData().then(res => {});
    // this.getDictsTYPE();
  },
  mounted() {
    this.getData();
  },
  methods: {
    // 表头样式（重点：多级表头背景色）
    handleHeaderStyle({ row, column, rowIndex, columnIndex }) {
      const baseStyle = {
        'font-weight': 'bold',
        'text-align': 'center',
        'border-right': '1px solid #eee',
        'white-space': 'nowrap', // 防止表头文字换行
      };
      // 一级表头（最外层）
      if (rowIndex === 0) {
        return {
          ...baseStyle,
        };
      }
      // 二级表头（嵌套层）
      else if (rowIndex === 1) {
        return {
          ...baseStyle,
          'background-color': '#E8F3FF !important',
          color: '#333 !important',
        };
      }
      return baseStyle;
    },

    /** 获取列表数据 **/ getData() {
      this.loading = true;
      this.api.pdp.planOrder
        .deliveredList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            // 合并新数据与缓存数据
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    getDynamicsColumns() {
      const mapSet = {};
      this.tableData?.forEach(col => {
        col.dcPdpFuncFieldList?.forEach(r => {
          const find = this.dictMaps.DC_PMS_PROJECT_ROLE?.find(dict => {
            return dict.dictKey === r.filedKey;
          });
          try {
            find['remark'] = JSON.parse(find.remark);
          } catch (error) {
            console.log(error);
          }
          mapSet[r.filedKey] = {
            label: find?.dictValue,
            prop: r.filedKey,
            remark: find.remark,
          };
        });
      });
      console.log(JSON.stringify(Object.values(mapSet)));
      return;
    },
    async doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'submitErp') {
        this.handleSubmitErp();
      } else if (action === 'viewBatches') {
        window.open(`https://www.eastwinbip.com/drawing/${row.materialCode}`, 'target');
      } else if (action === 'row-click') {
        // 处理行点击
        this.$router.push(`/pdp/project/case/${row.projectId}/${row.id}`);
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
    handleTableItemChange(val, scoped, col) {
      const { row } = scoped;
      row[`$${col.prop}`] = true;
      row.$edit = true;
      // this.selectedRowIds.add(row.fid);
      // this.cachedRows.set(row.fid, { ...row });
      // this.updataTable = Array.from(this.cachedRows.values()).filter(item => item.$edit);
    },
    handleSubmitErp() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          // this.loading = true;
          const formData = this.tableData.filter(item => item.$edit);
          console.log(formData);
          if (!formData.length) return;
          this.getInvalidRows(formData, this.columns).then(() => {
            this.$refs.ConfirmWithCheckboxRef.open()
              .then(() => {
                this.loading = true;
                this.api.pdp.planOrder
                  .updateList(formData, { isPushErp: this.isPushErp })
                  .then(res => {
                    const { code, data } = res.data;
                    if (code === 200) {
                      console.log(12121);
                      this.$message.success('操作成功');
                      // this.clearHandleTable();
                      this.isPushErp = false;
                      this.handleReset();
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
          });
        }
      });
    },

    // //提交后清除状态
    // clearHandleTable() {
    //   this.selectedRowIds.clear();
    //   this.cachedRows.clear();
    //   this.updataTable = [];
    //   this.$refs.tableRef?.clearSelection();
    //   // this.getData();
    // },
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
        mtoNo: {
          label: '计划跟踪号',
          type: 'input',
          paramKey: 'mtoNo',
          placeholder: `请输入计划跟踪号`,
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
        orgList: {
          label: '采/生组织',
          type: 'wf-select-dialog',
          paramKey: 'orgList',
          props: {
            objectName: 'org',
            multiple: true,
          },
        },
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

.tip {
  color: red;
  font-size: 16px;
}
</style>
