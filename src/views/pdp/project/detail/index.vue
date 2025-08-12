<template>
  <div class="app-container">
    <div class="head-contaioner">
      <el-tabs v-model="activeTab" class="w-full" @tab-change="handleClick">
        <el-tab-pane
          :label="tab.label"
          :name="tab.name"
          v-for="(tab, index) in tabData"
          :key="index"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <div class="body-container">
      <overview v-if="activeTab === 'overview'" />
      <planTab v-if="activeTab === 'plan'" :mode="'project-list-detail'" />
      <caseTab v-if="activeTab === 'case'" />
    </div>
  </div>
</template>
<script setup name="ProjectDetail">
import { reactive, toRefs, onMounted, watch } from 'vue';
import overview from './components/overview.vue';
import planTab from './components/plan/index.vue';
import caseTab from './components/case.vue';

const route = useRoute();
const router = useRouter();

const pageData = reactive({
  activeTab: 'overview',
  tabData: [
    { label: '概况', name: 'overview' },
    { label: '项目计划', name: 'plan' },
    { label: '专案', name: 'case' },
    { label: '合同', name: '4' },
    { label: '预算', name: '5' },
    { label: '人力', name: '6' },
    { label: '收款', name: '7' },
    { label: '付款', name: '8' },
    { label: '费用', name: '9' },
    { label: '文档', name: '10' },
    { label: 'FAT', name: '11' },
    { label: '异常', name: '12' },
    { label: '统计', name: '13' },
  ],
});

const { activeTab, tabData } = toRefs(pageData);

watch(
  () => route.params.tab,
  newVal => {
    activeTab.value = newVal;
  }
);

onMounted(() => (activeTab.value = route.params.tab));

const handleClick = () => {
  router.push({ path: `/pdp/project/detail/${activeTab.value}/${route.params.projectId}` });
};
</script>
<style lang="scss" scoped>
.app-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: transparent;
  border-radius: 0;
  :deep(.el-tabs__header) {
    margin: 0;
  }
  .head-contaioner {
    flex-direction: column;
    justify-content: flex-end;
    margin-bottom: 8px;
    padding: 0 24px;
    background-color: #fff;
    height: 40px;
    border-radius: 5px;
  }
}
</style>
