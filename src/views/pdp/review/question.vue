<template>
  <basic-container>
    <div class="content-warp page-warehouse-wmr-list">
      <div class="header">
        <dc-search
          v-if="searchConfig"
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="resetQuery"
          @search="handleQuery"
          @itemChange="handleSearItemChange"
        />
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <template v-for="(col, i) in columns.filter(c => !c.hideInList)">
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
              v-else-if="['rowTextWithColor', 'rowText'].includes(col.type)"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <span
                  v-if="
                    col.type === 'rowTextWithColor' &&
                    ![null, '', undefined].includes(scoped.row[col.prop])
                  "
                  :style="{
                    color: scoped.row[col.colorProp] ? scoped.row[col.colorProp] : 'inherit',
                  }"
                >
                  {{ scoped.row[col.prop] }}
                </span>
                <span v-else>{{
                  [null, '', undefined, ' '].includes(scoped.row[col.prop])
                    ? '-'
                    : scoped.row[col.prop]
                }}</span>
              </template>
            </el-table-column>
            <!-- dc-view类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :label="col.label"
              :width="col.width"
              :align="col.align ? col.align : 'center'"
              prop="purchaserId"
            >
              <template #default="scoped">
                <dc-view-v2
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showLabel="col.showKey"
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
                <dc-dict-key :value="scoped.row[col.prop]" :options="dictMaps[col.dictKey]" />
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
    <el-drawer
      class="drawer-review-view-or-audit"
      v-model="drawerConfig.visible"
      :with-header="false"
      size="1080px"
    >
      <ViewOrEdit
        ref="viewOrEditRef"
        @close="closeDrawer"
        :row="drawerConfig.row"
        :mode="drawerConfig.mode"
        :title="drawerConfig.title"
        :id="drawerConfig.id"
      />
    </el-drawer>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import options from './utils/question';
import ViewOrEdit from './question/view-or-edit.vue';
import store from '@/store';

const { proxy } = getCurrentInstance();
const data = reactive({
  searchConfig: null,
  columns: options.columns,
  queryParams: {
    reviewProblemStatus: 'DC_REVIEW_PROBLEM_STATUS_UR',
    keyword: '',
    current: 1,
    size: 20,
  },
  dictMaps: {
    DC_REVIEW_PROBLEM_STATUS: [],
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  drawerConfig: {
    visible: false,
    row: null,
    title: '',
    mode: 'view',
    id: '',
  },
  total: 0,
  title: '',
  rules: {},
});

const viewOrEditRef = ref(null);

const { queryParams, dataList, loading, total, columns, searchConfig, dictMaps, drawerConfig } =
  toRefs(data);

const handleSearItemChange = ({ item, val }) => {
  if (item.paramKey === 'warehouseId') {
    queryParams.value.locationId = '';
    searchConfig.value.searchItemConfig.paramType.locationId.props.params = {
      warehouseId: queryParams.value.warehouseId,
    };
  }
};

onMounted(async () => {
  await getDict();
  await getData();
  searchConfig.value = getSearchConfig();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const dataSend = {
    ...queryParams.value,
    reviewProblemStatus:
      queryParams.value.reviewProblemStatus === 'mine'
        ? undefined
        : queryParams.value.reviewProblemStatus,
    createdUser:
      queryParams.value.reviewProblemStatus === 'mine'
        ? store.state.user.userInfo.user_id
        : undefined,
  };
  const res = await Api.pdp.dcReviewQuestion.list(dataSend);
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

const getSearchConfig = () => {
  return {
    resetExcludeKeys: ['page', 'current', 'reviewProblemStatus'],
    tabConfig: {
      prop: 'reviewProblemStatus',
      items: [
        ...dictMaps.value.DC_REVIEW_PROBLEM_STATUS.map(item => {
          return {
            sort: item.sort,
            label: item.dictValue,
            value: item.dictKey,
          };
        }).sort((a, b) => {
          return a.sort > b.sort ? 1 : -1;
        }),
        { label: '我的问题单', value: 'mine' },
      ],
    },
    searchItemConfig: {
      paramType: columns.value
        .filter(s => s.search)
        .reduce((rec, item) => {
          if (item.searchType === 'user') {
            rec[item.prop] = {
              label: item.label,
              type: 'dc-select-user',
              placeholder: `请选择${item.label}`,
              paramKey: item.prop,
              objectName: 'user',
              props: {
                multipleLimit: 1,
                returnType: 'string',
              },
            };
          } else if (item.type === 'timeRange') {
            rec[item.prop] = {
              label: item.label,
              type: 'dc-date-range',
              placeholder: `请选择${item.label}`,
              paramKey: item.prop,
              props: {
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD',
              },
              clear(queryParams) {
                queryParams.startTime = null;
                queryParams.endTime = null;
              },
            };
          } else if (item.type === 'dc-view') {
            rec[item.prop] = {
              label: item.label,
              type: 'dc-select-dialog',
              paramKey: item.prop,
              props: {
                showKey: item.showKey,
                // labelKey: item.showKey,
                type: 'input',
                placeholder: `请选择${item.label}`,
                objectName: item.objectName,
                clearable: true,
                returnType: 'string',
                multiple: false,
                'multiple-limit': 1,
              },
            };
          } else {
            rec[item.prop] = {
              label: item.label,
              type: 'input',
              placeholder: `请输入${item.label}`,
              paramKey: item.prop,
            };
          }
          return rec;
        }, {}),
    },
  };
};

const getDict = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_REVIEW_PROBLEM_STATUS' }]);
  dictMaps.value = res;
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
    size: 20,
  };
  searchConfig.value.searchItemConfig.paramType.locationId.props.params = {
    warehouseId: queryParams.value.warehouseId,
  };
  getData();
};

const doAction = (action, scoped) => {
  drawerConfig.value.id = scoped.row.id;
  drawerConfig.value.row = scoped.row;

  if (action === 'view') {
    drawerConfig.value.title = '查看评审问题单';
    drawerConfig.value.mode = 'view';
  } else if (action === 'edit') {
    drawerConfig.value.title = '处理评审问题单';
    drawerConfig.value.mode = 'done';
  } else if (action === 'audit') {
    drawerConfig.value.title = '处理问题单审核';
    drawerConfig.value.mode = 'audit';
  }
  drawerConfig.value.visible = true;
  setTimeout(() => {
    viewOrEditRef.value?.show();
  }, 10);
};

const closeDrawer = () => {
  drawerConfig.value.visible = false;
  handleQuery();
};
</script>

<style scoped lang="scss">
.page-warehouse-wmr-list {
  .search-area {
    :deep(.select-param) {
      width: 108px;
    }
  }
  .header {
    padding-top: 4px;
    margin-bottom: 10px;
  }
  .search-container {
    margin-top: 0 !important;
  }
  .action-banner {
    padding: 8px 0;
  }
}

:deep(.drawer-review-view-or-audit) {
  .el-drawer__body {
    padding: 0;
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
</style>
