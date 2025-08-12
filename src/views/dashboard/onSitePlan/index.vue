<template>
  <div class="dashboard-container" v-loading="loading">
    <div class="dashboard-head">
      <div class="logo-wrap">
        <img class="logo-img" src="/img/logo-v2.png" alt="" />
      </div>
      <img class="title" src="/img/dashboard/现场计划阶段进度看板.png" alt="" />
    </div>

    <div class="dashboard-body">
      <div class="gantt-box">
        <div id="gantt-site-plan" ref="ganttRef"></div>
      </div>
    </div>
  </div>
</template>
<script setup name="ProjectSchedule">
import { onMounted, ref, toRefs } from 'vue';
import { gantt } from 'dhtmlx-gantt';
import dayjs from 'dayjs';
import Api from '@/api/index';
import { calculateChildPositions, adjustRowIndex } from '@/utils/gantt';
const { proxy } = getCurrentInstance();

const route = useRoute();

let pageData = reactive({
  loading: false,
  minStartDate: '',
  maxEndDate: '',
  queryParams: {
    planOrderStatus: '',
  },
  planData: {},
  resourcesStore: null,
  columnWidth: 60,
  rowHeight: 55,
  timeout: null,
});

let {
  loading,
  minStartDate,
  maxEndDate,
  queryParams,
  planData,
  resourcesStore,
  columnWidth,
  rowHeight,
  timeout,
} = toRefs(pageData);

let ganttRef = ref(null);

let renderResourceLine = (resource, timeline) => {
  const groupWorkHours = resource.workHours;
  const row = document.createElement('div');

  Object.keys(groupWorkHours).forEach(dateString => {
    const item = groupWorkHours[dateString];
    const end_date = new Date(dayjs(item.workDate).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'));
    const start_date = new Date(dayjs(item.workDate).format('YYYY-MM-DD HH:mm:ss'));
    let sizes = timeline.getItemPosition(resource, start_date, end_date);
    let el = document.createElement('div');
    el.style.cssText = [
      'left:' + sizes.left + 'px',
      'width:' + sizes.width + 'px',
      'position:absolute',
      'height:' + (gantt.config.row_height - 1) + 'px',
      'line-height:' + sizes.height + 'px',
      'top:' + sizes.top + 'px',
    ].join(';');
    el.innerHTML = `<div class="count-box">
      ${item.workCount}
      <span class="${item?.shortageOfManpower < 0 ? 'count-down' : 'count-up'}">${getCount(
      item?.shortageOfManpower || 0
    )}</span>
      </div>`;
    row.appendChild(el);
  });
  return row;
};

onMounted(async () => {
  await getDate();
  await getData();
  initGantt();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const params = {
      left: columnWidth.value,
    };
    const keys = ['customerId', 'projectId', 'lineName', 'lineCode', 'planOrderStatus'];
    const arr = keys.filter(key => {
      params[key] = queryParams.value[key];
      return !!queryParams.value[key];
    });
    if (Array.isArray(arr) && !arr.length) {
      params.startDate = queryParams.value.startDate;
      params.endDate = queryParams.value.endDate;
    }
    const res = await Api.pdp.mmrPlanOrderItem.getProjectPhaseScheduling(params);
    let { code, data: resData } = res.data;
    if (code === 200) {
      loading.value = false;
      planData.value.personnelLevel = resData.personnelLevel.map(item => {
        return {
          key: item.workGroupId,
          label: item.workGroupName,
          workHours: item.workHours,
        };
      });
      planData.value.data = resData.bars.map(item => {
        item.children = item.children.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        );
        item = calculateChildPositions(item);
        item.children = adjustRowIndex(item.children);
        item.maxRow = Math.max(...item.children.map(item => item.rowIndex));
        item.children.forEach(bar => {
          bar.width = bar.total_days * columnWidth.value;
          bar.background = proxy.hexToRgba(bar.color, 0.3);
          if (bar.progress) {
            try {
              bar.progress = Number(bar.progress);
            } catch (error) {
              bar.progress = 0;
            }
          } else {
            bar.progress = 0;
          }
          if (bar.progress > 100) bar.progress = 100;
        });

        return {
          ...item,
          row_height: 65 + item.maxRow * rowHeight.value,
          text: `<div class='task-title'> <div class='task-name'> ${item?.text} </div> <div class='task-desc' title='${item?.planOrderCode}'> ${item?.planOrderCode} </div></div>`,
          start_date: new Date(dayjs(item.start_date)),
          end_date: new Date(dayjs(item.end_date).add(1, 'day')),
        };
      });
      updateGanttData();
    }
  } catch (error) {
    loading.value = false;
  }
};

// 初始化甘特图
const initGantt = () => {
  initGanttConfig();
  initGanttEvent();
};

// 初始化甘特图配置
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
  gantt.config.layout = {
    css: 'gantt_container',
    rows: [
      {
        config: {
          columns: [
            {
              name: 'name',
              label: '计划单',
              align: 'center',
              template: resource => resource.label,
            },
          ],
        },
        cols: [
          {
            view: 'grid',
            id: 'resourceGrid',
            group: 'grids',
            bind: 'resources',
            scrollY: 'resourceVScroll',
          },
          { resizer: true, width: 1, group: 'vertical' },
          {
            view: 'timeline',
            id: 'resourceTimeline',
            bind: 'resources',
            bindLinks: null,
            layers: [renderResourceLine, 'taskBg'],
            scrollX: 'scrollHor',
            scrollY: 'resourceVScroll',
          },
          { view: 'scrollbar', id: 'resourceVScroll', group: 'vertical' },
        ],
        gravity: 0.8,
      },
      { resizer: true, width: 2 },
      {
        cols: [
          {
            view: 'grid',
            group: 'grids',

            scrollY: 'scrollVer',
            config: {
              scale_height: 0,
            },
          },
          { resizer: true, width: 1, group: 'vertical' },
          {
            view: 'timeline',
            id: 'timeline',
            scrollX: 'scrollHor',
            scrollY: 'scrollVer',
            config: {
              scale_height: 0,
            },
          },
          { view: 'scrollbar', id: 'scrollVer', group: 'vertical' },
        ],
        gravity: 3,
      },
      { view: 'scrollbar', id: 'scrollHor' },
    ],
  };
  // 隐藏某列（移除配置项）
  gantt.config.columns = gantt.config.columns.filter(col => col.name === 'text');
  gantt.addMarker({
    start_date: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    css: 'today-line',
  });
  resourcesStore.value = gantt.createDatastore({
    name: 'resources',
    initItem: item => {
      item.id = item.key || gantt.uid();
      return item;
    },
  });
  // 任务条文本样式
  gantt.templates.task_text = (start, end, task) => getTemplate(task);
  gantt.init(ganttRef.value);
  resourcesStore.value.parse(planData.value.personnelLevel);
  gantt.parse(planData.value);
  handleGanttPosition();
};

// 处理甘特图定位
const handleGanttPosition = () => {
  timeout.value = setInterval(() => {
    const screenWidth = window.innerWidth;
    let ganTT = document.getElementsByClassName('gantt_marker');
    if (screenWidth < 1920) {
      const ganttCell = document.querySelector('.gantt_layout_cell[data-cell-id="main"]');
      if (queryParams.value.startDate && ganttCell) {
        const today = dayjs();
        const daysDiff = today.diff(queryParams.value.startDate, 'day');
        const totalWidth = daysDiff * columnWidth.value;
        gantt.scrollTo(totalWidth - ganttCell.offsetWidth + 215 + 400, null);
      }
      clearInterval(timeout.value);
    } else if (ganTT[0]) {
      gantt.scrollTo(ganTT[0].offsetLeft - 1000, null);
      clearInterval(timeout.value);
    }
  }, 100);
};

// 初始化甘特图监听方法
const initGanttEvent = () => {
  const eventArrs = [];
  eventArrs[0] = gantt.attachEvent('onTaskDblClick', (id, e) => false); //  禁止点击弹窗
  eventArrs[1] = gantt.attachEvent('onBeforeLinkAdd', link => false); // 禁止添加连接
  eventArrs[2] = gantt.attachEvent('onGridEditStart', state => false); // 禁止编辑
  eventArrs[3] = gantt.attachEvent('onBeforeTaskDrag', id => false); // 拖拽前
  eventArrs[4] = gantt.attachEvent('onTaskClick', (id, e) => {
    if (route.path === '/pdp/planSheet/onSitePlan/index') {
      const task = gantt.getTask(id);
      resetPlan(task);
    }
    return true;
  });
  proxy.$store.dispatch('UpdateEventArrs', eventArrs);
};

// 更新甘特图
const updateGanttData = () => {
  gantt.clearAll();
  resourcesStore.value.parse(planData.value.personnelLevel);
  gantt.parse(planData.value);
};

// 获取日期
const getDate = async () => {
  const res = await Api.pdp.mmrPlanOrderItem.getTimeInterval();
  const { code } = res.data;
  if (code === 200) {
    queryParams.value = res.data.data;
    minStartDate.value = queryParams.value.startDate;
    maxEndDate.value = queryParams.value.endDate;
  }
};

// 获取数量
const getCount = count => {
  if (count > 0) return `+${count}`;
  if (count === 0) return '';
  if (count < 0) return count;
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
          background: ${item.color};
        ">
        ${initSvg(item)}
      </div>`;
    });
    return `<div class="bars-container">${doms}</div>`;
  }
};

const initSvg = bar => {
  const { isComplete, color, background, progress } = bar;
  const htmlText = isComplete
    ? `<path
        d="M5.5 8.5 L7 10 L10.5 6"
        stroke="${color}"
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
        fill="${color}"
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
              stroke="${color}"
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
          <div class="text">${bar?.text}</div>
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
</script>

<style lang="scss">
@use '@/styles/planGantt.scss';
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
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
<style>
@import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
</style>
