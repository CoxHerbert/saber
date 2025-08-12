<template>
  <div class="content-warp" v-loading="loading">
    <!-- 现场计划 -->
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
          label-width="auto"
        >
          <el-form-item class="form-itme-width_50" label="所属部门" id="deptName" prop="deptName">
            <el-select
              v-model="queryParams.deptName"
              clearable
              filterable
              placeholder="请选择所属部门"
            >
              <el-option
                v-for="item in optionDept"
                :key="item.productCode"
                :label="item.productCode"
                :value="item.productCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="客户产品" prop="customerProductCode">
            <el-select
              v-model="queryParams.customerProductCode"
              clearable
              placeholder="请选择客户产品"
            >
              <el-option
                v-for="item in selectList"
                :key="item.fnumber"
                :label="item.fdatavalue"
                :value="item.fnumber"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Project" prop="projectConfigId">
            <dc-select-dialog
              v-model="queryParams.projectConfigId"
              type="input"
              objectName="projectConfig"
              placeholder="请选择Project"
              returnType="string"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
          </el-form-item>
          <el-form-item label="Station" prop="stationConfigId">
            <dc-select-dialog
              v-model="queryParams.stationConfigId"
              type="input"
              objectName="projectConfig"
              placeholder="请选择Station"
              returnType="string"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
          </el-form-item>
          <el-form-item label="CM厂" prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入CM厂" />
          </el-form-item>
          <el-form-item label="计划单" prop="lineCode">
            <el-input v-model="queryParams.lineCode" placeholder="请输入计划单号" />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="getData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
    </div>
    <div id="gantt-site-plan" ref="ganttRef"></div>
  </div>
  <el-drawer
    class="reset-plan plan-detail-01"
    v-model="open"
    size="85%"
    :title="submitId?.planOrderCode"
    @close="closeResetPlan"
  >
    <drawerDetail :key="submitId?.id" :id="submitId?.id" />
    <!-- <el-form ref="ruleForm" :model="schedulingPlanForm" label-width="auto" class="mt-5">
      <div>
        <el-form-item
          v-for="(item, index) in findList"
          :key="index"
          :label="item.phaseName"
          class="form-item"
        >
          <dc-date-range v-model:startDate="item.startDate" v-model:endDate="item.endDate" />
        </el-form-item>
      </div>
    </el-form> -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeResetPlan">关闭</el-button>
        <el-button type="primary" @click="schedulingPlanSubmitForm">确 定</el-button>
      </span>
    </template>
  </el-drawer>
  <el-dialog
    class="remark-dialog"
    v-model="noteOpen"
    :title="remarkTitle"
    width="500"
    destroy-on-close
    @close="closeNote"
  >
    <template #default>
      <div class="remark-wrap" v-if="Array.isArray(noteList) && noteList.length">
        <div class="remark" v-for="(note, index) in noteList" :key="index">
          <div class="remark-user">
            {{ note?.updateTime }}
            <dc-view v-model="note.updateUser" objectName="user" />：
          </div>
          <div class="remark-content" v-html="note?.notes"></div>
        </div>
      </div>
      <div class="no-data" v-else>加载中</div>
    </template>
  </el-dialog>
</template>
<script setup name="OnSitePlan">
import { onMounted, ref, toRefs } from 'vue';
import { gantt } from 'dhtmlx-gantt';
import dayjs from 'dayjs';
import Api from '@/api/index';
import { calculateChildPositions, adjustRowIndex } from '@/utils/gantt';
import drawerDetail from '../detail/drawerDetail.vue';

const route = useRoute();
const { proxy } = getCurrentInstance();

let pageData = reactive({
  loading: false,
  minStartDate: '',
  maxEndDate: '',
  queryParams: {
    planOrderStatus: '',
  },
  options: [],
  planData: {},
  resourcesStore: null,
  columnWidth: 60,
  rowHeight: 55,
  // 阶段弹窗
  open: false,
  // 阶段表单数据
  formData: {
    planOrderId: null,
    planList: [],
  },
  // 阶段选项
  phaseOptions: [],
  findList: [],
  schedulingPlanForm: {
    startDate: null,
    endDate: null,
  },
  submitId: null,
  selectList: [],
  timeout: null,
  currentPlanId: null,
  noteList: [],
  noteOpen: false,
  remarkTitle: '',
  optionDept: [],
});

let {
  loading,
  minStartDate,
  maxEndDate,
  queryParams,
  options,
  planData,
  resourcesStore,
  columnWidth,
  rowHeight,
  open,
  formData,
  phaseOptions,
  findList,
  schedulingPlanForm,
  submitId,
  selectList,
  timeout,
  currentPlanId,
  noteList,
  noteOpen,
  remarkTitle,
  optionDept,
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

// 获取部门列表
const getDeptData = async () => {
  try {
    loading.value = true;
    const params = { current: 1, size: 1000 };
    const res = await Api.pdp.productDepartment.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      optionDept.value = data.records || [];
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

onMounted(async () => {
  const id = route.query?.id;
  if (id) {
    queryParams.value.id = id;
  }
  const lineCode = route.query?.lineCode;

  if (lineCode) {
    queryParams.value.lineCode = lineCode;
  }

  getDeptData();
  await getDate();
  await getOptions();
  await getData();
  await getPhaseOptions();
  initGantt();
  selectData();
});

const selectData = async () => {
  const params = {
    current: 1,
    size: 1000,
  };
  const res = await Api.pdp.mmrPlanOrder.select(params);
  const { code, data } = res.data;
  if (code == 200) {
    selectList.value = data.records;
  }
};

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    // const params = {
    //   left: columnWidth.value,
    // };
    // const keys = ['customerId', 'projectId', 'lineName', 'lineCode', 'planOrderStatus'];
    // const arr = keys.filter(key => {
    //   params[key] = queryParams.value[key];
    //   return !!queryParams.value[key];
    // });
    // if (Array.isArray(arr) && !arr.length) {
    //   params.startDate = queryParams.value.startDate;
    //   params.endDate = queryParams.value.endDate;
    // }
    const res = await Api.pdp.mmrPlanOrderItem.getProjectPhaseScheduling(queryParams.value);
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
          row_height: 75 + item.maxRow * rowHeight.value,
          text: `<div class='task-title'>
            <div class='task-name'> ${item.text} </div>
            <div class='task-desc' title='${item?.planOrderCode}'> ${item.planOrderCode} </div>
          </div>`,
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
        gravity: 1.1,
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
    // 判断点击的元素是否是 `.circle-wrap` 或 `.information`
    const target = e.target.closest('.circle-wrap.information');
    if (target) {
      e.stopPropagation();
      const planId = target.getAttribute('data-planId');
      const isNote = target.getAttribute('data-isNote');
      const name = target.getAttribute('data-name');
      if (isNote && planId && currentPlanId.value !== planId) {
        currentPlanId.value = planId;
        noteList.value = [];
        noteOpen.value = true;
        remarkTitle.value = `【${name}】备注记录`;
        getNotes();
      }
    } else if (route.path === '/pdp/planSheet/onSitePlan/index') {
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
    queryParams.value = {
      ...queryParams.value,
      ...res.data.data,
    };
    minStartDate.value = queryParams.value.startDate;
    maxEndDate.value = queryParams.value.endDate;
  }
};

// 获取选项
const getOptions = async () => {
  const res = await Api.mps.plan.getPlanMto();
  const { code } = res.data;
  if (code === 200) {
    options.value = res.data.data;
  }
};

// 获取数量
const getCount = count => {
  if (count > 0) return `+${count}`;
  if (count === 0) return '';
  if (count < 0) return count;
};

//处理重置
const resetQuery = async () => {
  queryParams.value = {
    planOrderStatus: '',
  };
  await getDate();
  getData();
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
  const { isComplete, color, background, progress, threeAreNotes, text, id } = bar;
  const className = threeAreNotes ? 'information' : '';
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
        <div class="circle-wrap ${className}" data-planId="${id}" data-name="${text}" data-isNote="${!!threeAreNotes}">
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
      `;
};

// 动态设置进度
const getProgress = progress => {
  progress = Math.min(progress, 100);
  const circumference = 2 * Math.PI * 6; // 圆周长
  const offset = circumference - (progress / 100) * circumference;
  return offset;
};

const handleQuery = () => {
  getData();
};

// 获取阶段选项
const getPhaseOptions = async () => {
  try {
    const params = {
      size: 1000,
      current: 1,
      mmrPhaseEnable: true,
    };
    const res = await Api.pdp.mmrPlanPhaseInfo.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      phaseOptions.value = data.records;
    }
  } catch (err) {
    console.error(err);
  }
};

// 关闭重排计划
const closeResetPlan = () => {
  open.value = false;
  formData.value = {
    planOrderId: null,
    planList: [],
  };
};

const getFindScheduling = async row => {
  const params = {
    planOrderId: row.id,
    planOrderStatus: 'DC_MMR_PLAN_ORDER_STATUS_IP',
  };

  const res = await Api.pdp.mmrPlanOrder.findScheduling(params);
  const { code, data } = res.data;
  if (code == 200) {
    findList.value = data;
  }
};

// 排计划;
const resetPlan = row => {
  open.value = true;
  submitId.value = row;
  getFindScheduling(row);
};

const schedulingPlanSubmitForm = async () => {
  proxy.$refs['ruleForm'].validate(async valid => {
    if (valid) {
      const params = {
        planOrderId: submitId.value.id,
      };
      const res = await Api.pdp.mmrPlanOrderItem.SchedulingPlanSubmit(findList.value, params);
      const { code, msg } = res.data;
      if (code === 200) {
        open.value = false;
        proxy.$message.success(msg);
        await getDate();
        closeResetPlan();
        getData();
      }
    }
  });
};

const closeNote = () => {
  currentPlanId.value = null;
  noteList.value = [];
  remarkTitle.value = '';
  noteOpen.value = false;
};

const getNotes = async () => {
  try {
    const res = await Api.common.note.list({
      current: 1,
      size: 9999,
      businessId: currentPlanId.value,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      noteList.value = resData.records;
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss">
@use '@/styles/planGantt.scss';
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
