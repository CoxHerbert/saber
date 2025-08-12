/** 入库单配置 */
const options = {
  columns: [
    {
      prop: '',
      label: '序号',
      width: '55px',
      type: 'index',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      label: '费用客户名称',
      prop: 'constantName',
      type: 'rowText',
      search: true,
    },
    {
      label: '费用客户编码',
      prop: 'constantCode',
      type: 'rowText',
      search: true,
      // search: true,
      // type: 'dict',
      // search: true,
      // formType: 'el-select',
      // dictKey: 'DC_SCM_EXCHANGE_RATE',
    },
    // {
    //   label: '原币名称',
    //   prop: 'originalCurrency',
    //   type: 'rowText',
    //   search: true,
    // },
    // {
    //   label: '原币编码',
    //   prop: 'originalCurrencyCode',
    //   type: 'rowText',
    //   search: true,
    // },
    // {
    //   label: '汇率',
    //   prop: 'exchangeRate',
    //   type: 'rowText',
    //   formType: 'el-input-nubmer',
    //   props: {
    //     precision: 5,
    //     step: 0.00001,
    //     min: 0.00001,
    //   },
    // },
    // {
    //   label: '是否启用',
    //   prop: 'enabled',
    //   formType: 'switch',
    //   type: 'switch',
    // },
    {
      prop: 'options',
      width: 210,
      label: '操作',
      fixed: 'right',
      slot: '',
      type: 'actions',
      children: [
        {
          type: 'button',
          label: '编辑',
          action: 'edit',
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
