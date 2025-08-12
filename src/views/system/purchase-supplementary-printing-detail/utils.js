/** 入库单配置 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40',
      },
      {
        prop: '',
        label: '序号',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'billNo',
        label: '采购单号',
        type: 'rowText',
        search: true,
        searchIndex: 1,
        searchProps: {
          is: 'input',
        },
        width: 140,
      },
      {
        prop: 'mtoNo',
        label: '专案号',
        type: 'rowText',
        search: true,
        searchIndex: 2,
        searchProps: {
          is: 'input',
        },
        width: 140,
      },
      {
        prop: 'sname',
        label: '供应商名称',
        type: 'rowText',
        width: 180,
      },
      {
        prop: 'materialNum',
        label: '物料编码',
        type: 'rowText',
        search: true,
        searchIndex: 3,
        searchProps: {
          is: 'input',
        },
        width: 150,
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        minWidth: 120,
      },
      {
        prop: 'specification',
        label: '规格型号',
        type: 'rowText',
        minWidth: 200,
      },
      {
        prop: 'receiveQty',
        label: '未收料数量',
        type: 'rowText',
        transVal(row) {
          return row.receiveQty ? parseFloat(row.receiveQty).toFixed(2) : '-';
        },
        width: 120,
      },
      {
        prop: 'uname',
        label: '单位',
        type: 'rowText',
        width: 80,
      },
      {
        prop: 'version',
        label: '版本',
        type: 'rowText',
        width: 80,
        transVal(row) {
          return [null, undefined, '', ' '].includes(row?.version) ? '-' : row?.version;
        },
      },
      {
        prop: 'deliveryDate',
        label: '交货日期',
        type: 'rowText',
        width: 140,
        transVal(row) {
          return [null, undefined, '', ' '].includes(row.deliveryDate)
            ? '-'
            : row.deliveryDate.split(' ')[0];
        },
      },
      {
        prop: 'replyDeliveryDate',
        label: '答交日期',
        type: 'rowText',
        width: 140,
        transVal(row) {
          return [null, undefined, '', ' '].includes(row.replyDeliveryDate)
            ? '-'
            : row.replyDeliveryDate.split(' ')[0];
        },
      },
      // {
      //   prop: 'options',
      //   minWidth: 210,
      //   label: '操作',
      //   fixed: 'right',
      //   slot: '',
      //   type: 'actions',
      //   children: [
      //     {
      //       type: 'button',
      //       label: '查看',
      //       action: 'detail',
      //     },
      //   ],
      // },
    ],
  };
};

export default options;
