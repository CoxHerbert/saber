<template>
  <div class="personNumCom-wrapper" v-if="props.show">
    <div class="title">
      {{ chageData.name }}
      <img src="../img/close@2x.png" class="close" @click="emit('close')" />
    </div>
    <div class="tab-wrapper">
      <div class="list-wrapper">
        <div class="item" v-for="(item, index) in chageData.list" :key="index">
          <div class="dotpoint" :style="{ backgroundColor: item.itemStyle.color }"></div>
          <div class="label">{{ item.name }}</div>
          <div class="value">{{ item.value }}</div>
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
    default: false,
  },
  name: {
    type: String,
    default: () => '',
  },
  selectPoint: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);

const chageData = computed(() => {
  return props.selectPoint;
});
</script>

<style lang="scss" scoped>
.personNumCom-wrapper {
  position: absolute;
  bottom: 240px;
  left: 35%;
  width: 450px;
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
    font-size: 16px;
    color: #33cccc;
    letter-spacing: 2px;
    text-shadow: 0px 8px 8px rgba(0, 0, 0, 0.3);
    background-image: url('../img/title-short@2x.png');
    background-size: 100% 110%;
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
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;
      justify-content: space-between;

      .item {
        color: #fff;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        font-size: 16px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        width: 48%;

        .dotpoint {
          width: 14px;
          height: 14px;
          background-color: #33cccc;
          margin-right: 8px;
        }

        .label {
          position: relative;
          color: #d9e7ff;
          margin-right: 12px;
          width: 80%;
        }
        .value {
          flex: 1;
          color: #fff;
        }
      }
    }
  }
}
</style>
