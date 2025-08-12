<template>
  <basic-container>
    <div class="content-warp page-warehous-entry-index">
      <!-- 出库单 -->
      <div class="header">
        <div class="title">
          <el-tabs v-model="applyStatus" @tab-click="handleClick">
            <el-tab-pane label="全部" name=""> </el-tab-pane>
            <el-tab-pane
              :label="item.label"
              :name="item.dictKey"
              v-for="(item, index) in DC_WMS_OUT_STATUS"
              :key="index"
            ></el-tab-pane>
          </el-tabs>
        </div>
        <div class="search-area">
          <dc-search-group :config="searchConfig" @search="handleSearch" />
        </div>
      </div>
      <div class="action-banner">
        <el-button
          type="primary"
          icon="el-icon-plus"
          v-permission="{ id: 'OUT_ORDER_ADD' }"
          @click="handleClickAdd"
          >新增出库单</el-button
        >
        <!-- <el-button icon="el-icon-download" @click="handleClickExport">导出</el-button> -->
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @selection-change="handleSelectionChange"
          @row-dblclick="handleRowDblClick"
        >
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
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :key="'dc-view' + i"
              :label="col.label"
              :width="col.width"
              :align="col.align ? col.align : 'center'"
              prop="purchaserId"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col.showKey"
                />
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="col.type === 'dc-dict'"
              :key="'dc-dict' + i"
              :label="col.label"
              :width="col.width"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-dict :value="scoped.row[col.prop]" :options="dictCache[col.dictKey].value" />
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
                  v-permission="
                    !btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))
                      ? { id: btn.permissionId, row: scoped.row }
                      : undefined
                  "
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))"
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
<script setup name="OutOrder">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import options from './utils';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  columns: options.columns,
  queryParams: {
    keyword: '',
    current: 1,
    size: 10,
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  applyStatus: '',
});

const dictCache = proxy.useCache([
  { key: 'DC_FLAG_STATUS' },
  { key: 'SCMORG_LIST_CACHE' },
  { key: 'DC_WMS_OUT_STATUS' },
  { key: 'DC_WMS_OUT_TYPE_SCM' },
]);

const { DC_FLAG_STATUS, DC_WMS_OUT_STATUS, DC_WMS_OUT_TYPE_SCM } = dictCache;

const { batchDelete, queryParams, dataList, loading, total, applyStatus, columns } = toRefs(data);
const searchConfig = ref({
  paramType: {
    // keyword: {
    //   label: '默认',
    //   type: 'input',
    //   placeholder: '请输入关键词搜索',
    //   paramKey: 'keyword',
    // },
    outStockType: {
      label: '出库类型',
      type: 'select',
      options: DC_WMS_OUT_TYPE_SCM,
      labelKey: 'dictValue',
      placeholder: '请选择出库类型',
      valueKey: 'dictKey',
      paramKey: 'outStockType',
    },
    outStockCode: {
      label: '出库单号',
      type: 'input',
      placeholder: '请输入出库单号',
      paramKey: 'outStockCode',
    },
    mtono: {
      label: '专案号',
      type: 'input',
      placeholder: '请输入专案号',
      paramKey: 'mtono',
    },
  },
});
onMounted(() => {
  getData();
});

// 点击tab
const handleClick = e => {
  queryParams.value = {
    current: 1,
    size: 10,
    outStockStatus: e.props.name,
  };
  nextTick(() => {
    getData();
  });
};

/** 新增数据 */
const handleClickAdd = () => {
  doAction('add');
};

/** 导出数据 */
const handleClickExport = () => {
  console.log('handleClickExport');
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

const handleRowDblClick = row => {
  doAction('detail', { row });
};

/** 删除按钮操作 */
const handleDelete = () => {
  if (batchDelete.value.length === 0) {
    proxy.$message.error('请选择要删除的客户');
    return;
  }
  const ids = batchDelete.value.map(item => item.id).join(',');
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(ids, message, Api.scm.scmOutStock.remove);
};

// 删除and批量删除接口
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

const printPdf = row => {
  window.open(`/api/blade-bip/skip-url/scm/get-pdf?outStockCode=${row.outStockCode}`, '_blank');
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  // 编辑
  if (action === 'edit') {
    router.push({
      path: '/scm/inventoryMng/outOrder/addorEdit',
      query: {
        id: row.id,
        type: 'edit',
      },
    });
    // 添加
  } else if (action === 'add') {
    router.push({
      path: '/scm/inventoryMng/outOrder/addorEdit',
      query: {
        type: 'add',
      },
    });
  } else if (action === 'detail') {
    router.push({
      path: '/scm/inventoryMng/outOrder/addorEdit',
      query: {
        id: row.id,
        type: 'look',
      },
    });
  } else if (action === 'printPdf') {
    printPdf(scope.row);
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

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.scm.scmOutStock.getList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style scoped lang="scss">
.page-warehous-entry-index {
  .search-area {
    width: calc(100% - 320px);
    :deep(.select-param) {
      width: 108px;
    }
  }
  .action-banner {
    padding: 8px 0;
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
