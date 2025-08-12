<template>
  <div class="content-warp">
    <div class="page-header-box header none-border ht">
      <div class="title w-full">
        <el-tabs v-model="activeName" @tab-change="handleClick">
          <el-tab-pane label="全部" name=""></el-tab-pane>
          <el-tab-pane
            :label="tab.label"
            :name="tab.dictKey"
            v-for="(tab, index) in DC_MMR_PLAN_ORDER_STATUS"
            :key="index"
          ></el-tab-pane>
        </el-tabs>
      </div>
      <el-button
        type="primary"
        icon="Plus"
        v-permission="{ id: 'PLAN_SHEET_ADD' }"
        @click="handleRouterAdd"
        >新增</el-button
      >
      <!-- <el-upload
        :show-file-list="false"
        accept=".xls,.xlsx"
        :http-request="uploadFile"
        class="ml-2 mr-2"
      >
        <el-button type="primary" icon="Upload">导入</el-button>
      </el-upload>
      <el-button type="info" @click="downloadExcel" icon="Download">下载导入模板</el-button>
      <el-button type="primary" @click="exportMmrPlanOrder" icon="Download">导出</el-button> -->
      <el-button type="primary" v-permission="{ id: 'PLAN_SHEET_BATCH_DEL' }" @click="handleRemove"
        >批量删除</el-button
      >
    </div>
    <div class="search">
      <div class="search-left">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="auto">
          <el-form-item label="计划名称" prop="lineCode">
            <el-input v-model="queryParams.lineCode" placeholder="请输入计划名称" />
          </el-form-item>
          <el-form-item label="客户产品" prop="customerProductCode">
            <el-select
              v-model="queryParams.customerProductCode"
              clearable
              filterable
              placeholder="请选择客户产品"
              @change="handleSelect"
            >
              <el-option
                v-for="item in selectList"
                :key="item.fnumber"
                :label="item.fdatavalue"
                :value="item.fnumber"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="项目" prop="projectId">
            <dc-select-dialog
              v-model="queryParams.projectId"
              placeholder="请选择项目"
              objectName="pdpProject"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
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
          <el-form-item label="厂区" prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入厂区" />
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
          <!-- <el-form-item label="所属部门" prop="tpmDeptId">
            <el-cascader
              placeholder="请选择部门"
              v-model="queryParams.tpmDeptId"
              :options="optionDept"
              clearable
              :props="{
                label: 'title',
                value: 'id',
              }"
              @change="handleCascaderChange"
              class="w-full"
            />
          </el-form-item> -->
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="getData">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <div class="table-container" v-loading="loading">
      <el-table
        :data="tableData"
        :row-style="{ height: '48px' }"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="100" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="deptName"
          label="所属部门"
          align="center"
          width="100"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column prop="lineCode" label="计划名称" align="center" width="180" />
        <el-table-column
          prop="customerProductName"
          label="客户产品"
          align="center"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="projectCode"
          label="Project"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="planOrderStatus" label="状态" align="center" show-overflow-tooltip>
          <template #default="scoped">
            <span class="status-item" @click="handleStatusClick(scoped.row)">
              <dc-dict-key
                :color="scoped.row.colorLabel"
                :options="DC_MMR_PLAN_ORDER_STATUS"
                :value="scoped.row.planOrderStatus"
            /></span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="厂区" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.customerName }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="chargeUser" label="FAEDRI" align="center" show-overflow-tooltip>
          <template #default="scoped">
            <dc-view v-model="scoped.row.chargeUser" objectName="user" showKey="realName" />
          </template>
        </el-table-column> -->
        <el-table-column prop="tpmId" label="FAEDRI" align="center" show-overflow-tooltip>
          <template #default="scoped">
            <dc-view v-model="scoped.row.tpmId" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间 " align="center" show-overflow-tooltip />
        <el-table-column prop="createUser" label="创建人" align="center" show-overflow-tooltip>
          <template #default="scoped">
            <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="140">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              v-permission="{ id: 'PLAN_SHEET_DETAIL' }"
              @click="handleDetail(scoped.row)"
              >查看</el-button
            >
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

    <Submit ref="planSheetRef" @confirm="getData()" :isShowChild="false" />
  </div>
</template>

<script setup name="MyClientsList">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Submit from './submit.vue';
// import { exportBlob } from '@/api/common';
// import { downloadXls } from '@/utils/util';
// import { getToken } from '@/utils/auth';
// import website from '@/config/website';
// import dayjs from 'dayjs';
// import { ElMessage } from 'element-plus';
const router = useRouter();
const { proxy } = getCurrentInstance();
// 数据字典
const { DC_MMR_PLAN_ORDER_STATUS } = proxy.useCache([{ key: 'DC_MMR_PLAN_ORDER_STATUS' }]);

const data = reactive({
  loading: false,
  activeName: '',
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  planSheetRef: null,
  selectedIds: null,
  selectList: [],
  optionDept: [],
});

const {
  loading,
  queryParams,
  total,
  activeName,
  tableData,
  planSheetRef,
  selectedIds,
  selectList,
  optionDept,
} = toRefs(data);

onMounted(() => {
  getData();
  getDeptData();
  selectData();
});

const handleStatusClick = row => {
  router.push({
    path: '/pdp/planSheet/onSitePlan/index',
    query: {
      lineCode: row.lineCode,
    },
  });
};

const handleSelect = value => {
  queryParams.value.customerProductCode = value;
};

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const param = {
      ...queryParams.value,
      projectConfigId: queryParams.value.projectConfigId?.id
        ? queryParams.value.projectConfigId.id
        : queryParams.value.projectConfigId,
      stationConfigId: queryParams.value.stationConfigId?.id
        ? queryParams.value.stationConfigId.id
        : queryParams.value.stationConfigId,
    };
    const res = await Api.pdp.mmrPlanOrder.listNoCache(param);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
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

// 客户产品数据
const selectData = async () => {
  const params = {
    current: 1,
    size: 1000,
  };
  const res = await Api.pdp.mmrPlanOrder.select(params);
  const { code, data } = res.data;
  if (code == 200) {
    selectList.value = data.records;
  }
};

// 勾选事件
const handleSelectionChange = selection => {
  selectedIds.value = selection.map(item => item.id).join(',');
};

// 删除
const handleRemove = () => {
  const ids = selectedIds.value;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.mmrPlanOrder.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

// 点击行选中
const handleRowClick = (row, column, event) => {
  handleDetail(row);
};

/** 重置搜索 **/
const handleReset = () => {
  queryParams.value.current = 1;
  proxy.resetForm('queryRef');
  getData();
};

// tab切换方法
// 如果点击的是全部 就删除字段
const handleClick = tab => {
  if (tab === '') {
    queryParams.value.current = 1;
    delete queryParams.value.planOrderStatus;
  } else {
    queryParams.value.current = 1;
    queryParams.value.planOrderStatus = tab;
  }
  getData();
};

/** 查看 */
const handleDetail = row => {
  router.push({
    path: `/pdp/planSheet/detail/detail/${row.id}`, // `/pdp/planSheet/detail/detail/${row.id}`,
  });
};

/** 新增 */
const handleRouterAdd = () => {
  planSheetRef.value.openDrawer();
};

// const downloadExcel = () => {
//   // 文件的 HTTP 链接
//   const excelUrl =
//     'https://static.eastwinbip.com/static/%E7%8E%B0%E5%9C%BA%E8%AE%A1%E5%88%92%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88%E7%A4%BA%E4%BE%8B.xlsx';

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

/** 导出 **/
// const exportMmrPlanOrder = () => {
//   exportBlob(`/blade-bip/mmr-plan-order/export?${website.tokenHeader}=${getToken()}`).then(res => {
//     downloadXls(res.data, `计划列表-${dayjs().format('YYYY-MM-DD HH:mm:ss')}.xlsx`);
//   });
// };

// const uploadFile = async fileObj => {
//   const formData = new FormData();
//   formData.append('file', fileObj.file); // fileObj.file 是上传的文件

//   try {
//     const response = await axios.post(
//       '/blade-bip/mmr-plan-order/import-plan-order-template',
//       formData
//     );

//     if (response.data.code === 200) {
//       ElMessage.success('导入成功！');
//     } else {
//       ElMessage.error(response.data.message || '导入失败');
//     }
//   } catch (error) {
//     console.error('导入失败', error);
//     ElMessage.error('导入失败，请稍后重试');
//   }
// };

// const handleCascaderChange = value => {
//   const lastId = value[value.length - 1];
//   queryParams.value.tpmDeptId = lastId; // 只保留最后一个层级的 id
// };
</script>
<style lang="scss" scoped>
.page-header-box {
  border-bottom: 1px solid #dadbe0 !important;
  margin-bottom: 16px;
  :deep(.el-tabs__nav-wrap:after) {
    background-color: transparent;
  }
}
.status-item {
  width: 100%;
  display: block;
  height: 100%;
}
</style>
