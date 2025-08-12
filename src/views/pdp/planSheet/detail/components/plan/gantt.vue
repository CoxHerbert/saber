<template>
  <div id="gantt-container-pansheet" ref="ganttRef"></div>
</template>

<script setup>
import { toRefs, defineExpose, defineEmits } from 'vue';
import { gantt } from 'dhtmlx-gantt';
import dayjs from 'dayjs';

const emit = defineEmits(['attachEvent']);
const { proxy } = getCurrentInstance();
const props = defineProps({
  ganttConfig: {
    type: Object,
    default: () => ({}),
  },
});
const ganttData = reactive({
  ganttRef: null,
});
const { ganttRef } = toRefs(ganttData);

const initGantt = ganttOptions => {
  initGanttConfig(ganttOptions);
  initGanttEvent();
  initGanttView(ganttOptions.data);
};
/**
 * 初始化甘特图配置
 * **/
const initGanttConfig = ({ options }) => {
  gantt.i18n.setLocale('cn');
  gantt.plugins({
    multiselect: true,
    undo: true,
    marker: true,
  });
  applyGanttOptions(options);
  gantt.init(ganttRef.value);
};
/**
 * 通用方式将 options 中的配置合并到 gantt 对应模块
 * @param {Object} options - 动态结构的配置对象，例如 { config: {}, templates: {}, ... }
 */
const applyGanttOptions = (options = {}) => {
  Object.entries(options).forEach(([section, settings]) => {
    // 跳过不合法结构
    if (typeof gantt[section] !== 'object' || gantt[section] === null) return;
    if (typeof settings !== 'object' || settings === null) return;

    // 合并每一项
    Object.entries(settings).forEach(([key, value]) => {
      gantt[section][key] = value;
    });
  });
};
/**
 * 初始化甘特图监听事件
 * **/
const initGanttEvent = () => {
  gantt.attachEvent('onTaskDblClick', (id, e) => false); //  禁止点击弹窗
  gantt.attachEvent('onBeforeLinkAdd', link => false); // 禁止添加连接
  gantt.attachEvent('onGridEditStart', state => false); // 禁止编辑
  gantt.attachEvent('onBeforeTaskDrag', id => false); // 拖拽前
  gantt.attachEvent('onTaskClick', (id, e) => {
    emit('attachEvent', {
      id,
      e,
      eventName: 'onTaskClick',
    });
    return true;
  });
};

/**
 * 初始化甘特图视图
 * **/
const initGanttView = data => {
  gantt.parse({ data });
  // gantt.addMarker({
  //   start_date: dayjs().toDate(),
  //   css: 'today-line',
  // });
};

const updateGanttAll = () => {
  clearGantt();
  initGanttConfig(options);
  initGanttView(options.data);
};

/**
 * 清空甘特图
 * **/
const clearGantt = () => {
  gantt.clearAll();
};

const destroyGantt = () => {
  gantt.clearAll(); // 清除数据
  gantt.detachAllEvents(); // 解绑所有事件
  // gantt._tasks = {}; // 清空任务引用
  if (ganttRef.value) {
    //确保你也在销毁时移除对应 DOM 元素内容
    ganttRef.value.innerHTML = '';
  }
};

onUnmounted(() => {
  destroyGantt();
});

defineExpose({
  initGantt,
  updateGanttAll,
  destroyGantt,
});
</script>
<style lang="scss">
@import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
#gantt-container-pansheet {
  .gantt_cell-content {
    padding: 1px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    gap: 3px;
    .task-name {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      line-height: 14px;

      .plan-type {
        margin-right: 3px;
        padding: 2px 3px;
        border-radius: 3px;
        font-weight: 400;
        font-size: 12px;
        color: #fff;
        line-height: 10px;
      }
      .plan-name {
        font-size: 12px;
        line-height: 14px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transition: all 0.2s;
        &:hover {
          white-space: normal;
          overflow: visible;
          background: #fff;
          z-index: 10;
          position: relative;
        }
      }
    }
  }
  .customize-bar-task {
    .gantt_task_progress_wrapper {
      background: #d2e0fd;
      .gantt_task_progress {
        background: #1d65f3;
      }
    }
    .gantt_task_line[task-progress='1'] .gantt_task_progress {
      width: 100% !important;
    }
    .gantt_task_content {
      .bar-left {
        left: 0;
        border-radius: 4px 0 0 4px;
      }
      .bar-right {
        right: 0;
        border-radius: 0 4px 4px 0;
      }
      .bar-left,
      .bar-right {
        top: 0;
        position: absolute;
        width: 8px;
        height: 100%;
        opacity: 0.8;
      }
    }
  }
}
</style>
<style lang="scss">
#gantt-container-pansheet {
  width: 100%;
  height: 100%;
  .gantt_layout {
    /* 隐藏列分隔线 修改默认样式 */
    .gantt_scale_cell,
    .gantt_grid_head_cell {
      background-color: #f7f6f5;
      font-size: 14px;
      color: #666;
    }
    /* 隐藏连接线 */
    .gantt_link_control {
      display: none !important;
    }
    // 任务条样式
    .gantt_bar_task {
      // 内容
      .gantt_task_content {
        overflow: unset;
      }
    }
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
