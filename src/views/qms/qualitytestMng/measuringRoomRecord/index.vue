<template>
  <div class="app-container">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name=""></el-tab-pane>
      <el-tab-pane
        v-for="(item, i) in SN_CHECK_STATUS"
        :key="i"
        :label="item.dictValue"
        :name="item.dictKey"
      ></el-tab-pane>
    </el-tabs>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <!-- 在此添加搜索项 -->
      <el-form-item label="专案号" prop="mtono">
        <el-input v-model="queryParams.mtono" placeholder="请输入专案号" clearable />
      </el-form-item>
      <el-form-item label="物料编码" prop="materialNum">
        <el-input v-model="queryParams.materialNum" placeholder="请输入物料编码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="body-container">
      <div class="mb-3">
        <el-button
          type="primary"
          v-if="operateStatus === 'SN_CHECK_STATUS_YJS'"
          v-permission="{ id: 'DC_COMPLETED' }"
          @click="handleBatchFinish"
          >标记已完成</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column label="物料编码" prop="materialNum" align="center" width="150">
            <template #default="scoped">
              <span>{{ scoped.row.materialNum || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="源单类型" prop="sourceType" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>
                <dc-dict-key :options="SN_CHECK_ORDER_TYPE" :value="scoped.row.sourceType"
              /></span>
            </template>
          </el-table-column>
          <el-table-column label="源单据编码" prop="sourceNo" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.sourceNo || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物料二维码" prop="purpose" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.purpose || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="专案号" prop="mtono" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.mtono || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="源单entryid"
            prop="sourceEntryid"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.sourceEntryid || '-' }}</span>
            </template>
          </el-table-column>

          <!-- <el-table-column label="数量" width="0" prop="count" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.count || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="sn已打数量"
            width="100"
            prop="snCount"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.snCount || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="绑定报告数量"
            width="110"
            prop="bindReportCount"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.bindReportCount || '-' }}</span>
            </template>
          </el-table-column> -->
          <el-table-column
            label="检测收入时间"
            prop="checkStartTime"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.checkStartTime || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="检测收入时间"
            prop="checkStartTime"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.checkStartTime || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="检测完成时间"
            prop="checkEndTime"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.checkEndTime || '-' }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column
            label="送回仓库时间"
            width="100"
            prop="backWarehouseTime"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.backWarehouseTime || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="送回仓库人"
            width="100"
            prop="backWarehouseUser"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.backWarehouseUser || '-' }}</span>
            </template>
          </el-table-column> -->
          <el-table-column
            label="处理状态"
            prop="operateStatus"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>
                <dc-dict-key :options="SN_CHECK_STATUS" :value="scoped.row.operateStatus"
              /></span>
            </template>
          </el-table-column>
          <el-table-column
            label="处理备注"
            prop="operateRemark"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.operateRemark || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
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

<script setup name="MeasuringRoomRecord">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const { SN_CHECK_TYPE, SN_CHECK_ORDER_TYPE, SN_CHECK_STATUS } = proxy.useCache([
  { key: 'SN_CHECK_TYPE' },
  { key: 'SN_CHECK_ORDER_TYPE' },
  { key: 'SN_CHECK_STATUS' },
]);

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  activeName: '',
  operateStatus: null,
  selectedRows: [],
});

const { loading, queryParams, dataList, total, activeName, operateStatus, selectedRows } =
  toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.qms.sn.getSnCheckMaterialList({
      ...queryParams.value,
      checkType: 'SN_CHECK_TYPE_SN',
      operateStatus: operateStatus.value === '' ? null : operateStatus.value,
    });
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

// 处理查询
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};

const handleTabClick = tab => {
  operateStatus.value = tab.props.name;
  getData();
};

const handleSelectionChange = value => {
  selectedRows.value = value;
};
const handleBatchFinish = async () => {
  try {
    loading.value = true;
    const str = selectedRows.value.map(item => item.id).join(',');
    const res = await Api.qms.sn.batchFinish({ ids: str });
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      getData();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scopedd></style>
