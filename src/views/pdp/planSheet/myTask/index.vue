<template>
  <basic-container>
    <div class="content-warp page-my-task-list">
      <!-- 我的任务配置 -->
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <!-- <div class="action-banner">
        <el-button @click="doAction('batchFinish')" type="primary">批量完成</el-button>
      </div> -->
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
              :selectable="col?.selectable ? col?.selectable : true"
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
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col?.showKey"
                />
              </template>
            </el-table-column>
            <!-- 字典类型 -->
            <el-table-column
              v-else-if="col.type === 'dict'"
              :key="'dict' + i"
              :label="col.label"
              :width="col.width"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <span
                  :class="col?.getClass ? col?.getClass(scoped) : ''"
                  :style="col?.getStyle ? col?.getStyle(scoped) : {}"
                >
                  <dc-dict
                    v-if="pageData[col.dictKey]"
                    type="text"
                    :options="pageData[col.dictKey]"
                    :value="scoped.row[col.prop]"
                  ></dc-dict>
                  <span v-else>-</span>
                </span>
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
    <!-- 计划执行 -->
    <planPerform ref="planPerformRef" @confirm="getData()" />
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Api from '@/api/index';
import getOptions from './utils';
import planPerform from '@/views/pdp/project/detail/components/plan/components/planPerform.vue';

const options = getOptions();
const router = useRouter();
const { proxy } = getCurrentInstance();
const pageData = reactive({
  columns: options.columns,
  queryParams: {
    taskType: '待办',
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
  DC_PMS_TEMPITEM_TYPE: [],
});

const { batchSelectRows, queryParams, dataList, loading, total, columns, DC_PMS_TEMPITEM_TYPE } =
  toRefs(pageData);

function getParamType(col) {
  if (col.searchProps.is === 'dict') {
    return {
      label: col.label,
      type: 'select',
      options: pageData[col.dictKey],
      labelKey: 'label',
      placeholder: `请选择${col.label}`,
      valueKey: 'id',
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
  prop: 'taskType',
  items: [
    { label: '全部', value: '全部' },
    { label: '待办', value: '待办' },
    { label: '超时', value: '超时' },
    { label: '已办', value: '已办' },
  ],
};

const searchConfig = ref({
  tabConfig,
});

const getDictData = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_PMS_TEMPITEM_TYPE' }]);
  DC_PMS_TEMPITEM_TYPE.value = res?.value?.DC_PMS_TEMPITEM_TYPE;
};

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current', 'taskType'],
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

onMounted(async () => {
  await getDictData();
  initSearchConfig();
  getData();
});

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchSelectRows.value = selection;
};

const handleBatchFinish = () => {
  if (batchSelectRows.value.length <= 0) {
    return proxy.$message({
      type: 'warning',
      message: '请至少选择1条数据进行操作!',
    });
  }
  const ids = batchSelectRows.value.map(item => item.id).join(',');
  const message = `确定要完成数据id为[${ids}]的数据项？`;
  proxy
    .$confirm(message)
    .then(() => Api.pdp.mmrPlanOrderItem.batchComplete({ ids }))
    .then(() => {
      getData();
      proxy.$message.success('操作成功');
    })
    .catch(() => {});
};
const planPerformRef = ref(null);
/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  switch (action) {
    case 'batchFinish':
      handleBatchFinish();
      return;
    case 'rowFinish':
      planPerformRef.value.openDrawer(row);
      return;
  }
};

/** 搜索按钮操作 */
const handleSearch = () => {
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
  const res = await Api.pdp.mmrPlanOrderItem.getPlanItemList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    const listData = data.records;
    dataList.value = listData;
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.page-my-task-list {
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
:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 6px;
      padding-bottom: 0;
      margin-bottom: 8px;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
</style>
