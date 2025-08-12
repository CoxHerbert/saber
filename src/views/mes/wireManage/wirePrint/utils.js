const options = () => {
  return {
    columns: [
      {
        width: '55px',
        type: 'selection',
      },
      {
        type: 'index',
        prod: 'dataIndex',
        fixed: 'left',
        width: '55',
      },
      {
        label: '执行单编号',
        prop: 'no',
        type: 'rowText',
      },
      {
        label: '专案号',
        prop: 'mtoNo',
        type: 'rowText',
      },
      {
        label: '成品料号',
        prop: 'finishMaterialNumber',
        type: 'rowText',
      },
      {
        label: '打印次数',
        prop: 'printQty',
        width: '100',
        type: 'rowText',
      },
      {
        label: '成品名称',
        prop: 'finishMaterialName',
        type: 'rowText',
      },
      {
        label: '项目名称',
        prop: 'projectName',
        type: 'rowText',
      },
      {
        label: '执行料号',
        prop: 'exeMaterialNumber',
        type: 'rowText',
      },
      {
        label: '执行物料名称',
        prop: 'exeMaterialName',
        type: 'rowText',
      },
      {
        label: '执行单加工件数',
        prop: 'exeQty',
        width: '100',
        type: 'rowText',
      },
      {
        label: 'bom版本',
        prop: 'bomVersion',
        width: '100',
        type: 'rowText',
      },
      {
        label: 'bom编号',
        prop: 'bomNo',
        type: 'rowText',
      },
      {
        label: '齐套日',
        prop: 'etd',
        width: '100',
        type: 'rowText',
      },
      {
        label: '线材料号',
        prop: 'itemMaterialNumber',
        type: 'rowText',
      },
      {
        label: '线材名称',
        prop: 'itemMaterialName',
        type: 'rowText',
      },
      {
        label: '规格',
        prop: 'specification',
        type: 'rowText',
      },
      {
        label: '线材数量',
        prop: 'itemQty',
        width: '90',
        type: 'rowText',
      },
      {
        label: '单位',
        prop: 'unit',
        width: '90',
        type: 'rowText',
      },
      {
        label: '线材属性',
        prop: 'materialProperties',
        type: 'rowText',
      },
      {
        label: '图档地址',
        prop: 'drawAddress',
        type: 'rowText',
      },
      {
        label: '图档类型',
        prop: 'drawType',
        width: '100',
        type: 'rowText',
      },
      {
        label: '变更单号',
        prop: 'changeNo',
        width: '100',
        type: 'rowText',
      },
      {
        label: '齐套状态',
        prop: 'fullStatus',
        width: '90',
        type: 'rowText',
      },
      {
        label: '齐套数量',
        prop: 'fullQty',
        width: '90',
        type: 'rowText',
      },
      {
        label: '制图数量',
        prop: 'drawQty',
        width: '90',
        type: 'rowText',
      },
      {
        prop: 'options',
        width: 120,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '补打',
            action: 'viewPrint',
            showFunc(scope) {
              return !scope.row?.isEdit;
            },
          },
        ],
      },
    ],
  };
};

export default options;
