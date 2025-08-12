const options = pageMode => {
  return {
    columns: [
      {
        name: '基本信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: true,
        prop: 'basic',
        items: [
          {
            prop: 'no',
            label: '变更单号',
            type: 'input',
          },
          {
            prop: 'bomNo',
            label: 'BOM编号',
            type: 'input',
          },
          {
            prop: 'bomVersion',
            label: 'bom版本',
            type: 'input',
          },
          {
            prop: 'changeStatus',
            label: '变更状态',
            type: 'input',
          },
        ],
      },
      {
        name: '明细信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'wireChangeItemList',
        items: [
          // {
          //   type: 'selection',
          //   fixed: 'left',
          //   width: '55',
          //   selectable(row) {
          //     return !row?.erpStatus;
          //   },
          // },
          {
            type: 'index',
            prod: 'dataIndex',
            fixed: 'left',
            width: '55',
          },
          {
            prop: 'materialNumber',
            type: 'common',
            label: '物料编码',
            minWidth: '140px',
            is: 'el-input',
            props: {
              disabled: true,
              placeholder: '物料编码',
            },
          },
          {
            prop: 'specification',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '规格型号',
            props: {
              disabled: true,
              placeholder: '规格型号',
            },
          },
          {
            prop: 'qty',
            width: '60px',
            type: 'common',
            is: 'el-input',
            label: '数量',
            props: {
              disabled: true,
              placeholder: '数量',
            },
          },
          {
            label: '单位',
            prop: 'unit',
            width: '60px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '系统生成',
            },
          },
          {
            label: '物料属性',
            prop: 'materialProperties',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '物料属性',
            },
          },
          {
            label: '图纸地址',
            prop: 'drawAddress',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '图纸地址',
            },
          },
          {
            label: '图纸类型',
            prop: 'drawType',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '图纸类型',
            },
          },
          {
            label: '变更单号',
            prop: 'changeNo',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '变更单号',
            },
          },
        ],
      },
    ],
  };
};

export default options;
