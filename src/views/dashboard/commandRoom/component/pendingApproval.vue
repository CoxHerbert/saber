<template>
  <Title title="待审核" style="margin-top: 8px" />
  <div class="wrapper">
    <div class="top-wrapper">
      <div class="top-tj">
        <div class="title">待审核总数</div>
        <div class="value">{{ statisticsData.totalNumber }}</div>
      </div>
      <div class="top-tj-right">
        <Dashboard
          :total="statisticsData.totalNumber"
          :value="statisticsData.toPrepareNumber"
          id="Dashboard"
          title="待备料"
        />
        <Dashboard
          :total="statisticsData.totalNumber"
          :value="statisticsData.preparedNumber"
          id="pendPick"
          title="待领料"
          color="#CC7A33"
        />
      </div>
    </div>
    <div class="btm-wrapper">
      <div v-if="columnarOptions?.series?.[0]?.data?.length > 0" class="legend-rows">
        <div v-for="(item, i) in legend" :key="i" class="item">
          {{ item.name }}<span class="legend-icon" :style="item.itemStyle"></span>
        </div>
      </div>
      <dc-chat
        v-if="columnarOptions?.series?.[0]?.data?.length > 0"
        :options="columnarOptions"
      ></dc-chat>
      <DcEmpty v-else />
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, toRefs } from 'vue';
import Api from '@/api/index';
import Title from '../component/title.vue';
import Dashboard from './dashboard.vue';
import DcEmpty from './dc-empty.vue';

const getBarData = (barType, bindData) => {
  const barTypeMap = [
    {
      value: 0,
      dataType: '其他出库',
      itemStyle: {
        color: {
          type: 'linear',
          x: 1,
          y: 0,
          x2: 0,
          y2: 0,
          colorStops: [
            { offset: 0.25, color: 'rgba(255, 195, 83, 1)' },
            { offset: 1, color: 'rgba(255, 195, 83, 0.25)' },
          ],
          global: false, // 缺省为 false
        },
      },
    },
    {
      value: 0,
      dataType: '委外领料',
      itemStyle: {
        color: {
          type: 'linear',
          x: 1,
          y: 0,
          x2: 0,
          y2: 0,
          colorStops: [
            { offset: 0.25, color: 'rgba(51, 130, 204, 1)' },
            { offset: 1, color: 'rgba(51, 130, 204, 0.25)' },
          ],
          global: false, // 缺省为 false
        },
      },
    },
    {
      value: 0,
      dataType: '生产领料',
      itemStyle: {
        color: {
          type: 'linear',
          x: 1,
          y: 0,
          x2: 0,
          y2: 0,
          colorStops: [
            { offset: 0.25, color: 'rgba(51, 204, 204, 1)' },
            { offset: 1, color: 'rgba(31, 89, 89, 0.25)' },
          ],
          global: false, // 缺省为 false
        },
      },
    },
    {
      value: 0,
      dataType: '其他',
      itemStyle: {
        color: {
          type: 'linear',
          x: 1,
          y: 0,
          x2: 0,
          y2: 0,
          colorStops: [
            { offset: 0.25, color: '#33CCCC ' },
            { offset: 1, color: 'rgba(31, 89, 89, 0.25)' },
          ],
          global: false, // 缺省为 false
        },
      },
    },
  ];

  const findType = barTypeMap.find(item => item.dataType === barType);
  if (findType) {
    return {
      ...findType,
      value: bindData,
    };
  }
  return {
    ...barTypeMap[3],
    value: bindData,
  };
};

const data = reactive({
  legend: [],
  columnarOptions: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        return `
        ${params
          .map(item => {
            return `<b>${item.axisValueLabel}</b><br/> <b>${item.data.dataType}</b><br/> ${item.marker} 数量:  ${item.value}`;
          })
          .join('<br/>')}
      `;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: '0%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
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
          color: '#666',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: [], // ['生产领料', '委外领料', '其他出库'],
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#EAF0FF', // Y轴标签颜色设置为洋红色
        lineStyle: {
          type: 'dashed', // 设置虚线
          color: '#666',
        },
      },
    },
    series: [
      {
        type: 'bar',
        data: [],
      },
    ],
  },
});

const { columnarOptions, legend } = toRefs(data);

const statisticsData = ref({
  // 待审核总数
  totalNumber: 0,
  // 待备料
  toPrepareNumber: 0,
  // 待领料
  preparedNumber: 0,
});
const getApi = async () => {
  const res = await Api.mps.commandRoom.pendingApproval();
  const { code, data } = res.data;
  if (code == 200) {
    columnarOptions.value.yAxis.data = data.map?.x || [];
    columnarOptions.value.series[0].data = (data.map?.y || []).map(item =>
      getBarData(item.label, item.value)
    );
    const legendData = {};
    columnarOptions.value.series[0].data.forEach(d => {
      legendData[d.dataType] = {
        name: d.dataType,
        itemStyle: {
          background: `linear-gradient(180deg, ${d.itemStyle?.color?.colorStops?.[0]?.color} 0%, ${d.itemStyle?.color?.colorStops?.[1]?.color} 100%)`,
        },
      };
    });
    legend.value = Object.values(legendData);
    statisticsData.value = {
      totalNumber: data.totalNumber || 0,
      toPrepareNumber: data.toPrepareNumber || 0,
      preparedNumber: data.preparedNumber || 0,
    };
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
  height: 319px;
  display: flex;
  flex-direction: column;
  padding: 9px 13px;
  box-sizing: border-box;
  background: rgba(59, 97, 157, 0.2);
  .top-wrapper {
    width: 100%;
    display: flex;
    .top-tj {
      width: 182px;
      height: 96px;
      background-image: url('../img/group.png');
      background-size: 100% 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding-left: 38px;
      box-sizing: border-box;
      .title {
        font-size: 14px;
        color: #eaf0ff;
      }
      .value {
        font-size: 36px;
        color: #fff;
        font-family: D-DIN, D-DIN;
      }
    }
    .top-tj-right {
      flex: 1;
      flex-direction: row;
      padding: 0px 12px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-evenly;
    }
  }
  .btm-wrapper {
    flex: 1;
    width: 100%;
    position: relative;
    .legend-rows {
      display: flex;
      align-items: center;
      position: absolute;
      left: 0px;
      right: 0px;
      top: 13%;
      margin: auto;
      justify-content: center;
      .item {
        margin: 0px 20px;
        font-size: 10px;
        color: #eaf0ff;
        position: relative;

        & + .item {
          margin-left: 10px;
        }

        .legend-icon {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-left: 4px;
          transform: translateY(1px);
        }
      }
    }
  }
}
</style>
