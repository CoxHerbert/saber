/** 线材执行单 */
const options = () => {
  return {
    columns: [
      // {
      //   type: 'selection',
      //   width: '55px',
      //   align: 'center',
      // },
      {
        prop: '',
        label: '序号',
        width: '80px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'auditStatus',
        label: '审核状态',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'no',
        label: '执行单号',
        type: 'rowText',
      },
      {
        prop: 'mtoNo',
        label: '专案号',
        type: 'rowText',
      },
      {
        prop: 'projectName',
        label: '项目名称',
        type: 'rowText',
      },
      {
        prop: 'bomNo',
        label: 'bom编码',
        type: 'rowText',
      },
      {
        prop: 'materialName',
        label: '物料编码',
        type: 'rowText',
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
      },
      {
        prop: 'qty',
        label: '加工件数',
        type: 'rowText',
      },
      {
        prop: 'bomVersion',
        label: 'bom版本',
        type: 'rowText',
      },
      {
        prop: 'etd',
        label: '齐套日',
        type: 'rowText',
      },
      {
        prop: 'options',
        width: 140,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '详情',
            action: 'detail',
          },
          // {
          //   type: 'button',
          //   label: '补打',
          //   action: 'print',
          // },
        ],
      },
    ],
  };
};

export default options;
