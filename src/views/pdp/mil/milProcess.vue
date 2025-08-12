<template>
  <basic-container>
    <div class="content-warp page-processing-outsourcing">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button icon="Plus" type="primary" @click="doAction('add')">新增</el-button>
      </div>
      <!-- 
         lazy
            :load="loadChildren"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            :checkStrictly="true"
        -->
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          row-key="id"
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
            <el-table-column
              v-else-if="col?.transVal"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ col?.transVal(scoped) }}
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
  </basic-container>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './mil-process.js';
import exForm from '@/views/plugin/workflow/mixins/ex-form';
import Api from '@/api/index';

export default {
  mixins: [listPage, exForm],
  name: 'mil-process-list-page',
  data() {
    return {
      mode: 'customize',
      columns: options().columns,
    };
  },
  created() {
    if (this.mode === 'customize') {
      this.handleDictKeys();
      this.getDictData().then(() => {
        this.initSearchConfig();
      });
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.pdp.milProcess
        .list(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          ths.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'look') {
        this.handleDynamicRoute(row);
      } else if (action === 'add') {
        this.handleClickProcessItem();
      }
    },
    async handleClickProcessItem() {
      const params = {
        processKey: 'mil_process_v2',
      };
      const res = await Api.pdp.settled.processForm(params);
      const { code, data } = res.data;
      if (code === 200) {
        this.$router.push(
          `/workflow/process/start/${data.enCode}?parentMenuId=1892114945981734913`
        );
      }
    },
    handleDynamicRoute(row) {
      this.loading = true;
      this.api.pdp.milProcess
        .getProcessTaskV2({ processId: row.processId })
        .then(res => {
          const { data, code } = res.data;
          if (code === 200) {
            this.dynamicRoute(
              {
                processId: row.processId,
                taskId: data,
                parentMenuId: '1892114945981734913',
              },
              'detail'
            );
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.page-processing-outsourcing {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
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
</style>
