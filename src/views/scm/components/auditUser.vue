<template>
  <el-dialog v-model="dialogVisible" width="400px" :title="`${title}`" @close="cancel">
    <el-form
      ref="ruleFormRef"
      :rules="formRules"
      :model="formData"
      label-width="auto"
      label-suffix=":"
    >
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-for="(item, index) in formConfig"
        :key="index"
      >
        <component
          v-if="item.type === 'el-select'"
          :is="item.type"
          v-bind="item.props"
          v-model="formData[item.prop]"
          @change="
            e => {
              handleCommonChange(e, item);
            }
          "
        >
          <el-option
            v-for="(op, opIndex) in item.options"
            :key="opIndex"
            :label="op?.label ? op.label : op[item.labelKey]"
            :value="op?.value ? op.value : op[item.valueKey]"
          />
        </component>
      </el-form-item>
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
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

// 数据字典
// const { DC_INSPECTION_CLASS } = proxy.useCache([{ key: 'DC_INSPECTION_CLASS' }]);

const data = reactive({
  loading: true,
  dialogVisible: false,
  formData: {},
  title: '提交审核',
  formConfig: [],
  submitApi: null,
});
const { dialogVisible, formData, title, formConfig, submitApi } = toRefs(data);
const ruleFormRef = ref(null);
const formRules = computed(() => {
  const result = {};
  formConfig.value.forEach(item => {
    if (item.required) {
      result[item.prop] = [
        {
          required: true,
          trigger: ['blur', 'change'],
          validator(_, value, callback) {
            if ([null, '', undefined].includes(value)) {
              callback(new Error(item.props.placeholder));
            } else {
              callback();
            }
          },
        },
      ];
    }
  });

  return result;
});

const emit = defineEmits(['success']);

const handleCommonChange = (value, prop) => {
  console.log(value, prop);
};

// 打开添加弹窗
const openDialog = async (row, api, options) => {
  dialogVisible.value = true;
  formConfig.value = options;
  submitApi.value = api;
  formData.value = {
    ...row,
  };
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      const res = await submitApi.value(formData.value);
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
