<template>
  <div class="list-page page-execution-list">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <el-button type="primary" icon="Plus" @click="btnAdd">新增</el-button>
      <el-button
        :disabled="!(selectedIds && selectedIds.length > 0)"
        icon="Delete"
        @click="handleDelete"
        >批量删除</el-button
      >
    </div>

    <div class="table-container">
      <el-table
        :data="dataList"
        @row-dblclick="handleRowDbClick"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="dcErpOrderStatus"
          label="单据状态"
          align="center"
          show-overflow-tooltip
          width="100"
        >
          <template #default="scoped">
            <dc-dict
              type="text"
              :options="cacheData.DC_ERP_ORDER_STATUS"
              :value="scoped.row.dcErpOrderStatus"
            ></dc-dict>
          </template>
        </el-table-column>
        <el-table-column
          prop="currentOperatorId"
          label="当前处理人"
          align="center"
          show-overflow-tooltip
          width="100"
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.currentOperatorId" objectName="user" />
          </template>
        </el-table-column>
        <el-table-column
          prop="fBillTypeDictId"
          label="单据类型"
          align="center"
          show-overflow-tooltip
          width="100"
        >
          <template #default="scoped">
            <dc-dict
              type="text"
              :options="cacheData.DC_BILL_TYPE"
              :value="scoped.row.fBillTypeDictId"
            ></dc-dict>
          </template>
        </el-table-column>
        <el-table-column
          prop="fBillNo"
          label="单据编号"
          align="center"
          show-overflow-tooltip
          width="120"
        >
          <template #default="scoped">
            {{ [null, '', undefined].includes(scoped.row.fBillNo) ? '-' : scoped.row.fBillNo }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fDate"
          label="日期"
          align="center"
          show-overflow-tooltip
          width="110"
        />
        <el-table-column
          prop="realFOrgId"
          label="组织"
          align="center"
          show-overflow-tooltip
          width="110"
        >
          <template #default="scoped">
            <dc-dict
              type="text"
              :options="cacheData.ORG_LIST_CACHE"
              :value="scoped.row.realFOrgId"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="fMaterialId"
          label="物料编码"
          align="center"
          show-overflow-tooltip
          width="150"
        />
        <el-table-column
          prop="fMaterialName"
          label="物料名称"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="fTpmName" label="TPM" align="center" show-overflow-tooltip />
        <el-table-column
          prop="fCustName"
          label="客户"
          align="center"
          show-overflow-tooltip
          width="250"
        />
        <el-table-column prop="fSalerName" label="销售员" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{
              [null, '', undefined].includes(scoped.row?.fSalerName) ? '-' : scoped.row?.fSalerName
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fSaleDeptName"
          label="销售部门"
          align="center"
          show-overflow-tooltip
          width="120"
        >
          <template #default="scoped">
            {{
              [null, '', undefined].includes(scoped.row?.fSaleDeptName)
                ? '-'
                : scoped.row?.fSaleDeptName
            }}
          </template>
        </el-table-column>
        <el-table-column prop="fOraText3Name" label="运营跟单" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{
              [null, '', undefined].includes(scoped.row?.fOraText3Name)
                ? '-'
                : scoped.row?.fOraText3Name
            }}
          </template>
        </el-table-column>
        <el-table-column prop="fBdkText6" label="采购" align="center" show-overflow-tooltip />
        <el-table-column prop="fBdkBase" label="项目编码" align="center" show-overflow-tooltip />
        <el-table-column
          prop="fOraBaseName"
          label="终端客户"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="fOraCombo" label="订单类型" align="center" show-overflow-tooltip />
        <!-- <el-table-column prop="fOraCombo" label="项目" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row }}
          </template>
        </el-table-column> -->

        <el-table-column prop="fEwIsDev" label="研发订单" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.fewIsDev }}
            <span v-if="scoped.row.fewIsDev === true">是</span>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="fewAttachmentCount"
          label="附件数"
          align="center"
          show-overflow-tooltip
        /> -->
        <el-table-column prop="fNote" label="备注" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ [null, '', undefined].includes(scoped.row.fNote) ? '-' : scoped.row.fNote }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="80">
          <template #default="scoped">
            <el-button link type="primary" @click="handleDetail(scoped.row)">查看</el-button>
            <!-- <el-button link icon="Delete" @click="handleDelete(scoped.row)">删除</el-button> -->
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
<script setup name="ExecutionList">
import { reactive, toRefs, onMounted, watch } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const router = useRouter();

const cacheData = ref({
  DC_BILL_TYPE: [],
  DC_ERP_ORDER_STATUS: [],
  ORG_LIST_CACHE: [],
});

const data = reactive({
  loading: true,
  queryParams: {
    current: 1,
    size: 10,
    levelClass: 'all',
    realFOrgId: '100006',
  },
  searchConfig: null,
  total: 0,
  tabData: [
    { label: '全部', value: 'all' },
    { label: '进行中', value: 'processing' },
    { label: '已关闭', value: 'close' },
    { label: '我的', value: 'my' },
  ],
  dataList: [],
  projectType: [],
  customerOptions: [],
  selectedIds: null,
});

const {
  loading,
  queryParams,
  total,
  tabData,
  dataList,
  projectType,
  customerOptions,
  selectedIds,
  searchConfig,
} = toRefs(data);

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current', 'levelClass'],
    tabConfig: {
      prop: 'levelClass',
      items: [
        { label: '全部', value: 'all' },
        { label: '进行中', value: 'processing' },
        { label: '已关闭', value: 'close' },
        { label: '我的', value: 'my' },
      ],
    },
    searchItemConfig: {
      paramType: {
        realFOrgId: {
          label: '组织',
          type: 'select',
          options: cacheData.value.ORG_LIST_CACHE,
          labelKey: 'label',
          placeholder: '请选择组织',
          valueKey: 'value',
          paramKey: 'realFOrgId',
        },
        fBillTypeDictId: {
          label: '单据类型',
          type: 'select',
          options: cacheData.value.DC_BILL_TYPE,
          labelKey: 'label',
          withGroup: true,
          placeholder: '请选择单据类型',
          valueKey: 'id',
          paramKey: 'fBillTypeDictId',
        },
        fBillNo: {
          label: '单据编号',
          type: 'input',
          placeholder: '请输入单据编号',
          paramKey: 'fBillNo',
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
        currentOperatorId: {
          // label: '处理人',
          // type: 'input',
          // placeholder: '请输入处理人姓名',
          // paramKey: 'currentOperatorId',
          label: '处理人',
          type: 'dc-select-user',
          placeholder: '请选择处理人',
          paramKey: 'currentOperatorId',
          objectName: 'user',
          props: {
            returnType: 'string',
          },
        },
      },
    },
  };
};

const getDictMaps = async () => {
  try {
    const res = await proxy.useAsyncCache([
      { key: 'DC_BILL_TYPE' },
      { key: 'DC_ERP_ORDER_STATUS' },
      { key: 'ORG_LIST_CACHE' },
    ]);

    cacheData.value = res.value;
  } catch (error) {
    console.error('获取枚举失败', error);
  }
};

onMounted(async () => {
  await getDictMaps();
  initSearchConfig();
  dict();
  getData();
});

// 获取列表数据
const getData = async () => {
  loading.value = true;
  try {
    const res = await Api.pdp.dcErporder.list(queryParams.value);
    const { code, data } = res.data;
    if (code == 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 获取字典
const dict = async () => {
  loading.value = true;
  try {
    const res = await Api.pdp.dcErporder.dict();
    const { code, data } = res.data;
    if (code == 200) {
      projectType.value = data.项目类型;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};
//点击重置
const handleReset = () => {
  getData();
};

const handleSearch = () => {
  getData();
};

const btnAdd = () => {
  router.push({
    path: '/pdp/execution/steps/create',
  });
};

/** 查看 */
const handleDetail = row => {
  router.push({
    path: `/pdp/execution/steps/${row.id}`,
  });
};

// 删除
const handleDelete = () => {
  const configIds = { ids: selectedIds.value };
  proxy
    .$confirm('是否确认删除参数编号为"' + selectedIds.value + '"的数据项？')
    .then(async () => {
      return await Api.pdp.dcErporder.remove(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 勾选事件
const handleSelectionChange = selection => {
  selectedIds.value = selection.map(item => item.id).join(',');
};

const handleRowDbClick = row => handleDetail(row);
</script>
