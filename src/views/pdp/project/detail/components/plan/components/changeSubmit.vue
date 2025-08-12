<template>
  <el-dialog
    class="dialog-change"
    v-model="open"
    title="变更申请"
    destroy-on-close
    append-to-body
    @close="closeDialog"
  >
    <div class="pl-5">
      <div class="change-title mb-3">申请变更前</div>
      <el-form class="pl-5" ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="处理人" prop="followId">
          <dc-select-user
            v-model="info.handlePersonId"
            placeholder="请选择"
            :multiple="true"
            :multiple-limit="0"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="计划时间" prop="followDate">
          <dc-date-range
            v-model:startDate="info.startDate"
            v-model:endDate="info.endDate"
            startPlaceholder="计划开始"
            endPlaceholder="计划结束"
            :disabled="true"
          />
        </el-form-item>
      </el-form>
      <div class="change-title mb-3">申请变更后</div>
      <el-form class="pl-5" ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="处理人" prop="currentChargePersonId">
          <dc-select-user
            v-model="formData.currentChargePersonId"
            placeholder="请选择处理人"
            :multiple="true"
            :multiple-limit="0"
          />
        </el-form-item>
        <el-form-item label="计划时间" prop="currentStartDate">
          <dc-date-range
            v-model:startDate="formData.currentStartDate"
            v-model:endDate="formData.currentEndDate"
            startPlaceholder="计划开始"
            endPlaceholder="计划结束"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">提交申请</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { reactive } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const compData = reactive({
  open: false,
  info: {},
  formData: {},
  rules: {
    currentChargePersonId: [{ required: true, message: '请选择处理人', trigger: 'blur' }],
    currentStartDate: [{ required: true, message: '前选择计划开始/结束时间', trigger: 'blur' }],
  },
});

const { open, info, formData, rules } = toRefs(compData);

// 提交变更申请
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const res = await Api.pdp.changeRecord.sumbitProcess(formData.value);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '申请成功' });
        closeDialog();
        proxy.$store.dispatch('UpdateWorkCountStatistic');
      }
    }
  });
};

// 取消
const closeDialog = () => {
  info.value = {};
  formData.value = {};
  open.value = false;
};

// 打开抽屉
const openDialog = async plan => {
  info.value = plan;
  formData.value = {
    businessId: info.value.id,
    formerChargePersonId: info.value.handlePersonId,
    formerStartDate: info.value.startDate,
    formerEndDate: info.value.endDate,
    handlePersonId: info.value.createUser,
    currentChargePersonId: null,
    currentStartDate: null,
    currentEndDate: null,
  };
  open.value = true;
};

defineExpose({
  openDialog,
});
</script>
<style lang="scss">
.dialog-change .el-dialog__body {
  .change-title {
    font-size: 14px;
    font-weight: 600;
    color: #000;
  }
}
</style>
