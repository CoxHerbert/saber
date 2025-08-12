<template>
  <Title :title="title" style="margin-top: 8px" type="sort" />
  <div class="baseInfo-wrapper">
    <div class="tabs">
      <div
        class="tabs-item"
        v-for="(item, index) in tabItems"
        :key="index"
        :class="active == index ? 'active' : ''"
        @click="changeTab(index)"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="incom-material">
      来料款数 <span>{{ tabItems[active].data?.SourceNumber?.value }}</span>
    </div>
    <div class="incom-material-rows">
      <div class="item">
        <div class="label">{{ tabItems[active].data?.CheckedNumber?.value }}</div>
        <div class="value">已检</div>
      </div>
      <div class="item">
        <div class="label">{{ tabItems[active].data?.ToMaoCiNumber?.value }}</div>
        <div class="value">转毛刺</div>
      </div>
      <div class="item">
        <div class="label">{{ tabItems[active].data?.ToCheckNumber?.value }}</div>
        <div class="value">待检</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import Api from '@/api/index';
import Title from './title.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default() {
      return 'test';
    },
    validator(value) {
      return ['test', 'qms'].includes(value);
    },
  },
});

const data = reactive({
  tabItems: [
    {
      label: '今日来料',
      data: {
        SourceNumber: {
          prop: 'todaySourceNumber',
          value: 0,
        },
        ToCheckNumber: {
          prop: 'todayToCheckNumber',
          value: 0,
        },
        CheckedNumber: {
          prop: 'todayCheckedNumber',
          value: 0,
        },
        ToMaoCiNumber: {
          prop: 'todayToMaoCiNumber',
          value: 0,
        },
      },
    },
    {
      label: '本月来料',
      data: {
        SourceNumber: {
          prop: 'thisMonthSourceNumber',
          value: 0,
        },
        ToCheckNumber: {
          prop: 'thisMonthToCheckNumber',
          value: 0,
        },
        CheckedNumber: {
          prop: 'thisMonthCheckedNumber',
          value: 0,
        },
        ToMaoCiNumber: {
          prop: 'thisMonthToMaoCiNumber',
          value: 0,
        },
      },
    },
  ],
  list: ['今日来料', '本月来料'],
  active: 0,
  statisticsData: null,
});

const { active, tabItems, list, statisticsData } = toRefs(data);

// 切换tab
const changeTab = index => {
  active.value = index;
};
const getApi = async () => {
  const res = await Api.mps.commandRoom.qinmaterials(props.mode);
  const { code, data } = res.data;
  if (code == 200) {
    tabItems.value = tabItems.value.map(tab => {
      Object.keys(tab.data).forEach(key => {
        tab.data[key].value = data[tab.data[key].prop];
      });
      return tab;
    });
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
  z-index: 99;
  height: 179px;
  display: flex;
  flex-direction: row;
  background: rgba(59, 97, 157, 0.2);
  padding: 17px 7px;
  box-sizing: border-box;
  position: relative;
  flex-direction: column;
  .tabs {
    display: flex;
    flex-direction: row;
    .tabs-item {
      width: 67px;
      height: 16px;
      display: flex;
      align-items: center;
      font-size: 11px;
      background-image: url('../img/lltab.png');
      background-size: 100% 100%;
      margin-right: 13px;
      text-align: center;
      justify-content: center;
      color: #24ced3;
      cursor: pointer;
    }
    .active {
      color: #ffd976;
      background-image: url('../img/llstab.png') !important;
    }
  }
  .incom-material {
    width: 100%;
    height: 29px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url('../img/szbg.png');
    background-size: 100% 100%;
    margin: 20px 0px 10px;
    color: #eaf0ff;
    font-size: 16px;
    span {
      font-weight: bold;
      font-size: 21px;
      margin-left: 5px;
    }
  }
  .incom-material-rows {
    display: flex;
    align-items: center;
    .item {
      width: 33%;
      height: 70px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      .label {
        font-size: 14px;
        line-height: 14px;
        color: #fff;
        margin-top: -8px;
      }
      &:nth-child(1) {
        background-image: url('../img/ll1.png');
        background-size: 100% 100%;
        .value {
          font-size: 7px;
          color: #fffee5;
        }
      }
      &:nth-child(2) {
        background-image: url('../img/ll2.png');
        background-size: 100% 100%;
        .value {
          font-size: 7px;
          color: #e5f3ff;
        }
      }
      &:nth-child(3) {
        background-image: url('../img/ll3.png');
        background-size: 100% 100%;
        .value {
          font-size: 7px;
          color: #fffee5;
        }
      }
    }
  }
}
</style>
