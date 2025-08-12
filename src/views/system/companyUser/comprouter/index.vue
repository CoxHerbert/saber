<template>
  <basic-container>
    <div class="content-warp page-driving-record">
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
          <template v-for="(column, i) in tableColumns" :key="i">
            <el-table-column
              :prop="column.prop"
              :label="column.label"
              :align="column.align || 'center'"
              :width="column.width"
              show-overflow-tooltip
            >
              <!-- 自定义单元格内容 -->
              <template #default="scope">
                {{ scope.row[column.prop] || '-' }}
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
    <!-- <AddOrEdit ref="addOrEditRef" @close="handleQuery" /> -->
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted, ref, watch } from 'vue';
import Api from '@/api/index';
import options from './index';
import { useRoute } from 'vue-router';

const { proxy } = getCurrentInstance();
const data = reactive({
  searchConfig: null,
  dictCache: {
    DC_HR_LOCATION: [],
  },
  columns: options.columns,
  queryParams: {
    topType: '我的',
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
});

const { queryParams, dataList, loading, total, columns, searchConfig, dictCache } = toRefs(data);
const route = useRoute();
const templateId = ref('');
const tableColumns = ref([]); // 动态列配

const handleSearItemChange = ({ item, val }) => {
  console.log('item', item, 'val', val);
};

onMounted(async () => {
  // await getDictData();
  searchConfig.value = getSearchConfig();

  templateId.value = route.query.templateId;
  console.log('获取到的templateId参数:', templateId.value);

  getData();
});

// 修改watch监听路由参数变化
watch(
  () => route.query.templateId,
  (newTemplateId, oldTemplateId) => {
    if (newTemplateId && newTemplateId !== oldTemplateId) {
      // 参数变化时重置页码并重新请求
      queryParams.value.current = 1;
      templateId.value = route.query.templateId;
      getData();
    }
  },
  { immediate: true } // 初始加载时立即执行
);
/** 查询参数列表 */
const getData = async () => {
  try {
    loading.value = true;
    queryParams.value.templateId = templateId.value;
    let dataparam = JSON.parse(JSON.stringify(queryParams.value));
    const res = await Api.system.po.getAssessmentRecordListAll(dataparam);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data;
      total.value = data.total;
      queryParams.value.current = data.current;
      queryParams.value.size = data.size;
      if (dataList.value.length > 0) {
        const firstRow = dataList.value[0];
        const columnWidthMap = {
          assessmentPeriod: '120px',
          department: '120px',
          // 可在此添加其他需要设置固定宽度的列
        };
        tableColumns.value = Object.keys(firstRow).map(key => ({
          label: formatColumnName(key), // 列显示名
          prop: key, // 字段名
          width: columnWidthMap[key] || undefined,
        }));
        // console.log(tableColumns.value);
        // 3. 调整列顺序（重要字段前置）
        adjustColumnOrder();
      }
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 格式化列名（映射英文键为中文）
const formatColumnName = key => {
  const columnMap = {
    assessmentPeriod: '考核周期',
    assessor: '考核人',
    department: '部门',
    employeeName: '员工姓名',
    totalScore: '总分',
  };
  return columnMap[key] || key;
};

// 调整列顺序（将基础信息放前面）
const adjustColumnOrder = () => {
  const priorityProps = [
    'assessmentPeriod',
    'assessor',
    'department',
    'employeeName',
    'totalScore',
  ];
  // 排序：优先字段按定义顺序排列，其他字段按原顺序
  tableColumns.value.sort((a, b) => {
    const indexA = priorityProps.indexOf(a.prop);
    const indexB = priorityProps.indexOf(b.prop);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });
};
const getDictData = async () => {
  const res = await proxy.getMultipleDict('DC_HR_LOCATION');
  dictCache.value = {
    ...dictCache.value,
    ...(res || {}),
  };
};

const getSearchConfig = () => {
  return {
    resetExcludeKeys: ['page', 'current'],
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

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 20,
  };
  getData();
};

const doAction = async (action, scoped = {}) => {
  if (action === 'view') {
    const { taskId, processInstanceId } = scoped.row;
    let param = window.btoa(
      JSON.stringify({
        taskId,
        processInsId: processInstanceId,
      })
    );
    const type = 'detail';
    proxy.$router.push({
      path: `/workflow/process/${type}/${param}`,
      query: {
        parentMenuId: '1932365219625013249',
      },
    });
  } else if (action == 'add') {
    const params = {
      processKey: 'drivingDeclaration',
    };
    const res = await Api.pdp.settled.processForm(params);
    const { code, data } = res.data;
    if (code === 200) {
      proxy.$router.push(`/workflow/process/start/${data.enCode}?parentMenuId=1932365219625013249`);
    }
  }
};
</script>

<style scoped lang="scss">
.page-driving-record {
  padding-left: 16px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;

  .table-container {
    flex: 1;
    position: relative;
    overflow: hidden;

    :deep(.el-table) {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
  .toolbar {
    padding-bottom: 8px;
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
