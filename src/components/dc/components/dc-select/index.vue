<template>
  <el-select
    v-model="valueData"
    :placeholder="placeholder || currentObject?.placeholder"
    :clearable="clearable"
    @change="updateModelValue"
  >
    <el-option
      v-for="(option, index) in options"
      :label="option[props.labelKey ? props.labelKey : currentObject?.defaultLabel]"
      :value="option[props.valueKey ? props.valueKey : 'id']"
      :key="index"
    >
    </el-option>
  </el-select>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
import ComponentApi from './../../api/index';
import store from '@/store/';
import cacheData from './../../constant/cacheData';
const emit = defineEmits(['update:modelValue', 'change']);
const props = defineProps({
  // 绑定的值
  modelValue: {
    type: [String, Array, Object, null],
    default: null,
  },
  // 如果用户指定了labelKey就有限使用此labelKey
  labelKey: {
    type: String,
    default() {
      return '';
    },
  },
  valueKey: {
    type: String,
    default() {
      return '';
    },
  },
  // 类的名称
  objectName: {
    type: String,
    default: '',
    validator: value => Object.keys(cacheData).includes(value),
  },
  // 查询参数
  params: {
    type: Object,
    default: null,
  },
  // 双向绑定数据返回的数据格式
  returnType: {
    type: String,
    default: 'string',
    validator: value => ['string', 'object'].includes(value),
  },
  // 占位符，默认为“Select”
  placeholder: {
    type: String,
    default: '',
  },
  // 是否可以清空选项
  clearable: {
    type: Boolean,
    default: false,
  },
});
const componentData = reactive({
  // 选项
  options: [],
  // 双向绑定的数据
  valueData: null,
  // 当前对象
  currentObject: null,
});
const { options, valueData, currentObject } = toRefs(componentData);
const globalData = computed(() => {
  if (currentObject.value.url) {
    return store.getters.globalData[currentObject.value.url];
  } else {
    return {};
  }
});
watch(
  () => props.modelValue,
  async (newVal, oldVal) => {
    valueData.value = newVal;
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  await getOptions();
});

const getOptions = async () => {
  currentObject.value = cacheData[props.objectName];
  const params = {};
  params['queryName'] = undefined;
  params['queryValue'] = undefined;
  await ComponentApi.cache.getList({
    url: currentObject.value.url,
    // params,
  });
  options.value = store.getters.globalData[currentObject.value.url];
};

// 数据更新
const updateModelValue = () => {
  // 处理多选情况
  if (props.multiple) {
    const value = componentData.valueData.map(item => globalData.value[item?.id || item]);

    // 处理返回值类型
    if (props.returnType === 'string') {
      const ids = Array.isArray(value) ? value : [];
      emit('update:modelValue', ids.join(','));
    } else if (props.returnType === 'object') {
      emit('update:modelValue', value);
    }

    emit('change', value);
    return;
  }

  // 单选情况
  let value = null;
  if (props.returnType === 'string') {
    value = componentData.valueData;
  } else if (props.returnType === 'object') {
    value = globalData.value[componentData.valueData] || null;
  }

  emit('update:modelValue', value);

  // 处理 change 事件
  if (componentData.valueData) {
    const finalValue =
      typeof componentData.valueData === 'string'
        ? globalData.value[componentData.valueData]
        : componentData.valueData;
    emit('change', finalValue);
  } else {
    emit('change', null);
  }
};
</script>
<style>
.custom-dropdown {
  left: 0 !important; /* 根据需要调整，确保下拉框正确显示 */
  transform: translateX(0) !important; /* 确保位置正确 */
}
</style>
