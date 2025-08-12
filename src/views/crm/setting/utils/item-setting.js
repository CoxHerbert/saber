/** 入库单配置 */
const options = {
  columns: [
    {
      width: '55px',
      type: 'selection',
    },
    {
      label: '工艺名称',
      prop: 'technologyNameKey',
      dictKey: 'DC_CRM_TECHNOLOGY',
      type: 'dict',
      search: true,
      withGroup: false,
      labelKey: 'dictValue',
      valueKey: 'dictKey',
    },
    {
      label: '工艺项',
      prop: 'technologyContent',
      type: 'rowText',
      search: true,
    },
    {
      label: '工艺参数',
      prop: 'technologyParameter',
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
        {
          type: 'button',
          label: '删除',
          action: 'delete',
        },
      ],
    },
  ],
};

export default options;
