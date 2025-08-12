<template>
  <basic-container>
    <h1>功能开发中</h1>
  </basic-container>
</template>
<script setup name="wiki-index">
import { onMounted } from 'vue';

const { proxy } = getCurrentInstance();

const data = reactive({
  loading: true,
});

const { loading } = toRefs(data);

onMounted(() => {
  initAllPage();
});

// 初始页面方法
const initAllPage = () => {
  // TODO 查询请求
};
</script>
