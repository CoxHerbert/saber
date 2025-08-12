/** 入库单配置 */
const options = {
  columns: [
    {
      width: '55px',
      type: 'selection',
    },
    {
      label: '需求维度',
      prop: 'rlistDimensionKey',
      search: true,
      type: 'dict',
      dictKey: 'DC_CRM_DIMENSION',
      withGroup: false,
      labelKey: 'dictKey',
      valueKey: 'dictValue',
    },
    {
      label: '维度内容',
      prop: 'dimensionContent',
      type: 'rowText',
      minWidth: '240px',
      search: true,
    },
    {
      label: '是否判断',
      prop: 'isJudge',
      type: 'rowText',
      transVal(val) {
        return val ? '是' : '否';
      },
    },
    {
      label: '是否是设备工艺',
      prop: 'isTechnology',
      type: 'rowText',
      transVal(val) {
        return val ? '是' : '否';
      },
    },
    {
      label: '参数',
      prop: 'parameter',
      type: 'rowText',
    },
    {
      label: '备注',
      prop: 'note',
      type: 'rowText',
    },
    {
      label: '操作',
      prop: 'actions',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
        },
        {
          type: 'button',
          label: '查看',
          action: 'detail',
        },
      ],
    },
  ],
};

export default options;
