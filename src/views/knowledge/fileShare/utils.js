/** 入库单配置 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        fixed: 'left',
        width: '55',
      },
      {
        type: 'index',
        prod: 'dataIndex',
        fixed: 'left',
        width: '55',
      },
      {
        prop: 'attachIds',
        minWidth: '90px',
        type: 'file',
        label: '文件格式',
      },
      {
        prop: 'fileName',
        minWidth: '160px',
        type: 'rowText',
        label: '文件名称',
      },
      {
        prop: 'versionCode',
        minWidth: '120px',
        type: 'rowText',
        label: '文件版本',
      },
      {
        prop: 'fileTypeCode',
        label: '文件类型',
        minWidth: '160px',
        type: 'dict',
        dictKey: 'DC_PDP_PROJECT_FILE',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
      },
      {
        prop: 'projectNumber',
        minWidth: '120px',
        type: 'rowText',
        label: '专案号',
      },
      {
        prop: 'projectCode',
        minWidth: '120px',
        type: 'rowText',
        label: '项目编码',
      },
      {
        prop: 'materialCode',
        minWidth: '160px',
        type: 'rowText',
        label: '物料编码',
      },
      {
        prop: 'materialName',
        minWidth: '160px',
        type: 'rowText',
        label: '物料名称',
      },
    ],
  };
};

export default options;
