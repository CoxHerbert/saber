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
          <el-form-item label="物料编码" prop="productCode">
            <el-input v-model="queryParams.productCode" placeholder="请输入物料编码" clearable />
          </el-form-item>
          <el-form-item label="物料名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="请输入物料名称" clearable />
          </el-form-item>
          <el-form-item label="规格型号" prop="productSpec">
            <el-input v-model="queryParams.productSpec" placeholder="请输入规格型号" clearable />
          </el-form-item>
          <el-form-item label="仓库名称" prop="warehouseId">
            <el-select v-model="queryParams.warehouseId" filterable placeholder="请选择仓库名称">
              <el-option
                v-for="item in serchDataList"
                :key="item.id"
                :label="item.warehouseName"
                :value="item.id"
              /> </el-select
          ></el-form-item>
          <el-form-item label="专案号" prop="mtoNo">
            <el-input v-model="queryParams.mtoNo" placeholder="请输入专案号" clearable />
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
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="物料编码"
            min-width="100"
            prop="productCode"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            label="物料名称"
            min-width="100"
            prop="productName"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            label="规格型号"
            min-width="100"
            prop="productSpec"
            align="center"
            show-overflow-tooltip
            ><template #default="scoped">
              {{
                [null, undefined, ''].includes(scoped.row.productSpec)
                  ? '-'
                  : scoped.row.productSpec
              }}
            </template></el-table-column
          >

          <el-table-column
            label="数量"
            min-width="100"
            prop="number"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            label="单位"
            min-width="100"
            prop="unit"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            label="专案号"
            min-width="100"
            prop="mtoNo"
            align="center"
            show-overflow-tooltip
            ><template #default="scoped">
              {{ [null, undefined, ''].includes(scoped.row.mtoNo) ? '-' : scoped.row.mtoNo }}
            </template></el-table-column
          >

          <el-table-column
            label="仓库名称"
            min-width="100"
            prop="warehouseId"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.warehouseId" objectName="warehouse" />
            </template>
          </el-table-column>

          <el-table-column
            label="库位编码"
            min-width="100"
            prop="locationId"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.locationId" objectName="warehouseLocation" />
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
</template>

<script setup name="InventoryRecord">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  serchDataList: [],
  total: 0,
});

const { loading, queryParams, dataList, total, serchDataList } = toRefs(pageData);

onMounted(() => {
  getData();
  getSerchList();
});

const getSerchList = async () => {
  const res = await Api.wms.warehouse.list(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    serchDataList.value = data.records;
    total.value = data.total;
  }
};

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.wms.common.list(queryParams.value);
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

// 处理查询
const handleQuery = () => {
  // queryParams.value.current = 1;
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
