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
        prop: 'bilType',
        label: '批次号',
        type: 'rowText',
        search: true,
        searchIndex: 1,
        searchProps: {
          is: 'input',
        },
        width: 140,
      },
      {
        prop: 'biINo',
        label: '单据编号',
        type: 'rowText',
        search: true,
        searchIndex: 2,
        searchProps: {
          is: 'input',
        },
        width: 140,
      },
      {
        prop: 'transferQty',
        label: '转单数量',
        type: 'rowText',
      },
      {
        prop: 'returnQty',
        label: '回库数量',
        type: 'rowText',
      },
      {
        prop: 'deliveryTime',
        label: '交期',
        type: 'rowText',
        minWidth: 120,
      },
      {
        prop: 'processes',
        label: '工序',
        type: 'rowText',
        minWidth: 200,
      },
      {
        prop: 'supplierName',
        label: '供应商名称',
        type: 'rowText',
        width: 120,
      },
      {
        prop: 'unitPrice',
        label: '单价',
        type: 'rowText',
        width: 80,
      },
      {
        prop: 'totalPrice',
        label: '总价',
        type: 'rowText',
        width: 80,
      },
      {
        prop: 'previousBatchNo',
        label: '前置批次号',
        type: 'rowText',
        width: 140,
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
