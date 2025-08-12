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
          <!-- 出库 -->
          <!-- 在此添加搜索项 -->
          <el-form-item label="单据状态" prop="outStockStatus">
            <el-select
              v-model="queryParams.outStockStatus"
              clearable
              placeholder="请选择单据状态进行搜索"
            >
              <el-option
                v-for="item in DC_WMS_OUT_STATUS"
                :key="item.dictKey"
                :label="item.dictValue"
                :value="item.dictKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="单号" prop="outStockCode">
            <el-input
              v-model="queryParams.outStockCode"
              placeholder="请输入单号进行搜索"
              clearable
            />
          </el-form-item>
          <el-form-item label="出库类型" prop="outStockType">
            <el-select
              v-model="queryParams.outStockType"
              clearable
              placeholder="请选择出库类型进行搜索"
            >
              <el-option
                v-for="item in DC_WMS_OUT_TYPE_WMS"
                :key="item.dictKey"
                :label="item.dictValue"
                :value="item.dictKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="仓库名称" prop="warehouseId">
            <dc-select-dialog
              v-model="queryParams.warehouseId"
              placeholder="请点击选择仓库"
              objectName="warehouse"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'DC_OUTBOUNDORDER_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" @row-dblclick="handleRowDbClick" :data="dataList">
          <!-- <el-table-column type="selection" width="55" /> -->
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出库类型" prop="outStockType" align="center">
            <template #default="scoped">
              <dc-dict-key :value="scoped.row.outStockType" :options="DC_WMS_OUT_TYPE_WMS" />
            </template>
          </el-table-column>
          <el-table-column label="单据状态" prop="outStockStatus" align="center">
            <template #default="scoped">
              <dc-dict-key :value="scoped.row.outStockStatus" :options="DC_WMS_OUT_STATUS" />
            </template>
          </el-table-column>
          <el-table-column label="单据编号" prop="outStockCode" align="center">
            <template #default="scoped">
              <el-popover
                v-if="scoped.row.outStockCode"
                placement="top-start"
                title="出库单号"
                :width="'100px'"
                trigger="click"
              >
                <template #default>
                  <div class="qr-code-box">
                    <QrcodeVue :value="scoped.row.outStockCode"></QrcodeVue>
                  </div>
                </template>
                <template #reference>
                  <span class="code">{{ scoped.row.outStockCode }}</span>
                </template>
              </el-popover>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="申请人" prop="applicantId" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.applicantId" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column label="处理人" prop="processingPersonnel" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.processingPersonnel" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column label="登记时间" prop="createTime" align="center" />

          <!-- <el-table-column label="审核人" prop="auditUserId" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.auditUserId" objectName="user" />
            </template>
          </el-table-column> -->

          <!-- 在此添加其他列 -->
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'DC_OUTBOUNDORDER_EDIT', row: scoped.row }"
                @click.stop="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'DC_OUTBOUNDORDER_DEL', row: scoped.row }"
                @click.stop="handleDelete(scoped.row)"
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
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import QrcodeVue from 'qrcode.vue';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();

const { DC_WMS_OUT_TYPE_WMS, DC_WMS_OUT_STATUS } = proxy.useCache([
  { key: 'DC_WMS_OUT_TYPE_WMS' },
  { key: 'DC_WMS_OUT_STATUS' },
]);
const router = useRouter();
const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
});

const { loading, queryParams, dataList, total } = toRefs(pageData);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.wms.outboundOrder.list(queryParams.value);
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
const handleSubmit = row => {
  router.push({
    name: '出库提交',
    params: { id: 'create' },
  });
  if (row?.id) {
    router.push({
      name: '出库提交',
      params: { id: row.id },
    });
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
    .then(() => Api.wms.outboundOrder.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    })
    .catch(err => {});
};

const handleRowDbClick = row => {
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

<style lang="scss" scoped>
.qr-code-box {
  text-align: center;
  display: flex;
  justify-content: center;
}
</style>
