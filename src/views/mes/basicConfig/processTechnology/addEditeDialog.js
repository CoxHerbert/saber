/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        prop: 'technologyName',
        label: '工艺名称',
        type: 'input',
        required: true,
        props: {
          clearable: true,
          placeholder: '请输入工艺名称',
        },
      },
      {
        prop: 'technologyCode',
        label: '工艺编码',
        type: 'input',
        required: true,
        props: {
          clearable: true,
          placeholder: '请输入工艺编码',
        },
      },
      {
        prop: 'technologyOrder',
        label: '工艺顺序',
        type: 'input',
        required: true,
        props: {
          type: 'number',
          clearable: true,
          placeholder: '请输入工艺顺序',
        },
      },
      // {
      //   prop: 'standardWorkingHour',
      //   label: '单件标工（h）',
      //   type: 'input',
      //   required: true,
      //   props: {
      //     type: 'number',
      //     clearable: true,
      //     placeholder: '请输入单件标工（h）',
      //   },
      // },
      {
        label: '工序分组',
        prop: 'processGroupKey',
        dictKey: 'DC_PROCESS_THCH_GROUP',
        type: 'dict',
        withGroup: false,
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        required: true,
      },
      {
        prop: 'isOutSource',
        label: '是否委外',
        type: 'switch',
        align: 'center',
        required: true,
        props: {
          activeValue: true,
          inactiveValue: false,
        },
        transVal(scope) {
          if ([false, true].includes(scope.row.isOutSource)) {
            return scope.row.isOutSourc ? '是' : '否';
          }
          return '-';
        },
      },
    ],
  };
};

export default options;
