<template>
  <basic-container v-loading="loading">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="68px"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="版本号" prop="version">
        <el-input v-model="queryParams.version" placeholder="请输入" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="operate-container">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
    </div>
    <div class="table-container">
      <el-table :data="dataList">
        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="version"
          label="版本号"
          align="center"
          show-overflow-tooltip
          width="150"
        />
        <el-table-column
          prop="downloadUrl"
          label="下载地址"
          align="center"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <el-button handleCopy @click="handleCopy(scoped.row.downloadUrl)" link>
              {{ scoped.row.downloadUrl }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="describtion"
          label="描述"
          align="center"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="scoped">
            {{ scoped.row.describtion }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="180" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="180" />
        <el-table-column label="操作" align="center" fixed="right" width="150">
          <template #default="scoped">
            <el-button link type="primary" @click="handleDelete(scoped.row)">删除</el-button>
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

    <el-drawer
      v-model="dialog.open"
      width="500"
      :title="dialog.title"
      size="600px"
      @close="cancel"
      append-to-body
    >
      <el-form :model="formData" :rules="rules" label-width="88px" ref="submitFormRef">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="formData.version" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="apk" prop="downloadUrl">
          <dc-upload
            v-model="formData.downloadUrl"
            :limit="1"
            :fileType="['apk']"
            :isShowTip="true"
            :targetType="Constant.targetType.CUSTOMER"
          />
        </el-form-item>
        <el-form-item label="描述" prop="describtion">
          <el-input v-model="formData.describtion" placeholder="请输入" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>

<script setup name="PdaManage">
import Api from '@/api/index';
import { onMounted } from 'vue';
import Constant from '@/const/index';

const { proxy } = getCurrentInstance();

const data = reactive({
  loading: true,
  queryParams: {
    current: 1,
    size: 10,
    version: undefined,
  },
  total: 0,
  dataList: [],
  formData: {},
  rules: {
    version: [{ required: true, message: '版本号为必填项', trigger: 'blur' }],
    downloadUrl: [{ required: true, message: 'apk为必传项', trigger: 'blur' }],
  },
  dialog: {
    open: false,
    title: '',
  },
});

const { loading, queryParams, total, dataList, formData, rules, dialog } = toRefs(data);

onMounted(() => {
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.system.pda.getPdaVersionList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

/** 表单重置 */
const reset = () => {
  formData.value = {
    version: undefined,
    downloadUrl: undefined,
    describtion: undefined,
  };
  proxy.resetForm('submitFormRef');
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm('queryRef');
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.value.open = true;
  dialog.value.title = '新增版本号信息';
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = row.id;
  proxy
    .$confirm('是否确认删除版本号为"' + row.version + '"的数据项？')
    .then(async () => {
      return await Api.system.pda.deletePdaVersion(configIds);
    })
    .then(() => {
      getData();
      proxy.$message.success('删除成功');
    })
    .catch(() => {});
};

// 弹出框提交表单
const submitForm = () => {
  proxy.$refs['submitFormRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        downloadUrl: formData.value.downloadUrl[0].url,
      };
      const res = await Api.system.pda.postPdaVersion(form);
      const { code, msg } = res.data;
      if (code === 200) {
        cancel();
        getData();
        proxy.$message.success(msg);
      }
    }
  });
};

// 取消弹窗
const cancel = () => {
  dialog.value.open = false;
  reset();
};

// 处理复制
const handleCopy = async url => {
  await navigator.clipboard.writeText(url);
  proxy.$message({
    type: 'success',
    message: '复制成功!',
  });
};
</script>
