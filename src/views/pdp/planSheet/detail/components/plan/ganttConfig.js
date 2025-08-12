import Const from '@/const';
import dayjs from 'dayjs';
const planTypeColorEnum = Const.plan.PlanTypeColorEnum;

const options = {
  config: {
    scales: [
      { unit: 'month', step: 1, format: '%Y年%m月', height: 20 },
      { unit: 'day', step: 1, format: '%d' },
    ],
    scale_height: 50,
    drag_links: false, // 禁止连线
    drag_progress: false, // 禁止拖动进度
    drag_move: false, // 禁止拖动任务条
    drag_resize: false, // 禁止修改任务持续时间
    readonly: false,
    dblclick_create: false,
    min_column_width: 20,
    columns: [
      {
        name: 'text',
        label: '项目计划',
        width: 216,
        tree: true,
        template: obj => obj.text,
      },
    ],
    layout: {
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
    },
  },
  templates: {
    task_text: (start, end, task) => {
      const color = planTypeColorEnum[task.businessCategoryId];

      return `<div class="bar-left" style="background:${color}"></div>
      ${task.progress * 100}%
      <div class="bar-right" style="background:${color}"></div>`;
    },
    task_class: (start, end, task) => {
      return 'customize-bar-task';
    },
  },
};

export default options;
