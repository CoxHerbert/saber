<template>
  <div class="content-warp">
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          label-width="auto"
        >
          <el-form-item label="计划单号" prop="lineCode">
            <el-input v-model="queryParams.orderCode" placeholder="请输入计划单号" />
          </el-form-item>
          <el-form-item label="Project" prop="projectCode">
            <el-input v-model="queryParams.projectCode" placeholder="请输入项目编号" />
            <!-- <dc-select-dialog
              v-model="queryParams.projectConfigId"
              placeholder="请选择Project"
              objectName="projectConfig"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            /> -->
          </el-form-item>
          <!-- <el-form-item label="Station" prop="stationConfigId">
            <dc-select-dialog
              v-model="queryParams.stationConfigId"
              placeholder="请选择Station"
              objectName="stationConfig"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
          </el-form-item> -->
          <el-form-item label="CM编码" prop="cmCode">
            <el-input v-model="queryParams.cmCode" placeholder="请输入CM编码" />
          </el-form-item>
          <el-form-item label="所属部门" id="deptName" prop="deptName">
            <el-select
              v-model="queryParams.deptName"
              clearable
              filterable
              placeholder="请选择所属部门"
            >
              <el-option
                v-for="item in optionDept"
                :key="item.productCode"
                :label="item.productCode"
                :value="item.productCode"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="阶段" prop="phaseId">
            <el-select v-model="queryParams.phaseId" placeholder="请选择阶段">
              <el-option
                v-for="item in dataList"
                :key="item.id"
                :label="item.mmrPhaseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item> -->
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="getData">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-permission="{ id: 'PLAN_ORDER_COUNT_NOW_PAGE' }" @click="exportData('current')"
          >导出当前</el-button
        >
        <el-button v-permission="{ id: 'PLAN_ORDER_COUNT_ALL' }" @click="exportData('all')"
          >导出全部</el-button
        >
      </div>
    </div>
    <div class="table-container" v-loading="loading">
      <!--
        :tree-props="{ children: 'children' }"
        :span-method="treeSpanMethod"
        -->
      <el-table
        :data="tableData"
        :tree-props="{ children: 'child' }"
        :row-style="{ height: '48px' }"
      >
        <!-- <el-table-column type="selection" width="55" /> -->
        <el-table-column label="序号" width="55px" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(col, i) in tableColumns"
          :key="i"
          :min-width="col.width"
          :label="col.label"
          show-overflow-tooltip
          :prop="col.prop"
          align="center"
        >
          <template v-if="subColumns.find(item => item.prop === col.prop)" #default="{ row }">
            <template v-for="(subData, m) in row.children || []">
              <div v-if="showAll === 'true' ? true : m === 3" class="sub-row" style="width: 100%">
                <span :key="m" class="self-column">
                  <span
                    v-if="col.prop === 'phase'"
                    class="col-set"
                    :style="`color: ${subData.color || 'inherit'}`"
                  >
                    {{
                      col.render
                        ? col.render(subData[col.prop], subData)
                        : [null, '', undefined].includes(subData[col.prop])
                        ? '-'
                        : subData[col.prop]
                    }}</span
                  >
                  <span v-else>
                    {{
                      col.render
                        ? col.render(subData[col.prop], subData)
                        : [null, '', undefined].includes(subData[col.prop])
                        ? '-'
                        : subData[col.prop]
                    }}
                  </span>
                  <!-- {{
                    col.render
                      ? col.render(subData[col.prop], subData)
                      : [null, '', undefined].includes(subData[col.prop])
                      ? '-'
                      : subData[col.prop]
                  }} -->
                </span>
              </div>
            </template>
          </template>
          <template v-else-if="col.prop === 'chargeUser'" #default="scoped">
            <dc-view v-model="scoped.row.chargeUser" objectName="user" showKey="realName"></dc-view>
          </template>
          <template v-else #default="{ row }">
            {{ [null, '', undefined].includes(row[col.prop]) ? '-' : row[col.prop] }}
          </template>
        </el-table-column>
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
</template>

<script setup name="onSiteReporting">
import { computed, getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { onMounted } from 'vue';
import store from '@/store/index';
import { subColumns } from './utils';
import { useRoute } from 'vue-router';
const { proxy } = getCurrentInstance();
const route = useRoute();
// 递归计算子节点总数（包括嵌套子节点）
const countLeafNodes = node => {
  if (!node.children) return 1;
  let count = 0;
  const stack = [...node.children];
  while (stack.length) {
    const current = stack.pop();
    if (current.children) {
      stack.push(...current.children);
    } else {
      count++;
    }
  }
  return count + 1; // +1 包含父节点自身
};

/** 展示全部 */
const showAll = computed(() => {
  return route.query?.showAll;
});

// 树形合并逻辑
const treeSpanMethod = ({ row, column, rowIndex }) => {
  const spanCols = ['phase'];
  // 只在名称列合并父节点
  if (spanCols.includes(column.property) && row.children) {
    return {
      rowspan: 1, //countLeafNodes(row), // 合并行数=子节点数+1（父节点自身）
      colspan: 9, //row.children.length,
    };
  }
  // 子节点隐藏名称列
  if (column.property === 'name' && row.hasOwnProperty('isLeaf')) {
    return { rowspan: 0, colspan: 0 };
  }
};

const tableColumns = ref([
  {
    label: '所属部门',
    width: '100px',
    prop: 'deptName',
  },
  {
    label: '客户产品',
    width: '100px',
    prop: 'customerProductCode',
  },
  {
    label: 'Project',
    width: '100px',
    prop: 'projectCode',
  },
  // {
  //   label: 'Station',
  //   width: '260px',
  //   prop: 'stationCode',
  // },
  {
    label: 'CM编码',
    width: '100px',
    prop: 'cmCode',
  },
  {
    label: 'CM全称',
    width: '200px',
    prop: 'customerName',
  },
  {
    label: 'Line Name',
    width: '260px',
    prop: 'lineCode',
  },
  {
    label: '驻点国家',
    width: '200px',
    prop: 'country',
  },
  {
    label: '驻点省份',
    width: '100px',
    prop: 'province',
  },
  {
    label: '驻点城市',
    width: '100px',
    prop: 'city',
  },
  {
    label: 'FAEDRI',
    width: '100px',
    prop: 'chargeUser',
  },
  {
    label: 'TPM总模组数',
    width: '100px',
    prop: 'moduleCount',
  },
  {
    label: '线体数',
    width: '100px',
    prop: 'lineCount',
  },
  {
    label: 'MP/NPI',
    width: '200px',
    prop: 'npiOrMp',
  },
  {
    label: 'Demand总数',
    width: '100px',
    prop: 'demandNow',
  },
  // {
  //   label: '分类',
  //   width: '100px',
  //   prop: '',
  // },
  {
    label: '统计类别',
    width: '140px',
    render(_, row) {
      return row.phase !== '/' ? `${row.type}  ${row.phase}` : row.phase;
    },
    prop: 'phase',
  },
  {
    label: '单独下PO人数',
    width: '100px',
    prop: 'PO',
  },
  {
    label: '包含机台报价内人数',
    width: '100px',
    prop: 'price',
  },
  {
    label: '报价内人数起止时间',
    width: '360px',
    prop: 'startTime',
    render(t, row) {
      return t ? `${row.startTime}-${row.endTime}` : '-';
    },
  },
  {
    label: 'Free人数',
    width: '100px',
    prop: 'free',
  },
  {
    label: 'L1人数',
    width: '100px',
    render(num) {
      return num ? num.toString().match(/^\d+(?:\.\d{0,2})?/)[0] : num;
    },
    prop: 'L1',
  },
  {
    label: 'L2人数',
    width: '100px',
    render(num) {
      return num ? num.toString().match(/^\d+(?:\.\d{0,2})?/)[0] : num;
    },
    prop: 'L2',
  },
  {
    label: 'L3人数',
    width: '100px',
    render(num) {
      return num ? num.toString().match(/^\d+(?:\.\d{0,2})?/)[0] : num;
    },
    prop: 'L3',
  },
]);

// 数据字典
const data = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  selectedIds: null,
  formData: {
    customerId: null,
    phaseId: null,
    planOrderPhaseId: null,
  },
  open: false,
  planOrderPhases: [],
  //   rules: {
  //     orderName: [{ required: true, message: '请输入', trigger: 'change' }],
  //     orderCode: [{ required: true, message: '请选择', trigger: 'change' }],
  //     reportUserId: [{ required: true, message: '请输入', trigger: 'change' }],
  //     phaseName: [{ required: true, message: '请输入', trigger: 'change' }],
  //     startTime: [{ required: true, message: '请选择', trigger: 'change' }],
  //     endTime: [{ required: true, message: '请选择', trigger: 'change' }],
  //     progress: [{ required: true, message: '请选择', trigger: 'change' }],
  //   },
  dataList: [],
  selectedPhase: null,
  title: '',
  editTimer: null,
  mmrPlanOrderList: [],
  optionDept: [],
});

const {
  loading,
  queryParams,
  total,
  tableData,
  selectedIds,
  formData,
  open,
  planOrderPhases,
  rules,
  dataList,
  selectedPhase,
  title,
  editTimer,
  mmrPlanOrderList,
  optionDept,
} = toRefs(data);

onMounted(() => {
  const deptName = route.query?.deptName;
  if (deptName) {
    queryParams.value.deptName = deptName;
  }
  getData();
  //   getDataList();
  getDataPhaseName();

  getDeptData();
});

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const query = {
      ...queryParams.value,
      projectConfigId: queryParams.value.projectConfigId?.id
        ? queryParams.value?.projectConfigId?.id
        : queryParams.value.projectConfigId,
      stationConfigId: queryParams.value?.stationConfigId?.id
        ? queryParams.value?.stationConfigId?.id
        : queryParams.value.stationConfigId,
    };
    const res = await Api.pdp.mmrPlanCount.list(query);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
      tableData.value.forEach(item => {
        const matchedPhase = dataList.value.find(phase => phase.id === item.phaseId);
        item.phaseName = matchedPhase ? matchedPhase.mmrPhaseName : null; // 处理找不到的情况
      });
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 获取部门列表
const getDeptData = async () => {
  try {
    loading.value = true;
    const params = { current: 1, size: 1000 };
    const res = await Api.pdp.productDepartment.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      optionDept.value = data.records || [];
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 获取数据
const getDataPhaseName = async () => {
  try {
    loading.value = true;
    const params = {
      current: 1,
      size: 100000,
    };
    const res = await Api.pdp.mmrPlanPhaseInfo.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

/** 重置搜索 **/
const handleReset = () => {
  queryParams.value.current = 1;
  proxy.resetForm('queryRef');
  getData();
};

const exportData = mode => {
  if (mode === 'all') {
    Api.pdp.mmrPlanPhaseInfo.exportAll();
  } else if (mode === 'current') {
    Api.pdp.mmrPlanPhaseInfo.exportCurrent(queryParams.value);
  }
};
</script>
<style lang="scss" scoped>
.content-warp {
  .ht {
    height: 70px;
  }
}

.search-left {
  :deep(.el-select) {
    width: 100%;
  }
}

.self-column {
  width: 100%;
  display: inline-block;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  padding: 0 8px;
  line-height: 45px;
  height: 45px;
}

.custom-form {
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  .form-itme-width_100 {
    width: 100%;
  }
}

.form-center {
  display: flex;
  flex-wrap: wrap;
}

.form-group-title {
  display: flex;
  align-items: center;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin: 20px 0;
  &::before {
    margin-right: 4px;
    display: block;
    content: '';
    width: 4px;
    height: 13px;
    background-color: #f78431;
  }
}

.close-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 27px;
  height: 27px;
  background-color: #bbb;
  border-radius: 50%;
  left: 7px;
  top: 15px;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}
.left-head {
  padding: 24px;
  border-bottom: 1px solid #f5f5f5;
  &_title {
    font-weight: bold;
    font-size: 18px;
    color: #333;
    line-height: 18px;
  }
  &_info {
    margin-top: 20px;
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #666;
    line-height: 14px;
    gap: 12px;
  }
}
</style>
