export default {
  columns: [
    {
      label: '配置名称',
      prop: 'configName',
      type: 'rowText',
      search: true,
    },
    {
      label: '配置编码',
      prop: 'configCode',
      type: 'rowText',
    },
    {
      label: '绑定角色',
      prop: 'bindField',
      type: 'multipleDict',
      dictKey: 'DC_PMS_PROJECT_ROLE',
    },
    {
      label: '必填选项',
      prop: 'requiredField',
      type: 'multipleDict',
      dictKey: 'DC_PMS_PROJECT_ROLE',
    },
    {
      label: '操作',
      prop: 'actions',
      fixed: 'right',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
        },
      ],
    },
  ],
};
