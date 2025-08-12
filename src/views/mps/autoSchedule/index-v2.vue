<template>
  <div class="content-warp" v-loading="loading">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="getData"
    >
      <el-form-item label="专案号" prop="motNo">
        <el-select
          class="search-item"
          v-model="queryParams.motNo"
          placeholder="请选择专案号"
          :remote-method="remoteMethod"
          filterable
          remote
          clearable
        >
          <el-option v-for="item in moList" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="小组" prop="groupCode">
        <el-select
          class="search-item"
          v-model="queryParams.groupCode"
          placeholder="请选择小组"
          filterable
          clearable
        >
          <template #label="scoped">
            <div class="group-item">
              {{ scoped.label }}
            </div>
          </template>
          <el-option
            v-for="item in options"
            :key="item.workGroupCode"
            :label="item.workGroupName"
            :value="item.workGroupCode"
          >
            <div class="group-item">
              {{ item.workGroupName }}
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="isComplete">
        <el-select
          class="search-item"
          v-model="queryParams.isComplete"
          placeholder="请选择状态"
          clearable
        >
          <el-option label="未完成" :value="true" />
          <el-option label="全部" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="排程时间" prop="startDate">
        <dc-date-range
          v-model:startDate="queryParams.startDate"
          v-model:endDate="queryParams.endDate"
          :clearable="false"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getData">查找</el-button>
      </el-form-item>
    </el-form>
    <div id="gantt-group" ref="ganttRef" @click="handleClick"></div>
  </div>
  <drawer ref="drawerRef" />
</template>
<script setup name="ProjectSchedule">
import { onMounted, toRefs, shallowRef } from 'vue';
import dayjs from 'dayjs';
import Api from '@/api/index';
import { calculateChildPositionsV2, adjustRowIndexV2 } from '@/utils/gantt';
import drawer from './components/drawer.vue';
import { gantt } from 'dhtmlx-gantt';

const { proxy } = getCurrentInstance();

let pageData = reactive({
  loading: false,
  queryParams: {
    isComplete: true,
  },
  planData: {},
  columnWidth: 60,
  rowHeight: 55,
  // 小组列表
  options: [],
  // 专案号
  moList: [],
  drawerRef: null,
  ganttRef: null,
});

let {
  loading,
  queryParams,
  planData,
  columnWidth,
  rowHeight,
  options,
  moList,
  drawerRef,
  ganttRef,
} = toRefs(pageData);

const ganttInstance = shallowRef(null);

onMounted(async () => {
  if (ganttRef.value) ganttInstance.value = gantt;
  loading.value = true;
  initGantt();
  await getDate();
  await getWorkGroupInfo();
  await getData();
  loading.value = false;
  getOptions();
});

// 获取数据
const getData = async () => {
  try {
    if (!queryParams.value.startDate || !queryParams.value.endDate)
      return proxy.$message({
        type: 'warning',
        message: '请选择排成时间',
      });
    loading.value = true;
    const res = await Api.mps.gantt.getMpsWorkSchedules(queryParams.value);
    let { code, data: resData } = res.data;
    if (code === 200) {
      planData.value.data = resData.map(item => {
        item.start_date = item.startDate;
        item.end_date = item.endDate;
        item.children.forEach(child => {
          child.start_date = child.startDate;
          child.end_date = child.endDate;
        });
        item.children = item.children.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        );
        item = calculateChildPositionsV2(item);
        item.children = adjustRowIndexV2(item.children);
        item.maxRow = Math.max(...item.children.map(item => item.rowIndex));
        item.children.forEach(bar => {
          bar.width = bar.total_days * columnWidth.value;
          bar.background = proxy.hexToRgba(bar.color);
          if (bar.progress) {
            try {
              bar.progress = Number(bar.progress);
            } catch (error) {
              bar.progress = 0;
            }
          } else {
            bar.progress = 0;
          }
        });
        return {
          ...item,
          row_height: 90 + item.maxRow * rowHeight.value,
          text: `<div class='task-title'>
            <div class='task-name'> ${item.projectNumber}
              <div class='count'>
                x${item?.number}
              </div> </div>
            <div class='task-desc' title='${item?.materialName}'> ${item?.materialName || ''} </div>
          </div>`,
          start_date: new Date(dayjs(item.start_date)),
          end_date: new Date(dayjs(item.end_date).add(1, 'day')),
        };
      });
      updateGanttData();
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 获取时间区间
const getOptions = async () => {
  await getMoList();
  await getWorkGroup();
};

// 获取当前用户小组详情
const getWorkGroupInfo = async () => {
  const res = await Api.common.workGroup.getWorkGroupInfo();
  const { code, data } = res.data;
  if (code === 200) {
    queryParams.value.groupCode = data?.workGroupCode;
  }
};

// 获取小组列表
const getWorkGroup = async () => {
  const res = await Api.mps.workGroup.list({
    current: 1,
    size: 100000,
    isEnable: 1,
  });
  const { code, data: resData } = res.data;
  if (code === 200) {
    options.value = resData.records;
  }
};

// 初始化甘特图
const initGantt = () => {
  initGanttConfig();
  initGanttEvent();
};

// 初始化甘特图配置
const initGanttConfig = () => {
  ganttInstance.value.config.start_date = queryParams.value.startDate; // 甘特图起始时间
  ganttInstance.value.config.end_date = queryParams.value.endDate; // 甘特图结束时间
  ganttInstance.value.config.grid_width = 216;
  ganttInstance.value.i18n.setLocale('cn');
  ganttInstance.value.plugins({
    multiselect: true,
    undo: true,
    marker: true,
  });
  ganttInstance.value.config.scales = [
    { unit: 'month', step: 1, format: '%Y年%M', height: 20 },
    { unit: 'day', step: 1, format: '%j' },
  ];
  ganttInstance.value.config.scale_height = 72; // head高度
  ganttInstance.value.config.links_drag = false; // 禁用连接线拖拽
  ganttInstance.value.config.readonly = false; // 只读模式
  ganttInstance.value.config.min_column_width = columnWidth.value;
  ganttInstance.value.config.layout = {
    css: 'gantt_container',
    rows: [
      {
        cols: [
          {
            view: 'grid',
            group: 'grids',
            scrollY: 'scrollVer',
          },
          { resizer: true, width: 1, group: 'vertical' },
          {
            view: 'timeline',
            id: 'timeline',
            scrollX: 'scrollHor',
            scrollY: 'scrollVer',
          },
          { view: 'scrollbar', id: 'scrollVer', group: 'vertical' },
        ],
        gravity: 3,
      },
      { view: 'scrollbar', id: 'scrollHor' },
    ],
  };
  // 隐藏某列（移除配置项）
  ganttInstance.value.config.columns = ganttInstance.value.config.columns.filter(
    col => col.name === 'text'
  );
  // 任务条文本样式
  ganttInstance.value.templates.task_text = (start, end, task) => getTemplate(task);
  ganttInstance.value.init(ganttRef.value);
  //  ganttInstance.value.parse(planData.value);
};

// 初始化甘特图监听方法
const initGanttEvent = () => {
  const eventArrs = [];
  eventArrs[0] = ganttInstance.value.attachEvent('onTaskDblClick', (id, e) => false); //  禁止点击弹窗
  eventArrs[1] = ganttInstance.value.attachEvent('onBeforeLinkAdd', link => false); // 禁止添加连接
  eventArrs[2] = ganttInstance.value.attachEvent('onGridEditStart', state => false); // 禁止编辑
  eventArrs[3] = ganttInstance.value.attachEvent('onBeforeTaskDrag', id => false); // 拖拽前
  proxy.$store.dispatch('UpdateEventArrs', eventArrs);
};

// 更新甘特图
const updateGanttData = () => {
  ganttInstance.value.clearAll();
  ganttInstance.value.parse(planData.value);
  ganttInstance.value.addMarker({
    start_date: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    css: 'today-line',
  });
  const timer = setInterval(() => {
    let ganTT = document.getElementsByClassName('gantt_marker');
    if (!!ganTT[0]?.offsetLeft) {
      ganttInstance.value.scrollTo(ganTT[0].offsetLeft - 450, null);
      clearInterval(timer);
    }
  }, 500);
};

// 获取日期
const getDate = async () => {
  const res = await Api.mps.gantt.getGanttDate();
  const { code } = res.data;
  if (code === 200) {
    queryParams.value = { ...res.data.data, isComplete: true };
  }
};

// 获取模板
const getTemplate = task => {
  if (task && Array.isArray(task.children)) {
    const doms = task.children.map(item => {
      return `<div class="bar-item"
        data-id="${item.id}"
        style="
          top: ${rowHeight.value * item.rowIndex}px;
          left: ${item.start_position * columnWidth.value}px;
          width: ${item.width}px;
          background: ${item.background};
        ">
        ${initSvg(item)}
      </div>`;
    });
    return `<div class="bars-container">${doms}</div>`;
  }
};

const initSvg = bar => {
  const { isComplete, background, progress } = bar;
  const htmlText = isComplete
    ? `<path
        d="M5.5 8.5 L7 10 L10.5 6"
        stroke="${background}"
        stroke-width="0.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        id="checkmark"
      />`
    : `<text
        x="8"
        y="8"
        text-anchor="middle"
        alignment-baseline="middle"
        font-size="3"
        fill="${background}"
        id="progress-text"
      >
        ${progress}%
      </text>`;
  return `
      <div class="progress-warp"">
        <div class="circle-wrap">
          <svg class="circle" width="40" height="40" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆环 -->
            <circle cx="8" cy="8" r="6" stroke="${background}" stroke-width="2" fill="none" opacity="0.3"/>
            <!-- 动态进度圆环 -->
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="${background}"
              stroke-width="2"
              fill="none"
              stroke-dasharray="37.7"
              stroke-dashoffset="${getProgress(progress)}"
              stroke-linecap="round"
              transform="rotate(-90 8 8)"
              id="progress-circle"
            />
            ${htmlText}
          </svg>
          <div class="text">${bar?.processName} ${bar?.workGroupName}</div>
        </div>
      </div>
      `;
};

// 动态设置进度
const getProgress = progress => {
  progress = Math.min(progress, 100);
  const circumference = 2 * Math.PI * 6; // 圆周长
  const offset = circumference - (progress / 100) * circumference;
  return offset;
};

// 事件代理，捕获点击事件
const handleClick = event => {
  const target = event.target.closest('.bar-item');
  if (target) {
    const { id } = target.dataset;
    if (id) {
      drawerRef.value.openDrawer(id);
    }
  }
};

// 获取专案号
const getMoList = async () => {
  const res = await Api.mps.plan.getPlanMto();
  const { code } = res.data;
  if (code === 200) {
    moList.value = res.data.data;
  }
};

const remoteMethod = async query => {
  if (query) {
    queryParams.value.motNo = query;
    const res = await Api.mps.plan.getPlanMto({ mto: query });
    const { code } = res.data;
    if (code === 200) {
      moList.value = res.data.data;
    }
  }
};
</script>

<style lang="scss">
.content-warp #gantt-group .gantt_layout .gantt_grid_head_cell {
  font-size: 0 !important;
  &::before {
    content: '专案号';
    font-size: 16px !important;
  }
}
.content-warp #gantt-group {
  width: 100%;
  flex: 1;
  overflow: hidden;
  .gantt_layout {
    &:nth-child(1) {
      .gantt_row,
      .gantt_grid_data {
        background-color: #f7f6f5;
      }
    }
    /* 隐藏列分隔线 修改默认样式 */
    .gantt_scale_cell,
    .gantt_grid_head_cell {
      background-color: #f7f6f5;
      font-size: 14px;
      color: #666;
      // border: none !important;
    }
    .gantt_task_cell {
      // border: none !important;
    }
    /* 隐藏连接线 */
    .gantt_link_control {
      display: none !important;
    }
    // 任务条样式
    .gantt_bar_task {
      margin-top: 25px !important;
      border-radius: 30px !important;
      background-color: unset !important;
      height: 24px !important;
      transform: translateY(4px) !important;
      .gantt_task_progress_drag {
        display: none !important;
      }

      // 内容
      .gantt_task_content {
        overflow: unset;
        .bars-container {
          position: relative;
          width: 100%;
          height: 24px;
          background: transparent !important;
          .bar-item {
            position: absolute;
            height: 100%;
            border-radius: 12px;
            .circle-wrap {
              margin-top: -10px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-around;
              height: 54px;
              font-size: 12px;
              color: #333;
              .circle {
                border-radius: 50%;
                background-color: #fff;
              }
              .text {
                height: 12px;
                line-height: 12px;
              }
            }
          }
        }
      }
    }
  }
  .gantt_grid_scale,
  .gantt_task_scale {
    // border-bottom: none;
  }
  // 选中行的背景色
  .gantt_task_row.odd.gantt_selected,
  .gantt_task_row.gantt_selected {
    background: unset;
  }
  //胶囊色
  .task_left,
  .task_start_date,
  .task_right,
  .task_end_date {
    display: none;
  }
  .task_left,
  .task_start_date {
    left: 0;
  }
  .task_right,
  .task_end_date {
    right: 0;
  }
}
</style>
<style>
@import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
</style>
<style lang="scss" scoped>
:deep(.el-form-item__content) {
  width: 240px;
}
.group-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.content-warp {
  display: flex;
  flex-direction: column;
  &-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 16px;
    color: #333;
  }
}
</style>
