<template>
  <div class="list-page my-process-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="content-box">
      <div class="tree-container">
        <el-tree :data="treeData" @node-click="nodeClick" node-key="id">
          <template #default="{ data }">
            <div
              class="default-node"
              :class="{
                'is-active': data.id === queryParams.category,
              }"
            >
              {{ data.name }}
            </div>
          </template>
        </el-tree>
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
    </div>

    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>
  <el-dialog
    v-model="bpmnVisible"
    append-to-body
    destroy-on-close
    title="流程图"
    width="70%"
    class="nf-dialog"
  >
    <nf-design ref="bpmn" style="height: 60vh" :options="bpmnOption"></nf-design>
  </el-dialog>
  <feasibilityDrawer ref="feasibilityDrawerRef" @close="handleQuery"></feasibilityDrawer>
</template>
<script>
import { mapGetters } from 'vuex';
import options from './my-process.js';
import Api from '@/api/index';
import exForm from './../plugin/workflow/mixins/ex-form';
import listPage from '@/mixins/list-page';
import { todoList as getList, detail } from './../plugin/workflow/api/process/process';
import feasibilityDrawer from '@/views/plugin/workflow/pages/process/desk/components/feasibilityDrawer.vue';

export default {
  mixins: [listPage, exForm],
  name: 'my-process-list',
  components: { feasibilityDrawer },
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
      treeData: [],
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
      this.searchConfig.resetExcludeKeys = ['page', 'current', 'taskType'];

      this.searchConfig.tabConfig = {
        prop: 'taskType',
        items: [
          { label: '全部', value: '全部' },
          { label: '待办', value: '待办' },
          { label: '已办', value: '已办' },
          { label: '我发起的', value: '我发起的' },
        ],
      };
      console.log(this.searchConfig);
    });
  },
  mounted() {
    if (this.$route.query?.taskType) {
      this.queryParams.taskType = this.$route.query.taskType;
    }
    this.getData();
    this.getTree();
    const taskId = this.$route.query.taskId;
    if (taskId) {
      getList(1, 1, { taskId }).then(res => {
        const row = Array.isArray(res.data.data.records) ? res.data.data.records[0] : {};
        this.handleDynamicRoute(row);
      });
    }
  },
  methods: {
    handleRowDblClick(row) {
      this.handleDynamicRoute(row, 'detail');
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      getList(this.queryParams.current, this.queryParams.size, this.queryParams)
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
    getTree() {
      Api.desk.design.getDesignCategoryTree().then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          this.treeData = data;
        }
      });
    },
    nodeClick(data) {
      this.queryParams.category = data.id;
      this.handleSearch();
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'detail') {
        this.handleDynamicRoute(row, 'detail');
      } else if (action === 'flow') {
        this.handleFlow(row);
      }
    },
    handleDynamicRoute(row) {
      if (row.processDefinitionKey === 'feasibilityAsessment') {
        this.$refs.feasibilityDrawerRef.openDrawer({
          taskId: row.taskId,
          processInsId: row.processInstanceId || row.processId,
        });
      } else {
        this.dynamicRoute({ ...row, parentMenuId: '1850015570893836289' }, 'detail');
      }
    },
    handleFlow(row) {
      const { taskId, processInstanceId } = row;
      detail({ taskId, processInsId: processInstanceId }).then(res => {
        const { process, flow } = res.data.data;
        this.bpmnOption = {
          mode: 'view',
          xml: process.xml,
          flows: this.handleResolveFlows(flow),
        };
        this.bpmnVisible = true;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.my-process-list-page {
  .content-box {
    margin-bottom: 8px;
    flex: 1;
    overflow: hidden;
    display: flex;
    .tree-container {
      margin-right: 8px;
      width: 160px;
      overflow: auto;
      .is-active {
        color: #f26c0c !important;
      }
    }
    .table-container {
      flex: 1;
      overflow: hidden;
      :deep(.el-table) {
        height: 100%;
      }
    }
  }
}
</style>
