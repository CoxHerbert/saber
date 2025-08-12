<template>
  <el-dialog v-model="dialogVisible" width="40%" :title="`${title}`" @close="cancel">
    <el-form
      ref="ruleFormRef"
      :rules="rules"
      :model="formData"
      label-width="auto"
      style="overflow-x: hidden; padding: 0px 20px; box-sizing: border-box"
    >
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item class="form-itme-width" label="审批节点名称" prop="nodeName">
            <el-input v-model="formData.nodeName" placeholder="请输入审批节点名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item class="form-itme-width" label="审批节点编码" prop="nodeCode">
            <el-input v-model="formData.nodeCode" placeholder="请输入审批节点编码" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item class="form-itme-width" label="配置角色" prop="roleIds">
            <el-tree-select
              v-model="formData.roleIds"
              :data="treeData"
              show-checkbox
              multiple
              :render-after-expand="false"
              :check-strictly="true"
              node-key="id"
              :props="{
                children: 'children',
                label: 'title',
              }"
            />
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
  </el-dialog>
</template>
<script setup>
import dayjs from 'dayjs';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

// 数据字典
// const {} = proxy.useCache();

const data = reactive({
  loading: true,
  rules: {
    nodeName: [{ required: true, message: '审批节点名称为必填项', trigger: 'blur' }],
    nodeCode: [{ required: true, message: '审批节点编码为必填项', trigger: 'blur' }],
    roleIds: [{ required: true, message: '配置角色为必选项', trigger: 'blur' }],
  },
  treeData: [],
  dialogVisible: false,
  formData: {},
  title: '新增',
  type: 'add',
  typeTitle: {
    add: '新增',
    edit: '编辑',
  },
});
const { rules, treeData, dialogVisible, formData, title, type, typeTitle } = toRefs(data);
const ruleFormRef = ref(null);

const handleModeChange = () => {
  setTimeout(() => {
    formData.value.materialNumberCollection = [];
  }, 100);
};

const emit = defineEmits(['success']);

const getTree = async () => {
  Api.system.role
    .getRoleTreetenantId()
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        treeData.value = data;
        console.log(data);
      }
    })
    .catch(err => console.error(err));
};

// 打开添加弹窗
const openDialog = async (action, row) => {
  dialogVisible.value = true;
  getTree();
  type.value = action;
  title.value = typeTitle.value[action];
  console.log(row.roleIds.split(','));
  data.formData =
    JSON.parse(
      JSON.stringify({
        ...row,
        roleIds: row.roleIds ? row.roleIds.split(',') : [],
      })
    ) || {};
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let newrow = Object.assign(formData.value, {});
      const res = await Api.scm.scmAuditNodeConfig.submit({
        ...newrow,
        roleIds: newrow.roleIds ? newrow.roleIds.join(',') : '',
      });
      const { code, msg } = res.data;
      if (code === 200) {
        cancel();
        emit('success');
        proxy.$message.success(msg);
      }
    }
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  ruleFormRef.value.resetFields();
  formData.value = {};
};

defineExpose({
  openDialog,
});
</script>

<style scoped lang="scss">
.dialog-search-box {
  width: 600px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 50%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 120px);
    }
  }
}
</style>
