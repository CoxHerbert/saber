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
      <el-button icon="Plus" type="primary" style="margin-right: 16px" @click="handleInitiate()"
        >新增</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="dataList"
        row-key="id"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @row-dblclick="row => doAction('dblclick', row)"
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
          <!-- 普通文字类型 -->
          <el-table-column
            v-else-if="col.type === 'rowText'"
            :key="'rowText' + i"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{
                [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
              }}
            </template>
          </el-table-column>
          <!-- 人员类型 -->
          <el-table-column
            v-else-if="col.type === 'dc-view'"
            :key="'dc-view' + i"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align ? col.align : 'center'"
            prop="purchaserId"
          >
            <template #default="scoped">
              <dc-view
                v-model="scoped.row[col.prop]"
                :objectName="col.objectName"
                :showKey="col.showKey"
              />
            </template>
          </el-table-column>
          <!-- 字典类型 -->
          <el-table-column
            v-else-if="col.type === 'dict'"
            :key="'dict' + i"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-dict
                v-if="pageData[col.dictKey]"
                type="text"
                :options="pageData[col.dictKey]"
                :value="scoped.row[col.prop]"
              ></dc-dict>
              <span v-else>-</span>
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
import Api from '@/api/index';
import getOptions from './list';
import listPage from '@/mixins/list-page';

export default {
  name: 'inquiryList',
  mixins: [listPage],
  data() {
    const options = getOptions();
    return {
      // 页面数据
      columns: options.columns,
      queryParams: {
        current: 1,
        size: 10,
      },
      batchSelectRows: [],
      dataList: [],
      loading: true,
      total: 0,
      title: '',
      rules: {},
      applyStatus: '',
    };
  },
  created() {
    this.initSearchConfig();
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        // 使用当前的查询参数
        const params = { ...this.queryParams };
        const res = await Api.system.OutsourceQuotation.queryQtList(params);
        const { code, data } = res.data || {};
        if (code === 200 && data) {
          this.dataList = data.records || [];
          this.total = data.total || 0;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    /** 操作 */
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'batchDelete') {
        if (!this.batchSelectRows || this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(r => r.id));
      } else if (action === 'delete') {
        if (row && row.id) {
          this.deleteData([row.id]);
        }
      } else if (action === 'dblclick') {
        this.$router.push({
          path: '/mes/wireManage/wireBOM/addOrEdit',
          query: {
            type: 'look',
            parentMenuId: '1930803216767066114',
            id: scope.id,
          },
        });
      }
    },

    /** 搜索按钮操作 */
    handleSearch(params = {}) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      };
      this.getData();
    },

    /** 删除（按需对接你的接口） */
    async deleteData(ids = []) {
      try {
        if (!ids.length) return;
        this.$message.success('删除成功');
        this.getData();
      } catch (e) {
        console.error(e);
        this.$message.error('删除失败');
      }
    },
  },
};
</script>
