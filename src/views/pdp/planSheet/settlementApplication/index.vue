<template>
  <basic-container>
    <div class="content-warp page-settlement-application-index">
      <!-- 入驻申请 -->
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
          icon="el-icon-download"
          v-permission="{ id: 'RA_ADD' }"
          @click="doAction('create')"
          >创建入驻申请</el-button
        >
      </div>
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
                      ? { id: btn.permissionId }
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
    </div>
    <addEditeDialog ref="addEditeDialogRef" @success="getData" />
  </basic-container>
</template>
<script setup name="settlementApplication">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import options from './utils';
import { useRouter } from 'vue-router';
import addEditeDialog from './addEditeDialog.vue';
import dayjs from 'dayjs';
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  columns: options.columns,
  queryParams: {
    auditStatus: '',
    current: 1,
    size: 20,
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
});

const { batchDelete, queryParams, dataList, loading, total, columns } = toRefs(data);
const searchConfig = ref({
  resetExcludeKeys: ['page', 'current', 'auditStatus'],
  tabConfig: {
    prop: 'auditStatus',
    items: [
      { label: '全部', value: '' },
      { label: '未审核', value: false },
      { label: '已审核', value: true },
    ],
  },
  searchItemConfig: {
    paramType: {
      userId: {
        label: '入驻人',
        type: 'dc-select-user',
        placeholder: '请选择入驻人',
        paramKey: 'userId',
        objectName: 'user',
        props: {
          returnType: 'string',
        },
      },
      fDate: {
        label: '日期',
        type: 'dc-date-range',
        placeholder: '请选择日期',
        paramKey: 'fDate',
        // 注意这里使用的是ref类型参数
        clear(queryParams) {
          queryParams.value.startTime = null;
          queryParams.value.endTime = null;
        },
      },
      fCustId: {
        label: '客户姓名',
        type: 'input',
        placeholder: '请输入客户姓名',
        paramKey: 'fCustId',
      },
    },
  },
});
onMounted(() => {
  getData();
});

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

/** 删除and批量删除接口 **/
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

const addEditeDialogRef = ref(null);

const formConfig = [
  {
    label: '入驻人',
    type: 'dc-select-user',
    prop: 'userId',
    required: true,
    props: {
      multiple: false,
      'multiple-limit': 1,
      placeholder: '请选择审核人',
      returnType: 'string',
      type: 'input',
    },
  },
  {
    label: '计划单',
    type: 'dc-select-dialog-v2',
    prop: 'stationPlanId',
    required: true,
    props: {
      multiple: true,
      'multiple-limit': 99999,
      objectName: 'mmrPlanOrder',
      placeholder: '请选择计划单',
      returnType: 'string',
      type: 'input',
    },
  },
  {
    label: '开始时间',
    type: 'el-date-picker',
    prop: 'startDate',
    required: true,
    props: {
      placeholder: '请选择开始时间',
      returnType: 'string',
    },
  },
  {
    label: '结束时间',
    type: 'el-date-picker',
    prop: 'endDate',
    props: {
      placeholder: '请选择结束时间',
      returnType: 'string',
    },
  },
];

/** 操作 */
const doAction = (action, scope = {}) => {
  const row = scope?.row;
  // 编辑
  if (action === 'delete') {
    const ids = row.id;
    handleDeleteCommon(ids, `确定将“[${ids}]”数据删除?`, Api.pdp.stationApply.remove);
    proxy
      .$confirm(`确定将“[${ids}]”数据删除?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => Api.pdp.stationApply.remove({ ids }))
      .then(() => {
        proxy.$message({
          type: 'success',
          message: '操作成功!',
        });
        getData();
      })
      .catch(() => {});
  } else if (action === 'detail') {
    addEditeDialogRef.value.openDialog({
      title: '入驻申请详情',
      isDisabled: true,
      row,
      action,
      options: formConfig,
      api: Api.pdp.stationApply.submit,
    });
  } else if (action === 'create') {
    addEditeDialogRef.value.openDialog({
      title: '创建入驻申请',
      action,
      options: formConfig,
      api: Api.pdp.stationApply.submit,
      row: {
        startDate: dayjs().format('YYYY-MM-DD'),
      },
    });
  } else if (action === 'edit') {
    addEditeDialogRef.value.openDialog({
      title: '编辑入驻申请',
      row,
      action,
      options: formConfig,
      api: Api.pdp.stationApply.submit,
    });
  } else if (action === 'audit') {
    proxy
      .$confirm(`确定通过审核吗`)
      .then(async () => {
        const res = await Api.pdp.stationApply.audit(row);
        const { code, msg } = res.data;
        console.log(code);
        if (code === 200) {
          proxy.$message.success(msg);
          getData();
        }
      })
      .catch(() => {});
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

/** 重置 */
const handleReset = () => {
  getData();
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.pdp.stationApply.list(dataparam);
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
.page-settlement-application-index {
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
