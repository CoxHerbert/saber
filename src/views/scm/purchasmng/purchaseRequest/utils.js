/** 入库单配置 */
const options = {
  columns: [
    // {
    //   'min-width': '55px',
    //   type: 'selection',
    // },
    {
      prop: '',
      label: '序号',
      width: 55,
      type: 'index',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      prop: 'orgId',
      label: '组织',
      type: 'dc-dict',
      dictKey: 'SCMORG_LIST_CACHE',
      'min-width': '160px',
    },
    {
      prop: 'no',
      label: '采购订单编号',
      type: 'rowText',
      'min-width': '160px',
    },
    {
      prop: 'billtypeDict',
      label: '采购类型',
      type: 'dc-dict-key',
      dictKey: 'DC_PURCHASE_REQUEST_DICT',
      'min-width': '100px',
    },
    {
      prop: 'applicationDate',
      label: '申请日期',
      type: 'rowText',
      'min-width': '120px',
    },
    {
      prop: 'applicationUserId',
      label: '申请人',
      objectName: 'user',
      type: 'dc-view',
      'min-width': '120px',
      showKey: 'realName',
    },
    {
      prop: 'currentTask',
      label: '审批状态',
      type: 'rowText',
      'min-width': '120px',
    },
    {
      prop: 'processStatus',
      label: '流程状态',
      type: 'dc-dict-key',
      dictKey: 'DC_LIST_PROCESS_STATUS',
      'min-width': '120px',
    },
    {
      prop: 'options',
      width: 200,
      label: '操作',
      slot: '',
      type: 'actions',
      fixed: 'right',
      children: [
        {
          type: 'button',
          label: '查看',
          action: 'look',
          permissionId: 'PURCHASE_REQUEST_DETAIL',
        },
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
          permissionId: 'PURCHASE_REQUEST_EDIT',
          showFunc(scope, userId) {
            return scope?.processStatus == '开立' && scope?.createUser == userId;
          },
        },
        {
          type: 'button',
          label: '删除',
          action: 'delete',
          permissionId: 'PURCHASE_REQUEST_DEL',
          showFunc(scope, userId) {
            return scope?.processStatus == '开立' && scope?.createUser == userId;
          },
        },
      ],
    },
  ],
};

export default options;
