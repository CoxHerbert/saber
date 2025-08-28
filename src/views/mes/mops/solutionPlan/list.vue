<template>
  <div class="list-page solution-plan-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <el-button
        icon="Postcard"
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('batchPdfView')"
        >工艺卡</el-button
      >
      <el-button
        icon="Postcard"
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('materialLabel')"
        >物料标签</el-button
      >
      <el-button
        v-if="['DC_MOPS_PROCESS_STATUS_DXD'].includes(queryParams.workStatus)"
        icon="Position"
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('push-erp')"
        >ERP下达</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="entryId"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        border
      >
        <!-- 多选 -->
        <el-table-column type="selection" align="center" width="40" />
        <!-- 序号类型 -->
        <el-table-column label="序号" align="center" width="55">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <template v-for="(col, i) in columns" :key="i">
          <el-table-column
            :label="col.label"
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
        <el-table-column label="工单进度条" align="center" width="350">
          <template #default="scoped">
            <div class="progress-wrap" v-drag-scroll="'.progress-wrap'">
              <workOrderProgress :nodes="scoped.row.processList" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :key="'option' + i"
          :fixed="action.fixed"
          :label="action.label"
          :width="action.width ? action.width : 180"
          :min-width="action.minWidth"
          :align="action.align ? action.align : 'center'"
        >
          <template #default="scoped">
            <el-button
              v-for="(btn, j) in action.children"
              :key="j"
              link
              v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
              type="primary"
              @click="doAction(btn.action, scoped)"
              >{{ btn.label }}</el-button
            >
          </template>
        </el-table-column>
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
  <materialLabelDialog ref="materialLabelDialogRef" />
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
import materialLabelDialog from './cpns/materialLabelDialog.vue';
import workOrderProgress from './cpns/workOrderProgress.vue';
import BigNumber from 'bignumber.js';

export default {
  mixins: [listPage],
  components: { materialLabelDialog, workOrderProgress },
  name: 'solution-plan-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
      action: {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 240,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
            showFunc(scope) {
              return ['DC_MOPS_PROCESS_STATUS_DXD'].includes(scope.row.workStatus);
            },
          },
          {
            type: 'button',
            label: '工艺卡',
            action: 'pdfView',
          },
          {
            type: 'button',
            label: '取消计划',
            action: 'delete',
            showFunc(scope) {
              return ['DC_MOPS_PROCESS_STATUS_DXD'].includes(scope.row.workStatus);
            },
          },
          {
            type: 'button',
            label: '图纸',
            action: 'row-drawe',
          },
        ],
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.dictMaps.isPrintDict = [
        {
          dictValue: '已打印',
          dictKey: true,
        },
        {
          dictValue: '未打印',
          dictKey: false,
        },
      ];
      this.initSearchConfig();
      this.searchConfig.searchItemConfig.paramType.isPrint = {
        label: '是否打印',
        type: 'select',
        options: [
          {
            dictValue: '已打印',
            dictKey: true,
          },
          {
            dictValue: '未打印',
            dictKey: false,
          },
        ],
        labelKey: 'dictValue',
        placeholder: `请选择是否打印`,
        valueKey: 'dictKey', // 'id', // 'dictKey',
        paramKey: 'isPrint',
      };
      this.searchConfig.resetExcludeKeys = ['page', 'current', 'workStatus'];

      this.searchConfig.tabConfig = {
        prop: 'workStatus',
        items: [
          { label: '全部', value: '' },
          ...this.dictMaps.DC_MOPS_PROCESS_STATUS.map(item => ({
            label: item.dictValue,
            value: item.dictKey,
          })),
        ],
      };
      this.queryParams.workStatus = 'DC_MOPS_PROCESS_STATUS_DXD';
      this.getData();
    });
  },
  mounted() {},
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.mes.mops
        .getSolutionPlan(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records.map((row, i) => {
              return {
                ...row,
                processList: row.processList.map((process, j) => {
                  const { percent } = process;
                  const len = row.processList.length;
                  return {
                    ...process,
                    props: {
                      is: 'el-progress',
                      type: 'circle',
                      percentage: new BigNumber(percent).toNumber(),
                      width: 40,
                      'stroke-width': 3,
                      'show-text': true,
                      color: j === len - 1 ? '#f26c0c' : '#4dc799',
                    },
                  };
                }),
              };
            });
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'materialLabel') {
        const ids = this.batchSelectRows.map(item => item.entryId).join(',');
        this.$refs.materialLabelDialogRef.openDialog(ids);
      } else if (action === 'batchPdfView') {
        const ids = this.batchSelectRows.map(item => item.entryId).join(',');
        window.open(`${this.pdfViewURL}?entryIds=${ids}`, 'target');
      } else if (action === 'delete') {
        this.deleteData([scope.row.entryId]);
      } else if (action === 'edit') {
        this.$router.push({
          path: '/mes/mops/solutionPlan/addOrEdit',
          query: {
            type: 'edit',
            id: row.entryId,
            parentMenuId: '1942860346571812865',
          },
        });
      } else if (action === 'pdfView') {
        window.open(`${this.pdfViewURL}?entryIds=${scope.row.entryId}`, 'target');
      } else if (action === 'row-drawe') {
        window.open(`https://www.eastwinbip.com/drawing/${row.materialNumber}`, 'target');
      } else if (action === 'push-erp') {
        this.handlePushErp();
      }
    },
    handlePushErp() {
      const billNos = this.batchSelectRows.map(item => item.billNo).join(',');
      const ids = this.batchSelectRows.map(item => item.id);
      this.$confirm(`确定将单据编号为‘${billNos}’下达ERP吗?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true;
          return this.api.mes.mops.updateRrpStatus(ids);
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.handleReset();
            this.$message.success('操作成功！');
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.mes.mops.deleteMoPlan
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.solution-plan-list-page {
  .progress-wrap {
    padding-top: 2px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    user-select: none;
    cursor: grab;

    &.is-grabbing {
      cursor: grabbing;
    }

    // 你的滚动条样式
    &::-webkit-scrollbar {
      height: 2px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 4px;
    }
    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.3);
      }
      &::-webkit-scrollbar-track {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
