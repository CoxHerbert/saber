<template>
  <Title :title="title" style="margin-top: 8px" type="sort" />
  <div class="wrapper">
    <template v-if="columnarOptions.series?.length > 0">
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
    <dcEmpty v-else></dcEmpty>
  </div>
</template>
<script setup>
import { reactive, ref, toRefs } from 'vue';
import Api from '@/api/index';
import Title from '../component/title.vue';
import dcEmpty from './dc-empty.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default() {
      return 'test';
    },
    validator(value) {
      return ['test', 'qms'].includes(value);
    },
  },
});

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
      // fontSize: '8px',
      // textStyle: {
      //   color: '#fff',
      //   fontSize: '10px',
      // },
      // itemWidth: 10, // 设置图例图标的宽度
    },
    grid: {
      left: '0%',
      top: '20%',
      right: '5%',
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
          color: 'rgb(204, 204, 204, 0.6)',
        },
      },
      axisLabel: {
        fontSize: '12px',
        color: '#EAF0FF', // Y轴标签颜色设置为洋红色
        interval: 2,
        lineStyle: {
          type: 'dashed', // 设置虚线
          color: '#ccc',
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
          color: 'rgb(204, 204, 204, 0.6)',
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
  const res = await Api.mps.commandRoom.averageTime(props.mode);
  const { code, data } = res.data;
  if (code == 200) {
    columnarOptions.value.xAxis.data = (data.x || []).map(d => {
      d = d
        .replace(/\d{4}-/g, '')
        .replace(/\ (.*)+/g, '')
        .replace('-', '/');
      return d;
    });
    if (props.mode == 'test') {
      columnarOptions.value.series = [
        {
          name: '平均每单每个耗时',
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: '#1D65F3',
          },
          data: data.y.averageList || [], // [12, 25, 56],
          smooth: true,
        },
        {
          name: '平均整单耗时',
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: '#23C69F',
          },
          data: data.y.totalList || [], // [122, 425, 34],
          smooth: true,
        },
      ];
    } else if (props.title.includes('QMS')) {
      columnarOptions.value.series = [
        {
          name: '平均耗时',
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: '#1D65F3',
          },
          data: data.y.totalList || [], // [12, 25, 56],
          smooth: true,
        },
      ];
    }
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
  display: flex;
  z-index: 99;
  height: 180px;
  display: flex;
  flex-direction: column;
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
</style>
