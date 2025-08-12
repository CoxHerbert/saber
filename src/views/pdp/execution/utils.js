/** 入库单配置 */
const options = isTPM => {
  return {
    columns: [
      {
        type: 'selection',
        width: '55px',
        align: 'center',
      },
      // {
      //   prop: '',
      //   label: '序号',
      //   width: '140px',
      //   align: 'center',
      //   type: 'index',
      //   render(scope) {
      //     return scope.$index + 1;
      //   },
      // },
      {
        prop: 'taskNumber',
        label: '任务单编号',
        type: 'rowText',
        width: '160px',
      },
      {
        prop: 'billTypeName',
        label: '单据类型',
        type: 'rowText',
        search: true,
        width: '140px',
        searchIndex: 1,
        searchProps: {
          is: 'dict',
        },
        matchKey: 'id',
        dictKey: 'DC_BILL_TYPE',
      },
      {
        prop: 'billNumber',
        label: '专案号',
        search: true,
        searchIndex: 4,
        searchProps: {
          is: 'input',
        },
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'customerName',
        label: '客户',
        search: true,
        searchIndex: 2,
        searchProps: {
          is: 'input',
        },
        type: 'rowText',
        width: '220px',
      },
      {
        prop: 'dcErpOrderStatus',
        label: '单据状态',
        type: 'dict',
        matchKey: 'id',
        dictKey: 'DC_ERP_ORDER_STATUS',
        width: '100px',
      },
      {
        prop: 'currentOperatorId',
        label: '当前处理人',
        objectName: 'user',
        showKey: 'realName',
        align: 'center',
        type: 'dc-view',
        width: '98px',
      },
      // {
      //   prop: 'tpmHeaderOperatorId',
      //   label: '审核主管',
      //   objectName: 'user',
      //   showKey: 'realName',
      //   align: 'center',
      //   type: 'dc-view',
      //   width: '100px',
      // },
      {
        prop: 'orderDate',
        label: '下单日期',
        type: 'rowText',
        search: false,
        // searchIndex: 3,
        // searchBindKeys: ['startTime', 'endTime'],
        // searchProps: {
        //   is: 'dc-date-range',
        //   type: 'date',
        // },
        width: '120px',
      },
      {
        prop: 'projectNumber',
        label: '项目编号',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'tpmName',
        label: 'TPM',
        type: 'rowText',
        search: true,
        searchProps: {
          is: 'input',
        },
        // type: 'dc-view',
        // searchProps: {
        //   is: 'dc-select-user',
        // },
        // search: true,
        // objectName: 'user',
        // width: '120px',
      },
      {
        prop: 'operationName',
        label: '运营跟单',
        search: true,
        searchProps: {
          is: 'input',
        },
        searchIndex: 3,
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        width: '220px',
      },
      {
        prop: 'materialNumber',
        label: '物料编码',
        type: 'rowText',
        width: '160px',
      },
      {
        prop: 'version',
        label: '版本号',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'number',
        label: '数量',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'unitName',
        label: '单位',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'note',
        label: '备注',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'tpmHeaderOperatorId',
        label: '审核人',
        type: 'dc-view',
        searchProps: {
          is: 'dc-select-user',
        },
        search: true,
        objectName: 'user',
        width: '120px',
      },
      {
        prop: 'causeOfRejection',
        label: '驳回原因',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'options',
        width: 210,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: isTPM
          ? [
              {
                type: 'button',
                label: '编辑',
                action: 'edit',
                permissionId: 'TPM_ERP_ORDER_EDIT',
                showFunc(scope) {
                  // return !['1876789881673412609', '1876789924404981761'].includes(
                  //   scope?.row?.dcErpOrderStatus
                  // );

                  return ['1876789752111362049', '1876789821522898946'].includes(
                    scope?.row?.dcErpOrderStatus
                  );
                },
              },
              {
                type: 'button',
                label: '取回',
                action: 'retrieve',
                permissionId: 'OPT_ERP_ORDER_EDIT',
              },
              // {
              //   type: 'button',
              //   label: '指定审核主管',
              //   showFunc(scope) {
              //     return scope?.row?.dcErpOrderStatus === '1876789752111362049';
              //   },
              //   action: 'setTpmHeaderOperatorId',
              // },
              // {
              //   type: 'button',
              //   label: '审核',
              //   showFunc(scope) {
              //     return scope?.row?.dcErpOrderStatus === '1876789821522898946';
              //   },
              //   action: 'audit',
              // },
              {
                type: 'button',
                label: '查看',
                permissionId: 'TPM_ERP_ORDER_DETAIL',
                action: 'detail',
              },
              {
                type: 'button',
                label: '删除',
                permissionId: 'TPM_ERP_ORDER_DEL',
                action: 'delete',
              },
            ]
          : [
              // {
              //   type: 'button',
              //   label: '提交',
              //   showFunc(scope) {
              //     return scope?.row?.dcErpOrderStatus === '1876789881673412609';
              //   },
              //   action: 'submit',
              // },
              {
                type: 'button',
                label: '编辑',
                action: 'edit',
                permissionId: 'OPT_ERP_ORDER_EDIT',
                showFunc(scope) {
                  return [
                    '1876789752111362049',
                    '1876789881673412609',
                    '1888126274112307202',
                  ].includes(scope?.row?.dcErpOrderStatus);
                },
              },
              {
                type: 'button',
                label: '取回',
                action: 'retrieve',
                permissionId: 'OPT_ERP_ORDER_EDIT',
              },
              {
                type: 'button',
                label: '查看',
                permissionId: 'OPT_ERP_ORDER_DETAIL',
                action: 'detail',
              },
              {
                type: 'button',
                label: '删除',
                permissionId: 'OPT_ERP_ORDER_DEL',
                action: 'delete',
              },
            ],
      },
    ],
  };
};

export default options;
