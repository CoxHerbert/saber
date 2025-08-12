<template>
  <div class="app-container">
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <!-- 在此添加搜索项 -->
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable />
          </el-form-item>
          <el-form-item label="类型" prop="categoryId">
            <el-select v-model="queryParams.categoryId" placeholder="请选择类型" clearable>
              <el-option
                :label="option.label"
                :value="option.value"
                v-for="(option, index) in DC_CRM_PLAN"
                :key="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="行业类别" prop="sectorId">
            <el-select v-model="queryParams.sectorId" placeholder="请选择行业类别" clearable>
              <el-option
                :label="option.label"
                :value="option.value"
                v-for="(option, index) in DC_CRM_SECTOR"
                :key="index"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </div>
    </div>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          @click="handleSubmit"
          v-permission="{ id: 'DC_PDP_PLAN_TEMPLATE_ADD' }"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="模板名称" width="100" prop="templateName" align="center">
            <template #default="scoped">
              <span>{{ scoped.row.templateName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="行业类别" width="100" prop="sectorId" align="center">
            <template #default="scoped">
              <dc-dict :options="DC_CRM_SECTOR" :value="scoped.row.sectorId" />
            </template>
          </el-table-column>
          <el-table-column label="计划分类" width="140" prop="categoryId" align="center">
            <template #default="scoped">
              <dc-dict :options="DC_CRM_PLAN" :value="scoped.row.categoryId" />
            </template>
          </el-table-column>

          <el-table-column
            label="模板介绍"
            min-width="200"
            prop="templateIntroduction"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.templateIntroduction || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="模板图片" min-width="100" prop="templateImageId" align="center">
            <template #default="scoped">
              <el-image
                class="h-10 w-10"
                :src="scoped.row.templateImageId"
                fit="cover"
                v-if="scoped.row.templateImageId"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>

          <!-- 在此添加其他列 -->
          <el-table-column width="240" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'DC_PDP_PLAN_TEMPLATE_EDIT', row: scoped.row }"
                @click="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'DC_PDP_PLAN_TEMPLATE_TEMP_CONFIG', row: scoped.row }"
                @click="handleTempDetails(scoped.row)"
                >模板配置</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'DC_PDP_PLAN_TEMPLATE_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除</el-button
              >
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
    <submit ref="submitRef" @confirm="getData" />
  </div>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import submit from './components/submit.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();

// 缓存
const { DC_CRM_SECTOR, DC_CRM_PLAN } = proxy.useCache([
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_CRM_PLAN' },
]);

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

const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.planTemplate.list(queryParams.value);
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

const handleSubmit = row => {
  // 处理新增或编辑逻辑
  proxy.getRef('submitRef').openDrawer(row);
};

const handleTempDetails = row => {
  router.push(`/pdpSetting/planTemplate/${row.id}`);
};

const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(async () => await Api.pdp.planTemplate.remove({ ids }))
    .then(res => {
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
      getData();
    });
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  Object.assign(queryParams.value, {
    current: 1,
    size: 10,
  });
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style lang="scss" scoped></style>
