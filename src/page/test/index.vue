<template>
  <!-- 测试专用页面 仅localhost模式加载 -->
  <div class="page-test">
    <div class="left">
      <el-menu class="el-menu-vertical-demo">
        <el-menu-item v-for="(m, i) in demoList" :index="m.value" @click="handleMenuClick(m)">{{
          m.label
        }}</el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <el-button @click="jump">jump测试</el-button>
      <component v-if="AsyncComponent === 'steps-demo'" :is="stepsDemo" />
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import stepsDemo from './cpns/steps.vue';

const router = useRouter();

const jump = () => {
  router.push({
    path: '/jump/L3BkcC9leGVjdXRpb24vZWRpdD9saXN0PW9wZXJhdGlvbiZpZD0xOTIyODk2MTg3OTE3MjA1NTA1JnBhcmVudE1lbnVJZD0xOTEzMTQzNjI0NzM3NzM0NjU4',
  });
};

const demoList = ref([
  {
    label: '审核步骤条',
    value: 'steps-demo',
  },
  {
    label: '搜索栏目',
    value: 'searchDemo',
  },
]);

const AsyncComponent = ref(null);

const handleMenuClick = item => {
  AsyncComponent.value = item.value;
};
</script>
<style lang="scss">
.page-test {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  .left {
    height: 100%;
    width: 200px;
  }
  .right {
    flex: 1;
    height: 100%;
    display: block;
  }
}
</style>
