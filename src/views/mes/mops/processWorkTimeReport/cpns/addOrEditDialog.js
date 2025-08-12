import { convertTime } from '@/utils/util';

const options = mode => {
  console.log(mode);
  if (mode === 'add') {
    return {
      columns: [
        {
          prop: 'technologyName',
          label: '工序',
          type: 'rowText',
          align: 'center',
          width: 80,
        },
        {
          prop: 'billNo',
          label: 'MO',
          type: 'rowText',
          align: 'center',
          width: 120,
        },
        {
          prop: 'materialName',
          label: '物料',
          type: 'rowText',
          align: 'center',
          width: 120,
        },
        {
          prop: 'allWorkingHour',
          label: '总工时（分）',
          type: 'rowText',
          align: 'center',
          width: 120,
          transVal(scope) {
            return convertTime({
              value: scope.row?.allWorkingHour,
              from: 's',
              to: 'm',
            });
          },
        },
        {
          prop: 'reportWorkingHour',
          label: '已汇报工时（分）',
          type: 'rowText',
          align: 'center',
          width: 140,
          transVal(scope) {
            return convertTime({
              value: scope.row?.reportWorkingHour,
              from: 's',
              to: 'm',
            });
          },
        },
        {
          prop: 'number',
          label: '总数量',
          type: 'rowText',
          align: 'center',
          width: 80,
        },
        {
          prop: 'reportNumber',
          label: '已汇报数量',
          type: 'rowText',
          align: 'center',
          width: 100,
        },
        {
          prop: 'thisReportHour',
          label: '本次汇报工时（分）',
          type: 'input',
          align: 'center',
          minWidth: 160,
          fixed: 'left',
          props: {
            type: 'number',
            clearable: true,
            placeholder: '请输入本次汇报工时',
          },
        },
        {
          prop: 'thisReportQty',
          label: '本次汇报数量',
          type: 'input',
          align: 'center',
          minWidth: 160,
          fixed: 'left',
          props: {
            type: 'number',
            clearable: true,
            placeholder: '请输入本次汇报数量',
          },
        },
      ],
    };
  } else {
    return {
      columns: [
        {
          prop: 'produceRouteName',
          label: '工序',
          type: 'rowText',
          align: 'center',
          width: 80,
        },
        {
          prop: 'billNo',
          label: 'MO',
          type: 'rowText',
          align: 'center',
          width: 140,
        },
        {
          prop: 'materialName',
          label: '物料',
          type: 'rowText',
          align: 'center',
          width: 140,
        },
        {
          prop: 'processTime',
          label: '总工时（分）',
          type: 'rowText',
          align: 'center',
          width: 140,
          transVal(scope) {
            return convertTime({
              value: scope.row?.processTime,
              from: 's',
              to: 'm',
            });
          },
        },
        {
          prop: 'qty',
          label: '总数量',
          type: 'rowText',
          align: 'center',
          width: 140,
        },
        {
          prop: 'reportWorkingHours',
          label: '本次汇报工时（分）',
          type: 'rowText',
          align: 'center',
          transVal(scope) {
            return convertTime({
              value: scope.row?.reportWorkingHours,
              from: 's',
              to: 'm',
            });
          },
        },
        {
          prop: 'reportQty',
          label: '本次汇报数量',
          type: 'rowText',
          align: 'center',
        },
      ],
    };
  }
};

export default options;
