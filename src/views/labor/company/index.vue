<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="公司名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入" clearable />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="operate-container">
      <el-button
        type="primary"
        icon="CirclePlus"
        v-permission="{ id: 'LABOR_SERVICE_COMPANY_ADD' }"
        @click="handleAdd"
        >新增劳务公司</el-button
      >
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column
          min-width="100px"
          label="编码"
          align="center"
          prop="code"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          min-width="100px"
          label="公司名称"
          align="center"
          prop="name"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column min-width="120px" label="负责人" align="center" prop="leader" />

        <el-table-column
          min-width="120px"
          label="负责人手机号"
          align="center"
          prop="leaderMobile"
        />

        <el-table-column min-width="100px" label="相关附件" align="center" prop="fileId">
          <template #default="scoped">
            <span class="fileIdflex">
              <dc-upload
                v-model="scoped.row.fileId"
                :limit="3"
                :isUpload="false"
                :isRemove="false"
                :targetType="Const.targetType.CUSTOMER"
            /></span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scoped.row)"
              v-permission="{ id: 'LABOR_SERVICE_COMPANY_EDIT', row: scoped.row }"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scoped.row)"
              v-permission="{ id: 'LABOR_SERVICE_COMPANY_DEL', row: scoped.row }"
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

    <el-drawer v-model="dialogVisible" size="800px" :title="title" @close="cancel">
      <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="编码" prop="code">
              <el-input
                type="text"
                v-model="formData.code"
                placeholder="请输入唯一编码"
                :rows="5"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="公司名称" prop="name">
              <el-input
                type="text"
                v-model="formData.name"
                placeholder="请输入公司名称"
                :rows="5"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司负责人" prop="leader">
              <el-input
                type="text"
                v-model="formData.leader"
                placeholder="请输入公司负责人"
                :rows="5"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="负责人手机号" prop="leaderMobile">
              <el-input
                type="number"
                v-model="formData.leaderMobile"
                placeholder="请输入负责人手机号"
                :rows="5"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="附件" prop="fileId">
              <dc-upload v-model="formData.fileId" :targetType="Const.targetType.OPPS" />
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
import { getTenantList } from '@/api/system/expNotice';
import { getLaborCompanyList, laborCompanyRemove, addEditeLaborCompany } from '@/api/system/labor';
import Const from '@/const';
const { proxy } = getCurrentInstance();
const data = reactive({
  tenantList: [],
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
    workGroupName: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  switchValue: true,
  title: '',
  rules: {
    name: [{ required: true, message: '公司名称为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
});

const {
  queryParams,
  formData,
  dataList,
  loading,
  total,
  switchValue,
  title,
  rules,
  dialogVisible,
} = toRefs(data);

const ruleFormRef = ref(null);

onMounted(() => {
  getData();
  getTenantListFn();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await getLaborCompanyList(queryParams.value);
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

// 开关方式
const handleUpdate = async row => {
  let data = Object.assign({}, row);
  formData.value = data;
  if (Array.isArray(data.fileId) && data.fileId.length > 0) {
    let fileIdIdsList = data.fileId.map(item => {
      return item.id;
    });
    formData.value.fileId = fileIdIdsList.join(',');
  }
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
    .$confirm('是否确认删除公司名称为"' + row.name + '"的数据项？')
    .then(async () => {
      return laborCompanyRemove(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 弹出框提交表单
const submitForm = async formEl => {
  formData.value.sqlSentence = encodeURIComponent(formData.value.sqlSentence);
  formEl.validate(async valid => {
    if (valid) {
      const form = Object.assign({}, formData.value);
      if (Array.isArray(form.fileId)) {
        form.fileId = form?.fileId.map(item => item.id).join(',');
      }
      if (form.id) {
        const res = await addEditeLaborCompany(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await addEditeLaborCompany(form);
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
