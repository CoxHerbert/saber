<template>
  <el-form-item
    :class="props.formItemClass"
    :label="templateProps.label"
    :label-width="labelWidth"
    :rules="getFormRule(props.templateProps, templateProp)"
    :prop="templateProp"
    v-show="props.show"
  >
    <dc-select-dialog-v2
      v-bind="templateProps.props"
      :initChangeable="true"
      :modelValue="props.modelTemplate"
      :disabled="props.disabled || templateProps.props?.disabled || props.mode === 'edit'"
      @change="
        val => {
          handleTemplateChange(val);
        }
      "
    ></dc-select-dialog-v2>
  </el-form-item>
  <template v-for="(item, i) in modelFieldList" :key="i">
    <template v-if="getRemark(item)">
      <el-form-item
        :class="props.formItemClass"
        :label="getLabel(item) + '组'"
        :label-width="labelWidth"
        :rules="
          item.requiredField
            ? getFormRule(item, [props.modelFieldListProp, i, 'bindUserIds'])
            : undefined
        "
        :prop="`${props.modelFieldListProp}.${i}.bindUserIds`"
      >
        <wf-select-dialog
          v-model="item.remark"
          :disabled="props.disabled"
          :query="{
            isEnable: '1',
          }"
          objectName="workGroup"
          @change="
            val => {
              handleMemberWrokGroupChange(item, val);
            }
          "
        />
      </el-form-item>
      <el-form-item
        :class="props.formItemClass"
        :label="getLabel(item)"
        :label-width="labelWidth"
        :rules="
          item.requiredField
            ? getFormRule(item, [props.modelFieldListProp, i, 'bindUserIds'])
            : undefined
        "
        :prop="`${props.modelFieldListProp}.${i}.bindUserIds`"
      >
        <dc-select-user
          type="input"
          returnType="string"
          :initChangeable="true"
          :modelValue="item.bindUserIds"
          :multiple="false"
          :multipleLimit="1"
          :disabled="true"
          :placeholder="`<由${getLabel(item)}组带出>`"
          @change="
            val => {
              handleMemberChange(val, item, i);
            }
          "
        />
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item
        :class="props.formItemClass"
        :label="getLabel(item)"
        :label-width="labelWidth"
        :rules="
          item.requiredField
            ? getFormRule(item, [props.modelFieldListProp, i, 'bindUserIds'])
            : undefined
        "
        :prop="`${props.modelFieldListProp}.${i}.bindUserIds`"
      >
        <dc-select-user
          type="input"
          returnType="string"
          :initChangeable="true"
          :modelValue="item.bindUserIds"
          :multiple="false"
          :disabled="props.disabled"
          :multipleLimit="1"
          @change="
            val => {
              handleMemberChange(val, item, i);
            }
          "
        />
      </el-form-item>
    </template>
  </template>
</template>
<script setup>
import {
  defineProps,
  defineEmits,
  onMounted,
  getCurrentInstance,
  reactive,
  toRefs,
  onBeforeMount,
} from 'vue';
const props = defineProps({
  disabled: {
    type: Boolean,
    default() {
      return false;
    },
  },
  labelWidth: {
    type: String,
    default() {
      return '';
    },
  },
  formItemClass: {
    type: String,
    default() {
      return '';
    },
  },
  mode: {
    type: String,
    default() {
      return 'add';
    },
  },
  show: {
    type: Boolean,
    default() {
      return true;
    },
  },
  templateProp: {
    type: String,
    default() {
      return 'funcFieldTemplateId';
    },
  },
  templateProps: {
    type: Object,
    default() {
      return {
        label: '人员模板',
        type: 'dc-select-dialog-v2',
        required: true,
        props: {
          objectName: 'projectSettingTemplate',
          returnType: 'object',
          multiple: false,
          multipleLimit: 1,
          type: 'input',
          placeholder: '请选择配置模板',
        },
      };
    },
  },
  modelFieldListProps: {
    type: Object,
    default() {
      return {
        label: '',
        type: 'dynamicsItems',
      };
    },
  },
  modelFieldListProp: {
    type: String,
    default() {
      return 'dcPmsProjectPhaseList';
    },
  },
  modelTemplate: {
    type: [String, Object],
    defautl() {
      return null;
    },
  },
  modelFieldList: {
    type: Array,
    defautl() {
      return [];
    },
  },
});

const emit = defineEmits(['update:modelTemplate', 'update:modelFieldList']);
const { proxy } = getCurrentInstance();

const dictMaps = ref({});

const isNullData = value => {
  if ([null, undefined, ''].includes(value)) {
    return true;
  } else if (Array.isArray(value) && value?.length === 0) {
    return true;
  }
  return false;
};

const getFormRule = (item, index) => {
  return [
    {
      required: true,
      index,
      item,
      validator(rule, value, callback) {
        const value_ =
          rule.index === props.templateProp
            ? props.modelTemplate
            : props.modelFieldList[rule.index[1]][rule.index[2]];
        if (isNullData(value || value_)) {
          callback(new Error(rule.item.props?.placeholder || `${rule.item.label}不能为空`));
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change'],
    },
  ];
};

const getDictData = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_PMS_PROJECT_ROLE' }]);
  dictMaps.value = res?.value;
  return true;
};

const handleMemberChange = (val, item, i) => {
  const newValue = props.modelFieldList;
  newValue[i].bindUserIds = val?.id;
  emit('update:modelFieldList', newValue);
};

const getLabel = item => {
  if (!item.label) {
    const find = dictMaps.value.DC_PMS_PROJECT_ROLE.find(dict => {
      return dict.dictKey === item.filedKey;
    });
    item.label = find?.dictValue;
  }
  return item.label;
};
const getRemark = item => {
  try {
    const find = dictMaps.value.DC_PMS_PROJECT_ROLE.find(dict => dict.dictKey === item.filedKey);
    item.label = find?.dictValue;
    return JSON.parse(find.remark);
  } catch (error) {
    return false;
  }
};

const handleTemplateChange = val => {
  const fieldList = getDynamicsItems(val);
  emit('update:modelTemplate', val);
  emit('update:modelFieldList', fieldList);
  setTimeout(() => {
    emit('change', { [props.modelFieldListProp]: fieldList, [props.templateProp]: val });
  }, 10);
};

// 交付启动会特殊处理 人员由工作组带出
const handleMemberWrokGroupChange = (col, val) => {
  col.bindUserIds = val?.chargePersonId;
};

/** 编辑时取当时存储的字段和模板最新ID的并集 */
const getDynamicsItems = val => {
  let fieldMaps = {};
  if (props.mode === 'edit' && props.modelFieldList?.length > 0) {
    props.modelFieldList.forEach(item => {
      const find = dictMaps.value.DC_PMS_PROJECT_ROLE.find(dict => {
        return dict.dictKey === item.filedKey;
      });
      fieldMaps[item.filedKey] = {
        label: find?.dictValue,
        ...item,
      };
    });
  }
  const requiredFileds = val?.requiredField?.split(',') || [];
  val?.bindField?.split(',').forEach(key => {
    const find = dictMaps.value.DC_PMS_PROJECT_ROLE.find(item => {
      return item.dictKey === key;
    });
    fieldMaps[key] = fieldMaps[key]
      ? {
          ...fieldMaps[key],
          requiredField: requiredFileds.includes(key),
        }
      : {
          label: find?.dictValue,
          filedKey: key,
          bindUserIds: '',
          requiredField: requiredFileds.includes(key),
        };
  });

  return Object.values(fieldMaps);
};

onBeforeMount(async () => {
  await getDictData();
});
</script>
