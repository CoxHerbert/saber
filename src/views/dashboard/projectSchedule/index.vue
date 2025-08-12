<template>
  <div class="dashboard-container" v-loading="loading">
    <div class="dashboard-head">
      <div class="logo-wrap">
        <img class="logo-img" src="/img/logo-v2.png" alt="" />
      </div>
      <img class="title" src="/img/dashboard/gantt-title.png" alt="" />
      <div class="button-group">
        <el-button @click="cycle('last')" :disabled="current === pages.minPage">上一周期</el-button>
        <el-button type="primary">
          {{ dayjs(dateRange.startDate || '').format('YYYY/MM/DD') }} -
          {{ dayjs(dateRange.endDate || '').format('YYYY/MM/DD') }}
        </el-button>
        <el-button @click="cycle('next')" :disabled="current === pages.maxPage">下一周期</el-button>
      </div>
    </div>
    <div class="dashboard-body">
      <div class="gantt-box">
        <div id="gantt_here" ref="ganttRef"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, toRefs } from 'vue';
import { gantt } from 'dhtmlx-gantt';
import dayjs from 'dayjs';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const route = useRoute();

let pageData = reactive({
  // 加载
  loading: false,
  // 查询字段
  queryParams: {},
  // 计划数据
  planData: {},
  // 展示区间
  dateRange: {
    startDate: null,
    endDate: null,
  },
  // 当天
  currentDate: null,
  // 当前页
  current: 0,
  // 总页数
  pages: {
    minPage: null,
    endDate: null,
  },
  columnWidth: 50,
  rowHeight: 65,
  timeInterval: null,
  timeInterval2: null,
  eventArrs: [],
  timer: null,
});

let {
  loading,
  queryParams,
  planData,
  dateRange,
  currentDate,
  current,
  pages,
  columnWidth,
  rowHeight,
  timeInterval,
  timeInterval2,
  eventArrs,
  timer,
} = toRefs(pageData);

let ganttRef = ref(null);

onMounted(async () => {
  initDate();
  await getDate();
  await getData();
  initGantt();
  // 这里可以调用 API 刷新数据
  timer.value = setInterval(() => {
    location.reload();
  }, 3 * 60 * 60 * 1000);
});

onUnmounted(() => {
  destroyTimer();
  clearInterval(timer.value);
});

// 获取日期
const getDate = async () => {
  const res = await Api.mps.plan.getPlanDate();
  const { code } = res.data;
  if (code === 200) {
    queryParams.value = res.data.data;
    pages.value = calculateMinMaxPages({
      ...queryParams.value,
      today: currentDate.value,
    });
  }
};

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    let res = await Api.mps.plan.getPlanIndex3({
      ...queryParams.value,
      left: columnWidth.value,
      ...route.query,
    });
    let { code } = res.data;
    if (code === 200) {
      const { bars } = res.data.data;
      loading.value = false;
      planData.value.data = bars.map(item => {
        if (item.level === 1) {
          item.row_height = rowHeight.value * item.maxIndex;
        }
        return {
          ...item,
          start_date: new Date(dayjs(item.startDate)),
          end_date: new Date(dayjs(item.endDate).add(1, 'day')),
          progressRound: item.progress || 0,
          progress: calculatePercentage(item.startDate, item.endDate),
          text: `<div class='task-title'>
              <div class='task-name'>
                ${item?.text}${item?.qty ? 'x' : ''}${item?.qty}
              </div>
              <div class='task-desc' title='${item?.materialName}'> ${item?.materialName} </div>
            </div>`,
          open: true,
        };
      });
    }
  } catch (error) {
    loading.value = false;
  }
};

// 初始化日期
const initDate = () => {
  current.value = 0;
  currentDate.value = dayjs().format('YYYY-MM-DD');
  dateRange.value.startDate = dayjs(currentDate.value).subtract(15, 'day').format('YYYY-MM-DD');
  dateRange.value.endDate = dayjs(currentDate.value).add(29, 'day').format('YYYY-MM-DD');
};

// 初始化甘特图
const initGantt = () => {
  initGanttConfig();
  initGanttEvent();
};

// 初始化甘特图
const initGanttConfig = () => {
  gantt.config.start_date = queryParams.value.startDate; // 甘特图起始时间
  gantt.config.end_date = queryParams.value.endDate; // 甘特图结束时间
  gantt.config.grid_width = 216;
  gantt.i18n.setLocale('cn');
  gantt.plugins({
    multiselect: true,
    undo: true,
    marker: true,
  });
  gantt.config.scales = [
    { unit: 'month', step: 1, format: '%Y年%M', height: 20 },
    { unit: 'day', step: 1, format: '%j' },
  ];
  gantt.config.scale_height = 72; // head高度
  gantt.config.links_drag = false; // 禁用连接线拖拽
  gantt.config.readonly = false; // 只读模式
  gantt.config.dblclick_create = false;
  gantt.config.min_column_width = columnWidth.value;
  gantt.config.columns = [
    {
      name: 'text',
      label: '专案号',
      width: 216,
      template: obj => obj.text,
    },
  ];
  gantt.config.layout = {
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
      },
      { view: 'scrollbar', id: 'scrollHor' },
    ],
  };
  gantt.addMarker({
    start_date: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    css: 'today-line',
  });
  // 隐藏某列（移除配置项）
  // gantt.config.columns = gantt.config.columns.filter(col => col.name === 'text');
  // 任务条文本样式
  gantt.templates.task_text = (start, end, task) => getTemplate(task);
  // 任务条名称
  gantt.templates.task_class = (start, end, task) => {
    if (task.completionStatus === '已完成') return 'gantt_bar_task-state_3';
    if (task.completionStatus === '进行中') return 'gantt_bar_task-state_1';
    if (task.completionStatus === '逾期') return 'gantt_bar_task-state_2';
  };
  gantt.init(ganttRef.value);
  gantt.parse(planData.value);
  const container = document.querySelector('#gantt_here .gantt_task_bg').offsetHeight;
  const container2 = document.querySelector('#gantt_here .gantt_data_area').offsetHeight;
  const showHeight = container - container2;
  let height2 = 0;
  timeInterval.value = setInterval(() => {
    height2 += 3;
    if (showHeight < height2) height2 = 0;
    gantt.scrollTo(null, height2);
  }, 120);
  timeInterval2.value = setInterval(() => {
    let ganTT = document.getElementsByClassName('gantt_marker');
    if (ganTT && ganTT[0] && ganTT[0]?.offsetLeft) {
      gantt.scrollTo(ganTT[0].offsetLeft - 750, null);
      clearInterval(timeInterval2.value);
    }
  }, 100);
};

// 初始化甘特图监听方法
const initGanttEvent = () => {
  eventArrs.value[0] = gantt.attachEvent('onTaskDblClick', (id, e) => false); //  禁止点击弹窗
  eventArrs.value[1] = gantt.attachEvent('onBeforeLinkAdd', link => false); // 禁止添加连接
  eventArrs.value[2] = gantt.attachEvent('onGridEditStart', state => false); // 禁止编辑
  eventArrs.value[3] = gantt.attachEvent('onBeforeTaskDrag', id => false); // 拖拽前
};

const destroyTimer = () => {
  clearInterval(timeInterval.value);
  eventArrs.value.forEach(eventId => {
    gantt.detachEvent(eventId);
  });
};

// 周期切换
const cycle = type => {
  let ganTT = document.getElementsByClassName('gantt_marker');
  switch (type) {
    case 'last':
      current.value--;
      gantt.scrollTo(ganTT[0].offsetLeft - 750 + current.value * 2250, null);
      break;
    case 'next':
      current.value++;
      gantt.scrollTo(ganTT[0].offsetLeft - 750 + current.value * 2250, null);
      break;
  }
};

// 动态设置进度
const getProgress = progress => {
  progress = Math.min(progress, 100);
  const circumference = 2 * Math.PI * 6; // 圆周长
  const offset = circumference - (progress / 100) * circumference;
  return offset;
};

// 传入开始结束时间 根据开始时间计算到当天计算出百分比
const calculatePercentage = (startTime, endTime) => {
  const start = dayjs(startTime); // 解析开始时间
  const end = dayjs(endTime); // 解析结束时间
  const now = dayjs(); // 获取当前时间
  // 如果当前时间在开始时间之前，返回0%
  if (now.isBefore(start)) return 0;

  // 如果当前时间等于或晚于结束时间，返回100%
  if (now.isSameOrAfter(end)) return 1;

  // 计算从开始时间到当前时间（包括当天）的天数
  const elapsedTime = now.diff(start, 'day') + 1;
  // 计算从开始时间到结束时间（包括结束当天）的总天数
  const totalTime = end.diff(start, 'day') + 1;

  // 计算当前时间占总天数的百分比
  const percentage = elapsedTime / totalTime;
  return percentage.toFixed(16);
};

// 模板
const getTemplate = task => {
  return `<div class="task-level_1" style="left: 0;height: ${task.maxIndex * rowHeight.value}px;">
      ${initSvg({ data: task.planSchduleMtoVoList })}
    </div>`;
};

// 初始化svg
const initSvg = ({ data }) => {
  return data
    .map(item => {
      const { percent, name, color, left, index, progress } = item;
      const top = rowHeight.value * (index - 1);
      const htmlText =
        progress === '延期' || progress === '进行中'
          ? `<text
            x="8"
            y="8"
            text-anchor="middle"
            alignment-baseline="middle"
            font-size="3"
            fill="${color}"
            id="progress-text"
          >
            ${percent}%
          </text>`
          : `<path
              d="M5.5 8.5 L7 10 L10.5 6"
              stroke="${color}"
              stroke-width="0.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              id="checkmark"
            />`;
      return `
      <div class="progress-warp" style="top: ${top}px; left: ${left || 0}px;">
        <div class="circle-wrap">
          <svg class="circle" width="40" height="40" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆环 -->
            <circle cx="8" cy="8" r="6" stroke="${color}" stroke-width="2" fill="none" opacity="0.3"/>
            <!-- 动态进度圆环 -->
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="${color}"
              stroke-width="2"
              fill="none"
              stroke-dasharray="37.7"
              stroke-dashoffset="${getProgress(percent)}"
              stroke-linecap="round"
              transform="rotate(-90 8 8)"
              id="progress-circle"
            />
            ${htmlText}
          </svg>
          <div class="text">${name}</div>
        </div>
      </div>
      `;
    })
    .join('');
};

const calculateMinMaxPages = ({ startDate, endDate, today }) => {
  const pageLength = 45; // 每一页包含的天数

  // 计算第0页的时间范围
  const page0Start = dayjs(today).subtract(15, 'day');
  const page0End = dayjs(today).add(30, 'day');

  return {
    minPage: Math.floor(dayjs(startDate).diff(page0Start, 'day') / pageLength),
    maxPage: Math.ceil(dayjs(endDate).diff(page0End, 'day') / pageLength),
  };
};
</script>

<style lang="scss">
.gantt-box {
  #gantt_here {
    width: 100%;
    height: 100%;
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
      }
      .gantt_task_cell {
        border: none !important;
      }
      /* 隐藏连接线 */
      .gantt_link_control {
        display: none !important;
      }
      // 任务条样式
      .gantt_bar_task {
        border-radius: 30px !important;
        background-color: unset !important;
        height: 20px !important;
        margin-top: 10px;
        &-state {
          &_1 {
            // 进度条样式
            .gantt_task_progress_wrapper {
              background-color: #d2e0fd !important;
              .gantt_task_progress {
                background-color: #1d65f3 !important;
              }
            }
          }
          &_2 {
            // 进度条样式
            .gantt_task_progress_wrapper {
              background-color: #fce9eb !important;
              .gantt_task_progress {
                background-color: #e12137 !important;
              }
            }
          }
          &_3 {
            // 进度条样式
            .gantt_task_progress_wrapper {
              background-color: #d3f3ec !important;
              .gantt_task_progress {
                background-color: #23c69f !important;
              }
            }
          }
        }
        .gantt_task_progress_drag {
          display: none !important;
        }

        // 内容
        .gantt_task_content {
          overflow: unset;
          .task-level_1 {
            position: relative;
            top: -11px;
            width: 100%;
            color: #333;
            .progress-warp {
              position: absolute;
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 50px;
              font-weight: 400;
              font-size: 10px;
              color: #1d65f3;

              .text {
                margin-top: 3px;
                font-weight: 400;
                font-size: 10px;
                color: #333;
                line-height: 10px;
              }
            }
            .circle-wrap {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              .circle {
                border-radius: 50%;
                background-color: #fff;
              }
            }
          }
        }
      }
    }
    .gantt_grid_scale,
    .gantt_task_scale {
      border-bottom: none;
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
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 15px;
      &::before {
        margin-top: 2px;
        display: block;
        content: '';
        width: 2px;
        height: 8px;
        background: #fff;
      }
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
}
</style>
<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  .dashboard-head {
    position: relative;
    padding: 0 6px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 56px;
    background: #fafafa;
    box-sizing: border-box;
    .logo-wrap {
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 16px;
      color: #333333;
      line-height: 16px;
      .logo-img {
        height: 36px;
      }
    }
    .title {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0);
      height: 28px;
    }
  }
  .dashboard-body {
    display: flex;
    flex-direction: column;
    padding: 16px;
    padding-bottom: 0;
    margin: 0 16px;
    flex: 1;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;
    .gantt-box {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
<style>
@import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
</style>

<style scoped>
::deep(.el-form-item__content) {
  width: 240px;
}
</style>
