const options = () => {
  return {
    columns: [
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'inStockCode',
        label: '入库单号',
        type: 'rowText',
        align: 'center',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入入库单号模糊搜索',
          clearable: true,
        },
      },
      {
        prop: 'warehouseId',
        label: '仓库名称',
        type: 'dc-view',
        align: 'center',
        search: true,
        objectName: 'warehouse',
        searchProps: {
          is: 'wf-select-dialog',
          props: {
            objectName: 'warehouse',
            placeholder: '请点击选择仓库',
            clearable: true,
          },
        },
      },
      {
        prop: 'inType',
        label: '入库类型',
        type: 'dict',
        align: 'center',
        dictKey: 'DC_WMS_IN_TYPE_WMS',
      },
      {
        prop: 'inSourceNumber',
        label: '来源单号',
        type: 'rowText',
        align: 'center',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入来源单号模糊搜索',
          clearable: true,
        },
      },
      {
        prop: 'inStockStatus',
        label: '状态',
        type: 'dict',
        align: 'center',
        dictKey: 'DC_WMS_IN_STATUS',
      },
      {
        prop: 'applicantId',
        label: '申请人',
        type: 'dc-view',
        align: 'center',
        objectName: 'user',
      },
      {
        prop: 'processingPersonnel',
        label: '处理人',
        type: 'dc-view',
        align: 'center',
        objectName: 'user',
      },
      {
        prop: 'createTime',
        label: '登记时间',
        type: 'rowText',
        align: 'center',
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'rowText',
        align: 'center',
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        fixed: 'right',
        align: 'center',
        width: 150,
        slotName: 'action',
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
            permission(scope) {
              return { id: 'DC_WAREHOUSING_ENTRY_EDIT', row: scope.row };
            },
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
            permission(scope) {
              return { id: 'DC_WAREHOUSING_ENTRY_DEL', row: scope.row };
            },
          },
        ],
      },
    ],
  };
};

export default options;
