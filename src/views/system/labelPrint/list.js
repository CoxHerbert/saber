/** 携客云标签打印 */
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
        width: '60px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'deliveryNo',
        label: '发货单号',
        type: 'rowText',
        search: true,
        align: 'center',
        width: 140,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入发货单号',
        },
      },
      {
        prop: 'deliveryName',
        label: '供应商名称',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 180,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入供应商名称',
        },
      },
      {
        prop: 'mtoNo',
        label: '供应商编码',
        type: 'rowText',
        search: true,
        align: 'center',
        width: 140,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入供应商编码',
        },
      },
      {
        prop: 'billNo',
        label: '采购单号',
        type: 'rowText',
        search: false,
        align: 'center',
        width: 140,
      },
      {
        prop: 'entryId',
        label: '采购单行',
        type: 'rowText',
        search: false,
        align: 'center',
        width: 120,
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 140,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入物料名称',
        },
      },
      {
        prop: 'number',
        label: '数量',
        type: 'rowText',
        search: false,
        align: 'center',
        width: 60,
      },
      {
        prop: 'billDate',
        label: '发货日期',
        type: 'rowText',
        search: false,
        align: 'center',
        width: 120,
      },
    ],
  };
};

export default options;
