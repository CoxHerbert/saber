<template>
  <el-select
    v-bind="$attrs || {}"
    :modelValue="modelValue"
    filterable
    remote
    clearable
    :remote-method="remoteSearch"
    :loading="selectLoading"
    placeholder="输入姓名关键词搜索"
    @change="handleChange"
  >
    <el-option
      v-for="item in chekListOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      >{{ item.label }}[{{ item.account }}]</el-option
    >
  </el-select>
</template>

<script setup>
import { defineEmits, defineProps, onMounted } from 'vue';
import { getUserList } from '@/api/user';

const props = defineProps({
  modelValue: {
    type: String,
    default() {
      return '';
    },
  },
});

const emit = defineEmits(['update:modelValue']);

const selectLoading = ref(false);
const chekListOptions = ref([]);
// 远程搜索方法
const remoteSearch = async query => {
  if (!query.trim()) return;

  selectLoading.value = true;
  try {
    // 替换为实际API调用
    const res = await getUserList({ name: query });
    if (res.data.code === 200) {
      chekListOptions.value = res.data?.data?.records.map(item => ({
        value: item.realName,
        label: item.realName,
        account: item.account,
      }));
    }
    selectLoading.value = false;
  } finally {
    selectLoading.value = false;
  }
};

const handleChange = val => {
  emit('update:modelValue', val);
};
onMounted(() => {
  if (props.modelValue) {
    remoteSearch(props.modelValue);
  }
});
</script>
