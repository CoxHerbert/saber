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
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'dimensionName',
        label: '评审名称',
        type: 'rowText',
        width: 100,
        props: {
          required: true,
        },
      },
      {
        prop: 'dimensionDesc',
        label: '评审说明',
        type: 'rowText',
        minWidth: 200,
        props: {
          required: true,
        },
      },
      {
        prop: 'reviewTeam',
        label: '评审说明',
        type: 'dict',
        dictKey: 'DC_REVIEW_TEAM',
        width: 120,
        props: {
          required: true,
        },
      },

      {
        prop: 'options',
        width: 120,
        label: '操作',
        slot: '',
        type: 'actions',
        fixed: 'right',
        children: [
          {
            type: 'button',
            label: '配置',
            action: 'row-config',
          },
          {
            type: 'button',
            label: '编辑',
            action: 'row-edit',
          },
        ],
      },
    ],
  };
};

export default options;
