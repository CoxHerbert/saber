<template>
  <div class="mapcom-wrapper" v-if="props.show && chageData.residentInfo.length > 0">
    <div class="title">
      {{ chageData.provinceName }}
      <img src="../img/close@2x.png" class="close" @click="emit('close')" />
    </div>
    <div class="tab-wrapper">
      <div class="list-wrapper">
        <div class="coum-item table-title">
          <div class="coum-item-count width30">地点</div>
          <div class="coum-item-count">L1</div>
          <div class="coum-item-count">L2</div>
          <div class="coum-item-count">L3</div>
        </div>
        <div class="coum-item" v-for="(item, index) in chageData.residentInfo" :key="index">
          <div class="coum-item-count width30" :title="item.name">{{ item.name }}</div>
          <div class="coum-item-count">{{ item.L1 }}</div>
          <div class="coum-item-count">{{ item.L2 }}</div>
          <div class="coum-item-count">{{ item.L3 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array,
    default: () => ([])
  },
  selectPoint: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

const chageData = computed(() => {
  let list = props.selectPoint.residentInfo.map(item => {
    let obj = item.gradeList.reduce((acc, obj) => {
      acc[obj.name] = obj.numberPeople; // 使用对象的id作为key，name作为value
      return acc;
    }, {});
    return {
      name: item.residentName,
      ...obj,
    };
  });
  let newObj = {
    provinceName: props.selectPoint.provinceName,
    residentInfo: list,
  };
  return newObj;
});
</script>

<style lang="scss" scoped>
.mapcom-wrapper {
  position: absolute;
  top: 30%;
  left: 80%;
  width: 280px;
  background-color: #1e1f21;
  display: flex;
  flex-direction: column;
  z-index: 999999;
  .title {
    width: 100%;
    height: 32px;
    background-size: 160% 100%;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    padding-left: 38px;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    color: #33cccc;
    letter-spacing: 2px;
    text-shadow: 0px 8px 8px rgba(0, 0, 0, 0.3);
    background-image: url('../img/title-short@2x.png');
    .close {
      cursor: pointer;
      width: 24px;
      height: 24px;
      position: absolute;
      top: 0px;
      right: 11px;
      margin: auto;
      bottom: 0px;
    }
  }
  .tab-wrapper {
    padding: 5px 10px;
    box-sizing: border-box;

    .list-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      .table-title {
        .coum-item-count {
          color: #33cccc !important;
        }
      }

      .coum-item {
        padding-left: 10px;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        font-size: 12px;
        height: 30px;
        line-height: 30px;
        margin-bottom: 12px;
        text-align: center;
        background: rgba(255, 255, 255, 0.1);

        .coum-item-count {
          width: 20%;
          font-size: 14px;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .width30 {
          width: 40% !important;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
