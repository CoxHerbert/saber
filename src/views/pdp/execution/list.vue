<template>
  <div class="page-execution-list content-warp">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
      <!-- <el-tabs class="w-full" @tab-change="handleClick">
        <el-tab-pane
          :label="tab.label"
          v-for="(tab, index) in tabData"
          :name="tab.value"
          :key="index"
        ></el-tab-pane>
      </el-tabs>
      <div class="header-right"> -->
      <!-- <el-upload
          action=""
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          accept=".xls,.xlsx"
          :show-file-list="false"
          class="upload"
        >
          <el-button type="primary" icon="Plus">导入</el-button>
        </el-upload>
        <el-button type="info" style="margin-left: 16px" @click="downloadExcel" icon="Download"
          >下载导入模板</el-button
        > -->
      <!-- <el-button type="primary" icon="Plus" @click="btnAdd">新增</el-button>
        <el-button
          :disabled="!(selectedIds && selectedIds.length > 0)"
          icon="Delete"
          @click="handleDelete"
          >批量删除</el-button
        > 
      </div>-->
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
    <!-- <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          ref="searchFromRef"
          :inline="true"
          :model="queryParams"
          label-width="auto"
        >
          <el-form-item label="组织" prop="fSaleOrgId">
            <el-select v-model="queryParams.realFOrgId" clearable placeholder="请选择组织">
              <el-option
                v-for="item in cacheData.ORG_LIST_CACHE"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="单据类型" prop="fBillTypeDictId">
            <el-select v-model="queryParams.fBillTypeDictId" clearable placeholder="请选择单据类型">
              <el-option-group
                v-for="group in cacheData.DC_BILL_TYPE"
                :key="group.id"
                :label="group.label"
              >
                <el-option
                  v-for="option in group.children"
                  :key="option.id"
                  :label="option.label"
                  :value="option.value"
                />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="单据编号" prop="fBillNo">
            <el-input v-model="queryParams.fBillNo" placeholder="请输入单据编号" clearable />
          </el-form-item>
          <el-form-item label="日期" prop="fDate">
            <dc-date-range
              v-model:startDate="queryParams.startTime"
              v-model:endDate="queryParams.endTime"
              :clearable="false"
            />
          </el-form-item>
          <el-form-item label="客户" prop="fCustId">
            <el-select
              v-model="queryParams.fCustId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入客户名称进行搜索"
              :remote-method="remoteCustomerOptions"
              clearable
            >
              <el-option
                v-for="item in customerOptions"
                :key="item.customerFNumber"
                :label="item.customerFName"
                :value="item.customerFNumber"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="处理人" prop="currentOperatorId">
            <dc-select-user
              v-model="queryParams.currentOperatorId"
              placeholder="请选择处理人"
              returnType="string"
              :multiple="false"
              :multiple-limit="1"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="getData">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div> -->

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

// const beforeUpload = file => {
//   const isExcel =
//     file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//     file.type === 'application/vnd.ms-excel';
//   if (!isExcel) {
//     // 使用 Element Plus 的消息提示
//     proxy.$message.error('只能上传 Excel 文件!');
//   }
//   return isExcel;
// };

// 确认解析xlsx 赋值
const handleFileChange = file => {
  // open.value = true;
  // const reader = new FileReader();
  // reader.onload = e => {
  //   const ab = e.target.result;
  //   const workbook = XLSX.read(ab, { type: 'array' });
  //   // 获取第一个工作表的内容
  //   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //   const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  //   // 格式化数据  需要什么加什么
  //   addDataList.value = jsonData.slice(1).map(row => ({
  //     fMaterialId: row[0],
  //     fMaterialName: row[1],
  //     fMaterialModel: row[2],
  //     fUnitId: row[3],
  //     fQty: row[4],
  //   }));
  // };
  // reader.readAsArrayBuffer(file.raw);
};

// const downloadExcel = () => {
//   // 文件的 HTTP 链接
//   const excelUrl =
//     'https://static.eastwinbip.com/static/file/%E6%89%A7%E8%A1%8C%E7%94%B3%E8%AF%B7%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF1.xlsx';

//   // 创建一个 a 标签用于下载
//   const link = document.createElement('a');
//   link.href = excelUrl;
//   link.download = 'example.xlsx'; // 自定义下载文件名

//   // 将 a 标签添加到文档并触发点击
//   document.body.appendChild(link);
//   link.click();

//   // 移除 a 标签
//   document.body.removeChild(link);
// };

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

// 点击搜索
const handleSerch = () => {
  queryParams.value.current = 1;
  getData();
};

//点击重置
const handleReset = () => {
  getData();
};

const handleSearch = () => {
  getData();
};

// tab点击
const handleClick = tab => {
  queryParams.value = {
    ...queryParams.value,
    current: 1,
    levelClass: tab,
  };
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

// 远程搜索获取客户列表
const remoteCustomerOptions = async fullname => {
  if (!fullname && fullname.length < 2) return;
  const form = {
    name: fullname,
  };

  const res = await Api.pdp.erpSelect.customers(form);
  const { code, data } = res.data;
  if (code === 200) {
    customerOptions.value = data;
  }
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
<style lang="scss" scoped>
.page-execution-list {
  padding-top: 0;
  position: relative;
  :deep(.el-tabs__nav-wrap:after) {
    height: 1px;
  }
  .header {
    padding-top: 6px;
    padding-bottom: 0;
  }
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
  .header-right {
    right: 10px;
    top: 0;
    position: absolute;
    min-width: 400px;
    display: flex;
    justify-content: flex-end;
    flex-flow: row nowrap;
  }
}
</style>
