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
      <el-form-item label="代工厂" prop="foundryName">
        <el-input v-model="queryParams.foundryName" placeholder="请输入代工厂" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'DC_CRM_CLIENT_OME_FACTORIES_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @row-click="handleRowClick">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="代工厂"
            min-width="100"
            prop="foundryName"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.foundryName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="代工说明"
            min-width="100"
            prop="foundryDesc"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.foundryDesc || '-' }}</span>
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleSubmit(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_OME_FACTORIES_EDIT', row: scoped.row }"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                @click.stop="handleDelete(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_OME_FACTORIES_DEL', row: scoped.row }"
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
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="代工厂" prop="foundryName">
        <el-input v-model="formData.foundryName" placeholder="代工厂" clearable />
      </el-form-item>
      <el-form-item label="代工说明" prop="foundryDesc">
        <el-input v-model="formData.foundryDesc" placeholder="代工说明" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="OEMFactories">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';

const { proxy } = getCurrentInstance();

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
  rules: {
    foundryName: [{ required: true, message: '请输入代工厂', trigger: 'blur' }],
    foundryDesc: [{ required: true, message: '请输入代工说明', trigger: 'blur' }],
  },
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
    const res = await Api.crm.foundry.list(queryParams.value);
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
  title.value = '新增代工厂';
  if (row?.id) {
    title.value = '编辑代工厂';
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
      const res = await Api.crm.foundry.submit(formData.value);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
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
    .then(() => Api.crm.foundry.remove(ids))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    })
    .catch(err => {});
};

// 点击行选中
const handleRowClick = (row, column, event) => {
  handleSubmit(row);
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

<style lang="scss" scopedd></style>
