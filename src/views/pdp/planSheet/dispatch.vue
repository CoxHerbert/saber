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
          <el-form-item class="form-itme-width_50" label="所属部门" id="deptName" prop="deptName">
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
          <el-form-item label="计划单号" prop="lineCode">
            <el-input v-model="queryParams.lineCode" placeholder="请输入计划单号" />
          </el-form-item>

          <!-- <el-form-item label="Project" prop="projectConfigId">
            <dc-select-dialog
              v-model="queryParams.projectConfigId"
              placeholder="请选择Project"
              objectName="projectConfig"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
          </el-form-item>
          <el-form-item label="Station" prop="stationConfigId">
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
          <el-form-item label="CM厂" prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入CM厂" />
          </el-form-item>

          <el-form-item label="入驻人" prop="inUserId">
            <dc-select-user
              v-model="queryParams.inUserId"
              placeholder="请选择入驻人"
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
    </div>
    <div class="table-container" v-loading="loading">
      <el-button
        type="primary"
        @click="handleInitiate"
        v-permission="{ id: 'DC_DISPATCH_ADD' }"
        class="mb-5"
        >发起流程</el-button
      >
      <el-table :data="tableData" :row-style="{ height: '48px' }">
        <el-table-column label="序号" width="100" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <!-- processFromData -->
        <el-table-column label="所属部门" align="center" width="180" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.inDeptName ? scoped.row.inDeptName : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="outOrderCode"
          label="调出计划单编号"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="inOrderCode"
          label="调入计划单编号"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <!-- <el-table-column
          prop="inProjectConfigId"
          label="Project"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.inProjectConfigId" objectName="projectConfig"></dc-view>
          </template>
        </el-table-column>
        <el-table-column
          prop="inStationConfigId"
          label="Station"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.inStationConfigId" objectName="stationConfig"></dc-view>
          </template>
        </el-table-column> -->
        <el-table-column prop="inCustomerName" label="CM厂" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.inCustomerName }}
          </template>
        </el-table-column>
        <el-table-column
          prop="inStartDate"
          label="调入地开始时间"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="inEndDate"
          label="调入地结束时间"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="inUserName" label="入驻人" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.inUserName }}
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

<script setup name="MyClientsList">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { proxy } = getCurrentInstance();

const data = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
    businessId: null,
  },
  total: 0,
  tableData: [],
  optionDept: [],
});

const { loading, queryParams, total, tableData, optionDept } = toRefs(data);

onMounted(() => {
  getDeptData();
  getData();
});

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

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.dispatch.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      const dataList = data.records.map(item => {
        const processFromData = JSON.parse(item.processFromData);
        item.processFromData = processFromData;
        return item.processFromData;
      });
      tableData.value = dataList;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

const handleInitiate = async () => {
  const params = {
    processKey: 'DISPATCH_APPLICATION_PROCESS',
  };
  const res = await Api.pdp.settled.processForm(params);
  const { code, data } = res.data;
  if (code === 200) {
    router.push(`/workflow/process/start/${data.enCode}`);
  }
};
/** 重置搜索 **/
const handleReset = () => {
  queryParams.value.current = 1;
  queryParams.value.businessId = null;
  proxy.resetForm('queryRef');
  proxy.resetForm('openQueryRef');
  getData();
};
</script>
<style lang="scss" scoped></style>
