<template>
  <div class="app-container">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <!-- 在此添加搜索项 -->
      <el-form-item label="阶段名称" prop="projectName">
        <el-input v-model="queryParams.projectName" placeholder="请输入阶段名称" clearable />
      </el-form-item>
      <el-form-item label="阶段编码" prop="projectCode">
        <el-input v-model="queryParams.projectCode" placeholder="请输入阶段编码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <el-button type="primary" icon="Plus" @click="handleSubmit">新增</el-button>
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="阶段名称" prop="projectName" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.projectName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="阶段编码" prop="projectCode" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.projectCode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="是否启用" prop="enabled" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span
                ><el-switch
                  v-model="scoped.row.enabled"
                  @change="handleMmrPhaseEnableChange(scoped.row)"
              /></span>
            </template>
          </el-table-column>

          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button link type="primary" icon="Edit" @click="handleSubmit(scoped.row)"
                >编辑</el-button
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
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <div class="wrap">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="mt-5 custom-form"
      >
        <el-form-item label="项目名称" prop="projectName" class="form-itme-width_100">
          <el-input v-model="formData.projectName" placeholder="请输入阶段名称" clearable />
        </el-form-item>
        <el-form-item label="项目编码" prop="projectCode" class="form-itme-width_100">
          <el-input v-model="formData.projectCode" placeholder="请输入阶段编码" clearable />
        </el-form-item>
        <el-form-item label="排序" prop="projectSort" class="form-itme-width_100">
          <el-input-number v-model="formData.projectSort" :min="1" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled" class="form-itme-width_50">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="ComponentName">
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
  open: false,
  formData: {},
  rules: {},
  title: '',
});

const { loading, queryParams, dataList, total, open, formData, rules, title } = toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.mmrProjectConfig.list(queryParams.value);
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

// 处理新增或编辑逻辑
const handleSubmit = async row => {
  title.value = '新增';
  if (row?.id) {
    title.value = '编辑';
    formData.value = deepClone(row);
  }
  open.value = true;
};

// 关闭弹窗
const closeDrawer = () => {
  title.value = '';
  formData.value = {};
  open.value = false;
};

// 保存提交
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const res = await Api.pdp.mmrProjectConfig.submit(formData.value);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
};

const handleMmrPhaseEnableChange = async row => {
  const res = await Api.pdp.mmrProjectConfig.submit(row);
  const { code } = res.data;
  if (code === 200) {
    proxy.$message({ type: 'success', message: '保存成功' });
    getData();
    closeDrawer();
  }
};
// 处理删除
const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.mmrProjectConfig.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
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
</script>

<style lang="scss" scoped>
.colorCode {
  width: 100%;
  display: flex;
  height: 100%;
  justify-content: space-around;
  .colorCodeItem {
    width: 40px !important;
    height: 20px !important;
    border-radius: 4px;
  }
}
</style>
