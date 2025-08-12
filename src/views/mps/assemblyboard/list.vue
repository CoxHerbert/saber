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
              {{ statistics?.otdRateAbs }}%</span
            >
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

<script setup name="MyClientsList">
import { onMounted, reactive, toRefs } from 'vue';
import * as echarts from 'echarts';
import Api from '@/api/index';

const data = reactive({
  rateOptions: {
    tooltip: {
      trigger: 'item',
    },
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
        rich: {
          uname: {
            width: 50,
          },
          unum: {
            width: 40,
            align: 'right',
          },
        },
      },
      formatter: name => {
        let item;
        rateOptions.value.series.forEach(serie => {
          // 根据名称找到对应的数据项
          item = serie.data.find(d => d.name === name);
        });
        // 获取数据项的值
        const value = item ? item.value : '';
        // 返回格式化的字符串
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
          formatter: params => {
            const total = params.value;
            return `{a|${total}}`;
          },
          rich: {
            a: {
              color: '#333',
              fontSize: 20,
              lineHeight: 30,
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  },
  materialsOption: {
    grid: {
      top: '10%', // 距离容器顶部的距离
      left: '6%',
      right: '3%',
      bottom: '10%',
    },
    tooltip: {
      trigger: 'axis', // 触发类型，'axis' 表示按轴显示详情
      axisPointer: {
        type: 'shadow', // 指示器类型，'shadow' 为阴影指示器
      },
      formatter: params => {
        // 自定义提示内容
        const data = params[0]; // 获取柱状图的数据
        return `
            <div>
              <div>日期:  ${data.name}</div><br />
              <div>数量:  ${data.value}</div>
            </div>
          `;
      },
      backgroundColor: '#fff', // 背景色
      borderColor: '#ccc', // 边框颜色
      borderWidth: 1, // 边框宽度
      textStyle: {
        color: '#333', // 字体颜色
      },
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: {
        show: true, // 显示 X 轴的轴线
        lineStyle: {
          color: '#ccc', // 设置线条颜色为 #ccc
          width: 1, // 设置线条粗细
        },
      },
      axisTick: {
        show: false, // 隐藏刻度线
      },
      axisLabel: {
        color: '#666', // 设置文字颜色
        fontSize: 10, // 设置文字大小（可选）
      },
      boundaryGap: true, // 柱子是否留有空隙，默认 true
    },
    yAxis: {
      type: 'value',
      // max: 1000,
      interval: 100, // 设置刻度间隔为 200
      splitLine: {
        lineStyle: {
          type: 'dashed', // 设置网格线为虚线
        },
      },
    },
    series: [
      {
        data: [],
        type: 'bar',
        barWidth: 16, // 柱子宽度
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F29346' }, // 顶部颜色
              { offset: 1, color: '#FFDFAF' }, // 底部颜色
            ]),
          },
        },
      },
    ],
  },
  resourcesOption: {
    grid: {
      top: '10%', // 距离容器顶部的距离
      left: '6%',
      right: '3%',
      bottom: '10%',
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: {
        show: true, // 显示 X 轴的轴线
        lineStyle: {
          color: '#ccc', // 设置线条颜色为 #ccc
          width: 1, // 设置线条粗细
        },
      },

      axisTick: {
        show: false, // 隐藏刻度线
      },
      axisLabel: {
        color: '#666', // 设置文字颜色
        fontSize: 10, // 设置文字大小（可选）
      },
    },
    tooltip: {
      trigger: 'axis', // 触发类型为'axis'，意味着鼠标悬停时显示整条折线的数据
      axisPointer: {
        type: 'line', // 鼠标悬浮时显示的指示器为线条
      },
      backgroundColor: '#fff', // 提示框的背景颜色
      borderColor: '#ccc', // 提示框边框颜色
      borderWidth: 1, // 边框宽度
      padding: [10, 15], // 提示框内边距
      textStyle: {
        color: '#333', // 文字颜色
      },
      formatter: params => {
        // 自定义格式化提示框内容
        const data = params[0]; // 获取第一条系列的数据
        return `
            <div>
              <div>日期:  ${data.name}</div><br />
              <div>数量:  ${data.value}</div>
            </div>
          `;
      },
    },
    yAxis: {
      type: 'value',
      // interval: 0.25, // 设置刻度间隔
      axisLabel: {
        color: '#666',
        formatter: value => {
          return value.toFixed(2); // 强制显示两位小数
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed', // 设置网格线为虚线
        },
      },
    },
    series: [
      {
        data: [],
        type: 'line',
        symbol: 'none', // 隐藏小圆点
        lineStyle: {
          width: 3, // 线条宽度
          color: '#F29346', // 线条颜色
          shadowBlur: 10, // 阴影模糊度
          shadowColor: 'rgba(242, 147, 70)', // 阴影颜色
          shadowOffsetX: 0, // 阴影 X 偏移
          shadowOffsetY: 8, // 阴影 Y 偏移
        },
      },
    ],
  },
  processOption: {
    tooltip: {
      trigger: 'item',
    },
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
          uname: {
            width: 100,
            color: '#000', // 文字颜色
          },
          unum: {
            width: 30,
            align: 'right',
            color: '#000', // 数值颜色
            fontWeight: 'bold', // 数值加粗
          },
        },
      },
      icon: 'none', // 不显示图标，只显示文字和值
    },
    color: ['#BBBBBB', '#E12137'],
    series: [
      {
        type: 'pie',
        radius: ['65%', '80%'],
        center: ['20%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: true, // 显示标签
          position: 'center', // 标签显示在圆心
          formatter: params => {
            const total = processOption.value.series[0].data.reduce(
              (acc, item) => acc + item.value,
              0
            ); // 计算总值
            const percentage = ((params.value / total) * 100).toFixed(2); // 计算百分比
            return `${percentage}%`; // 返回百分比
          },
          fontSize: 10, // 字体大小
          fontWeight: 'bold', // 字体加粗
          color: '#333', // 字体颜色
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 10,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  },
  hoursOption: {
    grid: {
      top: '5%', // 距离容器顶部的距离
      left: '8%',
      right: '5%',
      bottom: '8%',
      borderColor: '#ccc', // 设置边框颜色
      borderWidth: 2, // 设置边框宽度
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLine: {
        show: true, // 显示 X 轴的轴线
        lineStyle: {
          color: '#ccc', // 设置线条颜色为 #ccc
          width: 1, // 设置线条粗细
        },
      },
      axisTick: {
        show: false, // 隐藏刻度线
      },
      axisLabel: {
        color: '#666', // 设置文字颜色
        fontSize: 12, // 设置文字大小（可选）
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed', // 设置X轴为虚线
          color: '#ccc', // 设置虚线颜色
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 0, // 设置Y轴从0开始
      // max: 1000,
      // interval: 100, // 设置刻度间隔为 200
      axisLine: {
        show: true, // 确保显示Y轴线
        lineStyle: {
          color: '#ccc', // 设置Y轴的实线颜色
          type: 'solid', // 设置实线
          width: 1, // 设置实线宽度
        },
      },
      nameTextStyle: {
        color: '#666666', // 设置Y轴名称文字颜色
        fontSize: 14, // 设置文字大小
        fontWeight: 'normal', // 设置文字粗细
      },
      axisLabel: {
        color: '#666', // 设置文字颜色
        fontSize: 12, // 设置文字大小（可选）
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed', // 设置虚线
          color: '#ccc', // 设置虚线颜色
        },
      },
    },
    series: [
      {
        data: [],
      },
    ],
  },
  statistics: [],
  tableData: [],
  processList: [],
  extension: {
    columns: [
      {
        label: '专案号',
        prop: 'projectNumber',
        width: '120px',
        align: 'center',
      },
      {
        label: '专案名称',
        prop: 'materialName',
      },
      {
        label: '计划达成日',
        prop: 'planCompleteTime',
        width: '100px',
        align: 'center',
      },
      {
        label: '延期天数',
        prop: 'description',
        width: '100px',
        align: 'center',
      },
    ],
    tableData: [],
  },
  making: {
    columns: [
      {
        label: '专案号',
        prop: 'projectNumber',
        width: '120px',
        align: 'center',
      },
      {
        label: '专案名称',
        prop: 'materialName',
      },
      {
        label: '计划达成日',
        prop: 'planCompleteTime',
        width: '100px',
        align: 'center',
      },
      {
        label: '进度',
        prop: 'description',
        width: '100px',
        align: 'center',
      },
    ],
    tableData: [],
  },
});

const {
  tableData,
  rateOptions,
  materialsOption,
  resourcesOption,
  processOption,
  hoursOption,
  statistics,
  processList,
  extension,
  making,
} = toRefs(data);

onMounted(async () => {
  await getData();
});

const getData = async () => {
  const res = await Api.mps.assemblyboard.list();
  const { code, data } = res.data;
  if (code == 200) {
    // OTD
    statistics.value = data.statistics;
    statistics.value.otdRateAbs = Math.abs(data.statistics?.otdRate);
    // 延期专案
    tableData.value = data.Extension;
    // 在制产品数量
    rateOptions.value.series[0].data = data.optionList;
    rateOptions.value.legend.data = data.optionList;
    // 物料入库
    materialsOption.value.series[0].data = data.materialsList.value;
    materialsOption.value.xAxis.data = data.materialsList.x;
    // 生产组
    resourcesOption.value.series[0].data = data.resourcesList.value;
    resourcesOption.value.xAxis.data = data.resourcesList.x;
    // 各组品质制程不良情况
    processOption.value.series[0].data = data.processList;
    processOption.value.legend.data = data.processList;
    processList.value = data.processList;
    // 各组
    hoursOption.value.series = Object.keys(data.hoursList)
      .filter(key => key !== 'x') // 排除 x 轴的数据
      .map(key => {
        return {
          name: data.hoursList[key].label, // 小组的名称
          type: 'line', // 设置为折线图
          data: data.hoursList[key].value, // 小组的数值数据
          color: ['#F29346'], // 为每个小组设置颜色
          symbol: 'none', // 隐藏小圆点
        };
      });
    hoursOption.value.xAxis.data = data.hoursList.x;

    extension.value.tableData = data.Extension;
    making.value.tableData = data.Making;
  }
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
