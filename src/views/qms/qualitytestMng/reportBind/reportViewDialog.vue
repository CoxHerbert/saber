<template>
  <el-dialog v-model="dialogVisible" width="70%" title="报告信息" @close="cancel">
    <basic-container>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" stripe>
          <el-table-column label="序号" type="index" width="60px" align="center">
            <template #default="scoped">
              <span>{{ scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="三次元测量仪"
            align="center"
            prop="no"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            min-width="100px"
            label="标准值(mm)"
            align="center"
            prop="nominal"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column label="正公差(mm)" align="center" prop="uptol" />
          <el-table-column label="负公差(mm)" align="center" prop="lotol" />
          <el-table-column label="上限" align="center" prop="upper" />
          <el-table-column label="下限" align="center" prop="lower" />
          <el-table-column label="最大值" align="center" prop="max" />
          <el-table-column label="最小值" align="center" prop="min" />
          <el-table-column label="B1" align="center">
            <el-table-column label="data" align="center" prop="data" />
            <el-table-column label="OK/NG" align="center" prop="outcome" />
            <el-table-column label="超差" align="center" prop="overProof" />
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
    </basic-container>
  </el-dialog>
</template>
<script setup name="Productiongroup">
import Api from '@/api/index';
const data = reactive({
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
    qualityCode: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  switchValue: true,
  title: '',
  dialogVisible: false,
});

const { queryParams, formData, dataList, loading, total, dialogVisible } = toRefs(data);

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.qms.sn.getSnQualityList(queryParams.value);
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

// 打开添加弹窗
const openDialog = qualityCode => {
  data.queryParams.qualityCode = qualityCode;
  dialogVisible.value = true;

  getData();
};

defineExpose({
  openDialog,
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
:deep(.el-card__body) {
  padding: 0px;
}
</style>
