<template>
  <div v-if="props.show" class="mapcom-wrapper">
    <div class="title">
      人员PO/FREE
      <img src="../img/close@2x.png" class="close" @click="emit('close')" />
    </div>
    <div class="tab-wrapper">
      <div class="list-wrapper">
        <div class="coum-item table-title">
          <div class="coum-item-count" v-for="(item, index) in titleList" :key="index">
            {{ item }}
          </div>
        </div>
        <div class="scroll-list">
          <div class="coum-item" v-for="(item, index) in data" :key="index">
            <div
              class="coum-item-count"
              @click="goPlanOrder(item.productName)"
              style="cursor: pointer; padding-left: 4px; box-sizing: border-box"
            >
              {{ item.productName }}
            </div>
            <div class="coum-item-count">{{ item.onHandPeopleCount || 0 }}</div>
            <div class="coum-item-count">{{ item.npi || 0 }}</div>
            <div class="coum-item-count">{{ item.singlePoPeopleCount || 0 }}</div>

            <div class="coum-item-count">{{ item.numberOfQuotations || 0 }}</div>
            <div class="coum-item-count">{{ item.mpFreePeopleCount || 0 }}</div>
            <div class="coum-item-count">{{ item.numberOfSupportDept || 0 }}</div>
            <div class="coum-item-count">{{ item.supportOnSite || 0 }}</div>

            <div class="coum-item-count">{{ item.numberOfManagers || 0 }}</div>
            <div class="coum-item-count">{{ item.numberOfPeopleOnLeave || 0 }}</div>
            <div class="coum-item-count">{{ item.resignationInProgress || 0 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => [],
  },
});

const titleList = ref([
  '线体',
  'On hand 总人数',
  'NPI',
  '单独下 PO人数',
  '机台报价内人数',
  'MP Free人数',
  '支援到装配部',
  '支援到现场项项目',
  '管理人数',
  '请假',
  '离职中',
]);

const emit = defineEmits(['close']);

// 跳转现场计划看板
const goPlanOrder = deptName => {
  router.push({
    path: `/pdp/planOrder/count`,
    query: {
      deptName: deptName,
    },
  });
};
</script>

<style lang="scss" scoped>
.mapcom-wrapper {
  position: fixed;
  top: 14%;
  right: 31%;
  z-index: 10;
  width: 800px;
  background-color: #1e1f21;
  display: flex;
  flex-direction: column;
  z-index: 999999;
  max-height: 60vh;

  .title {
    position: sticky;
    width: 100%;
    height: 32px;
    min-height: 32px;
    background-size: 120% 100%;
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
    background-image: url('../img/title-long@2x.png');
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
  .scroll-list {
    max-height: calc(60vh - 90px);
    overflow-y: scroll;
    overflow-x: hidden;
    padding-bottom: 10px;
    box-sizing: border-box;
  }

  .tab-wrapper {
    padding: 5px 10px;
    box-sizing: border-box;
    flex: 1;
    .list-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;

      .table-title {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px !important;
        line-height: 14px !important;
        .coum-item-count {
          color: #33cccc;
        }
      }

      .coum-item-count {
        width: 30%;
        color: #fff;
        margin: 0px 4px;
        &:nth-child(1),
        &:nth-child(2) {
          width: 20%;
        }
      }

      .coum-item {
        width: 100%;
        display: flex;
        font-size: 12px;
        height: 30px;
        line-height: 30px;
        margin-bottom: 12px;
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
