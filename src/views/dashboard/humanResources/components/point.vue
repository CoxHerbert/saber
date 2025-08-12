<template>
  <div class="centerTop-wrapper">
    <div v-for="item in statisticsData" :key="item.value" class="item">
      <div class="name">
        <img src="../img/point.png" alt="" />
        {{ item.name }}
      </div>
      <div class="value">{{ item.value }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import Api from '@/api/index';

const statisticsData = ref([]);
const getApi = async () => {
  const res = await Api.mps.assemblyboard.statistics();
  const { code, data } = res.data;
  if (code == 200) {
    statisticsData.value = data;
  }
};

defineExpose({
  getApi,
});
</script>

<style lang="scss" scoped>
.centerTop-wrapper {
  color: #fff;
  min-width: 250px;
  position: absolute;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  z-index: 99;
  margin: 33px 0px 0px 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .item {
    text-align: center;
    margin-bottom: 30px;
    .name {
      font-size: 28px;
      display: flex;
      align-items: center;
      color: #d9e7ff;
      img {
        margin-right: 20px;
        width: 35px;
        height: 35px;
      }
    }
    .value {
      font-size: 40px;
      font-weight: bold;
    }
  }
}
</style>
