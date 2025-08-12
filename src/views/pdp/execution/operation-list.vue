<template>
  <basic-container>
    <div class="content-warp page-operation-list">
      <!-- 入库单 -->
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <!-- <el-button @click="doAction('submitErp')">提交至ERP</el-button> -->
        <el-button
          @click="doAction('batchDelete')"
          icon="Delete"
          v-permission="{
            id: 'OPT_ERP_ORDER_BATCH_DEL',
          }"
          >批量删除</el-button
        >
        <el-button
          @click="doAction('batchExport')"
          icon="Download"
          v-permission="{
            id: 'OPT_ERP_ORDER_IMPORT',
          }"
          >导出</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          row-key="id"
          lazy
          :load="loadChildren"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :checkStrictly="true"
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
              :min-width="col.minWidth"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
              :align="col.align"
              :width="col.width"
              :min-width="col.minWidth"
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
                  v-permission="{
                    id: btn.permissionId,
                  }"
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
<script setup name="Productiongroup">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Api from '@/api/index';
import getOptions from './utils';
import nProgress from 'nprogress';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';
import dayjs from 'dayjs';

const options = getOptions(false);
const router = useRouter();
const { proxy } = getCurrentInstance();
const pageData = reactive({
  mode: 'setAuditUser',
  roleIdOptions: [],
  columns: options.columns,
  queryParams: {
    keyword: '',
    topType: '全部',
    current: 1,
    size: 10,
    pageNo: 2,
  },
  batchSelectRows: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  applyStatus: '',
  DC_BILL_TYPE: [],
  DC_ERP_ORDER_STATUS: [],
});

const {
  batchSelectRows,
  queryParams,
  dataList,
  loading,
  total,
  columns,
  DC_BILL_TYPE,
  DC_ERP_ORDER_STATUS,
  auditDialogVisible,
  roleIdOptions,
  mode,
} = toRefs(pageData);

function getParamType(col) {
  if (col.searchProps.is === 'dict') {
    return {
      label: col.label,
      type: 'select',
      withGroup: true,
      options: pageData[col.dictKey],
      labelKey: 'dictValue',
      placeholder: `请选择${col.label}`,
      valueKey: 'dictValue',
      paramKey: col.prop,
    };
  } else if (col.searchProps.is === 'input') {
    return {
      label: col.label,
      type: 'input',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
    };
  } else if (col.searchProps.is === 'dc-date-range') {
    return {
      label: col.label,
      type: 'dc-date-range',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
      // 注意这里使用的是ref类型参数
      clear(queryParams) {
        queryParams.value.startTime = null;
        queryParams.value.endTime = null;
      },
      getLabelValue(queryParams) {
        if (queryParams.startTime && queryParams.endTime) {
          return `${col.label}：${queryParams.startTime} 至 ${queryParams.endTime}`;
        }
        return null;
      },
    };
  } else if (col.searchProps.is === 'dc-select-user') {
    return {
      label: col.label,
      type: 'dc-select-user',
      placeholder: `请选择${col.label}`,
      paramKey: col.prop,
      objectName: 'user',
      props: {
        multipleLimit: 1,
        returnType: 'string',
      },
    };
  } else {
    console.error('undefined type', col.type, col);
    return {
      label: col.label,
      type: 'input',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
    };
  }
}
const tabConfig = {
  prop: 'topType',
  items: [
    { label: '全部', value: '全部' },
    { label: '待处理', value: '待处理' },
    { label: '我的', value: '我的' },
    { label: '已处理', value: '已处理' },
  ],
};

const searchConfig = ref({
  tabConfig,
});

const getDictData = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_BILL_TYPE' }, { key: 'DC_ERP_ORDER_STATUS' }]);
  DC_BILL_TYPE.value = res?.value?.DC_BILL_TYPE;
  DC_ERP_ORDER_STATUS.value = res?.value?.DC_ERP_ORDER_STATUS;
};

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current', 'topType'],
    tabConfig,
    searchItemConfig: {
      paramType: options.columns
        .filter(item => item.search)
        .sort((a, b) => a.searchIndex < b.searchIndex)
        .reduce((rec, item) => {
          rec[item.prop] = getParamType(item);
          return rec;
        }, {}),
    },
  };
};

const tableRef = ref(null);

onMounted(async () => {
  await getDictData();
  getAuditUsers();
  initSearchConfig();
  getData();
});

const handleSelect = (selection, row) => {
  if (row.children) {
    toggleChildrenSelection(row, selection.includes(row));
  }
};

const toggleChildrenSelection = (parent, isSelected) => {
  parent.children.forEach(child => {
    // 更新子行选中状态
    tableRef.value?.toggleRowSelection(child, isSelected);
    // 递归处理子节点的子节点
    if (child.children) toggleChildrenSelection(child, isSelected);
  });
};

const handleSelectAll = selection => {
  // 全选时处理所有顶层行及其子节点
  selection.forEach(row => {
    if (row.children) toggleChildrenSelection(row, true);
  });
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchSelectRows.value = selection;
};

const deleteData = ids => {
  handleDeleteCommon(
    ids,
    `确定要删除数据id为[${ids.join(',')}]的数据项？`,
    Api.pdp.dcErporder.neDelete
  );
};

async function blobToJson(blob) {
  try {
    const text = await blob.text(); // 读取 Blob 为文本
    return JSON.parse(text); // 解析为 JSON 对象
  } catch (err) {
    console.error(' 转换失败:', err);
    throw err; // 或返回 null/默认值
  }
}

const exportData = data => {
  proxy
    .$confirm('是否导出执行单数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      nProgress.start();
      exportBlob(`/blade-bip//dc/erp/order/ne/excel-export?ids=${data.join(',')}`).then(
        async res => {
          if (res.data.type === 'application/json') {
            const dataSet = await blobToJson(res.data);
            proxy.$message.error(dataSet?.msg || '导出失败');
          } else {
            downloadXls(res.data, `执行单数据表${dayjs().format('YYYY-MM-DD')}.xlsx`);
          }
          nProgress.done();
        }
      );
    });
};

// 删除and批量删除接口
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      await deleteApi({
        ids: ids.join(','),
      }); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

const submitErp = async rows => {
  const res = await Api.pdp.dcErporder.nePass(JSON.parse(JSON.stringify(rows)));
  const { code } = res.data;
  if (code === 200) {
    proxy.$message.success('操作成功');
    handleQuery();
  }
};

const auditCurrentRows = ref([]);

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  if (action === 'submitErp') {
    if (batchSelectRows.value.length < 1) {
      proxy.$message.error('请先勾选指定的执行单');
      return;
    } else if (
      !batchSelectRows.value.every(row => row.dcErpOrderStatus === '1876789881673412609')
    ) {
      proxy.$message.error('请确保选中数据的“单据状态”为“运营补充”');
      return;
    }
    submitErp(batchSelectRows.value);
  } else if (action === 'edit') {
    router.push({
      path: '/pdp/execution/edit',
      query: {
        list: 'operation',
        id: row.mainId ? row.mainId : row.id,
        parentMenuId: '1913145571557490690',
      },
    });
    // drawerAddOrEdit.value?.show(scope.row.id);
  } else if (action === 'batchDelete') {
    if (batchSelectRows.value.length < 1) {
      proxy.$message.error('请先勾选要删除的数据');
      return;
    }
    deleteData(batchSelectRows.value.map(row => row.id));
  } else if (action === 'batchExport') {
    if (batchSelectRows.value.length < 1) {
      proxy.$message.error('请先勾选要导出的数据');
      return;
    }
    exportData(batchSelectRows.value.map(row => row.id));
  } else if (action === 'detail') {
    router.push({
      path: '/pdp/execution/detail',
      query: {
        list: 'operation',
        id: row.mainId ? row.mainId : row.id,
        parentMenuId: '1913145571557490690',
      },
    });
  } else if (action === 'setTpmHeaderOperatorId') {
    auditCurrentRows.value = [row];
    mode.value = 'setAuditUser';
    auditDialogVisible.value = true;
  } else if (action === 'delete') {
    deleteData([scope.row.id]);
  } else if (action === 'retrieve') {
    proxy
      .$confirm(`是否将任务单编号为‘${scope.row.taskNumber}’取回?`)
      .then(() => {
        loading.value = true;
        Api.pdp.dcErporder
          .retrieveOrder({ id: scope.row.id })
          .then(res => {
            const { code } = res.data;
            if (code === 200) {
              getData();
              proxy.$message.success('操作成功');
            }
            loading.value = false;
          })
          .catch(e => {
            loading.value = false;
          });
      })
      .catch(err => {});
  }
};

const topTabs = ref([
  { label: '全部', value: '全部' },
  { label: '待处理', value: '待处理' },
  { label: '我的', value: '我的' },
  { label: '已处理', value: '已处理' },
]);

/** 搜索按钮操作 */
const handleSearch = params => {
  queryParams.value = {
    ...queryParams.value,
    ...params,
  };
  getData();
};

/** 重置 */
const handleReset = () => {
  getData();
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.pdp.dcErporder.neList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    const listData = data.records
      .filter(row => !row.mainId)
      .map(row => {
        return {
          ...row,
          hasChildren: true,
          children: [],
        };
      });
    dataList.value = listData;
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};
// 树状方法
const loadChildren = async (row, treeNode, resolve) => {
  const res = await Api.pdp.dcErporder.neList({
    mainId: row.id,
    current: 1,
    size: 100,
  });
  const { code, data } = res.data;
  if (code === 200) {
    row.children = data.records;
    resolve(data.records);
  }
};

const getAuditUsers = async () => {
  const res = await Api.pdp.dcErporder.getAuditUsers({
    roleId: '1877174804015386626',
  });
  const { code, data } = res.data;
  if (code === 200) {
    roleIdOptions.value = data;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};
</script>

<style lang="scss" scoped>
.page-operation-list {
  .search-area {
    width: calc(100% - 310px);
    display: flex;
    justify-content: right;
    :deep(.select-param) {
      width: 108px;
    }
  }
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
}
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
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
