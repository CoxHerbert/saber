import { convertTime } from '@/utils/util';
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
        prop: 'billNo',
        label: '单据编码',
        type: 'rowText',
        search: true,
        width: 140,
        searchProps: {
          is: 'input',
          placeholder: '请输入单据编码',
        },
      },
      {
        prop: 'mtoNo',
        label: '计划跟踪号',
        type: 'rowText',
        search: true,
        width: 140,
        searchProps: {
          is: 'input',
          placeholder: '请输入计划跟踪号',
        },
      },
      {
        prop: 'materialName',
        label: '物料名称',
        type: 'rowText',
        minWidth: 160,
      },
      {
        prop: 'createUser',
        label: '汇报人',
        type: 'dc-view',
        minWidth: 160,
        objectName: 'user',
      },
      {
        prop: 'createTime',
        label: '汇报时间',
        type: 'rowText',
        minWidth: 160,
      },
      {
        prop: 'reportTotal',
        label: '汇总汇报工时(分)',
        type: 'rowText',
        width: 140,
        transVal(scope) {
          return convertTime({
            value: scope.row?.reportTotal,
            from: 's',
            to: 'm',
          });
        },
      },
      {
        prop: 'reportQtyTotal',
        label: '汇总汇报数量',
        type: 'rowText',
        width: 140,
      },
      {
        prop: 'reportWorkingHours',
        label: '汇报工时(分)',
        type: 'rowText',
        width: 120,
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
        label: '汇报数量',
        type: 'rowText',
        width: 120,
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 120,
        children: [
          {
            type: 'button',
            label: '查看',
            action: 'look',
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
          },
        ],
      },
    ],
  };
};

export default options;
