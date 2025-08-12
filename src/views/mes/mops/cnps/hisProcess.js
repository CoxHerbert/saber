/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        prop: 'technologyOrder',
        type: 'input',
        label: '工艺顺序',
        width: 100,
        props: {
          disabled: true,
          type: 'number',
          placeholder: '顺序',
        },
      },
      {
        prop: 'technologyName',
        type: 'input',
        label: '工序名称',
        required: true,
        props: {
          disabled: true,
          placeholder: '工序名称',
        },
      },
      {
        label: '描述',
        prop: 'unit',
        type: 'input',
        props: {
          placeholder: '描述',
        },
      },
      {
        label: '是否委外',
        prop: 'isOutSource',
        type: 'switch',
        width: 100,
        required: true,
        props: {
          activeValue: true,
          inactiveValue: false,
        },
        transVal(scope) {
          if ([undefined, null].includes(scope.row.isOutSource)) {
            return '-';
          }
          return scope.row.isOutSource ? '是' : '否';
        },
      },
      {
        prop: 'prepareWorkingHour',
        type: 'input',
        label: '准备工时(分)',
        required: true,
        props: {
          placeholder: '准备工时(分)',
        },
      },
      {
        prop: 'singleWorkingHour',
        type: 'input',
        label: '单件标工(分)',
        required: true,
        props: {
          placeholder: '单件标工(分)',
        },
      },
      {
        prop: 'allWorkingHour',
        type: 'input',
        label: '总工时(分)',
        required: true,
        props: {
          disabled: true,
          placeholder: '总工时(分)',
        },
      },
    ],
  };
};

export default options;
