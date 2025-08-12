/** 线材执行单 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
      },
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'specificationName',
        label: '材质名称',
        type: 'input',
        search: true,
        minWidth: 140,
        searchProps: {
          is: 'input',
          placeholder: '请输入材质名称',
        },
      },
      {
        prop: 'standPrice',
        label: '标准价格',
        type: 'input',
        width: 120,
      },
      {
        prop: 'shape',
        label: '形状',
        type: 'dict',
        dictKey: 'DC_RAW_MATERIAL_TYPE',
        search: true,
        width: 120,
        searchProps: {
          is: 'dict',
          placeholder: '请选择形状',
        },
      },
      {
        prop: 'materialProperties',
        label: '防静电',
        type: 'input',
        search: true,
        minWidth: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入防静电属性',
        },
      },
      {
        prop: 'rawMaterialCode',
        label: '原材料编码',
        type: 'input',
        search: true,
        width: 140,
        searchProps: {
          is: 'input',
          placeholder: '请输入原材料编码',
        },
      },
      {
        prop: 'rawMaterialName',
        label: '原材料名称',
        type: 'input',
        search: true,
        minWidth: 140,
        searchProps: {
          is: 'input',
          placeholder: '请输入原材料名称',
        },
      },
      {
        prop: 'rawMaterialSpec',
        label: '原材料规格型号',
        type: 'input',
        search: true,
        minWidth: 160,
        searchProps: {
          is: 'input',
          placeholder: '请输入原材料规格型号',
        },
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 80,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'row-edit',
          },
        ],
      },
    ],
  };
};

export default options;
