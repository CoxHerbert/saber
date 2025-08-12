<template>
  <div class="app-container">
    <div class="operate-container mb-5">
      <el-button type="primary" icon="Refresh" @click="handleSubmit">更新</el-button>
    </div>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column
        label="线体 (Watch/Audio/Enclosure/TE/半导体)"
        prop="productName"
        align="center"
      />
      <el-table-column label="On hand 总人数" prop="onHandPeopleCount" align="center" />
      <el-table-column label="NPI" prop="npi" align="center" />
      <el-table-column label="单独下 PO 人数" prop="singlePoPeopleCount" align="center" />
      <el-table-column label="含在机台报价内人数" prop="numberOfQuotations" align="center" />
      <el-table-column label="Free" align="center">
        <el-table-column label="MP Free 人数" prop="mpFreePeopleCount" align="center" />
        <el-table-column label="支援" align="center">
          <el-table-column
            label="支援到装配部 (含 DG & VN)"
            prop="numberOfSupportDept"
            align="center"
          />
          <el-table-column label="支援到现场项目" prop="suppo6rtOnSite" align="center" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="管理员人数" prop="numberOfManagers" align="center" />
      <el-table-column label="请假" prop="numberOfPeopleOnLeave" align="center" />
      <el-table-column label="离职中" prop="resignationInProgress" align="center" />
    </el-table>
    <!-- 分页 -->
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>
</template>

<script setup>
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';

const { proxy } = getCurrentInstance();

const {} = proxy.useCache([]);

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
});

const { loading, queryParams, dataList, total } = toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.manpowerPlanning.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data;
      total.value = data.total;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = () => {
  getData();
};
</script>

<style lang="scss" scoped></style>
