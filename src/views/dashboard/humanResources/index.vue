<template>
  <div class="contaniner-wrapper">
    <!-- 头部 -->
    <Header> </Header>

    <div class="top-wrapper">
      <!-- 左侧内容区 -->
      <div class="left-wrapper">
        <div class="left-top">
          <ArrestPoint ref="arrestPointRef" />
          <Map @changeCountry="changeCountry" />
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-wrapper">
        <!-- 待分配人员 -->
        <SkillLevels ref="skillLevelsRef" />

        <!-- 人员PO/FREE -->
        <Quantityproportion ref="quantityproportionRef" @lookMore="lookMore" />
      </div>
    </div>
    <div class="btm-wrapper">
      <!-- 各部门地区分布人数 -->
      <div class="btm-left-wrapper">
        <Title title="各部门地区分布人数" type="long" />
        <div class="personNum-wrapper" v-if="personList.length > 0">
          <div class="personNum-wrapper-item" v-for="(item, index) in personList" :key="index">
            <PersonNum
              ref="personNumRef"
              :chartName="`personNum${index}`"
              :data="item"
              @clickPersonNum="clickPersonNum"
            />
          </div>
          <PersonNumComponent
            :show="personNumComShow"
            :selectPoint="personNumComponentData"
            @close="personNumComShow = false"
          />
        </div>
      </div>
      <!-- 现场计划单列表 -->
      <div class="btm-right-wrapper">
        <StageNumber ref="stageNumberRef" />
      </div>
    </div>
    <img src="./img/page-btm.png" alt="" class="page-btm" />
  </div>
  <QuantityprComponent
    :data="quantityprComponentData"
    :show="quantityprComponentShow"
    @close="quantityprComponentShow = false"
  />
</template>
<script setup>
import Header from './components/header.vue';
import ArrestPoint from './components/point.vue';
import Title from './components/title.vue';
import PersonNum from './components/personNum.vue';
import SkillLevels from './components/skilllevels.vue';
import Quantityproportion from './components/quantityproportion.vue';
import StageNumber from './components/stageNumber.vue';
import Map from './components/map.vue';
import Api from '@/api/index';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import PersonNumComponent from './components/personNumComponent.vue';
import QuantityprComponent from './components/quantityprComponent.vue';

// 待分配人数
const quantityprComponentData = ref([]);
const quantityprComponentShow = ref(false);

const personNumComShow = ref(false);
const personNumComponentData = ref({});
const refreshInterval = ref(null);
const personNumRef = ref();
const skillLevelsRef = ref();
const quantityproportionRef = ref();
const stageNumberRef = ref();
const country = ref('中国');
const arrestPointRef = ref();
// 各部门分布人数数据
const personList = ref([]);

onMounted(() => {
  departmentandregionFn();
  refresh();
  setRefreshInterval();
});

// 人员PO/FREE查看更多回调
const lookMore = list => {
  quantityprComponentData.value = list;
  quantityprComponentShow.value = true;
};

// 各部门地区分布人数
const clickPersonNum = e => {
  console.log(e);
  personNumComShow.value = true;
  personNumComponentData.value = e;
};

// 切换国家
const changeCountry = e => {
  country.value = e;
  stageNumberRef.value.getApi(e);
};

// 各部门地区分布人数
const departmentandregionFn = async () => {
  const res = await Api.mps.assemblyboard.departmentandregion();
  const { code, data } = res.data;
  if (code == 200) {
    personList.value = data;
  }
};
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
  departmentandregionFn();
  arrestPointRef.value.getApi();
  skillLevelsRef.value.getApi();
  quantityproportionRef.value.getApi();
  stageNumberRef.value.getApi(country.value);
};

/**
 * 清空Interval
 */
const clearRefreshInterval = () => {
  refreshInterval.value && clearInterval(refreshInterval.value);
  refreshInterval.value = null;
};

//清除定时器
onBeforeUnmount(() => {
  clearRefreshInterval();
});
</script>

<style scoped lang="scss">
.contaniner-wrapper {
  position: relative;
  overflow-y: auto;
  background-image: url('./img/bg.jpg');
  background-size: 100% 100%;
  width: 100%;
  height: calc(100vh);
  min-width: 1600px;
  min-height: 1080px;
  background-color: #030719;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: 50;
  box-sizing: border-box;

  .top-wrapper {
    // height: 619px;
    height: 59%;
    display: flex;
    flex-direction: row;
    padding: 20px 32px 0px;
    box-sizing: border-box;
    .left-wrapper {
      width: calc(100% - 555px);
      z-index: 999;
      height: calc(100% + 0px);
      // flex: 1;
      .left-top {
        // height: 619px;
        height: 100%;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-image: url('./img/map.png');
      }
    }
    .right-wrapper {
      position: absolute;
      top: 126px;
      right: 24px;
      width: 535px;
      height: calc(100% - 156px);
      z-index: 9;
      display: flex;
      flex-direction: column;
    }
  }
  .btm-wrapper {
    margin-top: 24px;
    position: absolute;
    width: 100%;
    flex: 1;
    margin-top: 24px;
    bottom: 30px;
    padding: 0px 24px 0px 36px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    z-index: 999;
    .btm-left-wrapper {
      flex: 1;
      margin-right: 28px;
      .personNum-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        position: relative;
        .personNum-wrapper-item {
          width: 20%;
          height: 240px;
        }
      }
    }
    .btm-right-wrapper {
      width: 535px;
      .stage-number-wrapper {
        margin-top: 40px;
        width: 100%;
        display: flex;
        align-items: center;
        .stage-number-item {
          width: 50%;
          height: 240px;
        }
      }
    }
  }
}

.page-btm {
  position: absolute;
  bottom: 0px;
  width: calc(100% - 56px);
  height: 17px;
  z-index: 99;
  bottom: 12px;
  left: 0px;
  right: 0px;
  margin: auto;
}
</style>
