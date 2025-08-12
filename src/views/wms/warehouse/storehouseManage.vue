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
          <el-form-item label="仓库名称" prop="warehouseName">
            <el-input v-model="queryParams.warehouseName" placeholder="请输入仓库名称" clearable />
          </el-form-item>
          <el-form-item label="仓库地址" prop="warehouseAddress">
            <el-input
              v-model="queryParams.warehouseAddress"
              placeholder="请输入仓库地址"
              clearable
            />
          </el-form-item>
          <el-form-item label="仓库区域" prop="warehouseRegion">
            <el-input v-model="queryParams.warehouseRegion" placeholder="请输入区域" clearable />
          </el-form-item>
          <el-form-item label="联系方式" prop="warehouseName">
            <el-input v-model="queryParams.warehouseName" placeholder="请输入联系方式" clearable />
          </el-form-item>
          <el-form-item label="仓库负责人" prop="warehouseSupervisor">
            <dc-select-user
              v-model="queryParams.warehouseSupervisor"
              placeholder="请选择仓库负责人"
              :multipleLimit="0"
              :clearable="true"
            />
          </el-form-item>
          <el-form-item label="是否现场仓" prop="siteWarehouse">
            <el-select v-model="queryParams.siteWarehouse" clearable placeholder="请选择是否现场仓">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-form-item label-width="0">
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
          v-permission="{ id: 'WMS_WAREHOUSE_ADD' }"
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
            label="仓库编号"
            prop="warehouseCode"
            min-width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.warehouseCode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="仓库名称"
            prop="warehouseName"
            min-width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.warehouseName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="仓库地址"
            width="240"
            prop="warehouseAddress"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.warehouseAddress || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="仓库区域"
            prop="warehouseRegion"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.warehouseRegion || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="仓库类型" prop="stockType" align="center" show-overflow-tooltip>
            <template v-if="DC_WMS_STOCK_TYPE" #default="scoped">
              <dc-dict-key :value="scoped.row.stockType" :options="DC_WMS_STOCK_TYPE" />
            </template>
          </el-table-column>
          <el-table-column
            label="联系方式"
            prop="warehouseContactPhone"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.warehouseContactPhone || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="仓库管理人"
            prop="warehouseSupervisor"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.warehouseSupervisor" objectName="user" />
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column width="300" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <!-- <el-button link type="primary" icon="Edit" @click="handleSubmitPerson(scoped.row)"
                >修改仓库人员</el-button
              > -->
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'WMS_WAREHOUSE_EDIT', row: scoped.row }"
                @click="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'WMS_WAREHOUSE_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除</el-button
              >

              <el-button
                link
                type="primary"
                icon="Plus"
                v-permission="{ id: 'WMS_WAREHOUSE_ADD_LOCATION', row: scoped.row }"
                @click="handleAddlocation(scoped.row)"
                >添加库位</el-button
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
  <el-drawer v-model="open" :title="title" append-to-body @close="closeDialog">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="仓库名称" prop="warehouseName">
        <el-input v-model="formData.warehouseName" placeholder="请输入仓库名称" clearable />
      </el-form-item>
      <el-form-item label="仓库编码" prop="warehouseCode">
        <el-input v-model="formData.warehouseCode" placeholder="请输入仓库编码" clearable />
      </el-form-item>
      <el-form-item label="仓库地址" prop="warehouseAddress">
        <el-input v-model="formData.warehouseAddress" placeholder="请输入仓库地址" clearable />
      </el-form-item>
      <el-form-item label="仓库区域" prop="warehouseRegion">
        <el-input v-model="formData.warehouseRegion" placeholder="请输入区域" clearable />
      </el-form-item>
      <el-form-item label="联系方式" prop="warehouseContactPhone">
        <el-input v-model="formData.warehouseContactPhone" placeholder="请输入联系方式" clearable />
      </el-form-item>
      <el-form-item label="仓库负责人" prop="warehouseSupervisor">
        <dc-select-user
          v-model="formData.warehouseSupervisor"
          placeholder="请选择仓库负责人"
          :multipleLimit="0"
        />
      </el-form-item>
      <el-form-item label="仓库类型" prop="stockType">
        <el-select v-model="formData.stockType" placeholder="请选择仓库类型">
          <el-option
            v-for="(op, i) in DC_WMS_STOCK_TYPE"
            :key="i"
            :label="op.dictValue"
            :value="op.dictKey"
          ></el-option>
        </el-select>
        <!-- <el-switch v-model="formData.siteWarehouse" /> -->
      </el-form-item>
      <el-form-item label="是否开启仓位" prop="enableLocation">
        <el-switch v-model="formData.enableLocation" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-drawer>
  <AddlocationDialog ref="addlocationDialogRef" />
</template>

<script setup name="StorehouseManage">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import AddlocationDialog from './components/addlocationDialog.vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { deepClone } from '@/utils/util';

const { proxy } = getCurrentInstance();

const { DC_WMS_STOCK_TYPE } = proxy.useCache([{ key: 'DC_WMS_STOCK_TYPE' }]);

const addlocationDialogRef = ref();
const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  open: false,
  formData: {
    stockType: 'DC_WMS_STOCK_TYPE_COMMON',
    enableLocation: false,
    siteWarehouse: false,
  },
  rules: {
    stockType: [
      {
        required: true,
        message: '请选择仓库类型',
        trigger: 'blur',
      },
    ],
    warehouseName: [
      {
        required: true,
        message: '请输入仓库名称',
        trigger: 'blur',
      },
    ],

    warehouseCode: [
      {
        required: true,
        message: '请输入仓库编码',
        trigger: 'blur',
      },
    ],
    warehouseAddress: [
      {
        required: true,
        message: '请输入仓库地址',
        trigger: 'blur',
      },
    ],

    warehouseSupervisor: [
      {
        required: true,
        message: '请选择仓库负责人',
        trigger: 'blur',
      },
    ],
  },
  title: '',
  options: [
    {
      value: true,
      label: '是',
    },
    {
      value: false,
      label: '否',
    },
  ],
});

const { loading, queryParams, dataList, total, open, formData, rules, title, options } =
  toRefs(pageData);

onMounted(() => {
  getData();
});

const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.wms.warehouse.list(queryParams.value);
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
  if (!!row?.id) {
    title.value = '编辑';
    const rows = {
      ...row,
      siteWarehouse: row.siteWarehouse === 1 ? true : false,
    };
    formData.value = deepClone(rows);
  }
  open.value = true;
};

const closeDialog = () => {
  formData.value = {
    stockType: 'DC_WMS_STOCK_TYPE_COMMON',
    enableLocation: false,
    siteWarehouse: false,
  };
  open.value = false;
};

// 保存 确认创建
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const res = await Api.wms.warehouse.submit(formData.value);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        getData();
        closeDialog();
      }
    }
  });
};

const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.wms.warehouse.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

// 添加库位
const handleAddlocation = row => {
  addlocationDialogRef.value.openDialog(row);
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
