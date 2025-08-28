<template>
  <span
    v-if="type === 'tag' && !option?.listClass"
    :style="{
      background: option?.bgColor || proxy.hexToRgba(option?.remark, 0.1),
      color: option?.textColor || proxy.hexToRgba(option?.remark, 1),
    }"
    class="dict"
  >
    {{ option?.label || value || '-' }}
  </span>
  <span class="dict" v-else-if="type === 'tag' && option?.listClass" :class="option?.listClass">{{
    option?.label || '-'
  }}</span>
  <span v-else-if="type === 'text'">{{ option?.label || '-' }}</span>
</template>

<script setup>
const { proxy } = getCurrentInstance();

const props = defineProps({
  // 类型
  type: {
    type: String,
    default: 'tag',
  },
  // 数据
  options: {
    type: Array,
    default: null,
  },
  // 当前的值
  value: [Number, String, Array],
});

const option = computed(() => {
  // 递归查找函数
  const findOption = (options, value) => {
    for (const option of options) {
      if (option.value == value || option.label == value || option.id === value) {
        return option;
      }
      if (option.children && Array.isArray(option.children)) {
        const found = findOption(option.children, value);
        if (found) return found;
      }
    }
    return null;
  };

  if (Array.isArray(props.options)) {
    const result = findOption(props.options, props.value);
    return (
      result || {
        value: props.value,
        label: props.value,
        textColor: '#666',
        bgColor: '#ebeef5',
      }
    );
  }

  return {
    value: props.value,
    label: props.value,
    textColor: '#666',
    bgColor: '#ebeef5',
  };
});
</script>

<style lang="scss" scoped></style>
