<template>
  <el-dialog v-model="dialogVisible" width="70%" title="历史记录" @close="cancel">
    <basic-container>
      <el-form
        class="search-container"
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        @keyup.enter="handleQuery"
      >
        <el-form-item class="form-itme-width_30" label="机台选择" id="customerId" prop="customerId">
          <dc-select v-model="queryParams.orgId" objectName="org" placeholder="请选择" clearable />
        </el-form-item>
        <el-form-item class="form-itme-width_30" label="报告编码" id="customerId" prop="customerId">
          <dc-select v-model="queryParams.orgId" objectName="org" placeholder="请选择" clearable />
        </el-form-item>
        <el-form-item class="form-itme-width_30" label="专案号" id="customerId" prop="customerId">
          <dc-select v-model="queryParams.orgId" objectName="org" placeholder="请选择" clearable />
        </el-form-item>
        <el-form-item class="form-itme-width_30" label="操作员" id="customerId" prop="customerId">
          <dc-select v-model="queryParams.orgId" objectName="org" placeholder="请选择" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="序号" type="index" width="60px" align="center">
            <template #default="scoped">
              <span>{{ scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            min-width="100px"
            label="机台"
            align="center"
            prop="code"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            min-width="100px"
            label="报告编码"
            align="center"
            prop="name"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column min-width="120px" label="工序码" align="center" prop="leader" />
          <el-table-column min-width="120px" label="专案号" align="center" prop="leader" />
          <el-table-column min-width="120px" label="料号" align="center" prop="leader" />
          <el-table-column min-width="120px" label="品名" align="center" prop="leader" />
          <el-table-column min-width="120px" label="规格" align="center" prop="leaderMobile" />
          <el-table-column min-width="120px" label="报告时间" align="center" prop="leader" />
          <el-table-column min-width="120px" label="操作员" align="center" prop="leader" />
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </basic-container>
  </el-dialog>
</template>
<script setup name="Productiongroup">
import Api from '@/api/index';
const { proxy } = getCurrentInstance();
const data = reactive({
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  dialogVisible: false,
});

const { queryParams, formData, dataList, loading, total, dialogVisible } = toRefs(data);

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.qms.sn.getLaborCompanyList(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
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
    size: 10,
    workGroupName: undefined,
    areaName: undefined,
    chargePerson: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

// 打开添加弹窗
const openHistoryDialog = row => {
  getData();
  dialogVisible.value = true;
};

defineExpose({
  openHistoryDialog,
});

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = {};
};
</script>
<style lang="scss" scoped>
.form-itme-width_30 {
  width: 17%;
}
</style>
