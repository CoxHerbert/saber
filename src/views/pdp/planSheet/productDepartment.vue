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
      <el-form-item label="产品编码" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable />
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
          v-permission="{ id: 'DC_PRODUCT_DEPT_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="产品编码"
            prop="productCode"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column label="部门" prop="deptId" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.deptId" objectName="dept" showKey="deptName" />
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleSubmit(scoped.row)"
                v-permission="{ id: 'DC_PRODUCT_DEPT_EDIT' }"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                @click.stop="handleDelete(scoped.row)"
                v-permission="{ id: 'DC_PRODUCT_DEPT_DEL' }"
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
  <el-drawer
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    size="800px"
    @close="closeDrawer"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-suffix=":" label-width="80px">
      <el-form-item label="产品编码" prop="productCode">
        <el-input v-model="formData.productCode" placeholder="产品编码" clearable />
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-tree-select
          v-model="formData.deptId"
          :data="deptList"
          multiple
          check-strictly
          show-checkbox
          placeholder="请选择部门"
          :props="{
            label: 'title',
            value: 'id',
            children: 'children',
          }"
          clearable
        />
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
  deptList: [],
});

const { loading, queryParams, dataList, total, open, formData, rules, title, deptList } =
  toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.productDepartment.list(queryParams.value);
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

const getDept = async () => {
  try {
    loading.value = true;
    const res = await Api.system.dept.getDeptTree();
    const { code, data } = res.data;
    if (code === 200) {
      deptList.value = data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 处理新增或编辑逻辑
const handleSubmit = async row => {
  getDept();
  title.value = '新增';
  if (row?.id) {
    title.value = '编辑';
    const rows = {
      ...row,
      deptId: row.deptId.split(','),
    };
    formData.value = deepClone(rows);
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
      const form = {
        ...formData.value,
        deptId: formData.value.deptId.join(','),
      };
      const res = await Api.pdp.productDepartment.submit(form);
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
    .then(() => Api.pdp.productDepartment.remove({ ids }))
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

// 处理表格选中
const handleSelectionChange = () => {};

const handleDeptChange = selectedIds => {
  console.log('🚀 ❤ ~ selectedIds:', selectedIds);
};
</script>

<style lang="scss" scopedd></style>
