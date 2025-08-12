/** ETD完成 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '55px',
        align: 'center',
      },
      {
        prop: 'billNumber',
        type: 'rowText',
        label: '单据编号',
      },
      {
        prop: 'mtono',
        type: 'rowText',
        label: '专案号',
        width: 120,
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入专案号',
        },
      },
      {
        label: '物料编码',
        prop: 'materialCode',
        type: 'rowText',
        props: {
          placeholder: '描述',
        },
      },
      {
        label: '物料名称',
        prop: 'materialName',
        type: 'rowText',
      },
      {
        prop: 'createTime',
        type: 'rowText',
        label: '创建时间',
      },
      {
        prop: 'options',
        width: 100,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '完成',
            action: 'finish',
          },
        ],
      },
    ],
  };
};

export default options;
