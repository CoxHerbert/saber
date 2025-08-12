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
      label: '流程名称',
      prop: 'processDefinitionName',
      type: 'rowText',
    },
    {
      label: '当前节点用户名称',
      prop: 'currentNodeUserName',
      type: 'rowText',
    },
    {
      label: '清单编码',
      prop: 'billCode',
      search: true,
      type: 'rowText',
    },
    {
      label: '客户名称',
      prop: 'customerName',
      search: true,
      type: 'rowText',
    },
    {
      label: '客户编码',
      prop: 'customerCode',
      search: true,
      type: 'rowText',
    },
    {
      label: '项目名称',
      prop: 'projectName',
      search: true,
      minwidth: '200px',
      type: 'rowText',
    },
    {
      label: '项目名称编码',
      search: true,
      prop: 'projectNameCode',
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
        {
          type: 'button',
          label: '打印PDF',
          action: 'printPdf',
        },
      ],
    },
  ],
};

export default options;
