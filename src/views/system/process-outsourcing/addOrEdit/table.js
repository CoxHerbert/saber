/** 入库单配置 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
      },
      {
        prop: '',
        label: '序号',
        width: 60,
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'materialNumber',
        label: '物料编码',
        type: 'rowText',
        search: true,
        searchProps: {
          is: 'input',
        },
        minWidth: '130px',
      },
      {
        prop: 'mtoNo',
        label: '专案号',
        type: 'rowText',
        minWidth: '120px',
        searchProps: {
          is: 'input',
        },
        search: true,
      },
      {
        prop: 'materialName',
        label: '品名',
        type: 'rowText',
        minWidth: '120px',
        searchProps: {
          is: 'input',
        },
        search: true,
      },
    ],
  };
};

export default options;
