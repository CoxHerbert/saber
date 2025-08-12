import { findRootInTreeArray } from '@/utils/util';

/** 检验配置页面 */
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
        prop: 'processDefinitionName',
        label: '流程名称',
        type: 'rowText',
        search: true,
        align: 'center',
        width: 140,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入流程名称',
        },
      },
      {
        prop: 'category',
        label: '流程分类',
        type: 'rowText',
        align: 'center',
        width: 120,
        transVal(scope, tree) {
          return findRootInTreeArray(tree, scope.row?.category).name;
        },
      },
      {
        prop: 'taskName',
        label: '当前节点',
        type: 'rowText',
        align: 'center',
        minWidth: 160,
      },
      {
        prop: 'startUsername',
        label: '发起人',
        type: 'rowText',
        align: 'center',
        width: 140,
        search: true,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入发起人',
        },
      },
      {
        prop: 'createTime',
        label: '申请时间',
        type: 'rowText',
        align: 'center',
        minWidth: 140,
      },
      {
        prop: 'createTime',
        label: '接收时间',
        type: 'rowText',
        align: 'center',
        minWidth: 140,
      },
      {
        prop: 'duringTime',
        label: '停留时间',
        type: 'rowText',
        align: 'center',
        minWidth: 160,
        transVal(scope) {
          return scope.row?.duringTime;
        },
        props: {
          style: {
            color: 'rgb(247, 132, 49)',
          },
        },
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
            label: '详情',
            action: 'detail',
            permission(scope) {
              return { id: 'TO_DO_PROCESS_DETAIL', row: scope.row };
            },
          },
          {
            type: 'button',
            label: '流程图',
            action: 'flow',
            permission(scope) {
              return {
                id: 'TO_DO_PROCESS_FLOW_CHART',
                row: scope.row,
              };
            },
          },
        ],
      },
    ],
  };
};

export default options;
