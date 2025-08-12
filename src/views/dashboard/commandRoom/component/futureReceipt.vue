<template>
  <Title title="未来2周收货" style="margin-top: 8px" />
  <div class="wrapper">
    <div class="top-wrapper">
      <div class="top-tj">
        <div class="title">未来2周收货总数</div>
        <div class="value">{{ statisticsData.totalNumber }}</div>
      </div>
      <div class="top-tj-right">
        <Dashboard
          :total="statisticsData.totalNumber"
          :value="statisticsData.standardNumber"
          id="standardParts"
          title="标件"
        />
        <Dashboard
          :total="statisticsData.totalNumber"
          :value="statisticsData.nonStandardNumber"
          id="noStandardParts"
          title="非标件"
          color="#CC7A33"
        />
      </div>
    </div>
    <div class="btm-wrapper">
      <template v-if="inited">
        <div class="legend-rows">
          <div v-for="(item, i) in columnarOptions.series" :key="i" class="item">
            {{ item.name
            }}<span class="legend-icon"
              ><i
                class="line"
                :style="{
                  background: item.lineStyle?.color,
                }"
              ></i
              ><i
                class="circle"
                :style="{
                  background: item.lineStyle?.color,
                }"
              ></i
            ></span>
          </div>
        </div>
        <dc-chat :options="columnarOptions"></dc-chat>
      </template>
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

let color1 = {
  color: {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: '#33CCCC' },
      { offset: 1, color: 'rgba(31,89,89,0.25)' },
    ],
    global: false, // 缺省为 false
  },
};

let color2 = {
  color: {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: '#CC7A33' },
      { offset: 1, color: 'rgba(89,53,22,0.25)' },
    ],
    global: false, // 缺省为 false
  },
};

const data = reactive({
  inited: false,
  columnarOptions: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      show: false,
      top: '8%',
      textStyle: {
        color: '#FFF',
      },
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '3%',
      top: '24%',
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
        name: '标准件',
        type: 'bar',
        itemStyle: color1,
        data: [100, 200],
      },
      {
        name: '非标件',
        type: 'bar',
        itemStyle: color2,
        data: [200, 300],
      },
      {
        name: '汇总',
        type: 'line',
        symbol: 'none',
        itemStyle: {
          color: '#23C69F',
        },
        data: [],
      },
    ],
  },
});

const { columnarOptions, inited } = toRefs(data);

const statisticsData = ref({
  nonStandardNumber: 0,
  standardNumber: 0,
  totalNumber: 0,
});
const getApi = async () => {
  const res = await Api.mps.assemblyboard.warehouseReceivePrepare();
  const { code, data } = res.data;
  if (code == 200) {
    statisticsData.value = {
      nonStandardNumber: data.nonStandardNumber,
      standardNumber: data.standardNumber,
      totalNumber: data.totalNumber,
    };
    // 日期
    columnarOptions.value.xAxis.data = (data?.map?.x || []).map(d => {
      return d.replace(/\d{4}\-/, '').replace('-', '/');
    });
    // 标准件
    columnarOptions.value.series[0].data = data?.map?.y?.standardList || [];
    // 非标件
    columnarOptions.value.series[1].data = data?.map?.y?.nonStandardList || [];
    // 汇总
    columnarOptions.value.series[2].data = data?.map?.y?.totalList || [];
  }
  inited.value = true;
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
  height: 299px;
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
      top: 8px;
      margin: auto;
      justify-content: center;
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
}
</style>
