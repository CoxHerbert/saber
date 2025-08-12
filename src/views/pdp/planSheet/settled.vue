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
          </el-form-item> -->
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
        v-permission="{ id: 'DC_SETTLED_ADD' }"
        @click="handleInitiate"
        class="mb-5"
        >发起流程</el-button
      >
      <el-table :data="tableData" :row-style="{ height: '48px' }">
        <el-table-column label="序号" width="100" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="planDeptName" label="所属部门" align="center"
          ><template #default="scoped">{{
            scoped.row.planDeptName ? scoped.row.planDeptName : '-'
          }}</template></el-table-column
        >
        <el-table-column
          prop="lineCode"
          label="计划单号"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <!-- <el-table-column
          prop="projectConfigId"
          label="Project"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.projectConfigId" objectName="projectConfig"></dc-view>
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          prop="stationConfigId"
          label="Station"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.stationConfigId" objectName="stationConfig"></dc-view>
          </template>
        </el-table-column> -->
        <el-table-column prop="customerName" label="CM厂" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.customerName }}
          </template>
        </el-table-column>
        <el-table-column prop="tpmId" label="TPM" align="center" show-overflow-tooltip>
          <template #default="scoped">
            <dc-view v-model="scoped.row.tpmId" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column prop="inUserInfo" label="入驻人" align="center" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.inUserInfo.realName }}
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" align="center" show-overflow-tooltip />
        <el-table-column prop="endTime" label="结束时间" align="center" show-overflow-tooltip />
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

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.settled.list(queryParams.value);
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

const handleInitiate = async () => {
  const params = {
    processKey: 'PERSONNEL_ENTRY',
  };
  const res = await Api.pdp.settled.processForm(params);
  const { code, data } = res.data;
  if (code === 200) {
    router.push(`/workflow/process/start/${data.enCode}?parentMenuId=1892026074556194817`);
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
