<template>
  <div class="list-page review-item-config-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <el-button type="primary" icon="Printer" @click="doAction('print')">打印</el-button>
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
              <template v-if="col.type === 'rowText'">
                <template v-if="col?.transVal">
                  {{ col?.transVal(scoped) }}
                </template>
                <template v-else>
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
                  }}
                </template>
              </template>
              <dc-view
                v-else-if="col.type === 'dc-view'"
                v-model="scoped.row[col.prop]"
                :objectName="col.objectName"
                :showKey="col.showKey"
              />
              <template v-else-if="col.type === 'dict'">
                <dc-dict
                  v-if="dictMaps[col.dictKey]"
                  type="text"
                  :options="dictMaps[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict>
                <span v-else>-</span>
              </template>
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
import listPage from '@/mixins/list-page';
import options from './list.js';
import Api from '@/api/index';

export default {
  mixins: [listPage],
  name: 'process-technology-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
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
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.system.labelPrint
        .getList(this.queryParams)
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
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'print') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要打印的数据');
          return;
        }
        const ids = this.batchSelectRows.map(item => item.id);
        window.open(`/api/blade-bip/skip-url/dc/scm/order/get-pdf-with-api?ids=${ids}`, 'target');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.list-page {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
}
</style>
