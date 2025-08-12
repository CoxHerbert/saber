/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        prop: 'bomOrder',
        type: 'input',
        label: 'BOM顺序',
        width: 100,
        props: {
          disabled: true,
          type: 'number',
          placeholder: 'BOM顺序',
        },
      },
      {
        prop: 'rawMaterialName',
        type: 'input',
        label: '原材料名称',
        props: {
          disabled: true,
          placeholder: '原材料名称',
        },
      },
      {
        label: '原材料编码',
        prop: 'rawMaterialNumber',
        type: 'input',
        props: {
          placeholder: '原材料编码',
        },
      },
      {
        label: '分子用量',
        prop: 'numeratorNumber',
        type: 'input',
        props: {
          activeValue: true,
          inactiveValue: false,
        },
      },
      {
        prop: 'denominatorNumber',
        type: 'input',
        label: '分母用量',
        props: {
          placeholder: '分母用量',
        },
      },
    ],
  };
};

export default options;
