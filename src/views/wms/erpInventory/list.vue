<template>
  <basic-container>
    <div class="content-warp">
      <div class="search">
        <div class="search-left">
          <el-form
            class="search-container"
            :model="queryParams"
            ref="queryRef"
            label-width="80px"
            :inline="true"
            @submit.native.prevent="handleQuery"
          >
            <el-form-item label="库存组织" prop="stockOrganization">
              <dc-select
                v-model="queryParams.stockOrganization"
                objectName="org"
                placeholder="请选择库存组织"
                clearable
              />
            </el-form-item>

            <el-form-item label="专案号" prop="mtono">
              <el-input
                v-model="queryParams.mtono"
                placeholder="请输入专案号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="物料编码" prop="materialCode">
              <el-input
                v-model="queryParams.materialCode"
                placeholder="请输入物料编码"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="物料名称" prop="materialName">
              <el-input
                v-model="queryParams.materialName"
                placeholder="请输入物料名称"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="规格型号" prop="specificationModel">
              <el-input
                v-model="queryParams.specificationModel"
                placeholder="请输入规格型号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="仓位名称" prop="storageName">
              <el-input
                v-model="queryParams.storageName"
                placeholder="请输入仓位名称"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="所在仓库" prop="warehouse">
              <el-input
                v-model="queryParams.warehouse"
                placeholder="请输入所在仓库"
                clearable
                @keyup.enter="handleQuery"
              />
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

      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column
            min-width="220px"
            label="库存组织"
            align="center"
            prop="stockOrganization"
            :show-overflow-tooltip="true"
          />
          <el-table-column min-width="90px" label="专案号" align="center" prop="mtono">
            <template #default="scoped">{{ scoped.row.mtono || '-' }}</template>
          </el-table-column>
          <el-table-column
            min-width="140px"
            label="物料编码"
            align="center"
            prop="materialCode"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            min-width="120px"
            label="物料名称"
            align="center"
            prop="materialName"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            min-width="230px"
            label="规格型号"
            align="center"
            prop="specificationModel"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column min-width="60px" label="单位" align="center" prop="unit">
          </el-table-column>
          <el-table-column
            min-width="80px"
            label="版本号"
            align="center"
            prop="versionNumber"
            :show-overflow-tooltip="true"
          >
            <template #default="scoped">{{ scoped.row.versionNumber || '-' }}</template>
          </el-table-column>
          <el-table-column
            min-width="90px"
            label="可用库存"
            align="center"
            prop="availableStock"
            :show-overflow-tooltip="true"
          >
            <template #default="scoped">
              {{ parseFloat(scoped.row.availableStock).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="110px"
            label="仓位编码"
            align="center"
            prop="storageCode"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            min-width="120px"
            label="仓位名称"
            align="center"
            prop="storageName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            min-width="150px"
            label="所在仓库"
            align="center"
            prop="warehouse"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            min-width="160px"
            label="同步时间"
            align="center"
            prop="syncTime"
            :show-overflow-tooltip="true"
          />

          <!-- <el-table-column label="操作" align="center" width="300">
            <template #default="scoped">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scoped.row)"
                >删除</el-button
              >
            </template>
          </el-table-column> -->
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';

import { removeExpectionNotice, getTenantList } from '@/api/system/expNotice';

const { proxy } = getCurrentInstance();

const data = reactive({
  tenantList: [],
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  loading: true,
  total: 0,
});

const { queryParams, dataList, loading, total } = toRefs(data);

onMounted(() => {
  getData();
  getTenantListFn();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.wms.erpInventory.list(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
      isEnable: record.isEnable === 1,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
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
    workGroupName: undefined,
    areaName: undefined,
    chargePerson: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = [row.id];
  proxy
    .$confirm('是否确认删除此数据项？')
    .then(async () => {
      return removeExpectionNotice(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 获取租户列表
const getTenantListFn = () => {
  getTenantList().then(res => {
    if (res.data.code === 200) {
      data.tenantList = res.data.data;
    }
  });
};
</script>
