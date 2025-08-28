const options = () => {
  return {
    columns: [
      { type: 'selection', width: 40, align: 'center' },
      {
        type: 'index',
        label: '序号',
        width: 60,
        align: 'center',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        label: '物料编号',
        prop: 'materialNumber',
        type: 'rowText',
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '物料名称',
        prop: 'materialName',
        type: 'rowText',
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '版本',
        prop: 'version',
        type: 'rowText',
      },
      {
        label: '工艺单',
        prop: 'processNo',
        type: 'rowText',
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '工艺列表',
        prop: 'process',
        type: 'rowText',
      },
      {
        label: '专案号',
        prop: 'mtoNo',
        type: 'rowText',
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '计划数量',
        prop: 'plannedQty',
        type: 'rowText',
      },
      {
        label: '备注',
        prop: 'remark',
        type: 'rowText',
      },
      {
        prop: 'options',
        width: 120,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '详情',
            action: 'look',
          },
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
          },
        ],
      },
    ],
  };
};

export default options;
