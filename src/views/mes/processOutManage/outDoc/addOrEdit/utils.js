// 基础信息
const basicInfoOptions = pageMode => {
  return {
    columns: [
      {
        name: '基本信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: false,
        prop: 'basic',
        items: [
          {
            prop: 'materialNumber',
            label: '物料编码',
            type: 'wf-select-single',
            required: true,
            props: {
              masterKey: 'materialId',
              objectName: 'stockMaterialList',
              placeholder: '请选择物料',
            },
          },
          {
            prop: 'materialName',
            label: '物料名称',
            type: 'input',
            required: true,
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
            },
          },
          {
            prop: 'processNo',
            label: '工序单号',
            type: 'input',
            required: true,
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
            },
          },
          {
            prop: 'sourceOrderNumber',
            label: '源单信息',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
            },
          },
          {
            prop: 'orderDate',
            label: '下单时间',
            type: 'date',
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              clearable: true,
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'plannedQty',
            label: '计划数量',
            type: 'number',
            required: true,
            props: {
              disabled: true,
              placeholder: '请输入计划数量',
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'mtoNo',
            label: '所属专案',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
            },
          },
          {
            prop: 'deliveryDate',
            label: '交货时间',
            type: 'date',
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              clearable: true,
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'currentQty',
            label: '当前库存',
            type: 'number',
            props: {
              disabled: true,
              placeholder: '<选择物料后带出>',
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'remark',
            label: '入库工序',
            type: 'input',
            props: {
              disabled: true,
              type: 'textarea',
              placeholder: '<选择物料后带出>',
            },
          },
        ],
      },
    ],
  };
};

// 转发下单
const forwardOrderOptions = pageMode => {
  return [
    {
      name: '转发下单',
      classList: 'forward-order',
      renderType: 'table',
      showToggleExpand: false,
      prop: 'process',
    },
    {
      name: '转单记录',
      classList: 'transfer-order-record',
      renderType: 'customize',
      showToggleExpand: false,
      prop: 'transferOrderRecords',
    },
  ];
};

export default { basicInfoOptions, forwardOrderOptions };
