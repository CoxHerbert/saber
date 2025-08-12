/** 入库单配置 */
const options = {
  columns: [
    // {
    //   width: '55px',
    //   type: 'selection',
    // },
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
      prop: 'userId',
      label: '入驻人',
      objectName: 'user',
      type: 'dc-view',
      width: '160px',
    },
    {
      prop: 'stationPlanId',
      label: '计划单',
      objectName: 'mmrPlanOrder',
      type: 'dc-view',
      'min-width': '140px',
    },
    {
      prop: 'startDate',
      label: '开始时间',
      type: 'rowText',
      width: '120px',
    },
    {
      prop: 'endDate',
      label: '结束时间',
      type: 'rowText',
      width: '120px',
    },
    {
      prop: 'auditStatus',
      label: '审核状态',
      type: 'rowCustomText',
      width: '140px',
      render(scope) {
        const { row } = scope;
        switch (row.auditStatus) {
          case true:
            return '已审核';
          case false:
            return '未审核';
          default:
            return '-';
        }
      },
    },
    {
      prop: 'auditTime',
      label: '审核时间',
      type: 'rowText',
      width: '140px',
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
          permissionId: 'RA_DETAIL',
          action: 'detail',
        },
        {
          type: 'button',
          label: '审核',
          action: 'audit',
          permissionId: 'RA_AUDIT',
          showFunc(row) {
            return !row.auditStatus;
          },
        },
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
          permissionId: 'RA_EDIT',
          showFunc(row) {
            return !row.auditStatus;
          },
        },
        {
          type: 'button',
          label: '删除',
          action: 'delete',
          permissionId: 'RA_DEL',
          showFunc(row) {
            return !row.auditStatus;
          },
        },
      ],
    },
  ],
};

export default options;
