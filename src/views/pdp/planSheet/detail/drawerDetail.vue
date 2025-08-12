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
      <manpowerStatistics v-if="activeTab === 'manpowerStatistics'" :id="props.id" />
      <detail v-if="activeTab === 'detail'" :id="props.id" />
      <stagePlan v-if="activeTab === 'stagePlan'" :id="props.id" />
      <onSiteReporting v-if="activeTab === 'onSiteReporting'" :id="props.id" />
      <siteReport v-if="activeTab === 'siteReport'" :id="props.id" />
      <!-- <plan v-if="activeTab === 'planInfo'" :id="props.id" /> -->
      <!-- <planGantt v-if="activeTab === 'planGantt'" :id="props.id" /> -->
    </div>
  </div>
</template>
<script setup name="ProjectDetail">
import { reactive, toRefs, onMounted } from 'vue';
import detail from './components/detail.vue';
import stagePlan from './components/stagePlan.vue';
import onSiteReporting from './components/onSiteReporting.vue';
import siteReport from './components/siteReport.vue';
// import plan from './components/plan/index.vue';
import manpowerStatistics from './components/manpowerStatistics.vue';
// import planGantt from './components/planGantt.vue';

const props = defineProps({
  tab: {
    type: String,
    default() {
      return 'manpowerStatistics';
    },
  },
  id: {
    type: String,
    default() {
      return '';
    },
  },
});

// const route = useRoute();
// const router = useRouter();

const pageData = reactive({
  activeTab: 'detail',
  tabData: [
    // { label: '概况', name: 'detail' },
    // { label: '计划阶段', name: 'stagePlan' },
    // { label: '现场报工', name: 'onSiteReporting' },
    // { label: '入驻人员', name: 'siteReport' },
    // // { label: '阶段任务', name: 'planInfo' },
    // // { label: '现场计划', name: 'planGantt' },
    {
      label: '基本信息',
      name: 'detail',
    },
    {
      label: '人力统计',
      name: 'manpowerStatistics',
    },
    {
      label: '人员明细',
      name: 'siteReport',
    },
    {
      label: '报工记录',
      name: 'onSiteReporting',
    },
    {
      label: '计划阶段',
      name: 'stagePlan',
    },
  ],
});

const { activeTab, tabData } = toRefs(pageData);

onMounted(() => {
  activeTab.value = props.tab;
});

const handleClick = () => {
  console.log('tab clicked');
  //   router.push({ path: `/pdp/planSheet/detail/${activeTab.value}/${route.params.id}` });
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
  margin-top: -20px;
  :deep(.el-tabs__header) {
    margin: 0;
  }
  .head-contaioner {
    flex-direction: column;
    justify-content: flex-end;
    margin-bottom: 16px;
    padding: 0 24px;
    background-color: #fff;
    height: 60px;
    border-radius: 8px;
  }
}
</style>
