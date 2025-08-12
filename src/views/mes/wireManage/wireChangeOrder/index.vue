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
        <el-button icon="Plus" type="primary" style="margin-right: 16px" @click="handleInitiate()"
          >新增</el-button
        >
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
  </basic-container>
</template>
<script setup name="WireBOM">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import getOptions from './utils';
import { useRouter } from 'vue-router';

const options = getOptions();
const router = useRouter();
const { proxy } = getCurrentInstance();
const pageData = reactive({
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
});
// 新增
const handleInitiate = async () => {
  const params = {
    processKey: 'wireChange',
  };
  const res = await Api.pdp.settled.processForm(params);
  const { code, data } = res.data;
  if (code === 200) {
    router.push(`/workflow/process/start/${data.enCode}`);
  }
};
const { batchSelectRows, queryParams, dataList, loading, total, columns } = toRefs(pageData);

function getParamType(col) {
  if (col.searchProps.is === 'dict') {
    return {
      label: col.label,
      type: 'select',
      withGroup: true,
      options: pageData[col.dictKey],
      labelKey: 'dictValue',
      placeholder: `请选择${col.label}`,
      valueKey: 'dictValue', // 'id', // 'dictKey',
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

const searchConfig = ref({});

const getDictData = async () => {};

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current'],
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

onMounted(async () => {
  await getDictData();
  initSearchConfig();
  getData();
});

const tableRef = ref(null);

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
    Api.mps.wireChange.remove
  );
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

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  if (action === 'batchDelete') {
    if (batchSelectRows.value.length < 1) {
      proxy.$message.error('请先勾选要删除的数据');
      return;
    }
    deleteData(batchSelectRows.value.map(row => row.id));
  } else if (action === 'delete') {
    deleteData([scope.row.id]);
  } else if (action === 'dblclick') {
    router.push({
      path: '/mes/wireManage/wireChangeOrder/addOrEdit',
      query: {
        type: 'look',
        parentMenuId: '1932713877985923074',
        id: scope.id,
      },
    });
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
  const res = await Api.mps.wireChange.list(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records;
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
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
