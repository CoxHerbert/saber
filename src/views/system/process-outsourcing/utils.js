/** 外协 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '55px',
        align: 'center',
        selectable(row) {
          return !row.isTransfer;
        },
      },
      {
        prop: '',
        label: '序号',
        width: '80px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'prdOrgName',
        label: '生产组织',
        type: 'rowText',
      },
      {
        prop: 'supplierName',
        label: '供应商',
        search: true,
        type: 'rowText',
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'createUser',
        label: '创建人',
        type: 'dc-view',
        objectName: 'user',
        width: 120,
      },
      {
        prop: 'createTime',
        label: '创建时间',
        type: 'rowText',
        width: 160,
      },
      {
        prop: 'options',
        width: 160,
        label: '操作',
        slot: '',
        type: 'actions',
        fixed: 'right',
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
          },
          {
            type: 'button',
            label: '查看',
            action: 'look',
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
            showFunc(scope) {
              console.log(scope.row.isTransfer);
              return !scope.row.isTransfer;
            },
          },
        ],
      },
    ],
  };
};

export default options;
