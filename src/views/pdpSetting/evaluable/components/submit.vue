<template>
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="计划" prop="planId">
        <dc-select-dialog
          v-model="formData.planId"
          placeholder="请点击选择计划"
          objectName="planItem"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
          :params="{
            isMine: true,
          }"
        />
      </el-form-item>
      <el-form-item label="评估项类型" prop="feaItemType">
        <el-select v-model="formData.feaItemType" placeholder="请选择类型">
          <el-option
            v-for="item in DC_FEA_ITEM_TYPE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="评估问题" prop="feaEvaluationProblem">
        <el-input
          v-model="formData.feaEvaluationProblem"
          autosize
          type="textarea"
          :rows="7"
          placeholder="请输入描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">关闭</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup>
import { reactive, ref, toRefs, getCurrentInstance } from 'vue';
import Api from '@/api/index';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

const { DC_FEA_ITEM_TYPE } = proxy.useCache([{ key: 'DC_FEA_ITEM_TYPE' }]);

const compData = reactive({
  open: false,
  title: '',
  rules: {
    feaItemType: [{ required: true, message: '请选择类型', trigger: 'change' }],
    feaEvaluationProblem: [{ message: '描述不能超过200个字符', trigger: 'blur' }],
    // planId: [{ required: true, message: '请选择计划', trigger: 'change' }],
  },
  formData: {
    feaItemType: null,
    feaEvaluationProblem: '',
    planId: null,
  },
});

const { open, title, rules, formData } = toRefs(compData);
const formRef = ref(null);

// 保存提交
const submitForm = async () => {
  formRef.value.validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        planId: formData.value.planId,
      };
      const res = await Api.pdp.evaluable.submit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: msg });
        closeDrawer();
        emit('confirm');
      }
    }
  });
};

// 打开抽屉
const openDrawer = row => {
  title.value = row?.id ? '修改模板' : '新增模板';
  if (row?.id) {
    Object.keys(formData.value).forEach(key => (formData.value[key] = row[key]));
    formData.value.id = row?.id;
  }
  open.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  formData.value = {
    feaItemType: null,
    feaEvaluationProblem: '',
    planId: null,
  };
};

defineExpose({
  openDrawer,
});
</script>
