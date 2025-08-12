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
        width: '60px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        label: '采/生组织',
        prop: 'orgList',
        type: 'hiddenType',
        paramKey: 'orgList',
        searchIndex: 1,
        search: true,
        searchProps: {
          is: 'wf-select-dialog',
        },
        // props: {
        //   objectName: 'org',
        //   multiple: true,
        // },
      },
      // {
      //   label: '采/生组织',
      //   type: 'wf-select-dialog',
      //   paramKey: 'orgList',
      //   searchIndex: 1,
      //   search: true,
      //   searchProps: {
      //     is: 'wf-select-dialog',
      //   },
      //   props: {
      //     objectName: 'org',
      //     multiple: true,
      //   },
      // },
      {
        prop: 'mtoNo',
        label: '计划跟踪号',
        type: 'rowText',
        width: 120,
        props: {
          disabled: true,
        },
      },
      {
        prop: 'materialCode',
        label: '物料编码',
        type: 'rowText',
        search: true,
        width: 170,
        searchProps: {
          is: 'el-input',
        },
        props: {
          disabled: true,
        },
      },
      {
        prop: 'version',
        label: '版本',
        type: 'rowText',
        width: 60,
        props: {
          disabled: true,
        },
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        width: 140,
        props: {
          disabled: true,
        },
      },
      {
        prop: 'specDesc',
        label: '规格描述/材质',
        type: 'rowText',
        width: 200,
        minWidth: 200,
        props: {
          disabled: true,
        },
      },
      {
        prop: 'confirmedOrderQty',
        label: '确认订单量',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'orderSplittingStatus',
        label: '判定状态',
        type: 'dict',
        dictKey: 'DC_ORDER_SPLITE_STATUS',
        labelKey: 'label',
        valueKey: 'dictKey',
        required: true,
        width: 100,
        // props: {
        //   disabled: true,
        // },
        // search: true,
        // searchProps: {
        //   is: 'el-input',
        // },
      },
      // {
      //   prop: 'releaseType',
      //   label: '投放类型',
      //   type: 'rowText',
      //   width: 140,
      //   props: {
      //     disabled: true,
      //   },
      // },
      {
        prop: 'releaseBillType',
        label: '投放单据类型',
        type: 'rowText',
        width: 180,
        // minWidth: 200,
        props: {
          disabled: true,
        },
      },

      // {
      //   prop: 'startDate',
      //   label: '确认采购生产日期',
      //   type: 'date',
      //   width: 140,
      //   required: true,
      //   props: {
      //     format: 'YYYY-MM-DD',
      //     valueFormat: 'YYYY-MM-DD',
      //     clearable: true,
      //     style: {
      //       width: '120px',
      //     },
      //   },
      // },
      {
        prop: 'completedDate',
        label: '确认到货完工日期',
        type: 'date',
        width: 120,
        required: true,
        props: {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          clearable: true,
          style: {
            width: '120px',
          },
        },
      },
      {
        prop: 'createUser',
        label: '创建人',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'mcc',
        label: '物控确认',
        type: 'dict',
        dictKey: 'DC_MCC_STATUS',
        valueKey: 'dictKey',
        labelKey: 'label',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'confirmationDate',
        label: '确认时间',
        type: 'rowText',
        width: 160,
        props: {
          disabled: true,
        },
      },
      // {
      //   prop: 'orderSplittingStatus',
      //   label: '分单状态',
      //   type: 'dict',
      //   dictKey: 'DC_ORDER_SPLITE_STATUS',
      //   labelKey: 'label',
      //   valueKey: 'dictKey',
      //   required: true,
      //   width: 100,
      // },

      // {
      //   prop: 'typeName',
      //   label: '投放单据类型',
      //   type: 'dict',
      //   dictKey: 'DC_MRP_RELEASE_DOC_TYPE',
      //   valueKey: 'dictKey',
      //   labelKey: 'label',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'releaseType',
      //   label: '单据类型',
      //   type: 'dict',
      //   dictKey: 'DC_MRP_RELEASE_DOC_TYPE',
      //   valueKey: 'dictKey',
      //   labelKey: 'label',
      //   props: {
      //     disabled: true,
      //   },
      // },
      {
        prop: 'description',
        label: '备注',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'ecnDesc',
        label: 'ECN备注',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'tag',
        label: '在途情况',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'docStatus',
        label: '单据状态',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'businessStatus',
        label: '业务状态',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },

      {
        prop: 'options',
        width: 80,
        label: '操作',
        slot: '',
        type: 'actions',
        fixed: 'right',
        children: [
          {
            type: 'button',
            label: '图纸',
            action: 'viewBatches',
          },
        ],
      },
    ],
  };
};

export default options;
