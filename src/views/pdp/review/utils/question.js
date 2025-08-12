import store from '@/store/index';

/** 入库单配置 */
const options = {
  columns: [
    {
      prop: '',
      label: '序号',
      width: '55px',
      type: 'index',
      align: 'center',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      label: '问题名称',
      prop: 'reviewProblem',
      type: 'rowText',
      align: 'center',
      minWidth: '200px',
      search: true,
    },
    {
      label: '状态',
      prop: 'reviewProblemStatus',
      type: 'dict',
      dictKey: 'DC_REVIEW_PROBLEM_STATUS',
    },
    {
      label: '提议人',
      prop: 'reviewProposer',
      type: 'dc-view',
      searchType: 'user',
      search: true,
      objectName: 'user',
    },
    {
      label: '受评责任人',
      prop: 'reviewProsecution',
      type: 'dc-view',
      searchType: 'user',
      search: true,
      objectName: 'user',
    },
    {
      label: '创建时间',
      prop: 'createTime',
      type: 'rowText',
    },
    {
      label: '预计完成时间',
      prop: 'actualFinish',
      type: 'rowText',
    },
    {
      label: '操作',
      prop: 'options',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '查看',
          action: 'view',
        },
        {
          type: 'button',
          label: '处理',
          showFunc(scoped) {
            return scoped.row.reviewProblemStatus === 'DC_REVIEW_PROBLEM_STATUS_UR';
          },
          action: 'edit',
        },
        {
          type: 'button',
          label: '审核',
          showFunc(scoped) {
            return scoped.row.reviewProblemStatus === 'DC_REVIEW_PROBLEM_STATUS_IN_REVIEW';
          },
          action: 'audit',
        },
      ],
    },
    // {
    //   label: '异动时间',
    //   search: true,
    //   hideInList: true,
    //   prop: 'time',
    //   type: 'timeRange',
    // },
    // {
    //   label: '仓库编码',
    //   search: true,
    //   prop: 'warehouseId',
    //   objectName: 'warehouse',
    //   showKey: 'warehouseCode',
    //   type: 'dc-view',
    // },
    // {
    //   label: '库位编码',
    //   search: true,
    //   prop: 'locationId',
    //   width: 120,
    //   objectName: 'warehouseLocation',
    //   showKey: 'locationName',
    //   searchProps: {
    //     params(searchData) {
    //       return {
    //         warehouseId: searchData.warehouseId
    //           ? searchData.warehouseId?.id
    //             ? searchData.warehouseId?.id
    //             : searchData.warehouseId
    //           : undefined,
    //       };
    //     },
    //   },
    //   type: 'dc-view',
    // },
    // {
    //   prop: 'imrSourceDetailMaterialName',
    //   label: '物料名称',
    //   search: true,
    //   type: 'rowText',
    // },
    // {
    //   prop: 'imrSourceDetailMaterialCode',
    //   label: '物料编码',
    //   search: true,
    //   width: 160,
    //   type: 'rowText',
    // },
    // {
    //   prop: 'imrSourceDetailMaterialSpec',
    //   label: '规格型号',
    //   search: true,
    //   type: 'rowText',
    // },
    // {
    //   prop: 'imrSourceDetailQty',
    //   label: '数量',
    //   type: 'rowTextWithColor',
    //   colorProp: 'color',
    // },
    // {
    //   prop: 'imrSourceDetailMaterialVersion',
    //   label: '版本',
    //   width: 80,
    //   type: 'rowText',
    // },
    // {
    //   prop: 'createTime',
    //   label: '时间',
    //   width: 180,
    //   type: 'rowText',
    // },
    // {
    //   prop: 'imrType',
    //   label: '异动类型',
    //   type: 'rowText',
    // },
    // {
    //   label: '操作人',
    //   search: true,
    //   prop: 'createUser',
    //   objectName: 'user',
    //   showKey: 'name',
    //   searchType: 'user',
    //   type: 'dc-view',
    // },
    // {
    //   prop: 'imrSourceCode',
    //   label: '源单编码',
    //   search: true,
    //   type: 'rowText',
    // },

    // {
    //   prop: 'imrSourceDetailMtono',
    //   label: '计划跟踪号',
    //   search: true,
    //   type: 'rowText',
    // },
  ],
};

export default options;
