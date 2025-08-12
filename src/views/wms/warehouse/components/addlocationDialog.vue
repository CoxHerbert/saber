<template>
  <el-drawer v-model="dialogVisible" size="400px" title="添加库位" @close="cancel">
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="排数" prop="queueNumber">
            <el-input-number
              style="width: 100%"
              type="number"
              :max="999"
              v-model="formData.queueNumber"
              placeholder="请输入排数"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="层数" prop="levelNumber">
            <el-input-number
              style="width: 100%"
              type="number"
              :max="999"
              v-model="formData.levelNumber"
              placeholder="请输入层数"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="位数" prop="digit">
            <el-input-number
              style="width: 100%"
              type="number"
              :max="999"
              v-model="formData.digit"
              placeholder="请输入位数"
            ></el-input-number>
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
</template>
<script setup>
import Api from '@/api/index'; // 根据实际路径调整导入
const { proxy } = getCurrentInstance();
const data = reactive({
  row: {},
  loading: true,
  rules: {
    queueNumber: [{ required: true, message: '排数为必选项', trigger: 'change' }],
    levelNumber: [{ required: true, message: '层数为必选项', trigger: 'change' }],
    digit: [{ required: true, message: '位数为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
  formData: {},
});
const { rules, dialogVisible, formData } = toRefs(data);
const ruleFormRef = ref(null);

const emit = defineEmits(['success']);

// 打开添加弹窗
const openDialog = async row => {
  dialogVisible.value = true;
  data.formData.warehouseId = row.id;
  proxy.resetForm('ruleFormRef');
};

// 弹出框提交表单
const submitForm = async formEl => {
  // console.log(data.formData);
  // return;
  formEl.validate(async valid => {
    if (valid) {
      let newrow = Object.assign(data.row, formData.value);
      const res = await Api.wms.warehouse.batchgenerationlocation(newrow);
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
  formData.value = {};
};

defineExpose({
  openDialog,
});
</script>
