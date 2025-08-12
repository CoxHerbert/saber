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
      label: '流程名',
      width: 200,
      prop: 'processDefinitionName',
      type: 'rowText',
    },
    {
      label: '当前节点名称',
      prop: 'taskName',
      type: 'rowText',
    },
    {
      label: '任务执行人名称',
      prop: 'assigneeName',
      search: true,
      type: 'rowText',
    },
    {
      label: '费用承担部门',
      prop: 'costBearingDept',
      type: 'dc-view',
      objectName: 'dept',
    },
    {
      label: '申请事由',
      prop: 'reasonForApplication',
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
          label: '查看',
          action: 'view',
        },
      ],
    },
  ],
};

export default options;
