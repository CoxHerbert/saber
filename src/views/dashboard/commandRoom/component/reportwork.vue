<template>
  <Title title="各组报工工时（周）" style="margin-top: 8px" type="sort" />
  <div class="wrapper">
    <template v-if="columnarOptions.series?.length > 0">
      <div class="legend-rows">
        <div v-for="(item, i) in columnarOptions.series" :key="i" class="item">
          {{ item.name
          }}<span class="legend-icon"
            ><i
              class="line"
              :style="{
                background: item.itemStyle.color,
              }"
            ></i
            ><i
              class="circle"
              :style="{
                background: item.itemStyle.color,
              }"
            ></i
          ></span>
        </div>
      </div>
      <dc-chat :options="columnarOptions"></dc-chat>
    </template>
    <DcEmpty v-else />
  </div>
</template>
<script setup>
import { reactive, ref, toRefs } from 'vue';
import Api from '@/api/index';
import Title from '../component/title.vue';
import DcEmpty from './dc-empty.vue';

const colors = [
  '#F29346',
  '#1D65F3',
  '#23C69F',
  '#913DF8',
  '#86DE2E',
  '#749f83',
  '#ca8622',
  '#bda29a',
  '#6e7074',
  '#546570',
  '#c4ccd3',
];

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
      top: '68px',
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
      name: '工时（h）',
      nameTextStyle: {
        fontSize: '10px',
        color: '#EAF0FF',
      },
      type: 'value',
      axisTick: {
        show: false,
      },
      splitNumber: 3,
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
    series: [],
  },
});

const { columnarOptions } = toRefs(data);
const getApi = async () => {
  const res = await Api.mps.commandRoom.reportwork();
  const { code, data } = res.data;
  if (code == 200) {
    columnarOptions.value.xAxis.data = (data.x || []).map(d =>
      d.replace(/\d{4}\-/g, '').replace('-', '/')
    );
    columnarOptions.value.series = (data.y || []).map((item, index) => {
      return {
        type: 'line',
        name: item.label,
        symbol: 'none',
        itemStyle: {
          color: colors[index % 10],
        },
        data: item.value,
      };
    });
  }
};

defineExpose({
  getApi,
});
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  color: #fff;
  width: 100%;
  box-sizing: border-box;
  z-index: 99;
  height: 174px;
  display: flex;
  padding: 9px 13px;
  box-sizing: border-box;
  background: rgba(59, 97, 157, 0.2);

  .legend-rows {
    display: flex;
    align-items: center;
    position: absolute;
    left: 0px;
    right: 0px;
    top: 8px;
    margin: auto;
    justify-content: flex-start;
    flex-flow: row wrap;
    .item {
      margin: 0px 20px;
      font-size: 10px;
      color: #eaf0ff;
      position: relative;
      white-space: nowrap;

      &:nth-child(3n + 2),
      &:nth-child(3n + 1) {
        margin-right: 10px;
      }

      .legend-icon {
        display: inline-block;
        position: relative;
        width: 15px;
        height: 10px;
        margin-left: 4px;
        transform: translateY(1px);

        .line {
          height: 1px;
          width: 100%;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        .circle {
          height: 5px;
          width: 5px;
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
}
</style>
