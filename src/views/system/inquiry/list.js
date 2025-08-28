/** 线材BOM */
const options = () => {
  return {
    columns: [
      // {
      //   type: 'selection',
      //   width: '55px',
      //   align: 'center',
      // },
      {
        prop: '',
        label: '序号',
        width: '80px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'bomNo',
        label: '编码',
        type: 'rowText',
      },
      {
        prop: 'name',
        label: '名称',
        type: 'rowText',
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'bomVersion',
        label: 'bom版本',
        type: 'rowText',
      },
      {
        prop: 'auditStatus',
        label: '审核状态',
        type: 'rowText',
      },
    ],
  };
};

export default options;
