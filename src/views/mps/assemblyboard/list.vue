<template>
  <div class="app-container">
    <div class="statistics-container">
      <div class="statistics-wrap">
        <div class="statistics-title">在制产品数量</div>
        <div class="statistics-content">
          <dc-chat :options="rateOptions" />
        </div>
      </div>
      <div class="statistics-wrap">
        <div class="statistics-title">OTD</div>
        <div class="statistics-content">
          <div class="statistics-value">{{ statistics.otd }}%</div>
          <div class="statistics-rate">
            <span> 周同比 </span>
            <span class="rate-value">
              <el-icon class="bottom-icon" v-if="statistics?.otdRate < 0"><Bottom /></el-icon>
              <el-icon class="top-icon" v-else><Top /></el-icon>
              {{ statistics?.otdRateAbs }}%
            </span>
          </div>
        </div>
      </div>
      <div class="statistics-wrap">
        <div class="statistics-title">在制专案数量</div>
        <div class="statistics-content">
          <div class="statistics-value">
            {{ statistics.mtoCount }}
            <span class="statistics-value-unit">个</span>
          </div>
        </div>
      </div>
      <div class="statistics-wrap">
        <div class="statistics-title">周投产工时</div>
        <div class="statistics-content">
          <div class="statistics-value">
            {{ statistics.weekHour }}
            <span class="statistics-value-unit">h</span>
          </div>
        </div>
      </div>
      <div class="statistics-wrap">
        <div class="statistics-title">组装人力总数</div>
        <div class="statistics-content">
          <div class="statistics-value">
            {{ statistics.weekPeople }}
            <span class="statistics-value-unit">人</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="card">
        <div class="card-header">在制专案明细</div>
        <div class="card-content">
          <dc-seamless-scroll :columns="making.columns" :tableData="making.tableData" />
        </div>
      </div>
      <div class="card">
        <div class="card-header">生产组 预测人力/实际人力比（未来两周）</div>
        <div class="card-content">
          <dc-chat :options="resourcesOption" />
        </div>
      </div>
    </div>

    <div class="row">
      <div class="card">
        <div class="card-header">延期专案</div>
        <div class="card-content">
          <dc-seamless-scroll :columns="extension.columns" :tableData="extension.tableData" />
        </div>
      </div>
      <div class="right">
        <div class="card chart-pie">
          <div class="card-header">各组品质制程不良情况（周）</div>
          <div class="card-content">
            <div class="chat-box-process">
              <dc-chat :options="processOption" />
            </div>
            <div class="item-content" v-for="(item, index) in processList" :key="index">
              <div class="item-content-label">{{ item.name }}</div>
              <div class="item-content-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">报工工时(周)</div>
          <div class="card-content">
            <dc-chat :options="hoursOption" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import Api from '@/api/index';

export default {
  name: 'assemblyboard',
  data() {
    return {
      rateOptions: {
        tooltip: { trigger: 'item' },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: '10%',
          top: 'center',
          itemGap: 30,
          selectedMode: false,
          data: [],
          textStyle: {
            color: '#77899c',
            rich: { uname: { width: 50 }, unum: { width: 40, align: 'right' } },
          },
          formatter: name => {
            let item;
            this.rateOptions.series.forEach(serie => {
              item = serie.data.find(d => d.name === name);
            });
            const value = item ? item.value : '';
            return `{uname|${name}}{unum|${value}}`;
          },
        },
        color: ['#F78431', '#1D65F3'],
        series: [
          {
            type: 'pie',
            radius: ['75%', '90%'],
            center: ['18%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: params => `{a|${params.value}}`,
              rich: { a: { color: '#333', fontSize: 20, lineHeight: 30 } },
            },
            labelLine: { show: false },
            data: [],
          },
        ],
      },
      materialsOption: {
        grid: { top: '10%', left: '6%', right: '3%', bottom: '10%' },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => {
            const data = params[0];
            return `<div><div>日期: ${data.name}</div><br /><div>数量: ${data.value}</div></div>`;
          },
          backgroundColor: '#fff',
          borderColor: '#ccc',
          borderWidth: 1,
          textStyle: { color: '#333' },
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { show: true, lineStyle: { color: '#ccc', width: 1 } },
          axisTick: { show: false },
          axisLabel: { color: '#666', fontSize: 10 },
          boundaryGap: true,
        },
        yAxis: {
          type: 'value',
          interval: 100,
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        series: [
          {
            data: [],
            type: 'bar',
            barWidth: 16,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#F29346' },
                  { offset: 1, color: '#FFDFAF' },
                ]),
              },
            },
          },
        ],
      },
      resourcesOption: {
        grid: { top: '10%', left: '6%', right: '3%', bottom: '10%' },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { show: true, lineStyle: { color: '#ccc', width: 1 } },
          axisTick: { show: false },
          axisLabel: { color: '#666', fontSize: 10 },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'line' },
          backgroundColor: '#fff',
          borderColor: '#ccc',
          borderWidth: 1,
          padding: [10, 15],
          textStyle: { color: '#333' },
          formatter: params => {
            const data = params[0];
            return `<div><div>日期: ${data.name}</div><br /><div>数量: ${data.value}</div></div>`;
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#666',
            formatter: value => value.toFixed(2),
          },
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        series: [
          {
            data: [],
            type: 'line',
            symbol: 'none',
            lineStyle: {
              width: 3,
              color: '#F29346',
              shadowBlur: 10,
              shadowColor: 'rgba(242, 147, 70)',
              shadowOffsetY: 8,
            },
          },
        ],
      },
      processOption: {
        tooltip: { trigger: 'item' },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: '10%',
          top: 'center',
          itemGap: 30,
          selectedMode: false,
          data: [],
          textStyle: {
            color: '#000',
            rich: {
              uname: { width: 100, color: '#000' },
              unum: { width: 30, align: 'right', color: '#000', fontWeight: 'bold' },
            },
          },
          icon: 'none',
        },
        color: ['#BBBBBB', '#E12137'],
        series: [
          {
            type: 'pie',
            radius: ['65%', '80%'],
            center: ['20%', '50%'],
            label: {
              show: true,
              position: 'center',
              formatter: params => {
                const total = this.processOption.series[0].data.reduce(
                  (acc, item) => acc + item.value,
                  0
                );
                const percentage = ((params.value / total) * 100).toFixed(2);
                return `${percentage}%`;
              },
              fontSize: 10,
              fontWeight: 'bold',
              color: '#333',
            },
            labelLine: { show: false },
            data: [],
          },
        ],
      },
      hoursOption: {
        grid: {
          top: '5%',
          left: '8%',
          right: '5%',
          bottom: '8%',
          borderColor: '#ccc',
          borderWidth: 2,
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: { show: true, lineStyle: { color: '#ccc', width: 1 } },
          axisTick: { show: false },
          axisLabel: { color: '#666', fontSize: 12 },
          splitLine: { show: true, lineStyle: { type: 'dashed', color: '#ccc' } },
        },
        yAxis: {
          type: 'value',
          min: 0,
          axisLine: { show: true, lineStyle: { color: '#ccc', width: 1 } },
          axisLabel: { color: '#666', fontSize: 12 },
          splitLine: { show: true, lineStyle: { type: 'dashed', color: '#ccc' } },
        },
        series: [{ data: [] }],
      },
      statistics: {},
      tableData: [],
      processList: [],
      extension: {
        columns: [
          { label: '专案号', prop: 'projectNumber', width: '120px', align: 'center' },
          { label: '专案名称', prop: 'materialName' },
          { label: '计划达成日', prop: 'planCompleteTime', width: '100px', align: 'center' },
          { label: '延期天数', prop: 'description', width: '100px', align: 'center' },
        ],
        tableData: [],
      },
      making: {
        columns: [
          { label: '专案号', prop: 'projectNumber', width: '120px', align: 'center' },
          { label: '专案名称', prop: 'materialName' },
          { label: '计划达成日', prop: 'planCompleteTime', width: '100px', align: 'center' },
          { label: '进度', prop: 'description', width: '100px', align: 'center' },
        ],
        tableData: [],
      },
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const res = await Api.mps.assemblyboard.list();
      const { code, data } = res.data;
      if (code === 200) {
        this.statistics = data.statistics;
        this.statistics.otdRateAbs = Math.abs(data.statistics?.otdRate);

        this.tableData = data.Extension;

        this.rateOptions.series[0].data = data.optionList;
        this.rateOptions.legend.data = data.optionList;

        this.materialsOption.series[0].data = data.materialsList.value;
        this.materialsOption.xAxis.data = data.materialsList.x;

        this.resourcesOption.series[0].data = data.resourcesList.value;
        this.resourcesOption.xAxis.data = data.resourcesList.x;

        this.processOption.series[0].data = data.processList;
        this.processOption.legend.data = data.processList;
        this.processList = data.processList;

        this.hoursOption.series = Object.keys(data.hoursList)
          .filter(key => key !== 'x')
          .map(key => ({
            name: data.hoursList[key].label,
            type: 'line',
            data: data.hoursList[key].value,
            color: ['#F29346'],
            symbol: 'none',
          }));
        this.hoursOption.xAxis.data = data.hoursList.x;

        this.extension.tableData = data.Extension;
        this.making.tableData = data.Making;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.app-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
  gap: 8px;
  .statistics-container {
    width: 100%;
    display: flex;
    column-gap: 8px;
    .statistics-wrap {
      display: flex;
      flex-direction: column;
      padding: 24px;
      flex: 1;
      background-color: #fff;
      border-radius: 8px;
      .statistics-title {
        font-weight: bold;
        font-size: 16px;
        color: #333;
        line-height: 16px;
      }
      .statistics-content {
        margin-top: 40px;
        flex: 1;
        overflow: hidden;
        .statistics-value {
          font-weight: bold;
          font-size: 32px;
          color: #333;
          line-height: 32px;
          &-unit {
            font-weight: 400;
            font-size: 16px;
            color: #666;
            line-height: 16px;
          }
        }
        .statistics-rate {
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 5px;
          width: 156px;
          height: 40px;
          background: #f6f8fa;
          box-shadow: inset 0px 0px 4px 0px rgba(255, 255, 255, 0.25);
          border-radius: 4px;
          .rate-value {
            display: flex;
            align-items: center;
          }
          .top-icon {
            color: red;
            font-weight: 600;
          }
          .bottom-icon {
            color: green;
            font-weight: 600;
          }
        }
      }
    }
  }
  .row {
    display: flex;
    gap: 8px;
    flex: 1;
    overflow: hidden;
    .right {
      display: flex;
      gap: 8px;
      width: calc(100% / 2 - 8px);
      .chart-pie {
        width: 260px !important;
        flex: unset;
      }
    }
    .card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      overflow: hidden;
      background: #fff;
      border-radius: 8px;
      &-header {
        margin-bottom: 12px;
        font-weight: bold;
        font-size: 16px;
        color: #333;
        line-height: 16px;
      }
      &-content {
        width: 100%;
        flex: 1;
        overflow: hidden;
        .chat-box-process {
          margin-top: 16px;
          height: 100px;
          overflow: hidden;
          background: #f5f5f5;
        }
        .item-content {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          height: 50px;
          padding: 0 10px;

          &-label {
            font-weight: 400;
            font-size: 14px;
            color: #333333;
            line-height: 14px;
          }

          &-value {
            font-weight: bold;
            font-size: 16px;
            color: #333333;
            line-height: 16px;
          }
        }
      }
    }
  }
}
</style>
