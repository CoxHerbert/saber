<template>
  <el-select
    v-model="valueData"
    :placeholder="placeholder || currentObject?.placeholder"
    :remote-method="remoteMethod"
    :loading="loading"
    :multiple="multiple"
    :multiple-limit="multipleLimit"
    :max-collapse-tags="maxCollapseTags"
    :clearable="clearable"
    :collapse-tags="true"
    :remote="remote"
    @change="updateModelValue"
    remote-show-suffix
    reserve-keyword
    collapse-tags-tooltip
    filterable
  >
    <template #prefix v-if="remote">
      <el-icon><Search /></el-icon>
    </template>
    <el-option
      v-for="(option, index) in options"
      :label="option[props.showKey || currentObject?.defaultLabel]"
      :value="option.id"
      :key="index"
    >
    </el-option>
  </el-select>
</template>

<script setup>
import { reactive, toRefs, onMounted } from 'vue';
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
    validator: value => ['object', 'string'].includes(value),
  },
  // 占位符，默认为“Select”
  placeholder: {
    type: String,
    default: '',
  },
  // 其中的选项是否从服务器远程加载
  remote: {
    type: Boolean,
    default: true,
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: true,
  },
  // multiple 属性设置为 true 时，代表多选场景下用户最多可以选择的项目数， 为 0 则不限制
  multipleLimit: {
    type: Number,
    default: 0,
  },
  // 需要显示的 Tag 的最大数量 只有当 collapse-tags 设置为 true 时才会生效。
  maxCollapseTags: {
    type: Number,
    default: 1,
  },
  // 是否可以清空选项
  clearable: {
    type: Boolean,
    default: false,
  },
  // 需要展示的字段名称 比如 name deptName
  showKey: {
    type: String,
    default: '',
  },
});
const componentData = reactive({
  // 加载中
  loading: false,
  // 选项
  options: [],
  // 双向绑定的数据
  valueData: [],
  // 当前对象
  currentObject: null,
});
const { loading, options, valueData, currentObject } = toRefs(componentData);
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
    currentObject.value = cacheData[props.objectName];
    if (!newVal) {
      componentData.valueData = props.multiple ? [] : null;
      return;
    }
    if (newVal) {
      let ids;
      if (Array.isArray(newVal)) {
        ids = newVal.map(item => item?.id || item);
      } else if (typeof newVal === 'object' && newVal !== null) {
        try {
          ids = [newVal?.id];
        } catch (error) {
          ids = [];
        }
      } else if (typeof newVal === 'string') {
        ids = newVal.split(',');
      }
      if (!ids.length) return;
      if (!ids || (Array.isArray(ids) && ids.length === 0)) return;
      await ComponentApi.cache.getView({
        url: currentObject.value.url,
        data: ids,
      });
      const currentGlobalData = store.getters.globalData[currentObject.value.url];
      componentData.options = ids.map(id => currentGlobalData[id] || id);
      if (props.multiple) {
        componentData.valueData = ids;
      } else if (!props.multiple) {
        componentData.valueData = ids[0];
      }
    }
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  if (!props.remote) await getOptions();
});

const getOptions = async () => {
  const params = {
    ...props.params,
    // queryName: currentObject.value?.defaultLabel || undefined,
    // queryValue: '',
  };
  const res = await ComponentApi.cache.getQuery({
    url: currentObject.value.url,
    params,
  });
  const { code, data } = res.data;
  if (code === 200) {
    options.value = data;
  }
};

const remoteMethod = async query => {
  if (query) {
    loading.value = true;
    const params = {
      ...props.params,
      queryName: currentObject.value?.defaultLabel || undefined,
      queryValue: query,
    };
    const res = await ComponentApi.cache.getQuery({
      url: currentObject.value.url,
      params,
    });
    const { code, data } = res.data;
    if (code === 200) {
      options.value = data;
    }
    loading.value = false;
  }
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
