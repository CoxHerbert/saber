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
      <el-form-item label="关联客户" prop="customerId">
        <dc-select-dialog
          v-model="queryParams.customerId"
          placeholder="请选择关联客户"
          objectName="customer"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
        />
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
          v-permission="{ id: 'DC_CRM_CLIENT_DEMAND_SCHEDULE_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @row-dblclick="handleRowClick">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column
            label="关联客户"
            min-width="150"
            prop="customerId"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.customerId" objectName="customer" />
            </template>
          </el-table-column>
          <el-table-column
            label="关联商机"
            min-width="150"
            prop="oppsId"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.oppsId" objectName="opps" />
            </template>
          </el-table-column>
          <el-table-column
            label="需求名称"
            min-width="150"
            prop="rlistName"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.rlistName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="BD" prop="bdId" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <dc-view v-model="scoped.row.bdId" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column
            label="设备种类"
            prop="deviceTypeKey"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-dict-key :options="DC_CRM_DEVICE_TYPE" :value="scoped.row.deviceTypeKey" />
            </template>
          </el-table-column>
          <el-table-column label="设备类型" prop="deviceKey" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <dc-dict-key :options="DC_PMS_PROJECT_QIOPMENT" :value="scoped.row.deviceKey" />
            </template>
          </el-table-column>
          <el-table-column label="产品类型" prop="productKey" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <dc-dict-key :options="DC_CRM_PRODUCT" :value="scoped.row.productKey" />
            </template>
          </el-table-column>
          <el-table-column
            label="附件"
            width="100"
            prop="attachments"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <el-popover v-if="scoped.row.attachments">
                <dc-upload
                  v-model="scoped.row.attachments"
                  :isUpload="false"
                  :isRemove="false"
                  pain
                  :limit="10"
                  :targetType="Const.targetType.CUSTOMER"
                />
                <template #reference>
                  <el-button type="text">附件（{{ scoped.row.attachments?.length }}）</el-button>
                </template>
              </el-popover>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="note" align="center" show-overflow-tooltip>
            <template #default="scoped">
              {{ scoped.row.note || '-' }}
            </template>
          </el-table-column>

          <el-table-column width="240" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleSubmit(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_DEMAND_SCHEDULE_EDIT', row: scoped.row }"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="toDetail(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_DEMAND_SCHEDULE_EDIT', row: scoped.row }"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                @click.stop="handleDelete(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_DEMAND_SCHEDULE_DEL', row: scoped.row }"
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
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px"> </el-form>
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
import Const from '@/const';

const router = useRouter();

const { proxy } = getCurrentInstance();

const {
  DC_CRM_DEVICE_TYPE,
  DC_PMS_PROJECT_QIOPMENT,
  DC_CRM_PRODUCT,
  DC_CRM_DIMENSION,
  DC_CRM_TECHNOLOGY,
} = proxy.useCache([
  { key: 'DC_CRM_DEVICE_TYPE' },
  { key: 'DC_PMS_PROJECT_QIOPMENT' },
  { key: 'DC_CRM_PRODUCT' },
  { key: 'DC_CRM_DIMENSION' },
  { key: 'DC_CRM_TECHNOLOGY' },
]);

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
    const res = await Api.crm.customerRlist.list(queryParams.value);
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
    router.push({
      path: `/crm/client/demandSchedule/edit/${row.id}`,
      query: {
        parentMenuId: '1889475321901080577',
      },
    });
  } else {
    router.push({
      path: `/crm/client/demandSchedule/create`,
      query: {
        parentMenuId: '1889475321901080577',
      },
    });
  }
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
      const res = await Api.crm.customerRlist.submit(formData.value);
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
    .then(() => Api.crm.customerRlist.remove({ ids }))
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
  toDetail(row);
};

const toDetail = row => {
  router.push({
    path: `/crm/client/demandSchedule/detail/${row.id}`,
    query: {
      parentMenuId: '1889475321901080577',
    },
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

<style lang="scss" scopedd></style>
