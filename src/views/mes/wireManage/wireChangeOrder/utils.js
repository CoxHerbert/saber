/** 线材变更单 */
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
        prop: 'no',
        label: '变更单号',
        type: 'rowText',
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'bomNo',
        label: 'BOM编号',
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
        prop: 'changeStatus',
        label: '变更状态',
        type: 'rowText',
      },
    ],
  };
};

export default options;
