<template>
  <Title title="待办" style="margin-top: 8px" />
  <div class="centerTop-wrapper">
    <div v-for="(item, i) in statisticsData" :key="i" class="item">
      <img :src="`${item.img}`" alt="" />
      <div class="right">
        <div class="value" :style="{ color: item.color }">
          {{ item.value }}
        </div>
        <div class="title">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import Api from '@/api/index';
import Title from './title.vue';
import todo1 from '../img/todo1.png';
import todo2 from '../img/todo2.png';
import todo3 from '../img/todo3.png';
import todo4 from '../img/todo4.png';
const statisticsData = ref([
  {
    title: '来料待入',
    img: todo1,
    prop: 'incomingNumber',
    value: '-',
  },
  {
    title: '工序转移待入',
    img: todo2,
    prop: 'processTransferNumber',
    value: '-',
  },
  {
    title: '未发货',
    img: todo3,
    prop: 'undeliveredNumber',
    value: '-',
    color: '#D94641',
  },
  {
    title: '待备料',
    img: todo4,
    prop: 'toPrepareNumber',
    value: '-',
    color: '#FFD976',
  },
]);
const getApi = async () => {
  const res = await Api.mps.commandRoom.toDo();
  const { code, data } = res.data;
  if (code == 200) {
    statisticsData.value = statisticsData.value.map(item => {
      item.value = data[item.prop];
      return item;
    });
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
  height: 179px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(59, 97, 157, 0.2);

  .item {
    text-align: center;
    justify-content: center;
    align-items: flex-end;
    width: 25%;
    display: flex;

    img {
      margin-right: 5px;
      width: 66px;
      height: 67px;
    }
    .right {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .value {
        font-size: 32px;
        color: #fff;
      }
      .title {
        font-size: 12px;
        color: #eaf0ff;
        padding: 3px 5px 3px 4px;
        box-sizing: border-box;
        background: linear-gradient(90deg, #627aa1 0%, rgba(32, 49, 76, 0) 100%);
      }
    }
  }
}
</style>
