/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        prop: 'processOrder',
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
        prop: 'outsourceQuotationMaterialCode',
        type: 'input',
        props: {
          placeholder: '描述',
        },
      },
      {
        label: '单价',
        prop: 'technologyPriceSingle',
        type: 'input',
        width: 100,

        props: {},
      },
      {
        prop: 'technologyProcessingHours',
        type: 'input',
        label: '工时(分)',
        required: true,
        props: {
          placeholder: '工时(分)',
        },
      },
      {
        prop: 'technologyPrice',
        type: 'input',
        label: '总价',
        required: true,
        props: {
          placeholder: '总价',
        },
      },
    ],
  };
};

export default options;
