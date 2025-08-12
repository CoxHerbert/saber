const options = mode => {
  return {
    columns: [
      {
        prop: 'billNo',
        label: '生产单号',
        type: 'rowText',
        align: 'center',
        width: 120,
      },
      {
        prop: 'mtoNo',
        label: '专案号',
        type: 'rowText',
        align: 'center',
        width: 100,
      },
      {
        prop: 'notStockQty',
        label: '未入库数量',
        type: 'rowText',
        align: 'center',
        width: 100,
      },
      {
        prop: 'materialNumber',
        label: '物料编码',
        type: 'rowText',
        align: 'center',
        width: 120,
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        align: 'center',
        width: 120,
      },
      {
        prop: 'specification',
        label: '规格型号',
        type: 'rowText',
        align: 'center',
        width: 120,
      },
      {
        prop: 'number',
        label: '数量',
        type: 'number',
        align: 'center',
        width: 140,
        required: true,
        props: {
          type: 'number',
          clearable: true,
          placeholder: '请输入数量',
          min: 0,
          style: {
            width: '100%',
          },
        },
      },
      {
        prop: 'printQty',
        label: '打印数量',
        type: 'number',
        align: 'center',
        width: 140,
        required: true,
        props: {
          type: 'number',
          clearable: true,
          placeholder: '请输入打印数量',
          min: 0,
          style: {
            width: '100%',
          },
        },
      },
    ],
  };
};

export default options;
