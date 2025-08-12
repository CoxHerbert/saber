<template>
  <div class="comp-schedule" v-loading="loading">
    <div class="title">
      日程
      <!-- <el-button type="primary" icon="Plus">新增日程</el-button> -->
    </div>
    <div class="comp-content">
      <div class="left">
        <el-calendar v-model="dateValue" ref="calendar">
          <template #header="{ date }">
            <div class="calendar-header">
              <span class="last month" @click="selectDate('prev-month')"
                ><el-icon><ArrowLeft /></el-icon
              ></span>
              <span class="current-date">{{ date }}</span>
              <span class="next month" @click="selectDate('next-month')">
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </template>
          <template #date-cell="{ data }">
            <div class="current-day" :class="getClass(data)">
              {{ dayjs(data.day).format('DD') }}
              <span
                v-show="monthMap[dayjs(data.day).format('YYYY-MM-DD')]"
                class="dot-icon"
                :style="{
                  background: monthMap[dayjs(data.day).format('YYYY-MM-DD')],
                }"
              ></span>
            </div>
          </template>
        </el-calendar>
      </div>
      <div class="right">
        <el-table
          :data="dayList"
          height="100%"
          :show-header="false"
          :row-style="{ height: '60px' }"
          empty-text="当日暂无任务"
        >
          <el-table-column prop="businessCategoryId" label="计划">
            <template #default="scoped">
              <div class="task" @click="handlePerform(scoped.row)">
                <div class="plan-content">
                  <span
                    class="plan-type"
                    :style="{ backgroundColor: getPlanTypeColor(scoped.row.businessCategoryId) }"
                  >
                    <dc-dict
                      type="text"
                      :options="dictMaps?.DC_PMS_TEMPITEM_TYPE"
                      :value="scoped.row.businessCategoryId"
                      v-if="scoped.row.businessCategoryId"
                    />
                  </span>
                  <div class="plan-content-right">
                    <div class="plan-name">
                      {{ scoped.row.planName }}
                    </div>
                    <div class="plan-desc">{{ scoped.row.taskDescription || '-' }}</div>
                  </div>
                </div>
                <div>
                  <dc-dict
                    :options="dictMaps?.DC_PMS_PLAN_STATUS"
                    :value="scoped.row.planStatusId"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <planPerform ref="planPerformRef" mode="myTask" @confirm="getMonthData()" :projectInfo="info" />
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import Api from '@/api';
import { getPlanTypeColor } from '@/utils/util';
import dayjs from 'dayjs';
import planPerform from '@/views/pdp/project/detail/components/plan/components/planPerform.vue';

const { proxy } = getCurrentInstance();
const compData = reactive({
  loading: false,
  dictMaps: {},
  dateValue: new Date(),
  monthMap: {},
  dayList: [],
  calendar: null,
  info: {},
});
const { loading, dictMaps, dateValue, monthMap, dayList, calendar, info } = toRefs(compData);

// 字典或缓存数据
const getDictData = async () => {
  const res = await proxy.useAsyncCache([
    { key: 'DC_PMS_TEMPITEM_TYPE' },
    { key: 'DC_PMS_PLAN_STATUS' },
  ]);
  dictMaps.value = res?.value;
  return true;
};

watch(
  () => dateValue,
  () => {
    getDayData();
  },
  { deep: true }
);

onMounted(async () => {
  await getDictData();
  getDayData();
  getMonthData();
});

const getDayData = () => {
  loading.value = true;
  Api.desk.home
    .getMonthPlanHome({
      dateMonth: dayjs(dateValue.value).format('YYYY-MM-DD'),
    })
    .then(res => {
      const {
        code,
        data: { result },
      } = res.data;
      if (code === 200) {
        dayList.value = result;
      }
      loading.value = false;
    })
    .catch(err => {
      console.error(err);
      loading.value = false;
    });
};

const getClass = data => {
  const selectDay = dayjs(dateValue.value).format('YYYY-MM-DD');
  if (data.day === selectDay) {
    return ['is-selected'];
  }
};
const getMonthData = () => {
  loading.value = true;
  Api.desk.home
    .getMonthPlanHome({
      dateMonth: dayjs(dateValue.value).format('YYYY-MM'),
    })
    .then(res => {
      const {
        code,
        data: { dateMap },
      } = res.data;
      if (code === 200) {
        console.log();
        monthMap.value = dateMap;
      }
      loading.value = false;
    })
    .catch(err => {
      console.error(err);
      loading.value = false;
    });
};

const selectDate = val => {
  if (!calendar.value) return;
  calendar.value.selectDate(val);
  getMonthData();
  getDayData();
};

const planPerformRef = ref(null);
// 处理计划执行
const handlePerform = plan => {
  loading.value = true;
  Api.pdp.project
    .detail({ id: plan.projectId })
    .then(res => {
      const { code, data } = res.data;
      info.value = data;
      planPerformRef.value.openDrawer(plan);
      loading.value = false;
    })
    .catch(err => {
      loading.value = false;
    });
};
</script>
<style lang="scss" scoped>
.comp-schedule {
  box-sizing: border-box;
  padding: 20px;
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 14px;
  height: 332px;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    font-style: normal;
    text-transform: none;
    margin-bottom: 8px;
  }
  .comp-content {
    display: flex;
    height: 250px;
  }

  :deep(.el-calendar-day) {
    height: 30px;
    text-align: center;
    padding: 0;
    line-height: 30px;
    background: transparent !important;
  }
  :deep(.el-calendar-table tr td) {
    border: none;
  }
  :deep(.el-calendar__body) {
    padding: 0;
  }
  :deep(.el-calendar__header) {
    border-bottom: none;
    padding: 0;
  }

  .current-date {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    line-height: 14px;
    text-align: center;
    font-style: normal;
    text-transform: none;
  }
  :deep(.current) {
    background: transparent !important;
    .el-calendar-day:hover {
      background: transparent !important;
    }
  }
  .current-day {
    display: inline-flex;
    justify-items: center;
    align-items: center;
    padding: 5px;
    position: relative;
    font-weight: 400;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.9);
    font-style: normal;
    text-transform: none;
    height: 100%;
    &:hover {
      background-color: #f2f3ff;
    }
    &.is-selected {
      color: #f78431;
      background: #f2f3ff;
      border-radius: 3px 3px 3px 3px;
    }
    &.prev-month,
    &.next-month {
      color: rgba(0, 0, 0, 0.26);
    }
    .dot-icon {
      position: absolute;
      bottom: 3px;
      left: 50%;
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
    }
  }

  .calendar-header {
    width: 100%;
    align-content: center;
    align-items: center;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    .month {
      cursor: pointer;
      color: #666;
      font-size: 12px;
      font-weight: 600;
    }
  }
  .left {
    padding: 10px 10px 0 20px;
    position: relative;
    width: 40%;
    border-right: 1px solid #dadbe0;
  }
  .right {
    margin-left: 10px;
    width: 60%;
    height: 100%;
    :deep(.el-table__cell) {
      border-bottom: none;
    }
    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
    .task {
      display: flex;
      justify-content: space-between;
      .plan-content {
        display: flex;
        flex: 1;
        height: 100%;
        overflow: hidden;
        .plan-type {
          height: 20px;
        }
        &-right {
          flex: 1;
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          overflow: hidden;
          .plan-name {
            width: 100%;
            font-weight: 600;
            font-size: 14px;
            color: #333333;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
