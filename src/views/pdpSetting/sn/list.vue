<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="租户" prop="tenantId">
        <el-select v-model="queryParams.tenantId" placeholder="请选择租户" clearable>
          <el-option
            v-for="(item, index) in data.tenantList"
            :key="index"
            :value="item.tenantId"
            :label="item.tenantName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入编码" clearable />
      </el-form-item>
      <el-form-item label="批次编码" prop="batchCode">
        <el-input v-model="queryParams.batchCode" placeholder="请输入批次编码" clearable />
      </el-form-item>
      <el-form-item label="用途编码" prop="purpose">
        <el-input v-model="queryParams.purpose" placeholder="请输入用途编码" clearable />
      </el-form-item>
      <el-form-item label="源信息编码" prop="sourceCode">
        <el-input v-model="queryParams.sourceCode" placeholder="请输入源信息编码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="operate-container">
      <el-button type="primary" icon="CirclePlus" @click="handleAdd">批量生成SN</el-button>
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column min-width="100px" label="租户" align="center">
          <template #default="scoped">
            {{ findTenantName(scoped.row.tenantId) }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="100px"
          label="编码"
          align="center"
          prop="code"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column min-width="120px" label="批次编码" align="center" prop="batchCode">
        </el-table-column>

        <el-table-column min-width="120px" label="用途编码" align="center" prop="purpose">
        </el-table-column>

        <el-table-column min-width="120px" label="源信息编码" align="center" prop="sourceCode">
        </el-table-column>

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

    <el-drawer v-model="dialogVisible" size="600px" :title="title" @close="cancel">
      <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="本次生成数量" prop="createSize">
              <el-input
                type="number"
                v-model="formData.createSize"
                placeholder="请输入本次生成数量"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="源编码集合" prop="sourceCodes">
              <el-input-tag
                type="number"
                v-model="formData.sourceCodes"
                placeholder="请输入源编码集合"
              ></el-input-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="用途" prop="purpose">
              <el-input
                type="textarea"
                v-model="formData.purpose"
                placeholder="请输入用途
"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                type="textarea"
                v-model="formData.remark"
                placeholder="请输入备注"
              ></el-input>
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
import { getList, remove, add } from '@/api/system/sn';
import { getTenantList } from '@/api/system/expNotice';

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
    purpose: [{ required: true, message: '用途为必选项', trigger: 'change' }],
    createSize: [{ required: true, message: '本次生成数量为必选项', trigger: 'change' }],
    //sourceCodes: [{ required: true, message: '源编码集合为必选项', trigger: 'blur' }],
  },
  dialogVisible: false,
});

const { queryParams, formData, dataList, loading, total, title, rules, dialogVisible } =
  toRefs(data);

const ruleFormRef = ref(null);

onMounted(() => {
  getData();
  getTenantListFn();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await getList(queryParams.value);
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

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = [row.id];
  proxy
    .$confirm('是否确认删除此数据项？')
    .then(async () => {
      return remove(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 打开添加弹窗
const handleAdd = async () => {
  title.value = '批量生成SN';
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

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      const form = Object.assign({}, formData.value);
      if (form.sourceCodes) {
        form.sourceCodes = form.sourceCodes.join(',');
      }
      const res = await add(form);
      const { code, msg } = res.data;
      if (code === 200) {
        cancel();
        getData();
        proxy.$message.success(msg);
      }
    } else {
      console.log('error submit!');
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

const findTenantName = tenantId => {
  const tenant = data.tenantList.find(item => item.tenantId === tenantId);
  return tenant ? tenant.tenantName : '';
};
</script>
<style lang="scss" scoped>
.avatar-container {
  position: relative;
  display: inline-block;
  width: 178px;
  height: 178px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.avatar-container:hover {
  border-color: var(--el-color-primary);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  display: none;
}

.avatar-container:hover .delete-button {
  display: block;
}

.avatar-uploader .el-upload {
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
}
.photo {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eee;
}
</style>
