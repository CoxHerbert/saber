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
          label-width="auto"
        >
          <el-form-item label="业务类别" prop="businessCategoryId">
            <el-select
              v-model="queryParams.businessCategoryId"
              placeholder="请选择业务类别"
              clearable
            >
              <el-option
                :label="option.label"
                :value="option.value"
                v-for="(option, index) in DC_PMS_TEMPITEM_TYPE"
                :key="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="业务类型编码" prop="businessType">
            <el-input
              v-model="queryParams.businessType"
              placeholder="请输入业务类型编码"
              clearable
            />
          </el-form-item>
          <el-form-item label="流程" prop="processId">
            <el-input v-model="queryParams.processId" placeholder="请输入流程" clearable />
          </el-form-item>
          <el-form-item label="业务功能类型" prop="funcType">
            <el-input v-model="queryParams.funcType" placeholder="请输入业务功能类型" clearable />
          </el-form-item>
          <el-form-item label="系统代码名称" prop="systemCodeName">
            <el-input
              v-model="queryParams.systemCodeName"
              placeholder="请输入系统代码名称"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="getData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
    </div>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'BUSINESSPARAMS_ADD' }"
          @click="handleSubmit"
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
          <el-table-column width="100" label="业务类别" prop="businessCategoryId" align="center">
            <template #default="scoped">
              <dc-dict :options="DC_PMS_TEMPITEM_TYPE" :value="scoped.row.businessCategoryId" />
            </template>
          </el-table-column>
          <el-table-column label="业务类型编码" width="120" prop="businessType" align="center">
            <template #default="scoped">
              {{ scoped.row.businessType || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="业务类型" width="120" prop="businessTypeName" align="center">
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
          <el-table-column label="是否进度任务" width="160" prop="progressTask" align="center">
            <template #default="scoped">
              {{ scoped.row.progressTask === true ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column min-width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'BUSINESSPARAMS_EDIT', row: scoped.row }"
                @click="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'BUSINESSPARAMS_DEL', row: scoped.row }"
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
<script setup name="BusinessSetting">
import { onMounted } from 'vue';
import Api from '@/api/index';
import submit from './components/submit.vue';

const { proxy } = getCurrentInstance();
const { DC_PMS_TEMPITEM_TYPE, DC_PMS_DOCUMENT_TYPE, DC_FOLDER_TYPE } = proxy.useCache([
  { key: 'DC_PMS_TEMPITEM_TYPE' },
  { key: 'DC_PMS_DOCUMENT_TYPE' },
  { key: 'DC_FOLDER_TYPE' },
]);

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
    businessCategoryId: null,
    businessType: null,
    processId: null,
    funcType: null,
    systemCodeName: null,
  },
  dataList: [],
  total: 0,
  submitRef: null,
});
const { loading, queryParams, dataList, total, submitRef } = toRefs(pageData);

onMounted(() => {
  getData();
});

// 分页数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.system.processCorrelation.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 处理新增
const handleSubmit = async row => {
  submitRef.value.openDrawer(row);
};

// 删除
const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将 [${ids}] 数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      return Api.system.processCorrelation.remove({ ids });
    })
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
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
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>
<style lang="scss" scoped>
.app-container {
  padding: 16px;
}
</style>
