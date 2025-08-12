<template>
  <div class="comp-remote-select">
    <el-select
      v-bind="{
        ...$attrs,
      }"
      :modelValue="modelValue"
      filterable
      remote
      clearable
      :remote-method="remoteSearch"
      :loading="selectLoading"
      :placeholder="props.placeholder"
      @change="handleChange"
    >
      <el-option
        v-for="(item, i) in chekListOptions"
        :key="i"
        :label="item[props.labelKey]"
        :value="item[props.valueKey]"
      >
      </el-option>
    </el-select>
    <el-icon v-if="modelValue" title="点击复制" class="copy-icon" @click="handleDblClick"
      ><CopyDocument
    /></el-icon>
  </div>
</template>

<script setup>
import { defineEmits, defineProps, getCurrentInstance, onMounted } from 'vue';

const { proxy } = getCurrentInstance();
const props = defineProps({
  action: {
    type: Function,
    default() {
      return () => {
        console.error('action is Null');
      };
    },
  },
  // 渲染option
  renderLabel: {
    type: Function,
    default() {
      return null;
    },
  },
  dataCallback: {
    type: Function,
    default() {
      return res => {
        return res.data.data;
      };
    },
  },
  queryKey: {
    type: String,
    default() {
      return 'billNo';
    },
  },
  placeholder: {
    type: String,
    default() {
      return '请输入关键字';
    },
  },
  labelKey: {
    type: String,
    default() {
      return 'label';
    },
  },
  valueKey: {
    type: String,
    default() {
      return 'value';
    },
  },
  modelValue: {
    type: [String, Object],
    default() {
      return '';
    },
  },
  params: {
    type: Object,
    default() {
      return {};
    },
  },
  initQueryKey: {
    type: String,
    default() {
      return '';
    },
  },
});

const init = ref(false);
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (!init.value && !!props.initQueryKey) {
      // 替换为实际API调用
      props
        .action({
          ...props.params,
          [props.initQueryKey]: newVal,
          size: 100,
          current: 1,
        })
        .then(res => {
          if (res.data.code === 200) {
            const dataList = props.dataCallback()(res);
            chekListOptions.value = dataList.map(item => ({
              ...item,
              value: item[props.labelKey],
              label: item[props.valueKey],
            }));
          }
          init.value = true;
        });
    }
  },
  { immediate: true, deep: true } // 根据需要添加
);

const emit = defineEmits(['update:modelValue', 'change']);
const initQuery = ref(true);
const selectLoading = ref(false);
const chekListOptions = ref([]);
// 远程搜索方法
const remoteSearch = async query => {
  if (typeof query === 'string' && !query.trim() && !initQuery.value) return;

  selectLoading.value = true;
  try {
    // 替换为实际API调用
    const res = await props.action({
      ...props.params,
      [props.queryKey]: initQuery.value ? '' : query,
      size: 100,
      current: 1,
    });
    if (res.data.code === 200) {
      const dataList = props.dataCallback()(res);
      chekListOptions.value = dataList.map(item => ({
        ...item,
        value: item[props.labelKey],
        label: item[props.valueKey],
      }));
    }
    initQuery.value = false;
    selectLoading.value = false;
  } finally {
    selectLoading.value = false;
  }
};

const handleChange = val => {
  emit('update:modelValue', val);
  const find = chekListOptions.value?.find(item => item[props.valueKey] === val);
  emit('change', find);
};
// 预加载
onMounted(() => {
  if (props.modelValue) {
    remoteSearch(props.modelValue);
  }
});

function copyTextToClipboard(
  text,
  options = {
    successMsg: '复制成功',
    errorMsg: '复制失败',
  }
) {
  const { successMsg, errorMsg } = options;
  // 空文本直接返回失败
  if (!text || typeof text !== 'string') {
    if (errorMsg) proxy.$message.error(errorMsg);
    return Promise.resolve(false);
  }

  // 现代浏览器方案（优先使用 Clipboard API）
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // 兼容旧浏览器的降级方案
  return Promise.resolve(fallbackCopy(text));
}

// 兼容旧浏览器的实现（document.execCommand ）
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed'; // 避免滚动到可视区域
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    if (!success) proxy.$message.error('复制命令被拒绝');
    return true;
  } catch (err) {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

const handleDblClick = () => {
  if (props.modelValue) {
    const find = chekListOptions.value?.find(item => item[props.valueKey] === props.modelValue);
    copyTextToClipboard(find?.[props.labelKey] || props.modelValue)
      .then(() => {
        proxy.$message.success('复制成功');
      })
      .catch(error => {
        proxy.$message.error('复制失败');
        console.log('error', error);
      });
  }
};
</script>
<style lang="scss" scoped>
.comp-remote-select {
  position: relative;
  width: 100%;
  height: auto;

  .copy-icon {
    position: absolute;
    right: 1px;
    top: 1px;
    height: 30px;
    display: flex;
    align-content: center;
    background-color: #fff;
    display: none;

    &:hover {
      display: block;
    }
  }
  &:hover {
    .copy-icon {
      display: block;
    }
  }
}
</style>
