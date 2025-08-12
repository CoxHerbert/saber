<template>
  <Title title="生产组预测人力/实际人力比（未来两周）" style="margin-top: 8px" />
  <div class="wrapper">
    <dc-chat v-if="columnarOptions.xAxis.data?.length > 0" :options="columnarOptions"></dc-chat>
    <DcEmpty v-else />
  </div>
</template>
<script setup>
import { reactive, ref, toRefs } from 'vue';
import Api from '@/api/index';
import Title from '../component/title.vue';
import DcEmpty from './dc-empty.vue';

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
      data: [], // ['10/01', '10/02'],
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
      splitNumber: 4,
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
        name: '预测人力与实际人力比',
        type: 'line',
        symbol: 'none',
        itemStyle: {
          color: 'rgba(255, 217, 118, 1)',
        },

        data: [],
      },
      // {
      //   name: '预测人力',
      //   type: 'line',
      //   itemStyle: {
      //     color: 'rgba(255, 217, 118, 0.30)', // 设置线的颜色为红色
      //     boxShadow: '0px 5 3px 0px rgba(255,217,118,0.3)',
      //   },
      //   data: [],
      // },
    ],
  },
});

const { columnarOptions } = toRefs(data);

const getApi = async () => {
  const res = await Api.mps.commandRoom.predictingManpower();
  const { code, data } = res.data;
  if (code == 200) {
    columnarOptions.value.xAxis.data = (data.x || []).map(d => {
      return d.replace('-', '/');
    }); // ['10/01', '10/02'];
    columnarOptions.value.series[0].data = data.value || []; // [12, 425];
    // columnarOptions.value.series[1].data = [122, 225];
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
  height: 190px;
  display: flex;
  flex-direction: column;
  padding: 9px 13px;
  box-sizing: border-box;
  background: rgba(59, 97, 157, 0.2);
}
</style>
