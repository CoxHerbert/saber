/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        prop: 'category',
        label: '类别',
        type: 'dict',
        dictKey: 'DC_INSPECTION_CLASS',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        required: true,
      },

      {
        prop: 'checkType',
        label: '类型',
        type: 'dict',
        dictKey: 'DC_SIP_CHECK_TYPE',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        required: true,
      },
      {
        prop: 'materialIdCollection',
        label: '专案',
        type: 'wf-select-dialog',
        display: true,
        required: true,
        props: {
          objectName: 'CompleteMtoNo',
          masterKey: 'billNo',
          showKey: 'billNo',
          placeholder: '请选择专案',
          multiple: true,
        },
      },
      {
        prop: 'materialIdCollection',
        label: '物料',
        type: 'wf-select-dialog',
        display: true,
        required: true,
        props: {
          objectName: 'SnCheckMaterial',
          placeholder: '请选择物料',
          multiple: true,
          masterKey: 'fnumber',
          showKey: 'fnumber',
          query: {
            fuseorgid: 100006,
          },
        },
      },
      {
        prop: 'materialNumberCollection',
        label: '标识',
        type: 'dict',
        dictKey: 'DC_SIP_CHECK_ITEM',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        display: true,
        required: true,
        props: {
          placeholder: '请选择标识',
        },
      },
      {
        prop: 'isConfig',
        label: '启动状态',
        type: 'dict',
        align: 'center',
        dictKey: 'DC_COMMON_TRUEORFALSE',
        required: true,
      },
    ],
  };
};

export default options;
