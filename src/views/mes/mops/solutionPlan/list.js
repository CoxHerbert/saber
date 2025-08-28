/** 线材执行单 */
const options = () => {
  return {
    columns: [
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
        prop: 'workStatus',
        label: '报工状态',
        type: 'dict',
        dictKey: 'DC_MOPS_PROCESS_STATUS',
        width: 90,
      },
      {
        prop: 'billStatus',
        label: '单据状态',
        type: 'rowText',
        width: 90,
      },
      {
        prop: 'businessStatus',
        label: '业务状态',
        type: 'rowText',
        width: 90,
      },
      {
        prop: 'isScheduleWork',
        label: '是否排程',
        type: 'rowText',
        width: 90,
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
        prop: 'quality',
        label: '材质',
        type: 'rowText',
        minWidth: 140,
      },
      {
        prop: 'number',
        label: '计划数量',
        type: 'rowText',
        width: 90,
      },
      {
        prop: 'planEndTime',
        label: '计划完成时间',
        type: 'rowText',
        width: 120,
      },
      {
        prop: 'planStartTime',
        label: '计划开始时间',
        type: 'rowText',
        width: 120,
      },
      {
        prop: 'note',
        label: '备注',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'isPrint',
        label: '是否打印',
        type: 'rowText',
        transVal(scope) {
          if ([undefined, null, ''].includes(scope.row?.isPrint)) {
            return '-';
          }
          return scope.row?.isPrint ? '已打印' : '未打印';
        },
        width: 120,
      },
    ],
  };
};

export default options;
