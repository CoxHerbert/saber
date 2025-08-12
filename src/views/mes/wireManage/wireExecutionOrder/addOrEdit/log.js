const options = pageMode => {
  return {
    columns: [
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
        prop: 'printUserId',
        label: '打印人员',
        type: 'dc-view',
        objectName: 'user',
      },
      {
        prop: 'createTime',
        label: '创建时间',
        type: 'rowText',
      },
    ],
  };
};

export default options;
