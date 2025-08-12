<template>
  <div class="chart-wrapper">
    <div id="map" class="echarts"></div>
    <MapFloatcomponent :selectPoint="selectPoint" :show="show" @close="show = false" />
    <!-- <div class="chage-map">
      <div
        class="item"
        v-for="(item, index) in countryList"
        :key="index"
        @click="tabMapChange(item.value)"
        :class="{ active: mapType === item.value }"
      >
        {{ item.name }}
      </div>
    </div> -->
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import MapFloatcomponent from './mapFloatcomponent.vue';
import vietnamGeoJSON from '../js/vietnam.json';
import chinaGeoJSON from '../js/china.json';
import { chinaProvinceLatlong, vietnamProvinceLatlong } from '../js/provinceLatlong';
import Api from '@/api/index';

const emit = defineEmits(['changeCountry']);

const countryList = [
  {
    name: '国内',
    value: 'china',
  },
  {
    name: '越南',
    value: 'vietnam',
  },
];
const show = ref(false);
// china 中国   vietnam 越南
const mapType = ref('china');
// 请求的数据
const askDatas = ref([]);
// 选中省份点
const selectPoint = ref({});
let myChart = null;
// 存储实例
let option = null;

onMounted(() => {
  tabMapChange(mapType.value);
});

// 筛选显示描点
const fifleterMapPoint = dataList => {
  let provinceData = mapType.value === 'china' ? chinaProvinceLatlong : vietnamProvinceLatlong;
  let filterList = [];
  provinceData.forEach(item => {
    dataList.forEach(sonitem => {
      if (
        item.name.indexOf(sonitem.provinceName) > -1 ||
        sonitem.provinceName.indexOf(item.name) > -1
      ) {
        let planPeople = sonitem.planPeople ? sonitem.planPeople : 0;
        item.value[2] = sonitem.totalPeople + '/' + planPeople;
        filterList.push(item);
      }
    });
  });
  return filterList;
};

// 切换地图
const tabMapChange = async value => {
  emit('changeCountry', value === 'china' ? '中国' : '越南');
  if (myChart) {
    show.value = false;
    myChart.dispose();
  }
  myChart = null;
  // 销毁 ECharts 实例
  mapType.value = value;
  const res = await Api.mps.assemblyboard.mapData({
    region: value === 'china' ? '中国' : '越南',
  });
  const { code, data } = res.data;
  if (code == 200) {
    askDatas.value = data;
    // 过滤显示的描点
    var drawDot = fifleterMapPoint(data);
    let initMap = value === 'china' ? chinaGeoJSON : vietnamGeoJSON;
    getApi(initMap, drawDot, mapType.value);
  }
};

const getApi = (mapData, drawDot, mapType) => {
  if (myChart == null) {
    myChart = echarts.init(document.getElementById('map'));
  }

  echarts.registerMap(mapType, mapData);

  option = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        if (params.componentIndex == 2) {
          let fifterData = askDatas.value.find(
            item =>
              item.provinceName.indexOf(params.name) > -1 ||
              params.name.indexOf(item.provinceName) > -1
          );
          selectPoint.value = fifterData;

          if (show.value == false) {
            show.value = true;
          }
        }
      },
    },
    legend: {
      orient: 'vertical',
      y: 'bottom',
      x: 'right',
      textStyle: {
        color: '#fff',
      },
    },
    visualMap: {
      show: false,
      min: 0,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'], // 文本，默认为数值文本
      calculable: true,
      seriesIndex: [1],
      inRange: {},
    },
    geo: {
      layoutCenter: ['56%', mapType == 'china' ? '73%' : '50%'],
      layoutSize: mapType == 'china' ? 1000 : 600, //地图视图大小
      map: mapType,
      show: true,
      roam: true,
      label: {
        normal: {
          show: false,
        },
        emphasis: {
          show: false,
        },
      },
      itemStyle: {
        borderColor: '#8ABECC', // 边框颜色
        borderWidth: 1, // 边框宽度
        emphasis: {
          areaColor: '#29464C', //悬浮区背景
        },
      },
    },
    series: [
      {
        symbolSize: 0,
        label: {
          normal: {
            formatter: '{b}',
            position: 'right',
            show: true,
            textStyle: {
              color: '#fff', // 文字颜色
              fontSize: 14, // 文字大小
            },
          },
          emphasis: {
            show: true,
          },
        },
        itemStyle: {
          normal: {},
        },
        type: 'scatter',
        coordinateSystem: 'geo',
        data: drawDot,
      },
      {
        type: 'map',
        map: mapType,
        geoIndex: 0,
        selectedMode: 'false',
        aspectScale: 0.75, //长宽比
        showLegendSymbol: false, // 存在legend时显示
        roam: true,
        itemStyle: {
          normal: {
            color: {
              type: 'linear', // 线性渐变
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,

              colorStops: [
                {
                  offset: 0,
                  color: '#2A474D', // 0% 处的颜色
                },
                {
                  offset: 0.5,
                  color: '#318496', // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: '#74B9C8', // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
          emphasis: {
            areaColor: '#2B91B7',
          },
        },
        animation: false,
        data: drawDot,
      },
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'circle',
        symbolSize: [40, 40],
        label: {
          normal: {
            show: true,
            textStyle: {
              color: '#fff',
              fontSize: 14,
            },
            formatter(value) {
              return value.data.value[2];
            },
          },
          emphasis: {
            show: true,
            textStyle: {
              color: '#fff', // 鼠标悬停时文字颜色
            },
          },
        },
        itemStyle: {
          normal: {
            color: '#5FB0FF', //标志颜色
          },
        },
        data: drawDot,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
        },
        hoverAnimation: true,
        zlevel: 1,
      },
    ],
  };
  myChart.resize();
  myChart.setOption(option);

  // 监听窗口大小变化事件
  window.addEventListener('resize', handleResize);
};

// 处理窗口大小变化事件
const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

defineExpose({
  getApi,
});
</script>

<style lang="scss" scoped>
.chart-wrapper {
  width: 100%;
  height: calc(100%);
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;

  .chage-map {
    display: flex;
    flex-direction: column;
    width: 112px;
    position: absolute;
    right: 30px;
    bottom: 40px;
    .item {
      cursor: pointer;
      margin-top: 40px;
      border-top: 2px solid #86a8cf;
      text-align: center;
      font-weight: 500;
      font-size: 24px;
      color: #d9e7ff;
      width: 112px;
      height: 44px;
      background: linear-gradient(180deg, rgba(134, 168, 207, 0.2) 0%, rgba(134, 168, 207, 0) 100%);
    }
    .active {
      font-weight: bold;
      background: linear-gradient(
        180deg,
        rgba(51, 204, 204, 0.2) 0%,
        rgba(51, 204, 204, 0.16) 19%,
        rgba(51, 204, 204, 0) 100%
      );
      border-radius: 0px 0px 0px 0px;
      border-top: 2px solid #33cccc;
    }
  }

  #map {
    width: 100%;
    height: 100%;
  }
  .chart-title {
    top: 42%;
    position: absolute;
    text-align: center;
    color: #fff;
    left: -44%;
    right: 0px;
    margin: auto;

    margin: auto;
    h1 {
      font-size: 19px;
    }
    h2 {
      font-weight: bold;
      font-size: 27px;
    }
  }
}
</style>
