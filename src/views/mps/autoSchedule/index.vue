<template>
  <div class="app-container" v-loading="loading">
    <!-- <div class="page-head">
          <el-radio-group v-model="queryParams.type">
            <el-radio-button
              :label="label"
              :value="name"
              :key="index"
              v-for="({ label, name }, index) in tabOptions"
            />
          </el-radio-group>
        </div> -->

    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="80px"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="小组" prop="value">
        <el-select
          class="search-item"
          v-model="queryParams.groupCode"
          placeholder="请选择"
          filterable
          clearable
        >
          <el-option
            v-for="item in options"
            :key="item.workGroupCode"
            :label="item.workGroupName"
            :value="item.workGroupCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排程时间" prop="startDate">
        <dc-date-range
          v-model:startDate="queryParams.startDate"
          v-model:endDate="queryParams.endDate"
          :clearable="false"
          :disabledDate="disabledDate"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="info" @click="exportExcel" :disabled="!queryParams.groupCode">
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <div class="operate-container">
      <!--      <el-button type="primary" stze="mini" @click="submitWorkSchedule"> 自动排程 </el-button>-->
    </div>
    <div class="g-container">
      <div class="g-table" ref="tableRef" @scroll="handleTableScroll">
        <div class="g-table-content">
          <div class="g-table_head">组别</div>
          <div v-for="(barGroup, index) in dataList" :key="index" class="g-table_content">
            <div
              class="g-table-group"
              :style="{
                height: `${barGroup.maxIndex * rowHeight}px`,
              }"
            >
              {{ barGroup.groupName }}
            </div>
            <div class="g-table-hour">工时</div>
            <div class="g-table-count">人力</div>
          </div>
        </div>
      </div>
      <div class="g-content" ref="gContent" @scroll="handleContentScroll">
        <g-gantt-chart
          :chart-start="chartStart"
          :chart-end="chartEnd"
          precision="day"
          :row-height="rowHeight"
          grid
          current-time
          current-time-label="今天"
          :width="chartWidth"
          bar-start="startDate"
          bar-end="_endDate"
          :date-format="format"
          @dragend-bar="onDragendBar($event.bar, $event.e, $event.movedBars)"
        >
          <g-gantt-row
            v-for="(barGroup, index) in groupsData"
            :key="index"
            label=""
            :bars="barGroup.bars"
            :work-hour-list="barGroup.workHourList"
            :standard-worke-hours="barGroup.standardWorkeHours"
          />
        </g-gantt-chart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, reactive, computed, onMounted } from 'vue';
import store from '@/store/index';
import Api from '@/api/index';
import dayjs from 'dayjs';
import {
  getBarDayWorkHour,
  getDailyWorkHours,
  getTotalDays,
  getColorByDate,
  assignRowIndexes,
  initChartData,
} from './data';
import { GGanttChart, GGanttRow } from './vue-ganttastic';
import { downloadFileBlob } from '@/utils/util';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';

const { proxy } = getCurrentInstance();
const format = ref('YYYY-MM-DD');

const pageData = reactive({
  loading: false,
  rowHeight: 50,
  chartStart: '',
  chartEnd: '',
  dataList: [],
  queryParams: {
    type: '',
    groupCode: '',
    startDate: '',
    endDate: '',
  },
  dateInterval: {},
  options: [],
  tableRef: null,
  gContent: null,
});
const {
  loading,
  rowHeight,
  chartStart,
  chartEnd,
  dataList,
  queryParams,
  options,
  dateInterval,
  tableRef,
  gContent,
} = toRefs(pageData);

// 计算图表的宽度
const chartWidth = computed(() => {
  return getTotalDays(chartStart.value.toString(), chartEnd.value.toString()) * 50 + 'px';
});

// 用户信息
const userInfo = computed(() => store.getters.userInfo);

const groupsData = computed(() => {
  dataList.value.forEach(groupItem => {
    const { bars } = groupItem;
    bars.forEach(barItem => {
      barItem.dayWorkHour = getBarDayWorkHour(barItem);
      // 总天数
      barItem.totalDays = getTotalDays(barItem.startDate, barItem._endDate);
      barItem.ganttBarConfig = {
        hasHandles: true,
        id: barItem.id,
        style: {
          background: getColorByDate(barItem._endDate),
        },
        html: `<div class="bar-desc ellipsis" title="${barItem.projectNumber}\n${
          barItem.billNumber
        }\n${barItem.productionGroup}\n${barItem.materialName}\n总工时${
          barItem.processTime
        }H\n工期${getTotalDays(barItem.startDate, barItem._endDate)}天">
            ${barItem.projectNumber} ${barItem.billNumber} ${barItem.productionGroup} ${
          barItem.materialName
        }
            总工时${barItem.processTime}H
            工期${getTotalDays(barItem.startDate, barItem._endDate)}天
          </div>`,
      };
    });
    // 格式化
    Object.keys(groupItem.standardWorkeHours).forEach(key => {
      let workItem = groupItem.standardWorkeHours[key];
      workItem.floatMaterialHour = workItem.materialHour;
      workItem.floatExtraCount = workItem.extraCount;
      groupItem.standardWorkeHours[dayjs(key).format('YYYY-MM-DD')] = workItem;
    });

    groupItem.maxIndex = assignRowIndexes(bars);
  });
  return dataList.value;
});

onMounted(async () => {
  await getOptions();
  await getWorkGroupInfo();
  await getData();
});

const getWorkGroupInfo = async () => {
  const res = await Api.common.workGroup.getWorkGroupInfo();
  const { code, data } = res.data;
  if (code === 200) {
    queryParams.value.groupCode = data?.workGroupCode;
  }
};

// 获取数据
const getData = async () => {
  try {
    // if (!queryParams.value.groupCode)
    //   return proxy.$message({
    //     type: 'warning',
    //     message: '请选择专案号',
    //   });
    if (!queryParams.value.startDate || !queryParams.value.endDate)
      return proxy.$message({
        type: 'warning',
        message: '请选择排成时间',
      });
    loading.value = true;
    const res = await Api.mps.gantt.getMpsWorkSchedules(queryParams.value);
    const { data, code } = res.data;
    if (code === 200) {
      initChartData({
        dataList: data,
        chartStart: chartStart.value,
        format: format.value,
      });
      dataList.value = data;
    }
    initLocation();

    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 自动排程接口
const submitWorkSchedule = async () => {
  loading.value = true;
  try {
    const res = await Api.mps.gantt.postAutoSchedule();
    const { code, msg } = res.data;
    if (code === 200) {
      await getData();
      proxy.$message.success(msg);
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 修改排程
const editMoSchedule = async bar => {
  const { id, startDate, _endDate, processTime } = bar;
  const endDate = dayjs(_endDate).subtract(1, 'day').format(format.value);
  const dayProcessTime = Math.ceil(
    getBarDayWorkHour({
      processTime,
      startDate,
      _endDate: endDate,
    })
  );
  const params = {
    id,
    startDate,
    dayProcessTime,
    endDate,
    userId: userInfo.value.user_id,
  };
  try {
    loading.value = true;
    const res = await Api.mps.gantt.updateMoSchedule(params);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 获取时间区间
const getOptions = async () => {
  await getGanttDate();
  await getWorkGroup();
};

// 获取时间区间
const getGanttDate = async () => {
  const res = await Api.mps.gantt.getGanttDate();
  const { code, data } = res.data;
  if (code === 200) {
    chartStart.value = dayjs(data.startDate).format('YYYY-MM-DD').toString();
    chartEnd.value = dayjs(data.endDate).add(1, 'day').format('YYYY-MM-DD').toString();
    queryParams.value.startDate = chartStart.value;
    queryParams.value.endDate = chartEnd.value;
    dateInterval.value = data;
  }
};

// 获取专案号列表
const getWorkGroup = async () => {
  const res = await Api.mps.workGroup.list({
    current: 1,
    size: 100000,
  });
  const { code, data } = res.data;
  if (code === 200) {
    options.value = data.records;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm('queryRef');
  handleQuery();
};

const onDragendBar = bar => {
  editMoSchedule(bar);
};

const exportExcel = async () => {
  try {
    const group = options.value.find(item => item.workGroupCode === queryParams.value.groupCode);
    const res = await exportBlob('/blade-bip/mps/work-schedule/excel-export', {
      productionGroupCode: queryParams.value.groupCode,
      startDate: queryParams.value.startDate,
      endDate: queryParams.value.endDate,
    });
    downloadXls(
      res.data,
      `${group?.workGroupName} ${queryParams.value?.startDate}-${queryParams.value?.endDate}`
    );
  } catch (err) {
    proxy.$message.error('下载异常', err);
  }
};

const handleTableScroll = () => {
  if (gContent.value && tableRef.value) {
    const scrollTop = tableRef.value.scrollTop;
    gContent.value.scrollTop = scrollTop; // 同步左侧表格的滚动位置
  }
};

const handleContentScroll = event => {
  if (gContent.value && tableRef.value) {
    const scrollTop = gContent.value.scrollTop;
    tableRef.value.scrollTop = scrollTop; // 同步左侧表格的滚动位置
  }
};

const initLocation = () => {
  // 获取当天日期
  const today = dayjs();
  // 计算区间天数
  const intervalDays = today.diff(dayjs(chartStart.value), 'day');

  gContent.value.scrollLeft = (intervalDays - 5) * 50;
};

// 可选日期范围
const disabledDate = time => {
  if (!time) return false;
  const start = dayjs(chartStart.value).valueOf();
  const end = dayjs(chartEnd.value).valueOf();
  const current = time.getTime();
  return current < start || current > end;
};
</script>
<style lang="scss" scoped>
.page-head {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  padding-top: 12px;
  font-weight: bold;
  font-size: 16px;
  color: #333;

  .el-radio-group {
    margin-right: 10px;
    flex: 1;
  }
}
</style>
<style lang="scss">
.bar-desc {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: -16px;
  font-size: 12px;
  color: #666;
}

.search-item {
  width: 220px !important;
}
</style>
<style lang="scss" scoped>
.g-container {
  overflow: hidden;
  width: 100%;
  flex: 1;
  display: flex;
  .g-table {
    padding-bottom: 8px;
    width: 165px;
    height: 100%;
    overflow: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
    &-content {
      width: 165px;
    }
    &_head {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 72px;
      font-size: 14px;
      color: #666;
      box-sizing: border-box;
      background: #f7f6f5;
      .g-table_content {
        background-color: #fff;
      }
    }
    &-group {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      color: #333;
    }
    &-count,
    &-hour {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      color: #666;
      height: 36px;
      background: #f7f6f5;
    }
  }
  .g-content {
    flex: 1;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #848488;
      border-radius: 10px;
    }
  }
}

.bar-desc {
  position: absolute;
  left: 0;
  bottom: -16px;
  font-size: 12px;
  color: #666;
}
</style>
