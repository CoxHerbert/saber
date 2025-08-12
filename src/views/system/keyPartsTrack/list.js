/** 线材执行单 */
const options = () => {
  return {
    columns: [
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'snCode',
        label: 'sn码',
        type: 'rowText',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入专案号',
        },
      },
      {
        prop: 'checkItemKey',
        label: '关键项',
        type: 'dict',
        dictKey: 'DC_SIP_CHECK_ITEM',
        labelKey: 'dictValue',
        valueKey: 'dictValue',
        search: true,
        searchProps: {
          is: 'dict',
          placeholder: '请输入专案号',
        },
      },
      {
        prop: 'produceReportId',
        label: '生产汇报人',
        type: 'dc-view',
        objectName: 'user',
      },
      {
        prop: 'produceReportTime',
        label: '生产汇报时间',
        type: 'rowText',
      },
      {
        prop: 'checkReportId',
        label: '检验汇报人',
        type: 'dc-view',
        objectName: 'user',
      },
      {
        prop: 'checkReportTime',
        label: '检验汇报时间',
        type: 'rowText',
      },
    ],
  };
};

export default options;
