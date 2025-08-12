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
          <el-option v-for="item in moOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="排程时间">
        <dc-date-range
          v-model:startDate="queryParams.startDate"
          v-model:endDate="queryParams.endDate"
          :clearable="false"
          :disabledDate="disabledDate"
        />
      </el-form-item>
      <div class="btn-box">
        <el-button type="primary" icon="Search" @click="getData">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button
          :type="isPreson ? 'warning' : 'success'"
          :icon="isPreson ? 'Hide' : 'View'"
          @click="toggleView"
          >{{ isPreson ? '隐藏人力' : '展示人力' }}</el-button
        >
        <el-button icon="Refresh" @click="update()" v-loading="updateLoading">数据更新</el-button>
        <!-- <div class="ml-2">{{ updateTime || '-' }}</div> -->
      </div>
    </el-form>
    <div id="gantt_here" ref="ganttRef"></div>
    <el-dialog
      class="remark-dialog"
      v-model="dialogObj.open"
      width="700"
      destroy-on-close
      @close="closeDialog"
    >
      <template #header>
        <div class="head">
          {{ dialogObj.title }}
          <el-radio-group v-model="dialogObj.active" @change="handleRadioChange" size="small">
            <el-radio-button
              :label="radio.label"
              :value="radio.value"
              v-for="(radio, index) in dialogObj.radioGroup"
              :key="index"
            />
          </el-radio-group>
        </div>
      </template>
      <template #default>
        <div
          class="remark-wrap"
          v-if="
            dialogObj.active === 'remark' &&
            Array.isArray(dialogObj.noteList) &&
            dialogObj.noteList.length
          "
        >
          <div class="remark" v-for="(note, index) in dialogObj.noteList" :key="index">
            <div class="remark-user">
              {{ note?.updateTime }}
              <dc-view v-model="note.updateUser" objectName="user" />：
            </div>
            <div class="remark-content" v-html="note?.notes"></div>
          </div>
        </div>
        <!-- <div class="no-data" v-else>加载中</div> -->
        <el-table
          :data="dialogObj.shortageList || []"
          style="width: 100%"
          height="100%"
          border
          v-if="dialogObj.active === 'shortage'"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="materialCode" label="物料编码" width="140" align="center" />
          <el-table-column prop="materialName" label="物料名称" min-width="120" align="center" />
          <el-table-column prop="completeTimeCount" label="库存/需求" width="100" align="center">
            <template #default="scoped">
              {{ scoped.row.completeQty }}/{{ scoped.row.qty }}
            </template>
          </el-table-column>
          <el-table-column prop="purchaseDate" label="采购日期" min-width="120" align="center">
            <template #default="scoped">
              {{ scoped.row.purchaseDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="deliveryDate" label="预计交货日" min-width="120" align="center">
            <template #default="scoped">
              {{ scoped.row.deliveryDate || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
  <splitPlanDrawer ref="splitPlanDrawerRef" @confirm="updateData" />
</template>
<script setup name="ProjectSchedule">
import { onMounted, toRefs } from 'vue';
import { gantt } from 'dhtmlx-gantt';
import dayjs from 'dayjs';
import Api from '@/api/index';
import splitPlanDrawer from './../masterPlan/splitPlanDrawer.vue';
import { usePermission } from '@/mixins/permission';

const { isRole } = usePermission();

const route = useRoute();

const { proxy } = getCurrentInstance();

let pageData = reactive({
  loading: false,
  updateLoading: false,
  updateTime: '',
  minStartDate: '',
  maxEndDate: '',
  queryParams: {
    motNo: '',
  },
  moOptions: [],
  planData: {},
  resourcesStore: null,
  columnWidth: 50,
  rowHeight: 60,
  splitPlanDrawerRef: null,
  ganttRef: null,
  isPreson: false,
  timeout: null,
  dialogObj: {
    id: null,
    open: false,
    title: '',
    active: null,
    radioGroup: [],
    noteList: [],
    shortageList: [],
  },
});

let {
  loading,
  updateLoading,
  updateTime,
  minStartDate,
  maxEndDate,
  queryParams,
  moOptions,
  planData,
  resourcesStore,
  columnWidth,
  rowHeight,
  splitPlanDrawerRef,
  ganttRef,
  isPreson,
  timeout,
  dialogObj,
} = toRefs(pageData);

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
      <span class="${item.extraCount < 0 ? 'count-down' : 'count-up'}">${getCount(item)}</span>
      </div>`;
    row.appendChild(el);
  });
  return row;
};

onMounted(async () => {
  await getDate();
  await getOptions();
  await getData();
  initGantt();
});

onBeforeUnmount(() => {
  clearInterval(timeout.value);
});

// 切换视图
const toggleView = () => {
  try {
    isPreson.value = !isPreson.value;
    initGanttConfig();
    updateGanttData();
    gantt.addMarker({
      start_date: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      css: 'today-line',
    });
  } catch (error) {
    console.log(error);
  }
};

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    let res = await Api.mps.plan.getPlanIndexV2({
      ...queryParams.value,
      left: columnWidth.value,
      ...route.query,
    });
    let { code } = res.data;
    if (code === 200) {
      updateTime.value = res.data.data.updateTime;
      planData.value.groupList = res.data.data.groupList.map(item => {
        return {
          key: item.workGroupId,
          label: item.workGroupName,
          workHours: item.workHours,
        };
      });
      planData.value.data = res.data.data.bars.map(item => {
        item.row_height = 50;
        if (item.level === 1) {
          item.mo = item.text;
          item.row_height = rowHeight.value * item.maxIndex + 20;
          item.text = `<div class='task-title'>
            <div class='task-name'>
              ${item?.text}
              <div class='count'>
                x${item?.qty}
              </div>
            </div>
            <div class='task-desc' title='${item?.materialName}'> ${item?.materialName} </div>
            <div class='task-assemblyLeaderName'>装配组长：${item?.assemblyLeaderName}</div>
          </div>`;
        }
        return {
          ...item,
          start_date: new Date(dayjs(item.startDate)),
          end_date: new Date(dayjs(item.endDate).add(1, 'day')),
          progressRound: item.progress || 0,
          progress: calculatePercentage(item.startDate, item.endDate),
        };
      });
      updateGanttData();
      loading.value = false;
    }
  } catch (error) {
    loading.value = false;
  }
};

// 更新看板缓存
const update = async () => {
  try {
    updateLoading.value = true;
    let res = await Api.mps.plan.getPlanIndexV2({
      startDate: queryParams.value.startDate,
      endDate: queryParams.value.endDate,
      refresh: true,
      left: columnWidth.value,
    });
    const { code, data } = res.data;
    if (code === 200) {
      updateLoading.value = false;
      proxy
        .$confirm(`数据已更新，确认是否刷新页面？`, {
          confirmButtonText: '刷新页面',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => getData())
        .catch(() => {});
    }
  } catch (error) {
    console.log(error);
    updateLoading.value = false;
  }
};

const initGantt = () => {
  try {
    initGanttConfig();
    initGanttEvent();
  } catch (error) {
    console.log(error);
  }
};

// 初始化甘特图配置
const initGanttConfig = () => {
  gantt.config.start_date = queryParams.value.startDate; // 甘特图起始时间
  gantt.config.end_date = queryParams.value.endDate; // 甘特图结束时间
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
  if (isPreson.value) {
    gantt.config.layout = {
      css: 'gantt_container',
      rows: [
        {
          config: {
            columns: [
              {
                name: 'name',
                label: '小组名称',
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
          gravity: 5.4,
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
  } else {
    gantt.config.columns = [
      {
        name: 'text',
        label: '专案号',
        width: 216,
        tree: true,
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
          gravity: 3,
        },
        { view: 'scrollbar', id: 'scrollHor' },
      ],
    };
  }
  gantt.addMarker({
    start_date: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    css: 'today-line',
  });
  // 隐藏某列（移除配置项）
  gantt.config.columns = gantt.config.columns.filter(col => col.name === 'text');
  resourcesStore.value = gantt.createDatastore({
    name: 'resources',
    initItem: item => {
      item.id = item.key || gantt.uid();
      return item;
    },
  });
  // 任务条文本样式
  gantt.templates.task_text = (start, end, task) => getTemplate(task);
  // 任务条名称
  gantt.templates.task_class = (start, end, task) => {
    if (task.completionStatus === '已完成') return 'gantt_bar_task-state_3';
    if (task.completionStatus === '进行中') return 'gantt_bar_task-state_1';
    if (task.completionStatus === '逾期') return 'gantt_bar_task-state_2';
  };
  gantt.init(ganttRef.value);
  resourcesStore.value.parse(planData.value.groupList);
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
    const target = e.target.closest('.information');
    if (target) {
      e.stopPropagation();
      openDialog(target);
    } else if (route.path === '/mps/projectSchedule/index') {
      const task = gantt.getTask(id);
      if ('gantt_task_content' === e.target.className && task.level !== 1) {
        if (
          isRole([
            '超级管理员_1123598816738675201',
            'MPS报工管理员_1891650152191426562',
            '数智运营研发中心_1767742545155792898',
          ])
        ) {
          const options = {
            infoApi: Api.mps.mo.getSelectMoSplitItem,
            submitApi: Api.mps.mo.updatemMoSplitItem,
            params: {
              scheduleId: task.scheduleId,
            },
          };
          splitPlanDrawerRef.value.openDrawer(options, true);
        }
      }
    }
    return true;
  });
  proxy.$store.dispatch('UpdateEventArrs', eventArrs);
};

// 更新数据
const updateData = async data => {
  planData.value.groupList = data.groupList.map(item => {
    return {
      key: item.workGroupId,
      label: item.workGroupName,
      workHours: item.workHours,
    };
  });
  planData.value.data = planData.value.data.map(item => {
    const findItem = data.bars.find(bar => bar.id === item.id && !!bar.id);
    if (findItem) {
      const startDate = new Date(dayjs(findItem.startDate));
      const endDate = new Date(dayjs(findItem.endDate));
      item.start_date = new Date(dayjs(findItem.startDate));
      item.end_date = new Date(dayjs(findItem.endDate).add(1, 'day'));
      item.progressRound = findItem.progress || 0;
      item.progress = calculatePercentage(startDate, endDate);
    }
    return item;
  });
  resourcesStore.value.parse(planData.value.groupList);
  gantt.parse(planData.value);
  gantt.templates.task_text = (start, end, task) => {
    return getTemplate(task);
  };
};

// 更新甘特图
const updateGanttData = () => {
  gantt.clearAll();
  resourcesStore.value.parse(planData.value.groupList);
  gantt.parse(planData.value);
  gantt.addMarker({
    start_date: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    css: 'today-line',
  });
};

// 获取日期
const getDate = async () => {
  const res = await Api.mps.plan.getPlanDate();
  const { code } = res.data;
  if (code === 200) {
    queryParams.value = res.data.data;
    minStartDate.value = queryParams.value.startDate;
    maxEndDate.value = queryParams.value.endDate;
  }
};

// 获取选项
const getOptions = async () => {
  const res = await Api.mps.plan.getPlanMto();
  const { code } = res.data;
  if (code === 200) {
    moOptions.value = res.data.data;
  }
};

const remoteMethod = async query => {
  if (query) {
    queryParams.value.motNo = query;
    const res = await Api.mps.plan.getPlanMto({ mto: query });
    const { code } = res.data;
    if (code === 200) {
      moOptions.value = res.data.data;
    }
  }
};

// 获取数量
const getCount = item => {
  if (item) {
    if (item.extraCount > 0) return `+${item.extraCount}`;
    if (item.extraCount === 0) return '';
    if (item.extraCount < 0) return item.extraCount;
  }
};

//处理重置
const resetQuery = () => {
  queryParams.value.motNo = null;
  getData();
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

// 获取模板
const getTemplate = task => {
  const left = 100 * task.progress + '%';
  if (task.level === 1) {
    return `<div class="task-level_1" style="left: 0;height: ${task.maxIndex * rowHeight.value}px;">
      ${initSvg({ data: task.planSchduleMtoVoList, mo: task.mo })}
    </div>`;
  } else if (task.level === 2) {
    const moLen = planData.value.data.filter(item => item.parent === task.id).length;
    return `<div class="task-text" style="left:calc(${left} + 5px);">${task.text} ${moLen}个子工单</div>`;
  } else if (task.level === 3) {
    return `<div class="task-text" style="left:calc(${left} + 5px);">${
      task.text
    } 共${proxy.secondToHour(task.totalHours || 0)}h</div>`;
  }
};

// 初始化Svg
const initSvg = ({ data, mo }) => {
  if (!Array.isArray(data)) return '';
  return data
    .map(({ percent, name, color, left = 0, index, progress, planId, isNote, billNumber }) => {
      const top = rowHeight.value * (index - 1);
      const className = isNote || (name === '齐料' && percent < 100) ? 'information' : '';
      // 进度显示逻辑
      const htmlText =
        progress === '延期' || progress === '进行中'
          ? `<text x="8" y="8" text-anchor="middle" alignment-baseline="middle"
               font-size="3" fill="${color}" id="progress-text">${percent}%</text>`
          : `<path d="M5.5 8.5 L7 10 L10.5 6" stroke="${color}" stroke-width="0.5"
               fill="none" stroke-linecap="round" stroke-linejoin="round" id="checkmark"/>`;
      return `
        <div class="progress-warp ${className}" style="top: ${top}px; left: ${left}px;" data-planId="${planId}" data-name="${name}" data-mo="${mo}" data-isNote="${!!isNote}" data-billNumber="${billNumber}">
          <div class="circle-wrap">
            <svg class="circle" width="40" height="40" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6" stroke="${color}" stroke-width="2" fill="none" opacity="0.3"/>
              <circle cx="8" cy="8" r="6" stroke="${color}" stroke-width="2" fill="none"
                stroke-dasharray="37.7" stroke-dashoffset="${getProgress(percent)}"
                stroke-linecap="round" transform="rotate(-90 8 8)" id="progress-circle"/>
              ${htmlText}
            </svg>
            <div class="text">${name}</div>
          </div>
        </div>`;
    })
    .join('');
};

// 可选日期范围
const disabledDate = time => {
  if (!time) return false;
  const start = dayjs(minStartDate.value).valueOf();
  const end = dayjs(maxEndDate.value).valueOf();
  const current = time.getTime();
  return current < start || current > end;
};

// 开启弹窗
const openDialog = target => {
  const planId = target.getAttribute('data-planId');
  const isNote = target.getAttribute('data-isNote');
  const name = target.getAttribute('data-name');
  const mo = target.getAttribute('data-mo');
  const billNumber = target.getAttribute('data-billNumber');
  if ((isNote && planId && dialogObj.value.id !== planId) || name === '齐料') {
    dialogObj.value = {
      id: planId,
      billNumber,
      open: true,
      title: `【${mo}-${name}】`,
      active: 'remark',
      radioGroup: [],
      noteList: [],
      shortageList: [],
    };
    if (isNote && planId !== 'null') {
      dialogObj.value.radioGroup.push({
        label: `备注记录`,
        value: 'remark',
      });
      dialogObj.value.active = 'remark';
    }
    if (name === '齐料') {
      dialogObj.value.radioGroup[0] = {
        label: `缺料明细`,
        value: 'shortage',
      };
      dialogObj.value.active = 'shortage';
    }
    handleRadioChange();
  }
};

// 关闭弹窗
const closeDialog = () => {
  dialogObj.value = {
    id: '',
    billNumber: '',
    open: false,
    title: '',
    active: '',
    radioGroup: [],
    noteList: [],
    shortageList: [],
  };
};

const handleRadioChange = () => {
  switch (dialogObj.value.active) {
    case 'remark':
      getNotes();
      break;
    case 'shortage':
      getShortage();
      break;
  }
};

// 获取缺料信息
const getShortage = async () => {
  try {
    const res = await Api.mps.workinghoursreport.getMaterialInfo({
      billNumber: dialogObj.value.billNumber,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      dialogObj.value.shortageList = resData;
    }
  } catch (error) {
    console.log(error);
  }
};

// 获取备注记录
const getNotes = async () => {
  try {
    const res = await Api.common.note.list({
      current: 1,
      size: 9999,
      businessId: dialogObj.value.id,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      dialogObj.value.noteList = resData.records;
    }
  } catch (error) {
    console.log(error);
  }
};
</script>
<style>
@import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
</style>
<style lang="scss">
.content-warp #gantt_here {
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
      border: none !important;
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
          height: 50px;
          color: #333;
          .information {
            &:before {
              position: absolute;
              content: '';
              background-color: #e12137;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              right: 3px;
              top: -1px;
            }
          }
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
          .line-center {
            margin: 0 12px;
            margin-top: -20px;
            color: #dadbe0;
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
        .task-text {
          height: 20px;
          line-height: 20px;
          position: absolute;
          top: 0;
          font-weight: 400;
          font-size: 12px;
          color: #666;
          pointer-events: none;
        }
      }
    }
    // 数量
    .count-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      .count-up {
        color: #e12137;
      }
      .count-down {
        color: #23c69f;
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
</style>
<style lang="scss" scoped>
.gantt_grid_head_cell.gantt_grid_head_text.gantt_last_cell {
  font-size: 0 !important;
  &::before {
    content: '专案号';
    font-size: 16px !important;
  }
}
:deep(.el-form-item__content) {
  width: 240px;
}
.btn-box {
  width: 280px;
  display: inline-flex;
  margin-right: 32px;
  vertical-align: middle;
  margin-bottom: 18px;
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
