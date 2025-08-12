const options = () => {
  return {
    columns: [
      // { type: 'selection', width: '40px', align: 'center', fixed: 'left' },
      { prop: '', label: '序号', width: '60px', align: 'center', type: 'index' },
      {
        label: '考核模板',
        prop: 'templateName',
        search: true,
        type: 'input',
        // width: 100,
        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      {
        label: '周期',
        prop: 'assessmentPeriod',
        search: true,
        type: 'input',
        // width: 100,
        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      {
        label: '考核人',
        prop: 'assessor',
        search: false,
        type: 'input',
        // width: 100,
        props: {
          disabled: true,
        },
      },
      {
        label: '部门',
        prop: 'department',
        search: false,
        type: 'input',
        // width: 60,
        props: {
          disabled: true,
        },
      },
      {
        label: '被考核人列表',
        prop: 'employeeName',
        search: false,
        type: 'input',
        // width: 100,
        props: {
          disabled: true,
        },
      },

      {
        label: '状态',
        prop: 'recordStatus',
        // search: true,
        type: 'input',
        // dictKey: 'DC_WX_VALENCE_STATUS',
        // required: true,
        // width: 100,
        // searchProps: { is: 'dict' },
        props: {
          disabled: true,
        },
      },
      {
        label: '异议说明',
        prop: 'comments',
        // search: true,
        type: 'input',
        // dictKey: 'DC_WX_VALENCE_STATUS',
        // required: true,
        // width: 100,
        // searchProps: { is: 'dict' },
        props: {
          disabled: true,
        },
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
            action: 'viewBatches',
            showFunc(scope) {
              return !scope.row?.isEdit;
            },
          },
          {
            type: 'button',
            label: '历史价格',
            action: 'his-price',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_YHJ';
            },
          },
        ],
      },
    ],
  };
};
export default options;
