<template>
  <basic-container>
    <div class="Manpower-maintenance">
      <div class="ManpowerTop">
        <div class="ManpowerTopTitle">
          <div class="manpowe-top-text">人力维护</div>
          <div><el-button type="primary" icon="Plus" @click="handleAdd">批量维护</el-button></div>
        </div>
      </div>
      <div class="Manpower">
        <div class="ManpowerLeft">
          <el-tree
            :data="treeData"
            :props="{
              children: 'children',
              label: 'label',
            }"
            :default-expanded-keys="defaultExpandedKeys"
            @node-click="handleNodeClick"
            node-key="id"
            :current-node-key="defaultCheckedKeys"
            :highlight-current="true"
            ref="tree"
          />
        </div>
        <div class="ManpowerRight" ref="myElement">
          <el-calendar
            v-model="calendarParams.calendarYearMonth"
            ref="calendar"
            class="rightCalender"
          >
            <template #header="{ date }">
              <el-button-group>
                <el-select
                  v-model="calendarParams.year"
                  @change="handleChangeDate"
                  placeholder="选择年份"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in yearOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>

                <el-select
                  v-model="calendarParams.month"
                  @change="handleChangeDate"
                  placeholder="选择月份"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in monthOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <button class="SverchBtn" @click="selectDate('today')">今天</button>
              </el-button-group>
              <div class="type-hints">
                <div class="hint-item">
                  <span class="hint-dot dot-bz"></span>
                  编制人力
                </div>
                <div class="hint-item">
                  <span class="hint-dot dot-jy"></span>
                  借用人力
                </div>
                <div class="hint-item">
                  <span class="hint-dot dot-mr"></span>
                  默认人力
                </div>
              </div>
            </template>
            <template #date-cell="{ data }">
              <div
                class="day-content"
                @click="handleUpdate(data.day)"
                :class="data.isSelected ? 'is-selected' : ''"
                :style="{
                  backgroundColor: scheduleData[data.day]?.colorCode,
                  height: elementHeight + 'px',
                }"
              >
                <div class="day-content-warp">
                  <div class="manpower-count" v-if="scheduleData[data.day]">
                    <span>●</span>
                    {{ scheduleData[data.day].manpowerQuantity }}
                  </div>
                  <div class="manpower-count-labor" v-if="scheduleData[data.day]">
                    <span>●</span>
                    {{ scheduleData[data.day].laborManpowerQuantity }}
                  </div>
                  <div class="manpower-count-default" v-if="!scheduleData[data.day]">
                    <span>●</span>
                    {{ treeOnly.manpowerQuantity + treeOnly.laborManpowerQuantity }}
                  </div>
                  <div class="total-count" v-if="scheduleData[data.day]">
                    <span>总计:</span>
                    {{
                      scheduleData[data.day].manpowerQuantity +
                      scheduleData[data.day].laborManpowerQuantity
                    }}
                  </div>
                  <div class="day-label">{{ data.day.split('-').slice(2).join('-') }}</div>
                </div>
              </div>
            </template>
          </el-calendar>
        </div>
      </div>
    </div>

    <el-drawer v-model="open" size="600px" :title="title" @close="cancel">
      <div v-if="infoDate && Object.keys(infoDate).length">
        <el-descriptions title="当前人力计划" :column="1">
          <el-descriptions-item label="编制人力：">{{
            infoDate.manpowerQuantity
          }}</el-descriptions-item>
          <el-descriptions-item label="借用人力：">
            {{ infoDate.laborManpowerQuantity }}</el-descriptions-item
          >
          <el-descriptions-item label="总人力：">
            {{ infoDate.manpowerQuantity + infoDate.laborManpowerQuantity }}</el-descriptions-item
          >
          <el-descriptions-item label="当前计划时间：">
            {{ infoDate.workStartDate }} - {{ infoDate.workEndDate }}</el-descriptions-item
          >
        </el-descriptions>
      </div>

      <h3>人力计划</h3>
      <el-form :model="formData">
        <el-form-item label="编制人力">
          <el-input-number v-model="formData.manpowerQuantity" :min="0" placeholder="请输入">
            <template #suffix>
              <span>人</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="借用人力">
          <el-input-number v-model="formData.laborManpowerQuantity" :min="0" placeholder="请输入">
            <template #suffix>
              <span>人</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="计划日期" class="el-form-item-timer">
          <el-date-picker
            v-model="formData.timers"
            type="daterange"
            range-separator="-"
            start-placeholder="请选择开始时间"
            end-placeholder="请选择结束时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>

<script setup>
import { onMounted, reactive, toRefs } from 'vue';
import Api from '@/api/index';
import dayjs from 'dayjs';
import { ref } from 'vue';

const calendar = ref(null);
const { proxy } = getCurrentInstance();

const data = reactive({
  treeData: [], // 树状数据
  formData: {},
  queryParams: {
    workGroupCode: '',
    workStartDate: '2024-01-01',
    workEndDate: '2027-01-01',
    current: 1,
    size: 10000,
  },
  // 日历参数
  calendarParams: {
    year: dayjs().format('YYYY'),
    month: dayjs().format('MM'),
    calendarYearMonth: dayjs().toDate('YYYY-MM-DD'),
  },
  title: '',
  loading: true,
  scheduleData: {}, // 日历数据
  open: false,
  timerQueryParams: {
    laborManpowerQuantity: 0,
    manpowerQuantity: 0,
  },
  defaultExpandedKeys: [],
  defaultCheckedKeys: '',
  yearOptions: [
    {
      value: '2024',
      label: '2024年',
    },
    {
      value: '2025',
      label: '2025年',
    },
    {
      value: '2026',
      label: '2026年',
    },
    {
      value: '2027',
      label: '2027年',
    },
  ],
  monthOptions: [
    { label: '1月', value: '01' },
    { label: '2月', value: '02' },
    { label: '3月', value: '03' },
    { label: '4月', value: '04' },
    { label: '5月', value: '05' },
    { label: '6月', value: '06' },
    { label: '7月', value: '07' },
    { label: '8月', value: '08' },
    { label: '9月', value: '09' },
    { label: '10月', value: '10' },
    { label: '11月', value: '11' },
    { label: '12月', value: '12' },
  ],
  treeOnly: '',
  infoDate: {},
});

const {
  treeData,
  queryParams,
  calendarParams,
  loading,
  scheduleData,
  open,
  formData,
  title,
  defaultExpandedKeys,
  defaultCheckedKeys,
  yearOptions,
  monthOptions,
  treeOnly,
  infoDate,
} = toRefs(data);

const myElement = ref(null); // 用于获取 DOM 元素的引用
const elementHeight = ref(0); // 存储高度

onMounted(async () => {
  // getData();
  await getList();
  await getWorkGroupInfo();
  if (myElement.value) {
    elementHeight.value = (myElement.value.offsetHeight - '130') / 5; // 获取元素高度
  }
});

const getWorkGroupInfo = async () => {
  const res = await Api.common.workGroup.getWorkGroupInfo();
  const { code, data } = res.data;
  if (code === 200) {
    // 默认展开的节点：展开第一个根节点
    defaultExpandedKeys.value = [data?.id];
    // 默认选中的节点：选中第一个根节点的第一个子节点
    defaultCheckedKeys.value = data?.id;
    queryParams.value.workGroupCode = data?.workGroupCode;
  }
};

// 获取日历列表
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.mps.manpowermaintenance.getWorkManpowerList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      scheduleData.value = {}; // 清空之前的数据，重新加载
      data.records.forEach(item => {
        scheduleData.value[dayjs(item.workDate).format('YYYY-MM-DD')] = item;
      });
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 获取右侧树状列表
const getList = async () => {
  try {
    loading.value = true;
    const res = await Api.mps.manpowermaintenance.getWorkManpowerTreeGroup();
    const { code, data } = res.data;
    if (code === 200) {
      // 结构化数据处理
      treeData.value = data.map(item => ({
        id: item.processCategoryCode,
        label: item.category,
        children: item.children.map(childItem => {
          if (!queryParams.value.workGroupCode) {
            queryParams.value.workGroupCode = childItem.workGroupCode;
            // 默认展开的节点：展开第一个根节点
            defaultExpandedKeys.value = [childItem.id];
            // 默认选中的节点：选中第一个根节点的第一个子节点
            defaultCheckedKeys.value = childItem.id;
            // 所有的树状
            treeOnly.value = childItem;
          }
          return {
            label: childItem.workGroupName,
            ...childItem,
          };
        }),
      }));

      getData();
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 打开添加弹窗
const handleAdd = () => {
  initAddData();
};

const initAddData = date => {
  // const [year, month] = date.split('-');
  // calendarParams.value = {
  //   year: year,
  //   month: month,
  // };

  formData.value = {
    workGroupCode: queryParams.value.workGroupCode,
    manpowerQuantity: treeOnly.value.manpowerQuantity,
    laborManpowerQuantity: treeOnly.value.laborManpowerQuantity,
    timers: [date, date],
  };
  title.value = '新增人力计划';
  open.value = true;
};

const initUpdateData = date => {
  // 编辑
  infoDate.value = scheduleData.value[date];
  formData.value = {
    laborManpowerQuantity: infoDate.value.laborManpowerQuantity,
    manpowerQuantity: infoDate.value.manpowerQuantity,
    timers: [infoDate.value.workStartDate, infoDate.value.workEndDate],
    workGroupCode: infoDate.value.workGroupCode,
  };
  title.value = '调整人力计划';
  open.value = true;
};

const initCancelData = () => {
  open.value = false;
  formData.value = {};
  infoDate.value = {};
};

// 新增提交
const submitForm = async () => {
  if (!formData.value.timers.length) return proxy.$message.error('请选择日期');
  const form = {
    ...formData.value,
    workStartDate: dayjs(formData.value.timers[0]).format('YYYY-MM-DD'),
    workEndDate: dayjs(formData.value.timers[1]).format('YYYY-MM-DD'),
  };
  delete form.timers;
  const res = await Api.mps.manpowermaintenance.postWorkManpowerInsert(form);
  const { code, msg } = res.data;
  if (code === 200) {
    getData();
    proxy.$message.success(msg);
    open.value = false;
  }
};

// 选择框变化
const handleChangeDate = () => {
  calendarParams.value.calendarYearMonth = dayjs(
    `${calendarParams.value.year}-${calendarParams.value.month}-1`
  ).toDate();
};

// 树状点击事件
const handleNodeClick = data => {
  if (data.workGroupCode) {
    queryParams.value = {
      workGroupCode: data.workGroupCode,
      workStartDate: '2024-01-01',
      workEndDate: '2027-01-01',
      current: 1,
      size: 10000,
    };
    getData();
    treeOnly.value = data;
  }
};

// 取消
const cancel = () => {
  initCancelData();
};

// 点击日历出现弹窗
const handleUpdate = async date => {
  if (scheduleData.value[date]) {
    initUpdateData(date);
  } else {
    initAddData(date);
  }
};

const selectDate = val => {
  if (!calendar.value) return;
  calendar.value.selectDate(val);
};
</script>

<style lang="scss">
.Manpower-maintenance {
  .el-calendar-table .el-calendar-day {
    height: 100% !important;
    padding: 0 !important;
  }

  :deep(.el-calendar__body) {
    height: calc(100% - 64px);
    padding: 0;
    .el-calendar-table {
      height: 100%;
      thead {
        height: 30px;
        line-height: 30px;
      }
      .rightCalenderItem {
        // display: flex;
        // flex-direction: column;
        justify-content: space-between;
        height: 100%;
        .CalenderItem {
          height: 100%;
        }
        h2 {
          margin: 0;
          padding: 16px 14px 0 0;
          float: right;
        }
        .rightCalenderItemContext {
          height: 100%;
          .calender-item-title {
            padding: 16px 0 0 11px;
          }
          .rightCalenderItemContextText {
            font-weight: 400;
            font-size: 16px;
            color: #333333;
            span {
              font-weight: 400;
              font-size: 20px;
              color: #333333;
            }
          }
        }
        .ManpowerRightElse {
          padding: 16px 0 0 11px;
        }
      }
    }
  }
}
</style>
<style scoped lang="scss">
.Manpower-maintenance {
  width: 100%;
  height: 100%;

  .ManpowerTop {
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #e1e2e5;
    .ManpowerTopTitle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .manpowe-top-text {
        font-weight: bold;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
      }
    }
  }
  .Manpower {
    display: flex;
    height: calc(100% - 50px);
    .ManpowerLeft {
      width: 240px;
      height: 100%;
      border-right: 1px solid #e1e2e5;
    }
    .ManpowerRight {
      width: 100%;
      height: 100%;

      .rightCalender {
        .day-content {
          padding: 0px;
          position: relative;
          .day-content-warp {
            padding: 5px;
          }

          .manpower-count,
          .manpower-count-labor,
          .manpower-count-default,
          .total-count {
            font-size: 20px;
            line-height: 20px;
            padding: 3px 0;
            color: #333;
            font-weight: 400;
          }
          .manpower-count span {
            font-size: 26px;
            padding-right: 3px;
            color: #1d65f3;
          }
          .manpower-count-labor span {
            font-size: 26px;
            color: #e37318;
          }
          .manpower-count-default span {
            font-size: 26px;
            color: #bbbbbb;
          }
          .total-count {
            height: 24px;
          }

          .total-count span {
            font-size: 16px;
          }

          .day-label {
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 22px;
            font-weight: 700;
          }
        }
      }

      .rightCalender {
        .el-calendar__header {
          height: 36px;
        }
        .type-hints {
          display: flex;
          align-items: center;
          gap: 10px;
          .hint-item {
            display: inline-flex;
            align-items: center;
            font-size: 18px;
            color: #050505;
            line-height: 32px;
            vertical-align: middle;

            .hint-dot {
              margin-right: 8px;
              width: 16px;
              height: 16px;
              border-radius: 50%;
            }
            .dot-bz {
              background: #1d65f3;
            }
            .dot-jy {
              background: #e37318;
            }
            .dot-mr {
              background: #bbbbbb;
            }
          }
        }

        .el-button-group {
          .SverchBtn {
            width: 64px;
            height: 32px;
            background: #f78431;
            border-radius: 3px 3px 3px 3px;
            border: none;
            font-weight: 400;
            font-size: 15px;
            color: #fff;
            line-height: 24px;
            text-align: center;
          }
        }
      }
    }
  }
}
.el-form-item-timer {
  width: 400px;
}
.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-date-picker .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}

.demo-date-picker .block:last-child {
  border-right: none;
}

.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
:deep(.el-select) {
  width: 92px;
  padding-right: 12px;
  text-align: center;
}
:deep(.el-calendar-table thead) {
  background: #e5e5e5;
}
</style>
