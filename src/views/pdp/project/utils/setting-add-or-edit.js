export default {
  columns: [
    {
      label: '配置名称',
      prop: 'configName',
      type: 'el-input',
      required: true,
    },
    {
      label: '配置编码',
      prop: 'configCode',
      type: 'el-input',
      required: true,
    },
    {
      label: '绑定角色',
      prop: 'bindField',
      type: 'el-select',
      dictKey: 'DC_PMS_PROJECT_ROLE',
      required: true,
      labelKey: 'dictValue',
      valueKey: 'dictKey',
      props: {
        multiple: true,
        placeholder: '请选择角色',
      },
    },
    {
      label: '必填项',
      prop: 'requiredField',
      type: 'el-select',
      labelKey: 'dictValue',
      valueKey: 'dictKey',
      props: {
        multiple: true,
        placeholder: '请选择必填项',
      },
      showFunc(formData) {
        return formData.bindField?.length > 0;
      },
      dictKey: 'requiredField',
    },
  ],
};
