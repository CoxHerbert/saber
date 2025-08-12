/** 外协 */
const options = () => {
  return {
    columns: [
      {
        prop: '',
        label: '序号',
        width: '60px',
        align: 'center',
        type: 'index',
        fixed: 'fixed ',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'projectId',
        label: '项目名称',
        type: 'dc-view',
        objectName: 'project',
        width: 140,
        search: true,
        searchProps: {
          is: 'wf-select-dialog',
          objectName: 'project',
        },
      },
      {
        prop: 'name',
        label: '物料名称',
        type: 'rowText',
        width: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'number',
        label: '物料编码',
        type: 'rowText',
        width: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'lastEtd',
        label: 'lastest ETD',
        type: 'rowText',
        width: 120,
        search: true,
        searchProps: {
          is: 'el-date-picker',
          props: {
            format: 'YYYY-MM-DD',
            valueFormat: 'YYYY-MM-DD',
          },
        },
      },
      {
        prop: 'etd',
        label: '客户ETD',
        type: 'rowText',
        width: 120,
        search: true,
        searchProps: {
          is: 'el-date-picker',
          props: {
            format: 'YYYY-MM-DD',
            valueFormat: 'YYYY-MM-DD',
          },
        },
      },
      {
        prop: 'mtoNo',
        label: '计划跟踪号',
        type: 'rowText',
        width: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },

      {
        prop: 'dcPdpFuncFieldList',
        label: '跟单',
        type: 'dc-member',
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 100,
        children: [
          {
            type: 'button',
            label: '专案计划',
            action: 'row-click',
          },
        ],
      },
      // {
      //   prop: 'mcc',
      //   label: '完成率',
      //   type: 'dict',
      //
      //   dictKey: 'DC_MCC_STATUS',
      //   valueKey: 'dictKey',
      //   labelKey: 'label',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'confirmationDate',
      //   label: '数量',
      //
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
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
      //   prop: 'orderSplittingStatus',
      //   label: '是否组装',
      //   type: 'dict',
      //   dictKey: 'DC_ORDER_SPLITE_STATUS',
      //   labelKey: 'label',
      //   valueKey: 'dictKey',
      //   required: true,
      //   width: 100,

      // },
      // {
      //   prop: 'docStatus',
      //   label: '客户 ETD',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'businessStatus',
      //   label: 'Latest ETD',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'releaseType',
      //   label: '入库数量',
      //   type: 'rowText',
      //   width: 140,
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'releaseBillType',
      //   label: '累计出库数量',
      //   type: 'rowText',
      //   width: 140,
      //   props: {
      //     disabled: true,
      //   },
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
      // {
      //   prop: 'description',
      //   label: '报关Y/N',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'ecnDesc',
      //   label: 'PM',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: 'Risk Level',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },

      // {
      //   prop: 'options',
      //   width: 80,
      //   label: 'MIL Remark',
      //   slot: '',
      //   type: 'actions',
      //   fixed: 'right',
      //   children: [
      //     {
      //       type: 'button',
      //       label: '图纸',
      //       action: 'viewBatches',
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '结构图纸',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   label: '结构图纸',
      //   align: 'center',
      //   prop: 'tag',
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '结构标准件',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: 'EE/软件标准件',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '电子/电气',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '物料交期',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '组装',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '调试',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: 'FAT',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: 'OQC',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: 'ETD',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '计划',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '当前计划',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '实际',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: 'Station(For多联机设备）',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '客户item No',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '客户产品',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '设备属性',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: 'SUB CATEGORY',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '产品系列',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '阶段',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '项目类型',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: 'BD',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },

      // {
      //   prop: 'tag',
      //   label: 'TPM',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '业务跟单',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: 'DRI',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      //   type: 'moreHead',
      //   children: [
      //     {
      //       prop: 'tag',
      //       label: '结构',
      //       type: 'rowText',
      //       width: 120,
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag',
      //       label: '电子/电气',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //     {
      //       prop: 'tag', // 假设新增的字段
      //       label: '软件',
      //       type: 'rowText',
      //       props: {
      //         disabled: true,
      //       },
      //     },
      //   ],
      // },
      // {
      //   prop: 'tag',
      //   label: '出货地点(site+location)',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
      // {
      //   prop: 'tag',
      //   label: '出货地点(site+location)',
      //   type: 'rowText',
      //   props: {
      //     disabled: true,
      //   },
      // },
    ],
  };
};

export default options;

// /** 外协 */
// const options = () => {
//   return {
//     columns: [
//       // {
//       //   type: 'selection',
//       //   width: '55px',
//       //   align: 'center',
//       //   selectable(row) {
//       //     return !row.isTransfer;
//       //   },
//       // },
//       // {
//       //   prop: '',
//       //   label: '序号',
//       //   width: '60px',
//       //   align: 'center',
//       //   type: 'index',
//       //   fixed :"fixed ",
//       //   render(scope) {
//       //     return scope.$index + 1;
//       //   },
//       // },
//       {
//         prop: 'mtoNo',
//         label: '订单类型',
//         type: 'rowText',
//         // width: 120,
//         fixed: true,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'materialCode',
//         label: 'Added Date',
//         type: 'rowText',
//         fixed: true,
//         search: true,
//         searchProps: {
//           is: 'el-input',
//         },
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'version',
//         label: '状态',
//         type: 'rowText',
//         fixed: true,
//         // width: 60,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'materialName',
//         label: '入库状态',
//         type: 'rowText',
//         fixed: true,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'specDesc',
//         label: 'BU',
//         type: 'rowText',
//         // width: 120,
//         fixed: true,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'confirmedOrderQty',
//         label: '项目名称',
//         type: 'rowText',
//         fixed: true,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'startDate',
//         label: 'EQ Name',
//         type: 'date',
//         // width: 140,
//         fixed: true,
//         required: true,
//         props: {
//           format: 'YYYY-MM-DD',
//           valueFormat: 'YYYY-MM-DD',
//           clearable: true,
//           style: {
//             width: '120px',
//           },
//         },
//       },
//       {
//         prop: 'completedDate',
//         label: '产品长代码',
//         type: 'date',
//         fixed: true,

//         // width: 140,

//         required: true,
//         props: {
//           format: 'YYYY-MM-DD',
//           valueFormat: 'YYYY-MM-DD',
//           clearable: true,
//           style: {
//             width: '120px',
//           },
//         },
//       },
//       {
//         prop: 'createUser',
//         label: '计划跟踪号',
//         type: 'rowText',
//         fixed: true,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'mcc',
//         label: '完成率',
//         type: 'dict',
//         fixed: true,
//         dictKey: 'DC_MCC_STATUS',
//         valueKey: 'dictKey',
//         labelKey: 'label',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'confirmationDate',
//         label: '数量',
//         fixed: true,
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       // {
//       //   prop: 'orderSplittingStatus',
//       //   label: '分单状态',
//       //   type: 'dict',
//       //   dictKey: 'DC_ORDER_SPLITE_STATUS',
//       //   labelKey: 'label',
//       //   valueKey: 'dictKey',
//       //   required: true,
//       //   width: 100,
//       // },

//       {
//         prop: 'orderSplittingStatus',
//         label: '是否组装',
//         type: 'dict',
//         dictKey: 'DC_ORDER_SPLITE_STATUS',
//         labelKey: 'label',
//         valueKey: 'dictKey',
//         required: true,
//         width: 100,
//         // props: {
//         //   disabled: true,
//         // },
//         // search: true,
//         // searchProps: {
//         //   is: 'el-input',
//         // },
//       },
//       {
//         prop: 'docStatus',
//         label: '客户 ETD',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'businessStatus',
//         label: 'Latest ETD',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'releaseType',
//         label: '入库数量',
//         type: 'rowText',
//         width: 140,
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'releaseBillType',
//         label: '累计出库数量',
//         type: 'rowText',
//         width: 140,
//         props: {
//           disabled: true,
//         },
//       },
//       // {
//       //   prop: 'typeName',
//       //   label: '投放单据类型',
//       //   type: 'dict',
//       //   dictKey: 'DC_MRP_RELEASE_DOC_TYPE',
//       //   valueKey: 'dictKey',
//       //   labelKey: 'label',
//       //   props: {
//       //     disabled: true,
//       //   },
//       // },
//       // {
//       //   prop: 'releaseType',
//       //   label: '单据类型',
//       //   type: 'dict',
//       //   dictKey: 'DC_MRP_RELEASE_DOC_TYPE',
//       //   valueKey: 'dictKey',
//       //   labelKey: 'label',
//       //   props: {
//       //     disabled: true,
//       //   },
//       // },
//       {
//         prop: 'description',
//         label: '报关Y/N',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'ecnDesc',
//         label: 'PM',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: 'Risk Level',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },

//       {
//         prop: 'options',
//         width: 80,
//         label: 'MIL Remark',
//         slot: '',
//         type: 'actions',
//         fixed: 'right',
//         children: [
//           {
//             type: 'button',
//             label: '图纸',
//             action: 'viewBatches',
//           },
//         ],
//       },
//       // {
//       //   prop: 'tag',
//       //   label: '结构图纸',
//       //   type: 'rowText',
//       //   props: {
//       //     disabled: true,
//       //   },
//       // },
//       {
//         label: '结构图纸',
//         align: 'center',
//         prop: 'tag',
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: '结构标准件',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: 'EE/软件标准件',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: '电子/电气',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: '物料交期',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: '组装',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: '调试',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: 'FAT',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: 'OQC',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: 'ETD',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '计划',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '当前计划',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '实际',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       {
//         prop: 'tag',
//         label: 'Station(For多联机设备）',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '客户item No',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '客户产品',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '设备属性',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: 'SUB CATEGORY',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '产品系列',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '阶段',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '项目类型',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: 'BD',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },

//       {
//         prop: 'tag',
//         label: 'TPM',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: '业务跟单',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//       },
//       {
//         prop: 'tag',
//         label: 'DRI',
//         type: 'rowText',
//         props: {
//           disabled: true,
//         },
//         type: 'moreHead',
//         children: [
//           {
//             prop: 'tag',
//             label: '结构',
//             type: 'rowText',
//             width: 120,
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag',
//             label: '电子/电气',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//           {
//             prop: 'tag', // 假设新增的字段
//             label: '软件',
//             type: 'rowText',
//             props: {
//               disabled: true,
//             },
//           },
//         ],
//       },
//       // {
//       //   prop: 'tag',
//       //   label: '出货地点(site+location)',
//       //   type: 'rowText',
//       //   props: {
//       //     disabled: true,
//       //   },
//       // },
//       // {
//       //   prop: 'tag',
//       //   label: '出货地点(site+location)',
//       //   type: 'rowText',
//       //   props: {
//       //     disabled: true,
//       //   },
//       // },
//     ],
//   };
// };

// export default options;
