<template>
  <div class="content-wrap" v-loading="loading">
    <div class="main-container">
      <div class="table-container">
        <el-table :data="tableData" @row-click="handleRowClick">
          <el-table-column
            prop="mtoNo"
            label="专案号"
            width="120"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="name"
            label="成品名称"
            min-width="180"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="number"
            label="成品码"
            width="180"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column prop="institutionsId" label="机构工程" width="80" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.institutionsId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column prop="electricalId" label="电气工程" width="80" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.electricalId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column prop="electricalContrId" label="电子工程" width="80" align="center">
            <template #default="scoped">
              <dc-view
                v-model="scoped.row.electricalContrId"
                objectName="user"
                showKey="realName"
              />
            </template>
          </el-table-column>
          <el-table-column prop="softwareId" label="软件工程" width="80" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.softwareId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column prop="tpmId" label="TPM" width="80" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.tpmId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column prop="pmId" label="内部PM" width="80" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.pmId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column
            prop="etd"
            label="ETD"
            width="120"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="eta"
            label="ETA"
            width="120"
            align="center"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup name="ProjectCase">
import { reactive, toRefs, onMounted } from 'vue';
import Api from '@/api/index';

const route = useRoute();
const router = useRouter();

const compData = reactive({
  loading: false,
  tableData: [],
});

const { loading, tableData } = toRefs(compData);

onMounted(() => {
  getData();
});

// 详情
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.deliverystartsubmit.list({
      projectId: route.params.projectId,
      size: 999999,
      current: 1,
    });
    const {
      code,
      data: { records },
    } = res.data;
    if (code === 200) {
      tableData.value = records || [];
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

// 处理行点击
const handleRowClick = row => {
  router.push(`/pdp/project/case/${row.projectId}/${row.id}`);
};
</script>
<style lang="scss" scoped>
.content-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  .main-container {
    display: flex;
    flex-direction: column;
    padding: 16px;
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>
