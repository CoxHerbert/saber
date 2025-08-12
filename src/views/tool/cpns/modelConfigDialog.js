const options = () => {
  return {
    columns: [
      {
        prop: 'jdbcName',
        label: '物理列名',
        type: 'input',
        align: 'center',
        width: 140,
      },
      {
        prop: 'jdbcType',
        label: '物理类型',
        type: 'input',
        align: 'center',
        width: 140,
      },
      {
        prop: 'propertyName',
        label: '实体列名',
        type: 'input',
        align: 'center',
        width: 140,
      },
      {
        prop: 'propertyEntity',
        label: '实体类型',
        type: 'dict',
        dictKey: 'entityDic',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        align: 'center',
        width: 140,
      },
      {
        prop: 'jdbcComment',
        label: '字段说明',
        type: 'input',
        align: 'center',
        width: 140,
      },
      {
        prop: 'isList',
        label: '列表显示',
        type: 'switch',
        align: 'center',
        width: 100,
        props: {
          activeValue: 1,
          inactiveValue: 0,
        },
        transVal(scope) {
          return scope.row.isList ? '是' : '否';
        },
      },
      {
        prop: 'isForm',
        label: '表单显示',
        type: 'switch',
        align: 'center',
        width: 100,
        props: {
          activeValue: 1,
          inactiveValue: 0,
        },
        transVal(scope) {
          return scope.row.isForm ? '是' : '否';
        },
      },
      {
        prop: 'isRow',
        label: '独占一行',
        type: 'switch',
        align: 'center',
        width: 100,
        props: {
          activeValue: 1,
          inactiveValue: 0,
        },
        transVal(scope) {
          return scope.row.isRow ? '是' : '否';
        },
      },
      {
        prop: 'isRequired',
        label: '必填',
        type: 'switch',
        align: 'center',
        width: 100,
        props: {
          activeValue: 1,
          inactiveValue: 0,
        },
        transVal(scope) {
          return scope.row.isRequired ? '是' : '否';
        },
      },
      {
        prop: 'componentType',
        label: '组件类型',
        type: 'dict',
        dictKey: 'componentDic',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        align: 'center',
        width: 140,
      },
      {
        prop: 'objectName',
        label: 'class名',
        type: 'input',
        align: 'center',
        width: 140,
      },
      {
        prop: 'dictCode',
        label: '字典编码',
        type: 'input',
        align: 'center',
        width: 160,
      },
      {
        prop: 'isQuery',
        label: '查询配置',
        type: 'switch',
        align: 'center',
        width: 100,
        props: {
          activeValue: 1,
          inactiveValue: 0,
        },
        transVal(scope) {
          return scope.row.isQuery ? '是' : '否';
        },
      },
      {
        prop: 'queryType',
        label: '查询类型',
        type: 'dict',
        dictKey: 'queryDic',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        align: 'center',
        width: 140,
      },
    ],
  };
};

export default options;
