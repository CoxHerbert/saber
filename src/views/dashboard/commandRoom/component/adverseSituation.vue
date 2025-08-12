<template>
  <Title title="各组品质不良情况（周）" style="margin-top: 8px" type="sort" />
  <div class="centerTop-wrapper">
    <div class="echarts-wrapper">
      <CircularProgress :progress="50" :size="85" />
    </div>

    <div class="item-wrapper left-wrapper" v-if="statisticsData">
      <div class="item">
        <div class="label">线材总数</div>
        <div class="value">{{ toLocaleString(statisticsData.totalNumberOfwires) || 0 }}</div>
      </div>
      <div class="item">
        <div class="label">异常总数</div>
        <div class="value">{{ toLocaleString(statisticsData.totalNumberOfExceptions) || 0 }}</div>
      </div>
    </div>

    <div class="item-wrapper bottom-wrapper" v-if="statisticsData">
      <div class="item">
        <div class="label">电气异常数量</div>
        <div class="value">
          {{ toLocaleString(statisticsData.qryElectricalAbnormalities) || 0 }}
        </div>
      </div>
      <div class="item">
        <div class="label">机械各组异常数量</div>
        <div class="value">{{ toLocaleString(statisticsData.groupNumberAnomalies) || 0 }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Api from '@/api/index';
import Title from './title.vue';
import CircularProgress from './circularProgress.vue';
import { toLocaleString } from '@/utils/util.js';
const statisticsData = ref(null);

const getApi = async () => {
  const res = await Api.mps.commandRoom.adverseSituation();
  const { code, data } = res.data;
  if (code == 200) {
    statisticsData.value = {
      totalNumberOfwires: 123456,
      totalNumberOfExceptions: 2422,
      qryElectricalAbnormalities: 6002,
      groupNumberAnomalies: 32220,
    };
  }
};

defineExpose({
  getApi,
});
</script>

<style lang="scss" scoped>
.centerTop-wrapper {
  color: #fff;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  z-index: 99;
  height: 174px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(59, 97, 157, 0.2);
  .echarts-wrapper {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 140px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  position: relative;
  .item-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: absolute;
    align-items: flex-start;
    .item {
      display: flex;
      justify-content: center;
      flex-direction: row;
      align-items: center;
      &:nth-child(2) {
        margin-top: 12px;
      }
      .label {
        font-size: 14px;
        line-height: 14px;
        color: #eaf0ff;
        margin-right: 30px;
      }
      .value {
        font-weight: bold;
        font-size: 16px;
        color: #ffffff;
        font-family: DIN Alternate, DIN Alternate;
      }
    }
  }
  .left-wrapper {
    right: 20px;
    top: 28px;
  }
  .bottom-wrapper {
    bottom: 14px !important;
    left: 37px;
    .item {
      align-items: flex-end !important;
    }
  }
}
</style>
