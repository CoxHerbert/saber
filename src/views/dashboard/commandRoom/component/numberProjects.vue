<template>
  <Title title="专案数量（未来两周）" style="margin-top: 8px" />
  <div class="wrapper">
    <dc-chat :options="columnarOptions"></dc-chat>
  </div>
</template>
<script setup>
import { reactive, ref, toRefs } from 'vue';
import Api from '@/api/index';
import Title from '../component/title.vue';

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
    },
    grid: {
      left: '0%',
      top: '6%',
      right: '0%',
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
        type: 'bar',
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
        data: [],
      },
    ],
  },
});

const { columnarOptions } = toRefs(data);
const getApi = async () => {
  const res = await Api.mps.commandRoom.numberProjects();
  const { code, data } = res.data;
  if (code == 200) {
    columnarOptions.value.xAxis.data = ['10/1', '10/2'];
    columnarOptions.value.series[0].data = [122, 425];
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
  height: 221px;
  display: flex;
  flex-direction: column;
  padding: 9px 13px;
  box-sizing: border-box;
  background: rgba(59, 97, 157, 0.2);
}
</style>
