<template>
  <basic-container>
    <div class="content-warp page-quality-inspection-bind-index">
      <!-- 出库单 -->
      <div class="header">
        <div class="title">
          <!-- <el-tabs v-model="applyStatus" @tab-click="handleClick">
            <el-tab-pane label="未指派" name="未指派"></el-tab-pane>
            <el-tab-pane label="已指派" name="已指派"></el-tab-pane>
            <el-tab-pane label="已出货" name="已出货"></el-tab-pane>
            <el-tab-pane label="完工" name="完工"></el-tab-pane>
          </el-tabs> -->
        </div>
        <div class="search-area">
          <dc-search-group :config="searchConfig" @search="handleSearch">
            <template #default="scoped">
              <div class="search-select-box">
                <dc-select
                  v-if="scoped.item.type === 'dc-select'"
                  v-bind="scoped.item.props"
                  @change="
                    val => {
                      handleSearchItemChange(scoped, val);
                    }
                  "
                />
                <dc-select-user
                  v-else-if="scoped.item.type === 'dc-select-user'"
                  v-bind="scoped.item.props"
                  @change="
                    val => {
                      handleSearchItemChange(scoped, val);
                    }
                  "
                />
              </div>
            </template>
          </dc-search-group>
        </div>
      </div>
      <!-- <div class="action-banner">
        <el-button type="primary" @click="doAction('add')">新增</el-button>
      </div> -->
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
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
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ scoped.row[col.prop] || '-' }}
              </template>
            </el-table-column>
            <!-- 自定义文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowCustomText'"
              :key="'rowCustomText' + i"
              :label="col.label"
              :width="col.width"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <span v-html="col.render(scoped)"></span>
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :key="'dc-view' + i"
              :label="col.label"
              :width="col.width"
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
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
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <!-- {{ dictCache[col.dictKey].value }} -->
                <dc-dict-key
                  :value="scoped.row[col.prop]"
                  :options="dictCache[col.dictKey].value"
                />
              </template>
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
                  type="primary"
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))"
                  v-permission="
                    !btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))
                      ? { id: btn.permissionId, row: scoped.row }
                      : undefined
                  "
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
      <AddEditeDialog ref="addEditeDialogRef" @success="getData" />
    </div>
  </basic-container>
</template>
<script setup name="ApprovNodeConfig">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import options from './utils';
import { useRouter } from 'vue-router';
import AddEditeDialog from './addEditeDialog.vue';
const { proxy } = getCurrentInstance();
const router = useRouter();
const addEditeDialogRef = ref(null);
const data = reactive({
  columns: options.columns,
  queryParams: {
    keyword: '',
    current: 1,
    size: 20,
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  applyStatus: '未指派',
});

// const dictCache = proxy.useCache([{ key: 'DC_MES_MPS_SCHEDULE_STATUS' }]);

// const { DC_MES_MPS_SCHEDULE_STATUS } = dictCache;

const { batchDelete, queryParams, dataList, loading, total, applyStatus, columns } = toRefs(data);
const searchConfig = ref({
  paramType: {
    nodeName: {
      label: '审批节点名称',
      type: 'input',
      placeholder: '请输入审批节点名称',
      paramKey: 'nodeName',
    },
    nodeCode: {
      label: '审批节点编码',
      type: 'input',
      placeholder: '请输入审批节点编码',
      paramKey: 'nodeCode',
    },
    // orgId: {
    //   label: '组织',
    //   type: 'dc-select',
    //   paramKey: 'orgId',
    //   props: {
    //     objectName: 'org',
    //     placeholder: '请选择组织',
    //     clearable: true,
    //   },
    //   clear(queryParams) {
    //     queryParams.value.orgId = null;
    //     queryParams.value.orgName = null;
    //   },
    //   getLabelValue(queryParams) {
    //     if (queryParams.orgName) {
    //       return `组织：${queryParams.orgName}`;
    //     }
    //     return null;
    //   },
    // },
  },
});
onMounted(() => {
  getData();
});

// 点击tab
const handleClick = e => {
  queryParams.value = {
    current: 1,
    size: 20,
    type: e.props.name,
  };
  nextTick(() => {
    getData();
  });
};

// /** 导出数据 */
// const handleClickExport = () => {
//   console.log('handleClickExport');
// };

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

/** 删除按钮操作 */
// const handleDelete = () => {
//   if (batchDelete.value.length === 0) {
//     proxy.$message.error('请选择要删除的客户');
//     return;
//   }
//   const ids = batchDelete.value.map(item => item.id).join(',');
//   const message = `是否确认删除选中的数据项？`;
//   handleDeleteCommon(ids, message, Api.scm.scmOutStock.remove);
// };

// 删除and批量删除接口;
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      await deleteApi(ids); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

const deleteData = ids => {
  handleDeleteCommon(
    ids,
    `确定要删除数据id为[${ids}]的数据项？`,
    Api.scm.scmAuditNodeConfig.remove
  );
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  // 编辑
  if (action === 'edit') {
    addEditeDialogRef.value.openDialog(action, row);
  } else if (action === 'delete') {
    deleteData(row.id);
  } else if (action === 'add') {
    addEditeDialogRef.value.openDialog(action);
  }
};

/** 搜索按钮操作 */
const handleSearch = params => {
  queryParams.value = {
    ...queryParams.value,
    ...params,
  };
  getData();
};

const handleSearchItemChange = (scoped, val) => {
  if (scoped.item.paramKey === 'orgId') {
    scoped.queryParams[scoped.item.paramKey] = val?.id;
    scoped.queryParams.orgName = val?.orgName;
  } else if (scoped.item.paramKey === 'selectPersonId') {
    scoped.queryParams[scoped.item.paramKey] = val?.id;
    scoped.queryParams.selectPersonName = val?.name;
  }
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.scm.scmAuditNodeConfig.list(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records;
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

/** 搜索按钮操作 */
// const handleQuery = () => {
//   queryParams.value.current = 1;
//   getData();
// };

/** 重置按钮操作 */
// const resetQuery = () => {
//   queryParams.value = {
//     current: 1,
//     size: 20,
//   };
//   proxy.resetForm('queryRef');
//   getData();
// };
</script>

<style scoped lang="scss">
.page-quality-inspection-bind-index {
  .search-area {
    width: calc(100% - 320px);
    :deep(.select-param) {
      min-width: 108px;
    }
    .search-select-box {
      min-width: 200px;

      .el-select {
        border-top: 1px solid #e5e7eb;
        border-bottom: 1px solid #e5e7eb;
      }
    }
  }
  .action-banner {
    padding: 8px 0;
  }
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      height: 50px;
      display: flex;
      align-items: center;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}

:deep(.el-tabs__nav-wrap):after {
  height: 0px !important;
}

:deep(.el-tabs__item) {
  height: 52px !important;
}
</style>
