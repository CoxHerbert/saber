export default {
  columns: [
    {
      prop: 'category',
      label: '质检类型',
      type: 'rowText',
    },
    {
      prop: 'sourceInfoNo',
      label: '来源单据号',
      search: true,
      searchProps: {
        is: 'input',
      },
      type: 'rowText',
    },
    {
      prop: 'mtoNo',
      label: '专案号',
      search: true,
      searchProps: {
        is: 'input',
      },
      type: 'rowText',
    },
    {
      prop: 'materialNum',
      label: '物料编码',
      search: true,
      searchProps: {
        is: 'input',
      },
      type: 'rowText',
    },
    {
      prop: 'materialName',
      label: '物料名称',
      width: '240px',
      type: 'rowText',
    },
    {
      prop: 'createUser',
      label: '创建人',
      type: 'dc-view',
      objectName: 'user',
    },
    {
      prop: 'qcBillNo',
      label: '质检单号',
      type: 'rowText',
    },
    {
      prop: 'createTime',
      label: '创建时间',
      type: 'rowText',
    },
    {
      prop: 'options',
      width: '80px',
      label: '操作',
      fixed: 'right',
      slot: '',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '查看',
          permissionId: 'SIP_QY_RECORD_DETAIL',
          action: 'detail',
        },
      ],
    },
  ],
};
