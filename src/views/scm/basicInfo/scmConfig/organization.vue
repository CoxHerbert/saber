<template>
  <basic-container>
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <el-form-item label="组织名称" prop="orgName">
            <el-input
              type="text"
              v-model="queryParams.orgName"
              placeholder="请输入组织名称"
            ></el-input>
          </el-form-item>

          <el-form-item label="组织编码" prop="orgCode">
            <el-input
              type="text"
              v-model="queryParams.orgCode"
              placeholder="请输入组织编码"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="operate-container">
      <el-button
        type="primary"
        icon="CirclePlus"
        v-permission="{ id: 'ORGANIZATION_ADD' }"
        @click="handleAdd"
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
        <el-table-column min-width="100px" label="租户" align="center" prop="tenantId">
          <template #default="scoped">
            <span>{{ tenantView(scoped.row.tenantId) }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" label="组织名称" align="center" prop="orgName" />
        <el-table-column min-width="100px" label="组织id" align="center" prop="orgId" />
        <el-table-column min-width="100px" label="组织编码" align="center" prop="orgCode" />

        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              icon="Edit"
              v-permission="{ id: 'ORGANIZATION_EDIT', row: scoped.row }"
              @click="handleUpdate(scoped.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              v-permission="{ id: 'ORGANIZATION_DEL', row: scoped.row }"
              @click="handleDelete(scoped.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />

    <el-drawer v-model="dialogVisible" size="500px" :title="title" @close="cancel">
      <el-form
        ref="ruleFormRef"
        :rules="rules"
        :model="formData"
        label-width="auto"
        label-suffix=":"
      >
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="租户" prop="tenantId">
              <el-select v-model="formData.tenantId" placeholder="请选择租户" clearable>
                <el-option
                  v-for="(item, index) in data.tenantList"
                  :key="index"
                  :value="item.tenantId"
                  :label="item.tenantName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="组织名称" prop="orgName">
              <el-input
                type="text"
                v-model="formData.orgName"
                placeholder="请输入组织名称"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="组织id" prop="orgId">
              <el-input v-model="formData.orgId" placeholder="请输入组织id"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="组织编码" prop="orgCode">
              <el-input v-model="formData.orgCode" placeholder="请输入组织编码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
          <el-button @click="cancel(ruleFormRef)">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { getTenantList } from '@/api/system/expNotice';
const { proxy } = getCurrentInstance();

const data = reactive({
  tenantList: [],
  formData: {
    openStatus: 'CREATED',
    tenantId: '000000',
  },
  queryParams: {
    current: 1,
    size: 10,
    workGroupName: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {
    tenantId: [{ required: true, message: '租户为必选项', trigger: 'blur' }],
    orgName: [{ required: true, message: '组织名称为必选项', trigger: 'blur' }],
    orgId: [{ required: true, message: '组织id为必选项', trigger: 'blur' }],
    orgCode: [{ required: true, message: '组织编码为必选项', trigger: 'blur' }],
  },
  dialogVisible: false,
});

const { queryParams, formData, dataList, loading, total, title, rules, dialogVisible, tenantList } =
  toRefs(data);

const ruleFormRef = ref(null);

onMounted(() => {
  getData();
  getTenantListFn();
});

// 启用/禁用
const tenantView = tenantId => {
  return tenantList.value.find(item => item.tenantId == tenantId).tenantName;
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.scm.organization.getList(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

// 编辑
const handleUpdate = async row => {
  let data = Object.assign({}, row);
  formData.value = data;
  title.value = '编辑';
  dialogVisible.value = true;
};

// 打开添加弹窗
const handleAdd = async () => {
  title.value = '添加';
  dialogVisible.value = true;
  proxy.resetForm('ruleFormRef');
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
    .$confirm('是否确认删除组织名称为"' + row.orgName + '"的数据项？')
    .then(async () => {
      return Api.scm.organization.remove(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      const form = Object.assign({}, formData.value);
      if (form.id) {
        const res = await Api.scm.organization.submit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await Api.scm.organization.submit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      }
    }
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = {};
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

<style scoped lang="scss">
:deep(.el-card__body) {
  padding-top: 20px !important;
}
.wid30 {
  width: 30% !important;
}
</style>
