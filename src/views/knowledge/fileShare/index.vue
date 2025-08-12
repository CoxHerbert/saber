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
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
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
            <!-- 文件格式 -->
            <el-table-column
              v-else-if="col.type === 'file'"
              :key="'file' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <div class="file-item">
                  <div class="file-item-type">
                    <svg class="file-item-type_icon" aria-hidden="true">
                      <use :xlink:href="getFileIconByUrl(scoped.row.fileName)"></use>
                    </svg>
                    <div class="file-item-type_operate">
                      <el-icon @click="handleDownload(scoped.row)">
                        <Download />
                      </el-icon>
                    </div>
                  </div>
                </div>
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
                  v-permission="
                    !btn.showFunc || (btn.showFunc && btn.showFunc(scoped))
                      ? {
                          id: btn.permissionId,
                        }
                      : undefined
                  "
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
import { downloadFileBlob, getFileIconByUrl } from '@/utils/util';
import dayjs from 'dayjs';

const options = getOptions(false);
const router = useRouter();
const { proxy } = getCurrentInstance();
const pageData = reactive({
  mode: 'setAuditUser',
  roleIdOptions: [],
  columns: options.columns,
  queryParams: {
    typeTag: '我分享的',
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
  DC_PDP_PROJECT_FILE: [],
});

const {
  batchSelectRows,
  queryParams,
  dataList,
  loading,
  total,
  columns,
  DC_PDP_PROJECT_FILE,
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
  prop: 'typeTag',
  items: [
    { label: '我分享的', value: '我分享的' },
    { label: '我收到的', value: '我收到的' },
  ],
};

const searchConfig = ref({
  tabConfig,
});

const getDictData = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_PDP_PROJECT_FILE' }]);
  DC_PDP_PROJECT_FILE.value = res?.value?.DC_PDP_PROJECT_FILE;
};

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current', 'typeTag'],
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

const handleDownload = row => {
  try {
    downloadFileBlob(row.fileLink, row.fileName);
  } catch (err) {
    proxy.$message.error('下载异常');
  }
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
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
  const res = await Api.knowledge.fileShare.list(dataparam);
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
  .file-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60px;

    &-type {
      position: relative;
      border-radius: 6px;
      overflow: hidden;

      &:hover {
        .file-item-type_operate {
          display: flex;
        }
      }

      &_icon {
        width: 36px;
        height: 32px;
      }

      &_operate {
        display: none;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 100;
        cursor: pointer;
        color: #fff;
        font-size: 16px;
        gap: 4px;
      }
    }

    &_name {
      margin-top: 5px;
      text-align: center;
      width: 100%;
      font-size: 12px;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 6px;
      margin-bottom: 10px;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
</style>
