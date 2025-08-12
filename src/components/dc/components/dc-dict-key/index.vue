<template>
  <span class="dict" :style="{ color: color }" :class="dict?.listClass">{{
    dict?.label || dict?.dictKey || '-'
  }}</span>
</template>

<script setup>
const props = defineProps({
  // 类型
  type: {
    type: String,
    default: '',
  },
  // 数据
  options: {
    type: Array,
    default: null,
  },
  // 当前的值
  value: [Number, String, Array],
  color: {
    type: String,
    default: null,
  },
});

const dict = computed(() => {
  // 递归查找函数
  const findDict = (options, value) => {
    for (const item of options) {
      if (item.dictKey === String(value)) {
        return item;
      }
      if (item.children && Array.isArray(item.children)) {
        const found = findDict(item.children, value);
        if (found) return found;
      }
    }
    return null;
  };

  if (Array.isArray(props.options) && props.options.length) {
    const result = findDict(props.options, props.value);
    return result || props.value;
  }

  return props.value;
});
</script>

<style lang="scss" scoped>
.dict {
  display: inline-flex;
}
</style>
