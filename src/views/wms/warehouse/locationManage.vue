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

          <el-form-item label="仓库" prop="warehouseId">
            <dc-select-dialog
              v-model="queryParams.warehouseId"
              placeholder="请点击选择仓库"
              objectName="warehouse"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              @change="handleWarehouseChange"
            />
          </el-form-item>
          <el-form-item label="库位编号" prop="locationName">
            <el-input v-model="queryParams.locationName" placeholder="请输入库位编号" clearable />
          </el-form-item>
          <el-form-item label="排号" prop="locationAisle">
            <el-input v-model="queryParams.locationAisle" placeholder="请输入排号" clearable />
          </el-form-item>
          <el-form-item label="层号" prop="locationRack">
            <el-input v-model="queryParams.locationRack" placeholder="请输入层号" clearable />
          </el-form-item>
          <el-form-item label="位号" prop="locationLevel">
            <el-input v-model="queryParams.locationLevel" placeholder="请输入位号" clearable />
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
          v-permission="{ id: 'LOCATION_ADD' }"
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
          <el-table-column
            label="仓库名称"
            min-width="140"
            prop="warehouseId"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.warehouseId" objectName="warehouse" />
            </template>
          </el-table-column>
          <el-table-column
            label="库位编号"
            min-width="140"
            prop="locationName"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.locationName || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="排号"
            width="100"
            prop="locationAisle"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.locationAisle || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="层号"
            width="140"
            prop="locationRack"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.locationRack || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="位号"
            width="100"
            prop="locationLevel"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.locationLevel || '-' }}
            </template>
          </el-table-column>

          <el-table-column
            label="仓位描述"
            min-width="140"
            prop="locationDesc"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.locationDesc || '-' }}
            </template>
          </el-table-column>
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <!-- <el-button link type="primary" icon="Edit" @click="handleSubmit(scoped.row)"
                >编辑</el-button
              > -->
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'LOCATION_DEL', row: scoped.row }"
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
  </div>
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="仓库" prop="warehouseId">
        <dc-select-dialog
          v-model="formData.warehouseId"
          placeholder="请点击选择仓库"
          objectName="warehouse"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
        />
      </el-form-item>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="排号" prop="locationAisle">
            <el-input-number
              style="width: 100%"
              type="number"
              :max="999"
              v-model="formData.locationAisle"
              placeholder="请输入排号"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="层号" prop="locationRack">
            <el-input-number
              style="width: 100%"
              type="number"
              :max="999"
              v-model="formData.locationRack"
              placeholder="请输入层号"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="位号" prop="locationLevel">
            <el-input-number
              style="width: 100%"
              type="number"
              :max="999"
              v-model="formData.locationLevel"
              placeholder="请输入位号"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="仓位描述" prop="locationDesc">
        <el-input
          v-model="formData.locationDesc"
          placeholder="仓位描述"
          clearable
          :rows="2"
          type="textarea"
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

<script setup name="LocationManage">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
    warehouseId: null,
  },
  dataList: [],
  total: 0,
  open: false,
  formData: {},
  rules: {
    warehouseId: [
      {
        required: true,
        message: '请选择仓库',
        trigger: 'blur',
      },
    ],
    locationName: [
      {
        required: true,
        message: '请输入库位编号',
        trigger: 'blur',
      },
    ],
    locationAisle: [
      {
        required: true,
        message: '请输入排号',
        trigger: 'blur',
      },
    ],
    locationRack: [
      {
        required: true,
        message: '请输入层号',
        trigger: 'blur',
      },
    ],
    locationLevel: [
      {
        required: true,
        message: '请输入位号',
        trigger: 'blur',
      },
    ],
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
    const res = await Api.wms.warehouseLocation.list(queryParams.value);
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

const handleWarehouseChange = row => {
  queryParams.value.warehouseId = row.id;
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
      const warehouseId =
        typeof formData.value.warehouseId === 'object'
          ? formData.value.warehouseId?.id
          : formData.value.warehouseId;
      const form = {
        ...formData.value,
        warehouseId: warehouseId,
      };

      const res = await Api.wms.warehouseLocation.submit(form);
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
    .then(() => Api.wms.warehouseLocation.remove({ ids }))
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

<style lang="scss" scoped></style>
