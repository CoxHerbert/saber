/** 入库单配置 */
const options = {
  columns: [
    {
      prop: '',
      label: '序号',
      width: '55px',
      type: 'index',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      label: '流程key',
      prop: 'processKey',
      type: 'rowText',
    },
    {
      label: '流程名称',
      search: true,
      prop: 'processName',
      type: 'rowText',
    },
    {
      label: '回调service',
      prop: 'callbackService',
      type: 'rowText',
    },
    {
      label: '标记计划id字段',
      prop: 'planItemField',
      type: 'rowText',
    },
    {
      prop: 'options',
      width: 210,
      label: '操作',
      fixed: 'right',
      slot: '',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
        },
        {
          type: 'button',
          label: '查看',
          action: 'view',
        },
        {
          type: 'button',
          label: '删除',
          action: 'del',
        },
      ],
    },
  ],
};

export default options;
