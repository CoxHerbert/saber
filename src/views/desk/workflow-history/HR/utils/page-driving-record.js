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
      label: '驾驶人',
      prop: 'driverId',
      searchType: 'user',
      type: 'dc-view',
      search: true,
      objectName: 'user',
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
      label: '所在地',
      prop: 'locationKey',
      dictKey: 'DC_HR_LOCATION',
      width: 100,
      type: 'dict',
    },
    {
      label: '驾照到期日',
      prop: 'driverLicenseDate',
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
