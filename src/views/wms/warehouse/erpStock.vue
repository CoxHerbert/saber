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
          <el-form-item label="仓库编码" prop="stockNumber">
            <el-input v-model="queryParams.stockNumber" placeholder="请输入仓库编码" clearable />
          </el-form-item>
          <el-form-item label="仓库名称" prop="stockName">
            <el-input v-model="queryParams.stockName" placeholder="请输入仓库名称" clearable />
          </el-form-item>
          <el-form-item label="使用组织" prop="useOrgId">
            <dc-select
              v-model="queryParams.useOrgId"
              objectName="org"
              placeholder="请选择使用组织"
              clearable
            />
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
      <div class="operate-container"></div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @row-click="handleRowClick">
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="仓库编码"
            prop="stockNumber"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column label="仓库名称" prop="stockName" align="center" show-overflow-tooltip />
          <el-table-column
            label="仓库状态"
            prop="stockStatus"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column label="归属组织" prop="useOrgId" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <dc-view v-model="scoped.row.useOrgId" objectName="org" />
            </template>
          </el-table-column>

          <!-- 在此添加其他列 -->
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'DC_ERPSTOCK_EDIT', row: scoped.row }"
                @click.stop="handleSubmit(scoped.row)"
                >编辑</el-button
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
    title="编辑"
    destroy-on-close
    append-to-body
    size="800px"
    @close="closeDrawer"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="98px">
      <el-form-item label="仓库编码" prop="stockNumber">
        <el-input v-model="formData.stockNumber" placeholder="请输入仓库编码" clearable disabled />
      </el-form-item>
      <el-form-item label="仓库名称" prop="stockName">
        <el-input v-model="formData.stockName" placeholder="请输入仓库名称" clearable disabled />
      </el-form-item>
      <el-form-item label="仓库状态" prop="stockStatus">
        <el-input v-model="formData.stockStatus" placeholder="请输入仓库状态" clearable disabled />
      </el-form-item>
      <el-form-item label="使用组织" prop="useOrgId">
        <el-select v-model="formData.useOrgId" placeholder="请选择" clearable disabled>
          <el-option
            v-for="item in ORG_LIST_CACHE"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓管员工号" prop="stockWarehouseKeeper">
        <dc-select-dialog
          v-model="formData.stockWarehouseKeeper"
          placeholder="请选择ERP人员工号"
          objectName="erpFnumber"
          type="input"
          :multiple="true"
          :multiple-limit="0"
          :clearable="true"
          :disabled="isShow"
          :params="{
            erpOrgid: formData.useOrgId,
          }"
          @change="handleErpRealName"
        />
      </el-form-item>
      <el-form-item label="仓管员名称" prop="stockWarehouseKeeper">
        <dc-select-dialog
          v-model="formData.stockWarehouseKeeper"
          placeholder="请选择ERP人员名称"
          objectName="erpRealName"
          type="input"
          :multiple="true"
          :multiple-limit="0"
          :clearable="true"
          :disabled="isShow"
          :params="{
            erpOrgid: formData.useOrgId,
          }"
          @change="handleErpRealName"
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

const { ORG_LIST_CACHE } = proxy.useCache([{ key: 'ORG_LIST_CACHE' }]);

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
    stockWarehouseKeeper: [{ required: true, message: '请选择人员', trigger: 'change' }],
  },
});

const { loading, queryParams, dataList, total, open, formData, rules } = toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.wms.erpStock.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records.map(item => ({
        ...item,
        useOrgId: String(item.useOrgId), // 转换为字符串
      }));
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
  formData.value = deepClone(row);
  open.value = true;
};

// 关闭弹窗
const closeDrawer = () => {
  formData.value = {};
  open.value = false;
};

// 保存提交
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        // 处理如果是对象就循环拿出id 拼接成字符串 不是对象直接返回原值
        stockWarehouseKeeper: Array.isArray(formData.value.stockWarehouseKeeper)
          ? formData.value.stockWarehouseKeeper.map(item => item.id).join(',')
          : formData.value.stockWarehouseKeeper,
      };
      const res = await Api.wms.erpStock.submit(form);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
};

// 点击行选中
const handleRowClick = row => {
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
// 选择仓管员名称 同时赋值仓管员工号
const handleErpRealName = row => {
  formData.value.stockWarehouseKeeper = row;
};
</script>

<style lang="scss" scoped></style>
