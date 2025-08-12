<template>
  <el-drawer
    class="his-drawer"
    v-model="dialogVisible"
    size="1000"
    :title="title"
    @close="doAction('close')"
    v-loading="loading"
  >
    <div class="list-page edit-list-page">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button type="primary" :disabled="batchActionDisabled" @click="doAction('batchFinish')"
          >批量完成</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          row-key="id"
          @select="handleSelect"
          @select-all="handleSelectAll"
          @selection-change="handleSelectionChange"
        >
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
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
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                  type="primary"
                  @click="doAction(btn.action, scoped)"
                  >{{ btn.label }}</el-button
                >
              </template>
            </el-table-column>
            <el-table-column
              v-else
              :key="col.type + i"
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
  </el-drawer>
</template>
<script>
import Api from '@/api/index';
import listPage from '@/mixins/list-page';
import options from './etdListUtils';
export default {
  emits: ['success'],
  name: 'etd-list-drawer',
  mixins: [listPage],
  data() {
    return {
      loading: true,
      dialogVisible: false,
      title: 'ETD完成',
      queryParams: {
        current: 1,
        size: 20,
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.initSearchConfig();
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog() {
      this.dialogVisible = true;
      this.getData();
    },
    getData() {
      this.loading = true;
      Api.mps.mo
        .getEtdList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    /** 页面操作 **/
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'close') {
        this.dialogVisible = false;
        this.tableData = [];
        this.total = 0;
      } else if (action === 'batchFinish') {
        const ids = this.batchSelectRows.map(item => item.id).join(',');
        const billNumberList = this.batchSelectRows.map(item => item.billNumber).join(',');
        this.handleSubmit(ids, billNumberList);
      } else if (action === 'finish') {
        const ids = row.id;
        const billNumberList = row.billNumber;
        this.handleSubmit(ids, billNumberList);
      }
    },
    /** 处理提交 **/
    handleSubmit(ids, billNumberList) {
      this.$confirm(`确认是否将单据编号为"${billNumberList}"的单据提交完成？`)
        .then(() => {
          this.loading = true;
          Api.mps.mo
            .completePlan({ planIds: ids })
            .then(res => {
              const { code } = res.data;
              if (code === 200) {
                this.doAction('close');
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
            });
        })
        .catch(err => {});
    },
  },
};
</script>

<style lang="scss">
.his-drawer {
  .el-drawer__body {
    padding: 10px;
  }
  .el-radio__label {
    width: calc(100% - 30px);
  }
  .create-time {
    margin-bottom: 5px;
    font-size: 14px;
  }
}
</style>
