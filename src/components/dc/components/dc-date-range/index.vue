<template>
  <el-date-picker
    v-model="daterange"
    type="daterange"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    range-separator="至"
    format="YYYY-MM-DD"
    :value-format="valueFormat"
    @change="updateModelValue"
    :clearable="clearable"
    :disabled-date="props.disabledDate"
    :disabled="disabled"
  />
</template>

<script setup>
import { nextTick, onBeforeMount } from 'vue';

const emit = defineEmits(['update:startDate', 'update:endDate', 'change']);

const props = defineProps({
  // 开始时间
  startDate: {
    type: String,
    default: null,
  },
  // 结束时间
  endDate: {
    type: String,
    default: null,
  },
  // 是否可以清空
  clearable: {
    type: Boolean,
    default: false,
  },
  // 时间值格式化
  valueFormat: {
    type: String,
    default: 'YYYY-MM-DD',
  },
  // 开始占位符
  startPlaceholder: {
    type: String,
    default: '开始时间',
  },
  // 结束占位符
  endPlaceholder: {
    type: String,
    default: '结束时间',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disabledDate: {
    type: Function,
    default: () => false,
  },
});

const daterange = ref([]);

watch(
  () => props,
  newProps => {
    if (newProps.startDate && newProps.endDate) {
      daterange.value = [newProps.startDate, newProps.endDate];
    } else {
      daterange.value = [];
    }
  },
  { deep: true }
);

onBeforeMount(() => {
  nextTick(() => {
    daterange.value = [props.startDate, props.endDate];
  });
});

const updateModelValue = () => {
  let startDate = null;
  let endDate = null;
  if (daterange.value && daterange.value.length > 0) {
    startDate = daterange.value[0];
    endDate = daterange.value[1];
  }
  const params = {
    startDate: startDate,
    endDate: endDate,
  };
  emit('update:startDate', startDate);
  emit('update:endDate', endDate);
  emit('change', params);
};
</script>

<style scoped></style>
