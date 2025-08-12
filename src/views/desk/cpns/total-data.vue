<template>
  <div class="comp-total-data" v-loading="loading">
    <div class="title">流程任务</div>
    <div class="item-row">
      <div class="data-item" v-for="(item, i) in dataItems" :key="i">
        <span class="label">{{ item.label }}</span>
        <span class="value" @click="goPage(item.route)">{{ infoData?.[item.key] || 0 }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Api from '@/api';
const router = useRouter();
const { proxy } = getCurrentInstance();
const compData = reactive({
  loading: false,
  dataItems: [
    {
      label: '我发起的',
      key: 'startCount',
      route: {
        path: '/desk/myprocess',
        query: {
          taskType: '我发起的',
        },
      },
    },
    {
      label: '待办',
      key: 'count',
      route: {
        path: '/desk/myprocess',
        query: {
          taskType: '待办',
        },
      },
    },
    {
      label: '已办',
      key: 'doneCount',
      route: {
        path: '/desk/myprocess',
        query: {
          taskType: '已办',
        },
      },
    },
    {
      label: '超期',
      key: 'overdueCount',
      route: {
        path: '/desk/myTask',
        query: {
          taskType: '超时',
        },
      },
    },
  ],
  infoData: {},
});
const { loading, dataItems, infoData } = toRefs(compData);

const getData = () => {
  loading.value = true;
  Api.desk.home
    .getProcessAllCount()
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        const {
          startProcessCount,
          startTaskCount,
          processCount,
          taskCount,
          doneProcessCount,
          doneTaskCount,
          overdueTaskCount,
          overdueProcessCount,
        } = data;
        infoData.value = {
          startCount: (startProcessCount || 0) + (startTaskCount || 0),
          count: (processCount || 0) + (taskCount || 0),
          doneCount: (doneProcessCount || 0) + (doneTaskCount || 0),
          overdueCount: (overdueTaskCount || 0) + (overdueProcessCount || 0),
        };
      }
      loading.value = false;
    })
    .catch(err => {
      loading.value = false;
      console.error(err);
    });
};

const goPage = route => {
  router.push(route);
};

onMounted(() => {
  getData();
});
</script>
<style lang="scss" scoped>
.comp-total-data {
  box-sizing: border-box;
  padding-bottom: 24px;
  width: 400px;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 16px;
  margin-right: 12px;
  .data-item {
    box-sizing: border-box;
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-flow: column nowrap;
    .value {
      cursor: pointer;
      border-bottom: 2px solid transparent;

      &:hover {
        border-bottom: 2px solid #333;
      }
    }
    &:last-child {
      .value:hover {
        border-bottom: 2px solid #e12137;
      }
    }
    &:last-child {
      .label,
      .value {
        color: #e12137;
      }
    }
  }
  .title {
    padding: 20px 0 0 20px;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-bottom: 20px;
  }
  .item-row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }

  .label {
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 400;
    font-size: 16px;
    color: #666666;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-bottom: 12px;
  }
  .value {
    font-family: D-DIN-DIN, D-DIN-DIN;
    font-weight: bold;
    font-size: 32px;
    color: #333333;
    line-height: 32px;
    text-align: left;
    font-style: normal;
    text-transform: none;
  }
}
</style>
