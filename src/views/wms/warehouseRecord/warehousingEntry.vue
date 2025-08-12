<template>
  <div class="list-page warehousing-entry-list-page">
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
        type="primary"
        icon="Plus"
        v-permission="{ id: 'DC_WAREHOUSING_ENTRY_ADD' }"
        @click="doAction('add')"
        >新增</el-button
      >
    </div>

    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @row-dblclick="
          row => {
            doAction('row-dblclick', row);
          }
        "
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
                v-permission="col?.permission && col.permission(scoped)"
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
</template>
<script>
import { mapGetters } from 'vuex';
import options from './warehousingEntry.js';
import Api from '@/api/index';
import listPage from '@/mixins/list-page';

export default {
  mixins: [listPage],
  name: 'warehousing-entry-list',
  data() {
    return {
      mode: 'customize',
      loading: false,
      queryParams: {
        current: 1,
        size: 10,
        processDefinitionName: '',
        processDefinitionKey: '',
        serialNumber: '',
        category: '',
        startUsername: '',
        taskType: '待办',
      },
      tableData: [],
      total: 0,
      bpmnVisible: false,
      bpmnOption: {},
    };
  },
  computed: {
    ...mapGetters(['permission']),
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.getData();
    });
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.wms.warehousingEntry
        .list(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
            this.queryParams.current = data.current;
            this.queryParams.size = data.size;
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
      if (action === 'edit') {
        this.$router.push({
          name: '入库提交',
          params: { id: row.id },
        });
      } else if (action === 'add') {
        this.$router.push({
          name: '入库提交',
          params: { id: 'create' },
        });
      } else if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.id));
      } else if (action === 'delete') {
        this.deleteData([scope.row.id]);
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids,
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        Api.wms.warehousingEntry.remove
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.warehousing-entry-list-page {
}
</style>
