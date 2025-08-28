<template>
  <div class="list-page page-tpm-list">
    <!-- TMP执行单 -->
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
        v-permission="{ id: 'BATCH_REPLENISHMENT' }"
        @click="doAction('batchPrint')"
        >批量补打</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="dataList"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <template v-for="(col, i) in columns">
          <!-- 多选 -->
          <el-table-column
            v-if="col.type === 'selection'"
            :key="i"
            type="selection"
            :align="col.align"
            :width="col.width"
            :min-width="col.minWidth"
          />
          <!-- 序号类型 -->
          <el-table-column
            v-else-if="col.type === 'index'"
            :key="'index' + i"
            label="序号"
            :align="col.align"
            :width="col.width || 55"
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
              <template v-if="!!col?.transVal">
                {{
                  [null, undefined, ''].includes(scoped.row?.[col.prop])
                    ? '-'
                    : col.transVal(scoped.row)
                }}
              </template>
              <template v-else>
                {{ scoped.row?.[col.prop] || '-' }}
              </template>
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
  <batchNumberEditDialog ref="batchNumberEditDialogRef" @submit="handleSubmit" />
</template>
<script setup name="Productiongroup">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import getOptions from './utils.js';
import batchNumberEditDialog from './batchNumberEditDialog.vue';

const options = getOptions();
const batchNumberEditDialogRef = ref(null);
const { proxy } = getCurrentInstance();
const pageData = reactive({
  mode: 'setAuditUser',
  auditDialogVisible: false,
  auditFormData: {
    isPass: '',
    selectedSupervisor: '',
  },
  roleIdOptions: [],
  columns: options.columns,
  queryParams: {
    keyword: '',
    topType: '待处理',
    pageNo: 1,
    current: 1,
    size: 10,
  },
  batchSelectRows: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
});

const { batchSelectRows, queryParams, dataList, loading, total, columns } = toRefs(pageData);
// 点击行时选中/取消选中复选框
const tableRef = ref(null);
const handleRowClick = row => {
  // handleSelectionChange;
  // 检查当前行是否已选中
  const isSelected = batchSelectRows.value.some((item, i) => item.index === row.index);
  tableRef.value.toggleRowSelection(row, !isSelected);
};
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

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current' /* , 'topType' */],
    // tabConfig: {
    //   prop: 'topType',
    //   items: [
    //     { label: '待处理', value: '待处理' },
    //     { label: '我的', value: '我的' },
    //     { label: '已处理', value: '已处理' },
    //     { label: '全部', value: '全部' },
    //   ],
    // },
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
  initSearchConfig();
  getData();
});

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchSelectRows.value = selection;
};

// const deleteData = ids => {
//   handleDeleteCommon(
//     ids,
//     `确定要删除数据id为[${ids.join(',')}]的数据项？`,
//     Api.pdp.dcErporder.neDelete
//   );
// };

// // 删除and批量删除接口
// const handleDeleteCommon = (ids, message, deleteApi) => {
//   proxy
//     .$confirm(message)
//     .then(async () => {
//       await deleteApi({
//         ids: ids.join(','),
//       }); // 调用传入的删除接口
//     })
//     .then(() => {
//       getData(); // 更新数据
//       proxy.$message.success('删除成功');
//     })
//     .catch(() => {
//       // 错误处理
//     });
// };

const handleSubmit = data => {
  loading.value = true;
  Api.system.po
    .replayPrint(
      data.map(row => {
        return {
          ...row,
          deliveryDeliveryno: undefined,
          receiveQty: row.deliveryDeliveryno,
        };
      })
    )
    .then(res => {
      loading.value = false;
      const { code, msg, data } = res.data;
      if (code === 200) {
        const code = data?.[0]?.deliveryDeliveryno;
        window.open(`/api/blade-bip/skip-url/po/patch/print?batchCode=${code}`);
      } else {
        proxy.$message.error(msg);
      }
    })
    .catch(error => {
      console.error(error);
      loading.value = false;
    });
};

const batchPrint = () => {
  if (batchSelectRows.value?.length === 0) {
    proxy.$message.error('请先选择要打印的行');
    return;
  }
  batchNumberEditDialogRef.value.show(
    JSON.parse(JSON.stringify(batchSelectRows.value)).map(row => {
      return {
        ...row,
        deliveryDeliveryno: row.receiveQty,
      };
    })
  );
};

/** 操作 */
const doAction = (action, scope = {}) => {
  if (action === 'batchPrint') {
    batchPrint();
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
  queryParams.value.current = 1;
  getData();
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.system.po.getUnreceivedList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    dataList.value.forEach((element, index) => {
      element.index = index;
    });
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};
</script>
