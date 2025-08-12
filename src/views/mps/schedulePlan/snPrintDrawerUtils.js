/** 入库单配置 */
const options = {
  columns: [
    {
      width: '55px',
      type: 'selection',
    },
    {
      prop: '',
      label: '序号',
      width: 55,
      type: 'index',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      prop: 'purpose',
      label: '计划单号',
      type: 'rowText',
      width: 150,
    },
    {
      prop: 'mtoNo',
      label: '专案号',
      type: 'rowText',
      width: 120,
    },
    {
      prop: 'materialNum',
      label: '物料编号',
      type: 'rowText',
      width: 120,
    },
    {
      prop: 'materialName',
      label: '物料名称',
      type: 'rowText',
      width: 120,
    },

    {
      prop: 'code',
      label: '长码',
      type: 'rowCustomText',
      'min-width': 100,
      render(scope) {
        return scope.row?.codeList ? scope.row?.codeList.join() : '-';
      },
    },

    {
      prop: 'options',
      width: 200,
      label: '操作',
      slot: '',
      type: 'actions',
      fixed: 'right',
      children: [
        {
          type: 'button',
          label: '小标签',
          action: 'rowSmallLabelPrint',
        },
        {
          type: 'button',
          label: '大标签',
          action: 'rowSargeLabelPrint',
        },
        {
          type: 'button',
          label: '制程卡',
          action: 'rowProcessCardPrint',
          showFunc(row) {
            return row?.master;
          },
        },
      ],
    },
  ],
};

export default options;
