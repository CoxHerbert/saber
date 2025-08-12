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
      prop: 'inStockCode',
      label: '入库单号',
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
      prop: 'inStockStatus',
      label: '审核状态',
      type: 'dict',
      dictKey: 'DC_WMS_IN_STATUS',
      width: '100px',
    },
    {
      prop: 'inType',
      label: '入库类型',
      type: 'dict',
      dictKey: 'DC_WMS_IN_TYPE_SCM',
      width: '100px',
    },
    {
      prop: 'updateTime',
      label: '日期',
      type: 'rowText',
      width: '120px',
    },
    {
      prop: 'processingPersonnel',
      label: '仓管员',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
      'min-width': '280px',
    },
    {
      prop: 'prUserId',
      label: '采购员',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
      width: '120px',
    },
    {
      prop: 'supplierId',
      label: '供应商',
      objectName: 'scmSupplier',
      type: 'dc-view',
      'min-width': '180px',
    },
    {
      prop: 'options',
      width: 200,
      label: '操作',
      fixed: 'right',
      slot: '',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '编辑',
          showFunc(scope) {
            return scope?.row?.inStockStatus === 'DC_WMS_IN_STATUS_S';
          },
          permissionId: 'WAREHOUSE_ENTRY_EDIT',
          action: 'edit',
        },
        {
          type: 'button',
          label: '审核',
          showFunc(scope) {
            return scope?.row?.inStockStatus === 'DC_WMS_IN_STATUS_S';
          },
          permissionId: 'WAREHOUSE_ENTRY_AUDIT',
          action: 'audit',
        },
        {
          type: 'button',
          label: '查看',
          permissionId: 'WAREHOUSE_ENTRY_DETAIL',
          action: 'detail',
        },
      ],
    },
  ],
};

export default options;
