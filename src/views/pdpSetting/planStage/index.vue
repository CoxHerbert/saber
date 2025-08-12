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
      <el-form-item label="阶段类别编码" prop="categoryCode">
        <el-input v-model="queryParams.categoryCode" placeholder="请输入阶段类别编码" clearable />
      </el-form-item>
      <el-form-item label="阶段类别名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入阶段类别名称" clearable />
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
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="阶段类别编码"
            prop="categoryCode"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="阶段类别名称"
            prop="categoryName"
            align="center"
            show-overflow-tooltip
          />
          <!-- 在此添加其他列 -->
          <el-table-column width="250" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button link type="primary" icon="Edit" @click.stop="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button link type="primary" icon="Delete" @click.stop="handleDelete(scoped.row)"
                >删除</el-button
              >
              <el-button link type="primary" icon="Search" @click.stop="handleSerch(scoped.row)"
                >查询计划</el-button
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
  <el-drawer
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    size="600px"
    @close="closeDrawer"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="阶段类别编码" prop="categoryCode">
        <el-input v-model="formData.categoryCode" placeholder="请输入阶段类别编码" clearable />
      </el-form-item>
      <el-form-item label="阶段类别名称" prop="categoryName">
        <el-input v-model="formData.categoryName" placeholder="请输入阶段类别名称" clearable />
      </el-form-item>
      <el-form-item label="阶段类别排序" prop="sortCode">
        <el-input-number v-model="formData.sortCode" :min="1" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
  <!-- 查询计划弹出框 -->
  <el-dialog v-model="dialogOpen" title="查询计划单" width="1200">
    <plan @confirm="getSerchData" :mode="'inline'" :dataList="dialogList" :rowList="rowList" />
  </el-dialog>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';
import plan from '../planSheetSetting/index.vue';

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
  rules: {
    categoryCode: [{ required: true, message: '请输入阶段类别编码', trigger: 'change' }],
    categoryName: [{ required: true, message: '请输入阶段类别名称', trigger: 'change' }],
  },
  title: '',
  dialogOpen: false,
  dialogList: [],
  rowList: [],
});

const {
  loading,
  queryParams,
  dataList,
  total,
  open,
  formData,
  rules,
  title,
  dialogOpen,
  dialogList,
  rowList,
} = toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.planStage.list(queryParams.value);
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
      const res = await Api.pdp.planStage.submit(formData.value);
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
    .then(() => Api.pdp.planStage.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    })
    .catch(err => {});
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

// 处理表格选中
const handleSelectionChange = () => {};

const getSerchData = async row => {
  try {
    loading.value = true;
    const res = await Api.pdp.planStage.serchList({ id: row.id });
    const { code, data } = res.data;
    if (code === 200) {
      dialogList.value = data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 计划查询
const handleSerch = row => {
  rowList.value = row;
  dialogOpen.value = true;
  getSerchData(row);
};
</script>

<style lang="scss" scopedd></style>
