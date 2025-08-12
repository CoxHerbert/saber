<template>
  <Title title="基本信息" style="margin-top: 8px" />
  <div class="baseInfo-wrapper" v-if="statisticsData">
    <div class="item-wrapper left-wrapper">
      <div class="item">
        <div class="label">在制产品数量</div>
        <div class="value">-</div>
        <!-- <div class="value">{{ toLocaleString(statisticsData.zjCount) || 0 }}</div> -->
      </div>
      <div class="item">
        <div class="label">在制专案数量</div>
        <div class="value">{{ toLocaleString(statisticsData.mtoCount) || 0 }}</div>
      </div>
    </div>

    <div class="center-wrapper">
      <div class="value">{{ statisticsData.otd || 0 }}%</div>
      <div class="label">OTD</div>
    </div>

    <div class="item-wrapper right-wrapper">
      <div class="item">
        <div class="label">周投产工时</div>
        <div class="value">{{ toLocaleString(statisticsData.weekHour / 3600) || 0 }}</div>
      </div>
      <div class="item">
        <div class="label">组装人力总数</div>
        <div class="value">{{ toLocaleString(statisticsData.weekPeople) || 0 }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import Api from '@/api/index';
import Title from './title.vue';
import { toLocaleString } from '@/utils/util.js';

const statisticsData = ref({
  mtoCount: 0,
  zjCount: 0,
  sbCount: 0,
  otd: '',
  otdRate: '',
  weekHour: 0,
  weekPeople: 0,
});
const getApi = async () => {
  const res = await Api.mps.commandRoom.basicInfo();
  const { code, data } = res.data;
  if (code == 200) {
    statisticsData.value = {
      mtoCount: data.mtoCount,
      zjCount: data.zjCount,
      sbCount: data.sbCount,
      otd: data.otd,
      otdRate: data.otdRate,
      weekHour: data.weekHour,
      weekPeople: data.weekPeople,
    };
  }
};

defineExpose({
  getApi,
});
</script>

<style lang="scss" scoped>
.baseInfo-wrapper {
  color: #fff;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  z-index: 99;
  height: 179px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(59, 97, 157, 0.2);
  position: relative;
  .item-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    align-items: center;
    position: absolute;
    padding: 19px 0px 11px;
    box-sizing: border-box;
    .item {
      display: flex;
      justify-content: center;
      flex-direction: column;
      .label {
        font-size: 16px;
        line-height: 16px;
        color: #eaf0ff;
      }
      .value {
        font-weight: bold;
        font-size: 22px;
        color: #ffffff;
        font-family: DIN Alternate, DIN Alternate;
        margin-top: 11px;
      }
    }
  }
  .left-wrapper {
    left: 48px;
  }
  .right-wrapper {
    right: 45px !important;
    .item {
      align-items: flex-end !important;
    }
  }
  .center-wrapper {
    position: absolute;
    left: 0px;
    right: 0px;
    margin: auto;
    width: 380px;
    height: 100%;
    background-image: url('../img/group@2x.png');
    background-repeat: no-repeat;
    background-size: 350px auto;
    background-position: 15px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .value {
      font-weight: bold;
      font-size: 26px;
      color: #ffffff;
      text-align: center;
    }
    .label {
      font-size: 20px;
      color: #cfd5e5;
    }
  }
}
</style>
