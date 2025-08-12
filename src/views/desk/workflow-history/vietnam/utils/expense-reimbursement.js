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
      label: '提交人',
      prop: 'commitUser',
      type: 'dc-view',
      objectName: 'user',
    },
    {
      label: '报销日期',
      prop: 'reimbursementDate',
      type: 'rowText',
    },
    {
      label: '报销部门',
      prop: 'reimbursementDept',
      type: 'dc-view',
      objectName: 'dept',
    },
    {
      label: '费用承担组织',
      prop: 'costBearing',
      minWidth: '140px',
      type: 'rowText',
    },
    {
      label: '报销总金额(元)',
      minWidth: '100px',
      prop: 'amountInReportingCurrency',
      type: 'rowText',
    },
    // {
    //   label: '发票抬头公司',
    //   prop: 'invoiceHanderCompany',
    //   type: 'rowText',
    // },
    {
      label: '报销事由',
      prop: 'reasonForReimbursement',
      type: 'rowText',
    },
    {
      label: '报销人',
      prop: 'reimburser',
      search: true,
      type: 'dc-view',
      objectName: 'user',
    },
    // {
    //   label: '收款信息',
    //   prop: 'paymentInfo',
    //   type: 'rowText',
    // },
    {
      label: '提交人部门',
      prop: 'commitDept',
      type: 'dc-view',
      objectName: 'dept',
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
