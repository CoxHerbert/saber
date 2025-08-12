<template>
  <div class="comp-process-efficiency" v-loading="loading">
    <div class="title">
      处理效率
      <el-radio-group v-model="radio" size="small" @change="getData()">
        <el-radio-button label="近7天" value="week" />
        <el-radio-button label="近30天" value="month" />
        <el-radio-button label="本年度" value="year" />
      </el-radio-group>
    </div>
    <div class="comp-content">
      <div class="statistical-group">
        <div class="statistical-item">
          <div class="statistical-item-name">总数</div>
          <div class="statistical-item-count">{{ infoData.total || 0 }}</div>
        </div>
        <div class="statistical-item">
          <div class="statistical-item-name">日均数</div>
          <div class="statistical-item-count">{{ (infoData.dayAverage || 0).toFixed(2) || 0 }}</div>
        </div>
        <div class="statistical-item">
          <div class="statistical-item-name">逾期数</div>
          <div class="statistical-item-count">{{ infoData.overdue || 0 }}</div>
        </div>
        <div class="statistical-item">
          <div class="statistical-item-name">按时完成率</div>
          <div class="statistical-item-count blue">{{ infoData.onTimeCompletionRate || 0 }}%</div>
        </div>
      </div>
      <dc-chat :options="option" />
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import Api from '@/api/';
import dayjs from 'dayjs';

const option = ref({
  tooltip: {
    trigger: 'axis',
    formatter: params => {
      const item = params[0];
      return `${item.name}<br />${item.seriesName}: ${item.value}%`;
    },
  },
  legend: {
    data: ['按时完成率'],
    right: 0,
    formatter: name => {
      return `{a|${name}}`;
    },
    textStyle: {
      rich: {
        a: {
          width: 100, // 控制文字区域宽度
          align: 'left',
        },
      },
    },
  },
  grid: {
    left: '6%',
    right: '4%',
    top: '12%',
    bottom: '10%',
  },
  xAxis: {
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#ccc',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#666',
    },
    data: [],
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: '#e5e5e5',
        width: 1,
      },
    },
    axisLabel: {
      formatter: '{value}%',
    },
  },
  series: [
    {
      name: '按时完成率',
      type: 'line',
      symbol: 'none',
      symbolSize: 8,
      data: [],
      lineStyle: {
        color: '#F29346',
        width: 3,
        shadowBlur: 4, // 阴影模糊半径
        shadowOffsetY: 6,
        shadowColor: 'rgb(242, 147, 70, 0.4)', // 阴
      },
      itemStyle: {
        color: '#F29346',
      },
    },
  ],
});

const compData = reactive({
  loading: false,
  radio: 'week',
  infoData: {},
  dateFormatEnum: {
    week: 'YYYY-MM-DD',
    month: 'YYYY-MM-DD',
    year: 'YYYY-MM',
  },
});
const { loading, radio, infoData, dateFormatEnum } = toRefs(compData);

onMounted(() => {
  getData();
});

const getData = () => {
  loading.value = true;
  Api.desk.home
    .getScheduleEfficiency({
      type: radio.value,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        infoData.value = data;
        option.value.xAxis.data = Object.keys(infoData.value.scheduleMap).map(key =>
          dayjs(key).format(dateFormatEnum.value[radio.value])
        );
        option.value.series[0].data = Object.keys(infoData.value.scheduleMap).map(
          key => infoData.value.scheduleMap[key]
        );
      }
      loading.value = false;
    })
    .catch(err => {
      loading.value = false;
    });
};
</script>
<style lang="scss" scoped>
.comp-process-efficiency {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  height: 410px;

  .title {
    padding: 9px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    font-style: normal;
    text-transform: none;
    margin-bottom: 8px;
  }
  .comp-content {
    padding: 0 16px 28px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    .statistical-group {
      margin-bottom: 10px;
      padding: 18px 0;
      display: flex;
      width: 100%;
      background: #f5f5f5;
      border-radius: 4px;
      .statistical-item {
        display: flex;
        flex-direction: column;
        position: relative;
        padding-left: 32px;
        flex: 1;
        justify-content: flex-start;
        &-name {
          font-weight: 400;
          font-size: 16px;
          color: #666666;
          line-height: 16px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
        &-count {
          margin-top: 4px;
          font-weight: bold;
          font-size: 24px;
          color: #333333;
          line-height: 24px;
          text-align: left;
          font-style: normal;
          text-transform: none;
          &.blue {
            font-weight: bold;
            font-size: 24px;
            color: #1d65f3;
            line-height: 24px;
            text-align: left;
            font-style: normal;
            text-transform: none;
          }
        }
        &:last-child {
          &.statistical-item::before {
            display: none;
          }
        }
        &::before {
          position: absolute;
          right: 0;
          top: 50%;
          margin-top: -16px;
          display: block;
          content: '';
          width: 1px;
          height: 32px;
          background-color: #dadbe0;
        }
      }
    }
  }

  :deep(.el-radio-group) {
    height: 30px;
    text-align: center;
    padding: 0;
    line-height: 30px;
    .el-radio-button__inner {
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .is-active .el-radio-button__inner {
      background-color: unset;
      color: var(--el-radio-button-checked-bg-color);
    }
  }
}
</style>
