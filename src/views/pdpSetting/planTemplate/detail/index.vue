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
          <el-form-item label="明细名称" prop="detailName">
            <el-input v-model="queryParams.detailName" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="计划模板明细类型" prop="businessCategoryId">
            <el-select v-model="queryParams.businessCategoryId" placeholder="选择类型" clearable>
              <el-option
                :label="option.label"
                :value="option.value"
                v-for="(option, index) in DC_PMS_TEMPITEM_TYPE"
                :key="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="业务类型编码" prop="businessType">
            <el-input v-model="queryParams.businessType" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="流程" prop="processId">
            <el-input v-model="queryParams.processId" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="业务功能类型" prop="funcType">
            <el-input v-model="queryParams.funcType" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="系统代码名称" prop="systemCodeName">
            <el-input v-model="queryParams.systemCodeName" placeholder="请输入" clearable />
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
        <el-button type="primary" icon="Plus" @click="handleSubmit(undefined, 'add')"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          row-key="id"
          lazy
          :load="load"
          :tree-props="{ children: 'children', hasChildren: 'isChild' }"
        >
          <el-table-column label="" width="20" prop="" align="center" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="明细名称" width="220" prop="detailName" align="center">
            <template #default="scoped">
              {{ scoped.row.detailName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="处理人" width="80" prop="handlePersonId" align="center">
            <template #default="scoped">
              <dc-dict
                type="text"
                :options="DC_PMS_PROJECT_ROLE"
                :value="scoped.row.handlePersonId"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="计划模板明细类型"
            width="120"
            prop="businessCategoryId"
            align="center"
          >
            <template #default="scoped">
              <dc-dict
                type="text"
                :options="DC_PMS_TEMPITEM_TYPE"
                :value="scoped.row.businessCategoryId"
              />
            </template>
          </el-table-column>
          <el-table-column label="是否里程碑" width="120" prop="isMilestone" align="center">
            <template #default="scoped">
              {{ scoped.row.isMilestone ? '是' : '否' }}
            </template>
          </el-table-column>

          <el-table-column label="计划状态" width="120" prop="planStatus" align="center">
            <template #default="scoped">
              <dc-dict type="text" :options="DC_PMS_PLAN_STATUS" :value="scoped.row.planStatus" />
            </template>
          </el-table-column>
          <el-table-column label="业务名称" width="120" prop="businessTypeName" align="center">
            <template #default="scoped">
              {{ scoped.row.businessTypeName || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="流程" width="120" prop="processId" align="center">
            <template #default="scoped">
              {{ scoped.row.processId || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="文档类型" width="100" prop="docTypeId" align="center">
            <template #default="scoped">
              <dc-dict type="text" :options="DC_PMS_DOCUMENT_TYPE" :value="scoped.row.docTypeId" />
            </template>
          </el-table-column>
          <el-table-column label="文档文件夹" width="120" prop="docFolder" align="center">
            <template #default="scoped">
              <dc-dict type="text" :options="DC_FOLDER_TYPE" :value="scoped.row.docFolder" />
            </template>
          </el-table-column>
          <el-table-column label="业务功能类型" width="120" prop="funcType" align="center">
            <template #default="scoped">
              {{ scoped.row.funcType || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="业务功能名称" width="120" prop="funcName" align="center">
            <template #default="scoped">
              {{ scoped.row.funcName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="业务功能URL" width="120" prop="funcUrl" align="center">
            <template #default="scoped">
              {{ scoped.row.funcUrl || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="业务功能详情页URL" width="160" prop="funcViewUrl" align="center">
            <template #default="scoped">
              {{ scoped.row.funcViewUrl || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="系统代码类型" width="120" prop="systemCodeType" align="center">
            <template #default="scoped">
              {{ scoped.row.systemCodeType || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="系统代码名称" width="120" prop="systemCodeName" align="center">
            <template #default="scoped">
              {{ scoped.row.systemCodeName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="系统代码方法" width="120" prop="systemCodeMethod" align="center">
            <template #default="scoped">
              {{ scoped.row.systemCodeMethod || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="系统代码自定义路径"
            width="160"
            prop="systemCodePath"
            align="center"
          >
            <template #default="scoped">
              {{ scoped.row.systemCodePath || '-' }}
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column width="260" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button link type="primary" icon="Edit" @click="handleSubmit(scoped.row, 'edit')"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleSubmit(scoped.row, 'addChild')"
                v-if="!scoped.row.parentId"
                >新增子项</el-button
              >
              <el-button link type="primary" icon="Delete" @click="handleDelete(scoped.row)"
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
  </div>
  <submit ref="submitRef" @confirm="getData" :templateId="route.params.templateId" />
</template>

<script setup name="planTempDetail">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import submit from './components/submit.vue'; // 根据实际路径调整导入

const { proxy } = getCurrentInstance();
const route = useRoute();
const {
  DC_CRM_PLAN,
  DC_CRM_SECTOR,
  DC_PMS_PLAN_STATUS,
  DC_FOLDER_TYPE,
  DC_PMS_DOCUMENT_TYPE,
  DC_PMS_TEMPITEM_TYPE,
  DC_PMS_PROJECT_ROLE,
} = proxy.useCache([
  { key: 'DC_CRM_PLAN' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_FOLDER_TYPE' },
  { key: 'DC_PMS_DOCUMENT_TYPE' },
  { key: 'DC_PMS_TEMPITEM_TYPE' },
  { key: 'DC_PMS_PROJECT_ROLE' },
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
    const res = await Api.pdp.planTempItem.list({
      ...queryParams.value,
      ...route.params,
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

const load = async (row, treeNode, resolve) => {
  try {
    loading.value = true;
    const res = await Api.pdp.planTempItem.list({
      size: 99999,
      current: 1,
      parentId: row.id,
    });
    const { code, data } = res.data;
    if (code === 200) {
      resolve(data.records || []);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (row, type) => {
  // 处理新增或编辑逻辑
  proxy.getRef('submitRef').openDrawer(row, type);
};

const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.planTempItemremove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style lang="scss" scoped></style>
