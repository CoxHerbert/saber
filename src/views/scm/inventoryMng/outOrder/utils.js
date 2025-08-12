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
    // {
    //   prop: 'scmOrgId',
    //   label: '组织',
    //   objectName: 'scmOrg',
    //   showKey: 'orgName',
    //   type: 'dc-view',
    //   width: '160px',
    // },
    {
      prop: 'scmOrgId',
      label: '组织',
      type: 'dc-dict',
      dictKey: 'SCMORG_LIST_CACHE',
      'min-width': '260px',
    },
    {
      prop: 'outStockCode',
      label: '出库单号',
      type: 'rowText',
      width: '140px',
    },
    {
      prop: 'mtono',
      label: '专案号',
      type: 'rowText',
      width: '140px',
    },
    {
      prop: 'outStockStatus',
      label: '审核状态',
      type: 'dict',
      dictKey: 'DC_WMS_OUT_STATUS',
      width: '100px',
    },
    {
      prop: 'outStockType',
      label: '出库类型',
      type: 'dict',
      dictKey: 'DC_WMS_OUT_TYPE_SCM',
      width: '100px',
    },
    {
      prop: 'businessDate',
      label: '日期',
      type: 'rowText',
      width: '120px',
    },
    {
      prop: 'customerId',
      label: '客户',
      'min-width': '280px',
      objectName: 'customer',
      showKey: 'fullname',
      type: 'dc-view',
    },
    {
      prop: 'processingPersonnel',
      label: '仓管员',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
      width: '120px',
    },
    {
      prop: 'options',
      width: 240,
      label: '操作',
      slot: '',
      type: 'actions',
      fixed: 'right',
      children: [
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
          showFunc(row) {
            return row.outStockStatus === 'DC_WMS_OUT_STATUS_S';
          },
          permissionId: 'OUT_ORDER_EDIT',
        },
        {
          type: 'button',
          label: '查看',
          permissionId: 'OUT_ORDER_DETAIL',
          action: 'detail',
        },
        {
          type: 'button',
          label: '打印PDF',
          permissionId: 'OUT_ORDER_DETAIL',
          action: 'printPdf',
        },
      ],
    },
  ],
};

export default options;
