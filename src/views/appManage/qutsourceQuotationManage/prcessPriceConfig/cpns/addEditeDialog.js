/** 检验配置页面 */
const options = type => {
  if (type === 'prcess') {
    return {
      columns: [
        {
          prop: 'technologyName',
          label: '工艺名称',
          type: 'input',
          required: true,
        },
        {
          prop: 'technologyCode',
          label: '工艺编码',
          type: 'input',
          required: true,
        },
        {
          prop: 'technologyOrder',
          label: '工艺顺序',
          type: 'number',
          required: true,
          props: {
            placeholder: '请输入工艺顺序',
            min: 0,
            clearable: true,
            style: {
              width: '100%',
            },
          },
        },
        {
          prop: 'surfaceTreatment',
          label: '是否表面处理',
          type: 'switch',
          required: true,
        },
        {
          prop: 'processGroupKey',
          label: '工序工艺分类',
          type: 'select',
          dictKey: 'DC_PROCESS_THCH_GROUP',
          required: true,
        },
      ],
    };
  } else if (type === 'item') {
    return {
      columns: [
        {
          prop: 'cz',
          label: '材质名称',
          type: 'select',
          dictKey: 'DC_TECHNOLOGY_PART_CZ',
          props: {
            placeholder: '请选择材质名称',
            clearable: true,
          },
        },
        {
          prop: 'partAccuracy',
          label: '零件精度',
          type: 'select',
          dictKey: 'DC_TECHNOLOGY_PART_ACCURACY',
          props: {
            placeholder: '请选择零件精度',
            clearable: true,
          },
        },
        {
          prop: 'pricingMethod',
          label: '计价方式',
          type: 'select',
          dictKey: 'DC_TECHNOLOGY_PRICING_METHOD',
          required: true,
          props: {
            placeholder: '请选择计价方式',
            clearable: true,
          },
        },
        {
          prop: 'price',
          label: '单价',
          type: 'number',
          required: true,
          props: {
            placeholder: '请输入单价',
            min: 0,
            clearable: true,
            style: {
              width: '100%',
            },
          },
        },
        {
          prop: 'pricingUnit',
          label: '单位',
          type: 'select',
          dictKey: 'DC_TECHNOLOGY_ITEM_PRICING_UNIT',
          required: true,
          props: {
            placeholder: '请选择单位',
            clearable: true,
          },
        },
        {
          prop: 'minPrice',
          label: '最低价',
          type: 'number',
          props: {
            placeholder: '请输入最低价',
            min: 0,
            clearable: true,
            style: {
              width: '100%',
            },
          },
        },
      ],
    };
  } else if (type === 'materialPrice') {
    return {
      columns: [
        {
          prop: 'specificationName',
          label: '材质名称',
          type: 'input',
          props: {
            disabled: true,
          },
        },
        {
          prop: 'standPrice',
          label: '标准价格',
          type: 'number',
          required: true,
          props: {
            min: 0,
            placeholder: '请输入标准价格',
            style: { width: '100%' },
          },
        },
        {
          prop: 'shape',
          label: '形状',
          type: 'dict',
          dictKey: 'DC_RAW_MATERIAL_TYPE',
          props: {
            disabled: true,
          },
        },
        {
          prop: 'materialProperties',
          label: '防静电',
          type: 'input',
          props: {
            disabled: true,
          },
        },
        {
          prop: 'rawMaterialCode',
          label: '原材料编码',
          type: 'input',
          props: {
            disabled: true,
          },
        },
        {
          prop: 'rawMaterialName',
          label: '原材料名称',
          type: 'input',
          props: {
            disabled: true,
          },
        },
        {
          prop: 'rawMaterialSpec',
          label: '原材料规格型号',
          type: 'input',
          props: {
            disabled: true,
          },
        },
      ],
    };
  }
};

export default options;
