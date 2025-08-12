<template>
  <div class="chart-wrapper">
    <div :id="props.chartName" class="echarts" ref="faultTrendChartRef" @click="openInfo"></div>
    <div class="chart-title" @click="openInfo">
      <p class="h1">{{ props.data.name }}</p>
      <p class="h2">{{ props.data.value }}</p>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { onUnmounted, nextTick, watch, ref } from 'vue';
const emit = defineEmits(['clickPersonNum']);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  chartName: {
    type: String,
    default: null,
  },
});

let myChart = null;

const colors = ref([
  '#33FFF6', // 青色
  '#ABBFE5', // 浅蓝色
  '#6EDB8B', // 鲜绿色
  '#F6A833', // 橙色
  '#FF5733', // 橙红色
  '#3357FF', // 蓝色
  '#F3FF33', // 黄色
  '#FF33F6', // 粉红色
  '#F63333', // 红色
  '#33F6FF', // 浅蓝色
  '#F6F333', // 浅黄色
  '#F633FF', // 紫罗兰
  '#33F633', // 绿色
  '#F633A8', // 深粉红色
  '#A833F6', // 深紫色
]);

const dataList = ref([]);

watch(
  () => props.data,
  (newVal, oldVal) => {
    dataList.value = props.data.list.map((item, index) => ({
      ...item,
      itemStyle: {
        color: colors.value[index] || '#000', // 默认颜色为黑色
      },
    }));

    if (newVal != oldVal) {
      nextTick(() => {
        getApi();
      });
    }
  },
  { immediate: true }
);

const openInfo = () => {
  emit('clickPersonNum', {
    list: dataList.value,
    name: props.data.name,
  });
};

const getApi = () => {
  if (myChart == null) {
    myChart = echarts.init(document.getElementById(props.chartName));
  }

  myChart.setOption({
    // color: colors.value,
    legend: {
      show: false,
      orient: 'horizontal',
      bottom: '40px',
      left: '6px',
      top: '68%',
      align: 'left',
      itemWidth: 10, // 设置图标的宽度
      itemHeight: 10, // 设置图标的高度
      icon: 'rect',
      itemGap: 15,
      textStyle: {
        fontFamily: 'PingFangSC-Regular',
        color: '#fff',
        fontSize: '12px',
      },
      formatter: function (name) {
        const seriesItem = dataList.value.find(item => item.name === name);
        let text = '';
        if (seriesItem) {
          text = `${name}  ${seriesItem.value || 0}`;
        }
        return text;
      },
      rich: {
        right: {
          align: 'right',
        },
      },
    },
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },

    series: [
      {
        type: 'pie',
        radius: ['50%', '60%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: false,
        },
        data: dataList.value,
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
  width: 100%;
  height: calc(100%);
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
