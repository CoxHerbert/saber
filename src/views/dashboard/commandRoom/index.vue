<template>
  <div class="contaniner-wrapper" ref="appRef">
    <div class="header-wrapper"></div>
    <div class="warapper">
      <div class="left-wrapper">
        <div class="big-title">WMS</div>
        <ToDo ref="toDoRef" />
        <PendingApproval ref="pendingApprovalRef" />
        <FutureReceipt ref="futureReceiptRef" />
      </div>
      <div class="center-wrapper">
        <div class="big-title">MPS装配</div>
        <BasicInfo ref="basicInfo" />
        <div class="c-two-wrapper">
          <div class="c-two-item">
            <AdverseSituation ref="adverseSituationRef" />
          </div>
          <div class="c-two-item">
            <Reportwork ref="reportworkRef" />
          </div>
        </div>
        <PredictingManpower ref="predictingManpowerRef" />
        <NumberProjects ref="numberProjectsRef" />
      </div>
      <div class="right-wrapper">
        <div class="big-title">QMS&测量室</div>
        <div class="c-two-wrapper">
          <div class="c-two-item">
            <Qinmaterials title="来料款数（测量室）" mode="test" ref="qinmaterialsRef" />
          </div>
          <div class="c-two-item">
            <AverageTime title="平均耗时（测量室）" mode="test" ref="ayverageTimeRef" />
          </div>
        </div>
        <div class="c-two-wrapper">
          <div class="c-two-item">
            <Qinmaterials title="来料款数（QMS）" mode="qms" ref="qinmaterialsRef2" />
          </div>
          <div class="c-two-item" title="质检平均耗时（QMS）">
            <AverageTime title="质检平均耗时（QMS）" mode="qms" ref="ayverageTimeRef2" />
          </div>
        </div>
        <PendQualityTest ref="pendQualityTest" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ToDo from './component/toDo.vue';
import AdverseSituation from './component/adverseSituation.vue';
import PendingApproval from './component/pendingApproval.vue';
import FutureReceipt from './component/futureReceipt.vue';
import BasicInfo from './component/basicInfo.vue';
import Reportwork from './component/reportwork.vue';
import PredictingManpower from './component/predictingManpower.vue';
import NumberProjects from './component/numberProjects.vue';
import Qinmaterials from './component/qinmaterials.vue';
import AverageTime from './component/averageTime.vue';
import PendQualityTest from './component/pendQualityTest.vue';

const refreshInterval = ref(null);
const toDoRef = ref();
const pendingApprovalRef = ref();
const futureReceiptRef = ref();
const appRef = ref(null);
const drawTiming = ref(null);
const basicInfo = ref(null);
const adverseSituationRef = ref(null);
const reportworkRef = ref(null);
const predictingManpowerRef = ref(null);
const numberProjectsRef = ref(null);
const qinmaterialsRef = ref(null);
const qinmaterialsRef2 = ref(null);
const ayverageTimeRef = ref(null);
const ayverageTimeRef2 = ref(null);
const pendQualityTest = ref(null);

onMounted(() => {
  document.body.style.backgroundColor = '#030719';
  refresh();
  setRefreshInterval();
  calcRate();
  window.addEventListener('resize', resize);
});

/**
 * 设置Interval
 */
const setRefreshInterval = () => {
  if (refreshInterval.value) {
    clearRefreshInterval();
  }
  refreshInterval.value = setInterval(() => {
    refresh();
  }, 2 * 60 * 1000);
};

/**
 * 刷新数据
 */
const refresh = () => {
  toDoRef.value.getApi();
  pendingApprovalRef.value.getApi();
  futureReceiptRef.value.getApi();
  basicInfo.value.getApi();
  adverseSituationRef.value.getApi();
  reportworkRef.value.getApi();
  predictingManpowerRef.value.getApi();
  numberProjectsRef.value.getApi();
  qinmaterialsRef.value.getApi();
  qinmaterialsRef2.value.getApi();
  ayverageTimeRef.value.getApi();
  ayverageTimeRef2.value.getApi();
  pendQualityTest.value.getApi();
};

/**
 * 清空Interval
 */
const clearRefreshInterval = () => {
  refreshInterval.value && clearInterval(refreshInterval.value);
  refreshInterval.value = null;
};

const calcRate = () => {
  if (!appRef.value) return;
  // * 默认缩放值
  const scale = {
    width: '1',
    height: '1',
  };

  // * 设计稿尺寸（px）
  const baseWidth = 1920;
  const baseHeight = 1080;

  // * 需保持的比例（默认1.77778）
  const baseProportion = parseFloat((baseWidth / baseHeight).toFixed(5));

  // 当前宽高比
  const currentRate = parseFloat((window.innerWidth / window.innerHeight).toFixed(5));
  if (appRef.value) {
    if (currentRate > baseProportion) {
      // 表示更宽
      scale.width = ((window.innerHeight * baseProportion) / baseWidth).toFixed(5);
      scale.height = (window.innerHeight / baseHeight).toFixed(5);
      appRef.value.style.transform = `scale(${scale.width}, ${scale.height}) translate(-50%, -50%)`;
    } else {
      // 表示更高
      scale.height = (window.innerWidth / baseProportion / baseHeight).toFixed(5);
      scale.width = (window.innerWidth / baseWidth).toFixed(5);
      appRef.value.style.transform = `scale(${scale.width}, ${scale.height}) translate(-50%, -50%)`;
    }
  }
};
const resize = () => {
  clearTimeout(drawTiming.value);
  drawTiming.value = setTimeout(() => {
    calcRate();
  }, 200);
};

//清除定时器
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  clearRefreshInterval();
});
</script>

<style scoped lang="scss">
.contaniner-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: left top;
  overflow-y: auto;
  background-image: url('./img/bg.jpg');
  background-size: 100% 100%;
  width: 1920px;
  height: 1080px;
  background-color: #030719;
  display: flex;
  flex-direction: column;
  z-index: 50;
  box-sizing: border-box;
  overflow: hidden;
  .header-wrapper {
    padding: 0px 21px 13px 16px;
    box-sizing: border-box;
    width: 100%;
    height: 96px;
    position: relative;
    width: 100%;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url('./img/title.png');
  }
  .warapper {
    display: flex;
    justify-content: space-evenly;
    margin-top: 7px;
    .big-title {
      width: 100%;
      height: 32px;
      line-height: 32px;
      text-align: center;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-image: url('./img/rectangle.png');
      color: #ffd976;
      font-family: 'MyCustomFont', sans-serif;
      font-size: 27px;
    }
    .left-wrapper {
      width: 620px;
      display: flex;
      flex-direction: column;
      height: 964px;
      // border: 1px solid red;
    }
    .center-wrapper {
      width: 627px;
      height: 964px;
      display: flex;
      flex-direction: column;
    }
    .right-wrapper {
      width: 627px;
      height: 964px;
      display: flex;
      flex-direction: column;
    }
  }
  .c-two-wrapper {
    display: flex;
    justify-content: space-between;
    .c-two-item {
      width: 308px;
    }
  }
}

@font-face {
  font-family: 'MyCustomFont';
  src: url('../humanResources//font/title.ttf') format('woff2');
  font-weight: normal;
  font-style: normal;
}
</style>
