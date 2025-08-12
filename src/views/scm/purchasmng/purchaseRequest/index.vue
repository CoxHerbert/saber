<template>
  <basic-container>
    <div class="content-warp page-purchase-request-index">
      <!-- 采购申请单 -->
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
          icon="el-icon-plus"
          v-permission="{ id: 'PURCHASE_REQUEST_ADD' }"
          @click="doAction('add')"
          >新增采购申请单
        </el-button>
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
              v-else-if="col.type === 'dc-dict-key'"
              :key="'dc-dict-key' + i"
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
                  v-permission="
                    !btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row, userId))
                      ? { id: btn.permissionId, row: scoped.row }
                      : undefined
                  "
                  type="primary"
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row, userId))"
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
<script setup name="PurchaseRequest">
import { onMounted, ref, computed } from 'vue';
import Api from '@/api/index';
import options from './utils';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
const store = useStore();
const userId = computed(() => store.getters.userInfo.user_id);
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  columns: options.columns,
  queryParams: {
    keyword: '',
    processStatus: '',
    current: 1,
    size: 20,
  },
  statusList: [
    {
      label: '全部',
      value: '',
    },
    {
      label: '未审核',
      value: '审批中',
    },
    {
      label: '已审核',
      value: '审批结束',
    },
  ],
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  applyStatus: '',
});

const dictCache = proxy.useCache([
  { key: 'DC_PURCHASE_REQUEST_DICT' },
  { key: 'DC_LIST_PROCESS_STATUS' },
  { key: 'SCMORG_LIST_CACHE' },
]);

const { DC_PURCHASE_REQUEST_DICT, DC_LIST_PROCESS_STATUS } = dictCache;

const { batchDelete, queryParams, statusList, dataList, loading, total, applyStatus, columns } =
  toRefs(data);
const searchConfig = ref({
  resetExcludeKeys: ['page', 'current', 'processStatus'],
  tabConfig: {
    prop: 'processStatus',
    items: [
      {
        label: '全部',
        value: '',
      },
      {
        label: '未审核',
        value: '审批中',
      },
      {
        label: '已审核',
        value: '审批结束',
      },
    ],
  },
  searchItemConfig: {
    paramType: {
      no: {
        label: '订单编号',
        type: 'input',
        paramKey: 'no',
        placeholder: '请输入订单编号',
      },
      billtypeDict: {
        label: '采购类型',
        type: 'select',
        options: DC_PURCHASE_REQUEST_DICT,
        labelKey: 'dictValue',
        placeholder: '请选择采购类型',
        valueKey: 'dictKey',
        paramKey: 'billtypeDict',
      },
      purchaseDate: {
        label: '采购日期',
        type: 'el-date-picker',
        paramKey: 'purchaseDate',
        props: {
          type: 'date',
          placeholder: '请选择采购日期',
          format: 'YYYY/MM/DD',
          'value-format': 'YYYY-MM-DD',
        },
      },
      applicationUserId: {
        label: '申请人',
        type: 'dc-select-user',
        paramKey: 'applicationUserId',
        props: {
          objectName: 'org',
          placeholder: '请选择申请人',
          clearable: true,
          multiple: false,
          'multiple-limit': 1,
        },
      },
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
    size: 20,
    processStatus: e.props.name,
  };
  nextTick(() => {
    getData();
  });
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
  doAction('look', { row });
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  switch (action) {
    case 'look':
      router.push({
        path: '/scm/purchasmng/purchaseRequest/addorEdite',
        query: {
          id: row.id,
          type: 'look',
        },
      });
      return;
    case 'delete':
      proxy
        .$confirm(`确定将 [${ids}] 数据删除?`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => {
          return Api.scm.application.remove(ids);
        })
        .then(() => {
          proxy.$message({
            type: 'success',
            message: '删除成功!',
          });
          getData();
        });
      return;
    case 'edit':
      router.push({
        path: '/scm/purchasmng/purchaseRequest/addorEdite',
        query: {
          id: row.id,
        },
      });
      return;
    case 'add':
      router.push({
        path: '/scm/purchasmng/purchaseRequest/addorEdite',
        query: {
          type: 'add',
        },
      });
      return;
  }
};

/** 重置按钮操作 */
const handleReset = () => {
  getData();
};

/** 搜索按钮操作 */
const handleSearch = () => {
  getData();
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.scm.application.getList(dataparam);
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
</script>

<style scoped lang="scss">
.page-purchase-request-index {
  .search-area {
    :deep(.select-param) {
      width: 108px;
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
