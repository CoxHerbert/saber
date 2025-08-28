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
        prop: 'billNo',
        label: '单据编号',
        type: 'rowText',
        search: true,
        width: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入单据编号',
        },
      },
      {
        prop: 'mtoNo',
        label: '计划跟踪号',
        type: 'rowText',
        search: true,
        width: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入计划跟踪号',
        },
      },
      {
        prop: 'billType',
        label: '单据类型',
        type: 'rowText',
        minWidth: 140,
      },
      {
        prop: 'assignUserId',
        label: '指派人',
        type: 'dc-view',
        width: 120,
        objectName: 'user',
      },
      {
        prop: 'materialNumber',
        label: '物料编号',
        type: 'rowText',
        search: true,
        width: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入物料编号',
        },
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        minWidth: 140,
      },
      {
        prop: 'quality',
        label: '材质',
        type: 'rowText',
        minWidth: 140,
      },
      {
        prop: 'number',
        label: '计划数量',
        type: 'rowText',
        width: 80,
      },
      {
        prop: 'billDate',
        label: '单据日期',
        type: 'rowText',
        width: 120,
      },
      {
        prop: 'billStatus',
        label: '单据状态',
        type: 'rowText',
        width: 120,
      },
      {
        prop: 'businessStatus',
        label: '业务状态',
        type: 'rowText',
        width: 80,
      },
      {
        prop: 'isScheduleWork',
        label: '是否排程',
        type: 'rowText',
        width: 80,
        transVal(scope) {
          if ([undefined, null].includes(scope.row.isScheduleWork)) return '-';
          return scope.row.isScheduleWork ? '是' : '否';
        },
      },
      {
        prop: 'specification',
        label: '规格',
        type: 'rowText',
        minWidth: 140,
      },
      {
        prop: 'note',
        label: '备注',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'orgId',
        label: '组织',
        type: 'dc-view',
        search: true,
        objectName: 'org',
        width: 240,
        searchProps: {
          is: 'wf-select-dialog',
          placeholder: '请选择组织',
        },
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 180,
        children: [
          {
            type: 'button',
            label: '去排程',
            action: 'schedule',
            showFunc(scope) {
              return (
                !scope.row?.isScheduleWork && !['完工', '结案'].includes(scope.row.businessStatus)
              );
            },
          },
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
            showFunc(scope) {
              return (
                scope.row?.isScheduleWork && !['完工', '结案'].includes(scope.row.businessStatus)
              );
            },
          },
          {
            type: 'button',
            label: '工艺卡',
            action: 'pdfView',
          },
          {
            type: 'button',
            label: '图纸',
            action: 'row-drawe',
          },
        ],
      },
    ],
  };
};

export default options;
