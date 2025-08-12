<template>
  <div ref="chart" :style="{ width: '100%', height: '100%' }"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const chart = ref(null);
let chartInstance = null;

const initChart = () => {
  if (chart.value) {
    chartInstance = echarts.init(chart.value);
    chartInstance.setOption(props.options);
  }
};

watch(
  () => props.options,
  newOptions => {
    if (chartInstance) {
      chartInstance.setOption(newOptions);
    }
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', chartInstance.resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', chartInstance.resize);
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>
