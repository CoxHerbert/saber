// 导出表单配置函数，保持响应式特性
export default function getFormConfig(getShape, shapePlaceholders) {
  return [
    {
      type: 'select',
      label: '精密等级',
      prop: 'precisionGrade',
      remote: false,
      clearable: false,
      isEdit: false,
      dictType: 'DC_TECHNOLOGY_PART_ACCURACY',
      options: [],
      rules: [{ required: true, message: '请选择精密等级', trigger: 'change' }],
    },
    {
      type: 'select',
      label: '工件类型',
      remote: false,
      clearable: true,
      isEdit: false,
      prop: 'workpieceType',
      dictType: 'ERP_MATERIAL_ARTIFACT_TYPE',
      options: [],
    },
    {
      type: 'select',
      label: '原材料名称',
      prop: 'rawMaterialName',
      placeholder: '模糊搜索/下拉框',
      filterable: true,
      required: true,
      clearable: false,
      remote: true,
      loading: false,
      isEdit: false,
      rules: [{ required: true, message: '请选择原材料名称', trigger: 'blur' }],
      options: [],
    },
    {
      type: 'input',
      label: '料号',
      prop: 'rawMaterialCode',
      placeholder: '料号/不可编辑',
      disabled: true,
      isEdit: false,

      readonly: true,
    },
    {
      type: 'radio-group',
      label: '形状属性',
      prop: 'shape',
      disabled: true,
      isEdit: true,
      dictType: 'DC_RAW_MATERIAL_TYPE',
      options: [],
    },
    {
      type: 'radio-group',
      label: '是否抗静电',
      prop: 'antistatic',
      isEdit: false,
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
    {
      type: 'radio-group',
      label: '供应商包料',
      prop: 'supplierMaterial',
      isEdit: false,
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },

    {
      type: 'input',
      label: '下料尺寸',
      required: true,
      isEdit: false,
      prop: 'size',
      rules: [
        {
          validator: (rule, value, callback) => {
            const shape = getShape();
            console.log(shape);
            const parts = value ? value.split('*').filter(p => p).length : 0;
            let requiredParts = 0;
            switch (shape) {
              case 'DC_RAW_MATERIAL_TYPE_B':
                requiredParts = 3;
                break;
              case 'DC_RAW_MATERIAL_TYPE_length':
                requiredParts = 2;
                break;
              case 'DC_RAW_MATERIAL_TYPE_YG':
                requiredParts = 3;
                break;
              case 'DC_RAW_MATERIAL_TYPE_FT':
                requiredParts = 4;
                break;
              case 'DC_RAW_MATERIAL_TYPE_JT':
                requiredParts = 4;
                break;
              default:
                requiredParts = 0;
            }
            if (parts !== requiredParts) {
              callback(
                new Error(`请输入 ${requiredParts} 个参数（例：${shapePlaceholders[shape]}）`)
              );
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
    },
  ];
}
