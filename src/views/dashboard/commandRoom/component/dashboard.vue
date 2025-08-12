<template>
  <div class="chart-wrapper">
    <div :id="id" class="echarts"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { onUnmounted, nextTick, watch, ref } from 'vue';
const emit = defineEmits(['clickPersonNum']);

const props = defineProps({
  value: {
    type: Number,
    default: () => 0,
  },
  total: {
    type: Number,
    default: () => 0,
  },
  id: {
    type: String,
    default: () => 'circular',
  },
  title: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#33CCCC',
  },
});

let myChart = null;

watch(
  () => props.value,
  (newVal, oldVal) => {
    nextTick(() => {
      getApi();
    });
  },
  { immediate: true }
);

const getApi = () => {
  if (myChart == null) {
    myChart = echarts.init(document.getElementById(props.id));
  }
  var val = props.value;
  var value = props.total <= 0 ? 0 : val / props.total;
  var startAngle = 225;
  var endAngle = -45;
  var splitCount = 30; // 刻度数量
  var pointerAngle = (startAngle - endAngle) * (1 - value) + endAngle;
  myChart.setOption({
    title: [
      {
        text: props.title,
        x: 'center',
        top: '60%',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '400',
        },
      },
      {
        text: `${val}`,
        x: 'center',
        top: '26%',
        textStyle: {
          fontSize: '24',
          color: '#FFFFFF',
          fontFamily: 'DINAlternate-Bold, DINAlternate',
          fontWeight: '400',
        },
      },
    ],

    series: [
      {
        center: ['50%', '55%'],
        type: 'gauge',
        radius: '130%',
        startAngle: pointerAngle,
        endAngle: endAngle,
        splitNumber: 1,
        axisLine: {
          show: false,
          lineStyle: {
            width: 3,
            opacity: 0,
          },
        },
        title: { show: false },
        detail: {
          show: false,
        },
        splitLine: { show: false },
        axisTick: {
          length: 8,
          splitNumber: Math.ceil((1 - value) * splitCount),
          lineStyle: {
            color: '#D9D9D9',
            width: 3,
          },
        },
        axisLabel: { show: false },
        pointer: { show: false },
        data: [
          {
            value: value,
            name: 'test gauge',
          },
        ],
      },
      {
        center: ['50%', '55%'],
        type: 'gauge',
        radius: '130%',
        startAngle: startAngle,
        endAngle: pointerAngle,
        splitNumber: 1,
        axisLine: {
          show: false,
          lineStyle: {
            width: 3,
            opacity: 0,
          },
        },
        title: { show: false },
        detail: { show: false },
        splitLine: { show: false },
        axisTick: {
          length: 8,
          splitNumber: Math.ceil(value * splitCount),
          lineStyle: {
            color: props.color,
            width: 3,
          },
        },
        axisLabel: { show: false },
        pointer: { show: false },
        data: [value],
      },
    ],
  });
  myChart.resize();
  // 监听窗口大小变化事件
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

onUnmounted(() => {
  myChart = null;
});
</script>

<style lang="scss" scoped>
.chart-wrapper {
  width: calc((100% - 120px) / 2);
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  .echarts {
    width: 100%;
    height: 100%;
  }
  .chart-title {
    position: absolute;
    text-align: center;
    color: #fff;
    left: 0%;
    right: 0px;
    top: 38%;
    margin: auto;
    cursor: pointer;

    .h1 {
      font-size: 18px;
    }
    .h2 {
      font-weight: bold;
      font-size: 22px;
    }
  }
}
</style>
