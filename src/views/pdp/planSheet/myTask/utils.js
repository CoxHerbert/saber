import { getPlanTypeColor } from '@/utils/util';
/** 我的任务配置 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '55px',
        align: 'center',
        selectable(row) {
          return !['1866034129325645826', '1866034176666755073'].includes(row.planStatusId);
        },
      },
      {
        prop: '',
        label: '序号',
        width: '60px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'businessCategoryId',
        label: '任务类型',
        type: 'dict',
        search: true,
        searchIndex: 1,
        searchProps: {
          is: 'dict',
        },
        matchKey: 'id',
        dictKey: 'DC_PMS_TEMPITEM_TYPE',
        width: '120px',
        getStyle(scope) {
          const { businessCategoryId } = scope.row;
          return {
            backgroundColor: getPlanTypeColor(businessCategoryId),
          };
        },
        getClass(scope) {
          return 'plan-type';
        },
      },
      {
        prop: 'planName',
        label: '计划名',
        search: true,
        searchIndex: 4,
        searchProps: {
          is: 'input',
        },
        type: 'rowText',
        // width: '140px',
      },
      {
        prop: 'projectId',
        label: '项目',
        type: 'dc-view',
        objectName: 'pdpProject',
        // width: '140px',
      },
      {
        prop: 'planOrderCode',
        label: '计划单号',
        type: 'rowText',
        width: '220px',
      },
      {
        prop: 'handlePersonId',
        label: '处理人',
        type: 'dc-view',
        width: '140px',
        objectName: 'user',
      },
      {
        prop: 'startDate',
        label: '开始日期',
        type: 'rowText',
        width: '120px',
      },
      {
        prop: 'endDate',
        label: '结束日期',
        type: 'rowText',
        width: '120px',
      },
      // {
      //   prop: 'options',
      //   width: 120,
      //   label: '操作',
      //   fixed: 'right',
      //   slot: '',
      //   type: 'actions',
      //   children: [
      //     {
      //       type: 'button',
      //       label: '执行',
      //       action: 'rowFinish',
      //       showFunc(scope) {
      //         return !['1866034129325645826', '1866034176666755073'].includes(
      //           scope.row.planStatusId
      //         );
      //       },
      //     },
      //   ],
      // },
    ],
  };
};

export default options;
