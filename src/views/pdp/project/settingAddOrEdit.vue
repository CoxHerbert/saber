<template>
  <el-dialog
    :title="props.title"
    :width="props.width"
    :modelValue="props.visible"
    :destroy-on-close="true"
    @close="handleClose"
    class="dialog-project-setting-add-or-edit"
  >
    <div class="comp-content" v-loading="loading">
      <el-form ref="formRef" :model="formData" label-suffix=":" label-width="80px">
        <template v-for="item in formItems">
          <el-form-item
            v-show="!item.showFunc || (item.showFunc?.call && item.showFunc(formData))"
            :label="item.label"
            :prop="item.prop"
          >
            <el-input
              v-if="item.type === 'el-input'"
              v-model="formData[item.prop]"
              :placeholder="item.props?.placeholder || `请输入${item.label}`"
            ></el-input>
            <el-radio-group
              v-else-if="item.type === 'el-radio-group'"
              v-model="formData[item.prop]"
            >
              <el-radio v-for="(op, k) in item.options" :key="k" :value="op.value">{{
                op.label
              }}</el-radio>
            </el-radio-group>
            <el-select
              v-else-if="item.type === 'el-select'"
              v-model="formData[item.prop]"
              :placeholder="item.props?.placeholder || `请选择${item.label}`"
              v-bind="item.props"
              @change="
                val => {
                  handleFormItemChange(val, item);
                }
              "
              clearable
            >
              <!-- 配置里面有withGroup的情况 -->
              <template v-if="item.withGroup">
                <el-option-group
                  v-for="(opGroup, i) in dictMaps?.[item.dictKey] || []"
                  :key="i"
                  :label="opGroup[item.labelKey]"
                >
                  <el-option
                    v-for="(option, j) in opGroup.children"
                    :key="j"
                    :label="option[item.labelKey]"
                    :value="option[item.valueKey]"
                  />
                </el-option-group>
              </template>
              <template v-else>
                <el-option
                  v-for="(option, j) in dictMaps?.[item.dictKey] || []"
                  :key="j"
                  :label="option[item.labelKey]"
                  :value="option[item.valueKey]"
                />
              </template>
            </el-select>
            <component v-else :is="item.type" v-bind="item.props"></component>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <div class="footer">
      <el-button @click="doAction('submit')" type="primary">提交</el-button>
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </el-dialog>
</template>
<script setup>
import { defineProps, getCurrentInstance, onMounted, reactive, toRefs, watch } from 'vue';
import Options from './utils/setting-add-or-edit';
import Api from '@/api';

const { proxy } = getCurrentInstance();

const formRef = ref(null);

const props = defineProps({
  title: {
    type: String,
    default() {
      return '';
    },
  },
  row: {
    type: Object,
    default() {
      return null;
    },
  },
  width: {
    type: String,
    default() {
      return '';
    },
  },
  visible: {
    type: Boolean,
    default() {
      return false;
    },
  },
});

const emit = defineEmits(['close']);

const compData = reactive({
  loading: false,
  formItems: Options.columns,
  formData: {},
  dictMaps: {},
});

const { loading, formItems, formData, dictMaps } = toRefs(compData);

// 字典或缓存数据
const getDictData = async () => {
  loading.value = true;
  const res = await proxy.useAsyncCache([{ key: 'DC_PMS_PROJECT_ROLE' }]);
  dictMaps.value = res?.value;
  loading.value = false;
  return true;
};

onMounted(async () => {
  await getDictData();
});

const updateRequiredOpions = () => {
  dictMaps.value.requiredField = dictMaps.value.DC_PMS_PROJECT_ROLE?.filter(item => {
    return formData.value.bindField?.includes(item.dictKey);
  });
  formData.value.requiredField = formData.value.requiredField?.filter(k => {
    return formData.value.bindField?.includes(k);
  });
};

const handleFormItemChange = (val, item) => {
  if (item.prop === 'bindField') {
    updateRequiredOpions();
  }
};

const submitForm = () => {
  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      Api.pdp.projectSetting
        .submit({
          ...formData.value,
          bindField: formData.value.bindField?.join(','),
          requiredField: formData.value.requiredField?.join(','),
        })
        .then(res => {
          const { code } = res.data;
          loading.value = false;
          if (code === 200) {
            handleClose();
          }
        });
    })
    .catch(() => {
      loading.value = false;
    });
};

const doAction = action => {
  if (action === 'cancel') {
    handleClose();
  } else if (action === 'submit') {
    submitForm();
  }
};

const handleClose = () => {
  emit('close');
};

defineExpose({
  bindRow(row) {
    formData.value = { ...row };
    updateRequiredOpions();
  },
});
</script>
<style lang="scss" scoped>
.footer {
  margin-top: 40px;
  text-align: center;
}
</style>
