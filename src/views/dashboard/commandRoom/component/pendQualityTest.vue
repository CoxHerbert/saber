<template>
  <Title title="未来2周待检验（QMS）" style="margin-top: 8px" />
  <div class="wrapper">
    <dc-chat
      v-if="columnarOptions.xAxis.data && columnarOptions.xAxis.data.length > 0"
      :options="columnarOptions"
    ></dc-chat>
    <dcEmpty v-else />
  </div>
</template>
<script setup>
import { reactive, ref, toRefs } from 'vue';
import Api from '@/api/index';
import Title from '../component/title.vue';
import dcEmpty from './dc-empty.vue';

const data = reactive({
  columnarOptions: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      show: false,
      fontSize: '8px',
      textStyle: {
        color: '#fff',
        fontSize: '10px',
      },
      // itemWidth: 10, // 设置图例图标的宽度
    },
    grid: {
      left: '0%',
      top: '10%',
      right: '4%',
      bottom: '0%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      axisTick: {
        show: false,
      },
      data: [],
      boundaryGap: [0, 0.01],
      splitLine: {
        show: false,
        lineStyle: {
          type: 'dashed',
          color: '#666',
        },
      },
      axisLabel: {
        color: '#EAF0FF', // Y轴标签颜色设置为洋红色
        lineStyle: {
          type: 'dashed', // 设置虚线
          color: '#666',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#666',
        },
      },
      axisLabel: {
        color: '#EAF0FF', // Y轴标签颜色设置为洋红色
        lineStyle: {
          type: 'dashed', // 设置虚线
          color: '#000',
        },
      },
    },
    series: [
      {
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        symbol: 'none',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0.25, color: '#FFC353' },
              { offset: 1, color: 'rgba(255, 195, 83, 0.25)' },
            ],
            global: false, // 缺省为 false
          },
        },

        data: [12, 45, 112, 25, 122, 425],
      },
    ],
  },
});

const { columnarOptions } = toRefs(data);
const getApi = async () => {
  const res = await Api.mps.commandRoom.pendQualityTest();
  const { code, data } = res.data;
  if (code == 200) {
    columnarOptions.value.xAxis.data = (data.x || []).map(d => {
      return d.replace(/\d{4}\-/g, '').replace('-', '/');
    }); // ['10/1', '10/2', '10/2', '10/2', '10/2', '10/2'];
    columnarOptions.value.series[0].data = data.y.totalList || []; // [12, 45, 112, 25, 122, 425];
  }
};

defineExpose({
  getApi,
});
</script>

<style lang="scss" scoped>
.wrapper {
  color: #fff;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  z-index: 99;
  height: 451px;
  display: flex;
  flex-direction: column;
  padding: 9px 13px;
  box-sizing: border-box;
  background: rgba(59, 97, 157, 0.2);
}
</style>
