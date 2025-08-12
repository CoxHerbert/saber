<template>
  <basic-container>
    <div class="content-warp page-exchange-rate-list">
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
        <el-button type="primary" @click="doAction('add')" icon="plus">新增</el-button>
        <el-upload
          :http-request="uploadFile"
          :before-upload="beforeUpload"
          accept=".xls,.xlsx"
          :show-file-list="false"
          class="upload"
        >
          <el-button icon="upload">导入</el-button>
        </el-upload>
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
              :minWidth="col.width"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{
                  dictCache[col.dictKey].find(d => d.dictKey == scoped.row[col.prop])?.dictValue ||
                  '-'
                }}
                <!-- <dc-dict :value="scoped.row[col.prop]" :options="dictCache[col.dictKey]" /> -->
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
            <el-table-column
              v-else-if="col.type === 'switch'"
              :key="'swithc' + i"
              :fixed="col.fixed"
              :label="col.label"
              :width="col.width ? col.width : 180"
              :align="col.align ? col.align : 'center'"
            >
              <template #default="scoped">
                <el-switch
                  style="cursor: not-allowed"
                  :modelValue="scoped.row[col.prop]"
                  @change="
                    val => {
                      handleRowChange(val, col, scoped.row);
                    }
                  "
                ></el-switch>
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
    <AddOrEdit ref="addOrEditRef" :dictOptions="dictCache" @close="handleQuery" />
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import options from './utils/cost-customer';
import AddOrEdit from './cost-customer/addOrEdit.vue';

const addOrEditRef = ref(null);

const { proxy } = getCurrentInstance();
const data = reactive({
  searchConfig: null,
  dictCache: {
    DC_HR_LOCATION: [],
  },
  columns: options.columns,
  queryParams: {
    // topType: '我的',
    keyword: '',
    current: 1,
    size: 10,
    constantType: 'HS_CUSTOMER',
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
});

const { queryParams, dataList, loading, total, columns, searchConfig, dictCache } = toRefs(data);

const handleSearItemChange = ({ item, val }) => {
  console.log('item', item, 'val', val);
};

onMounted(async () => {
  await getDictData();
  searchConfig.value = getSearchConfig();
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = JSON.parse(JSON.stringify(queryParams.value));
  const res = await Api.scm.costCustomer.list(dataparam);
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

const getDictData = async () => {
  const res = await proxy.getMultipleDict('DC_SCM_EXCHANGE_RATE');
  dictCache.value = {
    ...dictCache.value,
    ...(res || {}),
  };
};

const getSearchConfig = () => {
  return {
    resetExcludeKeys: ['page', 'current' /* , 'topType' */],
    // tabConfig: {
    //   prop: 'topType',
    //   items: [
    //     {
    //       label: '我的',
    //       value: '我的',
    //     },
    //     {
    //       label: '全部',
    //       value: '全部',
    //     },
    //   ],
    // },
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
          } else if (item.type === 'dict') {
            rec[item.prop] = {
              label: item.label,
              type: 'select',
              options: dictCache.value[item.dictKey],
              labelKey: 'dictValue',
              placeholder: `请选择${item.label}`,
              valueKey: 'dictKey',
              paramKey: item.prop,
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

const handleRowChange = (val, col, item) => {
  const dataSet = {
    ...item,
    [col.prop]: val,
  };

  Api.scm.costCustomer.update(dataSet).then(res => {
    const { code } = res.data;
    if (code === 200) {
      getData();
    }
  });
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
    constantType: 'HS_CUSTOMER',
  };
  getData();
};

const deleteIds = ids => {
  proxy
    .$confirm(`确定将 [${ids}] 数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      return Api.scm.costCustomer.remove({
        ids,
      });
    })
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

const beforeUpload = file => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    // 使用 Element Plus 的消息提示
    proxy.$message.error('只能上传 Excel 文件!');
  }
  return isExcel;
};

const uploadFile = async fileObj => {
  const formData = new FormData();
  formData.append('file', fileObj.file);
  formData.append('constantType', 'HS_CUSTOMER');
  try {
    const response = await axios.post('/blade-bip/dc-common-constant/import-data', formData);

    if (response.data.code === 200) {
      proxy.$message.success('导入成功！');
      getData();
    } else {
      proxy.$message.error(response.data.message || '导入失败');
    }
  } catch (error) {
    console.error('导入失败', error);
    proxy.$message.error('导入失败，请稍后重试');
  }
};

const doAction = (action, scoped = {}) => {
  if (action === 'add') {
    addOrEditRef.value.show({}, action);
  } else if (['edit', 'view'].includes(action)) {
    addOrEditRef.value.show(scoped.row, action);
  } else if (action === 'delete') {
    deleteIds(scoped.row.id);
  }
};
</script>

<style scoped lang="scss">
.page-exchange-rate-list {
  padding-left: 16px;
  .toolbar {
    display: flex;
    padding-bottom: 8px;
    .el-button {
      margin-right: 16px;
    }
  }
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
