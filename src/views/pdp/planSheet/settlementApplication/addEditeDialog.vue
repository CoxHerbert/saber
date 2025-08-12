<template>
  <el-dialog
    v-model="dialogVisible"
    width="600px"
    :title="`${data.title}`"
    @close="cancel"
    body-class="dialog-body"
  >
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
          :disabled="data?.isDisabled"
        >
          <el-option
            v-for="(op, opIndex) in item.options"
            :key="opIndex"
            :label="op?.label ? op.label : op[item.labelKey]"
            :value="op?.value ? op.value : op[item.valueKey]"
          />
        </component>
        <component
          v-if="item.type === 'dc-date-range'"
          :is="item.type"
          v-bind="item.props"
          v-model:startDate="formData[item.startDateKey]"
          v-model:endDate="formData[item.endDateKey]"
          @change="
            e => {
              handleCommonChange(e, item);
            }
          "
          :disabled="data.isDisabled"
        >
        </component>
        <component
          v-else
          :is="item.type"
          v-bind="item.props"
          v-model="formData[item.prop]"
          @change="
            e => {
              handleCommonChange(e, item);
            }
          "
          :disabled="data.isDisabled"
        >
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
  isDisabled: false,
});
const { dialogVisible, formData, formConfig, submitApi } = toRefs(data);
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
const openDialog = async ({ title, isDisabled, api, options, action, row }) => {
  dialogVisible.value = true;
  formConfig.value = options;
  data.isDisabled = isDisabled;
  data.title = title;
  submitApi.value = api;
  if (action === 'create') {
    formConfig.value.forEach(item => {
      if (item.type === 'dc-date-range') {
        if (item.startDateKey) {
          formData.value[item.startDateKey] = row[item.prop] || '';
        }
        if (item.endDateKey) {
          formData.value[item.endDateKey] = row[item.prop] || '';
        }
      } else {
        if (item.prop) {
          formData.value[item.prop] = row[item.prop] || '';
        }
      }
    });
  } else {
    formData.value = JSON.parse(JSON.stringify(row));
  }
  ruleFormRef.value.resetFields();
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

<style lang="scss">
.dialog-body {
  max-height: 70vh !important;
  height: unset !important;
}
</style>
