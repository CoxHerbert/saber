<template>
  <basic-container>
    <div class="content-warp page-demand-schedule-setting">
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
      <div class="toolbar">
        <el-button type="primary" icon="plus" @click="doAction('add')">新增</el-button>
        <el-button icon="delete" @click="doAction('batchDelete')">批量删除</el-button>
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @selection-change="handleTableSelectionChange"
        >
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
                    : col.transVal
                    ? col.transVal(scoped.row[col.prop])
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
                {{
                  dictMaps[col.dictKey]?.find(d => d.dictKey === scoped.row[col.prop])?.dictValue ||
                  '-'
                }}
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
  </basic-container>
</template>
<script setup name="Productiongroup">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Api from '@/api/index';
import options from './utils/setting';

const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  searchConfig: null,
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
  dictMaps: {},
});

const { queryParams, dataList, loading, total, columns, searchConfig, dictMaps } = toRefs(data);

const handleSearItemChange = ({ item, val }) => {
  console.log('item', item, val);
};

onMounted(async () => {
  searchConfig.value = getSearchConfig();
  await getDict();
  getData();
});

const getDict = async () => {
  const res = await proxy.getMultipleDict('DC_CRM_DIMENSION');
  dictMaps.value = res;
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = JSON.parse(JSON.stringify(queryParams.value));
  const res = await Api.crm.rlistConfigue.list({
    ...dataparam,
  });
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

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const deleteData = ids => {
  proxy
    .$confirm(`确定将 [${ids}] 数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      Api.crm.rlistConfigue.remove({ ids }).then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          proxy.$message.success('操作成功');
          getData();
        } else {
          proxy.$message.error(data.msg);
        }
      });
    });
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  searchConfig.value.searchItemConfig.paramType.locationId.props.params = {
    warehouseId: queryParams.value.warehouseId,
  };
  getData();
};

const selectionIds = computed(() => {
  return selectionData.value?.map(row => row.id)?.join(',');
});

const selectionData = ref([]);

const handleTableSelectionChange = val => {
  selectionData.value = val;
};

const doAction = (action, scoped) => {
  if (['edit', 'detail', 'add'].includes(action)) {
    router.push({
      path: `/crm/setting/rlist-configue-setting/${action}/${scoped?.row?.id || 'create'}`,
    });
  } else if (action === 'delete') {
    deleteData(scoped.row.id);
  } else if (action === 'batchDelete') {
    deleteData(selectionIds.value);
  }
};
</script>

<style scoped lang="scss">
.page-demand-schedule-setting {
  .search-area {
    :deep(.select-param) {
      width: 108px;
    }
  }
  .header {
    padding-top: 4px;
    margin-bottom: 10px;
  }
  .toolbar {
    padding-bottom: 8px;
  }
  .search-container {
    margin-top: 0 !important;
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
</style>
