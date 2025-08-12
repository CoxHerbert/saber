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
        prop: 'billStatus',
        label: '单据状态',
        type: 'rowText',
        minWidth: 140,
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
        prop: 'number',
        label: '计划数量',
        type: 'rowText',
        minWidth: 80,
      },
      {
        prop: 'planEndTime',
        label: '计划完成时间',
        type: 'rowText',
        width: 160,
      },
      {
        prop: 'planStartTime',
        label: '计划开始时间',
        type: 'rowText',
        minWidth: 140,
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 240,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
          },
          {
            type: 'button',
            label: '工艺卡',
            action: 'pdfView',
          },
          {
            type: 'button',
            label: '取消计划',
            action: 'delete',
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
